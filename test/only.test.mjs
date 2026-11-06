import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import worker from '../only/worker.js';

const root = fileURLToPath(new URL('../', import.meta.url));
test('single-file Worker serves every asset byte-for-byte without an ASSETS binding', async () => {
  const directory = join(root, 'public');
  for (const path of readdirSync(directory, { recursive: true })) {
    const full = join(directory, path); if (!statSync(full).isFile()) continue;
    const request = new Request('https://blog.test/' + path.split('\\').join('/'));
    const response = await worker.fetch(request, {});
    assert.equal(response.status, 200, path);
    assert.deepEqual(Buffer.from(await response.arrayBuffer()), readFileSync(full), path);
    assert.ok(response.headers.get('content-type'), path);
  }
});

test('embedded assets support HEAD, conditional caching, missing paths and method checks', async () => {
  const url = 'https://blog.test/assets/style.css';
  const response = await worker.fetch(new Request(url), {});
  const cached = await worker.fetch(new Request(url, { headers: { 'If-None-Match': response.headers.get('etag') } }), {});
  assert.equal(cached.status, 304); assert.equal(await cached.text(), '');
  const head = await worker.fetch(new Request(url, { method: 'HEAD' }), {});
  assert.equal(head.status, 200); assert.equal(await head.text(), '');
  assert.equal(head.headers.get('content-length'), response.headers.get('content-length'));
  assert.equal((await worker.fetch(new Request('https://blog.test/assets/missing.js'), {})).status, 404);
  assert.equal((await worker.fetch(new Request(url, { method: 'POST' }), {})).status, 405);
  assert.equal((await worker.fetch(new Request('https://blog.test/favicon.ico'), {})).status, 200);
});

test('single-file Worker passes the same authentication, D1 and publication regression tests', () => {
  const { NODE_TEST_CONTEXT, ...environment } = process.env;
  const output = execFileSync(process.execPath, ['--test', 'test/blog.test.mjs'], { cwd: root, env: { ...environment, BLOG_TEST_SINGLE_FILE: '1' }, encoding: 'utf8' });
  assert.match(output, /^# pass [1-9]\d*$/m);
});
