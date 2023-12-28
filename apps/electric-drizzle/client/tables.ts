import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import migrations from './migrations';
import { buildValidationSchemaForTable } from './utils';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import {
  DbSchema,
  ElectricClient,
  Relation,
  type TableSchema,
} from 'electric-sql/client/model';
import {
  PgBasicType,
  PgDateType,
} from 'electric-sql/dist/client/conversions/types';

export const tableComments = sqliteTable('comments', {
  id: text('id'),
  text: text('text'),
  image_id: text('image_id'),
  image_id_alt: text('image_id_alt'),
});

export const tableReactions = sqliteTable('reactions', {
  id: text('id'),
  comment_id: text('comment_id'),
  text: text('text'),
});

export const tableImages = sqliteTable('images', {
  id: text('id'),
  url: text('url'),
});

export const allTables = { tableComments, tableReactions, tableImages };

export const schema = new DbSchema(
  {
    comments: {
      fields: new Map([
        ['id', PgBasicType.PG_UUID],
        ['text', PgBasicType.PG_VARCHAR],
        ['image_id', PgBasicType.PG_UUID],
        ['image_id_alt', PgBasicType.PG_UUID],
      ]),
      ...buildValidationSchemaForTable(tableComments),
      relations: [],
    },

    reactions: {
      fields: new Map([
        ['id', PgBasicType.PG_UUID],
        ['comment_id', PgBasicType.PG_UUID],
        ['text', PgBasicType.PG_VARCHAR],
      ]),
      ...buildValidationSchemaForTable(tableReactions),
      relations: [],
    },

    images: {
      fields: new Map([
        ['id', PgBasicType.PG_UUID],
        ['url', PgBasicType.PG_VARCHAR],
      ]),
      ...buildValidationSchemaForTable(tableImages),
      relations: [],
    },
  },
  migrations
);
