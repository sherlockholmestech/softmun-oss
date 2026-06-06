import { and, eq } from "drizzle-orm";
import { createError } from "h3";
import { assertSameOrigin, requireCommitteeOwner } from "~~/server/utils/auth";
import { requireCommitteeMemberParams } from "~~/server/utils/committee-api";
import { useDatabase } from "~~/server/utils/db";
import {
	committees,
	committeeMembers,
	speakingEvents,
} from "~~/server/utils/schema";

export default defineEventHandler(async (event) => {
	assertSameOrigin(event);

	const { committeeId, memberId } = requireCommitteeMemberParams(event);

	const { committee } = await requireCommitteeOwner(event, committeeId);
	const db = useDatabase();

	const member = await db.query.committeeMembers.findFirst({
		where: and(
			eq(committeeMembers.id, memberId),
			eq(committeeMembers.committeeId, committeeId),
		),
	});

	if (!member) {
		throw createError({ statusCode: 404, statusMessage: "Member not found" });
	}

	await db
		.update(committees)
		.set({
			gsl: committee.gsl.filter((id) => id !== memberId),
			speakers: committee.speakers.filter((id) => id !== memberId),
			gslList: committee.gslList.filter((id) => id !== memberId),
			modList: committee.modList.filter((id) => id !== memberId),
			floor: committee.floor === memberId ? null : committee.floor,
			gslFloor: committee.gslFloor === memberId ? null : committee.gslFloor,
			modFloor: committee.modFloor === memberId ? null : committee.modFloor,
			updatedAt: new Date(),
		})
		.where(eq(committees.id, committeeId));

	await db
		.delete(speakingEvents)
		.where(
			and(
				eq(speakingEvents.memberId, memberId),
				eq(speakingEvents.committeeId, committeeId),
			),
		);

	await db
		.delete(committeeMembers)
		.where(
			and(
				eq(committeeMembers.id, memberId),
				eq(committeeMembers.committeeId, committeeId),
			),
		)
		.returning();

	return { success: true };
});
