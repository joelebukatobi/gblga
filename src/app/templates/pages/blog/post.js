import { renderAppLayout } from '../../layouts/main.js';
import { pageHero } from '../../components/page-hero.js';

function renderBlogPostContent({ post, relatedPosts = [] } = {}) {
  if (!post) {
    return `
      ${pageHero({ title: 'Post Not Found' })}
      <div class="blog-post">
        <div class="blog-post__inner">
          <p class="text-center py-[8rem]">The post you're looking for doesn't exist.</p>
          <div class="text-center">
            <a href="/blog" class="btn btn--outline" hx-get="/blog" hx-target=".app__main" hx-push-url="true">Back to Blog</a>
          </div>
        </div>
      </div>
    `;
  }

  // Format date
  const date = post.created_at
    ? new Date(post.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : post.date || '';

  const category = post.category?.name || post.category?.title || post.category || '';
  const categorySlug = post.category?.slug || '';
  const author = post.user
    ? `${post.user.first_name || ''} ${post.user.last_name || ''}`.trim()
    : post.author || '';
  const image = post.image || post.featuredImage?.url || '/public/uploads/images/featured-posts.jpg';

  const postMeta = `
    <span>By ${author}</span>
    <span>|</span>
    <time datetime="${post.created_at || ''}">${date}</time>
    <span>|</span>
    <a href="/blog?category=${categorySlug}" hx-get="/blog?category=${categorySlug}" hx-target=".app__main" hx-push-url="true">${category}</a>
    <span>|</span>
    <a href="/blog" hx-get="/blog" hx-target=".app__main" hx-push-url="true">Back to Blog</a>
  `;

  return `
    ${pageHero({ title: post.title, meta: postMeta })}
    <article class="blog-post">
      <div class="blog-post__inner">
        <div class="blog-post__content">
          ${post.post || post.content || ''}
        </div>

        <!-- Tags -->
        ${post.tags?.length ? `
          <div class="blog-post__tags">
            <h3>Tags</h3>
            <div class="blog-post__tag-list">
              ${post.tags.map(tag => `
                <a href="/blog?tag=${tag.slug}" hx-get="/blog?tag=${tag.slug}" hx-target=".app__main" hx-push-url="true">${tag.name}</a>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Author Bio -->
        <div class="blog-post__author">
          <div>
            <img src="/dist/images/gblga-logo-icon.svg" alt="${author}" />
            <div>
              <h3>${author}</h3>
              <p>${post.user?.role || ''}</p>
            </div>
          </div>
        </div>

        <!-- Related Posts -->
        ${relatedPosts.length ? `
          <div class="blog-post__related">
            <h3>Related Posts</h3>
            <div class="blog-post__related-grid">
              ${relatedPosts.map(related => {
                const relatedCategory = related.category?.name || '';
                const relatedAuthor = related.user
                  ? `${related.user.first_name || ''} ${related.user.last_name || ''}`.trim()
                  : '';
                return `
                <article>
                  <a href="/blog/${related.slug}" hx-get="/blog/${related.slug}" hx-target=".app__main" hx-push-url="true">
                    <img src="${related.image || '/public/uploads/images/featured-posts.jpg'}" alt="${related.title}" />
                    <div class="blog-post__related-overlay">
                      <span class="blog-post__related-category">${relatedCategory}</span>
                      <h4>${related.title}</h4>
                      <span class="blog-post__related-author">By ${relatedAuthor}</span>
                    </div>
                  </a>
                </article>
                `;
              }).join('')}
            </div>
          </div>
        ` : ''}

      </div>
    </article>
  `;
}

// Partial HTML for HTMX requests (no layout wrapper)
export function appBlogPostPartial({ post, relatedPosts = [] } = {}) {
  return renderBlogPostContent({ post, relatedPosts });
}

// Full page render
export function appBlogPostPage({ post, relatedPosts = [] } = {}) {
  const content = renderBlogPostContent({ post, relatedPosts });

  return renderAppLayout({
    title: post ? `${post.title} - GBLGA` : 'Post Not Found - GBLGA',
    bodyClass: 'blog-post-page',
    content,
    activeRoute: '/blog',
    meta: {
      description: post?.excerpt || post?.summary || 'Read the latest from the Gabelli Black and LatinX Graduate Association.',
      ogType: 'article',
      ogImage: post?.featuredImage?.url || post?.image || '/dist/images/gblga-logo.svg',
    },
  });
}
