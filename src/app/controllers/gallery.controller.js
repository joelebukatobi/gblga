// src/app/controllers/gallery.controller.js
import { appGalleryIndexPage, appGalleryIndexPartial, appGalleryAlbumPage, appGalleryAlbumPartial } from '../templates/pages/gallery/gallery.js';

const CURRENT_YEAR = new Date().getFullYear().toString();
const YEARS = [2026, 2025, 2024];

async function fetchImages(fastify, year = '') {
  const imagesResponse = await fastify.inject({
    method: 'GET',
    url: `/api/v1/images?limit=100${year ? `&year=${year}` : ''}`,
  });

  if (imagesResponse.statusCode === 200) {
    const payload = imagesResponse.json();
    return payload?.data || [];
  }
  return [];
}

export function groupImagesByYear(images) {
  const albums = {};

  images.forEach((img) => {
    const imgYear = img.createdAt ? new Date(img.createdAt).getFullYear().toString() : 'Unknown';
    if (!albums[imgYear]) {
      albums[imgYear] = {
        year: imgYear,
        images: [],
        coverImage: null,
      };
    }
    albums[imgYear].images.push(img);
    if (!albums[imgYear].coverImage) {
      albums[imgYear].coverImage = img;
    }
  });

  // Sort by year descending
  return Object.values(albums).sort((a, b) => parseInt(b.year) - parseInt(a.year));
}

export const galleryController = {
  // Gallery index - shows album cards grouped by year
  index: async (request, reply) => {
    let year = request.query?.year || '';

    if (!year) {
      year = CURRENT_YEAR;
    } else if (year === 'all') {
      year = '';
    }

    const isHtmxRequest = request.headers['hx-request'] === 'true';

    // Fetch all images to build albums
    const images = await fetchImages(request.server, year);
    const albums = groupImagesByYear(images);

    if (isHtmxRequest) {
      return reply.type('text/html').send(appGalleryIndexPartial({ albums, year }));
    }

    return reply.type('text/html').send(appGalleryIndexPage({ albums, year }));
  },

  // Album detail - shows images for a specific year
  album: async (request, reply) => {
    const { year } = request.params;
    const page = Number.parseInt(request.query?.page || '1', 10) || 1;
    const isHtmxRequest = request.headers['hx-request'] === 'true';

    // Fetch images for this year
    const images = await fetchImages(request.server, year);

    if (isHtmxRequest) {
      return reply.type('text/html').send(appGalleryAlbumPartial({ images, year, page }));
    }

    return reply.type('text/html').send(appGalleryAlbumPage({ images, year, page }));
  },
};
