import { and, eq } from "drizzle-orm";
import { createError } from "h3";
import { z } from "zod";
import { assertSameOrigin, requireCommitteeOwner } from "~~/server/utils/auth";
import { useDatabase } from "~~/server/utils/db";
import { requireCommitteeMemberParams } from "~~/server/utils/committee-api";
import { serializeMember } from "~~/server/utils/serializers";
import { committeeMembers } from "~~/server/utils/schema";
import { parseRequestBody } from "~~/server/utils/validation";

const bodySchema = z
	.object({
		name: z.string().trim().min(1).max(100).optional(),
		voteType: z.enum(["Observer", "Standard", "Veto"]).optional(),
		present: z.boolean().optional(),
		voting: z.boolean().optional(),
	})
	.strict();

export default defineEventHandler(async (event) => {
	assertSameOrigin(event);

	const { committeeId, memberId } = requireCommitteeMemberParams(event);

	await requireCommitteeOwner(event, committeeId);
	const body = await parseRequestBody(event, bodySchema);
	const db = useDatabase();

	if (Object.keys(body).length === 0) {
		const member = await db.query.committeeMembers.findFirst({
			where: and(
				eq(committeeMembers.id, memberId),
				eq(committeeMembers.committeeId, committeeId),
			),
		});

		if (!member) {
			throw createError({ statusCode: 404, statusMessage: "Member not found" });
		}

		return serializeMember(member);
	}

	const [member] = await db
		.update(committeeMembers)
		.set({
			...body,
			updatedAt: new Date(),
		})
		.where(
			and(
				eq(committeeMembers.id, memberId),
				eq(committeeMembers.committeeId, committeeId),
			),
		)
		.returning();

	if (!member) {
		throw createError({ statusCode: 404, statusMessage: "Member not found" });
	}

	return serializeMember(member);
});
