import { eq } from "drizzle-orm";
import { createError } from "h3";
import { z } from "zod";
import {
	assertSameOrigin,
	deleteAllUserSessions,
	requireUser,
	verifyPassword,
} from "~~/server/utils/auth";
import { useDatabase } from "~~/server/utils/db";
import { assertRateLimit } from "~~/server/utils/rate-limit";
import { users } from "~~/server/utils/schema";
import { parseRequestBody } from "~~/server/utils/validation";

const bodySchema = z.object({
	password: z.string().min(8),
});

export default defineEventHandler(async (event) => {
	assertSameOrigin(event);

	const body = await parseRequestBody(event, bodySchema);
	const { user } = await requireUser(event);
	assertRateLimit(event, {
		name: "auth:account-delete",
		identifiers: [user.id],
		limit: 5,
		windowMs: 60 * 60 * 1000,
	});

	if (!(await verifyPassword(body.password, user.passwordHash))) {
		throw createError({
			statusCode: 401,
			statusMessage: "Invalid password",
		});
	}

	const db = useDatabase();
	await db.delete(users).where(eq(users.id, user.id));
	await deleteAllUserSessions(event, user.id);

	return { success: true };
});
