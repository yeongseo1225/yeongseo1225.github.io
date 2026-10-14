(() => {
  function moveHeadingsOutOfLists() {
    const headings = [...document.querySelectorAll(
      "li h1, li h2, li h3, li h4, li h5, li h6"
    )];

    // 뒤에서부터 옮겨야 같은 목록 안 제목의 순서가 유지됩니다.
    headings.reverse().forEach((heading) => {
      let item = heading.parentElement.closest("li");
      if (!item) return;

      // 제목을 감싸는 가장 바깥쪽 목록을 찾습니다.
      let list = item.parentElement;

      while (list.parentElement.closest("li")) {
        item = list.parentElement.closest("li");
        list = item.parentElement;
      }

      if (["UL", "OL"].includes(list.tagName)) {
        list.insertAdjacentElement("afterend", heading);
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", moveHeadingsOutOfLists);
  } else {
    moveHeadingsOutOfLists();
  }
})();
