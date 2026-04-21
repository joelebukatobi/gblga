import { renderLogo } from '../components/logo.js';

const COLUMNS = [
  {
    title: 'About Us',
    links: [
      { label: 'Our Mission', href: '/about#mission' },
      { label: 'History', href: '/about#history' },
    ],
  },
  {
    title: 'Explore',
    links: [
      { label: 'Events', href: '/events' },
      { label: 'Gallery', href: '/gallery' },
      { label: 'Blog', href: '/blog' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Membership', href: '/membership' },
      { label: 'Volunteer', href: '/volunteer' },
      { label: 'Donations', href: '/donate' },
    ],
  },
];

export function footer() {
  const columns = COLUMNS.map(
    (col) => `
      <div class="site-footer__column">
        <h3 class="site-footer__column-title">${col.title}</h3>
        <ul class="site-footer__column-list">
          ${col.links
            .map((l) => `<li><a class="site-footer__column-link" href="${l.href}">${l.label}</a></li>`)
            .join('')}
        </ul>
      </div>
    `,
  ).join('');

  return `
    <footer class="site-footer">
      <div class="site-footer__inner">
        <div class="site-footer__top">
          <div class="site-footer__brand">
            <a class="site-footer__logo" href="/">${renderLogo()}</a>
          </div>
          ${columns}
        </div>
        <hr class="site-footer__divider" />
        <div class="site-footer__bottom">
          <ul class="site-footer__social" aria-label="Social media">
            <li><a class="site-footer__social-link" href="#" aria-label="Instagram"><i class="ph ph-instagram-logo" aria-hidden="true"></i></a></li>
            <li><a class="site-footer__social-link" href="#" aria-label="LinkedIn"><i class="ph ph-linkedin-logo" aria-hidden="true"></i></a></li>
          </ul>
        </div>
      </div>
    </footer>
  `;
}
