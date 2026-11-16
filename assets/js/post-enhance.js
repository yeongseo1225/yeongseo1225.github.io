(() => {
  // 코드 블록에 언어 라벨과 복사 버튼을 붙인다.
  function enhanceCodeBlocks(content) {
    content.querySelectorAll('pre').forEach((pre) => {
      if (pre.closest('.code-block')) return;

      const languageBox = pre.closest('[class*="language-"]');
      const target = languageBox || pre;
      const language =
        Array.from(languageBox?.classList || [])
          .find((name) => name.startsWith('language-'))
          ?.slice('language-'.length) || '';

      const wrapper = document.createElement('div');
      wrapper.className = 'code-block';

      const header = document.createElement('div');
      header.className = 'code-block-header';

      const label = document.createElement('span');
      label.textContent = language && language !== 'plaintext' ? language : 'code';

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'code-block-copy';
      button.textContent = '복사';
      button.addEventListener('click', async () => {
        const text = (pre.querySelector('code') || pre).textContent.replace(/\n$/, '');
        try {
          await navigator.clipboard.writeText(text);
          button.textContent = '복사됨';
        } catch (error) {
          button.textContent = '복사 실패';
        }
        setTimeout(() => {
          button.textContent = '복사';
        }, 1500);
      });

      header.append(label, button);
      target.replaceWith(wrapper);
      wrapper.append(header, target);
    });
  }

  // 글을 얼마나 읽었는지 화면 맨 위 얇은 막대로 보여준다.
  function trackProgress() {
    const bar = document.querySelector('#read-progress-bar');
    if (!bar) return;

    const update = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = scrollable > 0 ? Math.min(1, window.scrollY / scrollable) : 0;
      bar.style.transform = `scaleX(${ratio})`;
    };

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  // 글 아래 목록: 홈(최신 글)에서 들어왔으면 최신순 전체 글,
  // 그 밖에는 같은 카테고리의 글을 보여준다.
  function showRelatedPosts() {
    const section = document.querySelector('#post-related');
    if (!section) return;

    const groups = {
      category: section.querySelector('[data-mode="category"]'),
      latest: section.querySelector('[data-mode="latest"]'),
    };

    const key = 'postListSource';
    let mode = 'category';
    try {
      const referrer = document.referrer ? new URL(document.referrer) : null;
      const sameSite = referrer?.origin === window.location.origin;
      const fromPath = sameSite ? referrer.pathname.replace(/index\.html$/, '') : null;
      const homePath = new URL(
        document.querySelector('.site-title')?.getAttribute('href') || '/',
        window.location.href,
      ).pathname;

      if (fromPath === homePath) {
        mode = 'latest';
      } else if (
        sameSite &&
        Array.from(groups.latest.querySelectorAll('a')).some((link) => link.pathname === fromPath)
      ) {
        // 다른 글에서 넘어온 경우에는 처음 들어온 경로를 그대로 따른다.
        mode = sessionStorage.getItem(key) || 'category';
      }
      sessionStorage.setItem(key, mode);
    } catch (error) {
      mode = 'category';
    }

    if (!groups[mode]) mode = groups.category ? 'category' : 'latest';

    Object.entries(groups).forEach(([name, group]) => {
      if (group) group.hidden = name !== mode;
    });

    // 목록이 길면 다섯 개씩 페이지로 나누고, 지금 글이 있는 페이지부터 보여준다.
    const items = Array.from(groups[mode].querySelectorAll('li'));
    const size = 5;
    const pageCount = Math.ceil(items.length / size);
    if (pageCount <= 1) return;

    const currentIndex = Math.max(0, items.findIndex((item) => item.classList.contains('is-current')));
    let page = Math.floor(currentIndex / size);

    const nav = document.createElement('nav');
    nav.className = 'post-pager';
    nav.setAttribute('aria-label', '글 목록 페이지');
    groups[mode].append(nav);

    const makeButton = (label, text, onClick) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'post-pager-btn';
      button.setAttribute('aria-label', label);
      button.textContent = text;
      button.addEventListener('click', onClick);
      return button;
    };

    function render() {
      items.forEach((item, index) => {
        item.hidden = Math.floor(index / size) !== page;
      });

      nav.replaceChildren();
      const prev = makeButton('이전 페이지', '‹', () => { page -= 1; render(); });
      prev.disabled = page === 0;
      nav.append(prev);

      for (let i = 0; i < pageCount; i += 1) {
        const button = makeButton(`${i + 1}페이지`, String(i + 1), () => { page = i; render(); });
        if (i === page) {
          button.classList.add('is-active');
          button.setAttribute('aria-current', 'page');
        }
        nav.append(button);
      }

      const next = makeButton('다음 페이지', '›', () => { page += 1; render(); });
      next.disabled = page === pageCount - 1;
      nav.append(next);
    }

    render();
  }

  function init() {
    const content = document.querySelector('.post-content');
    if (content) enhanceCodeBlocks(content);
    trackProgress();
    showRelatedPosts();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
