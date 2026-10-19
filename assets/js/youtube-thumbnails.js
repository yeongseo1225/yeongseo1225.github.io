(() => {
  const getVideoId = (href) => {
    try {
      const url = new URL(href, window.location.href);
      const host = url.hostname.replace(/^www\./, '');

      if (host === 'youtu.be') {
        return url.pathname.split('/').filter(Boolean)[0];
      }

      if (host === 'youtube.com' || host === 'm.youtube.com') {
        if (url.pathname === '/watch') return url.searchParams.get('v');
        const match = url.pathname.match(/^\/(?:embed|shorts)\/([^/?]+)/);
        return match ? match[1] : null;
      }
    } catch (_) {
      return null;
    }

    return null;
  };

  document.querySelectorAll('.post-content a[href]').forEach((link) => {
    const videoId = getVideoId(link.href);
    if (!videoId) return;

    const title = link.textContent.trim() || 'YouTube 영상 보기';
    const thumbnail = document.createElement('img');
    thumbnail.src = `https://img.youtube.com/vi/${encodeURIComponent(videoId)}/hqdefault.jpg`;
    thumbnail.alt = `${title} 미리보기 (새 탭에서 재생)`;
    thumbnail.loading = 'lazy';
    thumbnail.decoding = 'async';

    link.classList.add('youtube-thumbnail-link');
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.setAttribute('aria-label', `${title} (새 탭에서 YouTube에서 재생)`);
    link.replaceChildren(thumbnail);
  });
})();
