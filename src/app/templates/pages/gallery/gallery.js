import { renderAppLayout } from '../../layouts/main.js';
import { pageHero } from '../../components/page-hero.js';

export function appGalleryPage() {
  const content = `
    ${pageHero({ title: 'Gallery', subtitle: 'Photos from our events and activities' })}
    <div class="gallery-page">
      <div class="gallery-page__inner">
        <p class="gallery-page__coming-soon">Gallery content coming soon...</p>
      </div>
    </div>
  `;

  return renderAppLayout({
    title: 'Gallery - GBLGA',
    bodyClass: 'gallery-page',
    content,
    activeRoute: '/gallery',
  });
}
