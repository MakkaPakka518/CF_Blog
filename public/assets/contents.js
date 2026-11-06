/** Adapted from LeiBox SailingToc's section-following behavior.
 * Design reference: Emir Ayaz, https://leibox.pantoria.cn/docs/animations/sailing-toc
 * Original package and notices: vendor/leibox/sailing-toc.
 */
export function mountContents(nav) {
  const links = [...nav.querySelectorAll('a[href^="#"]')];
  const sections = links.map(link => document.getElementById(decodeURIComponent(link.hash.slice(1))));
  const marker = nav.querySelector('.contents-marker');
  if (!links.length || sections.some(section => !section)) return () => {};
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  let active = -1, y = 0, target = 0, velocity = 0, frame = 0, last = 0, visible = true, destroyed = false;
  const paint = () => { marker.style.transform = `translateY(${y}px)`; };
  function stop() { cancelAnimationFrame(frame); frame = 0; last = 0; }
  function tick(now) {
    frame = 0;
    if (destroyed || document.hidden || !visible) { last = 0; return; }
    const dt = Math.min(.032, (now - (last || now)) / 1000); last = now;
    velocity += (220 * (target - y) - 30 * velocity) * dt; y += velocity * dt;
    if (Math.abs(target - y) < .1 && Math.abs(velocity) < .2) { y = target; velocity = 0; paint(); last = 0; return; }
    paint(); frame = requestAnimationFrame(tick);
  }
  function select(index, snap = false) {
    const changed = active !== index; active = index;
    links.forEach((link, i) => i === active ? link.setAttribute('aria-current', 'location') : link.removeAttribute('aria-current'));
    target = links[active].offsetTop + links[active].offsetHeight / 2 - 8;
    nav.dataset.enhanced = 'true';
    if (snap || media.matches) { stop(); y = target; velocity = 0; paint(); }
    else if (!frame && visible && !document.hidden) frame = requestAnimationFrame(tick);
    if (changed && nav.scrollHeight > nav.clientHeight) {
      const top = links[active].offsetTop, bottom = top + links[active].offsetHeight;
      if (top < nav.scrollTop) nav.scrollTop = top;
      else if (bottom > nav.scrollTop + nav.clientHeight) nav.scrollTop = bottom - nav.clientHeight;
    }
  }
  function pick() {
    let index = 0;
    for (let i = 0; i < sections.length; i++) if (sections[i].getBoundingClientRect().top <= 150) index = i;
    if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4) index = sections.length - 1;
    if (index !== active) select(index, active < 0);
  }
  const resize = new ResizeObserver(() => { pick(); select(Math.max(0, active), true); }); resize.observe(nav);
  const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (!visible) stop(); else select(Math.max(0, active), true); }); observer.observe(nav);
  const change = () => { stop(); select(Math.max(0, active), true); };
  const visibility = () => { if (document.hidden) stop(); else { pick(); change(); } };
  function keydown(event) {
    const index = links.indexOf(event.target); if (index < 0) return;
    const next = event.key === 'ArrowDown' ? Math.min(links.length - 1, index + 1) : event.key === 'ArrowUp' ? Math.max(0, index - 1) : event.key === 'Home' ? 0 : event.key === 'End' ? links.length - 1 : -1;
    if (next >= 0) { event.preventDefault(); links[next].focus({ preventScroll: true }); }
  }
  addEventListener('scroll', pick, { passive: true }); document.addEventListener('visibilitychange', visibility);
  media.addEventListener('change', change); nav.addEventListener('keydown', keydown); pick();
  return () => { destroyed = true; stop(); resize.disconnect(); observer.disconnect(); removeEventListener('scroll', pick); document.removeEventListener('visibilitychange', visibility); media.removeEventListener('change', change); nav.removeEventListener('keydown', keydown); delete nav.dataset.enhanced; };
}
