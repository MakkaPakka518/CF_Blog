import { HttpError, randomToken, readBody, getSession, requireSession, checkCSRF, login, cookie, secureResponse, escape } from './security.js';
import { getSettings, listPosts, publicCategories, getPost, savePost, movePost } from './store.js';
import { validatePost, validateSettings, renderMarkdown, postPath, rss } from './content.js';
import * as views from './views.js';

const defaults = { title: '个人博客', description: '技术与生活的记录。', author: '', about: '', contact_url: '', site_url: '' };
const redirect = (location, headers = {}) => new Response(null, { status: 303, headers: { Location: location, 'Cache-Control': 'no-store', ...headers } });
const json = (value, status = 200) => Response.json(value, { status, headers: { 'Cache-Control': 'no-store' } });
const wantsJSON = request => request.headers.get('accept')?.includes('application/json');
const safeNext = value => typeof value === 'string' && /^\/admin(?:\/[a-zA-Z0-9-]+)*$/.test(value) ? value : '/admin';

export default {
  async fetch(request, env) {
    const url = new URL(request.url), path = url.pathname, method = request.method;
    const nonce = randomToken();
    let settings = defaults, session = null;
    const page = (body, title = '', status = 200, extra = {}) => new Response(views.layout({ body, title, settings, path, nonce, session,
      admin: path.startsWith('/admin'), demo: settings.demo === 'true', canonical: !path.startsWith('/admin') ? (settings.site_url || url.origin) + path : '', ...extra }),
    { status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': path.startsWith('/admin') ? 'no-store' : 'no-cache' } });
    const finish = response => {
      const secured = secureResponse(response, nonce);
      return method === 'HEAD' ? new Response(null, { status: secured.status, headers: secured.headers }) : secured;
    };
    try {
      if (path.startsWith('/assets/') || path === '/favicon.ico') return env.ASSETS.fetch(request);
      if (!['GET', 'HEAD', 'POST'].includes(method)) throw new HttpError(405, '此操作不支持当前请求方式。');
      if (!env.DB) throw new HttpError(503, '博客数据库尚未配置。');
      settings = { ...defaults, ...await getSettings(env.DB) };
      if (path.startsWith('/admin')) {
        session = await getSession(request, env);
        if (path === '/admin/login') {
          if (method === 'POST') {
            let body;
            try {
              body = await readBody(request, 4096);
              const loggedIn = await login(request, env, body);
              const location = safeNext(body.next);
              return finish(wantsJSON(request)
                ? new Response(JSON.stringify({ ok: true, location }), { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'Set-Cookie': cookie(loggedIn.id, request) } })
                : redirect(location, { 'Set-Cookie': cookie(loggedIn.id, request) }));
            } catch (error) {
              if (!(error instanceof HttpError)) throw error;
              return finish(wantsJSON(request) ? json({ error: error.message, field: error.field }, error.status) : page(views.loginPage(safeNext(body?.next), error.message), '后台登录', error.status));
            }
          }
          return finish(session ? redirect('/admin') : page(views.loginPage(safeNext(url.searchParams.get('next'))), '后台登录'));
        }
        if (!session) {
          if (method === 'POST' || wantsJSON(request)) throw new HttpError(401, '登录已过期，请先保留当前内容，再重新登录。');
          return finish(redirect('/admin/login?next=' + encodeURIComponent(safeNext(path))));
        }
        if (method === 'POST') {
          const body = await readBody(request);
          checkCSRF(request, session, body);
          if (path === '/admin/logout') {
            await env.DB.prepare('DELETE FROM sessions WHERE id=?').bind(session.id).run();
            return finish(redirect('/', { 'Set-Cookie': cookie('', request, 0) }));
          }
          if (path === '/admin/preview') return finish(json(renderMarkdown(typeof body.content === 'string' ? body.content.slice(0, 200_000) : '')));
          if (path === '/admin/posts/save') {
            try {
              const id = body.id ? Number(body.id) : null;
              if (id != null && (!Number.isSafeInteger(id) || id < 1)) throw new HttpError(400, '文章编号不正确。');
              const saved = await savePost(env.DB, id, validatePost(body));
              const location = '/admin/posts/' + saved.id;
              return finish(wantsJSON(request) ? json({ ok: true, post: saved, location, publicURL: saved.status === 'published' ? postPath(saved) : '' }) : redirect(location + '?saved=1'));
            } catch (error) {
              if (String(error.message).includes('UNIQUE constraint failed: posts.slug')) error = new HttpError(409, '这个短链接已被使用，请换一个。', 'slug');
              if (!(error instanceof HttpError)) throw error;
              return finish(wantsJSON(request) ? json({ error: error.message, field: error.field }, error.status) : page(views.editor(body, session, error.message, error.field), '编辑文章', error.status));
            }
          }
          const action = path.match(/^\/admin\/posts\/(\d+)\/(trash|restore)$/);
          if (action) {
            await movePost(env.DB, Number(action[1]), action[2], body.version);
            const message = action[2] === 'trash' ? '文章已移入回收站，可以恢复。' : '文章已恢复。';
            return finish(wantsJSON(request) ? json({ ok: true, message }) : redirect('/admin?status=' + (action[2] === 'restore' ? 'all' : 'trash')));
          }
          if (path === '/admin/settings') {
            try {
              const next = validateSettings(body);
              await env.DB.batch(Object.entries(next).map(([key, value]) => env.DB.prepare('INSERT INTO settings(key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').bind(key, value)));
              settings = { ...settings, ...next };
              return finish(wantsJSON(request) ? json({ ok: true, message: '设置已保存。' }) : page(views.settingsPage(settings, session, '设置已保存。'), '站点设置'));
            } catch (error) {
              if (!(error instanceof HttpError)) throw error;
              return finish(wantsJSON(request) ? json({ error: error.message, field: error.field }, error.status) : page(views.settingsPage({ ...settings, ...body }, session, '', error.message), '站点设置', error.status));
            }
          }
          throw new HttpError(404, '没有找到这个操作。');
        }
        if (path === '/admin') {
          const status = ['all', 'draft', 'published', 'trash'].includes(url.searchParams.get('status')) ? url.searchParams.get('status') : 'all';
          const query = (url.searchParams.get('q') || '').slice(0, 100), number = pageNumber(url);
          const result = await listPosts(env.DB, { publicOnly: false, status, query, page: number, limit: 20 });
          return finish(page(views.adminList(result, status, query, session, request.url), '文章管理'));
        }
        if (path === '/admin/posts/new') return finish(page(views.editor({}, session), '写文章'));
        const edit = path.match(/^\/admin\/posts\/(\d+)$/);
        if (edit) {
          const post = await getPost(env.DB, Number(edit[1]));
          if (!post || post.status === 'trash') throw new HttpError(404, '文章不存在，或已移入回收站。');
          return finish(page(views.editor(post, session), '编辑文章'));
        }
        const preview = path.match(/^\/admin\/preview\/(\d+)$/);
        if (preview) {
          const post = await getPost(env.DB, Number(preview[1]));
          if (!post || post.status === 'trash') throw new HttpError(404, '文章不存在。');
          return finish(page(views.postPage(post, [], true), post.title));
        }
        if (path === '/admin/settings') return finish(page(views.settingsPage(settings, session), '站点设置'));
        if (path === '/admin/export') {
          const { results } = await env.DB.prepare('SELECT * FROM posts ORDER BY id').all();
          return finish(new Response(JSON.stringify({ format: 'worker-d1-blog', version: 1, exportedAt: new Date().toISOString(), settings, posts: results }, null, 2), {
            headers: { 'Content-Type': 'application/json; charset=utf-8', 'Content-Disposition': 'attachment; filename="blog-backup.json"', 'Cache-Control': 'no-store' },
          }));
        }
        throw new HttpError(404, '后台没有这个页面。');
      }
      if (method === 'POST') throw new HttpError(405, '公开页面只支持阅读。');
      if (path === '/') {
        const result = await listPosts(env.DB, { page: pageNumber(url) });
        return finish(page(views.home(result, settings, request.url), settings.title));
      }
      if (path === '/archive' || path === '/search') {
        const query = (url.searchParams.get('q') || '').slice(0, 100), category = (url.searchParams.get('category') || '').slice(0, 40), tag = (url.searchParams.get('tag') || '').slice(0, 30);
        const [result, categories] = await Promise.all([listPosts(env.DB, { query, category, tag, page: pageNumber(url), sort: 'date' }), publicCategories(env.DB)]);
        return finish(page(views.archive(result, categories, request.url, query, category, tag), path === '/search' ? '搜索' : '归档'));
      }
      if (path === '/about') return finish(page(views.aboutPage(settings), '关于'));
      const article = path.match(/^\/posts\/([^/]+)$/);
      if (article) {
        let slug;
        try { slug = decodeURIComponent(article[1]); } catch { throw new HttpError(404, '文章地址不正确。'); }
        const post = await env.DB.prepare("SELECT * FROM posts WHERE slug=? AND status='published'").bind(slug).first();
        if (!post) throw new HttpError(404, '文章可能尚未发布、已经撤回，或链接有误。');
        const { results } = await env.DB.prepare("SELECT id,slug,title,excerpt,category,tags,published_at FROM posts WHERE status='published' AND id<>? ORDER BY (category=?) DESC,published_at DESC LIMIT 2").bind(post.id, post.category).all();
        return finish(page(views.postPage(post, results), post.title, 200, { description: post.excerpt }));
      }
      if (path === '/feed.xml') {
        const { results } = await env.DB.prepare("SELECT slug,title,excerpt,content,published_at FROM posts WHERE status='published' ORDER BY published_at DESC LIMIT 20").all();
        return finish(new Response(rss(results, settings, url.origin), { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8', 'Cache-Control': 'no-cache' } }));
      }
      if (path === '/sitemap.xml') {
        const { results } = await env.DB.prepare("SELECT slug,updated_at FROM posts WHERE status='published' ORDER BY published_at DESC").all();
        const origin = settings.site_url || url.origin;
        const entries = ['/', '/archive', '/about'].map(route => `<url><loc>${escape(origin + route)}</loc></url>`).join('') + results.map(post => `<url><loc>${escape(origin + postPath(post))}</loc><lastmod>${escape(post.updated_at)}</lastmod></url>`).join('');
        return finish(new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries}</urlset>`, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } }));
      }
      if (path === '/robots.txt') return finish(new Response(`User-agent: *\nDisallow: /admin\nSitemap: ${settings.site_url || url.origin}/sitemap.xml\n`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } }));
      throw new HttpError(404, '请检查链接，或从文章首页重新查找。');
    } catch (error) {
      if (!(error instanceof HttpError)) console.error('Blog request failed', error.name, error.message);
      const status = error instanceof HttpError ? error.status : 503;
      const message = error instanceof HttpError ? error.message : '博客暂时不可用，请稍后重试。首次运行请确认已应用数据库迁移。';
      return finish(wantsJSON(request) ? json({ error: message, field: error.field || '' }, status) : page(views.errorPage(status, message), '暂时无法打开', status));
    }
  },
};

function pageNumber(url) {
  const value = Number(url.searchParams.get('page') || 1);
  return Number.isSafeInteger(value) && value >= 1 && value <= 5000 ? value : 1;
}
