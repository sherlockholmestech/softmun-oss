import { eq } from "drizzle-orm";
import type { CommitteeStatistics } from "~~/shared/softmun";
import { getRouterParam } from "h3";
import { requireCommitteeOwner } from "~~/server/utils/auth";
import { useDatabase } from "~~/server/utils/db";
import {
	committeeMembers,
	committeeMotions,
	speakingEvents,
	committees,
} from "~~/server/utils/schema";

export default defineEventHandler(
	async (event): Promise<CommitteeStatistics> => {
		const committeeId = getRouterParam(event, "committeeId");
		if (!committeeId) {
			return { committeeId: "", committeeName: "", delegates: [] };
		}

		await requireCommitteeOwner(event, committeeId);
		const db = useDatabase();

		const committee = await db.query.committees.findFirst({
			where: eq(committees.id, committeeId),
		});
		const events = await db.query.speakingEvents.findMany({
			where: eq(speakingEvents.committeeId, committeeId),
		});
		const motions = await db.query.committeeMotions.findMany({
			where: eq(committeeMotions.committeeId, committeeId),
		});
		const members = await db.query.committeeMembers.findMany({
			where: eq(committeeMembers.committeeId, committeeId),
		});

		const memberMap = new Map(members.map((m) => [m.id, m.name]));

		const delegateMap = new Map<
			string,
			{ totalTime: number; turns: number; motions: number }
		>();

		for (const member of members) {
			delegateMap.set(member.id, { totalTime: 0, turns: 0, motions: 0 });
		}

		for (const ev of events) {
			const stats = delegateMap.get(ev.memberId);
			if (stats) {
				stats.turns++;
				stats.totalTime += ev.duration ?? 0;
			}
		}

		for (const motion of motions) {
			const stats = delegateMap.get(motion.proposer);
			if (stats) {
				stats.motions++;
			}
		}

		const delegates = [...delegateMap.entries()]
			.map(([memberId, stats]) => ({
				memberId,
				memberName: memberMap.get(memberId) ?? "Unknown",
				totalSpeakingTimeSeconds: stats.totalTime,
				speakingTurns: stats.turns,
				motionsProposed: stats.motions,
			}))
			.sort((a, b) => b.totalSpeakingTimeSeconds - a.totalSpeakingTimeSeconds);

		return {
			committeeId,
			committeeName: committee?.name ?? "",
			delegates,
		};
	},
);
