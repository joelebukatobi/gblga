import { appEventsPage, appEventsPartial } from '../templates/pages/events/events.js';

const CURRENT_YEAR = new Date().getFullYear().toString();

export const eventsController = {
  index: async (request, reply) => {
    const rawYear = request.query?.year || '';
    const page = Number.parseInt(request.query?.page || '1', 10) || 1;

    // yearFilter: '' means all years, otherwise filter by that year
    // yearParam: the original query param for URL generation
    let yearFilter = '';
    let yearParam = '';

    if (!rawYear) {
      yearFilter = CURRENT_YEAR;
      yearParam = '';
    } else if (rawYear === 'all') {
      yearFilter = '';
      yearParam = 'all';
    } else {
      yearFilter = rawYear;
      yearParam = rawYear;
    }

    const isHtmxRequest = request.headers['hx-request'] === 'true';

    if (isHtmxRequest) {
      return reply.type('text/html').send(appEventsPartial({ year: yearFilter, yearParam, page }));
    }

    return reply.type('text/html').send(appEventsPage({ year: yearFilter, yearParam, page }));
  },
};
