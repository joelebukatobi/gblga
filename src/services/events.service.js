// src/services/events.service.js
// Events service for managing events

import { db, events, mediaItems } from '../db/index.js';
import { eq, like, desc, asc, sql, and, gte, lt } from 'drizzle-orm';
import { activityService } from './activity.service.js';

/**
 * Events Service
 * Handles event CRUD operations and business logic
 */
class EventsService {
  /**
   * Get all events with optional filtering and pagination
   */
  async getAll({
    search,
    year,
    status,
    sortBy = 'eventDate',
    sortOrder = 'asc',
    page = 1,
    limit = 10,
  } = {}) {
    const conditions = [];

    if (search) {
      conditions.push(
        sql`(${like(events.title, `%${search}%`)} OR ${like(events.location, `%${search}%`)})`
      );
    }

    if (year) {
      const startOfYear = new Date(`${year}-01-01`);
      const startOfNextYear = new Date(`${parseInt(year) + 1}-01-01`);
      conditions.push(gte(events.eventDate, startOfYear));
      conditions.push(lt(events.eventDate, startOfNextYear));
    }

    if (status) {
      conditions.push(eq(events.status, status));
    }

    const whereClause = conditions.length > 1 ? and(...conditions) : conditions[0];

    // Get total count
    let countQuery = db.select({ count: sql`count(*)` }).from(events);
    if (whereClause) {
      countQuery = countQuery.where(whereClause);
    }
    const [{ count }] = await countQuery;
    const total = Number(count);

    // Build main query
    let query = db
      .select({
        id: events.id,
        title: events.title,
        slug: events.slug,
        description: events.description,
        location: events.location,
        eventDate: events.eventDate,
        eventTime: events.eventTime,
        status: events.status,
        featuredImageId: events.featuredImageId,
        externalLink: events.externalLink,
        createdAt: events.createdAt,
        updatedAt: events.updatedAt,
        featuredImage: {
          id: mediaItems.id,
          path: mediaItems.path,
          thumbnailPath: mediaItems.thumbnailPath,
        },
      })
      .from(events)
      .leftJoin(mediaItems, eq(events.featuredImageId, mediaItems.id));

    if (whereClause) {
      query = query.where(whereClause);
    }

    // Apply sorting
    const sortField = sortBy === 'title' ? events.title : events.eventDate;
    query = sortOrder === 'asc' ? query.orderBy(asc(sortField)) : query.orderBy(desc(sortField));

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.limit(limit).offset(offset);

    const data = await query;

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Get event by ID with featured image
   */
  async getById(id) {
    const [event] = await db
      .select({
        id: events.id,
        title: events.title,
        slug: events.slug,
        description: events.description,
        location: events.location,
        eventDate: events.eventDate,
        eventTime: events.eventTime,
        status: events.status,
        featuredImageId: events.featuredImageId,
        externalLink: events.externalLink,
        createdAt: events.createdAt,
        updatedAt: events.updatedAt,
        featuredImage: {
          id: mediaItems.id,
          path: mediaItems.path,
          thumbnailPath: mediaItems.thumbnailPath,
        },
      })
      .from(events)
      .leftJoin(mediaItems, eq(events.featuredImageId, mediaItems.id))
      .where(eq(events.id, id));

    return event || null;
  }

  /**
   * Get event by slug
   */
  async getBySlug(slug) {
    const [event] = await db
      .select()
      .from(events)
      .where(eq(events.slug, slug));

    return event || null;
  }

  /**
   * Create a new event
   */
  async create(data, userId) {
    let { slug } = data;
    if (!slug) {
      slug = this.generateSlug(data.title);
    }

    const existing = await this.getBySlug(slug);
    if (existing) {
      throw new Error('An event with this slug already exists');
    }

    const status = this.deriveStatus(data.eventDate);

    await db.insert(events).values({
      title: data.title,
      slug,
      description: data.description || null,
      location: data.location || null,
      eventDate: data.eventDate || null,
      eventTime: data.eventTime || null,
      status,
      featuredImageId: data.featuredImageId || null,
      externalLink: data.externalLink || null,
    });

    const [event] = await db
      .select()
      .from(events)
      .where(eq(events.slug, slug))
      .limit(1);

    await activityService.log({
      userId,
      type: 'EVENT_CREATED',
      description: `Created event "${event.title}"`,
      entityType: 'EVENT',
      entityId: event.id,
      metadata: { title: event.title },
    });

    return event;
  }

  /**
   * Update an event
   */
  async update(id, data, userId) {
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error('Event not found');
    }

    const updateData = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.eventDate !== undefined) updateData.eventDate = data.eventDate;
    if (data.eventTime !== undefined) updateData.eventTime = data.eventTime;
    if (data.featuredImageId !== undefined) updateData.featuredImageId = data.featuredImageId;
    if (data.externalLink !== undefined) updateData.externalLink = data.externalLink;

    // Re-derive status if date changed
    if (data.eventDate !== undefined) {
      updateData.status = this.deriveStatus(data.eventDate);
    }

    if (data.slug) {
      const existingSlug = await this.getBySlug(data.slug);
      if (existingSlug && existingSlug.id !== id) {
        throw new Error('An event with this slug already exists');
      }
      updateData.slug = data.slug;
    }

    await db.update(events).set(updateData).where(eq(events.id, id));

    const [event] = await db
      .select()
      .from(events)
      .where(eq(events.id, id))
      .limit(1);

    await activityService.log({
      userId,
      type: 'EVENT_UPDATED',
      description: `Updated event "${event.title}"`,
      entityType: 'EVENT',
      entityId: id,
      metadata: { title: event.title },
    });

    return event;
  }

  /**
   * Delete an event
   */
  async delete(id, userId) {
    const event = await this.getById(id);
    if (!event) {
      throw new Error('Event not found');
    }

    await db.delete(events).where(eq(events.id, id));

    await activityService.log({
      userId,
      type: 'EVENT_DELETED',
      description: `Deleted event "${event.title}"`,
      entityType: 'EVENT',
      entityId: id,
      metadata: { title: event.title },
    });

    return { deleted: true };
  }

  /**
   * Generate a URL-friendly slug
   */
  generateSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Derive status from event date
   */
  deriveStatus(eventDate) {
    if (!eventDate) return 'UPCOMING';
    const now = new Date();
    const date = new Date(eventDate);
    if (date < now) return 'COMPLETED';
    return 'UPCOMING';
  }
}

export const eventsService = new EventsService();
export default eventsService;
