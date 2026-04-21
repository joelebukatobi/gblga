// src/admin/routes/api/comments.routes.js
// Public API routes for comments

import { commentsAPIController } from '../../controllers/api/comments.controller.js';

/**
 * Register comments API routes
 * @param {FastifyInstance} fastify
 * @param {Object} opts
 */
export default async function commentsAPIRoutes(fastify, opts) {
  // GET /api/v1/posts/:slug/comments - Get comments for a post
  fastify.get('/posts/:slug/comments', {
    handler: commentsAPIController.getByPostSlug.bind(commentsAPIController),
  });

  // POST /api/v1/comments - Create a new comment
  fastify.post('/comments', {
    handler: commentsAPIController.create.bind(commentsAPIController),
  });
}
