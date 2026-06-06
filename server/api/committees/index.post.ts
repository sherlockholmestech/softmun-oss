import { createError } from "h3";
import { z } from "zod";
import { defaultMotions } from "~~/shared/softmun";
import {
	assertSameOrigin,
	generateId,
	requireUser,
} from "~~/server/utils/auth";
import { useDatabase } from "~~/server/utils/db";
import { serializeCommittee } from "~~/server/utils/serializers";
import { committees } from "~~/server/utils/schema";
import { parseRequestBody } from "~~/server/utils/validation";

const bodySchema = z.object({
	name: z.string().trim().min(1).max(100),
});

export default defineEventHandler(async (event) => {
	assertSameOrigin(event);

	const body = await parseRequestBody(event, bodySchema);
	const { user } = await requireUser(event);
	const db = useDatabase();
	const now = new Date();

	const [committee] = await db
		.insert(committees)
		.values({
			id: generateId(),
			ownerId: user.id,
			name: body.name,
			motionTypes: defaultMotions,
			gsl: [],
			speakers: [],
			floor: null,
			gslList: [],
			gslFloor: null,
			modList: [],
			modFloor: null,
			modTotalTime: 90,
			modSpeakingTime: 90,
			modTopic: "",
			unmodTotalTime: 90,
			createdAt: now,
			updatedAt: now,
		})
		.returning();

	if (!committee) {
		throw createError({
			statusCode: 500,
			statusMessage: "Committee could not be created",
		});
	}

	return serializeCommittee(committee, [], []);
});
