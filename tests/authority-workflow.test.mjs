import assert from 'node:assert/strict';
import { test } from 'node:test';
import inbound from '../api/authority-inbound.js';
import { requireAmritaSession } from '../api/_amrita-auth.js';

test('inbound replies are retained for review without resolving reports', async (t) => {
  t.mock.method(globalThis, 'fetch', async (_url, options = {}) => {
    calls.push(options);
    return new Response(JSON.stringify(options.method === 'POST' ? {} : [
      { id: 'report-1', code: 'CE-ABC12345', scope: 'campus', status: 'in-progress' },
    ]));
  });
  const previousEnv = { ...process.env };
  t.after(() => { process.env = previousEnv; });
  process.env.AUTHORITY_INBOUND_SECRET = 'test-only-secret';
  process.env.SUPABASE_URL = 'https://example.invalid';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-only-key';
  const calls = [];
  const invoke = async (body, secret = 'test-only-secret') => {
    const res = {
      setHeader() {},
      status(value) { this.statusCode = value; return this; },
      json(value) { this.body = value; return this; },
    };
    await inbound({ method: 'POST', headers: { 'x-authority-webhook-secret': secret }, body }, res);
    return res;
  };
  const reply = {
    messageId: 'test-message', from: 'Estate Office <estate@blr.amrita.edu>',
    subject: 'Re: CE-ABC12345', text: 'The issue has been fixed.',
  };

  assert.equal((await invoke(reply, 'wrong-secret')).statusCode, 401);
  assert.equal(calls.length, 0);
  assert.equal((await invoke({ ...reply, subject: 'No reference' })).statusCode, 400);
  assert.equal(calls.length, 0);

  for (const text of ['The issue has been fixed.', 'The issue has NOT been fixed.', '> Please confirm when fixed.']) {
    calls.length = 0;
    const result = await invoke({ ...reply, text });
    assert.equal(result.statusCode, 202);
    assert.equal(result.body.validationStatus, 'needs_review');
    assert.equal(result.body.accepted, false);
    assert.equal(calls.filter((call) => call.method === 'PATCH').length, 0);
    const saved = JSON.parse(calls.find((call) => call.method === 'POST').body);
    assert.equal(saved.sender_email, 'estate@blr.amrita.edu');
  }
  assert.equal((await invoke({ ...reply, from: 'fake@amrita.edu.example.com' })).body.validationStatus, 'rejected');
});

test('campus API access requires a verified Supabase Amrita session', async (t) => {
  const previousEnv = { ...process.env };
  t.after(() => { process.env = previousEnv; });
  process.env.SUPABASE_URL = 'https://example.invalid';
  process.env.SUPABASE_ANON_KEY = 'test-only-public-key';
  let email = 'student@bl.students.amrita.edu';
  let confirmed = '2026-01-01';
  let status = 200;
  let requests = 0;
  t.mock.method(globalThis, 'fetch', async () => {
    requests += 1;
    return new Response(JSON.stringify({ email, email_confirmed_at: confirmed }), { status });
  });
  assert.equal((await requireAmritaSession({ headers: {} })).status, 401);
  assert.equal(requests, 0);
  const req = { headers: { authorization: 'Bearer test-token' } };
  assert.equal(await requireAmritaSession(req), null);
  email = 'staff@amrita.edu';
  assert.equal(await requireAmritaSession(req), null);
  email = 'person@notamrita.edu';
  assert.equal((await requireAmritaSession(req)).status, 403);
  email = 'student@bl.students.amrita.edu';
  confirmed = null;
  assert.equal((await requireAmritaSession(req)).status, 403);
  status = 401;
  assert.equal((await requireAmritaSession(req)).status, 401);
});
