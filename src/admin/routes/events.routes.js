// src/admin/routes/events.routes.js
// Events routes - admin event management

import { eventsController } from '../controllers/events.controller.js';
import { requireAuthRedirect } from '../../middleware/authenticate.js';

export default async function eventsRoutes(fastify, opts) {
  fastify.get('/', {
    preHandler: requireAuthRedirect('/admin/auth/login'),
    handler: eventsController.list.bind(eventsController),
  });

  fastify.get('/new', {
    preHandler: requireAuthRedirect('/admin/auth/login'),
    handler: eventsController.showNewForm.bind(eventsController),
  });

  fastify.post('/', {
    preHandler: requireAuthRedirect('/admin/auth/login'),
    handler: eventsController.create.bind(eventsController),
  });

  fastify.get('/:id/edit', {
    preHandler: requireAuthRedirect('/admin/auth/login'),
    handler: eventsController.showEditForm.bind(eventsController),
  });

  fastify.put('/:id', {
    preHandler: requireAuthRedirect('/admin/auth/login'),
    handler: eventsController.update.bind(eventsController),
  });

  fastify.post('/:id/upload-flyer', {
    preHandler: requireAuthRedirect('/admin/auth/login'),
    handler: eventsController.uploadFlyer.bind(eventsController),
  });

  fastify.delete('/:id', {
    preHandler: requireAuthRedirect('/admin/auth/login'),
    handler: eventsController.delete.bind(eventsController),
  });
}
