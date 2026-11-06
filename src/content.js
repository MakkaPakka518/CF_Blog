import MarkdownIt from 'markdown-it';
import { escape, HttpError, webURL } from './security.js';

const markdown = new MarkdownIt({ html: false, linkify: false, typographer: false });
const image = markdown.renderer.rules.image;
markdown.renderer.rules.image = (tokens, index, options, env, self) => {
  tokens[index].attrSet('loading', 'lazy'); tokens[index].attrSet('decoding', 'async');
  return image(tokens, index, options, env, self);
};
const slugText = value => String(value).normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '');

export function renderMarkdown(source) {
  const tokens = markdown.parse(source || '', {}), headings = [], seen = new Map();
  for (let index = 0; index < tokens.length; index++) {
    if (tokens[index].type !== 'heading_open') continue;
    const inline = tokens[index + 1];
    const text = (inline.children || []).filter(t => ['text', 'code_inline'].includes(t.type)).map(t => t.content).join('') || inline.content;
    const base = slugText(text) || 'section'; const count = (seen.get(base) || 0) + 1; seen.set(base, count);
    const id = base + (count > 1 ? '-' + count : '');
    tokens[index].attrSet('id', id); tokens[index].attrSet('tabindex', '-1');
    if (['h2', 'h3'].includes(tokens[index].tag)) headings.push({ id, text, level: Number(tokens[index].tag[1]) });
  }
  return { html: markdown.renderer.render(tokens, markdown.options, {}), headings };
}

function text(value, maximum, field, required = false) {
  if (value == null) value = '';
  if (typeof value !== 'string') throw new HttpError(400, '字段格式不正确。', field);
  if (!['content', 'about'].includes(field)) value = value.trim();
  if (required && !value) throw new HttpError(400, '请填写此项。', field);
  if (value.length > maximum) throw new HttpError(400, `此项最多 ${maximum} 个字符。`, field);
  return value;
}

export function validatePost(body) {
  const title = text(body.title, 160, 'title', true);
  const slug = text(body.slug || slugText(title), 120, 'slug', true);
  if (!/^[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*$/u.test(slug)) throw new HttpError(400, '短链接只支持文字、数字和连字符。', 'slug');
  const content = text(body.content, 200_000, 'content');
  const status = body.action === 'publish' ? 'published' : body.action === 'draft' ? 'draft' : body.status || 'draft';
  if (!['draft', 'published'].includes(status)) throw new HttpError(400, '文章状态不正确。', 'status');
  if (status === 'published' && !content.trim()) throw new HttpError(400, '请先写下正文，再发布文章。', 'content');
  const rawTags = Array.isArray(body.tags) ? body.tags : text(body.tags, 500, 'tags').split(/[,，]/);
  if (rawTags.some(tag => typeof tag !== 'string')) throw new HttpError(400, '标签格式不正确。', 'tags');
  const tags = [...new Set(rawTags.map(tag => tag.trim()).filter(Boolean))];
  if (tags.length > 10 || tags.some(tag => tag.length > 30)) throw new HttpError(400, '最多 10 个标签，每个标签不超过 30 个字符。', 'tags');
  const version = Number(body.version || 0);
  if (!Number.isSafeInteger(version) || version < 0) throw new HttpError(400, '文章版本不正确，请刷新后重试。');
  return { title, slug, content, status, version,
    excerpt: text(body.excerpt, 500, 'excerpt') || plainText(content).slice(0, 180), category: text(body.category, 40, 'category'), tags: JSON.stringify(tags),
    cover_url: webURL(text(body.cover_url, 2048, 'cover_url'), 'cover_url'), cover_alt: text(body.cover_alt, 200, 'cover_alt'),
    featured: body.featured === true || body.featured === 'on' || body.featured === '1' ? 1 : 0,
  };
}

export function validateSettings(body) {
  const site = webURL(text(body.site_url, 2048, 'site_url'), 'site_url');
  return { title: text(body.title, 80, 'title', true), description: text(body.description, 240, 'description'), author: text(body.author, 80, 'author'),
    about: text(body.about, 30_000, 'about'), contact_url: webURL(text(body.contact_url, 2048, 'contact_url'), 'contact_url'), site_url: site ? new URL(site).origin : '' };
}

export const postPath = post => '/posts/' + encodeURIComponent(post.slug);
export const plainText = value => String(value || '').replace(/!\[[^\]]*\]\([^)]*\)/g, '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/[#*_`>~]/g, '').replace(/\s+/g, ' ').trim();
export const summary = post => post.excerpt || plainText(post.content).slice(0, 180);
export const formatDate = value => value ? new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Shanghai' }).format(new Date(value)) : '未发布';
export const isoDate = value => value ? new Date(value).toISOString() : '';
export const tagsOf = post => { try { return JSON.parse(post.tags || '[]'); } catch { return []; } };

export function rss(posts, settings, origin) {
  const base = settings.site_url || origin;
  return `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${escape(settings.title)}</title><link>${escape(base)}</link><description>${escape(settings.description)}</description><language>zh-CN</language>${posts.map(post => `<item><title>${escape(post.title)}</title><link>${escape(base + postPath(post))}</link><guid isPermaLink="true">${escape(base + postPath(post))}</guid><pubDate>${new Date(post.published_at).toUTCString()}</pubDate><description>${escape(summary(post))}</description></item>`).join('')}</channel></rss>`;
}
