import { eq } from "drizzle-orm";
import { requireCommitteeOwner } from "~~/server/utils/auth";
import { requireCommitteeId } from "~~/server/utils/committee-api";
import { useDatabase } from "~~/server/utils/db";
import { serializeMotion } from "~~/server/utils/serializers";
import { committeeMotions } from "~~/server/utils/schema";

export default defineEventHandler(async (event) => {
	const committeeId = requireCommitteeId(event);

	await requireCommitteeOwner(event, committeeId);
	const db = useDatabase();
	const motions = await db.query.committeeMotions.findMany({
		where: eq(committeeMotions.committeeId, committeeId),
		orderBy: (table, { asc }) => [asc(table.createdAt)],
	});

	return motions.map(serializeMotion);
});
