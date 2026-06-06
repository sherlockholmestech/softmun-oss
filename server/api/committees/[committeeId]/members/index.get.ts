import { eq } from "drizzle-orm";
import { requireCommitteeOwner } from "~~/server/utils/auth";
import { requireCommitteeId } from "~~/server/utils/committee-api";
import { useDatabase } from "~~/server/utils/db";
import { serializeMember } from "~~/server/utils/serializers";
import { committeeMembers } from "~~/server/utils/schema";

export default defineEventHandler(async (event) => {
	const committeeId = requireCommitteeId(event);

	await requireCommitteeOwner(event, committeeId);
	const db = useDatabase();
	const members = await db.query.committeeMembers.findMany({
		where: eq(committeeMembers.committeeId, committeeId),
		orderBy: (table, { asc }) => [asc(table.name)],
	});

	return members.map(serializeMember);
});
