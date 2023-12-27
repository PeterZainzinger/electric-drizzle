import { pgTable, uuid, varchar } from 'drizzle-orm/pg-core';

export const tableComments = pgTable('comments', {
  id: uuid('id').notNull().primaryKey(),
  text: varchar('text').notNull(),
});
