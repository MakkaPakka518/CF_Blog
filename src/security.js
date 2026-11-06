export class HttpError extends Error {
  constructor(status, message, field = '') { super(message); this.status = status; this.field = field; }
}

export const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
export const randomToken = () => Array.from(crypto.getRandomValues(new Uint8Array(32)), value => value.toString(16).padStart(2, '0')).join('');

export function webURL(value, field = 'url') {
  if (!value) return '';
  if (field === 'cover_url' && value.startsWith('/assets/') && !value.includes('\\')) return value;
  try {
    const url = new URL(value);
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) throw new Error();
    return url.href;
  } catch { throw new HttpError(400, '请填写完整的 http 或 https 地址。', field); }
}

export async function readBody(request, limit = 600_000) {
  if (Number(request.headers.get('content-length')) > limit) throw new HttpError(413, '内容过大，请缩短文章或改用图片链接。');
  const reader = request.body?.getReader();
  if (!reader) throw new HttpError(400, '没有收到表单内容。');
  const decoder = new TextDecoder(); let text = '', bytes = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > limit) { await reader.cancel(); throw new HttpError(413, '内容过大，请缩短文章或改用图片链接。'); }
      text += decoder.decode(value, { stream: true });
    }
    text += decoder.decode();
  } finally { reader.releaseLock(); }
  try {
    if (request.headers.get('content-type')?.includes('application/json')) {
      const value = JSON.parse(text);
      if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error();
      return value;
    }
    return Object.fromEntries(new URLSearchParams(text));
  } catch { throw new HttpError(400, '表单格式不正确，请重新提交。'); }
}

export function sameOrigin(request) {
  const origin = request.headers.get('origin');
  if (origin !== new URL(request.url).origin) throw new HttpError(403, '请求来源无效，请从本站重新打开页面。');
}

export async function equalSecret(left, right) {
  const encoder = new TextEncoder();
  const [a, b] = await Promise.all([left, right].map(value => crypto.subtle.digest('SHA-256', encoder.encode(value))));
  const x = new Uint8Array(a), y = new Uint8Array(b); let difference = 0;
  for (let i = 0; i < x.length; i++) difference |= x[i] ^ y[i];
  return difference === 0;
}

export function cookie(value, request, maxAge = 43_200) {
  return `blog_session=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${new URL(request.url).protocol === 'https:' ? '; Secure' : ''}`;
}

export async function getSession(request, env) {
  const id = request.headers.get('cookie')?.match(/(?:^|;\s*)blog_session=([a-f0-9]{64})(?:;|$)/)?.[1];
  if (!id) return null;
  return env.DB.prepare('SELECT id, csrf, expires_at FROM sessions WHERE id=? AND expires_at>?').bind(id, Date.now()).first();
}

export async function requireSession(request, env) {
  const session = await getSession(request, env);
  if (!session) throw new HttpError(401, '登录已过期，请重新登录。');
  return session;
}

export function checkCSRF(request, session, body) {
  sameOrigin(request);
  if ((request.headers.get('x-csrf-token') || body.csrf) !== session.csrf) throw new HttpError(403, '页面验证已过期，请刷新后重试。');
}

export async function login(request, env, body) {
  sameOrigin(request);
  if (env.ADMIN_PASSWORD == null || env.ADMIN_PASSWORD === '') throw new HttpError(503, '当前运行版本没有读取到 ADMIN_PASSWORD。请在 Worker 的 Variables and Secrets 中添加运行时变量或 Secret，并保存部署。');
  if (typeof env.ADMIN_PASSWORD !== 'string') throw new HttpError(503, 'ADMIN_PASSWORD 必须设置为文本或 Secret，不能使用 JSON 类型。');
  if (env.ADMIN_PASSWORD.length > 512) throw new HttpError(503, 'ADMIN_PASSWORD 超过 512 字符，请缩短后重新部署。');
  const now = Date.now(), address = request.headers.get('cf-connecting-ip') || 'local';
  const attempt = await env.DB.prepare('SELECT failures, reset_at FROM login_attempts WHERE address=?').bind(address).first();
  if (attempt && attempt.reset_at > now && attempt.failures >= 5) throw new HttpError(429, '尝试过于频繁，请在 15 分钟后重试。');
  if (typeof body.password !== 'string' || body.password.length > 512 || !await equalSecret(body.password, env.ADMIN_PASSWORD)) {
    await env.DB.prepare(`INSERT INTO login_attempts(address, failures, reset_at) VALUES (?,1,?)
      ON CONFLICT(address) DO UPDATE SET failures=CASE WHEN reset_at<=? THEN 1 ELSE failures+1 END,
      reset_at=CASE WHEN reset_at<=? THEN excluded.reset_at ELSE reset_at END`).bind(address, now + 900_000, now, now).run();
    throw new HttpError(401, '口令不正确，请检查后重试。', 'password');
  }
  const session = { id: randomToken(), csrf: randomToken(), expires_at: now + 43_200_000 };
  await env.DB.batch([
    env.DB.prepare('DELETE FROM login_attempts WHERE address=? OR reset_at<=?').bind(address, now),
    env.DB.prepare('DELETE FROM sessions WHERE expires_at<=?').bind(now),
    env.DB.prepare('INSERT INTO sessions(id,csrf,expires_at) VALUES (?,?,?)').bind(session.id, session.csrf, session.expires_at),
  ]);
  return session;
}

export function secureResponse(response, nonce = '') {
  const headers = new Headers(response.headers);
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  headers.set('Content-Security-Policy', `default-src 'self'; script-src 'self'${nonce ? " 'nonce-" + nonce + "'" : ''}; style-src 'self'; img-src 'self' https: http: data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'`);
  return new Response(response.body, { status: response.status, headers });
}
