import { createError } from "h3";
import { z } from "zod";
import {
	assertSameOrigin,
	generateId,
	requireCommitteeOwner,
} from "~~/server/utils/auth";
import { useDatabase } from "~~/server/utils/db";
import { requireCommitteeId } from "~~/server/utils/committee-api";
import { serializeSpeakingEvent } from "~~/server/utils/serializers";
import { speakingEvents } from "~~/server/utils/schema";
import { parseRequestBody } from "~~/server/utils/validation";

const bodySchema = z.object({
	memberId: z.string().min(1),
	startTime: z.string().datetime().optional(),
	endTime: z.string().datetime().optional(),
	duration: z.number().int().nonnegative().optional(),
});

export default defineEventHandler(async (event) => {
	assertSameOrigin(event);

	const committeeId = requireCommitteeId(event);

	await requireCommitteeOwner(event, committeeId);
	const body = await parseRequestBody(event, bodySchema);
	const db = useDatabase();
	const now = new Date();
	const startTime = body.startTime ? new Date(body.startTime) : now;
	const endTime = body.endTime ? new Date(body.endTime) : null;
	const duration =
		body.duration ??
		(endTime
			? Math.round((endTime.getTime() - startTime.getTime()) / 1000)
			: null);

	const [speakingEvent] = await db
		.insert(speakingEvents)
		.values({
			id: generateId(),
			committeeId,
			memberId: body.memberId,
			startTime,
			endTime,
			duration: duration && duration > 0 ? duration : null,
			createdAt: now,
		})
		.returning();

	if (!speakingEvent) {
		throw createError({
			statusCode: 500,
			statusMessage: "Speaking event could not be created",
		});
	}

	return serializeSpeakingEvent(speakingEvent);
});
