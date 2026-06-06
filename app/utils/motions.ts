import type { SoftmunMotion } from "~~/shared/softmun";
export { defaultMotions } from "~~/shared/softmun";

type MotionInput = Record<string, string | number | null>;

// Motion precedence mapping based on order of disruptiveness (lower number = more disruptive)
export const motionPrecedence: Record<string, number> = {
	"Point of Personal Privilege": 1,
	"Point of Order": 2,
	"Point of Parliamentary Inquiry": 3,
	"Right to Reply": 4,
	"Adjourn Debate": 5,
	"Suspend Debate": 5, // Same as Adjourn Debate
	"Unmoderated Caucus": 6,
	"Moderated Caucus": 7,
	"Introduce Draft Resolution": 8,
	"Introduce Unfriendly Ammendment": 9,
	"Table Draft Resolution": 10,
	"Move into Direct Voting Procedure on Draft Resolutions": 11,
	"Amend Speaking Time": 12,
};

export const motionData = ref<SoftmunMotion[]>([]);

/**
 * Sorts motions by order of disruptiveness according to parliamentary procedure rules:
 * 1. Most disruptive motions come first (based on precedence)
 * 2. For same motion type: longer time is more disruptive
 * 3. For same motion type and time: more speakers is more disruptive
 */
export function sortMotionsByDisruptiveness(
	motions: SoftmunMotion[],
): SoftmunMotion[] {
	return [...motions].sort((a, b) => {
		const typeA = a.motionType ?? a.type;
		const typeB = b.motionType ?? b.type;
		const precedenceA = motionPrecedence[typeA] ?? 999;
		const precedenceB = motionPrecedence[typeB] ?? 999;

		// First, sort by precedence (lower number = more disruptive = comes first)
		if (precedenceA !== precedenceB) {
			return precedenceA - precedenceB;
		}

		// For same motion type, compare total time (higher time = more disruptive)
		const timeA =
			a.time ??
			a.modTotalTime ??
			a.unmodTotalTime ??
			a.amendedSpeakingTime ??
			0;
		const timeB =
			b.time ??
			b.modTotalTime ??
			b.unmodTotalTime ??
			b.amendedSpeakingTime ??
			0;
		if (timeA !== timeB) {
			return timeB - timeA; // Reverse order: higher time comes first
		}

		// For same time, compare number of speakers (higher speakers = more disruptive)
		const speakersA = a.speakers ?? 0;
		const speakersB = b.speakers ?? 0;
		if (speakersA !== speakersB) {
			return speakersB - speakersA; // Reverse order: more speakers comes first
		}

		// Older motions stay ahead when all other ordering fields match.
		return new Date(a.$createdAt).getTime() - new Date(b.$createdAt).getTime();
	});
}

export async function getMotions() {
	if (selectedCommittee.value != null) {
		try {
			motionData.value = await $fetch<SoftmunMotion[]>(
				`/api/committees/${selectedCommittee.value}/motions`,
			);
		} catch (error) {
			console.error("Error fetching motions:", error);
			motionData.value = [];
		}
	} else {
		motionData.value = [];
	}
}

export async function addMotion(data: MotionInput) {
	const toast = useToast();
	if (selectedCommittee.value === null) {
		console.error("No committee selected");
		toast.add({ color: "error", description: "No committee selected" });
		return;
	}
	try {
		const motion = await $fetch<SoftmunMotion>(
			`/api/committees/${selectedCommittee.value}/motions`,
			{
				method: "POST",
				body: data,
			},
		);
		motionData.value = [...motionData.value, motion];
		if (selectedCommitteeData.value) {
			selectedCommitteeData.value = {
				...selectedCommitteeData.value,
				motions: [...selectedCommitteeData.value.motions, motion.$id],
			};
		}
		toast.add({
			duration: 500,
			color: "success",
			description: "Motion added successfully",
		});
	} catch (error) {
		console.error("Error adding motion:", error);
		toast.add({
			color: "error",
			description: "Error adding motion: " + (error as Error).message,
		});
	}
}

export async function deleteMotion(motionId: string) {
	const toast = useToast();
	if (selectedCommittee.value === null) {
		console.error("No committee selected");
		toast.add({ color: "error", description: "No committee selected" });
		return;
	}
	try {
		await $fetch(
			`/api/committees/${selectedCommittee.value}/motions/${motionId}`,
			{
				method: "DELETE",
			},
		);
		motionData.value = motionData.value.filter(
			(motion) => motion.$id !== motionId,
		);
		if (selectedCommitteeData.value) {
			selectedCommitteeData.value = {
				...selectedCommitteeData.value,
				motions: selectedCommitteeData.value.motions.filter(
					(id) => id !== motionId,
				),
			};
		}
		toast.add({
			duration: 500,
			color: "success",
			description: "Motion deleted successfully",
		});
	} catch (error) {
		console.error("Error deleting motion:", error);
		toast.add({
			color: "error",
			description: "Error deleting motion: " + (error as Error).message,
		});
	}
}
