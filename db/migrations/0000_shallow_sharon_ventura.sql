CREATE TABLE "committee_members" (
	"id" text PRIMARY KEY NOT NULL,
	"committee_id" text NOT NULL,
	"owner_id" text NOT NULL,
	"name" text NOT NULL,
	"vote_type" text NOT NULL,
	"present" boolean DEFAULT true NOT NULL,
	"voting" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "committee_motions" (
	"id" text PRIMARY KEY NOT NULL,
	"committee_id" text NOT NULL,
	"proposer" text NOT NULL,
	"motion_type" text NOT NULL,
	"unmod_total_time" integer,
	"mod_speaking_time" integer,
	"mod_total_time" integer,
	"amended_speaking_time" integer,
	"resolution_name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "committees" (
	"id" text PRIMARY KEY NOT NULL,
	"owner_id" text NOT NULL,
	"name" text NOT NULL,
	"motion_types" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"gsl" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"speakers" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"floor" text,
	"gsl_list" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"gsl_floor" text,
	"mod_list" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"mod_floor" text,
	"mod_total_time" integer,
	"mod_speaking_time" integer,
	"mod_topic" text,
	"unmod_total_time" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"secret_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "committee_members" ADD CONSTRAINT "committee_members_committee_id_committees_id_fk" FOREIGN KEY ("committee_id") REFERENCES "public"."committees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "committee_members" ADD CONSTRAINT "committee_members_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "committee_motions" ADD CONSTRAINT "committee_motions_committee_id_committees_id_fk" FOREIGN KEY ("committee_id") REFERENCES "public"."committees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "committees" ADD CONSTRAINT "committees_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "committee_members_committee_id_idx" ON "committee_members" USING btree ("committee_id");--> statement-breakpoint
CREATE INDEX "committee_motions_committee_id_idx" ON "committee_motions" USING btree ("committee_id");--> statement-breakpoint
CREATE INDEX "committees_owner_id_idx" ON "committees" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "sessions_user_id_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" USING btree ("email");