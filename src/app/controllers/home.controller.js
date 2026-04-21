import { appHomePage } from '../templates/pages/home/home.js';

class HomeController {
  async index(request, reply) {
    return reply.type('text/html').send(appHomePage());
  }
}

export const homeController = new HomeController();
