import { mount } from '../vendor/leibox/soft-action-wheel/SoftActionWheel.ts';

const host = document.querySelector('[data-reading-tools]');
let dispose;
function mountReadingTools() {
  if (!host || dispose) return;
  const component = mount(host);
  const root = component.root;
  const demo = root.querySelector('.radial-menu-demo');
  demo.setAttribute('role', 'group');
  demo.setAttribute('aria-label', '阅读工具');
  demo.removeAttribute('translate');
  demo.classList.remove('notranslate');
  root.querySelector('.rm-menu').setAttribute('aria-label', '文章快捷操作');
  root.querySelector('.rm-status').remove();
  const stylesheet = document.createElement('link');
  stylesheet.rel = 'stylesheet'; stylesheet.href = '/assets/reading-tools.css';
  root.append(stylesheet);

  const actions = [
    ['copy', '复制链接', 'copy'], ['top', '回到顶部', 'arrow-up'],
    ['archive', '文章归档', 'archive'], ['theme', '切换配色', 'moon'],
    ['rss', 'RSS 订阅', 'rss'], ['print', '打印文章', 'print'],
  ];
  root.querySelectorAll('.rm-action').forEach((button, index) => {
    const [action, label, icon] = actions[index];
    button.dataset.action = action;
    button.setAttribute('aria-label', label); button.title = label;
    button.innerHTML = `<svg class="rm-icon" aria-hidden="true"><use href="/assets/icons.svg#${icon}"></use></svg><span class="rm-label">${label}</span>`;
  });
  const toggle = root.querySelector('.rm-toggle');
  const caption = document.createElement('span'); caption.className = 'rm-label';
  toggle.append(caption);
  const sync = () => {
    const opened = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-label', opened ? '收起阅读工具' : '展开阅读工具');
    caption.textContent = opened ? '收起' : '工具';
    const dark = document.documentElement.dataset.theme === 'dark';
    const theme = root.querySelector('.rm-action[data-action="theme"]');
    theme.setAttribute('aria-label', dark ? '切换浅色模式' : '切换深色模式');
    theme.title = theme.getAttribute('aria-label');
    theme.querySelector('use').setAttribute('href', `/assets/icons.svg#${dark ? 'sun' : 'moon'}`);
  };
  const observer = new MutationObserver(sync);
  observer.observe(toggle, { attributes: true, attributeFilter: ['aria-expanded'] });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  sync();
  let actionFrame;
  const onAction = event => {
    switch (event.detail.action) {
      case 'copy': document.querySelector('.copy-link').click(); break;
      case 'theme': document.querySelector('.theme-toggle').click(); break;
      case 'archive': location.assign('/archive'); break;
      case 'rss': location.assign('/feed.xml'); break;
      case 'top':
        // Let the menu restore its focus before moving it to the article heading.
        actionFrame = requestAnimationFrame(() => {
          const heading = document.querySelector('.article-heading h1');
          heading.focus({ preventScroll: true });
          heading.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
        });
        break;
      case 'print': actionFrame = requestAnimationFrame(() => window.print()); break;
    }
  };
  host.addEventListener('radial-menu-action', onAction);
  host.hidden = false;
  dispose = () => {
    cancelAnimationFrame(actionFrame); observer.disconnect();
    host.removeEventListener('radial-menu-action', onAction);
    component.destroy(); host.hidden = true; dispose = undefined;
  };
}
mountReadingTools();
addEventListener('pagehide', () => dispose?.());
addEventListener('pageshow', event => { if (event.persisted) mountReadingTools(); });
