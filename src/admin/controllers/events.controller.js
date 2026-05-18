// src/admin/controllers/events.controller.js
// Events controller - handles event HTTP requests

import { eventsService } from '../../services/events.service.js';

/**
 * Events Controller
 */
class EventsController {
  async list(request, reply) {
    try {
      const user = request.user;
      const {
        search,
        year,
        status,
        sortBy = 'eventDate',
        sortOrder = 'asc',
        page = 1,
        toast,
      } = request.query;

      const { data: events, pagination } = await eventsService.getAll({
        search,
        year,
        status,
        sortBy,
        sortOrder,
        page: parseInt(page, 10) || 1,
        limit: 10,
      });

      const isHtmx = request.headers['hx-request'] === 'true';

      if (isHtmx) {
        return reply.type('text/html').send(eventsTableFragment({ events, pagination }));
      }

      const { eventsListPage } = await import('../templates/pages/events/index.js');

      return reply.type('text/html').send(
        eventsListPage({
          user,
          events,
          total: pagination.total,
          page: pagination.page,
          totalPages: pagination.totalPages,
          filters: { search, year, status },
          toast,
        })
      );
    } catch (error) {
      request.log.error(error);
      reply.code(500);
      return reply.type('text/html').send(errorFragment({ message: 'Failed to load events.' }));
    }
  }

  async showNewForm(request, reply) {
    try {
      const user = request.user;
      const { eventNewPage } = await import('../templates/pages/events/index.js');
      return reply.type('text/html').send(eventNewPage({ user }));
    } catch (error) {
      request.log.error(error);
      reply.code(500);
      return reply.type('text/html').send(errorFragment({ message: 'Failed to load form.' }));
    }
  }

  async create(request, reply) {
    try {
      const user = request.user;

      // Parse multipart form data
      const parts = request.parts();
      const fields = {};
      let flyerFile = null;

      for await (const part of parts) {
        if (part.file) {
          flyerFile = part;
        } else {
          fields[part.fieldname] = await part.value;
        }
      }

      const { title, slug, description, location, eventDate, eventTime } = fields;

      if (!title) {
        reply.code(400);
        return reply.type('text/html').send(errorFragment({ message: 'Title is required.' }));
      }

      const event = await eventsService.create({
        title,
        slug,
        description,
        location,
        eventDate: eventDate ? new Date(eventDate) : null,
        eventTime: eventTime || null,
      }, user.id);

      // Handle flyer upload if present
      if (flyerFile) {
        const featuredImageId = await this._processFlyerUpload(event.id, flyerFile, user.id);
        if (featuredImageId) {
          await eventsService.update(event.id, { featuredImageId }, user.id);
        }
      }

      reply.header('HX-Location', `/admin/events/${event.id}/edit`);
      reply.header('HX-Trigger', JSON.stringify({ "htmx:toast": { message: 'Event created successfully!', type: 'success' } }));
      return reply.type('text/html').send('');
    } catch (error) {
      request.log.error(error);
      reply.code(400);
      return reply.type('text/html').send(errorFragment({ message: error.message || 'Failed to create event.' }));
    }
  }

  async showEditForm(request, reply) {
    try {
      const user = request.user;
      const { id } = request.params;

      const event = await eventsService.getById(id);
      if (!event) {
        reply.code(404);
        return reply.type('text/html').send(errorFragment({ message: 'Event not found.' }));
      }

      const { eventEditPage } = await import('../templates/pages/events/index.js');
      return reply.type('text/html').send(eventEditPage({ user, event }));
    } catch (error) {
      request.log.error(error);
      reply.code(500);
      return reply.type('text/html').send(errorFragment({ message: 'Failed to load event.' }));
    }
  }

  async update(request, reply) {
    try {
      const user = request.user;
      const { id } = request.params;

      // Parse multipart form data
      const parts = request.parts();
      const fields = {};
      let flyerFile = null;

      for await (const part of parts) {
        if (part.file) {
          flyerFile = part;
        } else {
          fields[part.fieldname] = await part.value;
        }
      }

      const { title, slug, description, location, eventDate, eventTime } = fields;

      const existing = await eventsService.getById(id);
      if (!existing) {
        reply.code(404);
        return reply.type('text/html').send(errorFragment({ message: 'Event not found.' }));
      }

      const updateData = {
        title,
        slug,
        description,
        location,
        eventDate: eventDate ? new Date(eventDate) : null,
        eventTime: eventTime || null,
      };

      // Handle flyer upload if present
      if (flyerFile) {
        const featuredImageId = await this._processFlyerUpload(id, flyerFile, user.id);
        if (featuredImageId) {
          updateData.featuredImageId = featuredImageId;
        }
      }

      await eventsService.update(id, updateData, user.id);

      reply.header('HX-Trigger', JSON.stringify({ "htmx:toast": { message: 'Event updated successfully!', type: 'success' } }));
      return reply.type('text/html').send('');
    } catch (error) {
      request.log.error(error);
      reply.code(400);
      return reply.type('text/html').send(errorFragment({ message: error.message || 'Failed to update event.' }));
    }
  }

