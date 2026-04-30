import { renderAppLayout } from '../../layouts/main.js';
import { renderEventCard } from '../../components/event-card.js';

// Hero Section
function hero() {
  return `
    <section class="hero" aria-label="Hero">
      <div class="hero__media" aria-hidden="true"></div>
      <div class="hero__overlay" aria-hidden="true"></div>
      <div class="hero__inner">
        <div class="hero__content">
          <h1 class="hero__title">Experience Community, Culture, and Connection.</h1>
          <p class="hero__subtitle">
            The Gabelli Black and LatinX Graduate Association empowers students at
            Fordham University's Gabelli School of Business through mentorship,
            professional development, and cultural celebration.
          </p>
        </div>
      </div>
    </section>
  `;
}

// About Section
function about() {
  return `
    <section class="about" aria-labelledby="about-title">
      <div class="about__inner">
        <div class="about__grid">
          <div class="about__left">
            <img class="about__seal-bg" src="/dist/images/gblga-logo-icon-beige.svg" alt="" aria-hidden="true" />
            <img class="about__seal" src="/dist/images/gblga-logo-icon-beige.svg" alt="GBLGA Seal" aria-hidden="true" />
          </div>
          <div class="about__right">
            <h2 id="about-title" class="about__heading">About Us</h2>
            <p class="about__body">
              The Gabelli Black and LatinX Graduate Association is a student-led
              organization at Fordham University's Gabelli School of Business. We
              create space for community, culture, and career advancement — building
              a network where Black and LatinX graduate students can thrive together.
            </p>
            <div class="about__photos">
              <img class="about__photo" src="https://images.unsplash.com/photo-1694175271713-a6e2cc378980?q=80&w=765&auto=format&fit=crop" alt="GBLGA Event" aria-hidden="true" />
              <img class="about__photo" src="https://images.unsplash.com/photo-1661461793337-a060b7c5db15?q=80&w=688&auto=format&fit=crop" alt="GBLGA Community" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

// Upcoming Events Section
function upcomingEvents({ events = [] } = {}) {
  const cards = events.map(renderEventCard).join('');
  return `
    <section class="upcoming-events" aria-labelledby="upcoming-events-title">
      <div class="upcoming-events__inner">
        <div class="upcoming-events__header">
          <h2 id="upcoming-events-title" class="upcoming-events__title">Upcoming Events</h2>
          <div class="upcoming-events__see-all">
            <a class="upcoming-events__see-all-link" href="/events">See All Events</a>
            <i class="ph ph-arrow-right" aria-hidden="true"></i>
          </div>
        </div>
        ${events.length > 0
          ? `<div class="upcoming-events__grid">${cards}</div>`
          : `<p class="upcoming-events__empty">No upcoming events at the moment. Check back soon!</p>`
        }
      </div>
    </section>
  `;
}

// Gallery Section
function gallery({ albums = [] } = {}) {
  const tiles = albums.length > 0
    ? albums.map((album) => {
        const coverImage = album.coverImage
          ? album.coverImage.path
          : '/public/uploads/images/featured-posts.jpg';
        const mediaCount = album.mediaCount || 0;
        const itemLabel = mediaCount === 1 ? 'item' : 'items';
        return `
          <article class="gallery-item gallery-item--album">
            <a href="/gallery/${album.slug}" aria-label="View ${album.title}" hx-get="/gallery/${album.slug}" hx-target=".app__main" hx-push-url="true">
              <div class="gallery-item__media" aria-hidden="true">
                <img src="${coverImage}" alt="${album.title} album cover" loading="lazy" />
              </div>
              <div class="gallery-item__overlay">
                <span class="gallery-item__year">${album.title}</span>
                <span class="gallery-item__count">${mediaCount} ${itemLabel}</span>
              </div>
            </a>
          </article>
        `;
      }).join('')
    : '';

  return `
    <section class="gallery" aria-labelledby="gallery-title">
      <div class="gallery__inner">
        <div class="gallery__header">
          <h2 id="gallery-title" class="gallery__title">Gallery</h2>
          <div class="gallery__view-all">
            <a class="gallery__view-all-link" href="/gallery">View All Albums</a>
            <i class="ph ph-arrow-right" aria-hidden="true"></i>
          </div>
        </div>
        <div class="gallery__grid">
          ${tiles}
        </div>
      </div>
    </section>
  `;
}

// Newsletter Section
function newsletter() {
  return `
    <section class="newsletter" aria-labelledby="newsletter-title">
      <div class="newsletter__inner">
        <div class="newsletter__media" aria-hidden="true">
          <img src="/public/uploads/images/newsletter-bg.jpg" alt="" />
        </div>
        <div class="newsletter__content">
          <p class="newsletter__eyebrow">Newsletter</p>
          <h2 id="newsletter-title" class="newsletter__title">Stay Updated with GBLGA</h2>
          <p class="newsletter__quote">
            "Stay connected with events, opportunities, and stories from our community."
          </p>
          <form class="newsletter-form" action="#" method="post">
            <label class="visually-hidden" for="newsletter-email">Email address</label>
            <input
              id="email"
              class="input"
              type="email"
              name="email"
              placeholder="Enter your email"
              required
            />
            <button class="btn btn--primary" type="submit">Subscribe</button>
          </form>
        </div>
      </div>
    </section>
  `;
}

// Home Page Composer
export function appHomePage({ albums = [], events = [] } = {}) {
  const content = `
    ${hero()}
    <div class="home">
      ${about()}
      ${upcomingEvents({ events })}
      ${gallery({ albums })}
      ${newsletter()}
    </div>
  `;

  return renderAppLayout({
    title: 'GBLGA · Gabelli Black and LatinX Graduate Association',
    bodyClass: 'home-page',
    content,
    activeRoute: '/',
  });
}
