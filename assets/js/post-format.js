(() => {
  const headingSelector = 'h1, h2, h3, h4, h5, h6';

  function renderInlineText(text, target) {
    const template = document.createElement('template');
    const decoded = document.createElement('textarea');
    decoded.innerHTML = text;
    const escaped = decoded.value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/&lt;(\/?(?:strong|b|em|i|u|mark|del|s|sub|sup|code|br))\s*&gt;/gi, '<$1>')
      .replace(/&lt;font\s+color=&quot;(#[0-9a-f]{6})&quot;\s*&gt;/gi, '<span style="color: $1">')
      .replace(/&lt;\/font\s*&gt;/gi, '</span>');
    template.innerHTML = escaped;

    const allowedTags = new Set(['STRONG', 'B', 'EM', 'I', 'U', 'MARK', 'DEL', 'S', 'SUB', 'SUP', 'CODE', 'BR', 'SPAN']);
    const clean = (node) => {
      Array.from(node.childNodes).forEach((child) => {
        if (child.nodeType !== Node.ELEMENT_NODE) return;
        if (!allowedTags.has(child.tagName)) {
          child.replaceWith(document.createTextNode(child.textContent));
          return;
        }
        if (child.tagName === 'SPAN') {
          const color = child.getAttribute('style')?.match(/^color:\s*(#[0-9a-f]{6})$/i)?.[1];
          if (color) child.setAttribute('style', `color: ${color}`);
          else child.removeAttribute('style');
        } else {
          Array.from(child.attributes).forEach((attribute) => child.removeAttribute(attribute.name));
        }
        clean(child);
      });
    };
    clean(template.content);
    target.append(template.content);
  }

  function recoverMarkdownImages(content) {
    content.querySelectorAll('pre > code').forEach((code) => {
      const match = code.textContent.trim().match(/^!\[([^\]]*)\]\((.+)\)$/);
      if (!match) return;

      const paragraph = document.createElement('p');
      const image = document.createElement('img');
      image.alt = match[1];
      image.src = match[2].trim();
      paragraph.append(image);
      code.parentElement.replaceWith(paragraph);
    });
  }

  function recoverMarkdownLists(content) {
    content.querySelectorAll('pre > code').forEach((code) => {
      const lines = code.textContent.replace(/\n+$/, '').split('\n');
      const items = lines.map((line) => line.match(/^(\s*)([-+*]|\d+\.)\s+(.+)$/));
      if (items.length < 2 || items.some((item) => !item)) return;

      const root = document.createDocumentFragment();
      const stack = [];
      items.forEach((item) => {
        const indent = item[1].replace(/\t/g, '    ').length;
        const ordered = item[2].endsWith('.');
        while (stack.length && stack[stack.length - 1].indent > indent) stack.pop();

        let frame = stack[stack.length - 1];
        if (frame && frame.indent === indent && frame.ordered !== ordered) {
          const parentFrame = stack.length > 1 ? stack[stack.length - 2] : null;
          const list = document.createElement(ordered ? 'ol' : 'ul');
          if (parentFrame) parentFrame.lastItem.append(list);
          else root.append(list);
          frame = { indent, ordered, list, lastItem: null };
          stack[stack.length - 1] = frame;
        } else if (!frame || frame.indent < indent) {
          const list = document.createElement(ordered ? 'ol' : 'ul');
          if (frame) frame.lastItem.append(list);
          else root.append(list);
          frame = { indent, ordered, list, lastItem: null };
          stack.push(frame);
        }

        const listItem = document.createElement('li');
        renderInlineText(item[3], listItem);
        frame.list.append(listItem);
        frame.lastItem = listItem;
      });
      code.parentElement.replaceWith(root);
    });
  }

  function normalizeLegacyFont(content) {
    content.querySelectorAll('font').forEach((font) => {
      const span = document.createElement('span');
      const color = font.getAttribute('color')?.match(/^#[0-9a-f]{6}$/i)?.[0];
      if (color) span.style.color = color;
      span.replaceChildren(...font.childNodes);
      font.replaceWith(span);
    });

    content.querySelectorAll('li > span + p, li > font + p').forEach((paragraph) => {
      const previous = paragraph.previousElementSibling;
      if (!previous) return;
      previous.after(document.createTextNode(' '), ...paragraph.childNodes);
      paragraph.remove();
    });
  }

  function moveHeadingsOutOfLists(content) {
    const insertionPoints = new Map();
    content.querySelectorAll(headingSelector).forEach((heading) => {
      const listItem = heading.closest('li');
      if (!listItem) return;
      let list = listItem.closest('ul, ol');
      while (list?.parentElement?.closest('li')) {
        list = list.parentElement.closest('li').closest('ul, ol');
      }
      if (!list?.parentNode) return;

      const parent = list.parentNode;
      const reference = insertionPoints.has(list) ? insertionPoints.get(list) : list.nextSibling;
      parent.insertBefore(heading, reference);
      insertionPoints.set(list, heading.nextSibling);
    });
  }

  function normalizePostContent() {
    const content = document.querySelector('.post-content');
    if (!content) return;

    recoverMarkdownImages(content);
    recoverMarkdownLists(content);
    normalizeLegacyFont(content);
    moveHeadingsOutOfLists(content);

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

  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', normalizePostContent, { once: true });
  } else {
    normalizePostContent();
  }
})();
