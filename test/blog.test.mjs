import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import sourceWorker from '../src/worker.js';
import { renderMarkdown, validatePost } from '../src/content.js';

const worker = process.env.BLOG_TEST_SINGLE_FILE === '1' ? (await import('../only/worker.js')).default : sourceWorker;

class D1 {
  constructor() { this.db = new DatabaseSync(':memory:'); this.db.exec(readFileSync(new URL('../migrations/0001_blog.sql', import.meta.url), 'utf8')); }
  prepare(sql) {
    const database = this.db; let values = [];
    const statement = {
      bind(...args) { values = args; return statement; },
      async first() { return database.prepare(sql).get(...values) || null; },
      async all() { return { success: true, results: database.prepare(sql).all(...values).map(row => ({ ...row })) }; },
      async run() { const result = database.prepare(sql).run(...values); return { success: true, meta: { changes: Number(result.changes), last_row_id: Number(result.lastInsertRowid) } }; },
      execute() { return /^\s*SELECT/i.test(sql) ? statement.all() : statement.run(); },
    };
    return statement;
  }
  async batch(statements) {
    this.db.exec('BEGIN');
    try { const rows = []; for (const statement of statements) rows.push(await statement.execute()); this.db.exec('COMMIT'); return rows; }
    catch (error) { this.db.exec('ROLLBACK'); throw error; }
  }
}

function fixture(t) {
  const DB = new D1(); t.after(() => DB.db.close());
  const env = { DB, ADMIN_PASSWORD: 'test-password-for-private-blog', ASSETS: { fetch: () => new Response('', { status: 404 }) } };
  let cookie = '', csrf = '';
  async function request(path, body, options = {}) {
    const headers = { Accept: body ? 'application/json' : 'text/html', ...(cookie ? { Cookie: cookie } : {}), ...options.headers };
    if (body) { headers['Content-Type'] = 'application/json'; headers.Origin = options.origin || 'https://blog.test'; if (options.csrf !== false && csrf) headers['X-CSRF-Token'] = csrf; }
    return worker.fetch(new Request('https://blog.test' + path, { method: body ? 'POST' : 'GET', headers, ...(body ? { body: JSON.stringify(body) } : {}) }), env);
  }
  async function login() {
    const response = await request('/admin/login', { password: env.ADMIN_PASSWORD });
    assert.equal(response.status, 200); cookie = response.headers.get('set-cookie').split(';')[0];
    const session = DB.db.prepare('SELECT * FROM sessions').get(); csrf = session.csrf;
    return response;
  }
  return { DB, env, request, login, clearCookie: () => { cookie = ''; csrf = ''; } };
}

test('public site works empty; admin data and export require a session', async t => {
  const f = fixture(t);
  assert.equal((await f.request('/')).status, 200);
  const response = await f.request('/admin/export');
  assert.equal(response.status, 303); assert.match(response.headers.get('location'), /\/admin\/login/);
  const post = await f.request('/admin/posts/save', { title: 'Private', content: 'Secret', action: 'publish' });
  assert.equal(post.status, 401); assert.equal(f.DB.db.prepare('SELECT count(*) n FROM posts').get().n, 0);
});

test('session cookies, origin checks and CSRF protect publishing; logout revokes the session', async t => {
  const f = fixture(t); const login = await f.login();
  assert.match(login.headers.get('set-cookie'), /HttpOnly/); assert.match(login.headers.get('set-cookie'), /SameSite=Strict/); assert.match(login.headers.get('set-cookie'), /Secure/);
  assert.equal((await f.request('/admin/posts/save', { title: 'Article', content: 'Text' }, { csrf: false })).status, 403);
  assert.equal((await f.request('/admin/posts/save', { title: 'Article', content: 'Text' }, { origin: 'https://evil.example' })).status, 403);
  assert.equal((await f.request('/admin/logout', {})).status, 303);
  assert.equal(f.DB.db.prepare('SELECT count(*) n FROM sessions').get().n, 0);
  assert.equal((await f.request('/admin')).status, 303);
});

