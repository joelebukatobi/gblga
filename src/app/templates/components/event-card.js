export function renderEventCard(event = {}) {
  const {
    title = 'Event Title',
    description = '',
    day = '01',
    month = 'Jan',
    year = '2026',
    location = 'Location',
    time = 'Time',
    href = '#',
  } = event;

  return `
    <a class="event-card" href="${href}">
      <article class="event-card__inner">
        <div class="event-card__media">
          <div class="event-card__media-bg" data-bg="/public/uploads/images/gblga-bhm-ig.png"></div>
          <img class="event-card__media-img" src="/public/uploads/images/gblga-bhm-ig.png" alt="${title}" />
        </div>
        <div class="event-card__body">
          <h3 class="event-card__title">${title}</h3>
          <p class="event-card__description">${description}</p>
          <hr class="event-card__divider" />
          <div class="event-card__meta">
            <p class="event-details">${day} ${month}, ${year} &nbsp; &#9679; &nbsp; ${time} &nbsp; &#9679; &nbsp; ${location}</p>
          </div>
          <span class="btn btn--primary event-card__cta">RSVP</span>
        </div>
      </article>
    </a>
  `;
}
