CREATE TABLE "speaking_events" (
	"id" text PRIMARY KEY NOT NULL,
	"committee_id" text NOT NULL,
	"member_id" text NOT NULL,
	"start_time" timestamp with time zone NOT NULL,
	"end_time" timestamp with time zone,
	"duration" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "committee_motions" ADD COLUMN "mod_topic" text;--> statement-breakpoint
ALTER TABLE "speaking_events" ADD CONSTRAINT "speaking_events_committee_id_committees_id_fk" FOREIGN KEY ("committee_id") REFERENCES "public"."committees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "speaking_events" ADD CONSTRAINT "speaking_events_member_id_committee_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."committee_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "speaking_events_committee_id_idx" ON "speaking_events" USING btree ("committee_id");--> statement-breakpoint
CREATE INDEX "speaking_events_member_id_idx" ON "speaking_events" USING btree ("member_id");