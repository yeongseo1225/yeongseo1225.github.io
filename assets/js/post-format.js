(() => {
  const headingSelector = 'h1, h2, h3, h4, h5, h6';

  function normalizePostContent() {
    const content = document.querySelector('.post-content');
    if (!content) return;

    content.querySelectorAll('p').forEach((paragraph) => {
      const hasOnlyBreaks = Array.from(paragraph.childNodes).every((node) =>
        node.nodeType === Node.TEXT_NODE
          ? node.textContent.trim() === ''
          : node.nodeName === 'BR'
      );

      if (hasOnlyBreaks && paragraph.nextElementSibling?.matches(headingSelector)) {
        paragraph.remove();
      }
    });

    content.querySelectorAll(headingSelector).forEach((heading) => {
      heading.closest('li')?.classList.add('post-list-heading-item');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', normalizePostContent, { once: true });
  } else {
    normalizePostContent();
  }
})();
