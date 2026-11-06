import { showNotice } from './app.js';

async function send(form, submitter, path = form.getAttribute('action')) {
  const body = new URLSearchParams(new FormData(form));
  if (submitter?.name) body.set(submitter.name, submitter.value);
  const response = await fetch(path, { method: 'POST', headers: { Accept: 'application/json' }, body });
  let data;
  try { data = await response.json(); } catch { throw new Error('服务器没有返回有效结果，请稍后重试。'); }
  if (!response.ok) { const error = new Error(data.error || '操作未完成，请重试。'); error.field = data.field; throw error; }
  return data;
}
function feedback(form, message, field = '', focus = false) {
  const node = form.querySelector('.form-feedback') || document.querySelector('[data-list-feedback]');
  if (node) { node.textContent = message; node.classList.remove('is-success'); }
  form.querySelectorAll('[data-field-error]').forEach(el => el.remove());
  form.querySelectorAll('[aria-invalid=true]').forEach(el => {
    el.removeAttribute('aria-invalid');
    const describedBy = (el.getAttribute('aria-describedby') || '').split(' ').filter(id => id && id !== el.dataset.validationMessage);
    if (describedBy.length) el.setAttribute('aria-describedby', describedBy.join(' ')); else el.removeAttribute('aria-describedby');
    delete el.dataset.validationMessage;
  });
  const input = field && form.elements.namedItem(field);
  if (input instanceof HTMLElement && input.getAttribute('type') !== 'hidden') {
    if (input.closest('#write-pane')?.hidden) form.querySelector('[data-editor-tab=write]')?.click();
    for (let parent = input.parentElement; parent && parent !== form; parent = parent.parentElement) if (parent instanceof HTMLDetailsElement) parent.open = true;
    const hint = document.createElement('p'); hint.className = 'field-error'; hint.id = 'validation-' + field; hint.dataset.fieldError = field;
    hint.setAttribute('role', 'alert'); hint.textContent = message; input.after(hint);
    const label = input.closest('label')?.querySelector(':scope > span');
    if (label && !input.hasAttribute('aria-labelledby')) { label.id ||= 'label-' + field; input.setAttribute('aria-labelledby', label.id); }
    input.dataset.validationMessage = hint.id; input.setAttribute('aria-invalid', 'true');
    input.setAttribute('aria-describedby', [input.getAttribute('aria-describedby'), hint.id].filter(Boolean).join(' '));
    if (node) node.textContent = '';
    if (focus) { input.focus(); input.parentElement.scrollIntoView({ block: 'center', behavior: 'instant' }); }
  } else if (focus && node) { node.tabIndex = -1; node.focus(); }
}
function pending(form, value) {
  form.dataset.pending = String(value);
  form.querySelectorAll('button[type=submit]').forEach(button => { button.disabled = value; button.setAttribute('aria-busy', String(value)); });
}

document.querySelector('[data-login]')?.addEventListener('submit', async event => {
  event.preventDefault(); const form = event.currentTarget; if (form.dataset.pending === 'true') return;
  pending(form, true); feedback(form, '正在登录…');
  try { const result = await send(form); location.assign(result.location); }
  catch (error) { feedback(form, error.message, error.field, true); pending(form, false); }
});

document.querySelector('[data-settings]')?.addEventListener('submit', async event => {
  event.preventDefault(); const form = event.currentTarget; if (form.dataset.pending === 'true') return;
  pending(form, true); feedback(form, '正在保存…');
  try {
    const result = await send(form); const node = form.querySelector('.form-feedback'); node.textContent = result.message; node.classList.add('is-success');
  } catch (error) { feedback(form, error.message, error.field, true); }
  finally { pending(form, false); }
});

document.querySelectorAll('[data-row-action]').forEach(form => form.addEventListener('submit', async event => {
  event.preventDefault(); if (form.dataset.pending === 'true') return; pending(form, true);
  try {
    const result = await send(form); const row = form.closest('tr'); const next = row.nextElementSibling?.querySelector('a') || document.querySelector('.admin-heading .button');
    row.remove(); next?.focus(); showNotice(result.message);
    const tbody = document.querySelector('.post-table tbody');
    if (tbody && !tbody.children.length) { const message = document.createElement('p'); message.className = 'empty-admin'; message.textContent = '当前列表没有文章了。'; document.querySelector('.post-table').replaceWith(message); }
  } catch (error) { feedback(form, error.message, '', true); pending(form, false); }
}));

