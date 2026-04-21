// src/admin/routes/subscribers.routes.js
// Subscribers routes

import { subscribersController } from '../controllers/subscribers.controller.js';
import { requireAuthRedirect } from '../../middleware/authenticate.js';

/**
 * Register subscribers routes
 * @param {FastifyInstance} fastify - Fastify instance
 * @param {Object} opts - Route options
 */
export default async function subscribersRoutes(fastify, opts) {
  // All subscriber routes require authentication
  fastify.addHook('preHandler', requireAuthRedirect('/admin/auth/login'));

  // GET /admin/subscribers - List all subscribers
  fastify.get('/', {
    handler: subscribersController.list.bind(subscribersController),
  });

  // GET /admin/subscribers/new - Show add subscriber form
  fastify.get('/new', {
    handler: subscribersController.new.bind(subscribersController),
  });

  // POST /admin/subscribers - Create a new subscriber
  fastify.post('/', {
    handler: subscribersController.create.bind(subscribersController),
  });

  // GET /admin/subscribers/:id/edit - Show edit subscriber form
  fastify.get('/:id/edit', {
    handler: subscribersController.edit.bind(subscribersController),
  });

  // PUT /admin/subscribers/:id - Update a subscriber
  fastify.put('/:id', {
    handler: subscribersController.update.bind(subscribersController),
  });

  // DELETE /admin/subscribers/:id - Delete a subscriber
  fastify.delete('/:id', {
    handler: subscribersController.delete.bind(subscribersController),
  });
}
