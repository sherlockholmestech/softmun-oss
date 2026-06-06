import { createError } from "h3";
import { z } from "zod";
import {
	assertSameOrigin,
	generateId,
	requireCommitteeOwner,
} from "~~/server/utils/auth";
import { useDatabase } from "~~/server/utils/db";
import { requireCommitteeId } from "~~/server/utils/committee-api";
import { serializeMember } from "~~/server/utils/serializers";
import { committeeMembers } from "~~/server/utils/schema";
import { parseRequestBody } from "~~/server/utils/validation";

const bodySchema = z.object({
	name: z.string().trim().min(1).max(100),
	voteType: z.enum(["Observer", "Standard", "Veto"]),
	present: z.boolean(),
	voting: z.boolean(),
});

export default defineEventHandler(async (event) => {
	assertSameOrigin(event);

	const committeeId = requireCommitteeId(event);

	const { user } = await requireCommitteeOwner(event, committeeId);
	const body = await parseRequestBody(event, bodySchema);
	const db = useDatabase();
	const now = new Date();

	const [member] = await db
		.insert(committeeMembers)
		.values({
			id: generateId(),
			committeeId,
			ownerId: user.id,
			name: body.name,
			voteType: body.voteType,
			present: body.present,
			voting: body.voting,
			createdAt: now,
			updatedAt: now,
		})
		.returning();

	if (!member) {
		throw createError({
			statusCode: 500,
			statusMessage: "Member could not be created",
		});
	}

	return serializeMember(member);
});