  async uploadFlyer(request, reply) {
    try {
      const { id } = request.params;

      const event = await eventsService.getById(id);
      if (!event) {
        reply.code(404);
        return reply.type('text/html').send(errorFragment({ message: 'Event not found.' }));
      }

      const data = await request.file();
      if (!data) {
        reply.code(400);
        return reply.type('text/html').send(errorFragment({ message: 'No file uploaded.' }));
      }

      const { mimetype } = data;
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
      if (!allowedTypes.includes(mimetype)) {
        reply.code(400);
        return reply.type('text/html').send(errorFragment({ message: 'Invalid file type. Only JPEG, PNG and WebP are allowed.' }));
      }

      const { db, mediaItems } = await import('../../db/index.js');
      const { eq } = await import('drizzle-orm');
      const fs = await import('fs/promises');
      const path = await import('path');
      const crypto = await import('crypto');
      const { events } = await import('../../db/schema.js');

      const fileBuffer = await data.toBuffer();
      const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
      const fileSize = fileBuffer.length;

      const existingImage = await db
        .select({ id: mediaItems.id, path: mediaItems.path })
        .from(mediaItems)
        .where(eq(mediaItems.hash, hash))
        .limit(1);

      if (existingImage.length > 0) {
        await db.update(events)
          .set({ featuredImageId: existingImage[0].id, updatedAt: new Date() })
          .where(eq(events.id, id));

        const flyerUrl = `/${existingImage[0].path}`;

        return reply.type('text/html').send(`
          <div id="flyerPreview">
            <img src="${flyerUrl}?t=${Date.now()}" alt="Event flyer" />
          </div>
          <script>
            document.body.dispatchEvent(new CustomEvent('htmx:toast', {
              detail: { message: 'Flyer updated successfully!', type: 'success' }
            }));
          </script>
        `);
      }

      const timestamp = Date.now();
      const extension = data.filename.split('.').pop();
      const filename = `event-${timestamp}.${extension}`;
      const filepath = `public/uploads/events/${filename}`;

      const uploadsDir = path.join(process.cwd(), 'public/uploads/events');
      try {
        await fs.access(uploadsDir);
      } catch {
        await fs.mkdir(uploadsDir, { recursive: true });
      }

      await fs.writeFile(path.join(process.cwd(), filepath), fileBuffer);

      const mediaItemId = crypto.randomUUID();
      await db.insert(mediaItems).values({
        id: mediaItemId,
        type: 'IMAGE',
        filename,
        originalName: data.filename,
        mimeType: data.mimetype,
        size: fileSize,
        path: filepath,
        hash,
        uploadedBy: request.user.id,
      });

      await db.update(events)
        .set({ featuredImageId: mediaItemId, updatedAt: new Date() })
        .where(eq(events.id, id));

      const flyerUrl = `/${filepath}`;

      return reply.type('text/html').send(`
        <div id="flyerPreview">
          <img src="${flyerUrl}?t=${Date.now()}" alt="Event flyer" />
        </div>
        <script>
          document.body.dispatchEvent(new CustomEvent('htmx:toast', {
            detail: { message: 'Flyer uploaded successfully!', type: 'success' }
          }));
        </script>
      `);
    } catch (error) {
      request.log.error(error);
      reply.code(400);
      return reply.type('text/html').send(errorFragment({ message: error.message || 'Failed to upload flyer.' }));
    }
  }

  /**
   * Process flyer upload and return media item ID
   * @private
   */
  async _processFlyerUpload(eventId, data, userId) {
    const { mimetype } = data;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(mimetype)) {
      throw new Error('Invalid file type. Only JPEG, PNG and WebP are allowed.');
    }

    const { db, mediaItems } = await import('../../db/index.js');
    const { eq } = await import('drizzle-orm');
    const fs = await import('fs/promises');
    const path = await import('path');
    const crypto = await import('crypto');
    const { events } = await import('../../db/schema.js');

    const fileBuffer = await data.toBuffer();
    const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
    const fileSize = fileBuffer.length;

    const existingImage = await db
      .select({ id: mediaItems.id, path: mediaItems.path })
      .from(mediaItems)
      .where(eq(mediaItems.hash, hash))
      .limit(1);

    if (existingImage.length > 0) {
      await db.update(events)
        .set({ featuredImageId: existingImage[0].id, updatedAt: new Date() })
        .where(eq(events.id, eventId));
      return existingImage[0].id;
    }

    const timestamp = Date.now();
    const extension = data.filename.split('.').pop();
    const filename = `event-${timestamp}.${extension}`;
    const filepath = `public/uploads/events/${filename}`;

    const uploadsDir = path.join(process.cwd(), 'public/uploads/events');
    try {
      await fs.access(uploadsDir);
    } catch {
      await fs.mkdir(uploadsDir, { recursive: true });
    }

    await fs.writeFile(path.join(process.cwd(), filepath), fileBuffer);

    const mediaItemId = crypto.randomUUID();
    await db.insert(mediaItems).values({
      id: mediaItemId,
      type: 'IMAGE',
      filename,
      originalName: data.filename,
      mimeType: data.mimetype,
      size: data.file.bytesRead,
      path: filepath,
      hash,
      uploadedBy: userId,
    });

