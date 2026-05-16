import { renderAppLayout } from '../../layouts/main.js';
import { pageHero } from '../../components/page-hero.js';
import { renderFilterBar } from '../../components/filter-bar.js';

const MEDIA_PER_PAGE = 9;

function renderAlbumCard(album) {
  const coverImage = album.coverImage
    ? album.coverImage.path
    : '/public/uploads/images/featured-posts.jpg';
  const mediaCount = album.mediaCount || 0;
  const itemLabel = mediaCount === 1 ? 'item' : 'items';

  return `
    <article class="gallery-album">
      <a href="/gallery/${album.slug}" aria-label="View ${album.title}" hx-get="/gallery/${album.slug}" hx-target=".app__main" hx-push-url="true">
        <img src="${coverImage}" alt="${album.title} album cover" loading="lazy" />
        <div class="gallery-album__overlay">
          <h3 class="gallery-album__title">${album.title}</h3>
          <p class="gallery-album__count">${mediaCount} ${itemLabel}</p>
        </div>
      </a>
    </article>
  `;
}

function isVideo(media) {
  return media.mimeType && media.mimeType.startsWith('video/');
}

function renderMediaCard(media, albumSlug) {
  const isVideoFile = isVideo(media);
  const mediaUrl = media.path || media.thumbnailPath || '/public/uploads/images/featured-posts.jpg';
  const title = media.title || media.originalName || 'Gallery Media';
  const lightboxGroup = `gallery-${albumSlug}`;

  if (isVideoFile) {
    return `
      <article class="gallery-card gallery-card--video">
        <a href="${media.path}" data-fslightbox="${lightboxGroup}" data-caption="${title}">
          <div class="gallery-card__video-thumbnail">
            <img src="${media.thumbnailPath || '/public/uploads/images/featured-posts.jpg'}" alt="${title}" loading="lazy" />
            <div class="gallery-card__play-icon">
              <i class="ph ph-play-circle" aria-hidden="true"></i>
            </div>
          </div>
        </a>
        <div class="gallery-card__overlay">
          <h3>${title}</h3>
        </div>
      </article>
    `;
  }

  return `
    <article class="gallery-card">
      <a href="${media.path}" data-fslightbox="${lightboxGroup}" data-caption="${title}">
        <img src="${mediaUrl}" alt="${title}" loading="lazy" />
      </a>
      <div class="gallery-card__overlay">
        <h3>${title}</h3>
      </div>
    </article>
  `;
}

function renderBackLink() {
  return `
    <div class="gallery-page__back">
      <a href="/gallery" hx-get="/gallery" hx-target=".app__main" hx-push-url="true" class="gallery-page__back-link">
        <i class="ph ph-arrow-left" aria-hidden="true"></i> Back to Gallery
      </a>
    </div>
  `;
}

function renderPagination({ page, totalPages, total, albumSlug }) {
  if (totalPages <= 1) return '';

  const prevDisabled = page === 1 ? 'gallery-page__pagination-btn--disabled' : '';
  const nextDisabled = page === totalPages ? 'gallery-page__pagination-btn--disabled' : '';

  let pageNumbers = '';
  for (let i = 1; i <= totalPages; i++) {
    const activeClass = i === page ? 'gallery-page__pagination-num--active' : '';
    pageNumbers += `<a href="/gallery/${albumSlug}?page=${i}" class="${activeClass}" hx-get="/gallery/${albumSlug}?page=${i}" hx-target=".app__main" hx-push-url="true">${i}</a>`;
  }

  return `
    <div class="gallery-page__pagination">
      <div class="gallery-page__pagination-info">
        Showing ${(page - 1) * MEDIA_PER_PAGE + 1}-${Math.min(page * MEDIA_PER_PAGE, total)} of ${total} items
      </div>
      <div class="gallery-page__pagination-controls">
        <a href="${page > 1 ? `/gallery/${albumSlug}?page=${page - 1}` : '#'}" class="btn btn--outline btn--sm gallery-page__pagination-btn ${prevDisabled}" ${page > 1 ? `hx-get="/gallery/${albumSlug}?page=${page - 1}" hx-target=".app__main" hx-push-url="true"` : ''}>
          <i class="ph ph-caret-left" aria-hidden="true"></i>
          Previous
        </a>
        <div class="gallery-page__pagination-numbers">
          ${pageNumbers}
        </div>
        <a href="${page < totalPages ? `/gallery/${albumSlug}?page=${page + 1}` : '#'}" class="btn btn--outline btn--sm gallery-page__pagination-btn ${nextDisabled}" ${page < totalPages ? `hx-get="/gallery/${albumSlug}?page=${page + 1}" hx-target=".app__main" hx-push-url="true"` : ''}>
          Next
          <i class="ph ph-caret-right" aria-hidden="true"></i>
        </a>
      </div>
    </div>
  `;
}

// ============================================================================
// GALLERY INDEX - Album Cards
// ============================================================================

export function appGalleryIndexPartial({ albums = [] } = {}) {
  const albumCards = albums.map(renderAlbumCard).join('');
  const emptyState = albums.length === 0
    ? '<p class="gallery-page__empty">No albums found yet. Check back soon!</p>'
    : '';

  return `
    ${pageHero({ title: 'Gallery', subtitle: 'Moments from our events and community' })}
    <div class="gallery-page">
      <div class="gallery-page__inner">
        <div class="gallery-page__albums">
          ${albumCards}
          ${emptyState}
        </div>
      </div>
    </div>
  `;
}

export function appGalleryIndexPage({ albums = [] } = {}) {
  const content = appGalleryIndexPartial({ albums });

  return renderAppLayout({
    title: 'Gallery - GBLGA',
    bodyClass: 'gallery-page',
    content,
    activeRoute: '/gallery',
    meta: {
      description: 'Moments from our events and community. Explore photo albums from the Gabelli Black and LatinX Graduate Association.',
    },
  });
}

// ============================================================================
// GALLERY ALBUM DETAIL - Media Grid with Lightbox
// ============================================================================

export function appGalleryAlbumPartial({ album, media = [], pagination } = {}) {
  const { page, totalPages, total } = pagination || {};
  const mediaCards = media.map((m) => renderMediaCard(m, album.slug)).join('');
  const emptyState = media.length === 0
    ? '<p class="gallery-page__empty">No media found in this album yet.</p>'
    : '';

  const albumMeta = renderBackLink();

  return `
    ${pageHero({ title: album.title, subtitle: album.description || '', meta: albumMeta })}
    <div class="gallery-page">
      <div class="gallery-page__inner">
        <div class="gallery-page__grid">
          ${mediaCards}
          ${emptyState}
        </div>
        ${renderPagination({ page, totalPages, total, albumSlug: album.slug })}
      </div>
    </div>
  `;
}

export function appGalleryAlbumPage({ album, media = [], pagination } = {}) {
  const content = appGalleryAlbumPartial({ album, media, pagination });

  return renderAppLayout({
    title: `${album.title} - Gallery - GBLGA`,
    bodyClass: 'gallery-page',
    content,
    activeRoute: '/gallery',
    meta: {
      description: album.description || `Photos and videos from ${album.title} — Gabelli Black and LatinX Graduate Association.`,
      ogImage: album.coverImage?.path || '/dist/images/gblga-logo.svg',
    },
  });
}
