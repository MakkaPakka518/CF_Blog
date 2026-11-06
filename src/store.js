import { HttpError } from './security.js';

const listColumns = 'id,slug,title,excerpt,category,tags,cover_url,cover_alt,status,featured,version,created_at,updated_at,published_at';
export async function getSettings(db) {
  const { results } = await db.prepare('SELECT key,value FROM settings').all();
  return Object.fromEntries(results.map(row => [row.key, row.value]));
}

export async function listPosts(db, { publicOnly = true, status = 'published', query = '', category = '', tag = '', page = 1, limit = 12, sort = 'home' } = {}) {
  let where = !publicOnly && status === 'all' ? "status IN ('draft','published')" : 'status=?';
  const values = !publicOnly && status === 'all' ? [] : [publicOnly ? 'published' : status];
  if (query) { where += " AND (title LIKE ? ESCAPE '\\' OR excerpt LIKE ? ESCAPE '\\' OR content LIKE ? ESCAPE '\\')"; const term = '%' + query.replace(/[\\%_]/g, '\\$&') + '%'; values.push(term, term, term); }
  if (category) { where += ' AND category=?'; values.push(category); }
  if (tag) { where += ' AND EXISTS(SELECT 1 FROM json_each(posts.tags) WHERE value=?)'; values.push(tag); }
  const order = publicOnly ? (sort === 'date' ? 'published_at DESC,id DESC' : 'featured DESC,published_at DESC,id DESC') : 'updated_at DESC,id DESC';
  const [rows, count] = await db.batch([
    db.prepare(`SELECT ${listColumns} FROM posts WHERE ${where} ORDER BY ${order} LIMIT ? OFFSET ?`).bind(...values, limit, (page - 1) * limit),
    db.prepare(`SELECT count(*) AS total FROM posts WHERE ${where}`).bind(...values),
  ]);
  return { posts: rows.results, total: count.results[0].total, page, limit };
}

export async function publicCategories(db) {
  const { results } = await db.prepare("SELECT category,count(*) AS total FROM posts WHERE status='published' AND category<>'' GROUP BY category ORDER BY category").all();
  return results;
}

export async function getPost(db, id) {
  return db.prepare('SELECT * FROM posts WHERE id=?').bind(id).first();
}

export async function savePost(db, id, post) {
  const now = new Date().toISOString();
  const duplicate = await db.prepare('SELECT id FROM posts WHERE slug=? AND id<>?').bind(post.slug, id || 0).first();
  if (duplicate) throw new HttpError(409, '这个短链接已被使用，请换一个。', 'slug');
  if (id) {
    const existing = await getPost(db, id);
    if (!existing || existing.status === 'trash') throw new HttpError(404, '文章不存在，或已移入回收站。');
    if (existing.version !== post.version) throw new HttpError(409, '文章已在其他窗口更新。请先保留当前内容，再刷新此页。', 'version');
    const result = await db.prepare(`UPDATE posts SET slug=?,title=?,excerpt=?,content=?,category=?,tags=?,cover_url=?,cover_alt=?,status=?,featured=?,
      updated_at=?,published_at=?,version=version+1 WHERE id=? AND version=?`).bind(post.slug, post.title, post.excerpt, post.content, post.category,
      post.tags, post.cover_url, post.cover_alt, post.status, post.featured, now,
      post.status === 'published' ? existing.published_at || now : existing.published_at, id, post.version).run();
    if (!result.meta.changes) throw new HttpError(409, '文章已被更新，请保留当前内容后刷新。', 'version');
  } else {
    const result = await db.prepare(`INSERT INTO posts(slug,title,excerpt,content,category,tags,cover_url,cover_alt,status,featured,created_at,updated_at,published_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(post.slug, post.title, post.excerpt, post.content, post.category, post.tags, post.cover_url,
      post.cover_alt, post.status, post.featured, now, now, post.status === 'published' ? now : null).run();
    id = result.meta.last_row_id;
  }
  return getPost(db, id);
}

export async function movePost(db, id, action, version) {
  const post = await getPost(db, id);
  if (!post) throw new HttpError(404, '文章不存在。');
  if (post.version !== Number(version)) throw new HttpError(409, '文章状态已改变，请刷新列表后重试。');
  const now = new Date().toISOString();
  const result = action === 'trash'
    ? await db.prepare("UPDATE posts SET trashed_from=status,status='trash',updated_at=?,version=version+1 WHERE id=? AND version=? AND status<>'trash'").bind(now, id, post.version).run()
    : await db.prepare("UPDATE posts SET status=trashed_from,updated_at=?,version=version+1 WHERE id=? AND version=? AND status='trash'").bind(now, id, post.version).run();
  if (!result.meta.changes) throw new HttpError(409, '文章状态已改变，请刷新列表后重试。');
}
