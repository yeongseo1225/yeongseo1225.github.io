---
layout: default
title: Home
---

<h1>최근 글</h1>

<div class="post-list">
  {% for post in site.posts %}
    <article class="post-card">
      <h2 class="post-card-title">
        <a href="{{ post.url | relative_url }}">{{ post.title | escape }}</a>
      </h2>

      <p class="post-card-excerpt">
        {{ post.excerpt | strip_html | normalize_whitespace | truncate: 180 }}
      </p>

      <div class="post-card-meta">
        <time datetime="{{ post.date | date_to_xmlschema }}">
          <span aria-hidden="true">▢</span>
          {{ post.date | date: "%b %-d, %Y" }}
        </time>

        {% if post.categories.size > 0 %}
          <span class="post-card-categories">
            <span aria-hidden="true">▱</span>
            {{ post.categories | join: ", " }}
          </span>
        {% endif %}
      </div>
    </article>
  {% endfor %}
</div>
