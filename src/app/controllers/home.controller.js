import { appHomePage } from '../templates/pages/home/home.js';
import { groupImagesByYear } from './gallery.controller.js';

/**
 * Format an event from the API into the shape expected by renderEventCard
 */
function formatEventForCard(event) {
  const date = event.eventDate ? new Date(event.eventDate) : null;
  const day = date ? String(date.getDate()).padStart(2, '0') : '01';
  const month = date
    ? date.toLocaleDateString('en-US', { month: 'long' })
    : 'Jan';
  const year = date ? String(date.getFullYear()) : '2026';

  return {
    title: event.title || 'Event Title',
    description: event.description || '',
    day,
    month,
    year,
    location: event.location || 'Location TBD',
    time: event.eventTime || 'Time TBD',
    href: '/events',
  };
}

class HomeController {
  async index(request, reply) {
    // Fetch images from API for gallery preview
    const imagesResponse = await request.server.inject({
      method: 'GET',
      url: '/api/v1/images?limit=100',
    });

    let images = [];
    if (imagesResponse.statusCode === 200) {
      const payload = imagesResponse.json();
      images = payload?.data || [];
    }

    // Group images into year albums for the preview
    const albums = groupImagesByYear(images);

    // Fetch upcoming events from API for events preview
    const eventsResponse = await request.server.inject({
      method: 'GET',
      url: '/api/v1/events?status=UPCOMING&limit=3&sortBy=eventDate&sortOrder=asc',
    });

    let events = [];
    if (eventsResponse.statusCode === 200) {
      const payload = eventsResponse.json();
      events = (payload?.data || []).map(formatEventForCard);
    }

    return reply.type('text/html').send(appHomePage({ albums, events }));
  }
}

export const homeController = new HomeController();
