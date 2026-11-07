# yeongseo1225.github.io
## 글 서식 자동 정리
Obsidian에서 발행된 글(`_posts/*.md`)은 탭 들여쓰기, `<font>`/`<mark>` 태그, 제목 앞뒤 빈 줄 누락 때문에 Jekyll(kramdown)에서 내용이 빠질 수 있습니다.
`scripts/normalize_posts.py`가 이를 자동 정리하며, `main`에 글이 push되면 `.github/workflows/normalize-posts.yml`이 실행해 결과를 커밋합니다.
수동 실행: `python3 scripts/normalize_posts.py`
