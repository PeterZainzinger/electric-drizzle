
  
  import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
  

  
export const tableComments = sqliteTable('comments', {
  id: text('id'),
  text: text('text'),
  image_id: text('image_id')
})



export const tableReactions = sqliteTable('reactions', {
  id: text('id'),
  comment_id: text('comment_id'),
  text: text('text')
})



export const tableImages = sqliteTable('images', {
  id: text('id'),
  url: text('url')
})


  export const allTables = {tableComments, tableReactions, tableImages};
  export const allTablesWithInfo = {tableComments: {
  "oid": 17042,
  "name": {
    "name": "comments",
    "schema": "public"
  },
  "columns": [
    {
      "name": "id",
      "type": {
        "name": "uuid"
      },
      "constraints": [
        {
          "notNull": {}
        }
      ]
    },
    {
      "name": "text",
      "type": {
        "name": "varchar"
      },
      "constraints": [
        {
          "notNull": {}
        }
      ]
    },
    {
      "name": "image_id",
      "type": {
        "name": "uuid"
      }
    }
  ],
  "constraints": [
    {
      "foreign": {
        "name": "comments_image_id_fkey",
        "fkCols": [
          "image_id"
        ],
        "pkCols": [
          "id"
        ],
        "pkTable": {
          "name": "images",
          "schema": "public"
        },
        "onDelete": "CASCADE"
      }
    },
    {
      "primary": {
        "keys": [
          "id"
        ],
        "name": "comments_pkey"
      }
    }
  ]
}, tableReactions: {
  "oid": 17049,
  "name": {
    "name": "reactions",
    "schema": "public"
  },
  "columns": [
    {
      "name": "id",
      "type": {
        "name": "uuid"
      },
      "constraints": [
        {
          "notNull": {}
        }
      ]
    },
    {
      "name": "comment_id",
      "type": {
        "name": "uuid"
      },
      "constraints": [
        {
          "notNull": {}
        }
      ]
    },
    {
      "name": "text",
      "type": {
        "name": "varchar"
      },
      "constraints": [
        {
          "notNull": {}
        }
      ]
    }
  ],
  "constraints": [
    {
      "foreign": {
        "name": "reactions_comment_id_comments_id_fk",
        "fkCols": [
          "comment_id"
        ],
        "pkCols": [
          "id"
        ],
        "pkTable": {
          "name": "comments",
          "schema": "public"
        },
        "onDelete": "CASCADE"
      }
    },
    {
      "primary": {
        "keys": [
          "id"
        ],
        "name": "reactions_pkey"
      }
    }
  ]
}, tableImages: {
  "oid": 17129,
  "name": {
    "name": "images",
    "schema": "public"
  },
  "columns": [
    {
      "name": "id",
      "type": {
        "name": "uuid"
      },
      "constraints": [
        {
          "notNull": {}
        }
      ]
    },
    {
      "name": "url",
      "type": {
        "name": "varchar"
      },
      "constraints": [
        {
          "notNull": {}
        }
      ]
    }
  ],
  "constraints": [
    {
      "primary": {
        "keys": [
          "id"
        ],
        "name": "images_pkey"
      }
    }
  ]
}
  }

  export const typeMappings = {
  "varchar": "text",
  "uuid": "text",
  "int": "integer",
  "bigint": "integer"
}
  