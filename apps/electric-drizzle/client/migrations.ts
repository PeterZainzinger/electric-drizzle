export default [
  {
    "statements": [
      "CREATE TABLE comments (\n    id uuid NOT NULL,\n    text character varying NOT NULL,\n    CONSTRAINT comments_pkey PRIMARY KEY (id)\n);",
      "-- Toggles for turning the triggers on and off\nINSERT OR IGNORE INTO _electric_trigger_settings(tablename,flag) VALUES ('main.comments', 1);",
      "/* Triggers for table comments */\n\n-- ensures primary key is immutable\nDROP TRIGGER IF EXISTS update_ensure_main_comments_primarykey;",
      "CREATE TRIGGER update_ensure_main_comments_primarykey\n  BEFORE UPDATE ON \"main\".\"comments\"\nBEGIN\n  SELECT\n    CASE\n      WHEN old.\"id\" != new.\"id\" THEN\n      \t\tRAISE (ABORT, 'cannot change the value of column id as it belongs to the primary key')\n    END;\nEND;",
      "-- Triggers that add INSERT, UPDATE, DELETE operation to the _opslog table\nDROP TRIGGER IF EXISTS insert_main_comments_into_oplog;",
      "CREATE TRIGGER insert_main_comments_into_oplog\n   AFTER INSERT ON \"main\".\"comments\"\n   WHEN 1 == (SELECT flag from _electric_trigger_settings WHERE tablename == 'main.comments')\nBEGIN\n  INSERT INTO _electric_oplog (namespace, tablename, optype, primaryKey, newRow, oldRow, timestamp)\n  VALUES ('main', 'comments', 'INSERT', json_object('id', new.\"id\"), json_object('id', new.\"id\", 'text', new.\"text\"), NULL, NULL);\nEND;",
      "DROP TRIGGER IF EXISTS update_main_comments_into_oplog;",
      "CREATE TRIGGER update_main_comments_into_oplog\n   AFTER UPDATE ON \"main\".\"comments\"\n   WHEN 1 == (SELECT flag from _electric_trigger_settings WHERE tablename == 'main.comments')\nBEGIN\n  INSERT INTO _electric_oplog (namespace, tablename, optype, primaryKey, newRow, oldRow, timestamp)\n  VALUES ('main', 'comments', 'UPDATE', json_object('id', new.\"id\"), json_object('id', new.\"id\", 'text', new.\"text\"), json_object('id', old.\"id\", 'text', old.\"text\"), NULL);\nEND;",
      "DROP TRIGGER IF EXISTS delete_main_comments_into_oplog;",
      "CREATE TRIGGER delete_main_comments_into_oplog\n   AFTER DELETE ON \"main\".\"comments\"\n   WHEN 1 == (SELECT flag from _electric_trigger_settings WHERE tablename == 'main.comments')\nBEGIN\n  INSERT INTO _electric_oplog (namespace, tablename, optype, primaryKey, newRow, oldRow, timestamp)\n  VALUES ('main', 'comments', 'DELETE', json_object('id', old.\"id\"), NULL, json_object('id', old.\"id\", 'text', old.\"text\"), NULL);\nEND;"
    ],
    "version": "20231227190244_705"
  }
]