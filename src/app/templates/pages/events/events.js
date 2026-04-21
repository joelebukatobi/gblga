import { renderAppLayout } from '../../layouts/main.js';
import { pageHero } from '../../components/page-hero.js';

export function appEventsPage() {
  const content = `
    ${pageHero({ title: 'Events', subtitle: 'Upcoming and past events' })}
    <div class="events-page">
      <div class="events-page__inner">
        <p class="events-page__coming-soon">Events content coming soon...</p>
      </div>
    </div>
  `;

  return renderAppLayout({
    title: 'Events - GBLGA',
    bodyClass: 'events-page',
    content,
    activeRoute: '/events',
  });
}
