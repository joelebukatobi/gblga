// src/services/boardMembers.service.js
// Board Members service for managing board members

import { db, boardMembers, mediaItems } from '../db/index.js';
import { eq, like, desc, asc, sql, and } from 'drizzle-orm';
import { activityService } from './activity.service.js';
import sharp from 'sharp';
import { existsSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = join(__dirname, '..', '..', 'public', 'uploads', 'board-members');

/**
 * Board Members Service
 * Handles board member CRUD operations
 */
class BoardMembersService {
  /**
   * Get all board members with optional filtering and pagination
   */
  async getAll({
    search,
    type,
    year,
    page = 1,
    limit = 10,
  } = {}) {
    const conditions = [];

    if (search) {
      conditions.push(
        sql`(${like(boardMembers.name, `%${search}%`)} OR ${like(boardMembers.role, `%${search}%`)})`
      );
    }

    if (type) {
      conditions.push(eq(boardMembers.type, type.toUpperCase()));
    }

    if (year) {
      conditions.push(eq(boardMembers.year, parseInt(year, 10)));
    }

    const whereClause = conditions.length > 1 ? and(...conditions) : conditions[0];

    // Get total count
    let countQuery = db.select({ count: sql`count(*)` }).from(boardMembers);
    if (whereClause) {
      countQuery = countQuery.where(whereClause);
    }
    const [{ count }] = await countQuery;
    const total = Number(count);

    // Build main query with photo join
    let query = db
      .select({
        id: boardMembers.id,
        name: boardMembers.name,
        role: boardMembers.role,
        email: boardMembers.email,
        bio: boardMembers.bio,
        type: boardMembers.type,
        year: boardMembers.year,
        photoId: boardMembers.photoId,
        photoUrl: boardMembers.photoUrl,
        createdAt: boardMembers.createdAt,
        updatedAt: boardMembers.updatedAt,
        photo: {
          id: mediaItems.id,
          path: mediaItems.path,
          thumbnailPath: mediaItems.thumbnailPath,
        },
      })
      .from(boardMembers)
      .leftJoin(mediaItems, eq(boardMembers.photoId, mediaItems.id));

    if (whereClause) {
      query = query.where(whereClause);
    }

    // Role-based sorting: President → Vice President → Senior → Junior
    query = query.orderBy(
      sql`CASE 
        WHEN ${boardMembers.role} LIKE '%President%' AND ${boardMembers.role} NOT LIKE '%Vice%' THEN 1
        WHEN ${boardMembers.role} LIKE '%Vice%' THEN 2
        WHEN ${boardMembers.type} = 'SENIOR' THEN 3
        ELSE 4
      END`,
      asc(boardMembers.name)
    );

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
   * Get board member by ID
   */
  async getById(id) {
    const [member] = await db
      .select({
        id: boardMembers.id,
        name: boardMembers.name,
        role: boardMembers.role,
        email: boardMembers.email,
        bio: boardMembers.bio,
        type: boardMembers.type,
        year: boardMembers.year,
        photoId: boardMembers.photoId,
        photoUrl: boardMembers.photoUrl,
        createdAt: boardMembers.createdAt,
        updatedAt: boardMembers.updatedAt,
        photo: {
          id: mediaItems.id,
          path: mediaItems.path,
          thumbnailPath: mediaItems.thumbnailPath,
        },
      })
      .from(boardMembers)
      .leftJoin(mediaItems, eq(boardMembers.photoId, mediaItems.id))
      .where(eq(boardMembers.id, id));

    return member || null;
  }

  /**
   * Upload board member photo
   */
  async uploadPhoto(id, file) {
    const dir = join(UPLOAD_DIR, id);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    const buffer = await file.toBuffer();
    const outputPath = join(dir, 'photo.jpg');

    await sharp(buffer)
      .resize(400, 400, { fit: 'cover', position: 'center' })
      .jpeg({ quality: 90 })
      .toFile(outputPath);

    return `/uploads/board-members/${id}/photo.jpg`;
  }

  /**
   * Update board member photo URL
   */
  async updatePhoto(id, photoUrl) {
    await db.update(boardMembers)
      .set({ photoUrl, updatedAt: new Date() })
      .where(eq(boardMembers.id, id));
    return this.getById(id);
  }

  /**
   * Create a new board member
   */
  async create(data, userId) {
    await db.insert(boardMembers).values({
      name: data.name,
      role: data.role,
      email: data.email || null,
      bio: data.bio || null,
      type: data.type || 'SENIOR',
      year: parseInt(data.year, 10),
      photoId: data.photoId || null,
      photoUrl: data.photoUrl || null,
    });

    const [member] = await db
      .select()
      .from(boardMembers)
      .orderBy(desc(boardMembers.createdAt))
      .limit(1);

    await activityService.log({
      userId,
      type: 'BOARD_MEMBER_CREATED',
      description: `Created board member "${member.name}"`,
      entityType: 'BOARD_MEMBER',
      entityId: member.id,
      metadata: { name: member.name, role: member.role },
    });

    return member;
  }

  /**
   * Update a board member
   */
  async update(id, data, userId) {
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error('Board member not found');
    }

    const updateData = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.year !== undefined) updateData.year = parseInt(data.year, 10);
    if (data.photoId !== undefined) updateData.photoId = data.photoId;
    if (data.photoUrl !== undefined) updateData.photoUrl = data.photoUrl;

    await db.update(boardMembers).set(updateData).where(eq(boardMembers.id, id));

    const [member] = await db
      .select()
      .from(boardMembers)
      .where(eq(boardMembers.id, id))
      .limit(1);

    await activityService.log({
      userId,
      type: 'BOARD_MEMBER_UPDATED',
      description: `Updated board member "${member.name}"`,
      entityType: 'BOARD_MEMBER',
      entityId: id,
      metadata: { name: member.name, role: member.role },
    });

    return member;
  }

  /**
   * Delete a board member
   */
  async delete(id, userId) {
    const member = await this.getById(id);
    if (!member) {
      throw new Error('Board member not found');
    }

    await db.delete(boardMembers).where(eq(boardMembers.id, id));

    await activityService.log({
      userId,
      type: 'BOARD_MEMBER_DELETED',
      description: `Deleted board member "${member.name}"`,
      entityType: 'BOARD_MEMBER',
      entityId: id,
      metadata: { name: member.name, role: member.role },
    });

    return { deleted: true };
  }
}

export const boardMembersService = new BoardMembersService();
export default boardMembersService;
