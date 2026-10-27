import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { installCampus } from './campus';
import {
  INITIAL_COURSES,
  DEMO_REGISTRATIONS,
  DEMO_STUDENT,
  DEMO_FINANCIAL_ACCOUNT,
} from '../src/data/seedData';

test('campus workflows validate and persist shared records', async (t) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'gu-campus-test-'));
  const db = structuredClone({
    courses: INITIAL_COURSES,
    registrations: DEMO_REGISTRATIONS,
    student: DEMO_STUDENT,
    financialAccount: DEMO_FINANCIAL_ACCOUNT,
    tasks: [],
    auditLogs: [],
    users: [],
    resources: [],
  });
  const app = express();
  app.use(express.json());
  installCampus(app, { directory, database: () => db, save: () => {} });
  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>((resolve) =>
    server.once('listening', () => resolve()),
  );
  const address = server.address() as any;
  const base = `http://127.0.0.1:${address.port}`;
  const action = async (action: string, data: any = {}, user = 'u-student') => {
    const response = await fetch(base + '/api/campus/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, data, user }),
    });
    return { status: response.status, ...(await response.json()) };
  };
  try {
    await t.test(
      'expiring QR tokens reject tampering and duplicate attendance',
      async () => {
        const session = await action(
          'session',
          { course: INITIAL_COURSES[0].code },
          'u-lecturer',
        );
        assert.equal(session.status, 200);
        assert.equal(
          (await action('attend', { token: session.result.token })).status,
          200,
        );
        assert.equal(
          (await action('attend', { token: session.result.token })).status,
          409,
        );
        assert.equal(
          (
            await action(
              'attend',
              { token: session.result.token + 'tampered' },
              'other',
            )
          ).status,
          400,
        );
      },
    );
    await t.test(
      'reservations prevent double booking and overlapping appointments',
      async () => {
        const start = new Date(Date.now() + 86400000).toISOString();
        const end = new Date(Date.now() + 88200000).toISOString();
        const slot = await action(
          'slot',
          { title: 'Office hours', start, end },
          'u-lecturer',
        );
        assert.equal(slot.status, 200);
        assert.equal(
          (await action('reserve', { id: slot.result.id })).status,
          200,
        );
        assert.equal(
          (await action('reserve', { id: slot.result.id }, 'another-student'))
            .status,
          409,
        );
        const another = await action(
          'slot',
          { title: 'Overlapping office hours', start, end },
          'u-lecturer',
        );
        assert.equal(
          (await action('reserve', { id: another.result.id })).status,
          409,
        );
      },
    );
    await t.test('feedback contains no student identity', async () => {
      assert.equal(
        (
          await action('evaluation', {
            course: 'CSC 301',
            rating: 5,
            comment: 'Helpful lectures',
          })
        ).status,
        200,
      );
      const state = JSON.parse(
        fs.readFileSync(path.join(directory, 'campus.json'), 'utf8'),
      );
      assert.equal(state.evaluations[0].user, undefined);
      assert.equal(
        (await action('evaluation', { course: 'CSC 301', rating: 6 })).status,
        400,
      );
    });
    await t.test(
      'invalid grade batches leave all grades unchanged',
      async () => {
        const before = JSON.stringify(db.registrations);
        const result = await action('gradeImport', {
          rows: [{ studentId: 'u-student', course: 'UNKNOWN', score: 99 }],
        });
        assert.equal(result.status, 400);
        assert.equal(JSON.stringify(db.registrations), before);
      },
    );
    await t.test(
      'valid grades recalculate letter grades and create an audit record',
      async () => {
        const registered = db.registrations.find(
          (r) => r.status === 'registered',
        )!;
        const result = await action('gradeImport', {
          rows: [
            {
              studentId: registered.studentId,
              course: registered.courseCode,
              score: 0,
            },
          ],
        });
        assert.equal(result.status, 200);
        assert.equal(registered.score, 0);
        assert.equal(registered.grade, 'F');
        assert.ok(db.auditLogs.some((a: any) => a.action === 'GRADE_IMPORT'));
      },
    );
    await t.test(
      'version history preserves uploads and supports revert',
      async () => {
        const file = {
          title: 'Notes.pdf',
          course: 'CSC 301',
          content: 'data:application/pdf;base64,JVBERi0xLjQ=',
          type: 'application/pdf',
          text: 'First version',
          tags: [],
        };
        const first = await action('documents', { files: [file] });
        assert.equal(first.status, 200);
        const second = await action('documents', {
          files: [{ ...file, text: 'Updated notes' }],
        });
        assert.equal(second.result[0].versions.length, 2);
        assert.equal(second.result[0].active, 1);
        const reverted = await action('revert', {
          id: first.result[0].id,
          version: 0,
        });
        assert.equal(reverted.result.active, 0);
        assert.equal(reverted.result.versions[1].text, 'Updated notes');
      },
    );
    await t.test(
      'document batch rejects invalid files without partial writes',
      async () => {
        const before = JSON.parse(
          fs.readFileSync(path.join(directory, 'campus.json'), 'utf8'),
        ).documents.length;
        assert.equal(
          (
            await action('documents', {
              files: [
                { title: 'Unsafe.html', content: 'data:text/html;base64,abcd' },
              ],
            })
          ).status,
          400,
        );
        const after = JSON.parse(
          fs.readFileSync(path.join(directory, 'campus.json'), 'utf8'),
        ).documents.length;
        assert.equal(before, after);
      },
    );
    await t.test(
      'legacy snapshots cannot create unencrypted archives',
      async () => {
        assert.equal((await action('backup')).status, 409);
        assert.equal(
          (await fetch(base + '/api/campus/backup/not-a-uuid')).status,
          400,
        );
      },
    );
    await t.test('concurrent whiteboard strokes merge and stale clears are rejected',async()=>{
      const stroke=(id:string)=>({id,color:'#176858',points:[[10,10],[20,20]]});
      const first=await action('board',{room:'general',strokes:[stroke('stroke-one')]});assert.equal(first.status,200);
      const second=await action('board',{room:'general',strokes:[stroke('stroke-two')]});assert.equal(second.result.strokes.length,2);
      const retry=await action('board',{room:'general',strokes:[stroke('stroke-one')]});assert.equal(retry.result.strokes.length,2);
      assert.equal((await action('board',{room:'general',strokes:[],clear:true,expectedRevision:1})).status,409);
    });
    await t.test('institution records survive service reinstall', async () => {
      const app2 = express();
      app2.use(express.json());
      installCampus(app2, { directory, database: () => db, save: () => {} });
      const saved = JSON.parse(
        fs.readFileSync(path.join(directory, 'campus.json'), 'utf8'),
      );
      assert.equal(saved.attendance.length, 1);
      assert.equal(saved.bookings.length, 1);
    });
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
    assert.equal(
      path.dirname(path.resolve(directory)),
      path.resolve(os.tmpdir()),
    );
    assert.ok(path.basename(directory).startsWith('gu-campus-test-'));
    fs.rmSync(directory, { recursive: true, force: true });
  }
});
