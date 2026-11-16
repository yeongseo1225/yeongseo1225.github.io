(() => {
  const root = document.documentElement;
  const sidebar = document.querySelector('#sidebar');
  const toggle = document.querySelector('#sidebar-toggle');
  const close = document.querySelector('#sidebar-close');
  const scrim = document.querySelector('#sidebar-scrim');
  if (!sidebar || !toggle) return;

  const narrow = window.matchMedia('(max-width: 900px)');

  function syncToggle() {
    if (narrow.matches) {
      const open = root.dataset.drawer === 'open';
      toggle.setAttribute('aria-label', open ? '카테고리 닫기' : '카테고리 열기');
      toggle.setAttribute('aria-expanded', String(open));
    } else {
      const open = root.dataset.sidebar === 'open';
      toggle.setAttribute('aria-label', open ? '카테고리 접기' : '카테고리 펼치기');
      toggle.setAttribute('aria-expanded', String(open));
    }
  }

  // 좁은 화면: 왼쪽에서 밀려 나오는 서랍
  function setDrawer(open) {
    if (open) {
      root.dataset.drawer = 'open';
      close?.focus({ preventScroll: true });
    } else if (root.dataset.drawer === 'open') {
      delete root.dataset.drawer;
      toggle.focus({ preventScroll: true });
    }
    syncToggle();
  }

  // 넓은 화면(글 상세): 글을 열면 항상 접힌 상태이고, 버튼으로 이 글에서만 펼친다.
  function setCollapsed(collapsed) {
    root.dataset.sidebar = collapsed ? 'collapsed' : 'open';
    syncToggle();
  }

  toggle.addEventListener('click', () => {
    if (narrow.matches) setDrawer(root.dataset.drawer !== 'open');
    else setCollapsed(root.dataset.sidebar === 'open');
  });

  close?.addEventListener('click', () => setDrawer(false));
  scrim?.addEventListener('click', () => setDrawer(false));

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && root.dataset.drawer === 'open') setDrawer(false);
  });

  // 카테고리 페이지에서는 링크가 새로 고침 없이 목록만 바꾸므로 서랍을 직접 닫는다.
  sidebar.addEventListener('click', (event) => {
    if (narrow.matches && event.target.closest('a')) {
      delete root.dataset.drawer;
      syncToggle();
    }
  });

  narrow.addEventListener('change', () => {
    delete root.dataset.drawer;
    syncToggle();
  });

  syncToggle();
})();
