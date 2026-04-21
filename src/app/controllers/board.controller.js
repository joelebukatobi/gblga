import { appBoardPage } from '../templates/pages/board/board.js';

export const boardController = {
  index: async (request, reply) => {
    return reply.type('text/html').send(appBoardPage());
  },
};
