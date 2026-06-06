import type {
	SoftmunCommittee,
	SoftmunMember,
	SoftmunMotion,
	SoftmunSpeakingEvent,
	SoftmunUser,
} from "~~/shared/softmun";
import type {
	committees,
	committeeMembers,
	committeeMotions,
	speakingEvents,
	users,
} from "./schema";

type CommitteeRow = typeof committees.$inferSelect;
type MemberRow = typeof committeeMembers.$inferSelect;
type MotionRow = typeof committeeMotions.$inferSelect;
type SpeakingEventRow = typeof speakingEvents.$inferSelect;
type UserRow = typeof users.$inferSelect;

export function serializeUser(user: UserRow): SoftmunUser {
	return {
		$id: user.id,
		email: user.email,
		$createdAt: user.createdAt.toISOString(),
		$updatedAt: user.updatedAt.toISOString(),
	};
}

export function serializeMember(member: MemberRow): SoftmunMember {
	return {
		$id: member.id,
		committeeId: member.committeeId,
		ownerId: member.ownerId,
		name: member.name,
		voteType: member.voteType as SoftmunMember["voteType"],
		present: member.present,
		voting: member.voting,
		$createdAt: member.createdAt.toISOString(),
		$updatedAt: member.updatedAt.toISOString(),
	};
}

export function serializeMotion(motion: MotionRow): SoftmunMotion {
	const time =
		motion.modTotalTime ??
		motion.unmodTotalTime ??
		motion.amendedSpeakingTime ??
		0;
	const speakers =
		motion.motionType === "Moderated Caucus" &&
		motion.modTotalTime &&
		motion.modSpeakingTime &&
		motion.modSpeakingTime > 0
			? Math.floor(motion.modTotalTime / motion.modSpeakingTime)
			: 0;

	return {
		$id: motion.id,
		committeeId: motion.committeeId,
		proposer: motion.proposer,
		motionType: motion.motionType,
		type: motion.motionType,
		time,
		speakers,
		modTopic: motion.modTopic ?? null,
		unmodTotalTime: motion.unmodTotalTime,
		modSpeakingTime: motion.modSpeakingTime,
		modTotalTime: motion.modTotalTime,
		amendedSpeakingTime: motion.amendedSpeakingTime,
		resolutionName: motion.resolutionName,
		$createdAt: motion.createdAt.toISOString(),
		$updatedAt: motion.updatedAt.toISOString(),
	};
}

export function serializeSpeakingEvent(
	event: SpeakingEventRow,
): SoftmunSpeakingEvent {
	return {
		$id: event.id,
		committeeId: event.committeeId,
		memberId: event.memberId,
		startTime: event.startTime.toISOString(),
		endTime: event.endTime?.toISOString() ?? null,
		duration: event.duration,
		$createdAt: event.createdAt.toISOString(),
	};
}

export function serializeCommittee(
	committee: CommitteeRow,
	members: string[],
	motions: string[],
): SoftmunCommittee {
	return {
		$id: committee.id,
		name: committee.name,
		ownerId: committee.ownerId,
		motionTypes: committee.motionTypes,
		members,
		motions,
		gsl: committee.gsl,
		speakers: committee.speakers,
		floor: committee.floor,
		gslList: committee.gslList,
		gslFloor: committee.gslFloor,
		modList: committee.modList,
		modFloor: committee.modFloor,
		modTotalTime: committee.modTotalTime,
		modSpeakingTime: committee.modSpeakingTime,
		modTopic: committee.modTopic,
		unmodTotalTime: committee.unmodTotalTime,
		$createdAt: committee.createdAt.toISOString(),
		$updatedAt: committee.updatedAt.toISOString(),
	};
}
