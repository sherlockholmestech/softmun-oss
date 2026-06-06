import { describe, expect, test } from "bun:test";
import {
	formatDurationMinutes,
	formatTimerTime,
	getTimerColor,
	minutesToRoundedSeconds,
	motionEnterUpdateData,
} from "../../app/utils/proceedings";

describe("client proceedings utility compatibility", () => {
	test("timer formatting and thresholds stay stable", () => {
		expect(formatTimerTime(90)).toBe("01:30");
		expect(getTimerColor(31)).toBe("primary");
		expect(getTimerColor(30)).toBe("warning");
		expect(getTimerColor(15)).toBe("error");
	});

	test("minutes to rounded seconds preserves null/default behavior", () => {
		expect(minutesToRoundedSeconds(null)).toBeNull();
		expect(minutesToRoundedSeconds(0)).toBeNull();
		expect(minutesToRoundedSeconds(1.5)).toBe(90);
	});

	test("statistics duration display stays compatible", () => {
		expect(formatDurationMinutes(0)).toBe("—");
		expect(formatDurationMinutes(90)).toBe("1.5 min");
	});

	test("motion-to-caucus enter mapping preserves field semantics", () => {
		expect(
			motionEnterUpdateData({
				motionType: "Moderated Caucus",
				modTopic: "Topic A",
				modSpeakingTime: 60,
				modTotalTime: 300,
			} as never),
		).toEqual({
			modTopic: "Topic A",
			modSpeakingTime: 60,
			modTotalTime: 300,
		});
		expect(
			motionEnterUpdateData({
				motionType: "Unmoderated Caucus",
				unmodTotalTime: 600,
			} as never),
		).toEqual({ unmodTotalTime: 600 });
	});
});
