const speakerStartTimes = new Map<string, string>();

export function trackSpeakerStart(memberId: string) {
	speakerStartTimes.set(memberId, new Date().toISOString());
}

export function clearSpeakerTrack(memberId: string) {
	speakerStartTimes.delete(memberId);
}

export function getSpeakerStartTime(memberId: string): string | undefined {
	return speakerStartTimes.get(memberId);
}

export async function logSpeakingStart(memberId: string) {
	if (!selectedCommittee.value) return;
	trackSpeakerStart(memberId);
	try {
		await $fetch(`/api/committees/${selectedCommittee.value}/speaking-events`, {
			method: "POST",
			body: { memberId },
		});
	} catch (error) {
		console.error("Error logging speaking start:", error);
	}
}

export async function logSpeakingEnd(memberId: string) {
	if (!selectedCommittee.value) return;
	const startTime = getSpeakerStartTime(memberId);
	clearSpeakerTrack(memberId);
	try {
		await $fetch(`/api/committees/${selectedCommittee.value}/speaking-events`, {
			method: "POST",
			body: {
				memberId,
				startTime,
				endTime: new Date().toISOString(),
			},
		});
	} catch (error) {
		console.error("Error logging speaking end:", error);
	}
}
