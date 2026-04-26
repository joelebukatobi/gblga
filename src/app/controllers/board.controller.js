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

    // Fetch board members from API
    const apiResponse = await request.server.inject({
      method: 'GET',
      url: `/api/v1/board-members?type=${type}&year=${year}&page=${page}&limit=9&isActive=true`,
    });

    let members = [];
    let pagination = { page: 1, totalPages: 1, total: 0 };

    if (apiResponse.statusCode === 200) {
      const payload = apiResponse.json();
      members = payload?.data || [];
      pagination = payload?.meta || pagination;
    }

    const isHtmxRequest = request.headers['hx-request'] === 'true';

    if (isHtmxRequest) {
      return reply.type('text/html').send(appBoardPartial({
        members,
        currentPage: pagination.page,
        totalPages: pagination.totalPages,
        totalMembers: pagination.total,
        type,
        year,
      }));
    }

    return reply.type('text/html').send(appBoardPage({
      members,
      currentPage: pagination.page,
      totalPages: pagination.totalPages,
      totalMembers: pagination.total,
      type,
      year,
    }));
  },
};
