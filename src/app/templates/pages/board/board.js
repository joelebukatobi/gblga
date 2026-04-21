import { renderAppLayout } from '../../layouts/main.js';
import { pageHero } from '../../components/page-hero.js';

export function appBoardPage() {
  const content = `
    ${pageHero({ title: 'Board', subtitle: 'Meet our leadership team' })}
    <div class="board-page">
      <div class="board-page__inner">
        <p class="board-page__coming-soon">Board content coming soon...</p>
      </div>
    </div>
  `;

  return renderAppLayout({
    title: 'Board - GBLGA',
    bodyClass: 'board-page',
    content,
    activeRoute: '/board',
  });
}
