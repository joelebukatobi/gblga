// src/admin/routes/tags.routes.js
// Tags routes - admin tag management

import { tagsController } from '../controllers/tags.controller.js';
import { requireAuthRedirect } from '../../middleware/authenticate.js';

/**
 * Tags Routes
 * @param {FastifyInstance} fastify - Fastify instance
 * @param {Object} opts - Route options
 */
export default async function tagsRoutes(fastify, opts) {
  // GET /admin/tags - List all tags
  fastify.get('/', {
    preHandler: requireAuthRedirect('/admin/auth/login'),
    handler: tagsController.list.bind(tagsController),
  });

  // GET /admin/tags/new - Show new tag form
  fastify.get('/new', {
    preHandler: requireAuthRedirect('/admin/auth/login'),
    handler: tagsController.showNewForm.bind(tagsController),
  });

  // POST /admin/tags - Create new tag
  fastify.post('/', {
    preHandler: requireAuthRedirect('/admin/auth/login'),
    handler: tagsController.create.bind(tagsController),
  });

  // GET /admin/tags/:id/edit - Show edit tag form
  fastify.get('/:id/edit', {
    preHandler: requireAuthRedirect('/admin/auth/login'),
    handler: tagsController.showEditForm.bind(tagsController),
  });

  // PUT /admin/tags/:id - Update tag
  fastify.put('/:id', {
    preHandler: requireAuthRedirect('/admin/auth/login'),
    handler: tagsController.update.bind(tagsController),
  });

  // DELETE /admin/tags/:id - Delete tag
  fastify.delete('/:id', {
    preHandler: requireAuthRedirect('/admin/auth/login'),
    handler: tagsController.delete.bind(tagsController),
  });

  // GET /admin/tags/check-slug - Check slug availability
  fastify.get('/check-slug', {
    preHandler: requireAuthRedirect('/admin/auth/login'),
    handler: tagsController.checkSlug.bind(tagsController),
  });
}
