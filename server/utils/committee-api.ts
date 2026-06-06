import { createError, getRouterParam, type H3Event } from "h3";

export function requireCommitteeId(event: H3Event): string {
	const committeeId = getRouterParam(event, "committeeId");
	if (!committeeId) {
		throw createError({
			statusCode: 400,
			statusMessage: "Missing committee id",
		});
	}
	return committeeId;
}

export function requireCommitteeMemberParams(event: H3Event): {
	committeeId: string;
	memberId: string;
} {
	const committeeId = getRouterParam(event, "committeeId");
	const memberId = getRouterParam(event, "memberId");
	if (!committeeId || !memberId) {
		throw createError({
			statusCode: 400,
			statusMessage: "Missing route params",
		});
	}
	return { committeeId, memberId };
}

export function requireCommitteeMotionParams(event: H3Event): {
	committeeId: string;
	motionId: string;
} {
	const committeeId = getRouterParam(event, "committeeId");
	const motionId = getRouterParam(event, "motionId");
	if (!committeeId || !motionId) {
		throw createError({
			statusCode: 400,
			statusMessage: "Missing route params",
		});
	}
	return { committeeId, motionId };
}
