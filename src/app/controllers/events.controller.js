import { appEventsPage, appEventsPartial } from '../templates/pages/events/events.js';

const CURRENT_YEAR = new Date().getFullYear().toString();

export const eventsController = {
  index: async (request, reply) => {
    const rawYear = request.query?.year || '';
    const page = Number.parseInt(request.query?.page || '1', 10) || 1;

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

    // Fetch events from API
    const apiResponse = await request.server.inject({
      method: 'GET',
      url: `/api/v1/events?year=${yearFilter}&page=${page}&limit=9`,
    });

    let events = [];
    let pagination = { page: 1, totalPages: 1, total: 0 };

    if (apiResponse.statusCode === 200) {
      const payload = apiResponse.json();
      events = payload?.data || [];
      pagination = payload?.meta || pagination;
    }

    const isHtmxRequest = request.headers['hx-request'] === 'true';

    if (isHtmxRequest) {
      return reply.type('text/html').send(appEventsPartial({
        events,
        currentPage: pagination.page,
        totalPages: pagination.totalPages,
        totalEvents: pagination.total,
        year: yearFilter,
        yearParam,
      }));
    }

    return reply.type('text/html').send(appEventsPage({
      events,
      currentPage: pagination.page,
      totalPages: pagination.totalPages,
      totalEvents: pagination.total,
      year: yearFilter,
      yearParam,
    }));
  },
};
