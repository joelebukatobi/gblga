// src/admin/routes/api/subscribers.routes.js
// Public API routes for newsletter subscribers

import { subscribersService } from '../../../services/subscribers.service.js';

function successHtml(message) {
  return `<p class="newsletter__response newsletter__response--success">${message}</p>`;
}

function errorHtml(message) {
  return `<p class="newsletter__response newsletter__response--error">${message}</p>`;
}

export default async function subscribersApiRoutes(fastify, opts) {
  // POST /api/v1/subscribe - Subscribe to newsletter
  fastify.post('/subscribe', async (request, reply) => {
    const isHtmx = request.headers['hx-request'] === 'true';
    
    try {
      const { email } = request.body;

      if (!email || !email.trim()) {
        reply.code(400);
        if (isHtmx) {
          return reply.type('text/html').send(errorHtml('Email is required'));
        }
        return reply.send({ error: 'Email is required' });
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        reply.code(400);
        if (isHtmx) {
          return reply.type('text/html').send(errorHtml('Invalid email address'));
        }
        return reply.send({ error: 'Invalid email address' });
      }

      const normalizedEmail = email.trim().toLowerCase();

      // Check if already subscribed
      const existingSubscriber = await subscribersService.getSubscriberByEmail(normalizedEmail);
      if (existingSubscriber) {
        if (existingSubscriber.status === 'ACTIVE') {
          reply.code(409);
          if (isHtmx) {
            return reply.type('text/html').send(errorHtml('You are already subscribed to our newsletter'));
          }
          return reply.send({ error: 'You are already subscribed to our newsletter' });
        } else {
          // Reactivate unsubscribed subscriber
          await subscribersService.updateSubscriber(existingSubscriber.id, { status: 'ACTIVE' });
          const message = 'Welcome back! Your subscription has been reactivated.';
          if (isHtmx) {
            return reply.type('text/html').send(successHtml(message));
          }
          return reply.send({ message, data: { email: normalizedEmail } });
        }
      }

      // Create new subscriber
      const subscriber = await subscribersService.createSubscriber({
        email: normalizedEmail,
        status: 'ACTIVE'
      });

      const message = 'Successfully subscribed to our newsletter!';
      if (isHtmx) {
        return reply.code(201).type('text/html').send(successHtml(message));
      }
      return reply.code(201).send({ message, data: { email: subscriber.email } });
    } catch (error) {
      request.log.error(error);
      reply.code(500);
      const message = 'Failed to subscribe. Please try again later.';
      if (isHtmx) {
        return reply.type('text/html').send(errorHtml(message));
      }
      return reply.send({ error: message });
    }
  });

  // GET /api/v1/subscribers/count - Get subscriber count (public)
  fastify.get('/count', async (request, reply) => {
    try {
      const count = await subscribersService.getSubscriberCount({ status: 'ACTIVE' });
      return reply.send({ data: { count } });
    } catch (error) {
      request.log.error(error);
      reply.code(500);
      return reply.send({ error: 'Failed to fetch subscriber count' });
    }
  });
}
