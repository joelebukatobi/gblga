// src/db/schema.js
import {
  mysqlTable,
  varchar,
  text,
  int,
  boolean,
  timestamp,
  json,
  mysqlEnum,
  primaryKey,
  date,
  uniqueIndex,
} from 'drizzle-orm/mysql-core';
import { relations, sql } from 'drizzle-orm';
import crypto from 'crypto';

const idColumn = (name = 'id') => {
  const column = varchar(name, { length: 36 });
  return name === 'id' ? column.$defaultFn(() => crypto.randomUUID()) : column;
};

// ============================================
// ENUMS
// ============================================

export const userRoleEnum = ['ADMIN', 'EDITOR', 'AUTHOR', 'VIEWER'];
export const userStatusEnum = ['ACTIVE', 'INVITED', 'SUSPENDED'];
export const postStatusEnum = ['PUBLISHED', 'DRAFT', 'ARCHIVED', 'SCHEDULED'];
export const commentStatusEnum = ['PENDING', 'APPROVED', 'SPAM'];
export const mediaTypeEnum = ['IMAGE', 'VIDEO'];
export const settingGroupEnum = ['GENERAL', 'SECURITY', 'CONTENT', 'EMAIL', 'SOCIAL'];
export const settingTypeEnum = ['STRING', 'NUMBER', 'BOOLEAN', 'JSON'];
export const activityTypeEnum = [
  'POST_CREATED',
  'POST_UPDATED',
  'POST_PUBLISHED',
  'POST_DELETED',
  'CATEGORY_CREATED',
  'CATEGORY_UPDATED',
  'CATEGORY_DELETED',
  'TAG_CREATED',
  'TAG_UPDATED',
  'TAG_DELETED',
  'USER_CREATED',
  'USER_UPDATED',
  'USER_DELETED',
  'USER_INVITED',
  'USER_SUSPENDED',
  'USER_ACTIVATED',
  'IMAGE_UPLOADED',
  'IMAGE_UPDATED',
  'IMAGE_DELETED',
  'VIDEO_UPLOADED',
  'VIDEO_UPDATED',
  'VIDEO_DELETED',
  'LOGIN',
  'LOGOUT',
  'SETTINGS_UPDATED',
  'COMMENT_CREATED',
  'SUBSCRIBER_CREATED',
  'EVENT_CREATED',
  'EVENT_UPDATED',
  'EVENT_DELETED',
  'BOARD_MEMBER_CREATED',
  'BOARD_MEMBER_UPDATED',
  'BOARD_MEMBER_DELETED',
];
export const subscriberStatusEnum = ['ACTIVE', 'PENDING', 'UNSUBSCRIBED', 'BOUNCED'];
export const eventStatusEnum = ['UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED'];
export const boardMemberTypeEnum = ['SENIOR', 'JUNIOR'];

// ============================================
// USERS
// ============================================

export const users = mysqlTable('users', {
  id: idColumn().primaryKey(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }),
  role: mysqlEnum('role', userRoleEnum).default('VIEWER').notNull(),
  status: mysqlEnum('status', userStatusEnum).default('ACTIVE').notNull(),
  avatarUrl: varchar('avatar_url', { length: 500 }),
  emailVerified: boolean('email_verified').default(false).notNull(),
  invitedAt: timestamp('invited_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  lastActiveAt: timestamp('last_active_at'),
  failedLoginAttempts: int('failed_login_attempts').default(0).notNull(),
  lockedUntil: timestamp('locked_until'),
});

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  sessions: many(sessions),
  activities: many(activities),
}));

// ============================================
// SESSIONS
// ============================================

