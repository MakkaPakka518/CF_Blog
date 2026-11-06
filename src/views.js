import { escape as e } from './security.js';
import { postPath, formatDate, isoDate, summary, tagsOf, renderMarkdown } from './content.js';

export const icon = name => `<svg class="icon" width="20" height="20" aria-hidden="true"><use href="/assets/icons.svg#${name}"></use></svg>`;
const statusName = status => ({ draft: '草稿', published: '已发布', trash: '回收站' }[status] || '全部');
const csrfField = session => `<input type="hidden" name="csrf" value="${e(session.csrf)}">`;
const field = (name, label, value = '', options = '') => `<label class="field"><span>${label}</span><input name="${name}" value="${e(value)}" ${options}></label>`;
const date = value => value ? `<time datetime="${e(isoDate(value))}">${e(formatDate(value))}</time>` : '<span>未发布</span>';
const metadata = post => `<div class="post-meta">${date(post.published_at)}${post.category ? `<a href="/archive?category=${encodeURIComponent(post.category)}">${e(post.category)}</a>` : ''}</div>`;

function navigation(path, admin) {
  const links = admin ? [['/admin', '文章'], ['/admin/posts/new', '写文章'], ['/admin/settings', '站点设置'], ['/', '查看博客']] : [['/', '文章'], ['/archive', '归档'], ['/about', '关于']];
  return links.map(([href, name]) => `<a href="${href}"${path === href ? ' aria-current="page"' : ''}>${name}</a>`).join('');
}

export function layout({ title, description, body, settings, path = '/', nonce, admin = false, session, canonical = '', demo = false }) {
  const name = settings.title || '个人博客';
  const docTitle = title && title !== name ? `${title} | ${name}` : name;
  const nav = navigation(path, admin);
  return `<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="${e(description || settings.description)}"><title>${e(docTitle)}</title>
  ${admin ? '<meta name="robots" content="noindex,nofollow">' : ''}${canonical ? `<link rel="canonical" href="${e(canonical)}"><meta property="og:url" content="${e(canonical)}">` : ''}
  <meta property="og:title" content="${e(docTitle)}"><meta property="og:description" content="${e(description || settings.description)}"><meta property="og:type" content="${path.startsWith('/posts/') ? 'article' : 'website'}">
  <link rel="icon" type="image/svg+xml" href="/assets/favicon.svg"><link rel="alternate" type="application/rss+xml" title="${e(name)}" href="/feed.xml"><link rel="stylesheet" href="/assets/style.css">
  <script nonce="${nonce}">document.documentElement.classList.add('js');try{const p=localStorage.getItem('blog-theme');document.documentElement.dataset.theme=p==='light'||p==='dark'?p:matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light'}catch{}</script>
  <script type="module" src="/assets/app.js"></script>${admin ? '<script type="module" src="/assets/admin.js"></script>' : ''}</head>
  <body class="${admin ? 'admin-site' : 'public-site'}"><a class="skip-link" href="#main">跳到正文</a>
  <header class="masthead container"><div class="masthead-line"><a class="wordmark" href="${admin ? '/admin' : '/'}" aria-label="${e(name)}首页">${e(name)}</a>
  <nav class="desktop-nav" aria-label="${admin ? '管理导航' : '主导航'}">${nav}</nav><div class="header-actions">${!admin ? `<a class="icon-link" href="/search" aria-label="搜索文章">${icon('search')}</a>` : ''}<button class="icon-button theme-toggle" type="button" aria-label="切换配色" title="切换配色" hidden>${icon('moon')}</button>
  <details class="mobile-menu"><summary aria-label="展开导航">${icon('menu')}</summary><nav aria-label="移动导航">${nav}${!admin ? '<a href="/search">搜索</a>' : ''}</nav></details></div></div>
  ${admin && session ? `<div class="admin-context"><span>写作空间</span><form action="/admin/logout" method="post">${csrfField(session)}<button type="submit" class="text-button">退出登录</button></form></div>` : ''}</header>
  ${demo ? '<div class="demo-note container" role="note">当前为本地演示内容，不代表作者的真实文章。</div>' : ''}
  <main id="main" tabindex="-1" class="${admin ? 'admin-main' : 'public-main'}">${body}</main>
  <footer class="site-footer container"><div><a class="footer-name" href="/">${e(name)}</a>${settings.author ? `<p>${e(settings.author)}</p>` : ''}</div><nav aria-label="页脚导航"><a href="/archive">全部文章</a><a href="/feed.xml">RSS 订阅</a>${settings.contact_url ? `<a href="${e(settings.contact_url)}" rel="me noopener">联系作者</a>` : ''}<a href="/admin">写作后台</a></nav></footer>
  <div class="notice" role="status" aria-live="polite" hidden></div></body></html>`;
}

