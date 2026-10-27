import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Operations, money } from './operations';
import { DatabaseSync } from 'node:sqlite';
import express from 'express';
import {installWorkspaces} from './workspaces';

test('workspace API hides other students and rejects spoofed privileged actions', async()=>{
 const directory=fs.mkdtempSync(path.join(os.tmpdir(),'gu-operations-test-'));
 const db=new Operations(directory);db.saveUsers([{id:'one',name:'Student One',email:'one@example.test',role:'student'},{id:'two',name:'Student Two',email:'two@example.test',role:'student'}]);
 const app=express();app.use(express.json());app.use((_req,res,next)=>{res.locals.actor={id:'one',name:'Student One',role:'student'};next();});installWorkspaces(app,db);
 const server=app.listen(0,'127.0.0.1');await new Promise<void>(resolve=>server.once('listening',resolve));const port=(server.address() as any).port;
 try{const state=await (await fetch(`http://127.0.0.1:${port}/api/workspaces/state`)).json();assert.equal(state.users.length,1);assert.equal(state.users[0].id,'one');assert.equal(state.permissions.finance,false);const response=await fetch(`http://127.0.0.1:${port}/api/workspaces/action`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'program',data:{role:'super_admin',code:'NO',title:'Spoofed',requiredCredits:3}})});assert.equal(response.status,403);assert.equal(db.all('SELECT * FROM programs').length,0);}
 finally{await new Promise<void>(resolve=>server.close(()=>resolve()));db.close();if(path.dirname(directory)===os.tmpdir()&&path.basename(directory).startsWith('gu-operations-test-'))fs.rmSync(directory,{recursive:true,force:true});}
});

test('clean-start archives legacy records and preserves activated accounts without importing sample operations', () => {
  const directory = fs.mkdtempSync(
    path.join(os.tmpdir(), 'gu-operations-test-'),
  );
  const legacy = JSON.stringify({
    users: [
      {
        id: 'active',
        name: 'Existing owner',
        email: 'active@example.test',
        role: 'super_admin',
      },
      {
        id: 'seed',
        name: 'Unused sample',
        email: 'seed@example.test',
        role: 'student',
      },
    ],
    courses: [{ id: 'sample' }],
  });
  fs.writeFileSync(path.join(directory, 'university-db.json'), legacy);
  const identity = new DatabaseSync(path.join(directory, 'identity.sqlite'));
  identity.exec(
    "CREATE TABLE accounts(id TEXT,email TEXT,role TEXT,password TEXT);CREATE TABLE invites(user_id TEXT,used INTEGER,expires INTEGER);INSERT INTO accounts VALUES('active','active@example.test','super_admin','existing-hash'),('seed','seed@example.test','student',NULL);",
  );
  identity.close();
  const db = new Operations(directory);
  try {
    db.migrateLegacy();
    assert.deepEqual(
      db.users().map((u) => u.id),
      ['active'],
    );
    assert.equal(db.all('SELECT * FROM courses').length, 0);
    assert.equal(
      fs.readFileSync(path.join(directory, 'university-db.json'), 'utf8'),
      legacy,
    );
    const archives = fs.readdirSync(path.join(directory, 'migration-archive'));
    assert.equal(archives.length, 1);
    assert.equal(
      fs.readFileSync(
        path.join(
          directory,
          'migration-archive',
          archives[0],
          'university-db.json',
        ),
        'utf8',
      ),
      legacy,
    );
    db.migrateLegacy();
    assert.equal(
      fs.readdirSync(path.join(directory, 'migration-archive')).length,
      1,
    );
  } finally {
    db.close();
    if (
      path.dirname(directory) === os.tmpdir() &&
      path.basename(directory).startsWith('gu-operations-test-')
    )
      fs.rmSync(directory, { recursive: true, force: true });
  }
});

