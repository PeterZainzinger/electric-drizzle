ALTER TABLE "comments"
    ADD COLUMN "image_id_alt" uuid REFERENCES "images" ("id") ON DELETE cascade ON UPDATE no action;
