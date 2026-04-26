// src/app/controllers/gallery.controller.js
import { appGalleryIndexPage, appGalleryIndexPartial, appGalleryAlbumPage, appGalleryAlbumPartial } from '../templates/pages/gallery/gallery.js';
import albumsService from '../../services/albums.service.js';

async function getAlbumsWithCounts() {
  const { data: albums } = await albumsService.getAll({ limit: 100 });

  // Get media count for each album
  const albumsWithCounts = await Promise.all(
    albums.map(async (album) => {
      const mediaResult = await albumsService.getAlbumMedia(album.id, { limit: 1000 });
      const coverImage = album.coverImage;
      return {
        ...album,
        mediaCount: mediaResult.pagination.total,
        coverImage,
      };
    })
  );

  return albumsWithCounts;
}

export const galleryController = {
  // Gallery index - shows real album cards
  index: async (request, reply) => {
    const isHtmxRequest = request.headers['hx-request'] === 'true';
    const albums = await getAlbumsWithCounts();

    if (isHtmxRequest) {
      return reply.type('text/html').send(appGalleryIndexPartial({ albums }));
    }

    return reply.type('text/html').send(appGalleryIndexPage({ albums }));
  },

  // Album detail - shows media for a specific album (by slug)
  album: async (request, reply) => {
    const { slug } = request.params;
    const page = Number.parseInt(request.query?.page || '1', 10) || 1;
    const isHtmxRequest = request.headers['hx-request'] === 'true';

    const album = await albumsService.getBySlug(slug);

    if (!album) {
      return reply.status(404).send('Album not found');
    }

    // Fetch media (images + videos) in this album
    const mediaResult = await albumsService.getAlbumMedia(album.id, { page, limit: 9 });

    if (isHtmxRequest) {
      return reply.type('text/html').send(
        appGalleryAlbumPartial({ album, media: mediaResult.data, pagination: mediaResult.pagination })
      );
    }

    return reply.type('text/html').send(
      appGalleryAlbumPage({ album, media: mediaResult.data, pagination: mediaResult.pagination })
    );
  },
};
