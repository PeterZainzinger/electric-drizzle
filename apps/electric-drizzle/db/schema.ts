import { pgTable, uuid, varchar } from 'drizzle-orm/pg-core';

export const tableComments = pgTable('comments', {
  id: uuid('id').notNull().primaryKey(),
  text: varchar('text').notNull(),
  image_id: uuid('image_id').references(() => images.id, {
    onDelete: 'cascade',
  }),
  image_id_alt: uuid('image_id_alt').references(() => images.id, {
    onDelete: 'cascade',
  }),
});

export const tableReactions = pgTable('reactions', {
  id: uuid('id').notNull().primaryKey(),
  comment_id: uuid('comment_id')
    .notNull()
    .references(() => tableComments.id, {
      onDelete: 'cascade',
    }),
  text: varchar('text').notNull(),
});

export const images = pgTable('images', {
  id: uuid('id').notNull().primaryKey(),
  url: varchar('url').notNull(),
});
