import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import express from 'express';
import { installPlatform } from './platform';
import { ENGLISH_CATALOG } from '../src/i18n/catalog';
import { parseBusyCalendar } from './calendarProvider';
test('calendar provider expands recurring events and omits transparent events', () => {
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    'UID:one',
    'DTSTART:20261027T100000Z',
    'DTEND:20261027T103000Z',
    'RRULE:FREQ=DAILY;COUNT=2',
    'END:VEVENT',
    'BEGIN:VEVENT',
    'UID:transparent',
    'DTSTART:20261027T110000Z',
    'DTEND:20261027T120000Z',
    'TRANSP:TRANSPARENT',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
  const busy = parseBusyCalendar(
    ics,
    new Date('2026-10-27T00:00:00Z'),
    new Date('2026-10-30T00:00:00Z'),
  );
  assert.equal(busy.length, 2);
  assert.equal(busy[1].start, '2026-10-28T10:00:00.000Z');
});
test('platform permissions, bookmarks, translations, and encrypted restore', async (t) => {
  for (const key of ['S3_BUCKET', 'S3_ACCESS_KEY_ID', 'S3_SECRET_ACCESS_KEY'])
    delete process.env[key];
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'gu-platform-test-'));
  const db: any = {
    users: [{ id: 'admin' }],
    courses: [{ id: 'course' }],
    registrations: [],
  };
  let campus: any = { documents: [] };
  const app = express();
  app.use(express.json());
  app.use((req, res, next) => {
    res.locals.actor = {
      id: req.get('x-test-user') || 'admin',
      role: req.get('x-test-role') || 'super_admin',
      email: 'test@example.test',
    };
    next();
  });
  const platform = installPlatform(app, {
    directory,
    database: () => db,
    restore: (data) => Object.assign(db, data),
    campus: {
      snapshot: () => campus,
      restore: (data: any) => {
        campus = data;
      },
      recordActivity: () => {},
    },
    identity: { log: () => {} },
  });
  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>((resolve) =>
    server.once('listening', () => resolve()),
  );
  const base = `http://127.0.0.1:${(server.address() as any).port}`;
  const call = async (
    url: string,
    method = 'GET',
    body?: any,
    headers: any = {},
  ) => {
    const r = await fetch(base + url, {
      method,
      headers: {
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    return { status: r.status, data: await r.json() };
  };
  try {
    await t.test(
      'bookmarks are account-scoped and separate collections are preserved',
      async () => {
        assert.equal(
          (
            await call('/api/platform/bookmarks', 'PUT', {
              kind: 'catalog',
              ids: ['catalog-one'],
            })
          ).status,
          200,
        );
        await call('/api/platform/bookmarks', 'PUT', {
          kind: 'documents',
          ids: ['document-one'],
        });
        const mine = await call('/api/platform/bookmarks');
        assert.deepEqual(mine.data, {
          catalog: ['catalog-one'],
          documents: ['document-one'],
        });
        const other = await call('/api/platform/bookmarks', 'GET', undefined, {
          'x-test-user': 'other',
        });
        assert.deepEqual(other.data, { catalog: [], documents: [] });
      },
    );
    await t.test(
      'students cannot access provider configuration or model records',
      async () => {
        for (const url of [
          '/api/platform/status',
          '/api/platform/prediction',
          '/api/localization/admin',
        ]) {
          const r = await fetch(base + url, {
            headers: { 'x-test-role': 'student' },
          });
          assert.equal(r.status, 403);
        }
      },
    );
    await t.test(
      'translation publication requires complete strings and a reviewer',
      async () => {
        assert.equal(
          (
            await call('/api/localization/pack', 'PUT', {
              code: 'kpe',
              strings: { campus: 'test' },
              publish: true,
              reviewedBy: 'Fixture reviewer',
            })
          ).status,
          400,
        );
        assert.equal(
          (
            await call('/api/localization/pack', 'PUT', {
              code: 'en-LR',
              strings: ENGLISH_CATALOG,
              publish: true,
              reviewedBy: 'Test fixture reviewer',
            })
          ).status,
          200,
        );
        const published = await call('/api/localization/published');
        assert.equal(published.data.languages.length, 1);
        assert.equal(published.data.languages[0].code, 'en-LR');
      },
    );
    await t.test(
      'backup files contain ciphertext and authenticate before restore',
      async () => {
        const saved = await call('/api/platform/backups', 'POST', {});
        assert.equal(saved.status, 200);
        const file = await call('/api/platform/backups/' + saved.data.id);
        assert.equal(file.data.format, 'gwoah-backup-v1');
        assert.equal(file.data.university, undefined);
        const preview = await call('/api/platform/backups/preview', 'POST', {
          envelope: file.data,
        });
        assert.equal(preview.status, 200);
        assert.equal(preview.data.courses, 1);
        const changed = {
          ...file.data,
          ciphertext:
            (file.data.ciphertext[0] === 'A' ? 'B' : 'A') +
            file.data.ciphertext.slice(1),
        };
        assert.equal(
          (
            await call('/api/platform/backups/preview', 'POST', {
              envelope: changed,
            })
          ).status,
          400,
        );
        assert.equal(
          (
            await call('/api/platform/backups/restore', 'POST', {
              envelope: file.data,
              confirmation: 'wrong',
            })
          ).status,
          400,
        );
        db.courses = [];
        assert.equal(
          (
            await call('/api/platform/backups/restore', 'POST', {
              envelope: file.data,
              confirmation: 'RESTORE SNAPSHOT',
            })
          ).status,
          200,
        );
        assert.equal(db.courses.length, 1);
        assert.equal(db.users[0].id, 'admin');
      },
    );
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
    platform.close();
    assert.equal(
      path.dirname(path.resolve(directory)),
      path.resolve(os.tmpdir()),
    );
    assert.ok(path.basename(directory).startsWith('gu-platform-test-'));
    fs.rmSync(directory, { recursive: true, force: true });
  }
});
