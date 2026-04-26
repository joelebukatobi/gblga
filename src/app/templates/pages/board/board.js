import { renderAppLayout } from '../../layouts/main.js';
import { pageHero } from '../../components/page-hero.js';
import { renderFilterBar, renderFilterTag, renderFilterDropdown } from '../../components/filter-bar.js';

const BOARD_MEMBERS = [
  {
    name: 'Alexandra Morales',
    role: 'President',
    bio: 'Second-year MBA student passionate about creating inclusive spaces in business education and fostering community across cultures.',
    image: '/dist/images/gblga-logo-icon.svg',
    type: 'senior',
    year: 2026,
  },
  {
    name: 'Marcus Johnson',
    role: 'Vice President',
    bio: 'Focused on professional development initiatives and building bridges between students and industry leaders.',
    image: '/dist/images/gblga-logo-icon.svg',
    type: 'senior',
    year: 2026,
  },
  {
    name: 'Isabella Reyes',
    role: 'Treasurer',
    bio: 'Managing budgets and funding to support events, scholarships, and community outreach programs.',
    image: '/dist/images/gblga-logo-icon.svg',
    type: 'senior',
    year: 2026,
  },
  {
    name: 'David Okonkwo',
    role: 'Secretary',
    bio: 'Keeping the organization running smoothly with detailed records and clear communication across all teams.',
    image: '/dist/images/gblga-logo-icon.svg',
    type: 'junior',
    year: 2026,
  },
  {
    name: 'Sofia Martinez',
    role: 'Events Chair',
    bio: 'Curating memorable experiences that celebrate Black and LatinX culture while building lasting professional networks.',
    image: '/dist/images/gblga-logo-icon.svg',
    type: 'junior',
    year: 2026,
  },
  {
    name: 'James Williams',
    role: 'Marketing Chair',
    bio: 'Telling the GBLGA story through creative campaigns that amplify our mission and engage the broader community.',
    image: '/dist/images/gblga-logo-icon.svg',
    type: 'junior',
    year: 2025,
  },
  {
    name: 'Camila Rodriguez',
    role: 'Community Outreach',
    bio: 'Building partnerships with local organizations and creating volunteer opportunities for members.',
    image: '/dist/images/gblga-logo-icon.svg',
    type: 'senior',
    year: 2025,
  },
  {
    name: 'Jordan Thompson',
    role: 'Mentorship Coordinator',
    bio: 'Pairing underclassmen with experienced mentors to guide academic and career journeys.',
    image: '/dist/images/gblga-logo-icon.svg',
    type: 'junior',
    year: 2025,
  },
  {
    name: 'Nia Johnson',
    role: 'President',
    bio: 'Leading strategic vision and organizational growth with a focus on long-term sustainability.',
    image: '/dist/images/gblga-logo-icon.svg',
    type: 'senior',
    year: 2024,
  },
];

const YEARS = [2026, 2025, 2024];
const MEMBERS_PER_PAGE = 9;

function renderBoardMember(member) {
  return `
    <article class="board-member">
      <div class="board-member__photo">
        <img src="${member.image}" alt="${member.name}" />
      </div>
      <div class="board-member__info">
        <h3 class="board-member__name">${member.name}</h3>
        <p class="board-member__role">${member.role}</p>
        <p class="board-member__bio">${member.bio}</p>
      </div>
    </article>
  `;
}

function renderFilters(activeType = '', activeYear = '') {
  // Build query strings preserving filters
  const typeParam = activeType ? `type=${activeType}` : '';

  // Tag buttons using shared component
  const tagButtons = [
    renderFilterTag({
      label: 'All',
      href: `/board${activeYear ? '?year=all' : ''}`,
      hxGet: `/board${activeYear ? '?year=all' : ''}`,
      active: activeType === '',
      page: 'board',
    }),
    renderFilterTag({
      label: 'Senior Board',
      href: `/board?type=senior${activeYear ? `&year=${activeYear}` : ''}`,
      hxGet: `/board?type=senior${activeYear ? `&year=${activeYear}` : ''}`,
      active: activeType === 'senior',
      page: 'board',
    }),
    renderFilterTag({
      label: 'Junior Board',
      href: `/board?type=junior${activeYear ? `&year=${activeYear}` : ''}`,
      hxGet: `/board?type=junior${activeYear ? `&year=${activeYear}` : ''}`,
      active: activeType === 'junior',
      page: 'board',
    }),
  ].join('');

  // Year dropdown options preserving type filter
  const yearOptions = YEARS.map((year) => {
    const qs = [typeParam, `year=${year}`].filter(Boolean).join('&');
    return {
      label: String(year),
      href: `/board${qs ? `?${qs}` : ''}`,
      hxGet: `/board${qs ? `?${qs}` : ''}`,
      active: String(year) === activeYear,
    };
  });

  const allYearsQs = activeType ? `?type=${activeType}&year=all` : '?year=all';

  const yearDropdown = renderFilterDropdown({
    page: 'board',
    label: activeYear || 'All Years',
    options: [
      { label: 'All Years', href: `/board${allYearsQs}`, hxGet: `/board${allYearsQs}`, active: !activeYear },
      ...yearOptions,
    ],
  });

  return renderFilterBar({ page: 'board', left: tagButtons, right: yearDropdown });
}

