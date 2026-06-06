import { z } from "zod";
import {
	assertSameOrigin,
	createPasswordHash,
	createSession,
	generateId,
} from "~~/server/utils/auth";
import { useDatabase } from "~~/server/utils/db";
import { asDatabaseWriteError } from "~~/server/utils/db-errors";
import { assertRateLimit } from "~~/server/utils/rate-limit";
import { users } from "~~/server/utils/schema";
import { parseRequestBody } from "~~/server/utils/validation";

const bodySchema = z.object({
	email: z.string().trim().email(),
	password: z.string().min(8),
	inviteCode: z.string().trim().optional(),
});

function getInviteCodes() {
	const config = useRuntimeConfig();
	const raw =
		config.signupInviteCodes || process.env.NUXT_SIGNUP_INVITE_CODES || "";

	return raw
		.split(",")
		.map((code) => code.trim())
		.filter(Boolean);
}

function isInviteCodeValid(code: string | undefined) {
	const codes = getInviteCodes();
	if (codes.length === 0) {
		return true;
	}
	return typeof code === "string" && codes.includes(code.trim());
}

export default defineEventHandler(async (event) => {
	assertSameOrigin(event);

	const body = await parseRequestBody(event, bodySchema);
	const email = body.email.toLowerCase();
	assertRateLimit(event, {
		name: "auth:signup",
		identifiers: [email],
		limit: 3,
		windowMs: 60 * 60 * 1000,
	});

	if (!isInviteCodeValid(body.inviteCode)) {
		throw createError({
			statusCode: 403,
			statusMessage: "Invalid invite code",
		});
	}

	const db = useDatabase();

	const userId = generateId();
	const passwordHash = await createPasswordHash(body.password);
	const now = new Date();

	try {
		const [user] = await db
			.insert(users)
			.values({
				id: userId,
				email,
				passwordHash,
				createdAt: now,
				updatedAt: now,
			})
			.returning();

		if (!user) {
			throw createError({
				statusCode: 500,
				statusMessage: "Account could not be created",
			});
		}

		await createSession(event, user.id);

		return serializeUser(user);
	} catch (error) {
		console.error("Error creating user:", error);
		throw asDatabaseWriteError(error, "Email already used");
	}
});
