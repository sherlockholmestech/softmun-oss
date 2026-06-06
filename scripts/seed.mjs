import { randomBytes, scrypt as scryptCallback } from "node:crypto";
import { promisify } from "node:util";
import { neon } from "@neondatabase/serverless";
import { assertDatabaseUrl, assertSafeWriteTarget } from "./db-utils.mjs";

const scrypt = promisify(scryptCallback);
const SECURE_ALPHABET = "abcdefghijkmnpqrstuvwxyz23456789";
const PASSWORD_KEY_LENGTH = 64;
const PASSWORD_SCRYPT_N = 16384;
const PASSWORD_SCRYPT_R = 16;
const PASSWORD_SCRYPT_P = 1;
const defaultMotions = [
	"Adjourn Debate",
	"Suspend Debate",
	"Unmoderated Caucus",
	"Moderated Caucus",
	"Introduce Draft Resolution",
	"Introduce Unfriendly Ammendment",
	"Table Draft Resolution",
	"Move into Direct Voting Procedure on Draft Resolutions",
	"Amend Speaking Time",
];

function generateId(size = 24) {
	const bytes = randomBytes(size);
	let value = "";

	for (let index = 0; index < bytes.length; index += 1) {
		value += SECURE_ALPHABET[bytes[index] >> 3];
	}

	return value;
}

async function createPasswordHash(password) {
	const salt = randomBytes(16);
	const derivedKey = await scrypt(password, salt, PASSWORD_KEY_LENGTH, {
		N: PASSWORD_SCRYPT_N,
		r: PASSWORD_SCRYPT_R,
		p: PASSWORD_SCRYPT_P,
	});

	return `scrypt:${PASSWORD_SCRYPT_N}:${PASSWORD_SCRYPT_R}:${PASSWORD_SCRYPT_P}:${salt.toString("base64")}:${Buffer.from(
		derivedKey,
	).toString("base64")}`;
}

function parseSeedMembers() {
	const members = process.env.SEED_MEMBER_NAMES || "";
	return members
		.split(",")
		.map((value) => value.trim())
		.filter(Boolean);
}

async function main() {
	const target = assertSafeWriteTarget("seed");
	const connectionString = assertDatabaseUrl("seed");

	const seedEmail = process.env.SEED_USER_EMAIL || "demo@softmun.local";
	const seedPassword = process.env.SEED_USER_PASSWORD || "changeme123";
	const committeeName =
		process.env.SEED_COMMITTEE_NAME || "Demo Security Council";
	const memberNames = parseSeedMembers();
	const sql = neon(connectionString);

	console.log(`Seeding ${target} database target`);

	const existingUsers = await sql`
		select id from users where email = ${seedEmail.toLowerCase()} limit 1
	`;

	let userId = existingUsers[0]?.id;
	if (!userId) {
		userId = generateId();
		await sql`
			insert into users (id, email, password_hash)
			values (${userId}, ${seedEmail.toLowerCase()}, ${await createPasswordHash(seedPassword)})
		`;
		console.log(`Created seed user ${seedEmail}`);
	} else {
		console.log(`Seed user already exists: ${seedEmail}`);
	}

	const existingCommittees = await sql`
		select id from committees
		where owner_id = ${userId} and name = ${committeeName}
		limit 1
	`;

	let committeeId = existingCommittees[0]?.id;
	if (!committeeId) {
		committeeId = generateId();
		await sql`
			insert into committees (
				id,
				owner_id,
				name,
				motion_types,
				gsl,
				speakers,
				gsl_list,
				mod_list,
				mod_total_time,
				mod_speaking_time,
				mod_topic,
				unmod_total_time
			)
			values (
				${committeeId},
				${userId},
				${committeeName},
				${JSON.stringify(defaultMotions)}::jsonb,
				'[]'::jsonb,
				'[]'::jsonb,
				'[]'::jsonb,
				'[]'::jsonb,
				90,
				90,
				'',
				90
			)
		`;
		console.log(`Created seed committee ${committeeName}`);
	} else {
		console.log(`Seed committee already exists: ${committeeName}`);
	}

	for (const memberName of memberNames) {
		const existingMembers = await sql`
			select id from committee_members
			where committee_id = ${committeeId} and name = ${memberName}
			limit 1
		`;

		if (existingMembers[0]?.id) {
			continue;
		}

		await sql`
			insert into committee_members (
				id,
				committee_id,
				owner_id,
				name,
				vote_type,
				present,
				voting
			)
			values (
				${generateId()},
				${committeeId},
				${userId},
				${memberName},
				${"Standard"},
				${true},
				${true}
			)
		`;
	}

	if (memberNames.length > 0) {
		console.log(`Ensured ${memberNames.length} seed members`);
	}
}

main().catch((error) => {
	console.error(error instanceof Error ? error.message : String(error));
	process.exit(1);
});
