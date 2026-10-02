/* Independent progressive enhancement; no source heading, ID or prose rewrite. */
(() => {
  'use strict';
  const main = document.querySelector('body.article-page main:has(#references)');
  if (!main || main.dataset.sectionUi) return;
  main.dataset.sectionUi = '1';
  const headings = [...main.querySelectorAll('h2, h3')];
  const entries = new Map();
  const shells = new Map();
  headings.forEach(h => {
    const parent = h.parentElement;
    if (!shells.has(parent)) shells.set(parent, h);
    parent.classList.add('section-ui-shell');
  });
  // Work from leaves backwards. Stop before sibling wrappers containing a peer
  // heading: a bare H3 followed by SECTION>H3 must not absorb its peer.
  [...headings].reverse().forEach((h, i) => {
    const rank = Number(h.tagName[1]);
    const panel = document.createElement('div');
    panel.className = 'section-ui-panel';
    let id = `section-ui-panel-${i}`;
    while (document.getElementById(id)) id += '-x';
    panel.id = id;
    let next = h.nextSibling;
    const peers = rank === 2 ? 'h2' : 'h2, h3';
    while (next) {
      if (next.nodeType === 1 && (next.matches(peers) || next.querySelector(peers))) break;
      const following = next.nextSibling;
      panel.append(next);
      next = following;
    }
    h.after(panel);
    if (rank === 3 && !next) {
      const preceding = headings.slice(0, headings.indexOf(h)).reverse().find(x => x.tagName === 'H2');
      const owner = preceding?.parentElement;
      // A subsection can continue beyond a DIV/SECTION boundary. Move only
      // following whole nodes up to the next peer; do not split/clone ID owners.
      if (owner?.contains(h)) {
        let branch = h.parentElement;
        let boundary = false;
        while (branch !== owner && !boundary) {
          let tail = branch.nextSibling;
          while (tail) {
            if (tail.nodeType === 1 && (tail.matches(peers) || tail.querySelector(peers))) { boundary = true; break; }
            const following = tail.nextSibling;
            panel.append(tail);
            tail = following;
          }
          branch = branch.parentElement;
        }
      }
    }
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'section-ui-toggle';
    button.setAttribute('aria-expanded', 'true');
    button.setAttribute('aria-controls', id);
    // Move, never clone: existing heading IDs and any inline nodes survive.
    const label = document.createElement('span');
    label.className = 'section-ui-label';
    while (h.firstChild) label.append(h.firstChild);
    const first = label.firstChild;
    const match = first?.nodeType === 3 && first.textContent.match(/^\d+(?:\.\d+)*\.?\s+/);
    if (match) {
      const number = document.createElement('span');
      number.className = 'section-ui-number';
      number.textContent = match[0];
      first.textContent = first.textContent.slice(match[0].length);
      label.prepend(number);
    }
    button.append(label);
    h.append(button);
    const entry = {h, button, panel};
    entries.set(h, entry);
    button.addEventListener('click', () => setOpen(entry, panel.hidden));
  });
  // H2 owns all its original section children, including subheading containers.
  // The reverse leaf pass stopped at H3 only for H3, not for H2.
  function setOpen(entry, open) {
    entry.panel.hidden = !open;
    entry.button.setAttribute('aria-expanded', String(open));
  }
  function reveal(hash, scroll = false) {
    let id;
    try { id = decodeURIComponent(hash.replace(/^#/, '')); } catch { return; }
    const target = document.getElementById(id);
    if (!target) return;
    for (const entry of entries.values()) {
      if (entry.panel.contains(target) || entry.h === target || shells.get(target) === entry.h)
        setOpen(entry, true);
    }
    if (scroll) requestAnimationFrame(() => target.scrollIntoView({block: 'start'}));
  }
  document.addEventListener('click', event => {
    const a = event.target.closest('a[href]');
    if (!a) return;
    const url = new URL(a.href, location.href);
    if (url.origin === location.origin && url.pathname === location.pathname && url.hash)
      reveal(url.hash);
  }, true);
  addEventListener('hashchange', () => reveal(location.hash, true));
  reveal(location.hash, true);
  let printState;
  addEventListener('beforeprint', () => {
    printState = [...entries.values()].map(e => [e, !e.panel.hidden]);
    printState.forEach(([e]) => setOpen(e, true));
  });
  addEventListener('afterprint', () => {
    if (printState) printState.forEach(([e, open]) => setOpen(e, open));
    printState = null;
  });
  // Deliberate per-table opt-in. Four-column taxonomies and key-reference data
  // are not forced into three columns; original captions and header text remain.
  const equalCaptions = new Set([
    '시간은 T0에서 T1로 진행한다',
    '예약 기능에서 대안을 비교하는 질문',
    '요구가 달라졌을 때 남는 수정과 새로 생기는 책임'
  ]);
  for (const table of main.querySelectorAll('table')) {
    if (equalCaptions.has(table.caption?.textContent.trim())) table.classList.add('section-ui-comparison');
  }
})();