test('clean relational workflow enforces billing, review, publication and graduation', () => {
  const directory = fs.mkdtempSync(
    path.join(os.tmpdir(), 'gu-operations-test-'),
  );
  const db = new Operations(directory);
  try {
    db.migrateLegacy();
    assert.equal(db.all('SELECT * FROM students').length, 0);
    assert.equal(db.all('SELECT * FROM courses').length, 0);
    const root: any = { id: 'admin', role: 'super_admin' },
      student: any = { id: 'student', role: 'student' },
      faculty: any = { id: 'faculty', role: 'lecturer' },
      bursar: any = { id: 'bursar', role: 'bursar' };
    db.saveUsers(
      [root, student, faculty, bursar].map((u) => ({
        ...u,
        email: u.id + '@example.test',
        name: u.id,
      })),
    );
    const run = (action: string, data: any) => db.execute(root, action, data);
    const program = run('program', {
      code: 'TEST',
      title: 'Test program',
      requiredCredits: 3,
    });
    const term = run('term', {
      code: 'T1',
      title: 'Test term',
      startDate: '2026-01-01',
      endDate: '2026-05-01',
      status: 'open',
      maxCredits: 12,
    });
    const course = run('course', {
      code: 'C1',
      title: 'Test course',
      credits: 3,
      feePerCredit: '12.34',
      programId: program.id,
    });
    const section = run('section', {
      courseId: course.id,
      termId: term.id,
      lecturerId: faculty.id,
      code: 'A',
      capacity: 1,
      location: 'Room',
      schedule: 'Monday',
    });
    const application = run('application', {
      fullName: 'Test student',
      email: 'student@example.test',
      programId: program.id,
    });
    assert.throws(
      () =>
        run('admit', {
          applicationId: application.id,
          studentNumber: 'S1',
          termId: term.id,
        }),
      /approved/,
    );
    run('reviewApplication', {
      id: application.id,
      status: 'approved',
      note: 'Reviewed',
    });
    const profile = run('admit', {
      applicationId: application.id,
      studentNumber: 'S1',
      termId: term.id,
    });
    assert.equal(profile.user_id, student.id);
    assert.equal(db.eligibility(profile.id).earnedCredits, 0);
    const registration = db.execute(student, 'register', {
      sectionId: section.id,
    });
    assert.throws(
      () => db.execute(student, 'register', { sectionId: section.id }),
      /capacity|already/,
    );
    assert.throws(
      () => db.studentFor({ ...student, id: 'other' }, profile.id),
      /accessible/,
    );
    assert.throws(
      () => db.execute(student, 'invoice', { studentId: profile.id }),
      /role/,
    );
    const invoice = run('invoice', {
      studentId: profile.id,
      termId: term.id,
      dueDate: '2026-02-01',
    });
    assert.equal(invoice.amount_cents, 3702);
    assert.throws(
      () =>
        run('invoice', {
          studentId: profile.id,
          termId: term.id,
          dueDate: '2026-02-01',
        }),
      /unbilled/,
    );
    const receipt = db.execute(bursar, 'payment', {
      invoiceId: invoice.id,
      amount: '37.02',
      reference: 'TEST-RECEIPT',
      method: 'bank',
      receivedDate: '2026-01-05',
    });
    assert.equal(db.balance(profile.id), 3702);
    assert.throws(
      () =>
        db.execute(bursar, 'reconcilePayment', {
          id: receipt.id,
          status: 'reconciled',
          note: 'Checked',
        }),
      /second/,
    );
    run('reconcilePayment', {
      id: receipt.id,
      status: 'reconciled',
      note: 'Statement checked',
    });
    assert.equal(db.balance(profile.id), 0);
    const grade = db.execute(faculty, 'grade', {
      registrationId: registration.id,
      score: 80,
      submit: true,
    });
    assert.throws(() => run('publishGrade', { id: grade.id }), /grading scale/);
    run('gradeScheme', {
      title: 'Approved test scale',
      definition: [
        { min: 50, letter: 'P', points: 4, passed: true },
        { min: 0, letter: 'F', points: 0, passed: false },
      ],
    });
    run('publishGrade', { id: grade.id });
    assert.equal(db.eligibility(profile.id).earnedCredits, 3);
    assert.throws(
      () =>
        db.execute(faculty, 'grade', {
          registrationId: registration.id,
          score: 90,
        }),
      /locked/,
    );
    assert.throws(
      () => run('drop', { id: registration.id, reason: 'Test' }),
      /published/,
    );
    const review = db.execute(student, 'graduationRequest', {});
    run('graduationReview', {
      id: review.id,
      status: 'approved',
      note: 'Requirements verified',
    });
    assert.equal(
      db.one('SELECT status FROM students WHERE id=?', profile.id).status,
      'graduated',
    );
    const snapshot = db.exportSnapshot();
    db.importSnapshot(snapshot);
    assert.equal(db.eligibility(profile.id).earnedCredits, 3);
    assert.throws(() => db.run('DELETE FROM audit'), /cannot be removed/);
    const before = db.all('SELECT * FROM courses').length;
    assert.throws(() =>
      run('course', {
        code: 'BAD',
        title: 'Invalid reference',
        credits: 3,
        feePerCredit: '0',
        programId: 'missing',
      }),
    );
    assert.equal(db.all('SELECT * FROM courses').length, before);
    db.migrateLegacy();
    assert.equal(db.all('SELECT * FROM students').length, 1);
    assert.throws(
      () =>
        run('term', {
          code: 'BAD',
          title: 'Bad date',
          startDate: '2026-99-99',
          endDate: '2026-12-01',
          maxCredits: 12,
        }),
      /valid date/,
    );
  } finally {
    db.close();
    if (
      path.dirname(directory) === os.tmpdir() &&
      path.basename(directory).startsWith('gu-operations-test-')
    )
      fs.rmSync(directory, { recursive: true, force: true });
  }
});

test('currency uses exact cents and rejects ambiguous amounts', () => {
  assert.equal(money('0.29'), 29);
  assert.equal(money('100.01'), 10001);
  assert.throws(() => money('1.001'));
  assert.throws(() => money('-1'));
});
