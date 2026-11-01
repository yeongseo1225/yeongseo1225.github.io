---
layout: default
title: Home
---

<div class="post-list home-post-list">
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
            {% for post_category in post.categories %}{% assign category_parts = post_category | split: "/" %}
            <span class="post-card-category" data-category="{{ post_category | escape }}">
              {% for category_part in category_parts %}{% unless forloop.first %}<span class="category-separator" aria-hidden="true">›</span>{% endunless %}<span class="category-part{% if forloop.last and category_parts.size > 1 %} category-child{% endif %}">{{ category_part | escape }}</span>{% endfor %}
            </span>{% unless forloop.last %}<span class="category-list-separator" aria-hidden="true">,</span>{% endunless %}{% endfor %}
        </span>
        {% endif %}
      </div>
    </article>
  {% endfor %}
</div>
