import { build } from 'esbuild';
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, writeFileSync, mkdirSync, statSync } from 'node:fs';
import { resolve, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
import assert from 'node:assert/strict';

const root = fileURLToPath(new URL('../', import.meta.url));
const publicDir = join(root, 'public');
const types = {
  '.css': 'text/css; charset=utf-8', '.js': 'application/javascript; charset=utf-8',
  '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.gif': 'image/gif', '.ico': 'image/x-icon', '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8', '.md': 'text/plain; charset=utf-8', '.html': 'text/html; charset=utf-8',
};
const textTypes = new Set(['.css', '.js', '.svg', '.json', '.txt', '.md', '.html']);
const assets = {};
for (const name of readdirSync(publicDir, { recursive: true }).sort()) {
  const path = join(publicDir, name); if (!statSync(path).isFile()) continue;
  const bytes = readFileSync(path), extension = extname(name).toLowerCase(), binary = !textTypes.has(extension);
  assets['/' + name.split('\\').join('/')] = {
    type: types[extension] || 'application/octet-stream', binary,
    body: binary ? bytes.toString('base64') : bytes.toString('utf8'), size: bytes.length,
    etag: '"' + createHash('sha256').update(bytes).digest('hex') + '"',
  };
}

function serveAsset(request, assets) {
  if (!['GET', 'HEAD'].includes(request.method)) return new Response('Method not allowed', { status: 405, headers: { Allow: 'GET, HEAD' } });
  let path;
  try { path = decodeURIComponent(new URL(request.url).pathname); }
  catch { return new Response('Invalid path', { status: 400 }); }
  if (path === '/favicon.ico') path = '/assets/favicon.svg';
  if (!Object.hasOwn(assets, path)) return new Response('Not found', { status: 404, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  const asset = assets[path];
  const headers = { 'Content-Type': asset.type, 'Cache-Control': 'public, max-age=0, must-revalidate', ETag: asset.etag, 'X-Content-Type-Options': 'nosniff' };
  const matches = request.headers.get('if-none-match')?.split(',').some(value => value.trim() === '*' || value.trim().replace(/^W\//, '') === asset.etag);
  if (matches) return new Response(null, { status: 304, headers });
  headers['Content-Length'] = String(asset.size);
  if (request.method === 'HEAD') return new Response(null, { headers });
  const body = asset.binary ? Uint8Array.from(atob(asset.body), character => character.charCodeAt(0)) : asset.body;
  return new Response(body, { headers });
}

const result = await build({
  absWorkingDir: root,
  stdin: { contents: `import blog from './src/worker.js';\nconst assets = ${JSON.stringify(assets)};\n${serveAsset.toString()}\nexport default { fetch(request, env, ctx) { return blog.fetch(request, { ...env, ASSETS: { fetch: assetRequest => serveAsset(assetRequest, assets) } }, ctx); } };`, resolveDir: root, sourcefile: 'single-file-entry.js' },
  bundle: true, format: 'esm', platform: 'browser', target: 'es2022', charset: 'utf8',
  write: false, metafile: true, legalComments: 'inline', minify: false,
});
assert.ok(Object.values(result.metafile.outputs).every(output => output.imports.length === 0), 'Single-file output must have no external module imports');

const packages = new Set();
for (const input of Object.keys(result.metafile.inputs)) {
  const match = input.match(/^node_modules\/((?:@[^/]+\/)?[^/]+)/);
  if (match) packages.add(match[1]);
}
const notices = [];
for (const name of [...packages].sort()) {
  const directory = resolve(root, 'node_modules', name);
  for (const file of readdirSync(directory).filter(file => /^(?:license|copying)(?:[.-]|$)/i.test(file))) {
    if (statSync(join(directory, file)).isFile()) notices.push(name + ' / ' + file + '\n' + readFileSync(join(directory, file), 'utf8'));
  }
}
const banner = `// CF_Blog: standalone Cloudflare Worker.\n// Paste this entire file into the dashboard JavaScript module editor.\n// Required: D1 binding DB (initialized) and runtime secret ADMIN_PASSWORD.\n// CSS, browser scripts, icons and self-hosted fonts are embedded; no ASSETS binding is needed.\n// Rebuild from the repository with: npm run build:only\n`;
const code = banner + result.outputFiles[0].text + '\n/* Bundled dependency notices\n' + notices.join('\n\n').replaceAll('*/', '* /') + '\n*/\n';
const size = Buffer.byteLength(code);
assert.ok(size < 64 * 1024 * 1024, 'Output exceeds the documented 64 MiB Worker bundle limit');
mkdirSync(join(root, 'only'), { recursive: true });
writeFileSync(join(root, 'only', 'worker.js'), code);
console.log(`only/worker.js: ${Object.keys(assets).length} embedded assets, ${size.toLocaleString()} bytes, gzip ${gzipSync(code).length.toLocaleString()} bytes; no external imports`);