export function pagination(result, url) {
  const pages = Math.ceil(result.total / result.limit);
  if (pages <= 1) return '';
  const link = page => { const next = new URL(url); next.searchParams.set('page', page); return e(next.pathname + next.search); };
  return `<nav class="pagination" aria-label="文章分页">${result.page > 1 ? `<a href="${link(result.page - 1)}">上一页</a>` : '<span></span>'}<span>第 ${result.page} / ${pages} 页</span>${result.page < pages ? `<a href="${link(result.page + 1)}">下一页</a>` : '<span></span>'}</nav>`;
}

function articleRow(post) {
  return `<article class="article-row"><div class="row-date">${date(post.published_at)}</div><div class="row-content"><h3><a href="${postPath(post)}">${e(post.title)}</a></h3>${post.excerpt ? `<p>${e(post.excerpt)}</p>` : ''}<div class="row-tags">${post.category ? `<a href="/archive?category=${encodeURIComponent(post.category)}">${e(post.category)}</a>` : ''}${tagsOf(post).slice(0, 3).map(tag => `<a href="/archive?tag=${encodeURIComponent(tag)}">${e(tag)}</a>`).join('')}</div></div></article>`;
}

export function home(result, settings, url) {
  const [lead, ...rest] = result.posts;
  return `<div class="container"><section class="hero"><div class="site-intro"><h1>${e(settings.description || '技术与生活的记录。')}</h1><div class="intro-links"><a href="/archive">浏览归档</a><a href="/feed.xml">${icon('rss')}订阅更新</a></div></div>
  ${lead ? `<article class="feature-story"><div class="feature-copy"><h2><a href="${postPath(lead)}">${e(lead.title)}</a></h2>${metadata(lead)}${lead.excerpt ? `<p class="feature-excerpt">${e(lead.excerpt)}</p>` : ''}<a class="reading-link" href="${postPath(lead)}">阅读全文</a></div>${lead.cover_url ? `<figure class="feature-cover"><img src="${e(lead.cover_url)}" alt="${e(lead.cover_alt)}" width="1200" height="800" fetchpriority="high"></figure>` : ''}</article></section>
    <section class="article-index"><div class="section-heading"><h2>文章索引</h2><a href="/archive">全部 ${result.total} 篇</a></div>${rest.length ? rest.map(articleRow).join('') : '<p class="quiet-copy">新的文章会继续收录在这里。</p>'}${pagination(result, url)}</section>`
    : `<section class="empty-reading"><h2>第一篇文章，还在路上。</h2><p>这里将收录技术笔记与生活记录。</p><a href="/about">关于这个博客</a></section></section>`}</div>`;
}