test('draft, publish, search, archive and feed expose only published writing', async t => {
  const f = fixture(t); await f.login();
  const draft = await (await f.request('/admin/posts/save', { title: 'Private draft', slug: 'private-draft', content: 'Secret Needle', category: 'Hidden', action: 'draft' })).json();
  assert.equal((await f.request('/posts/private-draft')).status, 404);
  assert.doesNotMatch(await (await f.request('/search?q=Needle')).text(), /Private draft/);
  assert.doesNotMatch(await (await f.request('/feed.xml')).text(), /Private draft/);
  assert.doesNotMatch(await (await f.request('/sitemap.xml')).text(), /private-draft/);
  assert.equal((await f.request('/admin/preview/' + draft.post.id)).status, 200);
  const response = await f.request('/admin/posts/save', { ...draft.post, content: '## A heading\n\nPublic Needle', action: 'publish', category: '技术', tags: ['Worker', 'D1'] });
  assert.equal(response.status, 200);
  assert.match(await (await f.request('/posts/private-draft')).text(), /Public Needle/);
  assert.match(await (await f.request('/search?q=Needle')).text(), /Private draft/);
  assert.match(await (await f.request('/archive?tag=Worker')).text(), /Private draft/);
  assert.match(await (await f.request('/feed.xml')).text(), /Private draft/);
});

test('version conflicts cannot overwrite newer content; trash and restore preserve it', async t => {
  const f = fixture(t); await f.login();
  const first = (await (await f.request('/admin/posts/save', { title: 'Note', slug: 'note', content: 'Original', action: 'publish' })).json()).post;
  const current = (await (await f.request('/admin/posts/save', { ...first, content: 'New content', action: 'publish' })).json()).post;
  assert.equal((await f.request('/admin/posts/save', { ...first, content: 'Stale overwrite', action: 'publish' })).status, 409);
  assert.equal(f.DB.db.prepare('SELECT content FROM posts WHERE id=?').get(first.id).content, 'New content');
  assert.equal((await f.request(`/admin/posts/${first.id}/trash`, { version: current.version })).status, 200);
  assert.equal((await f.request('/posts/note')).status, 404);
  const removed = f.DB.db.prepare('SELECT * FROM posts WHERE id=?').get(first.id);
  assert.equal((await f.request(`/admin/posts/${first.id}/restore`, { version: removed.version })).status, 200);
  assert.match(await (await f.request('/posts/note')).text(), /New content/);
});

test('Markdown escapes raw HTML, rejects script links, preserves code and assigns unique anchors', () => {
  const source = '<script>alert(1)</script>\n\n[x](javascript:alert(1))\n\n## 重复标题\n\n## 重复标题\n\n```js\nconst a = "<img onerror=alert(1)>";\n```';
  const result = renderMarkdown(source);
  assert.doesNotMatch(result.html, /<script>|<img onerror|href="javascript:/);
  assert.deepEqual(result.headings.map(heading => heading.id), ['重复标题', '重复标题-2']);
  assert.match(result.html, /&lt;script&gt;/);
  const value = validatePost({ title: '缩进代码', content: '    const a = 1;\n', status: 'draft' });
  assert.equal(value.content, '    const a = 1;\n');
});

test('settings and posts validate inputs; render arbitrary titles as text', async t => {
  const f = fixture(t); await f.login();
  assert.equal((await f.request('/admin/posts/save', { title: 'Bad cover', content: 'Body', cover_url: 'javascript:alert(1)' })).status, 400);
  assert.equal((await f.request('/admin/posts/save', { title: 'Blank', content: '   ', action: 'publish' })).status, 400);
  assert.equal((await f.request('/admin/settings', { title: 'Blog', site_url: 'https://user:password@example.com' })).status, 400);
  await f.request('/admin/settings', { title: '<img src=x onerror=alert(1)>', description: 'A description', author: 'Owner', about: '## About\n\nHi', site_url: 'https://example.com/path', contact_url: '' });
  const page = await (await f.request('/')).text();
  assert.doesNotMatch(page, /<img src=x/); assert.match(page, /&lt;img src=x/);
  assert.match(page, /rel="canonical" href="https:\/\/example.com\/"/);
});

test('login throttles wrong passwords and refuses cross-origin login', async t => {
  const f = fixture(t);
  assert.equal((await f.request('/admin/login', { password: f.env.ADMIN_PASSWORD }, { origin: 'https://other.example' })).status, 403);
  for (let i = 0; i < 5; i++) assert.equal((await f.request('/admin/login', { password: 'wrong' })).status, 401);
  assert.equal((await f.request('/admin/login', { password: f.env.ADMIN_PASSWORD })).status, 429);
});

test('export includes content but never sessions or admin credentials; security headers are present', async t => {
  const f = fixture(t); await f.login();
  await f.request('/admin/posts/save', { title: 'Draft to export', content: 'Private body' });
  const response = await f.request('/admin/export'); const text = await response.text();
  assert.match(text, /Private body/); assert.doesNotMatch(text, /blog_session|ADMIN_PASSWORD|expires_at|csrf/);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.match(response.headers.get('content-security-policy'), /frame-ancestors 'none'/);
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
});
