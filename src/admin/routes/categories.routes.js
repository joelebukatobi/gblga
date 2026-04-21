// src/admin/routes/categories.routes.js
// Category routes

import { categoriesController } from '../controllers/categories.controller.js';
import { requireAuthRedirect } from '../../middleware/authenticate.js';

/**
 * Register category routes
 * @param {FastifyInstance} fastify - Fastify instance
 * @param {Object} opts - Route options
 */
export default async function categoryRoutes(fastify, opts) {
  // GET /admin/categories - List all categories
  fastify.get('/', {
    preHandler: requireAuthRedirect('/admin/auth/login'),
    handler: categoriesController.list.bind(categoriesController),
  });

  // GET /admin/categories/new - Show new category form
  fastify.get('/new', {
    preHandler: requireAuthRedirect('/admin/auth/login'),
    handler: categoriesController.showNewForm.bind(categoriesController),
  });

  // POST /admin/categories - Create category
  fastify.post('/', {
    preHandler: requireAuthRedirect('/admin/auth/login'),
    handler: categoriesController.create.bind(categoriesController),
  });

  // GET /admin/categories/:id/edit - Show edit form
  fastify.get('/:id/edit', {
    preHandler: requireAuthRedirect('/admin/auth/login'),
    handler: categoriesController.showEditForm.bind(categoriesController),
  });

  // PUT /admin/categories/:id - Update category
  fastify.put('/:id', {
    preHandler: requireAuthRedirect('/admin/auth/login'),
    handler: categoriesController.update.bind(categoriesController),
  });

  // DELETE /admin/categories/:id - Delete category
  fastify.delete('/:id', {
    preHandler: requireAuthRedirect('/admin/auth/login'),
    handler: categoriesController.delete.bind(categoriesController),
  });

  // GET /admin/categories/check-slug - Check slug availability
  fastify.get('/check-slug', {
    preHandler: requireAuthRedirect('/admin/auth/login'),
    handler: categoriesController.checkSlug.bind(categoriesController),
  });
}
