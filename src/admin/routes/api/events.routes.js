// src/admin/routes/api/events.routes.js
// Public API routes for events

import { eventsService } from '../../../services/events.service.js';

export default async function eventsApiRoutes(fastify, opts) {
  fastify.get('/', async (request, reply) => {
    try {
      const page = parseInt(request.query?.page || '1', 10) || 1;
      const limit = parseInt(request.query?.limit || '20', 10) || 20;
      const year = request.query?.year || '';
      const status = request.query?.status || '';

      const result = await eventsService.getAll({ page, limit, year, status });

      return reply.send({
        data: result.data,
        meta: result.pagination,
      });
    } catch (error) {
      request.log.error(error);
      reply.code(500);
      return reply.send({ error: 'Failed to fetch events' });
    }
  });

  fastify.get('/:slug', async (request, reply) => {
    try {
      const { slug } = request.params;
      const event = await eventsService.getBySlug(slug);

      if (!event) {
        reply.code(404);
        return reply.send({ error: 'Event not found' });
      }

      return reply.send({ data: event });
    } catch (error) {
      request.log.error(error);
      reply.code(500);
      return reply.send({ error: 'Failed to fetch event' });
    }
  });
}
