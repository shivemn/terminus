/**
 * Turns a long <select> into a picker you can type into. The select stays in
 * the form as the real value (so the form still works without JavaScript and
 * FormData still reads it); this draws a button and a searchable list over it
 * and keeps the two in step.
 */

const norm = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '');

let count = 0;

export function enhanceSelect(select: HTMLSelectElement, opts: { search: string; labelId: string }) {
  const id = `picker-${++count}`;
  const placeholder = select.querySelector<HTMLOptionElement>('option[disabled]')?.textContent ?? '';

  const wrap = document.createElement('div');
  wrap.className = 'picker';

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'picker-button';
  button.id = `${id}-button`;
  button.setAttribute('aria-haspopup', 'listbox');
  button.setAttribute('aria-expanded', 'false');
  button.setAttribute('aria-labelledby', `${opts.labelId} ${id}-button`);
  const value = document.createElement('span');
  value.className = 'picker-value';
  button.append(value);

  const pop = document.createElement('div');
  pop.className = 'picker-pop';
  pop.hidden = true;
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'picker-search';
  input.placeholder = opts.search;
  input.autocomplete = 'off';
  input.spellcheck = false;
  input.setAttribute('role', 'combobox');
  input.setAttribute('aria-expanded', 'true');
  input.setAttribute('aria-controls', `${id}-list`);
  input.setAttribute('aria-autocomplete', 'list');
  input.setAttribute('aria-label', opts.search);
  const list = document.createElement('ul');
  list.className = 'picker-list';
  list.id = `${id}-list`;
  list.setAttribute('role', 'listbox');
  const empty = document.createElement('p');
  empty.className = 'picker-empty';
  empty.hidden = true;
  pop.append(input, list, empty);

  // One row per option, under its group's name.
  type Row = { li: HTMLLIElement; value: string; title: string; text: string; head: HTMLLIElement; at: number };
  const rows: Row[] = [];
  const heads: HTMLLIElement[] = [];
  for (const group of select.querySelectorAll('optgroup')) {
    const head = document.createElement('li');
    head.className = 'picker-group';
    head.setAttribute('role', 'presentation');
    head.textContent = group.label;
    list.append(head);
    heads.push(head);
    for (const o of group.querySelectorAll('option')) {
      const li = document.createElement('li');
      li.id = `${id}-${rows.length}`;
      li.className = 'picker-option';
      li.setAttribute('role', 'option');
      li.textContent = o.textContent;
      li.dataset.value = o.value;
      list.append(li);
      rows.push({ li, value: o.value, title: norm(o.textContent ?? ''), text: norm(`${o.textContent} ${group.label}`), head, at: rows.length });
    }
  }

  select.classList.add('picker-native');
  select.tabIndex = -1;
  select.setAttribute('aria-hidden', 'true');
  select.after(wrap);
  wrap.append(button, pop);

  let shown: Row[] = rows;
  let active = -1;

  const sync = () => {
    const o = select.selectedOptions[0];
    const picked = !!select.value && !!o;
    value.textContent = picked ? o!.textContent : placeholder;
    button.classList.toggle('is-empty', !picked);
    for (const r of rows) r.li.setAttribute('aria-selected', String(r.value === select.value));
  };

  const setActive = (i: number) => {
    if (shown.length === 0) {
      active = -1;
      input.removeAttribute('aria-activedescendant');
      return;
    }
    active = (i + shown.length) % shown.length;
    shown.forEach((r, j) => r.li.classList.toggle('is-active', j === active));
    const li = shown[active]!.li;
    input.setAttribute('aria-activedescendant', li.id);
    li.scrollIntoView({ block: 'nearest' });
  };

  /** Best first: the title starts with what you typed, then every word starts a word in the title, then anywhere. */
  const score = (r: Row, q: string, words: string[]) => {
    if (r.title.startsWith(q)) return 4;
    const starts = r.title.split(/[\s/(),-]+/);
    if (words.every((w) => starts.some((t) => t.startsWith(w)))) return 3;
    if (words.every((w) => r.title.includes(w))) return 2;
    return 1;
  };
  const filter = () => {
    const q = norm(input.value).trim();
    const words = q.split(/\s+/).filter(Boolean);
    const scored: Array<{ r: Row; s: number }> = [];
    for (const r of rows) {
      const hit = words.every((w) => r.text.includes(w));
      r.li.hidden = !hit;
      r.li.classList.remove('is-active');
      if (hit) scored.push({ r, s: words.length ? score(r, q, words) : 0 });
    }
    // While typing, the list is one ranked list; with nothing typed, it's grouped.
    if (words.length) scored.sort((a, b) => b.s - a.s || a.r.at - b.r.at);
    shown = scored.map((x) => x.r);
    list.classList.toggle('is-ranked', words.length > 0);
    shown.forEach((r, i) => { r.li.style.order = words.length ? String(i) : ''; });
    const live = new Set(shown.map((r) => r.head));
    for (const h of heads) h.hidden = words.length > 0 || !live.has(h);
    empty.hidden = shown.length > 0;
    empty.textContent = `Nothing matches "${input.value.trim()}". Try a shorter word.`;
    const at = shown.findIndex((r) => r.value === select.value);
    setActive(words.length === 0 && at >= 0 ? at : 0);
  };

  const open = () => {
    if (!pop.hidden) return;
    document.dispatchEvent(new CustomEvent('picker:open', { detail: wrap }));
    pop.hidden = false;
    wrap.classList.add('is-open');
    button.setAttribute('aria-expanded', 'true');
    input.value = '';
    filter();
    input.focus();
  };
  const close = (focusButton = false) => {
    if (pop.hidden) return;
    pop.hidden = true;
    wrap.classList.remove('is-open');
    button.setAttribute('aria-expanded', 'false');
    if (focusButton) button.focus();
  };
  const choose = (r: Row | undefined) => {
    if (!r) return;
    select.value = r.value;
    select.dispatchEvent(new Event('change', { bubbles: true }));
    sync();
    close(true);
    wrap.classList.remove('just-picked');
    void wrap.offsetWidth;
    wrap.classList.add('just-picked');
  };

  button.addEventListener('click', () => (pop.hidden ? open() : close()));
  input.addEventListener('input', filter);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(active + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(active - 1); }
    else if (e.key === 'Enter') { e.preventDefault(); choose(shown[active]); }
    else if (e.key === 'Escape') { e.preventDefault(); close(true); }
    else if (e.key === 'Tab') close();
  });
  list.addEventListener('mousedown', (e) => e.preventDefault()); // keep focus in the search box
  list.addEventListener('click', (e) => {
    const li = (e.target as HTMLElement).closest<HTMLLIElement>('.picker-option');
    if (li) choose(rows.find((r) => r.li === li));
  });
  list.addEventListener('mousemove', (e) => {
    const li = (e.target as HTMLElement).closest<HTMLLIElement>('.picker-option');
    const i = li ? shown.findIndex((r) => r.li === li) : -1;
    if (i >= 0 && i !== active) {
      shown.forEach((r, j) => r.li.classList.toggle('is-active', j === i));
      active = i;
      input.setAttribute('aria-activedescendant', li!.id);
    }
  });
  document.addEventListener('click', (e) => { if (!wrap.contains(e.target as Node)) close(); });
  document.addEventListener('picker:open', (e) => { if ((e as CustomEvent).detail !== wrap) close(); });
  select.addEventListener('change', sync);
  sync();

  return { open, button };
}
