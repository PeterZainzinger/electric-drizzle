CREATE TABLE IF NOT EXISTS "images"
(
    "id"  uuid PRIMARY KEY NOT NULL,
    "url" varchar          NOT NULL
);

ALTER TABLE "comments"
    ADD COLUMN "image_id" uuid references "images" ("id") ON DELETE cascade ON UPDATE no action;