    await db.update(events)
      .set({ featuredImageId: mediaItemId, updatedAt: new Date() })
      .where(eq(events.id, eventId));

    return mediaItemId;
  }

  async delete(request, reply) {
    try {
      const user = request.user;
      const { id } = request.params;

      await eventsService.delete(id, user.id);
      reply.header('HX-Redirect', '/admin/events?toast=deleted');
      return reply.type('text/html').send('');
    } catch (error) {
      request.log.error(error);
      reply.code(400);
      return reply.type('text/html').send(errorFragment({ message: error.message || 'Failed to delete event.' }));
    }
  }
}

function eventsTableFragment({ events, pagination }) {
  if (!events || events.length === 0) {
    return `
      <div class="empty">
        <h3>No events found</h3>
        <p>Get started by creating your first event.</p>
      </div>
    `;
  }

  const rows = events.map((event) => {
    const date = event.eventDate
      ? new Date(event.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : '-';
    const statusClass = {
      UPCOMING: 'badge--info',
      ONGOING: 'badge--warning',
      COMPLETED: 'badge--success',
      CANCELLED: 'badge--error',
    }[event.status] || 'badge--neutral';

    return `
      <tr class="table__tr">
        <td class="table__td">
          <span class="table__label">Title</span>
          <div class="table__title">
            <a href="/admin/events/${event.id}/edit">${event.title}</a>
          </div>
        </td>
        <td class="table__td">
          <span class="table__label">Date</span>
          ${date}
          ${event.eventTime ? `<span class="text-gray-500"> at ${event.eventTime}</span>` : ''}
        </td>
        <td class="table__td">
          <span class="table__label">Location</span>
          ${event.location || '-'}
        </td>
        <td class="table__td">
          <span class="table__label">Status</span>
          <span class="badge ${statusClass}">${event.status}</span>
        </td>
        <td class="table__td table__td--actions">
          <div class="row-actions">
            <a href="/admin/events/${event.id}/edit" class="btn btn--ghost row-action row-action--edit">
              <i data-lucide="pencil"></i>
              <span>Edit</span>
            </a>
            <button type="button" class="btn btn--ghost row-action row-action--delete"
              data-event-id="${event.id}" data-event-name="${event.title}"
              onclick="openDeleteModal(this)">
              <i data-lucide="trash-2"></i>
              <span>Delete</span>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  const paginationFragment = pagination && pagination.totalPages > 1
    ? fragmentPaginationHtml({ page: pagination.page, totalPages: pagination.totalPages, filters: {} })
    : '';

  return `
    <table class="table">
      <thead class="table__thead">
        <tr>
          <th>Title</th>
          <th>Date</th>
          <th>Location</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody class="table__tbody">${rows}</tbody>
    </table>
    ${paginationFragment}
  `;
}

function fragmentPaginationHtml({ page, totalPages, filters }) {
  const params = new URLSearchParams();
  if (filters?.search) params.set('search', filters.search);
  if (filters?.year) params.set('year', filters.year);
  if (filters?.status) params.set('status', filters.status);

  const baseQuery = params.toString();
  const queryPrefix = baseQuery ? `&${baseQuery}` : '';

  let links = '';
  const prevDisabled = page <= 1 ? 'pagination__item--disabled' : '';
  const prevHref = page > 1 ? `/admin/events?page=${page - 1}${queryPrefix}` : '#';
  links += `<a href="${prevHref}" class="pagination__item ${prevDisabled}"><i data-lucide="chevron-left"></i></a>`;

  let pageNumbers = [];
  const maxVisible = 5;
  if (totalPages <= maxVisible) {
    pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
  } else if (page <= 3) {
    pageNumbers = [1, 2, 3, 4, '...', totalPages];
  } else if (page >= totalPages - 2) {
    pageNumbers = [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  } else {
    pageNumbers = [1, '...', page - 1, page, page + 1, '...', totalPages];
  }

  pageNumbers.forEach((p) => {
    if (p === '...') {
      links += '<span class="pagination__ellipsis">...</span>';
    } else {
      const active = p === page ? 'pagination__item--active' : '';
      links += `<a href="/admin/events?page=${p}${queryPrefix}" class="pagination__item ${active}">${p}</a>`;
    }
  });

  const nextDisabled = page >= totalPages ? 'pagination__item--disabled' : '';
  const nextHref = page < totalPages ? `/admin/events?page=${page + 1}${queryPrefix}` : '#';
  links += `<a href="${nextHref}" class="pagination__item ${nextDisabled}"><i data-lucide="chevron-right"></i></a>`;

  return `
    <footer class="page-footer">
      <div class="pagination">${links}</div>
    </footer>
  `;
}

function errorFragment({ message }) {
  return `
    <div class="alert alert--error" role="alert">
      <i data-lucide="alert-circle" class="alert__icon"></i>
      <span class="alert__message">${message}</span>
    </div>
  `;
}

export const eventsController = new EventsController();
export default eventsController;
