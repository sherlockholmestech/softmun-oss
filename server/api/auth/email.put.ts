import { eq } from "drizzle-orm";
import { createError } from "h3";
import { z } from "zod";
import {
	assertSameOrigin,
	requireUser,
	verifyPassword,
} from "~~/server/utils/auth";
import { useDatabase } from "~~/server/utils/db";
import { asDatabaseWriteError } from "~~/server/utils/db-errors";
import { assertRateLimit } from "~~/server/utils/rate-limit";
import { serializeUser } from "~~/server/utils/serializers";
import { users } from "~~/server/utils/schema";
import { parseRequestBody } from "~~/server/utils/validation";

const bodySchema = z.object({
	email: z.string().trim().email(),
	password: z.string().min(8),
});

export default defineEventHandler(async (event) => {
	assertSameOrigin(event);

	const body = await parseRequestBody(event, bodySchema);
	const { user } = await requireUser(event);
	assertRateLimit(event, {
		name: "auth:email-update",
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

	try {
		const db = useDatabase();
		const [updatedUser] = await db
			.update(users)
			.set({
				email: body.email.toLowerCase(),
				updatedAt: new Date(),
			})
			.where(eq(users.id, user.id))
			.returning();

		return serializeUser(updatedUser);
	} catch (error) {
		console.error("Error updating email:", error);
		throw asDatabaseWriteError(error, "Email already used");
	}
});
