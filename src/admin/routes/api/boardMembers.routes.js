// src/admin/routes/api/boardMembers.routes.js
// Public API routes for board members

import { boardMembersService } from '../../../services/boardMembers.service.js';

export default async function boardMembersApiRoutes(fastify, opts) {
  fastify.get('/', async (request, reply) => {
    try {
      const page = parseInt(request.query?.page || '1', 10) || 1;
      const limit = parseInt(request.query?.limit || '20', 10) || 20;
      const type = request.query?.type || '';
      const year = request.query?.year || '';
      const isActive = request.query?.isActive !== undefined ? request.query.isActive : true;

      const result = await boardMembersService.getAll({
        page,
        limit,
        type,
        year,
        isActive,
      });

      return reply.send({
        data: result.data,
        meta: result.pagination,
      });
    } catch (error) {
      request.log.error(error);
      reply.code(500);
      return reply.send({ error: 'Failed to fetch board members' });
    }
  });

  fastify.get('/:id', async (request, reply) => {
    try {
      const { id } = request.params;
      const member = await boardMembersService.getById(id);

      if (!member) {
        reply.code(404);
        return reply.send({ error: 'Board member not found' });
      }

      return reply.send({ data: member });
    } catch (error) {
      request.log.error(error);
      reply.code(500);
      return reply.send({ error: 'Failed to fetch board member' });
    }
  });
}
