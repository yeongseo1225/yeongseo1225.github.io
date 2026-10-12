---
layout: default
title: Home
---

<h1>최근 글</h1>

<ul class="post-list">
{% for post in site.posts %}
  <li>
    <span class="post-meta">{{ post.date | date: "%Y-%m-%d" }}</span>
    <h3><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h3>
    {% if post.categories.size > 0 %}<small>{{ post.categories | join: " · " }}</small>{% endif %}
  </li>
{% endfor %}
</ul>
