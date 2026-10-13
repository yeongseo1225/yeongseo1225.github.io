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
        <svg class="meta-icon" viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3" y="5" width="18" height="16" rx="2"></rect>
          <path d="M16 3v4M8 3v4M3 10h18"></path>
        </svg>
        {{ post.date | date: "%b %-d, %Y" }}
      </time> 

        {% if post.categories.size > 0 %}
          <span class="post-card-categories">
            <svg class="meta-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3 7a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <path d="M3 10h18"></path>
            </svg>
            {{ post.categories | join: ", " }}
        </span>
        {% endif %}
      </div>
    </article>
  {% endfor %}
</div>
