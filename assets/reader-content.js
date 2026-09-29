(() => {
  document.querySelectorAll('.media-play').forEach(button => {
    button.hidden = false;
    const image = button.closest('figure').querySelector('img');
    let timer;
    function stop() {
      clearTimeout(timer); image.src = button.dataset.poster;
      button.setAttribute('aria-pressed', 'false'); button.textContent = '애니메이션 재생';
    }
    button.addEventListener('click', () => {
      if (button.getAttribute('aria-pressed') === 'true') return stop();
      image.src = button.dataset.animation;
      button.setAttribute('aria-pressed', 'true'); button.textContent = '정지 이미지로 전환';
      timer = setTimeout(stop, 7500);
    });
    document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
  });
  document.querySelectorAll('.learning-examples pre').forEach(pre => {
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'code-copy'; button.textContent = '코드 복사';
    const status = document.createElement('span'); status.className = 'copy-status'; status.setAttribute('role', 'status');
    pre.before(button, status);
    button.addEventListener('click', async () => {
      const text = pre.querySelector('code').textContent;
      try {
        let modernCopied = false;
        if (navigator.clipboard && window.isSecureContext) {
          try { await navigator.clipboard.writeText(text); modernCopied = true; } catch (_) { /* offline permission fallback */ }
        }
        if (!modernCopied) {
          const field = document.createElement('textarea'); field.value = text; field.style.position = 'fixed'; field.style.opacity = '0';
          document.body.append(field); field.select();
          const copied = document.execCommand('copy'); field.remove(); button.focus();
          if (!copied) throw new Error('copy denied');
        }
        status.textContent = '복사됨';
      } catch (_) { status.textContent = '복사가 허용되지 않았습니다. 코드를 선택해 복사하세요.'; }
    });
  });
})();