export const sessions = mysqlTable('sessions', {
  id: idColumn().primaryKey(),
  userId: idColumn('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: varchar('token', { length: 500 }).notNull().unique(),
  rememberMe: boolean('remember_me').default(false).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
});

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

// ============================================
// PASSWORD RESETS
// ============================================

export const passwordResets = mysqlTable('password_resets', {
  id: idColumn().primaryKey(),
  userId: idColumn('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: varchar('token', { length: 500 }).notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  usedAt: timestamp('used_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const mediaItemsRelations = relations(mediaItems, ({ one }) => ({
  album: one(albums, {
    fields: [mediaItems.albumId],
    references: [albums.id],
  }),
}));

// ============================================
// SETTINGS
// ============================================

export const settings = mysqlTable('settings', {
  id: idColumn().primaryKey(),
  key: varchar('key', { length: 100 }).notNull().unique(),
  value: text('value').notNull(),
  group: mysqlEnum('group', settingGroupEnum).default('GENERAL').notNull(),
  type: mysqlEnum('type', settingTypeEnum).default('STRING').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================
// ACTIVITIES
// ============================================

export const activities = mysqlTable('activities', {
  id: idColumn().primaryKey(),
  userId: idColumn('user_id').references(() => users.id, { onDelete: 'set null' }),
  type: mysqlEnum('type', activityTypeEnum).notNull(),
  description: text('description').notNull(),
  entityType: varchar('entity_type', { length: 50 }),
  entityId: idColumn('entity_id'),
  metadata: json('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const activitiesRelations = relations(activities, ({ one }) => ({
  user: one(users, {
    fields: [activities.userId],
    references: [users.id],
  }),
}));

// ============================================
// ANALYTICS EVENTS
// ============================================

export const analyticsEvents = mysqlTable('analytics_events', {
  id: idColumn().primaryKey(),
  type: varchar('type', { length: 50 }).notNull(),
  postId: idColumn('post_id').references(() => posts.id),
  sessionId: varchar('session_id', { length: 255 }),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  referrer: text('referrer'),
  path: varchar('path', { length: 500 }),
  metadata: json('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================
// DAILY PAGE VIEWS (for traffic analytics)
// ============================================

export const dailyPageViews = mysqlTable(
  'daily_page_views',
  {
    id: idColumn().primaryKey(),
    date: date('date').notNull(),
    totalViews: int('total_views').default(0).notNull(),
    uniqueVisitors: int('unique_visitors').default(0).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    dateIdx: uniqueIndex('daily_page_views_date_idx').on(table.date),
  }),
);

// ============================================
// SUBSCRIBERS
// ============================================

export const subscribers = mysqlTable('subscribers', {
  id: idColumn().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 100 }),
  status: mysqlEnum('status', subscriberStatusEnum).default('ACTIVE').notNull(),
  confirmedAt: timestamp('confirmed_at'),
  unsubscribedAt: timestamp('unsubscribed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================
// EVENTS
// ============================================

export const events = mysqlTable('events', {
  id: idColumn().primaryKey(),
  title: varchar('title', { length: 200 }).notNull(),
  slug: varchar('slug', { length: 200 }).notNull().unique(),
  description: text('description'),
  location: varchar('location', { length: 255 }),
  eventDate: timestamp('event_date'),
  eventTime: varchar('event_time', { length: 20 }),
  status: mysqlEnum('status', eventStatusEnum).default('UPCOMING').notNull(),
  featuredImageId: idColumn('featured_image_id').references(() => mediaItems.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const eventsRelations = relations(events, ({ one }) => ({
  featuredImage: one(mediaItems, {
    fields: [events.featuredImageId],
    references: [mediaItems.id],
  }),
}));

// ============================================
// BOARD MEMBERS
// ============================================

export const boardMembers = mysqlTable('board_members', {
  id: idColumn().primaryKey(),
  name: varchar('name', { length: 200 }).notNull(),
  role: varchar('role', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }),
  bio: text('bio'),
  type: mysqlEnum('type', boardMemberTypeEnum).default('SENIOR').notNull(),
  year: int('year').notNull(),
  photoId: idColumn('photo_id').references(() => mediaItems.id),
  order: int('order').default(0).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const boardMembersRelations = relations(boardMembers, ({ one }) => ({
  photo: one(mediaItems, {
    fields: [boardMembers.photoId],
    references: [mediaItems.id],
  }),
}));

// ============================================
// OAUTH ACCOUNTS
// ============================================

export const oauthAccounts = mysqlTable(
  'oauth_accounts',
  {
    id: idColumn().notNull(),
    userId: idColumn('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    provider: varchar('provider', { length: 50 }).notNull(),
    providerAccountId: varchar('provider_account_id', { length: 255 }).notNull(),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    expiresAt: timestamp('expires_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.provider, table.providerAccountId] }),
  }),
);

// Setup tokens for first-launch configuration
export const setupTokens = mysqlTable('setup_tokens', {
  id: idColumn().notNull(),
  tokenHash: varchar('token_hash', { length: 64 }).notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  usedAt: timestamp('used_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Shared helper to set updatedAt in services when needed
export const now = () => sql`CURRENT_TIMESTAMP`;
