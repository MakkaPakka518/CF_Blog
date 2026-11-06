import { mountContents } from './contents.js';

let noticeTimer;
export function showNotice(message) {
  const notice = document.querySelector('.notice'); if (!notice) return;
  clearTimeout(noticeTimer); notice.textContent = message; notice.hidden = false;
  noticeTimer = setTimeout(() => { notice.hidden = true; }, 3200);
}

const themeButton = document.querySelector('.theme-toggle');
const preference = matchMedia('(prefers-color-scheme: dark)');
function savedTheme() { try { return localStorage.getItem('blog-theme'); } catch { return null; } }
function setTheme(value, remember = false) {
  document.documentElement.dataset.theme = value;
  if (remember) try { localStorage.setItem('blog-theme', value); } catch {}
  if (!themeButton) return;
  const dark = value === 'dark', label = dark ? '切换浅色模式' : '切换深色模式';
  themeButton.setAttribute('aria-label', label); themeButton.title = label;
  themeButton.querySelector('use').setAttribute('href', '/assets/icons.svg#' + (dark ? 'sun' : 'moon'));
  themeButton.hidden = false;
}
setTheme(document.documentElement.dataset.theme || (preference.matches ? 'dark' : 'light'));
themeButton?.addEventListener('click', () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark', true));
preference.addEventListener('change', event => { if (!savedTheme()) setTheme(event.matches ? 'dark' : 'light'); });

document.querySelectorAll('.mobile-menu').forEach(menu => {
  menu.addEventListener('keydown', event => { if (event.key === 'Escape') { menu.open = false; menu.querySelector('summary').focus(); } });
  document.addEventListener('click', event => { if (!menu.contains(event.target)) menu.open = false; });
});

async function copy(text) {
  try { await navigator.clipboard.writeText(text); showNotice('已复制。'); }
  catch { showNotice('复制失败，请手动选择文字复制。'); }
}
document.querySelectorAll('.copy-link').forEach(button => { button.hidden = false; button.addEventListener('click', () => copy(location.origin + (button.dataset.url || location.pathname))); });
document.querySelectorAll('.prose pre').forEach(pre => {
  const code = pre.querySelector('code'); if (!code) return;
  const tools = document.createElement('div'); tools.className = 'code-tools';
  const button = document.createElement('button'); button.type = 'button'; button.className = 'copy-code'; button.setAttribute('aria-label', '复制代码'); button.title = '复制代码';
  button.innerHTML = '<svg width="20" height="20" class="icon" aria-hidden="true"><use href="/assets/icons.svg#copy"></use></svg>';
  button.addEventListener('click', () => copy(code.textContent)); tools.append(button); pre.before(tools);
});
let cleanups = [...document.querySelectorAll('.contents')].map(mountContents);
addEventListener('pagehide', () => { clearTimeout(noticeTimer); cleanups.forEach(cleanup => cleanup()); cleanups = []; });
addEventListener('pageshow', event => {
  if (event.persisted) {
    setTheme(savedTheme() || (preference.matches ? 'dark' : 'light'));
    cleanups = [...document.querySelectorAll('.contents')].map(mountContents);
  }
});
