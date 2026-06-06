import { describe, expect, test } from "bun:test";
import { defaultMotions } from "../../shared/softmun";
import {
	serializeCommittee,
	serializeMember,
	serializeMotion,
	serializeSpeakingEvent,
	serializeUser,
} from "../../server/utils/serializers";

describe("domain constants characterization", () => {
	test("preserves default motions including persisted spelling", () => {
		expect(defaultMotions).toEqual([
			"Adjourn Debate",
			"Suspend Debate",
			"Unmoderated Caucus",
			"Moderated Caucus",
			"Introduce Draft Resolution",
			"Introduce Unfriendly Ammendment",
			"Table Draft Resolution",
			"Move into Direct Voting Procedure on Draft Resolutions",
			"Amend Speaking Time",
		]);
	});
});

describe("serializer characterization", () => {
	const now = new Date("2026-01-02T03:04:05.000Z");

	test("serializes user without sensitive fields", () => {
		const serialized = serializeUser({
			id: "u1",
			email: "a@b.c",
			passwordHash: "secret",
			createdAt: now,
			updatedAt: now,
		});
		expect(serialized).toEqual({
			$id: "u1",
			email: "a@b.c",
			$createdAt: now.toISOString(),
			$updatedAt: now.toISOString(),
		});
	});

	test("serializes committee/member/motion/speaking event public shapes", () => {
		expect(
			serializeMember({
				id: "m1",
				committeeId: "c1",
				ownerId: "u1",
				name: "France",
				voteType: "Standard",
				present: true,
				voting: true,
				createdAt: now,
				updatedAt: now,
			}).$id,
		).toBe("m1");

		const motion = serializeMotion({
			id: "mo1",
			committeeId: "c1",
			proposer: "m1",
			motionType: "Moderated Caucus",
			modTopic: "Topic",
			unmodTotalTime: null,
			modSpeakingTime: 30,
			modTotalTime: 300,
			amendedSpeakingTime: null,
			resolutionName: null,
			createdAt: now,
			updatedAt: now,
		});
		expect(motion.type).toBe("Moderated Caucus");
		expect(motion.time).toBe(300);
		expect(motion.speakers).toBe(10);

		expect(
			serializeSpeakingEvent({
				id: "se1",
				committeeId: "c1",
				memberId: "m1",
				startTime: now,
				endTime: null,
				duration: null,
				createdAt: now,
			}),
		).toEqual({
			$id: "se1",
			committeeId: "c1",
			memberId: "m1",
			startTime: now.toISOString(),
			endTime: null,
			duration: null,
			$createdAt: now.toISOString(),
		});

		expect(
			serializeCommittee(
				{
					id: "c1",
					ownerId: "u1",
					name: "UNSC",
					motionTypes: [],
					gsl: [],
					speakers: [],
					floor: null,
					gslList: [],
					gslFloor: null,
					modList: [],
					modFloor: null,
					modTotalTime: null,
					modSpeakingTime: null,
					modTopic: null,
					unmodTotalTime: null,
					createdAt: now,
					updatedAt: now,
				},
				["m1"],
				["mo1"],
			),
		).toMatchObject({ $id: "c1", members: ["m1"], motions: ["mo1"] });
	});
});
