import { renderAppLayout } from '../../layouts/main.js';
import { pageHero } from '../../components/page-hero.js';
import { renderFilterBar, renderFilterDropdown } from '../../components/filter-bar.js';

const EVENTS = [
  {
    title: 'Cultural Exchange Night',
    description: 'An evening celebrating the traditions, food, and art of our Black and LatinX communities.',
    day: '28',
    month: 'February',
    year: 2026,
    location: 'Gabelli Commons 62nd West Lincoln Center Manhattan',
    time: '6:00 PM',
  },
  {
    title: 'Industry Panel & Screening',
    description: 'Hear from alumni leaders across finance, consulting, and tech about navigating early career.',
    day: '30',
    month: 'March',
    year: 2026,
    location: 'Hughes Hall 202',
    time: '5:30 PM',
  },
  {
    title: 'Alumni Mixer',
    description: 'A curated networking night connecting current students with GBLGA alumni across industries.',
    day: '28',
    month: 'April',
    year: 2026,
    location: 'Lincoln Center',
    time: '7:00 PM',
  },
  {
    title: 'Leadership Summit',
    description: 'A day-long conference featuring keynote speakers, workshops, and panels on leadership in diverse spaces.',
    day: '15',
    month: 'November',
    year: 2025,
    location: 'Gabelli School of Business',
    time: '9:00 AM',
  },
  {
    title: 'Community Service Day',
    description: 'Volunteering together at local organizations to give back to the communities that support us.',
    day: '12',
    month: 'October',
    year: 2025,
    location: 'Bronx Community Center',
    time: '10:00 AM',
  },
  {
    title: 'Mentorship Kickoff',
    description: 'Launching the annual mentorship program pairing students with industry professionals.',
    day: '20',
    month: 'September',
    year: 2025,
    location: 'Fordham Lincoln Center',
    time: '6:00 PM',
  },
  {
    title: 'Black History Month Gala',
    description: 'An elegant evening celebrating Black excellence with performances, awards, and networking.',
    day: '22',
    month: 'February',
    year: 2024,
    location: 'Plaza Hotel',
    time: '7:00 PM',
  },
  {
    title: 'LatinX Heritage Festival',
    description: 'A vibrant festival showcasing LatinX culture through music, dance, food, and art.',
    day: '28',
    month: 'September',
    year: 2024,
    location: 'Central Park',
    time: '12:00 PM',
  },
  {
    title: 'Spring Networking Brunch',
    description: 'A casual brunch for students and alumni to connect and share experiences over good food.',
    day: '15',
    month: 'March',
    year: 2026,
    location: 'The Boathouse Central Park',
    time: '11:00 AM',
  },
  {
    title: 'Career Fair Prep Workshop',
    description: 'Resume reviews, mock interviews, and networking tips to get ready for recruiting season.',
    day: '10',
    month: 'January',
    year: 2026,
    location: 'Gabelli School Room 301',
    time: '4:00 PM',
  },
  {
    title: 'End of Year Celebration',
    description: 'A celebration of the graduating class with awards, speeches, and reflections on the year.',
    day: '05',
    month: 'May',
    year: 2025,
    location: 'Rose Hill Campus',
    time: '6:00 PM',
  },
];

const YEARS = [2026, 2025, 2024];
const EVENTS_PER_PAGE = 9;

function renderEventCard(event) {
  return `
    <article class="event-card">
      <div class="event-card__media">
        <img src="/public/uploads/images/gblga-bhm-ig.png" alt="${event.title}" />
      </div>
      <div class="event-card__body">
        <h3 class="event-card__title">${event.title}</h3>
        <p class="event-card__description">${event.description}</p>
        <hr class="event-card__divider" />
        <div class="event-card__meta">
          <p>${event.day} ${event.month}, ${event.year} &nbsp; &#9679; &nbsp; ${event.time} &nbsp; &#9679; &nbsp; ${event.location}</p>
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

function filterEvents(year = '') {
  return EVENTS.filter(e => {
    return !year || String(e.year) === year;
  });
}

function paginateEvents(events, page = 1) {
  const totalEvents = events.length;
  const totalPages = Math.ceil(totalEvents / EVENTS_PER_PAGE);
  const currentPage = Math.min(Math.max(page, 1), totalPages || 1);
  const start = (currentPage - 1) * EVENTS_PER_PAGE;
  const paginatedEvents = events.slice(start, start + EVENTS_PER_PAGE);

  return {
    events: paginatedEvents,
    currentPage,
    totalPages,
    totalEvents,
  };
}

function renderEventsContent(events, page, totalPages, totalEvents, year = '', yearParam = '') {
  return `
    ${renderFilters(year, yearParam)}
    ${renderEventsGrid(events)}
    ${renderPagination(page, totalPages, totalEvents, yearParam)}
  `;
}

// Partial HTML for HTMX requests
export function appEventsPartial({ page = 1, year = '', yearParam = '' } = {}) {
  const filtered = filterEvents(year);
  const { events, currentPage, totalPages, totalEvents } = paginateEvents(filtered, page);

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
export function appEventsPage({ page = 1, year = '', yearParam = '' } = {}) {
  const filtered = filterEvents(year);
  const { events, currentPage, totalPages, totalEvents } = paginateEvents(filtered, page);

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
  });
}