export function archive(result, categories, url, query = '', category = '', tag = '') {
  const search = new URL(url).pathname === '/search';
  const heading = search ? '搜索文章' : tag ? `标签：${tag}` : category || '文章归档';
  return `<div class="container"><header class="page-heading"><h1>${e(heading)}</h1><p>${search ? '用一个词，找回一篇文章。' : '按主题浏览，也沿着时间回看。'}</p></header>
    <form class="search-form" action="${search ? '/search' : '/archive'}" method="get"><label class="visually-hidden" for="query">搜索关键词</label><input id="query" name="q" type="search" value="${e(query)}" placeholder="搜索标题或正文" maxlength="100"><button class="button" type="submit">搜索</button></form>
    <nav class="category-nav" aria-label="按分类筛选"><a href="/archive"${!category && !tag ? ' aria-current="page"' : ''}>全部</a>${categories.map(item => `<a href="/archive?category=${encodeURIComponent(item.category)}"${category === item.category ? ' aria-current="page"' : ''}>${e(item.category)} <span>${item.total}</span></a>`).join('')}</nav>
    <section class="article-index archive-index" aria-label="文章列表">${result.posts.length ? `<p class="results-count">${query ? `“${e(query)}” 找到 ` : '共 '}${result.total} 篇文章</p>${result.posts.map(articleRow).join('')}` : `<div class="empty-reading"><h2>${query || category || tag ? '没有找到匹配的文章。' : '还没有发布文章。'}</h2><p>${query ? '换个关键词试试，或回到全部文章。' : '新的记录会在发布后出现在这里。'}</p><a href="/archive">查看全部文章</a></div>`}${pagination(result, url)}</section></div>`;
}

export function postPage(post, related = [], preview = false) {
  const rendered = renderMarkdown(post.content);
  return `<div class="container article-page">${preview ? '<p class="preview-note" role="status">草稿预览，仅登录后可见。</p>' : ''}<header class="article-heading"><a href="/archive" class="back-link">文章归档</a><h1>${e(post.title)}</h1>${metadata(post)}${post.excerpt ? `<p class="article-deck">${e(post.excerpt)}</p>` : ''}</header>
  ${post.cover_url ? `<figure class="article-cover"><img src="${e(post.cover_url)}" alt="${e(post.cover_alt)}" width="1200" height="800" fetchpriority="high"></figure>` : ''}
  <div class="reading-layout"><article class="prose" data-article>${rendered.html}</article>${rendered.headings.length > 1 ? `<aside class="contents-panel"><nav class="contents" aria-label="文章目录"><h2>本文目录</h2><span class="contents-marker" aria-hidden="true">${icon('bookmark')}</span><ol>${rendered.headings.map(item => `<li class="level-${item.level}"><a href="#${encodeURIComponent(item.id)}">${e(item.text)}</a></li>`).join('')}</ol></nav></aside>` : ''}</div>
  <footer class="article-end"><div class="article-tags">${tagsOf(post).map(tag => `<a href="/archive?tag=${encodeURIComponent(tag)}">${e(tag)}</a>`).join('')}</div><p>更新于 ${e(formatDate(post.updated_at))}</p>${!preview ? `<button class="text-button copy-link" type="button" data-url="${postPath(post)}" hidden>复制文章链接</button>` : ''}</footer>
  ${related.length ? `<section class="related-posts"><h2>接着读</h2>${related.map(articleRow).join('')}</section>` : ''}</div>`;
}

export function aboutPage(settings) {
  return `<div class="container"><header class="page-heading"><h1>关于${settings.author ? e(settings.author) : '这个博客'}</h1><p>${e(settings.description)}</p></header><div class="prose about-prose">${settings.about ? renderMarkdown(settings.about).html : '<p>作者尚未添加自我介绍。</p>'}</div>${settings.contact_url ? `<div class="about-contact"><a class="button" href="${e(settings.contact_url)}" rel="me noopener">联系作者</a></div>` : ''}</div>`;
}

export function loginPage(next = '/admin', error = '') {
  return `<div class="container"><section class="login-panel"><h1>回到写作。</h1><p>输入管理口令，继续你的文章。</p><form action="/admin/login" method="post" data-login><input type="hidden" name="next" value="${e(next)}"><label class="field"><span>管理口令</span><input type="password" name="password" autocomplete="current-password" required maxlength="512"></label><p class="form-feedback" role="alert">${e(error)}</p><button class="button" type="submit">登录后台</button></form><a class="back-link" href="/">返回博客</a></section></div>`;
}

