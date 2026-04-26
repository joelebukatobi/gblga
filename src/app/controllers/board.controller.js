import { appBoardPage, appBoardPartial } from '../templates/pages/board/board.js';

const CURRENT_YEAR = new Date().getFullYear().toString();

export const boardController = {
  index: async (request, reply) => {
    const type = request.query?.type || '';
    let year = request.query?.year || '';
    const page = Number.parseInt(request.query?.page || '1', 10) || 1;

    // Default to current year; 'all' explicitly shows all years
    if (!year) {
      year = CURRENT_YEAR;
    } else if (year === 'all') {
      year = '';
    }

    const isHtmxRequest = request.headers['hx-request'] === 'true';

    if (isHtmxRequest) {
      return reply.type('text/html').send(appBoardPartial({ type, year, page }));
    }

    return reply.type('text/html').send(appBoardPage({ type, year, page }));
  },
};
