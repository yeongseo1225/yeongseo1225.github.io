const input = document.querySelector("#site-search");
const form = document.querySelector("#search-form");
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
    const initialQuery = new URLSearchParams(window.location.search).get("q");
    if (initialQuery) {
      input.value = initialQuery;
      document.body.classList.add("has-search-results");
      renderResults(initialQuery);
    }
  })
  .catch(() => {
    status.textContent = "검색 목록을 불러오지 못했습니다.";
  });

function renderResults(rawQuery) {
  const query = rawQuery.trim().toLocaleLowerCase();
  results.replaceChildren();

  if (!query) {
    results.hidden = true;
    document.body.classList.remove("has-search-results");
    status.textContent = "";
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
    : "검색 결과가 없습니다.";
  status.classList.toggle("search-empty", matches.length === 0);
  document.body.classList.add("has-search-results");
  results.hidden = false;

  matches.forEach((post) => {
    const article = document.createElement("article");
    article.className = "search-result";

    const link = document.createElement("a");
    link.href = post.url;
    link.textContent = post.title;

    const heading = document.createElement("h2");
    heading.className = "post-card-title";
    heading.append(link);

    const excerpt = document.createElement("p");
    excerpt.className = "post-card-excerpt";
    excerpt.textContent = post.excerpt || "";

    const meta = document.createElement("div");
    meta.className = "post-card-meta";

    const date = document.createElement("time");
    date.dateTime = post.date;
    const dateIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    dateIcon.setAttribute("class", "meta-icon");
    dateIcon.setAttribute("viewBox", "0 0 24 24");
    dateIcon.setAttribute("aria-hidden", "true");
    dateIcon.innerHTML = '<rect x="3" y="5" width="18" height="16" rx="2"></rect><path d="M16 3v4M8 3v4M3 10h18"></path>';
    date.textContent = post.display_date || post.date;
    date.prepend(dateIcon);
    meta.append(date);

    if (post.categories?.length) {
      const categories = document.createElement("span");
      categories.className = "post-card-categories";
      const categoryIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      categoryIcon.setAttribute("class", "meta-icon");
      categoryIcon.setAttribute("viewBox", "0 0 24 24");
      categoryIcon.setAttribute("aria-hidden", "true");
      categoryIcon.innerHTML = '<path d="M3 7a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><path d="M3 10h18"></path>';
      categories.append(categoryIcon, document.createTextNode(post.categories.join(", ")));
      meta.append(categories);
    }

    article.append(heading, excerpt, meta);
    results.append(article);
  });
}

form.addEventListener("submit", (event) => {
  if (window.location.pathname.replace(/\/$/, "") === new URL(form.action).pathname.replace(/\/$/, "")) {
    event.preventDefault();
    const query = input.value.trim();
    const url = new URL(window.location.href);
    url.searchParams.set("q", query);
    window.history.replaceState({}, "", url);
    renderResults(query);
  }
});