export function adminList(result, status, query, session, url, message = '') {
  const tabs = [['all', '全部'], ['draft', '草稿'], ['published', '已发布'], ['trash', '回收站']];
  return `<div class="container"><header class="admin-heading"><div><h1>你的文章</h1><p>从一个念头，写到可以分享。</p></div><a class="button" href="/admin/posts/new">写新文章</a></header>
  ${message ? `<p class="inline-notice" role="status">${e(message)}</p>` : ''}<div class="admin-toolbar"><nav class="status-tabs" aria-label="文章状态">${tabs.map(([value, label]) => `<a href="/admin?status=${value}"${status === value ? ' aria-current="page"' : ''}>${label}</a>`).join('')}</nav><form action="/admin" method="get" class="compact-search"><input type="hidden" name="status" value="${e(status)}"><label class="visually-hidden" for="admin-query">搜索文章</label><input id="admin-query" name="q" type="search" value="${e(query)}" placeholder="搜索文章"><button class="text-button" type="submit">搜索</button></form></div>
  ${result.posts.length ? `<table class="post-table"><thead><tr><th>文章</th><th>状态</th><th>最后更新</th><th>操作</th></tr></thead><tbody>${result.posts.map(post => `<tr><td><a href="/admin/posts/${post.id}">${e(post.title)}</a><small>${e(post.category || '未分类')}</small></td><td><span class="post-status status-${post.status}">${statusName(post.status)}</span></td><td>${date(post.updated_at)}</td><td><div class="table-actions">${post.status !== 'trash' ? `<a href="/admin/posts/${post.id}">编辑</a><a href="/admin/preview/${post.id}" target="_blank" rel="noopener">预览</a>` : ''}<form action="/admin/posts/${post.id}/${post.status === 'trash' ? 'restore' : 'trash'}" method="post" data-row-action>${csrfField(session)}<input type="hidden" name="version" value="${post.version}"><button type="submit" class="text-button">${post.status === 'trash' ? '恢复' : '移入回收站'}</button></form></div></td></tr>`).join('')}</tbody></table>` : `<section class="empty-admin"><h2>${status === 'trash' ? '回收站是空的。' : query ? '没有匹配的文章。' : '从第一篇开始。'}</h2><p>${status === 'trash' ? '移入回收站的文章可以在这里恢复。' : query ? '试着缩短关键词。' : '草稿只对你可见，写好后再发布。'}</p>${status !== 'trash' && !query ? '<a href="/admin/posts/new">新建一篇草稿</a>' : ''}</section>`}${pagination(result, url)}<p class="export-link"><a href="/admin/export">导出文章备份</a></p><p class="form-feedback" role="alert" data-list-feedback></p></div>`;
}

