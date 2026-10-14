(() => {
  // Minima 게시물이나 페이지 본문에서만 실행합니다.
  const content = document.querySelector(".post-content, .page-content");
  if (!content) return;

  const headings = content.querySelectorAll(
    "li h1, li h2, li h3, li h4, li h5, li h6"
  );

  headings.forEach((heading) => {
    // 중첩 목록 안에 있어도 모든 <li> 바깥으로 옮깁니다.
    while (heading.parentElement?.closest("li")) {
      const item = heading.parentElement.closest("li");
      const list = item.parentElement;

      if (!["UL", "OL"].includes(list.tagName)) break;

      list.insertAdjacentElement("afterend", heading);
    }
  });
})();
