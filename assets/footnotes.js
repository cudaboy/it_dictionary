
(() => {
  const popup = document.getElementById('footnote-preview');
  const content = document.getElementById('footnote-preview-content');
  const label = document.getElementById('footnote-preview-label');
  let active = null, timer, restoringFocus = false;
  if (!popup || !content || !label) return;
  function hide() {
    clearTimeout(timer);
    if (active) active.setAttribute('aria-expanded', 'false');
    popup.hidden = true;
    active = null;
  }
  function position() {
    if (!active || popup.hidden) return;
    const r = active.getBoundingClientRect();
    const p = popup.getBoundingClientRect();
    const x = Math.max(12, Math.min(r.left, innerWidth - p.width - 12));
    let y = r.bottom + 8;
    if (y + p.height > innerHeight - 12) y = r.top - p.height - 8;
    popup.style.left = x + 'px';
    popup.style.top = Math.max(12, Math.min(y, innerHeight - p.height - 12)) + 'px';
  }
  function show(link) {
    clearTimeout(timer);
    const ref = document.getElementById(link.hash.slice(1));
    if (!ref) return;
    if (active && active !== link) active.setAttribute('aria-expanded', 'false');
    active = link;
    label.textContent = '각주 ' + link.textContent;
    content.replaceChildren(...Array.from(ref.childNodes, n => n.cloneNode(true)));
    // Backlinks belong to the original note, not its hover/focus preview.
    // Only remove local citation-return links; retain all source links.
    content.querySelectorAll('a[href^="#"]').forEach(n => {
      const target = document.getElementById(n.hash.slice(1));
      if ((target && target.closest('sup')) ||
          /돌아가기/.test(n.getAttribute('aria-label') || n.textContent)) n.remove();
    });
    content.querySelectorAll('[id]').forEach(n => n.removeAttribute('id'));
    popup.hidden = false;
    link.setAttribute('aria-expanded', 'true');
    position();
  }
  function deferHide() {
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (!popup.matches(':hover') && !popup.contains(document.activeElement) &&
          !(active && (active.matches(':hover') || active === document.activeElement))) hide();
    }, 180);
  }
  document.querySelectorAll('main a[href^="#"][href*="-ref-"], sup a[href^="#ref"], sup a[href^="#legacy-"][href*="-ref"], sup a[data-footnote], .learning-examples sup a[href^="#learning-"], article[data-article-id="requirements_models"] a[href="#rm-ref-management"], article[data-article-id="requirements_models"] a[href="#rm-ref-nasa"], article[data-article-id="requirements_models"] a[href="#rm-ref-uml"], article[data-article-id="ui_design"] a[href="#ui-ref-forms"], article[data-article-id="ui_design"] a[href="#ui-ref-kansei"], article[data-article-id="ui_design"] a[href="#ui-ref-prototype"], article[data-article-id="ui_design"] a[href="#ui-ref-usability"], article[data-article-id="ui_design"] a[href="#ui-ref-wcag"], main#main > section a[href="#ds-ref-array"], main#main > section a[href="#ds-ref-bisect"], main#main > section a[href="#ds-ref-deque"], main#main > section a[href="#ds-ref-linked"], main#main > section a[href="#ds-ref-python"], main#main > section a[href="#ds-ref-sort"], main#main > section a[href="#pf-ref-appetite"], main#main > section a[href="#pf-ref-c-standard"], main#main > section a[href="#pf-ref-flow"], main#main > section a[href="#pf-ref-intro"], main#main > section a[href="#pf-ref-lifetime"], main#main > section a[href="#pf-ref-prototype"], main#main > section a[href="#pf-ref-statistics"], main#main > section a[href="#pf-ref-struct"]').forEach(link => {
    link.setAttribute('aria-haspopup', 'dialog');
    link.setAttribute('aria-controls', popup.id);
    link.setAttribute('aria-expanded', 'false');
    link.addEventListener('mouseenter', () => show(link));
    link.addEventListener('mouseleave', deferHide);
    link.addEventListener('focus', () => { if (!restoringFocus) show(link); });
    link.addEventListener('blur', deferHide);
    let openedOnTouch = false;
    link.addEventListener('pointerdown', e => {
      openedOnTouch = e.pointerType === 'touch' && (active !== link || popup.hidden);
    });
    link.addEventListener('click', e => {
      if (openedOnTouch) { e.preventDefault(); show(link); openedOnTouch = false; }
      else hide();
    });
    link.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown' && !popup.hidden) {
        e.preventDefault(); popup.querySelector('button').focus();
      }
    });
  });
  popup.addEventListener('mouseenter', () => clearTimeout(timer));
  popup.addEventListener('mouseleave', deferHide);
  popup.addEventListener('focusin', () => clearTimeout(timer));
  popup.addEventListener('focusout', deferHide);
  function dismiss() {
    const previous = active;
    if (previous && popup.contains(document.activeElement)) {
      restoringFocus = true;
      previous.focus({preventScroll:true});
      restoringFocus = false;
    }
    hide();
  }
  popup.querySelector('button').addEventListener('click', dismiss);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') dismiss(); });
  document.addEventListener('pointerdown', e => {
    if (!popup.contains(e.target) && !(active && active.contains(e.target))) hide();
  });
  window.addEventListener('resize', position);
  window.addEventListener('scroll', position, {passive:true});
})();
