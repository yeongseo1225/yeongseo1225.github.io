(() => {
  const content = document.querySelector(".post-content");
  const toc = document.querySelector("#post-toc");
  const list = document.querySelector("#post-toc-list");

  if (!content || !toc || !list) return;

  const headings = Array.from(content.querySelectorAll("h2, h3, h4"));
  if (!headings.length) return;

  const usedIds = new Set(
    Array.from(document.querySelectorAll("[id]"), (element) => element.id),
  );

  headings.forEach((heading, index) => {
    if (!heading.id) {
      const base = heading.textContent
        .trim()
        .toLocaleLowerCase()
        .replace(/[^\p{L}\p{N}]+/gu, "-")
        .replace(/^-|-$/g, "") || `section-${index + 1}`;
      let id = base;
      let suffix = 2;

      while (usedIds.has(id)) {
        id = `${base}-${suffix++}`;
      }

      heading.id = id;
      usedIds.add(id);
    }

    const item = document.createElement("li");
    item.className = `post-toc-level-${heading.tagName.slice(1)}`;

    const link = document.createElement("a");
    link.href = `#${heading.id}`;
    link.textContent = heading.textContent.trim();

    item.append(link);
    list.append(item);
  });

  toc.hidden = false;
})();
