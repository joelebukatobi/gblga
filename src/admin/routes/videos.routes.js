// src/admin/routes/videos.routes.js
// Videos routes - admin media library

import { videosController } from '../controllers/videos.controller.js';
import { requireAuthRedirect } from '../../middleware/authenticate.js';

/**
 * Register video routes
 * @param {FastifyInstance} fastify - Fastify instance
 * @param {Object} opts - Route options
 */
export default async function videosRoutes(fastify, opts) {
  // GET /admin/media/videos - List all videos
  fastify.get('/', {
    preHandler: requireAuthRedirect('/admin/auth/login'),
    handler: videosController.list.bind(videosController),
  });

  // GET /admin/media/videos/new - Show new video form
  fastify.get('/new', {
    preHandler: requireAuthRedirect('/admin/auth/login'),
    handler: videosController.showNewForm.bind(videosController),
  });

  // POST /admin/media/videos - Upload video
  fastify.post('/', {
    preHandler: requireAuthRedirect('/admin/auth/login'),
    handler: videosController.upload.bind(videosController),
  });

  // GET /admin/media/videos/:id/edit - Show edit form
  fastify.get('/:id/edit', {
    preHandler: requireAuthRedirect('/admin/auth/login'),
    handler: videosController.showEditForm.bind(videosController),
  });

  // PUT /admin/media/videos/:id - Update video
  fastify.put('/:id', {
    preHandler: requireAuthRedirect('/admin/auth/login'),
    handler: videosController.update.bind(videosController),
  });

  // DELETE /admin/media/videos/:id - Delete video
  fastify.delete('/:id', {
    preHandler: requireAuthRedirect('/admin/auth/login'),
    handler: videosController.delete.bind(videosController),
  });
}
