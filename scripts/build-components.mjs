import { build } from 'esbuild';
import { readFileSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const root = new URL('../', import.meta.url);
const wheelPath = new URL('vendor/leibox/soft-action-wheel/', root);
const wheelEngine = readFileSync(new URL('SoftActionWheelEngine.js', wheelPath), 'utf8');
const wheelConfigText = wheelEngine.match(/createSurface\(target, (\{.*\}), options\);/)[1];
const wheelConfig = JSON.parse(wheelConfigText);
const runtime = readFileSync(new URL('motion-runtime.ts', wheelPath), 'utf8');
const foundation = runtime.match(/style.textContent = `([^`]+)` \+ config.css/)[1];
const wheelCSS = foundation + wheelConfig.css
  .replace(/(^|[,\s}>+~])(?:html|body)(?=[\s,{.#:[>])/g, '$1.motion-body')
  .replace(/:root\b/g, '.motion-body').replace(/100(?:s|d|l)?vh/g, 'var(--motion-height)')
  .replace(/position\s*:\s*fixed/g, 'position:absolute');
writeFileSync(new URL('public/assets/reading-tools-base.css', root), '/*! LeiBox Soft Action Wheel · withAnimation design reference. Source: vendor/leibox/soft-action-wheel/. */\n' + wheelCSS.replaceAll('\r\n', '\n').trimEnd() + '\n');
// Keep the blog's strict style CSP: serve the package styles as a same-origin asset.
wheelConfig.markup = wheelConfig.markup.replace(/ style="[^"]*"/g, '');
wheelConfig.css = '';
const linkedRuntime = runtime.replace(/const style = owner.createElement\("style"\);[\s\S]+?(?=  const frame =)/,
  'const style = owner.createElement("link");\n  style.rel = "stylesheet";\n  style.href = "/assets/reading-tools-base.css";\n');
assert.ok(linkedRuntime !== runtime && !linkedRuntime.includes('style.textContent'));
await build({
  entryPoints: [new URL('src/reading-tools.js', root).pathname],
  outfile: new URL('public/assets/reading-tools.js', root).pathname,
  bundle: true, format: 'esm', target: 'es2022', legalComments: 'inline',
  banner: { js: '/*! LeiBox Soft Action Wheel · design reference: withAnimation. Source and notices: vendor/leibox/soft-action-wheel/. */' },
  plugins: [{ name: 'blog-component-styles', setup(build) {
    build.onLoad({ filter: /soft-action-wheel\/SoftActionWheelEngine\.js$/ }, () => ({ contents: wheelEngine.replace(wheelConfigText, JSON.stringify(wheelConfig)), loader: 'js' }));
    build.onLoad({ filter: /soft-action-wheel\/motion-runtime\.ts$/ }, () => ({ contents: linkedRuntime, loader: 'ts' }));
  } }],
});

// Extract the submitted CSS as data; the demo engine is never executed at build time.
const engine = readFileSync(new URL('vendor/leibox/tactile-push-button/TactilePushButtonEngine.js', root), 'utf8');
const config = JSON.parse(engine.match(/createSurface\(target, (\{.*\}), options\);/)[1]);
const start = config.css.indexOf('\n.tactile-button {');
assert.ok(start > 0 && config.css.includes('@media (prefers-reduced-motion: reduce)'));
writeFileSync(new URL('public/assets/tactile-button.css', root), '/*! Tactile Push Button · 少荃 (Douyin: 宝龙体育优品小铺), via LeiBox. Complete source: vendor/leibox/tactile-push-button/. */\n' + config.css.slice(start).replaceAll('\r\n', '\n').trimEnd() + '\n');
console.log('Built reading-tools.js, reading-tools-base.css and tactile-button.css from the retained LeiBox sources.');
