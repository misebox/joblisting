import { pgTable, serial, text, boolean, timestamp, pgEnum } from 'drizzle-orm/pg-core';

export const statusEnum = pgEnum('status', ['new', 'reviewed', 'rejected']);

export const entries = pgTable('entries', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  company: text('company'),
  distribution: text('distribution'),
  price: text('price'),
  period: text('period'),
  location: text('location'),
  billing: text('billing'),
  interview: text('interview'),
  time: text('time'),
  notes: text('notes'),
  description: text('description'),
  requirements: text('requirements'),
  preferences: text('preferences'),
  techStack: text('tech_stack'),
  status: statusEnum('status').default('new').notNull(),
  comment: text('comment'),
  starred: boolean('starred').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Entry = typeof entries.$inferSelect;
export type NewEntry = typeof entries.$inferInsert;