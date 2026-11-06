import { mkdirSync, writeFileSync, readdirSync, unlinkSync } from 'node:fs';
const base = new URL('../public/assets/fonts/', import.meta.url);
mkdirSync(base, { recursive: true });
const fonts = [
  ['grenze-gotisch', 'Grenze Gotisch', '600', 'https://fonts.gstatic.com/s/grenzegotisch/v20/Fh4hPjjqNDz1osh_jX9YfjudpBJBNV5y5wf_k1i58Thkd4qc.woff2', 'grenzegotisch'],
  ['hanken-grotesk', 'Hanken Grotesk', '400 600', 'https://fonts.gstatic.com/s/hankengrotesk/v12/ieVn2YZDLWuGJpnzaiwFXS9tYtpd59A.woff2', 'hankengrotesk'],
];
let css = '/* Self-hosted Google Fonts, SIL Open Font License. */\n';
for (const [file, family, weight, url, folder] of fonts) {
  const response = await fetch(url); if (!response.ok) throw new Error('Font download failed: ' + response.status);
  writeFileSync(new URL(file + '.woff2', base), new Uint8Array(await response.arrayBuffer()));
  const license = await fetch('https://raw.githubusercontent.com/google/fonts/main/ofl/' + folder + '/OFL.txt');
  if (!license.ok) throw new Error('Font license unavailable');
  writeFileSync(new URL(file + '-OFL.txt', base), await license.text());
  css += `@font-face{font-family:"${family}";font-style:normal;font-weight:${weight};font-display:swap;src:url("./${file}.woff2") format("woff2")}\n`;
}
writeFileSync(new URL('fonts.css', base), css);
const cjk = await fetch('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@600&display=swap', {
  headers: { 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36' },
});
if (!cjk.ok) throw new Error('CJK font stylesheet unavailable');
let cjkCSS = await cjk.text();
const urls = [...new Set([...cjkCSS.matchAll(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/g)].map(match => match[1]))];
for (const name of readdirSync(base)) if (/^noto-serif-sc-\d+\.(?:woff2|ttf)$/.test(name)) unlinkSync(new URL(name, base));
let index = 0;
await Promise.all(Array.from({ length: 6 }, async () => {
  while (index < urls.length) {
    const position = index++, url = urls[position], file = 'noto-serif-sc-' + position + (url.includes('.woff2') ? '.woff2' : '.ttf');
    const response = await fetch(url); if (!response.ok) throw new Error('CJK font download failed');
    writeFileSync(new URL(file, base), new Uint8Array(await response.arrayBuffer()));
    cjkCSS = cjkCSS.replaceAll(url, './' + file);
  }
}));
const cjkLicense = await fetch('https://raw.githubusercontent.com/google/fonts/main/ofl/notoserifsc/OFL.txt');
if (!cjkLicense.ok) throw new Error('CJK font license unavailable');
writeFileSync(new URL('noto-serif-sc-OFL.txt', base), await cjkLicense.text());
writeFileSync(new URL('fonts.css', base), css + cjkCSS);
console.log('Self-hosted display, CJK display and body fonts with OFL notices; CJK subsets:', urls.length);
