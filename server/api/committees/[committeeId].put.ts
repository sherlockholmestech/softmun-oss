import { eq } from "drizzle-orm";
import { createError, getRouterParam } from "h3";
import { z } from "zod";
import { assertSameOrigin, requireCommitteeOwner } from "~~/server/utils/auth";
import { useDatabase } from "~~/server/utils/db";
import { serializeCommittee } from "~~/server/utils/serializers";
import {
	committees,
	committeeMembers,
	committeeMotions,
} from "~~/server/utils/schema";
import { parseRequestBody } from "~~/server/utils/validation";

const bodySchema = z
	.object({
		name: z.string().trim().min(1).max(100).optional(),
		motionTypes: z.array(z.string().trim().min(1)).optional(),
		gsl: z.array(z.string()).optional(),
		speakers: z.array(z.string()).optional(),
		floor: z.string().nullable().optional(),
		gslList: z.array(z.string()).optional(),
		gslFloor: z.string().nullable().optional(),
		modList: z.array(z.string()).optional(),
		modFloor: z.string().nullable().optional(),
		modTotalTime: z.number().int().nonnegative().nullable().optional(),
		modSpeakingTime: z.number().int().nonnegative().nullable().optional(),
		modTopic: z.string().nullable().optional(),
		unmodTotalTime: z.number().int().nonnegative().nullable().optional(),
	})
	.strict();

export default defineEventHandler(async (event) => {
	assertSameOrigin(event);

	const committeeId = getRouterParam(event, "committeeId");
	if (!committeeId) {
		throw createError({
			statusCode: 400,
			statusMessage: "Missing committee id",
		});
	}

	const { committee } = await requireCommitteeOwner(event, committeeId);
	const body = await parseRequestBody(event, bodySchema);
	const db = useDatabase();

	if (Object.keys(body).length === 0) {
		const members = await db.query.committeeMembers.findMany({
			where: eq(committeeMembers.committeeId, committee.id),
		});
		const motions = await db.query.committeeMotions.findMany({
			where: eq(committeeMotions.committeeId, committee.id),
		});

		return serializeCommittee(
			committee,
			members.map((member) => member.id),
			motions.map((motion) => motion.id),
		);
	}

	const [updatedCommittee] = await db
		.update(committees)
		.set({
			...body,
			updatedAt: new Date(),
		})
		.where(eq(committees.id, committee.id))
		.returning();

	const members = await db.query.committeeMembers.findMany({
		where: eq(committeeMembers.committeeId, committee.id),
	});
	const motions = await db.query.committeeMotions.findMany({
		where: eq(committeeMotions.committeeId, committee.id),
	});

	return serializeCommittee(
		updatedCommittee,
		members.map((member) => member.id),
		motions.map((motion) => motion.id),
	);
});
