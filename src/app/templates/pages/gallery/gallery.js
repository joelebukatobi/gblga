import { renderAppLayout } from '../../layouts/main.js';
import { pageHero } from '../../components/page-hero.js';
import { renderFilterBar, renderFilterDropdown } from '../../components/filter-bar.js';

const YEARS = [2026, 2025, 2024];
const IMAGES_PER_PAGE = 9;

function renderAlbumCard(album) {
  const coverImage = album.coverImage
    ? (album.coverImage.thumbnailPath || album.coverImage.path)
    : '/public/uploads/images/featured-posts.jpg';
  const imageCount = album.images.length;

  return `
    <article class="gallery-album">
      <a href="/gallery/${album.year}" aria-label="View ${album.year} album" hx-get="/gallery/${album.year}" hx-target=".app__main" hx-push-url="true">
        <img src="${coverImage}" alt="${album.year} album cover" loading="lazy" />
        <div class="gallery-album__overlay">
          <h3 class="gallery-album__title">${album.year}</h3>
          <p class="gallery-album__count">${imageCount} photo${imageCount !== 1 ? 's' : ''}</p>
        </div>
      </a>
    </article>
  `;
}

function renderGalleryCard(image) {
  const imageUrl = image.path || image.thumbnailPath || '/public/uploads/images/featured-posts.jpg';
  const title = image.title || image.originalName || 'Gallery Image';

  return `
    <article class="gallery-card">
      <a href="${image.path}" data-fslightbox="gallery-${image.year || 'all'}" data-caption="${title}">
        <img src="${imageUrl}" alt="${title}" loading="lazy" />
      </a>
      <div class="gallery-card__overlay">
        <h3>${title}</h3>
      </div>
    </article>
  `;
}

function renderFilters(activeYear = '') {
  const yearOptions = YEARS.map((year) => ({
    label: String(year),
    href: `/gallery?year=${year}`,
    hxGet: `/gallery?year=${year}`,
    active: String(year) === activeYear,
  }));

  const yearDropdown = renderFilterDropdown({
    page: 'gallery',
    label: activeYear || 'All Years',
    options: [
      { label: 'All Years', href: '/gallery?year=all', hxGet: '/gallery?year=all', active: !activeYear },
      ...yearOptions,
    ],
  });

  return renderFilterBar({ page: 'gallery', right: yearDropdown });
}

function paginateImages(images, page = 1) {
  const totalImages = images.length;
  const totalPages = Math.ceil(totalImages / IMAGES_PER_PAGE);
  const currentPage = Math.min(Math.max(page, 1), totalPages || 1);
  const start = (currentPage - 1) * IMAGES_PER_PAGE;
  const paginatedImages = images.slice(start, start + IMAGES_PER_PAGE);

  return {
    images: paginatedImages,
    currentPage,
    totalPages,
    totalImages,
  };
}

function renderPagination(currentPage, totalPages, totalImages, year) {
  if (totalPages <= 1) return '';

  const prevDisabled = currentPage === 1 ? 'gallery-page__pagination-btn--disabled' : '';
  const nextDisabled = currentPage === totalPages ? 'gallery-page__pagination-btn--disabled' : '';

  let pageNumbers = '';
  for (let i = 1; i <= totalPages; i++) {
    const activeClass = i === currentPage ? 'gallery-page__pagination-num--active' : '';
    pageNumbers += `<a href="/gallery/${year}?page=${i}" class="${activeClass}" hx-get="/gallery/${year}?page=${i}" hx-target=".app__main" hx-push-url="true">${i}</a>`;
  }

  return `
    <div class="gallery-page__pagination">
      <div class="gallery-page__pagination-info">
        Showing ${(currentPage - 1) * IMAGES_PER_PAGE + 1}-${Math.min(currentPage * IMAGES_PER_PAGE, totalImages)} of ${totalImages} photos
      </div>
      <div class="gallery-page__pagination-controls">
        <a href="${currentPage > 1 ? `/gallery/${year}?page=${currentPage - 1}` : '#'}" class="btn btn--outline btn--sm gallery-page__pagination-btn ${prevDisabled}" ${currentPage > 1 ? `hx-get="/gallery/${year}?page=${currentPage - 1}" hx-target=".app__main" hx-push-url="true"` : ''}>
          <i class="ph ph-caret-left" aria-hidden="true"></i>
          Previous
        </a>
        <div class="gallery-page__pagination-numbers">
          ${pageNumbers}
        </div>
        <a href="${currentPage < totalPages ? `/gallery/${year}?page=${currentPage + 1}` : '#'}" class="btn btn--outline btn--sm gallery-page__pagination-btn ${nextDisabled}" ${currentPage < totalPages ? `hx-get="/gallery/${year}?page=${currentPage + 1}" hx-target=".app__main" hx-push-url="true"` : ''}>
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

export function appGalleryIndexPartial({ albums = [], year = '' } = {}) {
  const albumCards = albums.map(renderAlbumCard).join('');
  const emptyState = albums.length === 0
    ? '<p class="gallery-page__empty">No albums found.</p>'
    : '';

  return `
    ${pageHero({ title: 'Gallery', subtitle: 'Moments from our events and community' })}
    <div class="gallery-page">
      <div class="gallery-page__inner">
        ${renderFilters(year)}
        <div class="gallery-page__albums">
          ${albumCards}
          ${emptyState}
        </div>
      </div>
    </div>
  `;
}

export function appGalleryIndexPage({ albums = [], year = '' } = {}) {
  const content = appGalleryIndexPartial({ albums, year });

  return renderAppLayout({
    title: 'Gallery - GBLGA',
    bodyClass: 'gallery-page',
    content,
    activeRoute: '/gallery',
  });
}

// ============================================================================
// GALLERY ALBUM DETAIL - Image Grid with Lightbox
// ============================================================================

export function appGalleryAlbumPartial({ images = [], year = '', page = 1 } = {}) {
  const { images: paginatedImages, currentPage, totalPages, totalImages } = paginateImages(images, page);
  const imageCards = paginatedImages.map(renderGalleryCard).join('');
  const emptyState = images.length === 0
    ? '<p class="gallery-page__empty">No images found in this album.</p>'
    : '';

  const albumMeta = `
    <a href="/gallery" hx-get="/gallery" hx-target=".app__main" hx-push-url="true">Back to Gallery</a>
  `;

  return `
    ${pageHero({ title: year, meta: albumMeta })}
    <div class="gallery-page">
      <div class="gallery-page__inner">
        <div class="gallery-page__grid">
          ${imageCards}
          ${emptyState}
        </div>
        ${renderPagination(currentPage, totalPages, totalImages, year)}
      </div>
    </div>
  `;
}

export function appGalleryAlbumPage({ images = [], year = '', page = 1 } = {}) {
  const content = appGalleryAlbumPartial({ images, year, page });

  return renderAppLayout({
    title: `${year} Album - GBLGA`,
    bodyClass: 'gallery-page',
    content,
    activeRoute: '/gallery',
  });
}
