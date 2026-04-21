// src/admin/routes/dashboard.routes.js
import { dashboardController } from '../controllers/dashboard.controller.js';
import { requireAuthRedirect } from '../../middleware/authenticate.js';

/**
 * Dashboard Routes
 * Defines all dashboard-related endpoints
 */
export default async function dashboardRoutes(fastify) {

  // GET /admin
  // Protected - requires auth, redirects to login if not authenticated
  fastify.get('/', {
    preHandler: requireAuthRedirect('/admin/auth/login'),
    handler: dashboardController.showDashboard.bind(dashboardController)
  });

  // GET /admin/stats
  // Protected - get dashboard statistics (HTMX fragment)
  fastify.get('/stats', {
    preHandler: requireAuthRedirect('/admin/auth/login'),
    handler: dashboardController.getStats.bind(dashboardController)
  });

  // GET /admin/activity
  // Protected - get recent activity feed (HTMX fragment)
  fastify.get('/activity', {
    preHandler: requireAuthRedirect('/admin/auth/login'),
    handler: dashboardController.getActivity.bind(dashboardController)
  });

  // GET /admin/top-posts
  // Protected - get top performing posts (HTMX fragment)
  fastify.get('/top-posts', {
    preHandler: requireAuthRedirect('/admin/auth/login'),
    handler: dashboardController.getTopPosts.bind(dashboardController)
  });

  // GET /admin/traffic
  // Protected - get traffic chart data (HTMX fragment)
  fastify.get('/traffic', {
    preHandler: requireAuthRedirect('/admin/auth/login'),
    handler: dashboardController.getTraffic.bind(dashboardController)
  });
}
