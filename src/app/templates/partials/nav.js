import { renderLogo } from '../components/logo.js';

const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Board', href: '/board' },
  { label: 'Events', href: '/events' },
  { label: 'Blog', href: '/blog' },
  { label: 'Gallery', href: '/gallery' },
];

export function nav(activeRoute = '/') {
  const items = NAV_ITEMS.map(
    (item) => {
      const isActive = item.href === activeRoute || (item.href !== '/' && activeRoute.startsWith(item.href));
      return `
        <li class="site-nav__item">
          <a class="site-nav__link${isActive ? ' site-nav__link--active' : ''}" href="${item.href}">${item.label}</a>
        </li>
      `;
    }
  ).join('');

  return `
    <header class="site-nav">
      <div class="site-nav__inner">
        <a class="site-nav__brand" href="/">${renderLogo()}</a>
        <nav class="site-nav__center" aria-label="Primary">
          <ul class="site-nav__links">${items}</ul>
        </nav>
        <div class="site-nav__end">
          <a class="btn btn--primary btn--sm" href="https://fordhamgsb.campuslabs.com/engage/actioncenter/organization/black-and-hispanic-mba-association" target="_blank" rel="noopener noreferrer">Become A Member</a>
        </div>
      </div>
    </header>
  `;
}
