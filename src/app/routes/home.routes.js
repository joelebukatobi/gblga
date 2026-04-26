import { homeController } from '../controllers/home.controller.js';
import { blogController } from '../controllers/blog.controller.js';
import { boardController } from '../controllers/board.controller.js';
import { eventsController } from '../controllers/events.controller.js';
import { galleryController } from '../controllers/gallery.controller.js';

export default async function homeRoutes(fastify) {
  fastify.get('/', homeController.index.bind(homeController));
  fastify.get('/blog', blogController.index.bind(blogController));
  fastify.get('/blog/:slug', blogController.show.bind(blogController));
  fastify.get('/board', boardController.index.bind(boardController));
  fastify.get('/events', eventsController.index.bind(eventsController));
  fastify.get('/gallery', galleryController.index.bind(galleryController));
  fastify.get('/gallery/:year', galleryController.album.bind(galleryController));
}
