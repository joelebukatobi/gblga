import { appHomePage } from '../templates/pages/home/home.js';
import albumsService from '../../services/albums.service.js';

/**
 * Format an event from the API into the shape expected by renderEventCard
 */
function formatEventForCard(event) {
  const date = event.eventDate ? new Date(event.eventDate) : null;
  const day = date ? String(date.getDate()).padStart(2, '0') : '';
  const month = date
    ? date.toLocaleDateString('en-US', { month: 'long' })
    : '';
  const year = date ? String(date.getFullYear()) : '';

  return {
    title: event.title || '',
    description: event.description || '',
    day,
    month,
    year,
    location: event.location || '',
    time: event.eventTime || '',
    href: '/events',
    image: event.featuredImage?.path || '',
    externalLink: event.externalLink || '',
  };
}

async function getAlbumsForHome() {
  const { data: albums } = await albumsService.getAll({ limit: 6 });

  // Get media count for each album
  const albumsWithCounts = await Promise.all(
    albums.map(async (album) => {
      const mediaResult = await albumsService.getAlbumMedia(album.id, { limit: 1 });
      return {
        ...album,
        mediaCount: mediaResult.pagination.total,
        coverImage: album.coverImage,
      };
    })
  );

  return albumsWithCounts;
}

class HomeController {
  async index(request, reply) {
    // Fetch albums for gallery preview
    const albums = await getAlbumsForHome();

    // Fetch upcoming events first
    const upcomingResponse = await request.server.inject({
      method: 'GET',
      url: '/api/v1/events?status=UPCOMING&limit=3&sortBy=eventDate&sortOrder=asc',
    });

    let events = [];
    let showingPastEvents = false;

    if (upcomingResponse.statusCode === 200) {
      const payload = upcomingResponse.json();
      events = (payload?.data || []).map(formatEventForCard);
    }

    // If no upcoming events, fetch recent completed events as fallback
    if (events.length === 0) {
      const pastResponse = await request.server.inject({
        method: 'GET',
        url: '/api/v1/events?status=COMPLETED&limit=3&sortBy=eventDate&sortOrder=desc',
      });

      if (pastResponse.statusCode === 200) {
        const payload = pastResponse.json();
        events = (payload?.data || []).map(formatEventForCard);
        showingPastEvents = true;
      }
    }

    return reply.type('text/html').send(appHomePage({ albums, events, showingPastEvents }));
  }
}

export const homeController = new HomeController();
