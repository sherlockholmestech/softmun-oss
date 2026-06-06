import { eq } from "drizzle-orm";
import { getRouterParam } from "h3";
import { requireCommitteeOwner } from "~~/server/utils/auth";
import { useDatabase } from "~~/server/utils/db";
import { serializeSpeakingEvent } from "~~/server/utils/serializers";
import { speakingEvents } from "~~/server/utils/schema";

export default defineEventHandler(async (event) => {
	const committeeId = getRouterParam(event, "committeeId");
	if (!committeeId) {
		return [];
	}

	await requireCommitteeOwner(event, committeeId);
	const db = useDatabase();
	const events = await db.query.speakingEvents.findMany({
		where: eq(speakingEvents.committeeId, committeeId),
		orderBy: (table, { desc }) => [desc(table.startTime)],
	});

	return events.map(serializeSpeakingEvent);
});
