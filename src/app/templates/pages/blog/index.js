import { renderAppLayout } from '../../layouts/main.js';
import { pageHero } from '../../components/page-hero.js';
import { renderFilterBar, renderFilterTag, renderFilterDropdown } from '../../components/filter-bar.js';

function renderBlogCard(post) {
  // Handle API format (formatPostForAPI) and service format
  const date = post.created_at
    ? new Date(post.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : post.publishedAt
      ? new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      : '';
  const category = post.category?.name || post.category?.title || post.category || '';
  const author = post.user
    ? `${post.user.first_name || ''} ${post.user.last_name || ''}`.trim()
    : post.author
      ? `${post.author.firstName || ''} ${post.author.lastName || ''}`.trim()
      : '';
  const image = post.image || post.featuredImage?.url || post.featuredImage?.thumbnailUrl || '/public/uploads/images/featured-posts.jpg';
  const rawExcerpt = post.description || post.excerpt || post.summary || '';
  const maxExcerptChars = 100;
  const excerpt = rawExcerpt.length > maxExcerptChars
    ? rawExcerpt.slice(0, maxExcerptChars).trim() + '...'
    : rawExcerpt;

  return `
    <article>
      <a href="/blog/${post.slug}" aria-label="Read ${post.title}" hx-get="/blog/${post.slug}" hx-target=".app__main" hx-push-url="true">
        <img src="${image}" alt="${post.title}" loading="lazy" />
      </a>
      <div>
        <p>${date} · ${category} · by ${author}</p>
        <h2><a href="/blog/${post.slug}" hx-get="/blog/${post.slug}" hx-target=".app__main" hx-push-url="true">${post.title}</a></h2>
        <hr />
        <p>${excerpt} <a href="/blog/${post.slug}" class="blog-page__continue" hx-get="/blog/${post.slug}" hx-target=".app__main" hx-push-url="true">continue reading</a></p>
      </div>
    </article>
  `;
}

function renderFilters(tags = [], categories = [], activeTag = '', activeCategory = '') {
  const tagList = tags.length > 0 ? tags : [];
  const categoryList = categories.length > 0 ? categories : [];

  // Tag buttons using shared component
  const tagButtons = [
    renderFilterTag({ label: 'All', href: '/blog', hxGet: '/blog', active: activeTag === '', page: 'blog' }),
    ...tagList.map((tag) =>
      renderFilterTag({
        label: tag.name,
        href: `/blog?tag=${tag.slug}`,
        hxGet: `/blog?tag=${tag.slug}`,
        active: tag.slug === activeTag,
        page: 'blog',
      })
    ),
  ].join('');

  // Category dropdown using shared component
  const categoryDropdown = renderFilterDropdown({
    page: 'blog',
    label: 'Category',
    options: [
      { label: 'All Categories', href: '/blog', hxGet: '/blog', active: !activeCategory },
      ...categoryList.map((cat) => ({
        label: cat.name,
        href: `/blog?category=${cat.slug}`,
        hxGet: `/blog?category=${cat.slug}`,
        active: cat.slug === activeCategory,
      })),
    ],
  });

  return renderFilterBar({ page: 'blog', left: tagButtons, right: categoryDropdown });
}

function renderPagination(currentPage, totalPages, totalPosts, activeTag = '', activeCategory = '') {
  if (totalPages <= 1) return '';

  const prevDisabled = currentPage === 1 ? 'blog-page__pagination-btn--disabled' : '';
  const nextDisabled = currentPage === totalPages ? 'blog-page__pagination-btn--disabled' : '';

  // Build URL with parameters if present
  const tagParam = activeTag ? `&tag=${activeTag}` : '';
  const categoryParam = activeCategory ? `&category=${activeCategory}` : '';
  const extraParams = tagParam + categoryParam;

  // Generate page numbers with HTMX
  let pageNumbers = '';
  for (let i = 1; i <= totalPages; i++) {
    const activeClass = i === currentPage ? 'blog-page__pagination-num--active' : '';
    pageNumbers += `<a href="/blog?page=${i}${extraParams}" class="${activeClass}" hx-get="/blog?page=${i}${extraParams}" hx-target=".app__main" hx-push-url="true">${i}</a>`;
  }

  return `
    <div class="blog-page__pagination">
      <div class="blog-page__pagination-info">
        Showing ${(currentPage - 1) * 9 + 1}-${Math.min(currentPage * 9, totalPosts)} of ${totalPosts} posts
      </div>
      <div class="blog-page__pagination-controls">
        <a href="${currentPage > 1 ? `/blog?page=${currentPage - 1}${extraParams}` : '#'}" class="btn btn--outline btn--sm blog-page__pagination-btn ${prevDisabled}" ${currentPage > 1 ? `hx-get="/blog?page=${currentPage - 1}${extraParams}" hx-target=".app__main" hx-push-url="true"` : ''}>
          <i class="ph ph-caret-left" aria-hidden="true"></i>
          Previous
        </a>
        <div class="blog-page__pagination-numbers">
          ${pageNumbers}
        </div>
        <a href="${currentPage < totalPages ? `/blog?page=${currentPage + 1}${extraParams}` : '#'}" class="btn btn--outline btn--sm blog-page__pagination-btn ${nextDisabled}" ${currentPage < totalPages ? `hx-get="/blog?page=${currentPage + 1}${extraParams}" hx-target=".app__main" hx-push-url="true"` : ''}>
          Next
          <i class="ph ph-caret-right" aria-hidden="true"></i>
        </a>
      </div>
    </div>
  `;
}

// Partial HTML for HTMX requests (returns full page hero + blog content)
export function appBlogPartial({ posts = [], page = 1, totalPages = 1, totalPosts = 0, tags = [], categories = [], activeTag = '', activeCategory = '' } = {}) {
  const cards = posts.map(renderBlogCard).join('');
  const pagination = renderPagination(page, totalPages, totalPosts, activeTag, activeCategory);

  return `
    ${pageHero({ title: 'Blog', subtitle: 'Stories, updates, and insights from our community' })}
    <div class="blog-page">
      <div class="blog-page__inner">
        ${renderFilters(tags, categories, activeTag, activeCategory)}
        <div class="blog-page__grid-wrapper">
          <div class="blog-page__grid">
            ${cards}
          </div>
          ${pagination}
        </div>
      </div>
    </div>
  `;
}

// Full page render
export function appBlogIndexPage({ posts, page, totalPages, totalPosts, tags = [], categories = [], activeTag = '', activeCategory = '' } = {}) {
  const cards = (posts || []).map(renderBlogCard).join('');
  const pagination = renderPagination(page, totalPages, totalPosts, activeTag, activeCategory);

  const content = `
    ${pageHero({ title: 'Blog', subtitle: 'Stories, updates, and insights from our community' })}
    <div class="blog-page">
      <div class="blog-page__inner">
        ${renderFilters(tags, categories, activeTag, activeCategory)}
        <div class="blog-page__grid-wrapper">
          <div class="blog-page__grid">
            ${cards}
          </div>
          ${pagination}
        </div>
      </div>
    </div>
  `;

  return renderAppLayout({
    title: 'Blog - GBLGA',
    bodyClass: 'blog-page',
    content,
    activeRoute: '/blog',
  });
}
