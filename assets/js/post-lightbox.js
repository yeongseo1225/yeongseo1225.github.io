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
      <button class="post-lightbox__nav post-lightbox__prev" type="button" aria-label="이전 이미지">‹</button>
      <figure class="post-lightbox__figure">
        <img class="post-lightbox__image" alt="">
        <figcaption class="post-lightbox__caption"></figcaption>
      </figure>
      <button class="post-lightbox__nav post-lightbox__next" type="button" aria-label="다음 이미지">›</button>
      <div class="post-lightbox__count" aria-live="polite"></div>
    </div>`;
  document.body.append(lightbox);

  const viewerImage = lightbox.querySelector('.post-lightbox__image');
  const panel = lightbox.querySelector('.post-lightbox__panel');
  const closeButton = lightbox.querySelector('.post-lightbox__close');
  const caption = lightbox.querySelector('.post-lightbox__caption');
  const count = lightbox.querySelector('.post-lightbox__count');
  const previousButton = lightbox.querySelector('.post-lightbox__prev');
  const nextButton = lightbox.querySelector('.post-lightbox__next');
  let currentIndex = 0;
  let returnFocusTo = null;
  let touchStartX = null;

  function preload(index) {
    if (images.length < 2) return;
    const nextImage = new Image();
    nextImage.src = images[(index + images.length) % images.length].currentSrc || images[(index + images.length) % images.length].src;
  }

  function showImage(index) {
    currentIndex = (index + images.length) % images.length;
    const source = images[currentIndex];
    viewerImage.src = source.currentSrc || source.src;
    viewerImage.alt = source.alt || '';
    caption.textContent = source.alt || '';
    count.textContent = `${currentIndex + 1} / ${images.length}`;
    const multipleImages = images.length > 1;
    previousButton.hidden = !multipleImages;
    nextButton.hidden = !multipleImages;
    preload(currentIndex + 1);
    preload(currentIndex - 1);
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
  previousButton.addEventListener('click', () => showImage(currentIndex - 1));
  nextButton.addEventListener('click', () => showImage(currentIndex + 1));
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
    if (event.key === 'ArrowLeft' && images.length > 1) {
      event.preventDefault();
      showImage(currentIndex - 1);
    } else if (event.key === 'ArrowRight' && images.length > 1) {
      event.preventDefault();
      showImage(currentIndex + 1);
    } else if (event.key === 'Tab') {
      const controls = Array.from(lightbox.querySelectorAll('button:not([hidden])'));
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });
  lightbox.addEventListener('touchstart', (event) => {
    touchStartX = event.changedTouches[0].clientX;
  }, { passive: true });
  lightbox.addEventListener('touchend', (event) => {
    if (touchStartX === null || images.length < 2) return;
    const distance = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(distance) > 48) showImage(currentIndex + (distance < 0 ? 1 : -1));
    touchStartX = null;
  }, { passive: true });
})();