function renderBoardGrid(members) {
  if (members.length === 0) {
    return `<p class="board-page__empty">No board members found for the selected filters.</p>`;
  }
  return `
    <div class="board-page__grid">
      ${members.map(renderBoardMember).join('')}
    </div>
  `;
}

function filterMembers(type = '', year = '') {
  return BOARD_MEMBERS.filter(m => {
    const typeMatch = !type || m.type === type;
    const yearMatch = !year || String(m.year) === year;
    return typeMatch && yearMatch;
  });
}

function paginateMembers(members, page = 1) {
  const totalMembers = members.length;
  const totalPages = Math.ceil(totalMembers / MEMBERS_PER_PAGE);
  const currentPage = Math.min(Math.max(page, 1), totalPages || 1);
  const start = (currentPage - 1) * MEMBERS_PER_PAGE;
  const paginatedMembers = members.slice(start, start + MEMBERS_PER_PAGE);

  return {
    members: paginatedMembers,
    currentPage,
    totalPages,
    totalMembers,
  };
}

function buildBoardQs(type = '', year = '', page = '') {
  const params = [];
  if (type) params.push(`type=${type}`);
  if (year) params.push(`year=${year}`);
  if (page) params.push(`page=${page}`);
  return params.length ? `?${params.join('&')}` : '';
}

function renderPagination(currentPage, totalPages, totalMembers, type = '', year = '') {
  if (totalPages <= 1) return '';

  const prevDisabled = currentPage === 1 ? 'board-page__pagination-btn--disabled' : '';
  const nextDisabled = currentPage === totalPages ? 'board-page__pagination-btn--disabled' : '';

  let pageNumbers = '';
  for (let i = 1; i <= totalPages; i++) {
    const activeClass = i === currentPage ? 'board-page__pagination-num--active' : '';
    const qs = buildBoardQs(type, year, i);
    pageNumbers += `<a href="/board${qs}" class="${activeClass}" hx-get="/board${qs}" hx-target=".app__main" hx-push-url="true">${i}</a>`;
  }

  const prevQs = currentPage > 1 ? buildBoardQs(type, year, currentPage - 1) : '';
  const nextQs = currentPage < totalPages ? buildBoardQs(type, year, currentPage + 1) : '';

  return `
    <div class="board-page__pagination">
      <div class="board-page__pagination-info">
        Showing ${(currentPage - 1) * MEMBERS_PER_PAGE + 1}-${Math.min(currentPage * MEMBERS_PER_PAGE, totalMembers)} of ${totalMembers} members
      </div>
      <div class="board-page__pagination-controls">
        <a href="${currentPage > 1 ? `/board${prevQs}` : '#'}" class="btn btn--outline btn--sm board-page__pagination-btn ${prevDisabled}" ${currentPage > 1 ? `hx-get="/board${prevQs}" hx-target=".app__main" hx-push-url="true"` : ''}>
          <i class="ph ph-caret-left" aria-hidden="true"></i>
          Previous
        </a>
        <div class="board-page__pagination-numbers">
          ${pageNumbers}
        </div>
        <a href="${currentPage < totalPages ? `/board${nextQs}` : '#'}" class="btn btn--outline btn--sm board-page__pagination-btn ${nextDisabled}" ${currentPage < totalPages ? `hx-get="/board${nextQs}" hx-target=".app__main" hx-push-url="true"` : ''}>
          Next
          <i class="ph ph-caret-right" aria-hidden="true"></i>
        </a>
      </div>
    </div>
  `;
}

function renderBoardContent(type = '', year = '', page = 1) {
  const filtered = filterMembers(type, year);
  const { members, currentPage, totalPages, totalMembers } = paginateMembers(filtered, page);
  return `
    ${renderFilters(type, year)}
    ${renderBoardGrid(members)}
    ${renderPagination(currentPage, totalPages, totalMembers, type, year)}
  `;
}

// Partial HTML for HTMX requests
export function appBoardPartial({ type = '', year = '', page = 1 } = {}) {
  return `
    ${pageHero({ title: 'Board', subtitle: 'Meet the leaders driving our mission forward' })}
    <div class="board-page">
      <div class="board-page__inner">
        ${renderBoardContent(type, year, page)}
      </div>
    </div>
  `;
}

// Full page render
export function appBoardPage({ type = '', year = '', page = 1 } = {}) {
  const content = `
    ${pageHero({ title: 'Board', subtitle: 'Meet the leaders driving our mission forward' })}
    <div class="board-page">
      <div class="board-page__inner">
        ${renderBoardContent(type, year, page)}
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
