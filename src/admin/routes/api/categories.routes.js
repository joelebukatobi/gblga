// src/admin/routes/api/categories.routes.js
// Public API routes for categories

import { categoriesAPIController } from '../../controllers/api/categories.controller.js';

/**
 * Categories API Routes
 * Public endpoints for consuming categories data
 */
export default async function categoriesAPIRoutes(fastify) {
  // GET /api/v1/categories
  // List all categories with post counts
  fastify.get('/', {
    handler: categoriesAPIController.list.bind(categoriesAPIController),
  });

  // GET /api/v1/categories/:slug/posts
  // Get posts in a category
  fastify.get('/:slug/posts', {
    handler: categoriesAPIController.getPostsByCategory.bind(categoriesAPIController),
  });
}
