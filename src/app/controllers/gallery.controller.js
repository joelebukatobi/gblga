import { appGalleryPage } from '../templates/pages/gallery/gallery.js';

export const galleryController = {
  index: async (request, reply) => {
    return reply.type('text/html').send(appGalleryPage());
  },
};
