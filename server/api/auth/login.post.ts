import { eq } from "drizzle-orm";
import { createError } from "h3";
import { z } from "zod";
import {
	assertSameOrigin,
	createSession,
	verifyPassword,
} from "~~/server/utils/auth";
import { useDatabase } from "~~/server/utils/db";
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
	const email = body.email.toLowerCase();
	assertRateLimit(event, {
		name: "auth:login",
		identifiers: [email],
		limit: 5,
		windowMs: 15 * 60 * 1000,
	});

	const db = useDatabase();
	const user = await db.query.users.findFirst({
		where: eq(users.email, email),
	});

	if (!user || !(await verifyPassword(body.password, user.passwordHash))) {
		throw createError({
			statusCode: 401,
			statusMessage: "Invalid email or password",
		});
	}

	await createSession(event, user.id);

	return serializeUser(user);
});
