import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const tableComments = sqliteTable('comments', {
  id: text('id'),
  text: text('text'),
});

export const allTables = [tableComments];
