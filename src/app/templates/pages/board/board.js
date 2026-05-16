import { renderAppLayout } from '../../layouts/main.js';
import { pageHero } from '../../components/page-hero.js';
import { renderFilterBar, renderFilterTag, renderFilterDropdown } from '../../components/filter-bar.js';

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - i);
const MEMBERS_PER_PAGE = 9;

function getNameInitials(name) {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || '';
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function renderBoardMember(member) {
  const photoUrl = member.photoUrl || member.photo?.path || null;
  const initials = getNameInitials(member.name);

  return `
    <article class="board-member">
      <div class="board-member__photo">
        ${photoUrl
          ? `<img src="${photoUrl}" alt="${member.name}" />`
          : `<div class="board-member__initials">${initials}</div>`
        }
      </div>
      <div class="board-member__info">
        <h3 class="board-member__name">${member.name}</h3>
        <p class="board-member__role">${member.role}</p>
        <p class="board-member__bio">${member.bio || ''}</p>
      </div>
    </article>
  `;
}

function renderFilters(activeType = '', activeYear = '') {
  const typeParam = activeType ? `type=${activeType}` : '';

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

function renderBoardContent(members, currentPage, totalPages, totalMembers, type = '', year = '') {
  return `
    ${renderFilters(type, year)}
    ${renderBoardGrid(members)}
    ${renderPagination(currentPage, totalPages, totalMembers, type, year)}
  `;
}

// Partial HTML for HTMX requests
export function appBoardPartial({
  members = [],
  currentPage = 1,
  totalPages = 1,
  totalMembers = 0,
  type = '',
  year = '',
} = {}) {
  return `
    ${pageHero({ title: 'Board', subtitle: 'Meet the leaders driving our mission forward' })}
    <div class="board-page">
      <div class="board-page__inner">
        ${renderBoardContent(members, currentPage, totalPages, totalMembers, type, year)}
      </div>
    </div>
  `;
}

// Full page render
export function appBoardPage({
  members = [],
  currentPage = 1,
  totalPages = 1,
  totalMembers = 0,
  type = '',
  year = '',
} = {}) {
  const content = `
    ${pageHero({ title: 'Board', subtitle: 'Meet the leaders driving our mission forward' })}
    <div class="board-page">
      <div class="board-page__inner">
        ${renderBoardContent(members, currentPage, totalPages, totalMembers, type, year)}
      </div>
    </div>
  `;

  return renderAppLayout({
    title: 'Board - GBLGA',
    bodyClass: 'board-page',
    content,
    activeRoute: '/board',
    meta: {
      description: 'Meet the leaders driving our mission forward. View current and past board members of the Gabelli Black and LatinX Graduate Association.',
    },
  });
}
