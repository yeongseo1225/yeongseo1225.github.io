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

    // 목록이 길면 지금 글 앞뒤로 다섯 개만 남긴다.
    const items = Array.from(groups[mode].querySelectorAll('li'));
    const size = 5;
    if (items.length > size) {
      const current = Math.max(0, items.findIndex((item) => item.classList.contains('is-current')));
      const start = Math.min(Math.max(0, current - 2), items.length - size);
      items.forEach((item, index) => {
        item.hidden = index < start || index >= start + size;
      });
    }
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
