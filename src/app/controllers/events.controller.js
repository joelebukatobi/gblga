import { appEventsPage } from '../templates/pages/events/events.js';

export const eventsController = {
  index: async (request, reply) => {
    return reply.type('text/html').send(appEventsPage());
  },
};
