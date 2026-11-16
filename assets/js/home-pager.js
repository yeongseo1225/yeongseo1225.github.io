(() => {
  const list = document.querySelector('.home-post-list');
  if (!list) return;

  const cards = Array.from(list.querySelectorAll(':scope > .post-card'));
  const size = 6;
  const pageCount = Math.ceil(cards.length / size);
  if (pageCount <= 1) return;

  const params = new URLSearchParams(window.location.search);
  let page = Math.min(Math.max(parseInt(params.get('page'), 10) || 1, 1), pageCount) - 1;

  const nav = document.createElement('nav');
  nav.className = 'post-pager home-pager';
  nav.setAttribute('aria-label', '글 목록 페이지');
  list.after(nav);

  const makeButton = (label, text, onClick) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'post-pager-btn';
    button.setAttribute('aria-label', label);
    button.textContent = text;
    button.addEventListener('click', onClick);
    return button;
  };

  function go(next, scroll) {
    page = next;
    render();
    const url = new URL(window.location.href);
    if (page === 0) url.searchParams.delete('page');
    else url.searchParams.set('page', String(page + 1));
    history.replaceState(null, '', url);
    if (scroll) window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function render() {
    cards.forEach((card, index) => {
      card.hidden = Math.floor(index / size) !== page;
    });

    nav.replaceChildren();
    const prev = makeButton('이전 페이지', '‹', () => go(page - 1, true));
    prev.disabled = page === 0;
    nav.append(prev);

    for (let i = 0; i < pageCount; i += 1) {
      const button = makeButton(`${i + 1}페이지`, String(i + 1), () => go(i, true));
      if (i === page) {
        button.classList.add('is-active');
        button.setAttribute('aria-current', 'page');
      }
      nav.append(button);
    }

    const next = makeButton('다음 페이지', '›', () => go(page + 1, true));
    next.disabled = page === pageCount - 1;
    nav.append(next);
  }

  render();
})();
