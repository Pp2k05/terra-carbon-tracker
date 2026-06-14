import { pgTable, text, timestamp, real, integer, boolean, jsonb, index } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// Better Auth tables (required for authentication)
export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name'),
  email: text('email').unique(),
  emailVerified: boolean('emailVerified'),
  image: text('image'),
  createdAt: timestamp('createdAt'),
  updatedAt: timestamp('updatedAt'),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt'),
  token: text('token').unique(),
  createdAt: timestamp('createdAt'),
  updatedAt: timestamp('updatedAt'),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId').notNull(),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId'),
  providerId: text('providerId'),
  userId: text('userId').notNull(),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt'),
  updatedAt: timestamp('updatedAt'),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier'),
  value: text('value'),
  expiresAt: timestamp('expiresAt'),
  createdAt: timestamp('createdAt'),
  updatedAt: timestamp('updatedAt'),
})

// TERRA app tables
export const carbonFootprints = pgTable('carbon_footprints', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  userId: text('userId').notNull(),
  type: text('type').notNull(), // 'receipt', 'passive', 'manual'
  category: text('category').notNull(), // 'food', 'transport', 'shopping', 'energy', 'flight'
  kgCO2: real('kgCO2').notNull(),
  receiptId: integer('receiptId'),
  description: text('description'),
  itemized: jsonb('itemized'), // for receipt breakdowns
  marked: boolean('marked').default(false),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
}, (table) => [
  index('carbon_footprints_userId_idx').on(table.userId),
  index('carbon_footprints_createdAt_idx').on(table.createdAt),
])

export const receipts = pgTable('receipts', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  userId: text('userId').notNull(),
  imageUrl: text('imageUrl').notNull(),
  ocrText: text('ocrText'),
  merchantName: text('merchantName'),
  totalAmount: real('totalAmount'),
  currency: text('currency').default('USD'),
  items: jsonb('items'), // array of {name, quantity, price, estimatedCO2}
  totalEstimatedCO2: real('totalEstimatedCO2'),
  analyzed: boolean('analyzed').default(false),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
}, (table) => [
  index('receipts_userId_idx').on(table.userId),
  index('receipts_createdAt_idx').on(table.createdAt),
])

export const userBadges = pgTable('user_badges', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  userId: text('userId').notNull(),
  badgeId: text('badgeId').notNull(), // 'first_scan', 'eco_warrior', 'carbon_conscious', '500_kg', '1000_kg', 'streak_7'
  unlockedAt: timestamp('unlockedAt').defaultNow().notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
}, (table) => [
  index('user_badges_userId_idx').on(table.userId),
])

export const carbonTrends = pgTable('carbon_trends', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  userId: text('userId').notNull(),
  weekStart: timestamp('weekStart').notNull(), // Monday of the week
  food: real('food').default(0),
  transport: real('transport').default(0),
  shopping: real('shopping').default(0),
  energy: real('energy').default(0),
  flight: real('flight').default(0),
  totalKgCO2: real('totalKgCO2').default(0),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
}, (table) => [
  index('carbon_trends_userId_idx').on(table.userId),
  index('carbon_trends_weekStart_idx').on(table.weekStart),
])

// Relations
export const carbonFootprintsRelations = relations(carbonFootprints, ({ one }) => ({
  receipt: one(receipts, {
    fields: [carbonFootprints.receiptId],
    references: [receipts.id],
  }),
}))

export const receiptsRelations = relations(receipts, ({ many }) => ({
  footprints: many(carbonFootprints),
}))
