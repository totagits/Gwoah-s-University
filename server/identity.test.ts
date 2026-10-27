import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import express from 'express';
import { installIdentity, digest } from './identity';

test('authentication and authorization enforce server identities', async (t) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'gu-identity-test-'));
  const token = crypto.randomBytes(32).toString('hex');
  const originalEmail = process.env.INITIAL_ADMIN_EMAIL,
    originalHash = process.env.INITIAL_ADMIN_TOKEN_HASH;
  process.env.INITIAL_ADMIN_EMAIL = 'owner@example.test';
  process.env.INITIAL_ADMIN_TOKEN_HASH = digest(token);
  const users: any[] = [
    {
      id: 'owner',
      email: 'owner@example.test',
      role: 'super_admin',
      name: 'Test Owner',
      title: 'Administrator',
    },
  ];
  const app = express();
  app.use(express.json());
  const identity = installIdentity(app, {
    directory,
    users: () => users,
    save: () => {},
    origin: 'http://localhost',
    secure: false,
  });
  if (originalEmail === undefined) delete process.env.INITIAL_ADMIN_EMAIL;
  else process.env.INITIAL_ADMIN_EMAIL = originalEmail;
  if (originalHash === undefined) delete process.env.INITIAL_ADMIN_TOKEN_HASH;
  else process.env.INITIAL_ADMIN_TOKEN_HASH = originalHash;
  app.get('/api/health', (_req, res) => res.json({ ok: true }));
  app.get('/api/students/:id', (_req, res) => res.json({ ok: true }));
  app.post('/api/campus/action', (req, res) =>
    res.json({ actor: req.body.user }),
  );
  app.get('/api/campus/proctor', (_req, res) => res.json([]));
  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>((resolve) =>
    server.once('listening', () => resolve()),
  );
  const base = `http://127.0.0.1:${(server.address() as any).port}`;
  const call = async (
    url: string,
    method = 'GET',
    body?: any,
    session?: any,
    extra: any = {},
  ) => {
    const r = await fetch(base + url, {
      method,
      headers: {
        Origin: 'http://localhost',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(session
          ? { Cookie: session.cookie, 'X-CSRF-Token': session.csrf }
          : {}),
        ...extra,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    let data: any;
    try {
      data = await r.json();
    } catch {}
    return { status: r.status, data, cookie: r.headers.get('set-cookie') };
  };
  let owner: any, student: any;
  try {
    await t.test(
      'anonymous requests cannot read private records or impersonate an admin',
      async () => {
        assert.equal((await call('/api/identity/accounts')).status, 401);
        assert.equal((await call('/api/students/owner')).status, 401);
        assert.equal((await call('/api/campus/proctor')).status, 401);
        assert.equal(
          (await call('/api/auth/login', 'POST', { role: 'super_admin' }))
            .status,
          401,
        );
        assert.equal((await call('/api/health')).status, 200);
      },
    );
    await t.test(
      'activation tokens are single-use and passwords are never stored in clear text',
      async () => {
        assert.equal(
          (
            await call('/api/auth/activate', 'POST', {
              token,
              password: 'LongTestPassword2026!',
            })
          ).status,
          200,
        );
        assert.equal(
          (
            await call('/api/auth/activate', 'POST', {
              token,
              password: 'AnotherTestPassword2026!',
            })
          ).status,
          400,
        );
        const account = identity.sql
          .prepare('SELECT * FROM accounts WHERE id=?')
          .get('owner') as any;
        assert.ok(account.password.startsWith('scrypt:'));
        assert.ok(!account.password.includes('LongTestPassword2026!'));
      },
    );
    await t.test(
      'login issues an HttpOnly strict session, with a separate request token',
      async () => {
        const r = await call('/api/auth/login', 'POST', {
          email: 'owner@example.test',
          password: 'LongTestPassword2026!',
        });
        assert.equal(r.status, 200);
        assert.match(r.cookie!, /HttpOnly/);
        assert.match(r.cookie!, /SameSite=Strict/);
        owner = { cookie: r.cookie!.split(';')[0], csrf: r.data.csrf };
        assert.equal(
          (await call('/api/auth/me', 'GET', undefined, owner)).data.user.id,
          'owner',
        );
      },
    );
    await t.test(
      'mutations reject missing request tokens and foreign origins',
      async () => {
        assert.equal(
          (
            await call(
              '/api/campus/action',
              'POST',
              { action: 'plan' },
              owner,
              { 'X-CSRF-Token': '' },
            )
          ).status,
          403,
        );
        assert.equal(
          (
            await call(
              '/api/campus/action',
              'POST',
              { action: 'plan' },
              owner,
              { Origin: 'https://attacker.test' },
            )
          ).status,
          403,
        );
      },
    );
    await t.test(
      'an invited student cannot choose an administrator identity or edit grades',
      async () => {
        const invite = await call(
          '/api/identity/invite',
          'POST',
          {
            name: 'Test Student',
            email: 'student@example.test',
            role: 'student',
          },
          owner,
        );
        assert.equal(invite.status, 200);
        const invitation = invite.data.activationUrl.split('#')[1];
        assert.equal(
          (
            await call('/api/auth/activate', 'POST', {
              token: invitation,
              password: 'StudentTestPassword2026!',
            })
          ).status,
          200,
        );
        const r = await call('/api/auth/login', 'POST', {
          email: 'student@example.test',
          password: 'StudentTestPassword2026!',
          role: 'super_admin',
        });
        student = {
          cookie: r.cookie!.split(';')[0],
          csrf: r.data.csrf,
          id: r.data.user.id,
        };
        assert.equal(r.data.user.role, 'student');
        assert.equal(
          (
            await call(
              '/api/campus/action',
              'POST',
              { action: 'plan', user: 'owner', userId: 'owner' },
              student,
            )
          ).data.actor,
          student.id,
        );
        assert.equal(
          (
            await call(
              '/api/campus/action',
              'POST',
              { action: 'gradeImport' },
              student,
            )
          ).status,
          403,
        );
        assert.equal(
          (await call('/api/students/owner', 'GET', undefined, student)).status,
          403,
        );
        assert.equal(
          (await call('/api/identity/accounts', 'GET', undefined, student))
            .status,
          403,
        );
      },
    );
    await t.test(
      'disabling an account revokes its existing sessions immediately',
      async () => {
        assert.equal(
          (
            await call(
              '/api/identity/accounts/' + student.id,
              'PATCH',
              { role: 'student', disabled: true },
              owner,
            )
          ).status,
          200,
        );
        assert.equal(
          (await call('/api/auth/me', 'GET', undefined, student)).status,
          401,
        );
        assert.equal(
          (
            await call('/api/auth/login', 'POST', {
              email: 'student@example.test',
              password: 'StudentTestPassword2026!',
            })
          ).status,
          401,
        );
      },
    );
    await t.test(
      'logout revokes the session and the security chain verifies',
      async () => {
        const audit = await call(
          '/api/identity/audit',
          'GET',
          undefined,
          owner,
        );
        assert.equal(audit.data.intact, true);
        assert.ok(audit.data.entries.length > 0);
        assert.equal(
          (await call('/api/auth/logout', 'POST', {}, owner)).status,
          200,
        );
        assert.equal(
          (await call('/api/auth/me', 'GET', undefined, owner)).status,
          401,
        );
      },
    );
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
    identity.close();
    assert.equal(
      path.dirname(path.resolve(directory)),
      path.resolve(os.tmpdir()),
    );
    assert.ok(path.basename(directory).startsWith('gu-identity-test-'));
    fs.rmSync(directory, { recursive: true, force: true });
  }
});