const editor = document.querySelector('[data-editor]');
if (editor) {
  const fields = ['title', 'slug', 'excerpt', 'content', 'category', 'tags', 'cover_url', 'cover_alt', 'featured'];
  const snapshot = () => Object.fromEntries(fields.map(name => [name, name === 'featured' ? editor.elements[name].checked : editor.elements[name].value]));
  let dirty = false, backupTimer, previewController, previewSequence = 0;
  let key = 'blog-draft:' + (editor.elements.id.value || 'new');
  const state = document.querySelector('[data-save-state]');
  function backup() {
    if (!dirty) return;
    try { sessionStorage.setItem(key, JSON.stringify({ version: editor.elements.version.value, fields: snapshot() })); } catch {}
  }
  function changed() {
    dirty = true; state.textContent = '有未保存的修改'; clearTimeout(backupTimer); backupTimer = setTimeout(backup, 400);
  }
  editor.addEventListener('input', changed); editor.addEventListener('change', changed);
  let stored;
  try { stored = JSON.parse(sessionStorage.getItem(key)); } catch {}
  if (stored?.fields) {
    const bar = document.querySelector('.draft-recovery'); bar.hidden = false;
    const old = stored.version !== editor.elements.version.value;
    const restore = bar.querySelector('[data-restore-draft]');
    if (old) {
      bar.querySelector('p').textContent = '发现旧版本本地草稿，请与当前内容对照。'; restore.textContent = '复制旧草稿';
      const details = document.createElement('details'), summary = document.createElement('summary'), text = document.createElement('textarea');
      summary.textContent = '查看草稿正文'; text.value = stored.fields.content || ''; text.readOnly = true; text.setAttribute('aria-label', '旧草稿正文'); details.append(summary, text); bar.append(details);
    }
    restore.addEventListener('click', async () => {
      if (old) { try { await navigator.clipboard.writeText(stored.fields.content || ''); showNotice('旧草稿已复制，可与当前内容合并。'); } catch { showNotice('复制失败，请展开旧草稿手动复制。'); } return; }
      for (const name of fields) { if (name === 'featured') editor.elements[name].checked = Boolean(stored.fields[name]); else editor.elements[name].value = stored.fields[name] || ''; }
      bar.hidden = true; changed();
    });
    bar.querySelector('[data-dismiss-draft]').addEventListener('click', () => { bar.hidden = true; try { sessionStorage.removeItem(key); } catch {} });
  }
  editor.addEventListener('submit', async event => {
    event.preventDefault(); if (editor.dataset.pending === 'true') return;
    const submitted = snapshot(), oldKey = key;
    pending(editor, true); state.textContent = '正在保存…'; feedback(editor, ''); backup();
    try {
      const result = await send(editor, event.submitter);
      dirty = JSON.stringify(snapshot()) !== JSON.stringify(submitted);
      editor.elements.id.value = result.post.id; editor.elements.version.value = result.post.version; editor.elements.status.value = result.post.status;
      if (!editor.elements.slug.value) editor.elements.slug.value = result.post.slug;
      key = 'blog-draft:' + result.post.id;
      try { sessionStorage.removeItem(oldKey); } catch {}
      if (dirty) backup(); else try { sessionStorage.removeItem(key); } catch {}
      history.replaceState(null, '', result.location);
      state.textContent = (result.post.status === 'published' ? '文章已发布' : '草稿已保存') + (dirty ? '，还有新的修改未保存' : '');
      const published = result.post.status === 'published';
      const save = editor.querySelector('[data-save-action]'), publication = editor.querySelector('[data-publication-action]');
      save.textContent = published ? '更新文章' : '保存草稿'; save.classList.toggle('button-quiet', !published);
      publication.value = published ? 'draft' : 'publish'; publication.textContent = published ? '撤回为草稿' : '发布文章'; publication.classList.toggle('button-quiet', published);
    } catch (error) { dirty = true; backup(); feedback(editor, error.message, error.field, true); state.textContent = '保存未完成'; }
    finally { pending(editor, false); }
  });
  const tabs = [...document.querySelectorAll('[data-editor-tab]')];
  async function switchTab(mode) {
    const sequence = ++previewSequence; previewController?.abort();
    tabs.forEach(tab => { const active = tab.dataset.editorTab === mode; tab.setAttribute('aria-selected', String(active)); tab.tabIndex = active ? 0 : -1; });
    document.querySelector('#write-pane').hidden = mode !== 'write';
    const preview = document.querySelector('#preview-pane'); preview.hidden = mode !== 'preview';
    if (mode !== 'preview') return;
    preview.textContent = '正在生成预览…'; previewController = new AbortController();
    try {
      const response = await fetch('/admin/preview', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-CSRF-Token': editor.elements.csrf.value },
        body: JSON.stringify({ content: editor.elements.content.value }), signal: previewController.signal });
      const data = await response.json(); if (!response.ok) throw new Error(data.error || '预览未能生成。');
      if (sequence === previewSequence) preview.innerHTML = data.html || '<p>正文还是空的，回到 Markdown 开始写吧。</p>';
    } catch (error) { if (error.name !== 'AbortError' && sequence === previewSequence) preview.textContent = error.message; }
  }
  tabs.forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.editorTab));
    tab.addEventListener('keydown', event => { if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); const next = tabs.find(item => item !== tab); next.focus(); next.click(); } });
  });
  const initialError = editor.querySelector('.form-feedback');
  if (initialError?.textContent && initialError.dataset.errorField) feedback(editor, initialError.textContent, initialError.dataset.errorField, true);
  addEventListener('beforeunload', event => { if (dirty) { backup(); event.preventDefault(); event.returnValue = ''; } });
  addEventListener('pagehide', () => { clearTimeout(backupTimer); backup(); previewController?.abort(); });
}
