import { createError } from "h3";
import { z } from "zod";
import {
	assertSameOrigin,
	generateId,
	requireCommitteeOwner,
} from "~~/server/utils/auth";
import { useDatabase } from "~~/server/utils/db";
import { requireCommitteeId } from "~~/server/utils/committee-api";
import { serializeMotion } from "~~/server/utils/serializers";
import { committeeMotions } from "~~/server/utils/schema";
import { parseRequestBody } from "~~/server/utils/validation";

const bodySchema = z.object({
	proposer: z.string().trim().min(1),
	motionType: z.string().trim().min(1),
	modTopic: z.string().trim().optional().nullable(),
	unmodTotalTime: z.coerce.number().int().nonnegative().optional().nullable(),
	modSpeakingTime: z.coerce.number().int().nonnegative().optional().nullable(),
	modTotalTime: z.coerce.number().int().nonnegative().optional().nullable(),
	amendedSpeakingTime: z.coerce
		.number()
		.int()
		.nonnegative()
		.optional()
		.nullable(),
	resolutionName: z.string().trim().optional().nullable(),
	draftReso: z.string().trim().optional().nullable(),
});

export default defineEventHandler(async (event) => {
	assertSameOrigin(event);

	const committeeId = requireCommitteeId(event);

	await requireCommitteeOwner(event, committeeId);
	const body = await parseRequestBody(event, bodySchema);
	const db = useDatabase();
	const now = new Date();

	const [motion] = await db
		.insert(committeeMotions)
		.values({
			id: generateId(),
			committeeId,
			proposer: body.proposer,
			motionType: body.motionType,
			modTopic: body.modTopic ?? null,
			unmodTotalTime: body.unmodTotalTime ?? null,
			modSpeakingTime: body.modSpeakingTime ?? null,
			modTotalTime: body.modTotalTime ?? null,
			amendedSpeakingTime: body.amendedSpeakingTime ?? null,
			resolutionName: body.resolutionName ?? body.draftReso ?? null,
			createdAt: now,
			updatedAt: now,
		})
		.returning();

	if (!motion) {
		throw createError({
			statusCode: 500,
			statusMessage: "Motion could not be created",
		});
	}

	return serializeMotion(motion);
});
