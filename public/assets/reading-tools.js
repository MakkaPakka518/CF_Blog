/*! LeiBox Soft Action Wheel · design reference: withAnimation. Source and notices: vendor/leibox/soft-action-wheel/. */

// vendor/leibox/soft-action-wheel/motion-runtime.ts
var fonts = /* @__PURE__ */ new Map();
function createSurface(target, config, initial = {}) {
  let options = { ...initial };
  let destroyed = false;
  let scale = 1;
  const owner = target.ownerDocument;
  const browser = owner.defaultView;
  const element = owner.createElement("div");
  element.dataset.motionSurface = "";
  element.style.cssText = "display:block;position:relative;width:100%;min-width:0;overflow:hidden;isolation:isolate;";
  target.appendChild(element);
  const root = element.attachShadow({ mode: "open" });
  const style = owner.createElement("link");
  style.rel = "stylesheet";
  style.href = "/assets/reading-tools-base.css";
  const frame = owner.createElement("div");
  frame.className = "motion-frame";
  const body = owner.createElement("div");
  body.className = "motion-body";
  body.innerHTML = config.markup;
  frame.appendChild(body);
  root.append(style, frame);
  const frames = /* @__PURE__ */ new Set();
  const deferredFrames = /* @__PURE__ */ new Set();
  let painted = false;
  const timeouts = /* @__PURE__ */ new Set();
  const intervals = /* @__PURE__ */ new Set();
  const observers = /* @__PURE__ */ new Set();
  const cleanups = [];
  for (const rule of config.css.matchAll(/@font-face\s*\{([^}]+)\}/g)) {
    const name = rule[1].match(/font-family:\s*["']?([^;"']+)/)?.[1]?.trim();
    const source = rule[1].match(/src:\s*(url\([^)]*\))/)?.[1];
    if (!name || !source) continue;
    const key = `${name}:${source}`;
    let cached = fonts.get(key);
    if (!cached) {
      const face = new FontFace(name, source, { weight: "100 900" });
      owner.fonts.add(face);
      void face.load().catch(() => {
      });
      cached = { face, users: 0 };
      fonts.set(key, cached);
    }
    cached.users++;
    cleanups.push(() => {
      const entry = fonts.get(key);
      if (entry && --entry.users === 0) {
        owner.fonts.delete(entry.face);
        fonts.delete(key);
      }
    });
  }
  const ready = [];
  const listeners = [];
  const on = (target2, type, listener, settings) => {
    target2.addEventListener(type, listener, settings);
    listeners.push({ target: target2, type, listener, options: settings });
  };
  const requestFrame = (callback) => {
    if (destroyed) return 0;
    if (owner.hidden || painted && reduced()) {
      deferredFrames.add(callback);
      return 0;
    }
    const id = browser.requestAnimationFrame((time) => {
      frames.delete(id);
      painted = true;
      if (!destroyed) callback(time);
    });
    frames.add(id);
    return id;
  };
  const cancelFrame = (id) => {
    browser.cancelAnimationFrame(id);
    frames.delete(id);
  };
  const timeout = (callback, ms) => {
    const id = browser.setTimeout(() => {
      timeouts.delete(id);
      if (!destroyed) callback();
    }, ms);
    timeouts.add(id);
    return id;
  };
  const interval = (callback, ms) => {
    const id = browser.setInterval(() => {
      if (!destroyed) callback();
    }, ms);
    intervals.add(id);
    return id;
  };
  const clearTimeout = (id) => {
    browser.clearTimeout(id);
    timeouts.delete(id);
  };
  const clearInterval = (id) => {
    browser.clearInterval(id);
    intervals.delete(id);
  };
  const query = (selector) => selector === "body" || selector === "html" ? body : root.querySelector(selector);
  const document2 = new Proxy(owner, {
    get(original, key) {
      if (key === "body" || key === "documentElement") return body;
      if (key === "activeElement") return root.activeElement;
      if (key === "getElementById") return (id) => root.getElementById(id);
      if (key === "querySelector") return query;
      if (key === "querySelectorAll") return (selector) => root.querySelectorAll(selector);
      if (key === "addEventListener") return (type, listener, settings) => {
        if (type === "DOMContentLoaded") ready.push(listener);
        else on(owner, type, listener, settings);
      };
      if (key === "removeEventListener") return owner.removeEventListener.bind(owner);
      const value = Reflect.get(original, key, original);
      return typeof value === "function" ? value.bind(original) : value;
    }
  });
  const reduced = () => options.reducedMotion ?? browser.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const resume = () => {
    if (!owner.hidden && !reduced()) {
      const callbacks = [...deferredFrames];
      deferredFrames.clear();
      callbacks.forEach(requestFrame);
    }
  };
  on(owner, "visibilitychange", resume);
  const matchMedia2 = (query2) => {
    const media = browser.matchMedia(query2);
    return new Proxy(media, { get(original, key) {
      if (key === "matches" && query2.includes("prefers-reduced-motion")) return reduced();
      if (key === "addEventListener") return (type, listener) => on(media, type, listener);
      const value = Reflect.get(original, key, original);
      return typeof value === "function" ? value.bind(original) : value;
    } });
  };
  const window2 = new Proxy(browser, { get(original, key) {
    if (key === "document") return document2;
    if (key === "innerWidth") return frame.offsetWidth;
    if (key === "innerHeight") return config.height;
    if (key === "requestAnimationFrame") return requestFrame;
    if (key === "cancelAnimationFrame") return cancelFrame;
    if (key === "setTimeout") return timeout;
    if (key === "clearTimeout") return clearTimeout;
    if (key === "setInterval") return interval;
    if (key === "clearInterval") return clearInterval;
    if (key === "matchMedia") return matchMedia2;
    if (key === "addEventListener") return (type, listener, settings) => on(browser, type, listener, settings);
    const value = Reflect.get(original, key, original);
    return typeof value === "function" ? value.bind(original) : value;
  } });
  const resize = () => {
    const available = element.clientWidth || config.width;
    scale = config.responsive ? 1 : Math.min(1, available / config.width);
    const height = options.height ?? config.height;
    element.style.setProperty("--motion-height", `${height}px`);
    frame.style.width = `${config.responsive ? available : Math.max(config.width, available)}px`;
    frame.style.height = config.responsive ? "auto" : `${height}px`;
    frame.style.minHeight = config.responsive ? `${height}px` : "0";
    frame.style.transform = `scale(${scale})`;
    body.style.minHeight = `${height}px`;
    element.style.height = config.responsive ? "auto" : `${height * scale}px`;
    element.dataset.reducedMotion = String(reduced());
  };
  const resizeObserver = new browser.ResizeObserver(resize);
  resizeObserver.observe(element);
  resize();
  const TrackedResizeObserver = class extends browser.ResizeObserver {
    constructor(callback) {
      super(callback);
      observers.add(this);
    }
  };
  const TrackedIntersectionObserver = class extends browser.IntersectionObserver {
    constructor(callback, init) {
      super(callback, init);
      observers.add(this);
    }
  };
  const controller = {
    element,
    root,
    update(next) {
      if (destroyed) return;
      options = { ...options, ...next };
      resize();
      resume();
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      frames.forEach((id) => browser.cancelAnimationFrame(id));
      timeouts.forEach((id) => browser.clearTimeout(id));
      intervals.forEach((id) => browser.clearInterval(id));
      resizeObserver.disconnect();
      observers.forEach((observer) => observer.disconnect());
      listeners.forEach(({ target: target2, type, listener, options: options2 }) => target2.removeEventListener(type, listener, options2));
      cleanups.reverse().forEach((cleanup) => cleanup());
      root.querySelectorAll("dialog[open]").forEach((dialog) => dialog.close());
      element.remove();
      frames.clear();
      deferredFrames.clear();
      timeouts.clear();
      intervals.clear();
    }
  };
  return {
    ...controller,
    controller,
    body,
    frame,
    document: document2,
    window: window2,
    on,
    reduced,
    requestAnimationFrame: requestFrame,
    cancelAnimationFrame: cancelFrame,
    setTimeout: timeout,
    clearTimeout,
    setInterval: interval,
    clearInterval,
    ResizeObserver: TrackedResizeObserver,
    IntersectionObserver: TrackedIntersectionObserver,
    matchMedia: matchMedia2,
    addCleanup(cleanup) {
      cleanups.push(cleanup);
    },
    ready() {
      ready.splice(0).forEach((listener) => {
        const event = new Event("DOMContentLoaded");
        if (typeof listener === "function") listener.call(document2, event);
        else listener.handleEvent(event);
      });
    },
    point(event) {
      const rect = frame.getBoundingClientRect();
      return { x: (event.clientX - rect.x) / scale, y: (event.clientY - rect.y) / scale };
    },
    rect(node) {
      const rect = node.getBoundingClientRect();
      const origin = frame.getBoundingClientRect();
      return { x: (rect.x - origin.x) / scale, y: (rect.y - origin.y) / scale, left: (rect.left - origin.left) / scale, top: (rect.top - origin.top) / scale, right: (rect.right - origin.left) / scale, bottom: (rect.bottom - origin.top) / scale, width: rect.width / scale, height: rect.height / scale };
    }
  };
}

