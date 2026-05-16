import { renderAppLayout } from '../../layouts/main.js';
import { pageHero } from '../../components/page-hero.js';
import { renderFilterBar, renderFilterDropdown } from '../../components/filter-bar.js';

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - i);
const EVENTS_PER_PAGE = 9;

function formatEventDate(eventDate) {
  if (!eventDate) return { day: '', month: '', year: '' };
  const date = new Date(eventDate);
  return {
    day: String(date.getDate()),
    month: date.toLocaleDateString('en-US', { month: 'long' }),
    year: date.getFullYear(),
  };
}

function renderEventCard(event) {
  const { day, month, year } = formatEventDate(event.eventDate);
  const imageSrc = event.featuredImage?.path || '';

  return `
    <article class="event-card">
      <div class="event-card__media">
        ${imageSrc ? `<img src="${imageSrc}" alt="${event.title}" />` : ''}
      </div>
      <div class="event-card__body">
        <h3 class="event-card__title">${event.title}</h3>
        <p class="event-card__description">${event.description || ''}</p>
        <hr class="event-card__divider" />
        <div class="event-card__meta">
          <p>${day} ${month}, ${year} &nbsp; &#9679; &nbsp; ${event.eventTime || ''} &nbsp; &#9679; &nbsp; ${event.location || ''}</p>
        </div>
        <span class="btn btn--primary event-card__cta">RSVP</span>
      </div>
    </article>
  `;
}

function renderFilters(activeYear = '', yearParam = '') {
  const yearOptions = YEARS.map((year) => ({
    label: String(year),
    href: `/events?year=${year}`,
    hxGet: `/events?year=${year}`,
    active: String(year) === activeYear,
  }));

  const yearDropdown = renderFilterDropdown({
    page: 'events',
    label: activeYear || 'All Years',
    options: [
      { label: 'All Years', href: '/events?year=all', hxGet: '/events?year=all', active: !activeYear },
      ...yearOptions,
    ],
  });

  return renderFilterBar({ page: 'events', right: yearDropdown });
}

function renderPagination(currentPage, totalPages, totalEvents, yearParam = '') {
  if (totalPages <= 1) return '';

  const prevDisabled = currentPage === 1 ? 'events-page__pagination-btn--disabled' : '';
  const nextDisabled = currentPage === totalPages ? 'events-page__pagination-btn--disabled' : '';
  const yearQuery = yearParam ? `&year=${yearParam}` : '';

  let pageNumbers = '';
  for (let i = 1; i <= totalPages; i++) {
    const activeClass = i === currentPage ? 'events-page__pagination-num--active' : '';
    pageNumbers += `<a href="/events?page=${i}${yearQuery}" class="${activeClass}" hx-get="/events?page=${i}${yearQuery}" hx-target=".app__main" hx-push-url="true">${i}</a>`;
  }

  return `
    <div class="events-page__pagination">
      <div class="events-page__pagination-info">
        Showing ${(currentPage - 1) * EVENTS_PER_PAGE + 1}-${Math.min(currentPage * EVENTS_PER_PAGE, totalEvents)} of ${totalEvents} events
      </div>
      <div class="events-page__pagination-controls">
        <a href="${currentPage > 1 ? `/events?page=${currentPage - 1}${yearQuery}` : '#'}" class="btn btn--outline btn--sm events-page__pagination-btn ${prevDisabled}" ${currentPage > 1 ? `hx-get="/events?page=${currentPage - 1}${yearQuery}" hx-target=".app__main" hx-push-url="true"` : ''}>
          <i class="ph ph-caret-left" aria-hidden="true"></i>
          Previous
        </a>
        <div class="events-page__pagination-numbers">
          ${pageNumbers}
        </div>
        <a href="${currentPage < totalPages ? `/events?page=${currentPage + 1}${yearQuery}` : '#'}" class="btn btn--outline btn--sm events-page__pagination-btn ${nextDisabled}" ${currentPage < totalPages ? `hx-get="/events?page=${currentPage + 1}${yearQuery}" hx-target=".app__main" hx-push-url="true"` : ''}>
          Next
          <i class="ph ph-caret-right" aria-hidden="true"></i>
        </a>
      </div>
    </div>
  `;
}

function renderEventsGrid(events) {
  if (events.length === 0) {
    return `<p class="events-page__empty">No events found for the selected year.</p>`;
  }
  return `
    <div class="events-page__grid">
      ${events.map(renderEventCard).join('')}
    </div>
  `;
}

function renderEventsContent(events, page, totalPages, totalEvents, year = '', yearParam = '') {
  return `
    ${renderFilters(year, yearParam)}
    ${renderEventsGrid(events)}
    ${renderPagination(page, totalPages, totalEvents, yearParam)}
  `;
}

// Partial HTML for HTMX requests
export function appEventsPartial({
  events = [],
  currentPage = 1,
  totalPages = 1,
  totalEvents = 0,
  year = '',
  yearParam = '',
} = {}) {
  return `
    ${pageHero({ title: 'Events', subtitle: 'Upcoming and past events from our community' })}
    <div class="events-page">
      <div class="events-page__inner">
        ${renderEventsContent(events, currentPage, totalPages, totalEvents, year, yearParam)}
      </div>
    </div>
  `;
}

// Full page render
export function appEventsPage({
  events = [],
  currentPage = 1,
  totalPages = 1,
  totalEvents = 0,
  year = '',
  yearParam = '',
} = {}) {
  const content = `
    ${pageHero({ title: 'Events', subtitle: 'Upcoming and past events from our community' })}
    <div class="events-page">
      <div class="events-page__inner">
        ${renderEventsContent(events, currentPage, totalPages, totalEvents, year, yearParam)}
      </div>
    </div>
  `;

  return renderAppLayout({
    title: 'Events - GBLGA',
    bodyClass: 'events-page',
    content,
    activeRoute: '/events',
    meta: {
      description: 'Upcoming and past events from the Gabelli Black and LatinX Graduate Association community.',
    },
  });
}
