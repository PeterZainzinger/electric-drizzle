export default [
  {
    "statements": [
      "CREATE TABLE \"comments\" (\n  \"id\" TEXT NOT NULL,\n  \"text\" TEXT NOT NULL,\n  CONSTRAINT \"comments_pkey\" PRIMARY KEY (\"id\")\n) WITHOUT ROWID;",
      "CREATE TABLE \"reactions\" (\n  \"id\" TEXT NOT NULL,\n  \"comment_id\" TEXT NOT NULL,\n  \"text\" TEXT NOT NULL,\n  CONSTRAINT \"reactions_comment_id_comments_id_fk\" FOREIGN KEY (\"comment_id\") REFERENCES \"comments\" (\"id\") ON DELETE CASCADE,\n  CONSTRAINT \"reactions_pkey\" PRIMARY KEY (\"id\")\n) WITHOUT ROWID;",
      "ALTER TABLE \"comments\" ADD COLUMN \"image_id\" TEXT CONSTRAINT \"comments_image_id_fkey\" REFERENCES \"images\" (\"id\") ON DELETE CASCADE;",
      "-- Toggles for turning the triggers on and off\nINSERT OR IGNORE INTO _electric_trigger_settings(tablename,flag) VALUES ('main.comments', 1);",
      "/* Triggers for table comments */\n\n-- ensures primary key is immutable\nDROP TRIGGER IF EXISTS update_ensure_main_comments_primarykey;",
      "CREATE TRIGGER update_ensure_main_comments_primarykey\n  BEFORE UPDATE ON \"main\".\"comments\"\nBEGIN\n  SELECT\n    CASE\n      WHEN old.\"id\" != new.\"id\" THEN\n      \t\tRAISE (ABORT, 'cannot change the value of column id as it belongs to the primary key')\n    END;\nEND;",
      "-- Triggers that add INSERT, UPDATE, DELETE operation to the _opslog table\nDROP TRIGGER IF EXISTS insert_main_comments_into_oplog;",
      "CREATE TRIGGER insert_main_comments_into_oplog\n   AFTER INSERT ON \"main\".\"comments\"\n   WHEN 1 == (SELECT flag from _electric_trigger_settings WHERE tablename == 'main.comments')\nBEGIN\n  INSERT INTO _electric_oplog (namespace, tablename, optype, primaryKey, newRow, oldRow, timestamp)\n  VALUES ('main', 'comments', 'INSERT', json_object('id', new.\"id\"), json_object('id', new.\"id\", 'image_id', new.\"image_id\", 'image_id_alt', new.\"image_id_alt\", 'text', new.\"text\"), NULL, NULL);\nEND;",
      "DROP TRIGGER IF EXISTS update_main_comments_into_oplog;",
      "CREATE TRIGGER update_main_comments_into_oplog\n   AFTER UPDATE ON \"main\".\"comments\"\n   WHEN 1 == (SELECT flag from _electric_trigger_settings WHERE tablename == 'main.comments')\nBEGIN\n  INSERT INTO _electric_oplog (namespace, tablename, optype, primaryKey, newRow, oldRow, timestamp)\n  VALUES ('main', 'comments', 'UPDATE', json_object('id', new.\"id\"), json_object('id', new.\"id\", 'image_id', new.\"image_id\", 'image_id_alt', new.\"image_id_alt\", 'text', new.\"text\"), json_object('id', old.\"id\", 'image_id', old.\"image_id\", 'image_id_alt', old.\"image_id_alt\", 'text', old.\"text\"), NULL);\nEND;",
      "DROP TRIGGER IF EXISTS delete_main_comments_into_oplog;",
      "CREATE TRIGGER delete_main_comments_into_oplog\n   AFTER DELETE ON \"main\".\"comments\"\n   WHEN 1 == (SELECT flag from _electric_trigger_settings WHERE tablename == 'main.comments')\nBEGIN\n  INSERT INTO _electric_oplog (namespace, tablename, optype, primaryKey, newRow, oldRow, timestamp)\n  VALUES ('main', 'comments', 'DELETE', json_object('id', old.\"id\"), NULL, json_object('id', old.\"id\", 'image_id', old.\"image_id\", 'image_id_alt', old.\"image_id_alt\", 'text', old.\"text\"), NULL);\nEND;",
      "-- Toggles for turning the triggers on and off\nINSERT OR IGNORE INTO _electric_trigger_settings(tablename,flag) VALUES ('main.reactions', 1);",
      "/* Triggers for table reactions */\n\n-- ensures primary key is immutable\nDROP TRIGGER IF EXISTS update_ensure_main_reactions_primarykey;",
      "CREATE TRIGGER update_ensure_main_reactions_primarykey\n  BEFORE UPDATE ON \"main\".\"reactions\"\nBEGIN\n  SELECT\n    CASE\n      WHEN old.\"id\" != new.\"id\" THEN\n      \t\tRAISE (ABORT, 'cannot change the value of column id as it belongs to the primary key')\n    END;\nEND;",
      "-- Triggers that add INSERT, UPDATE, DELETE operation to the _opslog table\nDROP TRIGGER IF EXISTS insert_main_reactions_into_oplog;",
      "CREATE TRIGGER insert_main_reactions_into_oplog\n   AFTER INSERT ON \"main\".\"reactions\"\n   WHEN 1 == (SELECT flag from _electric_trigger_settings WHERE tablename == 'main.reactions')\nBEGIN\n  INSERT INTO _electric_oplog (namespace, tablename, optype, primaryKey, newRow, oldRow, timestamp)\n  VALUES ('main', 'reactions', 'INSERT', json_object('id', new.\"id\"), json_object('comment_id', new.\"comment_id\", 'id', new.\"id\", 'text', new.\"text\"), NULL, NULL);\nEND;",
      "DROP TRIGGER IF EXISTS update_main_reactions_into_oplog;",
      "CREATE TRIGGER update_main_reactions_into_oplog\n   AFTER UPDATE ON \"main\".\"reactions\"\n   WHEN 1 == (SELECT flag from _electric_trigger_settings WHERE tablename == 'main.reactions')\nBEGIN\n  INSERT INTO _electric_oplog (namespace, tablename, optype, primaryKey, newRow, oldRow, timestamp)\n  VALUES ('main', 'reactions', 'UPDATE', json_object('id', new.\"id\"), json_object('comment_id', new.\"comment_id\", 'id', new.\"id\", 'text', new.\"text\"), json_object('comment_id', old.\"comment_id\", 'id', old.\"id\", 'text', old.\"text\"), NULL);\nEND;",
      "DROP TRIGGER IF EXISTS delete_main_reactions_into_oplog;",
      "CREATE TRIGGER delete_main_reactions_into_oplog\n   AFTER DELETE ON \"main\".\"reactions\"\n   WHEN 1 == (SELECT flag from _electric_trigger_settings WHERE tablename == 'main.reactions')\nBEGIN\n  INSERT INTO _electric_oplog (namespace, tablename, optype, primaryKey, newRow, oldRow, timestamp)\n  VALUES ('main', 'reactions', 'DELETE', json_object('id', old.\"id\"), NULL, json_object('comment_id', old.\"comment_id\", 'id', old.\"id\", 'text', old.\"text\"), NULL);\nEND;"
    ],
    "version": "20231227203453_972"
  },
  {
    "statements": [
      "CREATE TABLE \"images\" (\n  \"id\" TEXT NOT NULL,\n  \"url\" TEXT NOT NULL,\n  CONSTRAINT \"images_pkey\" PRIMARY KEY (\"id\")\n) WITHOUT ROWID;",
      "-- Toggles for turning the triggers on and off\nINSERT OR IGNORE INTO _electric_trigger_settings(tablename,flag) VALUES ('main.images', 1);",
      "/* Triggers for table images */\n\n-- ensures primary key is immutable\nDROP TRIGGER IF EXISTS update_ensure_main_images_primarykey;",
      "CREATE TRIGGER update_ensure_main_images_primarykey\n  BEFORE UPDATE ON \"main\".\"images\"\nBEGIN\n  SELECT\n    CASE\n      WHEN old.\"id\" != new.\"id\" THEN\n      \t\tRAISE (ABORT, 'cannot change the value of column id as it belongs to the primary key')\n    END;\nEND;",
      "-- Triggers that add INSERT, UPDATE, DELETE operation to the _opslog table\nDROP TRIGGER IF EXISTS insert_main_images_into_oplog;",
      "CREATE TRIGGER insert_main_images_into_oplog\n   AFTER INSERT ON \"main\".\"images\"\n   WHEN 1 == (SELECT flag from _electric_trigger_settings WHERE tablename == 'main.images')\nBEGIN\n  INSERT INTO _electric_oplog (namespace, tablename, optype, primaryKey, newRow, oldRow, timestamp)\n  VALUES ('main', 'images', 'INSERT', json_object('id', new.\"id\"), json_object('id', new.\"id\", 'url', new.\"url\"), NULL, NULL);\nEND;",
      "DROP TRIGGER IF EXISTS update_main_images_into_oplog;",
      "CREATE TRIGGER update_main_images_into_oplog\n   AFTER UPDATE ON \"main\".\"images\"\n   WHEN 1 == (SELECT flag from _electric_trigger_settings WHERE tablename == 'main.images')\nBEGIN\n  INSERT INTO _electric_oplog (namespace, tablename, optype, primaryKey, newRow, oldRow, timestamp)\n  VALUES ('main', 'images', 'UPDATE', json_object('id', new.\"id\"), json_object('id', new.\"id\", 'url', new.\"url\"), json_object('id', old.\"id\", 'url', old.\"url\"), NULL);\nEND;",
      "DROP TRIGGER IF EXISTS delete_main_images_into_oplog;",
      "CREATE TRIGGER delete_main_images_into_oplog\n   AFTER DELETE ON \"main\".\"images\"\n   WHEN 1 == (SELECT flag from _electric_trigger_settings WHERE tablename == 'main.images')\nBEGIN\n  INSERT INTO _electric_oplog (namespace, tablename, optype, primaryKey, newRow, oldRow, timestamp)\n  VALUES ('main', 'images', 'DELETE', json_object('id', old.\"id\"), NULL, json_object('id', old.\"id\", 'url', old.\"url\"), NULL);\nEND;"
    ],
    "version": "20231227204309_732"
  },
  {
    "statements": [
      "ALTER TABLE \"comments\" ADD COLUMN \"image_id_alt\" TEXT CONSTRAINT \"comments_image_id_alt_fkey\" REFERENCES \"images\" (\"id\") ON DELETE CASCADE;",
      "-- Toggles for turning the triggers on and off\nINSERT OR IGNORE INTO _electric_trigger_settings(tablename,flag) VALUES ('main.comments', 1);",
      "/* Triggers for table comments */\n\n-- ensures primary key is immutable\nDROP TRIGGER IF EXISTS update_ensure_main_comments_primarykey;",
      "CREATE TRIGGER update_ensure_main_comments_primarykey\n  BEFORE UPDATE ON \"main\".\"comments\"\nBEGIN\n  SELECT\n    CASE\n      WHEN old.\"id\" != new.\"id\" THEN\n      \t\tRAISE (ABORT, 'cannot change the value of column id as it belongs to the primary key')\n    END;\nEND;",
      "-- Triggers that add INSERT, UPDATE, DELETE operation to the _opslog table\nDROP TRIGGER IF EXISTS insert_main_comments_into_oplog;",
      "CREATE TRIGGER insert_main_comments_into_oplog\n   AFTER INSERT ON \"main\".\"comments\"\n   WHEN 1 == (SELECT flag from _electric_trigger_settings WHERE tablename == 'main.comments')\nBEGIN\n  INSERT INTO _electric_oplog (namespace, tablename, optype, primaryKey, newRow, oldRow, timestamp)\n  VALUES ('main', 'comments', 'INSERT', json_object('id', new.\"id\"), json_object('id', new.\"id\", 'image_id', new.\"image_id\", 'image_id_alt', new.\"image_id_alt\", 'text', new.\"text\"), NULL, NULL);\nEND;",
      "DROP TRIGGER IF EXISTS update_main_comments_into_oplog;",
      "CREATE TRIGGER update_main_comments_into_oplog\n   AFTER UPDATE ON \"main\".\"comments\"\n   WHEN 1 == (SELECT flag from _electric_trigger_settings WHERE tablename == 'main.comments')\nBEGIN\n  INSERT INTO _electric_oplog (namespace, tablename, optype, primaryKey, newRow, oldRow, timestamp)\n  VALUES ('main', 'comments', 'UPDATE', json_object('id', new.\"id\"), json_object('id', new.\"id\", 'image_id', new.\"image_id\", 'image_id_alt', new.\"image_id_alt\", 'text', new.\"text\"), json_object('id', old.\"id\", 'image_id', old.\"image_id\", 'image_id_alt', old.\"image_id_alt\", 'text', old.\"text\"), NULL);\nEND;",
      "DROP TRIGGER IF EXISTS delete_main_comments_into_oplog;",
      "CREATE TRIGGER delete_main_comments_into_oplog\n   AFTER DELETE ON \"main\".\"comments\"\n   WHEN 1 == (SELECT flag from _electric_trigger_settings WHERE tablename == 'main.comments')\nBEGIN\n  INSERT INTO _electric_oplog (namespace, tablename, optype, primaryKey, newRow, oldRow, timestamp)\n  VALUES ('main', 'comments', 'DELETE', json_object('id', old.\"id\"), NULL, json_object('id', old.\"id\", 'image_id', old.\"image_id\", 'image_id_alt', old.\"image_id_alt\", 'text', old.\"text\"), NULL);\nEND;"
    ],
    "version": "20231228085322_902"
  }
]