export function editor(post, session, error = '', errorField = '') {
  const saved = Boolean(post.id), published = post.status === 'published';
  const tagText = Array.isArray(post.tags) ? post.tags.join(', ') : typeof post.tags === 'string' && post.tags.startsWith('[') ? tagsOf(post).join(', ') : post.tags || '';
  return `<div class="container"><header class="admin-heading"><div><a class="back-link" href="/admin">全部文章</a><h1>${saved ? '编辑文章' : '写一篇文章'}</h1></div><div class="editor-state" role="status" data-save-state>${saved ? `${statusName(post.status)}，${e(formatDate(post.updated_at))}更新` : '尚未保存'}</div></header>
  <div class="draft-recovery" hidden><p>当前窗口有未保存的本地草稿。</p><button type="button" class="text-button" data-restore-draft>恢复内容</button><button type="button" class="text-button" data-dismiss-draft>忽略</button></div>
  <form id="post-editor" action="/admin/posts/save" method="post" data-editor>${csrfField(session)}<input type="hidden" name="id" value="${post.id || ''}"><input type="hidden" name="version" value="${post.version || 0}"><input type="hidden" name="status" value="${e(post.status || 'draft')}">
  <div class="editor-layout"><section class="writing-pane"><label class="field title-field"><span>标题</span><input name="title" value="${e(post.title)}" placeholder="写下标题" maxlength="160" required${errorField === 'title' ? ' aria-invalid="true"' : ''}></label>
  <div class="editor-tabs" role="tablist" aria-label="写作视图"><button type="button" role="tab" aria-selected="true" aria-controls="write-pane" id="write-tab" data-editor-tab="write">Markdown</button><button type="button" role="tab" aria-selected="false" aria-controls="preview-pane" id="preview-tab" data-editor-tab="preview">预览</button></div>
  <div id="write-pane" role="tabpanel" aria-labelledby="write-tab"><label class="visually-hidden" for="content">文章正文</label><textarea id="content" name="content" spellcheck="false" placeholder="从这里开始写。支持标题、列表、链接、图片和代码块。" maxlength="200000">${e(post.content)}</textarea></div><section id="preview-pane" role="tabpanel" aria-labelledby="preview-tab" class="prose editor-preview" hidden></section>
  </section><aside class="publishing-pane"><h2>发布设置</h2>${field('slug', '短链接', post.slug, 'maxlength="120" placeholder="留空时根据标题生成"')}<label class="field"><span>摘要</span><textarea name="excerpt" rows="4" maxlength="500" placeholder="留空时从正文提取">${e(post.excerpt)}</textarea></label>${field('category', '分类', post.category, 'maxlength="40" placeholder="例如：技术、生活"')}${field('tags', '标签', tagText, 'maxlength="500" placeholder="用逗号分隔"')}
  <label class="check-field"><input type="checkbox" name="featured"${post.featured ? ' checked' : ''}><span>在首页优先展示</span></label>
  <details class="cover-settings"><summary>封面图片</summary>${field('cover_url', '图片地址', post.cover_url, 'maxlength="2048" placeholder="https:// 或 /assets/ 路径"')}${field('cover_alt', '图片描述', post.cover_alt, 'maxlength="200" placeholder="简短描述图片内容"')}<p class="field-help">支持已有图床链接或静态资源路径。</p></details></aside></div>
  <div class="editor-actions"><p class="form-feedback" role="alert" data-error-field="${e(errorField)}">${e(error)}</p><div><button class="button${published ? '' : ' button-quiet'}" type="submit" name="action" value="save" data-save-action>${published ? '更新文章' : '保存草稿'}</button><button class="button${published ? ' button-quiet' : ''}" type="submit" name="action" value="${published ? 'draft' : 'publish'}" data-publication-action>${published ? '撤回为草稿' : '发布文章'}</button></div></div></form></div>`;
}

export function settingsPage(settings, session, message = '', error = '') {
  return `<div class="container"><header class="admin-heading"><div><h1>站点设置</h1><p>让这里成为你的博客。</p></div></header><form class="settings-form" action="/admin/settings" method="post" data-settings>${csrfField(session)}
  <section><h2>名称与介绍</h2>${field('title', '博客名称', settings.title, 'required maxlength="80"')}${field('description', '一句话介绍', settings.description, 'maxlength="240"')}${field('author', '作者署名', settings.author, 'maxlength="80"')}<label class="field"><span>关于页面</span><textarea name="about" rows="12" maxlength="30000" placeholder="用 Markdown 写一段自我介绍。">${e(settings.about)}</textarea></label></section>
  <section><h2>链接</h2>${field('site_url', '正式站点地址', settings.site_url, 'type="url" placeholder="https://your-domain.example"')}${field('contact_url', '公开联系链接', settings.contact_url, 'type="url" placeholder="例如你的个人主页"')}<p class="field-help">正式地址用于文章规范链接和 RSS。留空时使用当前访问地址。</p></section><p class="form-feedback${message ? ' is-success' : ''}" role="status">${e(error || message)}</p><button class="button" type="submit">保存设置</button></form></div>`;
}

export function errorPage(status, message) {
  return `<div class="container"><section class="error-page"><h1>${status === 404 ? '这篇记录不在这里。' : '暂时无法打开。'}</h1><p>${e(message)}</p><a class="button" href="/">返回文章首页</a></section></div>`;
}
