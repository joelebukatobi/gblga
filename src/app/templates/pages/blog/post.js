import { renderAppLayout } from '../../layouts/main.js';
import { pageHero } from '../../components/page-hero.js';

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function appBlogPostPage({ post }) {
  const content = `
    ${pageHero({ title: post?.title || 'Blog Post' })}
    <div class="blog-page">
      <div class="blog-page__inner">
        <p class="blog-page__coming-soon">Blog post content coming soon...</p>
      </div>
    </div>
  `;

  return renderAppLayout({
    title: `${post?.title || 'Blog Post'} - GBLGA`,
    bodyClass: 'blog-page',
    content,
    activeRoute: '/blog',
  });
}
