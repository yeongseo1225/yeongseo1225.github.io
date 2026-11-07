(() => {
  const content = document.querySelector('.post-content');
  if (!content) return;

  const images = Array.from(content.querySelectorAll('img')).filter(
    (image) => image.src && !image.closest('a') && !image.closest('[aria-hidden="true"]'),
  );
  if (!images.length) return;

  const lightbox = document.createElement('div');
  lightbox.className = 'post-lightbox';
  lightbox.setAttribute('role', 'dialog');
  lightbox.setAttribute('aria-modal', 'true');
  lightbox.setAttribute('aria-label', '게시글 이미지 뷰어');
  lightbox.tabIndex = -1;
  lightbox.hidden = true;
  lightbox.innerHTML = `
    <div class="post-lightbox__panel">
      <button class="post-lightbox__close" type="button" aria-label="이미지 뷰어 닫기">×</button>
      <figure class="post-lightbox__figure">
        <img class="post-lightbox__image" alt="">
      </figure>
    </div>`;
  document.body.append(lightbox);

  const viewerImage = lightbox.querySelector('.post-lightbox__image');
  const panel = lightbox.querySelector('.post-lightbox__panel');
  const closeButton = lightbox.querySelector('.post-lightbox__close');
  let returnFocusTo = null;

  function showImage(index) {
    const source = images[index];
    viewerImage.src = source.currentSrc || source.src;
    viewerImage.alt = source.alt || '';
  }

  function openImage(index) {
    returnFocusTo = images[index];
    showImage(index);
    lightbox.hidden = false;
    document.body.classList.add('post-lightbox-open');
    closeButton.focus();
  }

  function closeViewer() {
    if (lightbox.hidden) return;
    lightbox.hidden = true;
    document.body.classList.remove('post-lightbox-open');
    viewerImage.removeAttribute('src');
    returnFocusTo?.focus();
    returnFocusTo = null;
  }

  images.forEach((image, index) => {
    const label = image.alt ? `이미지 확대 보기: ${image.alt}` : '이미지 확대 보기';
    image.classList.add('post-lightbox-trigger');
    image.tabIndex = 0;
    image.setAttribute('role', 'button');
    image.setAttribute('aria-label', label);
    image.addEventListener('click', () => openImage(index));
    image.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      openImage(index);
    });
  });

  closeButton.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    closeViewer();
  });
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox || event.target === panel) closeViewer();
  });
  document.addEventListener('keydown', (event) => {
    if (lightbox.hidden) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      closeViewer();
      return;
    }
    if (event.key === 'Tab') {
      event.preventDefault();
      closeButton.focus();
    }
  });
})();
