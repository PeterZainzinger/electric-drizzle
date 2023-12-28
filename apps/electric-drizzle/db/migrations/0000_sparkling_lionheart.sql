CREATE TABLE IF NOT EXISTS "comments" (
	"id" uuid PRIMARY KEY NOT NULL,
	"text" varchar NOT NULL
);

CREATE TABLE IF NOT EXISTS "reactions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"comment_id" uuid NOT NULL,
	"text" varchar NOT NULL
);

 ALTER TABLE "reactions" ADD CONSTRAINT "reactions_comment_id_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "comments"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "comments" enable electric;
ALTER TABLE "reactions" enable electric;

