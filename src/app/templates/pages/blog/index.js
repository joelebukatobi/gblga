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

function truncate(text = '', max = 180) {
  if (text.length <= max) return text;
  return `${text.slice(0, max).trimEnd()}...`;
}

function formatDate(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function appBlogIndexPage({ posts = [], page = 1, totalPages = 1 }) {
  const content = `
    ${pageHero({ title: 'Blog', subtitle: 'Stories and updates from our community' })}
    <div class="blog-page">
      <div class="blog-page__inner">
        <p class="blog-page__coming-soon">Blog content coming soon...</p>
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