// vendor/leibox/soft-action-wheel/SoftActionWheelEngine.js
function mountSoftActionWheel(target, options = {}) {
  const scope = createSurface(target, { "markup": '<main class="radial-menu-demo notranslate" translate="no" data-variant="soft" aria-label="Soft Action Wheel"><div class="rm-stage"><div class="rm-menu" role="menu" id="radial-actions" aria-label="Quick actions" inert><button type="button" class="rm-action" role="menuitem" aria-label="Mail" data-action="mail" tabindex="-1" inert><svg class="rm-icon" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect x="6" y="14" width="88" height="72" rx="24"/><path d="M27 38 50 53 73 38" fill="none" stroke="var(--rm-color)" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/></svg></button><button type="button" class="rm-action" role="menuitem" aria-label="Photos" data-action="photos" tabindex="-1" inert><svg class="rm-icon" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect x="16" y="16" width="68" height="68" rx="16" fill="none" stroke="#000" stroke-width="11"/><circle cx="36" cy="36" r="6.5"/><path d="M18 71 30 55Q35 49 40 55L63 83H20ZM50 52 61 34Q66 27 72 34L82 49V80H73Z"/></svg></button><button type="button" class="rm-action" role="menuitem" aria-label="Notifications" data-action="notifications" tabindex="-1" inert><svg class="rm-icon" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g transform="translate(0 5) scale(1 .9)"><circle cx="50" cy="20" r="8"/><path d="M27 47Q27 24 50 24T73 47V61L80 72Q84 79 75 79H25Q16 79 20 72L27 61Z"/><path d="M38 84H62Q59 95 50 95T38 84Z"/></g></svg></button><button type="button" class="rm-action" role="menuitem" aria-label="Messages" data-action="messages" tabindex="-1" inert><svg class="rm-icon" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M50 6C24 6 6 23 6 46C6 59 11 69 19 76L14 89Q12 94 20 91L36 86Q43 88 50 88C76 88 94 71 94 46C94 22 76 6 50 6Z"/></svg></button><button type="button" class="rm-action" role="menuitem" aria-label="Calendar" data-action="calendar" tabindex="-1" inert><svg class="rm-icon" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect x="14" y="15" width="72" height="70" rx="19" fill="none" stroke="#000" stroke-width="9"/><path d="M17 34V28Q17 17 30 17H70Q83 17 83 28V34Z"/><circle cx="44" cy="44" r="3.8"/><circle cx="56" cy="44" r="3.8"/><circle cx="68" cy="44" r="3.8"/><circle cx="32" cy="56" r="3.8"/><circle cx="44" cy="56" r="3.8"/><circle cx="56" cy="56" r="3.8"/><circle cx="68" cy="56" r="3.8"/><circle cx="32" cy="68" r="3.8"/><circle cx="44" cy="68" r="3.8"/><circle cx="56" cy="68" r="3.8"/></svg></button><button type="button" class="rm-action" role="menuitem" aria-label="Compose" data-action="compose" tabindex="-1" inert><svg class="rm-icon" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g transform="translate(5 5) scale(.9)"><path d="m59 16 6-6Q74 2 82 10L88 16Q96 24 87 33L82 38Z"/><path d="M53 22 76 45 38 83Q35 86 31 86L14 88Q10 88 11 83L13 66Q13 63 16 60Z"/></g></svg></button></div><button type="button" class="rm-toggle" aria-label="Open actions" aria-haspopup="menu" aria-expanded="false" aria-controls="radial-actions"><span class="rm-plus" aria-hidden="true"></span></button></div><span class="rm-status" role="status" aria-live="polite"></span></main>', "css": "", "width": 960, "height": 960, "responsive": false }, options);
  const { document: document2, window: window2, requestAnimationFrame: requestAnimationFrame2, cancelAnimationFrame: cancelAnimationFrame2, setTimeout, clearTimeout, setInterval, clearInterval, ResizeObserver, IntersectionObserver, matchMedia: matchMedia2 } = scope;
  const demo = document2.querySelector(".radial-menu-demo"), stage = demo.querySelector(".rm-stage"), menu = demo.querySelector(".rm-menu"), toggle = demo.querySelector(".rm-toggle"), plus = demo.querySelector(".rm-plus"), status = demo.querySelector(".rm-status");
  const buttons = [...demo.querySelectorAll(".rm-action")], media = window2.matchMedia("(prefers-reduced-motion: reduce)");
  const soft = demo.dataset.variant === "soft";
  const motion = soft ? { from: 450, openStiffness: 204.0625, openDamping: 15.5, closeStiffness: 820, closeDamping: 57, openGap: 0.015, closeGap: 0, fadeOut: 0.15 } : { from: 451, openStiffness: 250, openDamping: 18, closeStiffness: 300, closeDamping: 30, openGap: 0.05, closeGap: 0.025, fadeOut: 0.1 };
  const states = buttons.map(() => ({ position: 0, velocity: 0, opacity: 0, blur: 24, fromOpacity: 0, fromBlur: 24, elapsed: 0, delay: 0 }));
  const rotation = { position: 0, velocity: 0 };
  let opened = false, frame = 0, last = 0, destroyed = false, focusIndex = -1, optionObserver, readyFrame = 0;
  const clamp = (n) => Math.min(1, Math.max(0, n));
  const smooth = (n) => {
    const t = clamp(n);
    return t * t * (3 - 2 * t);
  };
  function draw() {
    states.forEach((state, i) => {
      const angle = (-90 + i * 60) * Math.PI / 180, radius = motion.from - (motion.from - 224) * state.position, button = buttons[i];
      button.style.transform = `translate(${Math.cos(angle) * radius}px,${Math.sin(angle) * radius}px)`;
      button.style.opacity = String(state.opacity);
      button.style.filter = state.blur > 0.01 ? `blur(${state.blur}px)` : "none";
      button.style.visibility = state.opacity > 1e-3 ? "visible" : "hidden";
      button.inert = !opened || state.opacity < 0.95;
      button.style.pointerEvents = button.inert ? "none" : "auto";
      button.dataset.radius = radius.toFixed(3);
      button.dataset.reveal = state.opacity.toFixed(3);
    });
    plus.style.transform = `rotate(${rotation.position * 45}deg)`;
    if (soft) plus.style.opacity = String(1 - 0.4 * clamp(rotation.position));
    demo.dataset.open = String(opened);
    demo.dataset.progress = clamp(rotation.position).toFixed(4);
    if (focusIndex >= 0 && !buttons[focusIndex].inert) {
      const index = focusIndex;
      focusIndex = -1;
      focusAction(index);
    }
  }
  function spring(state, target2, dt, stiffness, damping) {
    state.velocity += ((target2 - state.position) * stiffness - state.velocity * damping) * dt;
    state.position += state.velocity * dt;
    if (Math.abs(state.position - target2) < 1e-4 && Math.abs(state.velocity) < 2e-3) {
      state.position = target2;
      state.velocity = 0;
    }
    return state.position !== target2 || state.velocity !== 0;
  }
  function settle() {
    cancelAnimationFrame2(frame);
    frame = 0;
    last = 0;
    states.forEach((state) => {
      state.position = Number(opened);
      state.velocity = 0;
      state.opacity = Number(opened);
      state.blur = opened ? 0 : 24;
      state.delay = 0;
      state.elapsed = 1;
    });
    rotation.position = Number(opened);
    rotation.velocity = 0;
    draw();
    demo.dataset.moving = "false";
  }
  function tick(time) {
    frame = 0;
    if (destroyed) return;
    if (media.matches) {
      settle();
      return;
    }
    const dt = Math.min(0.032, (time - (last || time - 16)) / 1e3);
    last = time;
    let moving = false;
    states.forEach((state) => {
      state.elapsed += dt;
      const elapsed = state.elapsed - state.delay;
      if (elapsed < 0) {
        moving = true;
        return;
      }
      const activeDt = Math.min(dt, elapsed);
      for (let i = 0; i < 3; i++) moving = spring(state, Number(opened), activeDt / 3, opened ? motion.openStiffness : motion.closeStiffness, opened ? motion.openDamping : motion.closeDamping) || moving;
      state.opacity = state.fromOpacity + (Number(opened) - state.fromOpacity) * smooth(elapsed / (opened ? 0.1 : motion.fadeOut));
      state.blur = state.fromBlur + ((opened ? 0 : 24) - state.fromBlur) * smooth(elapsed / (opened ? 0.15 : 0.13));
      if (elapsed < Math.max(opened ? 0.1 : motion.fadeOut, opened ? 0.15 : 0.13)) moving = true;
    });
    for (let i = 0; i < 3; i++) moving = spring(rotation, Number(opened), dt / 3, opened ? motion.openStiffness : motion.closeStiffness, opened ? motion.openDamping : motion.closeDamping) || moving;
    draw();
    demo.dataset.moving = String(moving);
    if (moving) frame = requestAnimationFrame2(tick);
    else last = 0;
  }
  function wake() {
    if (destroyed) return;
    if (media.matches) {
      settle();
      return;
    }
    demo.dataset.moving = "true";
    if (!frame) frame = requestAnimationFrame2(tick);
  }
  function setOpen(value, focus = -1) {
    if (destroyed) return;
    if (value !== opened) {
      const interrupted = demo.dataset.moving === "true";
      opened = value;
      states.forEach((state, i) => {
        state.delay = interrupted ? 0 : opened ? i * motion.openGap : (5 - i) * motion.closeGap;
        state.elapsed = 0;
        state.fromOpacity = state.opacity;
        state.fromBlur = state.blur;
      });
    }
    focusIndex = value ? focus : -1;
    if (!value && buttons.includes(document2.activeElement)) toggle.focus();
    toggle.setAttribute("aria-expanded", String(value));
    toggle.setAttribute("aria-label", value ? "Close actions" : "Open actions");
    menu.inert = !value;
    buttons.forEach((button, i) => button.tabIndex = value && i === 0 ? 0 : -1);
    draw();
    wake();
  }
  function focusAction(index) {
    buttons.forEach((button, i) => button.tabIndex = i === index ? 0 : -1);
    buttons[index].focus();
  }
  function close() {
    setOpen(false);
    toggle.focus();
  }
  toggle.addEventListener("click", (event) => setOpen(!opened, event.detail === 0 && !opened ? 0 : -1));
  toggle.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown" || event.key === "ArrowRight" || event.key === "ArrowUp" || event.key === "ArrowLeft") {
      event.preventDefault();
      setOpen(true, event.key === "ArrowUp" || event.key === "ArrowLeft" ? 5 : 0);
    } else if (event.key === "Escape" && opened) {
      event.preventDefault();
      close();
    }
  });
  buttons.forEach((button, i) => {
    button.addEventListener("click", () => {
      demo.dataset.action = button.dataset.action;
      status.textContent = button.getAttribute("aria-label") + " selected. Local demonstration.";
      demo.dispatchEvent(new CustomEvent("radial-menu-action", { bubbles: true, composed: true, detail: { action: button.dataset.action } }));
      close();
    });
    button.addEventListener("keydown", (event) => {
      let next = i;
      if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (i + 1) % 6;
      else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (i + 5) % 6;
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = 5;
      else if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      } else return;
      event.preventDefault();
      focusIndex = next;
      draw();
    });
  });
  document2.addEventListener("pointerdown", (event) => {
    const path = event.composedPath();
    if (opened && !path.includes(toggle) && !buttons.some((button) => path.includes(button))) setOpen(false);
  });
  stage.addEventListener("focusout", (event) => {
    if (opened && !stage.contains(event.relatedTarget)) setOpen(false);
  });
  function syncMotion() {
    if (media.matches) settle();
    else wake();
  }
  media.addEventListener("change", syncMotion);
  function resize() {
    const rect = scope.rect(demo);
    stage.style.setProperty("--rm-scale", String(Math.min(rect.width / 960, rect.height / 960)));
    draw();
  }
  const observer = new ResizeObserver(resize);
  observer.observe(demo);
  function dispose2() {
    if (destroyed) return;
    destroyed = true;
    cancelAnimationFrame2(frame);
    cancelAnimationFrame2(readyFrame);
    observer.disconnect();
    optionObserver?.disconnect();
    media.removeEventListener("change", syncMotion);
  }
  if (typeof scope !== "undefined") {
    scope.addCleanup(dispose2);
    optionObserver = new MutationObserver(syncMotion);
    optionObserver.observe(scope.element, { attributes: true, attributeFilter: ["data-reduced-motion"] });
  }
  window2.addEventListener("pagehide", dispose2, { once: true });
  resize();
  draw();
  demo.dataset.moving = "false";
  readyFrame = requestAnimationFrame2(() => {
    if (destroyed) return;
    demo.dataset.motionReady = "true";
    document2.body.dataset.motionReady = "true";
  });
  scope.ready();
  return scope.controller;
}

