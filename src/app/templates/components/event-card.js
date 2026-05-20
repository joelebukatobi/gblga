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
    externalLink = '',
  } = event;

  const dateStr = [day, month, year].filter(Boolean).join(' ');
  const metaItems = [dateStr, time, location].filter(Boolean);
  const meta = metaItems.length
    ? `<p class="event-details">${metaItems.join(' &nbsp; &#9679; &nbsp; ')}</p>`
    : '';

  const linkUrl = externalLink || href;
  const ctaText = externalLink ? 'Learn More &amp; RSVP' : 'See Event';

  return `
    <a class="event-card" href="${linkUrl}">
      <article class="event-card__inner">
        <div class="event-card__media">
          ${image ? `<img src="${image}" alt="${title}" />` : ''}
        </div>
        <div class="event-card__body">
          <h3 class="event-card__title">${title}</h3>
          <p class="event-card__description">${description}</p>
          ${meta ? `<hr class="event-card__divider" /><div class="event-card__meta">${meta}</div>` : ''}
          <span class="btn btn--primary event-card__cta">${ctaText}</span>
        </div>
      </article>
    </a>
  `;
}
