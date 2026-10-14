(() => {
  function fixHeadings() {
    const areas = document.querySelectorAll(
      ".post-content, .page-content, article"
    );

    areas.forEach((area) => {
      const headings = area.querySelectorAll(
        "li h1, li h2, li h3, li h4, li h5, li h6"
      );

      headings.forEach((heading) => {
        while (heading.parentElement?.closest("li")) {
          const item = heading.parentElement.closest("li");
          const list = item.parentElement;

          if (!["UL", "OL"].includes(list.tagName)) break;

          list.insertAdjacentElement("afterend", heading);
        }
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fixHeadings);
  } else {
    fixHeadings();
  }

  new MutationObserver(fixHeadings).observe(document.body, {
    childList: true,
    subtree: true,
  });
})();
