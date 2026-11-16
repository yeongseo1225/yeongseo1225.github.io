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

  // 읽고 있는 섹션을 목차에 표시하고, 모바일에서는 목차를 접었다 편다.
  const links = Array.from(list.querySelectorAll("a"));
  const toggle = document.querySelector("#post-toc-toggle");
  const current = document.querySelector("#post-toc-current");
  let activeIndex = -1;

  function updateActive() {
    let index = -1;
    headings.forEach((heading, i) => {
      if (heading.getBoundingClientRect().top <= 120) index = i;
    });
    if (index === activeIndex) return;
    activeIndex = index;

    links.forEach((link, i) => link.classList.toggle("is-active", i === index));
    if (index >= 0 && window.matchMedia("(min-width: 701px)").matches) {
      const box = toc.getBoundingClientRect();
      const rect = links[index].getBoundingClientRect();
      if (rect.top < box.top + 40 || rect.bottom > box.bottom - 40) {
        toc.scrollTop += rect.top - box.top - box.height / 3;
      }
    }
    if (current) current.textContent = index >= 0 ? links[index].textContent : "";
  }

  let ticking = false;
  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        updateActive();
      });
    },
    { passive: true },
  );
  updateActive();

  function setOpen(open) {
    toc.classList.toggle("is-open", open);
    toggle?.setAttribute("aria-expanded", String(open));
  }

  toggle?.addEventListener("click", () => setOpen(!toc.classList.contains("is-open")));
  list.addEventListener("click", (event) => {
    if (event.target.closest("a")) setOpen(false);
  });
})();
