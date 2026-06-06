import { eq, inArray } from "drizzle-orm";
import { requireUser } from "~~/server/utils/auth";
import { useDatabase } from "~~/server/utils/db";
import { serializeCommittee } from "~~/server/utils/serializers";
import {
	committees,
	committeeMembers,
	committeeMotions,
} from "~~/server/utils/schema";

export default defineEventHandler(async (event) => {
	const { user } = await requireUser(event);
	const db = useDatabase();
	const ownedCommittees = await db.query.committees.findMany({
		where: eq(committees.ownerId, user.id),
		orderBy: (table, { asc }) => [asc(table.createdAt)],
	});

	if (ownedCommittees.length === 0) {
		return [];
	}

	const committeeIds = ownedCommittees.map((committee) => committee.id);
	const [members, motions] = await Promise.all([
		db.query.committeeMembers.findMany({
			where: inArray(committeeMembers.committeeId, committeeIds),
		}),
		db.query.committeeMotions.findMany({
			where: inArray(committeeMotions.committeeId, committeeIds),
		}),
	]);

	const membersByCommittee = new Map<string, string[]>();
	const motionsByCommittee = new Map<string, string[]>();

	for (const member of members) {
		const ids = membersByCommittee.get(member.committeeId) || [];
		ids.push(member.id);
		membersByCommittee.set(member.committeeId, ids);
	}

	for (const motion of motions) {
		const ids = motionsByCommittee.get(motion.committeeId) || [];
		ids.push(motion.id);
		motionsByCommittee.set(motion.committeeId, ids);
	}

	return ownedCommittees.map((committee) =>
		serializeCommittee(
			committee,
			membersByCommittee.get(committee.id) || [],
			motionsByCommittee.get(committee.id) || [],
		),
	);
});
