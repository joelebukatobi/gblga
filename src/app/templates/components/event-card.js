function truncateText(text, maxLength) {
  if (!text || text.length <= maxLength) return text || '';
  return text.substring(0, maxLength).trim() + '...';
}

export function renderEventCard(event = {}) {
  const {
    title = '',
    description = '',
    day = '',
    month = '',
    year = '',
    location = '',
    time = '',
    href = '#',
    image = '',
  } = event;

  const dateStr = [day, month, year].filter(Boolean).join(' ');
  const metaItems = [dateStr, time, location].filter(Boolean);
  const meta = metaItems.length
    ? `<p class="event-details">${metaItems.join(' &nbsp; &#9679; &nbsp; ')}</p>`
    : '';

  const truncatedDescription = truncateText(description, 150);

  return `
    <a class="event-card" href="${href}">
      <article class="event-card__inner">
        <div class="event-card__media">
          ${image ? `<img src="${image}" alt="${title}" />` : ''}
        </div>
        <div class="event-card__body">
          <h3 class="event-card__title">${title}</h3>
          <p class="event-card__description">${truncatedDescription}</p>
          ${meta ? `<hr class="event-card__divider" /><div class="event-card__meta">${meta}</div>` : ''}
          <span class="btn btn--primary event-card__cta">RSVP</span>
        </div>
      </article>
    </a>
  `;
}
