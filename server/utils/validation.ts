import { createError, readBody, type H3Event } from "h3";
import type { z } from "zod";

export async function parseRequestBody<T extends z.ZodType>(
	event: H3Event,
	schema: T,
): Promise<z.output<T>> {
	const result = schema.safeParse(await readBody(event));

	if (!result.success) {
		throw createError({
			statusCode: 400,
			statusMessage: result.error.issues[0]?.message || "Invalid request body",
		});
	}

	return result.data;
}
