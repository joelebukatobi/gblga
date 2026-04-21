// src/admin/routes/settings.routes.js
// Settings routes - admin only

import { settingsController } from '../controllers/settings.controller.js';
import { requireAuthRedirect } from '../../middleware/authenticate.js';

/**
 * Register settings routes
 * @param {FastifyInstance} fastify - Fastify instance
 * @param {Object} opts - Route options
 */
export default async function settingsRoutes(fastify, opts) {
  // GET /admin/settings - Show settings page (admin only)
  fastify.get('/', {
    preHandler: requireAuthRedirect('/admin/auth/login'),
    handler: settingsController.showSettings.bind(settingsController),
  });

  // PUT /admin/settings - Update settings (admin only)
  fastify.put('/', {
    preHandler: requireAuthRedirect('/admin/auth/login'),
    handler: settingsController.updateSettings.bind(settingsController),
  });

  // POST /admin/settings/logo - Upload logo (admin only)
  fastify.post('/logo', {
    preHandler: requireAuthRedirect('/admin/auth/login'),
    handler: settingsController.uploadLogo.bind(settingsController),
  });
}
