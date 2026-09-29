/* Local syntax presentation only. Never parse example text as live HTML. */
(() => {
  'use strict';
  const names = {python: 'Python', c: 'C', http: 'HTTP', markup: 'HTML', text: '일반 텍스트'};
  function append(parent, tokens) {
    for (const token of (Array.isArray(tokens) ? tokens : [tokens])) {
      if (typeof token === 'string') parent.appendChild(document.createTextNode(token));
      else {
        const span = document.createElement('span');
        span.classList.add('token', token.type);
        for (const alias of [].concat(token.alias || [])) span.classList.add(alias);
        append(span, token.content); parent.appendChild(span);
      }
    }
  }
  function render(text, lang) {
    const out = document.createDocumentFragment();
    // HTTP MIME bodies are a different language, not HTTP header tokens.
    const split = lang === 'http' ? /\r?\n\r?\n/.exec(text) : null;
    if (split && /^Content-Type:\s*text\/html\b/im.test(text.slice(0, split.index))) {
      append(out, Prism.tokenize(text.slice(0, split.index), Prism.languages.http));
      out.appendChild(document.createTextNode(split[0]));
      append(out, Prism.tokenize(text.slice(split.index + split[0].length), Prism.languages.markup));
    } else append(out, lang === 'text' ? text : Prism.tokenize(text, Prism.languages[lang]));
    return out;
  }
  function highlight(code) {
    const text = code.textContent;
    const declared = /\blanguage-([\w-]+)/.exec(code.className);
    const lang = declared ? declared[1] : /^(?:HTTP\/\d|(?:GET|POST|PUT|DELETE|HEAD|OPTIONS|PATCH)\s)/.test(text) ? 'http' : 'text';
    if (!names[lang]) return; // No speculative language detection.
    const fragment = render(text, lang);
    if (fragment.textContent !== text) throw new Error('Syntax text preservation failed');
    code.replaceChildren(fragment);
    code.dataset.syntaxLanguage = lang;
    code.parentElement.dataset.codeLanguage = names[lang];
    code.parentElement.classList.add('syntax-block');
  }
  document.addEventListener('DOMContentLoaded', () => document.querySelectorAll('pre > code').forEach(highlight));
})();
