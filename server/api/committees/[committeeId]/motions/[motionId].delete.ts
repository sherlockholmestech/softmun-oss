import { and, eq } from "drizzle-orm";
import { createError } from "h3";
import { assertSameOrigin, requireCommitteeOwner } from "~~/server/utils/auth";
import { requireCommitteeMotionParams } from "~~/server/utils/committee-api";
import { useDatabase } from "~~/server/utils/db";
import { committeeMotions } from "~~/server/utils/schema";

export default defineEventHandler(async (event) => {
	assertSameOrigin(event);

	const { committeeId, motionId } = requireCommitteeMotionParams(event);

	await requireCommitteeOwner(event, committeeId);
	const db = useDatabase();

	const deletedMotions = await db
		.delete(committeeMotions)
		.where(
			and(
				eq(committeeMotions.id, motionId),
				eq(committeeMotions.committeeId, committeeId),
			),
		)
		.returning();

	if (deletedMotions.length === 0) {
		throw createError({ statusCode: 404, statusMessage: "Motion not found" });
	}

	return { success: true };
});
