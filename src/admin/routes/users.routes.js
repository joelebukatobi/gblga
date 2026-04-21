// src/admin/routes/users.routes.js
// User routes

import { usersController } from '../controllers/users.controller.js';
import { requireAuthRedirect } from '../../middleware/authenticate.js';

/**
 * Register user routes
 * @param {FastifyInstance} fastify - Fastify instance
 * @param {Object} opts - Route options
 */
export default async function userRoutes(fastify, opts) {
  // GET /admin/users - List all users
  fastify.get('/', {
    preHandler: requireAuthRedirect('/admin/auth/login'),
    handler: usersController.list.bind(usersController),
  });

  // GET /admin/users/new - Show new user form
  fastify.get('/new', {
    preHandler: requireAuthRedirect('/admin/auth/login'),
    handler: usersController.showNewForm.bind(usersController),
  });

  // POST /admin/users - Create user
  fastify.post('/', {
    preHandler: requireAuthRedirect('/admin/auth/login'),
    handler: usersController.create.bind(usersController),
  });

  // GET /admin/users/:id/edit - Show edit form
  fastify.get('/:id/edit', {
    preHandler: requireAuthRedirect('/admin/auth/login'),
    handler: usersController.showEditForm.bind(usersController),
  });

  // PUT /admin/users/:id - Update user
  fastify.put('/:id', {
    preHandler: requireAuthRedirect('/admin/auth/login'),
    handler: usersController.update.bind(usersController),
  });

  // DELETE /admin/users/:id - Delete user
  fastify.delete('/:id', {
    preHandler: requireAuthRedirect('/admin/auth/login'),
    handler: usersController.delete.bind(usersController),
  });

  // POST /admin/users/:id/suspend - Suspend user
  fastify.post('/:id/suspend', {
    preHandler: requireAuthRedirect('/admin/auth/login'),
    handler: usersController.suspend.bind(usersController),
  });

  // POST /admin/users/:id/activate - Activate user
  fastify.post('/:id/activate', {
    preHandler: requireAuthRedirect('/admin/auth/login'),
    handler: usersController.activate.bind(usersController),
  });

  // POST /admin/users/:id/resend-invite - Resend invitation
  fastify.post('/:id/resend-invite', {
    preHandler: requireAuthRedirect('/admin/auth/login'),
    handler: usersController.resendInvite.bind(usersController),
  });

  // POST /admin/users/:id/avatar - Upload avatar
  fastify.post('/:id/avatar', {
    preHandler: requireAuthRedirect('/admin/auth/login'),
    handler: usersController.uploadAvatar.bind(usersController),
  });
}
