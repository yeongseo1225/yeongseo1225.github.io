const input = document.querySelector("#site-search");
const status = document.querySelector("#search-status");
const results = document.querySelector("#search-results");

let posts = [];

fetch(results.dataset.indexUrl)
  .then((response) => {
    if (!response.ok) throw new Error("검색 목록을 불러오지 못했습니다.");
    return response.json();
  })
  .then((data) => {
    posts = data;
  })
  .catch(() => {
    status.textContent = "검색 목록을 불러오지 못했습니다.";
  });

input.addEventListener("input", () => {
  const query = input.value.trim().toLocaleLowerCase();
  results.replaceChildren();

  if (!query) {
    status.textContent = "검색어를 입력해 주세요.";
    return;
  }

  const matches = posts.filter((post) => {
    const searchableText = [
      post.title,
      post.content,
      ...(post.tags || []),
      ...(post.categories || [])
    ].join(" ").toLocaleLowerCase();

    return searchableText.includes(query);
  });

  status.textContent = matches.length
    ? `${matches.length}개의 글을 찾았어요.`
    : "검색 결과가 없어요.";

  matches.forEach((post) => {
    const article = document.createElement("article");
    article.className = "search-result";

    const link = document.createElement("a");
    link.href = post.url;
    link.textContent = post.title;

    const date = document.createElement("p");
    date.textContent = post.date;

    article.append(link, date);
    results.append(article);
  });
});
