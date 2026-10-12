import assert from 'node:assert/strict';
import { test } from 'node:test';
import handler from '../api/network-context.js';

function invoke(headers = {}) {
  const response = {
    headers: {},
    setHeader(name, value) { this.headers[name] = value; },
    status(value) { this.statusCode = value; return this; },
    json(value) { this.body = value; return this; },
  };
  return handler({ method: 'GET', headers }, response);
}

test('campus network context matches configured IPs and CIDRs', () => {
  const previous = { ...process.env };
  process.env.AMRITA_NETWORK_IPS = '198.51.100.14';
  process.env.AMRITA_NETWORK_CIDRS = '203.0.113.0/24';
  try {
    assert.equal(invoke({ 'x-vercel-forwarded-for': '198.51.100.14' }).body.isAmritaNetwork, true);
    assert.equal(invoke({ 'x-vercel-forwarded-for': '203.0.113.77' }).body.isAmritaNetwork, true);
    assert.equal(invoke({ 'x-vercel-forwarded-for': '192.0.2.7' }).body.isAmritaNetwork, false);
  } finally {
    process.env = previous;
  }
});

test('network context is disabled until an allowlist is configured', () => {
  const previous = { ...process.env };
  delete process.env.AMRITA_NETWORK_IPS;
  delete process.env.AMRITA_NETWORK_CIDRS;
  try {
    assert.equal(invoke({ 'x-forwarded-for': '198.51.100.14' }).body.isAmritaNetwork, false);
  } finally {
    process.env = previous;
  }
});
