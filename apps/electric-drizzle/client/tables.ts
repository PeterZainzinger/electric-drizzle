import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const tableComments = sqliteTable('comments', {
  id: text('id'),
  text: text('text'),
});

export const allTables = { tableComments };
export const allTablesWithInfo = {
  tableComments: {
    oid: 16780,
    name: {
      name: 'comments',
      schema: 'public',
    },
    columns: [
      {
        name: 'id',
        type: {
          name: 'uuid',
        },
        constraints: [
          {
            notNull: {},
          },
        ],
      },
      {
        name: 'text',
        type: {
          name: 'varchar',
        },
        constraints: [
          {
            notNull: {},
          },
        ],
      },
    ],
    constraints: [
      {
        primary: {
          keys: ['id'],
          name: 'comments_pkey',
        },
      },
    ],
  },
};

export const typeMappings = {
  varchar: 'text',
  uuid: 'text',
  int: 'integer',
  bigint: 'integer',
};
