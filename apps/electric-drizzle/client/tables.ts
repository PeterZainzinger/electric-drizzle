/* eslint-disable @typescript-eslint/no-explicit-any */
import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import migrations from './migrations';
import { buildValidationSchemaForTable } from './utils';
import { DbSchema, Relation } from 'electric-sql/client/model';
import { relations } from 'drizzle-orm';

export const tableComments = sqliteTable('comments', {
  id: text('id').notNull(),
  text: text('text').notNull(),
  image_id: text('image_id'),
  image_id_alt: text('image_id_alt'),
});

export const relationsComments = relations(tableComments, ({ one, many }) => ({
  image: one(tableImages, {
    fields: [tableComments.image_id],
    references: [tableImages.id],
    relationName: 'CommentsImage',
  }),
  imageAlt: one(tableImages, {
    fields: [tableComments.image_id_alt],
    references: [tableImages.id],
    relationName: 'CommentsImageAlt',
  }),
  reactions: many(tableReactions, {
    relationName: 'ReactionsCommentCommentsFk',
  }),
}));

export const tableReactions = sqliteTable('reactions', {
  id: text('id').notNull(),
  comment_id: text('comment_id').notNull(),
  text: text('text').notNull(),
});

export const relationsReactions = relations(
  tableReactions,
  ({ one, many }) => ({
    comment: one(tableComments, {
      fields: [tableReactions.comment_id],
      references: [tableComments.id],
      relationName: 'ReactionsCommentCommentsFk',
    }),
  })
);

export const tableImages = sqliteTable('images', {
  id: text('id').notNull(),
  url: text('url').notNull(),
});

export const relationsImages = relations(tableImages, ({ one, many }) => ({
  commentsImage: many(tableComments, {
    relationName: 'CommentsImage',
  }),
  commentsImageAlt: many(tableComments, {
    relationName: 'CommentsImageAlt',
  }),
}));

export const allTables = {
  tableComments,
  relationsComments,
  tableReactions,
  relationsReactions,
  tableImages,
  relationsImages,
};

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
        new Relation(
          'reactions',
          '',
          '',
          'reactions',
          'ReactionsCommentCommentsFk',
          'many'
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
      relations: [
        new Relation(
          'commentsImage',
          '',
          '',
          'comments',
          'CommentsImage',
          'many'
        ),
        new Relation(
          'commentsImageAlt',
          '',
          '',
          'comments',
          'CommentsImageAlt',
          'many'
        ),
      ],
    },
  },
  migrations
);
