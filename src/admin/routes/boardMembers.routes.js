// src/admin/routes/boardMembers.routes.js
// Board Members routes - admin board member management

import { boardMembersController } from '../controllers/boardMembers.controller.js';
import { requireAuthRedirect } from '../../middleware/authenticate.js';

export default async function boardMembersRoutes(fastify, opts) {
  fastify.get('/', {
    preHandler: requireAuthRedirect('/admin/auth/login'),
    handler: boardMembersController.list.bind(boardMembersController),
  });

  fastify.get('/new', {
    preHandler: requireAuthRedirect('/admin/auth/login'),
    handler: boardMembersController.showNewForm.bind(boardMembersController),
  });

  fastify.post('/', {
    preHandler: requireAuthRedirect('/admin/auth/login'),
    handler: boardMembersController.create.bind(boardMembersController),
  });

  fastify.get('/:id/edit', {
    preHandler: requireAuthRedirect('/admin/auth/login'),
    handler: boardMembersController.showEditForm.bind(boardMembersController),
  });

  fastify.put('/:id', {
    preHandler: requireAuthRedirect('/admin/auth/login'),
    handler: boardMembersController.update.bind(boardMembersController),
  });

  // POST /admin/board-members/:id/photo - Upload photo
  fastify.post('/:id/photo', {
    preHandler: requireAuthRedirect('/admin/auth/login'),
    handler: boardMembersController.uploadPhoto.bind(boardMembersController),
  });

  fastify.delete('/:id', {
    preHandler: requireAuthRedirect('/admin/auth/login'),
    handler: boardMembersController.delete.bind(boardMembersController),
  });
}
