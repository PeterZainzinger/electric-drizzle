import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import migrations from './migrations';
import { buildValidationSchemaForTable } from './utils';
import {
  DbSchema,
  ElectricClient,
  Relation,
  type TableSchema,
} from 'electric-sql/client/model';

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
        ['id', 'UUID' as any],
        ['text', 'VARCHAR' as any],
        ['image_id', 'UUID' as any],
        ['image_id_alt', 'UUID' as any],
      ]),
      ...buildValidationSchemaForTable(tableComments),
      relations: [
        new Relation(
          'image',
          'image_id',
          'id',
          'images',
          'CommentsImage',
          'one'
        ),
        new Relation(
          'imageAlt',
          'image_id_alt',
          'id',
          'images',
          'CommentsImageAlt',
          'one'
        ),
      ],
    },

    reactions: {
      fields: new Map([
        ['id', 'UUID' as any],
        ['comment_id', 'UUID' as any],
        ['text', 'VARCHAR' as any],
      ]),
      ...buildValidationSchemaForTable(tableReactions),
      relations: [
        new Relation(
          'comment',
          'comment_id',
          'id',
          'comments',
          'ReactionsCommentCommentsFk',
          'one'
        ),
      ],
    },

    images: {
      fields: new Map([
        ['id', 'UUID' as any],
        ['url', 'VARCHAR' as any],
      ]),
      ...buildValidationSchemaForTable(tableImages),
      relations: [],
    },
  },
  migrations
);
