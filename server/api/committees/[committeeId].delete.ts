import { createError, getRouterParam } from "h3";
import {
	assertSameOrigin,
	deleteCommitteeGraph,
	requireCommitteeOwner,
} from "~~/server/utils/auth";

export default defineEventHandler(async (event) => {
	assertSameOrigin(event);

	const committeeId = getRouterParam(event, "committeeId");
	if (!committeeId) {
		throw createError({
			statusCode: 400,
			statusMessage: "Missing committee id",
		});
	}

	await requireCommitteeOwner(event, committeeId);
	await deleteCommitteeGraph(committeeId);

	return { success: true };
});
