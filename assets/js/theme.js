(() => {
  const button = document.querySelector('#theme-toggle');
  if (!button) return;

  const root = document.documentElement;
  const sync = () => {
    const dark = root.dataset.theme === 'dark';
    button.setAttribute('aria-label', dark ? '라이트 모드로 전환' : '다크 모드로 전환');
    button.setAttribute('aria-pressed', String(dark));
  };

  button.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try {
      localStorage.setItem('theme', next);
    } catch (error) {
      /* 저장이 막힌 환경에서는 이번 방문에만 적용한다. */
    }
    sync();
  });

  sync();
})();
