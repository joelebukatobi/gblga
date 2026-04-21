// src/admin/routes/api/posts.routes.js
// Public API routes for posts

import { postsAPIController } from '../../controllers/api/posts.controller.js';

/**
 * Posts API Routes
 * Public endpoints for consuming posts data
 */
export default async function postsAPIRoutes(fastify) {
  // GET /api/v1/posts
  // List all published posts with pagination
  fastify.get('/', {
    handler: postsAPIController.list.bind(postsAPIController),
  });

  // GET /api/v1/posts/:slug
  // Get single post by slug
  fastify.get('/:slug', {
    handler: postsAPIController.getBySlug.bind(postsAPIController),
  });
}
