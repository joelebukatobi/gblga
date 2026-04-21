// src/admin/routes/api/tags.routes.js
// Public API routes for tags

import { tagsAPIController } from '../../controllers/api/tags.controller.js';

/**
 * Tags API Routes
 * Public endpoints for consuming tags data
 */
export default async function tagsAPIRoutes(fastify) {
  // GET /api/v1/tags
  // List all tags with post counts
  fastify.get('/', {
    handler: tagsAPIController.list.bind(tagsAPIController),
  });

  // GET /api/v1/tags/:slug/posts
  // Get posts with a specific tag
  fastify.get('/:slug/posts', {
    handler: tagsAPIController.getPostsByTag.bind(tagsAPIController),
  });
}
