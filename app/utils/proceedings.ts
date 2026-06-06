import type { SoftmunMotion } from "~~/shared/softmun";

export function getTimerColor(timeLeft: number) {
	if (timeLeft <= 15) return "error" as const;
	if (timeLeft <= 30) return "warning" as const;
	return "primary" as const;
}

export function formatTimerTime(seconds: number) {
	const mins = Math.floor(seconds / 60);
	const secs = seconds % 60;
	return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export function minutesToRoundedSeconds(minutesInput: number | null) {
	if (minutesInput == null || minutesInput <= 0) return null;
	return Math.round(minutesInput * 60);
}

export function formatDurationMinutes(totalSeconds: number): string {
	if (totalSeconds <= 0) return "—";
	return `${(totalSeconds / 60).toFixed(1)} min`;
}

export function motionEnterUpdateData(motion: SoftmunMotion) {
	if (motion.motionType === "Moderated Caucus") {
		return {
			modTopic: motion.modTopic ?? "",
			modTotalTime: motion.modTotalTime ?? undefined,
			modSpeakingTime: motion.modSpeakingTime ?? undefined,
		};
	}
	if (motion.motionType === "Unmoderated Caucus") {
		return {
			unmodTotalTime: motion.unmodTotalTime ?? undefined,
		};
	}
	if (motion.motionType === "Amend Speaking Time") {
		return {
			modSpeakingTime: motion.amendedSpeakingTime ?? undefined,
		};
	}
	return {};
}