// vendor/leibox/soft-action-wheel/SoftActionWheel.ts
function mount(target, options = {}) {
  return mountSoftActionWheel(target, options);
}

// src/reading-tools.js
var host = document.querySelector("[data-reading-tools]");
var dispose;
function mountReadingTools() {
  if (!host || dispose) return;
  const component = mount(host);
  const root = component.root;
  const demo = root.querySelector(".radial-menu-demo");
  demo.setAttribute("role", "group");
  demo.setAttribute("aria-label", "\u9605\u8BFB\u5DE5\u5177");
  demo.removeAttribute("translate");
  demo.classList.remove("notranslate");
  root.querySelector(".rm-menu").setAttribute("aria-label", "\u6587\u7AE0\u5FEB\u6377\u64CD\u4F5C");
  root.querySelector(".rm-status").remove();
  const stylesheet = document.createElement("link");
  stylesheet.rel = "stylesheet";
  stylesheet.href = "/assets/reading-tools.css";
  root.append(stylesheet);
  const actions = [
    ["copy", "\u590D\u5236\u94FE\u63A5", "copy"],
    ["top", "\u56DE\u5230\u9876\u90E8", "arrow-up"],
    ["archive", "\u6587\u7AE0\u5F52\u6863", "archive"],
    ["theme", "\u5207\u6362\u914D\u8272", "moon"],
    ["rss", "RSS \u8BA2\u9605", "rss"],
    ["print", "\u6253\u5370\u6587\u7AE0", "print"]
  ];
  root.querySelectorAll(".rm-action").forEach((button, index) => {
    const [action, label, icon] = actions[index];
    button.dataset.action = action;
    button.setAttribute("aria-label", label);
    button.title = label;
    button.innerHTML = `<svg class="rm-icon" aria-hidden="true"><use href="/assets/icons.svg#${icon}"></use></svg><span class="rm-label">${label}</span>`;
  });
  const toggle = root.querySelector(".rm-toggle");
  const caption = document.createElement("span");
  caption.className = "rm-label";
  toggle.append(caption);
  const sync = () => {
    const opened = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-label", opened ? "\u6536\u8D77\u9605\u8BFB\u5DE5\u5177" : "\u5C55\u5F00\u9605\u8BFB\u5DE5\u5177");
    caption.textContent = opened ? "\u6536\u8D77" : "\u5DE5\u5177";
    const dark = document.documentElement.dataset.theme === "dark";
    const theme = root.querySelector('.rm-action[data-action="theme"]');
    theme.setAttribute("aria-label", dark ? "\u5207\u6362\u6D45\u8272\u6A21\u5F0F" : "\u5207\u6362\u6DF1\u8272\u6A21\u5F0F");
    theme.title = theme.getAttribute("aria-label");
    theme.querySelector("use").setAttribute("href", `/assets/icons.svg#${dark ? "sun" : "moon"}`);
  };
  const observer = new MutationObserver(sync);
  observer.observe(toggle, { attributes: true, attributeFilter: ["aria-expanded"] });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  sync();
  let actionFrame;
  const onAction = (event) => {
    switch (event.detail.action) {
      case "copy":
        document.querySelector(".copy-link").click();
        break;
      case "theme":
        document.querySelector(".theme-toggle").click();
        break;
      case "archive":
        location.assign("/archive");
        break;
      case "rss":
        location.assign("/feed.xml");
        break;
      case "top":
        actionFrame = requestAnimationFrame(() => {
          const heading = document.querySelector(".article-heading h1");
          heading.focus({ preventScroll: true });
          heading.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
        });
        break;
      case "print":
        actionFrame = requestAnimationFrame(() => window.print());
        break;
    }
  };
  host.addEventListener("radial-menu-action", onAction);
  host.hidden = false;
  dispose = () => {
    cancelAnimationFrame(actionFrame);
    observer.disconnect();
    host.removeEventListener("radial-menu-action", onAction);
    component.destroy();
    host.hidden = true;
    dispose = void 0;
  };
}
mountReadingTools();
addEventListener("pagehide", () => dispose?.());
addEventListener("pageshow", (event) => {
  if (event.persisted) mountReadingTools();
});
