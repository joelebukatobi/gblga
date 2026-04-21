// src/admin/routes/comments.routes.js
// Comments routes - nested under posts

import { commentsController } from '../controllers/comments.controller.js';
import { requireAuthRedirect } from '../../middleware/authenticate.js';

/**
 * Register comments routes
 * @param {FastifyInstance} fastify - Fastify instance
 * @param {Object} opts - Route options
 */
export default async function commentsRoutes(fastify, opts) {
  // All comment routes require authentication
  fastify.addHook('preHandler', requireAuthRedirect('/admin/auth/login'));

  // GET /admin/posts/:postId/comments - Show comments for a post
  fastify.get('/', {
    handler: commentsController.showComments.bind(commentsController),
  });

  // POST /admin/posts/:postId/comments/reply - Reply to a comment
  fastify.post('/reply', {
    handler: commentsController.replyToComment.bind(commentsController),
  });

  // PUT /admin/comments/:id - Update a comment
  fastify.put('/:id', {
    handler: commentsController.updateComment.bind(commentsController),
  });

  // DELETE /admin/comments/:id - Delete a comment
  fastify.delete('/:id', {
    handler: commentsController.deleteComment.bind(commentsController),
  });
}
