import { appHomePage } from '../templates/pages/home/home.js';
import { groupImagesByYear } from './gallery.controller.js';

class HomeController {
  async index(request, reply) {
    // Fetch images from API for gallery preview
    const imagesResponse = await request.server.inject({
      method: 'GET',
      url: '/api/v1/images?limit=100',
    });

    let images = [];
    if (imagesResponse.statusCode === 200) {
      const payload = imagesResponse.json();
      images = payload?.data || [];
    }

    // Group images into year albums for the preview
    const albums = groupImagesByYear(images);

    return reply.type('text/html').send(appHomePage({ albums }));
  }
}

export const homeController = new HomeController();
