import { sql } from "drizzle-orm";
import {
	boolean,
	integer,
	jsonb,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
	index,
} from "drizzle-orm/pg-core";

export const users = pgTable(
	"users",
	{
		id: text("id").primaryKey(),
		email: text("email").notNull(),
		passwordHash: text("password_hash").notNull(),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
	},
	(table) => [uniqueIndex("users_email_unique").on(table.email)],
);

export const sessions = pgTable(
	"sessions",
	{
		id: text("id").primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		secretHash: text("secret_hash").notNull(),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
		expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
	},
	(table) => [index("sessions_user_id_idx").on(table.userId)],
);

export const committees = pgTable(
	"committees",
	{
		id: text("id").primaryKey(),
		ownerId: text("owner_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		name: text("name").notNull(),
		motionTypes: jsonb("motion_types")
			.$type<string[]>()
			.notNull()
			.default(sql`'[]'::jsonb`),
		gsl: jsonb("gsl")
			.$type<string[]>()
			.notNull()
			.default(sql`'[]'::jsonb`),
		speakers: jsonb("speakers")
			.$type<string[]>()
			.notNull()
			.default(sql`'[]'::jsonb`),
		floor: text("floor"),
		gslList: jsonb("gsl_list")
			.$type<string[]>()
			.notNull()
			.default(sql`'[]'::jsonb`),
		gslFloor: text("gsl_floor"),
		modList: jsonb("mod_list")
			.$type<string[]>()
			.notNull()
			.default(sql`'[]'::jsonb`),
		modFloor: text("mod_floor"),
		modTotalTime: integer("mod_total_time"),
		modSpeakingTime: integer("mod_speaking_time"),
		modTopic: text("mod_topic"),
		unmodTotalTime: integer("unmod_total_time"),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
	},
	(table) => [index("committees_owner_id_idx").on(table.ownerId)],
);

export const committeeMembers = pgTable(
	"committee_members",
	{
		id: text("id").primaryKey(),
		committeeId: text("committee_id")
			.notNull()
			.references(() => committees.id, { onDelete: "cascade" }),
		ownerId: text("owner_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		name: text("name").notNull(),
		voteType: text("vote_type").notNull(),
		present: boolean("present").notNull().default(true),
		voting: boolean("voting").notNull().default(true),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		index("committee_members_committee_id_idx").on(table.committeeId),
	],
);

export const committeeMotions = pgTable(
	"committee_motions",
	{
		id: text("id").primaryKey(),
		committeeId: text("committee_id")
			.notNull()
			.references(() => committees.id, { onDelete: "cascade" }),
		proposer: text("proposer").notNull(),
		motionType: text("motion_type").notNull(),
		modTopic: text("mod_topic"),
		unmodTotalTime: integer("unmod_total_time"),
		modSpeakingTime: integer("mod_speaking_time"),
		modTotalTime: integer("mod_total_time"),
		amendedSpeakingTime: integer("amended_speaking_time"),
		resolutionName: text("resolution_name"),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		index("committee_motions_committee_id_idx").on(table.committeeId),
	],
);

export const speakingEvents = pgTable(
	"speaking_events",
	{
		id: text("id").primaryKey(),
		committeeId: text("committee_id")
			.notNull()
			.references(() => committees.id, { onDelete: "cascade" }),
		memberId: text("member_id")
			.notNull()
			.references(() => committeeMembers.id, { onDelete: "cascade" }),
		startTime: timestamp("start_time", { withTimezone: true }).notNull(),
		endTime: timestamp("end_time", { withTimezone: true }),
		duration: integer("duration"),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		index("speaking_events_committee_id_idx").on(table.committeeId),
		index("speaking_events_member_id_idx").on(table.memberId),
	],
);
