import type { SoftmunCommittee } from "~~/shared/softmun";

type CommitteeUpdate = Partial<
	Pick<
		SoftmunCommittee,
		| "name"
		| "motionTypes"
		| "gsl"
		| "speakers"
		| "floor"
		| "gslList"
		| "gslFloor"
		| "modList"
		| "modFloor"
		| "modTotalTime"
		| "modSpeakingTime"
		| "modTopic"
		| "unmodTotalTime"
	>
>;

const selectedCommittee = ref<string | null>(null);
const selectedCommitteeData = ref<SoftmunCommittee | null>(null);
const committees = ref<SoftmunCommittee[]>([]);
const committeeSaveQueue = new Map<
	string,
	{
		patch: CommitteeUpdate;
		snapshot: SoftmunCommittee | null;
		version: number;
	}
>();
const committeeSaveInFlight = new Set<string>();
const committeeVersions = new Map<string, number>();

function clearSelectedCommitteeState() {
	selectedCommittee.value = null;
	selectedCommitteeData.value = null;
	memberData.value = [];
	motionData.value = [];
}

function findCommitteeById(committeeId: string) {
	return (
		committees.value.find((committee) => committee.$id === committeeId) || null
	);
}

function getCommitteeVersion(committeeId: string) {
	return committeeVersions.get(committeeId) ?? 0;
}

function bumpCommitteeVersion(committeeId: string) {
	const version = getCommitteeVersion(committeeId) + 1;
	committeeVersions.set(committeeId, version);
	return version;
}

function applyCommitteePatch(committeeId: string, data: CommitteeUpdate) {
	committees.value = committees.value.map((committee) =>
		committee.$id === committeeId ? { ...committee, ...data } : committee,
	);

	if (selectedCommittee.value === committeeId && selectedCommitteeData.value) {
		selectedCommitteeData.value = {
			...selectedCommitteeData.value,
			...data,
		};
	}
}

function replaceCommittee(committeeId: string, committee: SoftmunCommittee) {
	committees.value = committees.value.map((item) =>
		item.$id === committeeId ? committee : item,
	);

	if (selectedCommittee.value === committeeId) {
		selectedCommitteeData.value = committee;
	}
}

function restoreCommittee(
	committeeId: string,
	snapshot: SoftmunCommittee | null,
) {
	if (!snapshot) return;
	replaceCommittee(committeeId, snapshot);
}

async function persistQueuedCommitteeUpdates(committeeId: string) {
	if (committeeSaveInFlight.has(committeeId)) return;

	committeeSaveInFlight.add(committeeId);
	const toast = useToast();

	while (committeeSaveQueue.has(committeeId)) {
		const queued = committeeSaveQueue.get(committeeId)!;
		committeeSaveQueue.delete(committeeId);

		beginSyncOperation();
		try {
			const committee = await $fetch<SoftmunCommittee>(
				`/api/committees/${committeeId}`,
				{
					method: "PUT",
					body: queued.patch,
				},
			);

			if (
				!committeeSaveQueue.has(committeeId) &&
				getCommitteeVersion(committeeId) === queued.version
			) {
				replaceCommittee(committeeId, committee);
			}
			completeSyncOperation();
		} catch (error) {
			console.error("Error updating committee:", error);
			if (getCommitteeVersion(committeeId) === queued.version) {
				restoreCommittee(committeeId, queued.snapshot);
			}
			failSyncOperation();
			toast.add({
				color: "error",
				description: "Error updating committee: " + (error as Error).message,
			});
		}
	}

	committeeSaveInFlight.delete(committeeId);
}

function queueCommitteeUpdate(
	committeeId: string,
	patch: CommitteeUpdate,
	snapshot: SoftmunCommittee | null,
	version: number,
) {
	const queued = committeeSaveQueue.get(committeeId);
	committeeSaveQueue.set(committeeId, {
		patch: queued ? { ...queued.patch, ...patch } : patch,
		snapshot: queued?.snapshot ?? snapshot,
		version,
	});
	void persistQueuedCommitteeUpdates(committeeId);
}

export async function getCommittees() {
	if (currentUser.value === null) {
		committees.value = [];
		selectedCommitteeData.value = null;
		return;
	}
	try {
		committees.value = await $fetch<SoftmunCommittee[]>("/api/committees");

		if (!selectedCommittee.value) {
			selectedCommitteeData.value = null;
			return;
		}

		selectedCommitteeData.value = findCommitteeById(selectedCommittee.value);

		if (!selectedCommitteeData.value) {
			selectedCommittee.value = null;
		}
	} catch (error) {
		console.error("Error fetching committees:", error);
	}
}

export async function selectCommittee(committeeId: string | null | undefined) {
	if (!committeeId) {
		clearSelectedCommitteeState();
		return;
	}

	selectedCommittee.value = committeeId;
	selectedCommitteeData.value = findCommitteeById(committeeId);

	if (!currentUser.value) {
		return;
	}

	if (selectedCommitteeData.value) {
		void getCommittees();
		return;
	}

	await getCommittees();
}

export async function newCommittee(name: string, _ownerId: string) {
	const toast = useToast();
	if (currentUser.value === null) {
		console.error("User not logged in");
		toast.add({ color: "error", description: "User not logged in" });
		return;
	}
	try {
		const committee = await $fetch<SoftmunCommittee>("/api/committees", {
			method: "POST",
			body: { name },
		});
		committees.value = [...committees.value, committee];
		selectedCommittee.value = committee.$id;
		selectedCommitteeData.value = committee;
		memberData.value = [];
		motionData.value = [];
		toast.add({
			color: "success",
			description: "Committee created successfully",
			duration: 500,
		});
	} catch (error) {
		console.error("Error creating committee:", error);
		toast.add({
			color: "error",
			description: "Error creating committee: " + (error as Error).message,
		});
	}
}

export function updateCommittee(committeeId: string, data: CommitteeUpdate) {
	const toast = useToast();
	const payload = Object.fromEntries(
		Object.entries(data).filter(([, value]) => value !== undefined),
	) as CommitteeUpdate;

	if (Object.keys(payload).length === 0) {
		return;
	}

	if (currentUser.value === null) {
		console.error("User not logged in");
		toast.add({ color: "error", description: "User not logged in" });
		return;
	}

	const snapshot =
		selectedCommittee.value === committeeId
			? selectedCommitteeData.value
			: findCommitteeById(committeeId);
	const version = bumpCommitteeVersion(committeeId);

	applyCommitteePatch(committeeId, payload);
	queueCommitteeUpdate(committeeId, payload, snapshot, version);
}

export async function deleteCommittee(committeeId: string) {
	const toast = useToast();
	if (currentUser.value === null) {
		console.error("User not logged in");
		toast.add({ color: "error", description: "User not logged in" });
		return;
	}
	try {
		await $fetch(`/api/committees/${committeeId}`, {
			method: "DELETE",
		});
		committees.value = committees.value.filter(
			(committee) => committee.$id !== committeeId,
		);
		toast.add({
			color: "success",
			description: "Committee deleted successfully",
			duration: 500,
		});
		// If the deleted committee was selected, clear the selection
		if (selectedCommittee.value === committeeId) clearSelectedCommitteeState();
	} catch (error) {
		console.error("Error deleting committee:", error);
		toast.add({
			color: "error",
			description: "Error deleting committee: " + (error as Error).message,
		});
	}
}

export { selectedCommittee, committees, selectedCommitteeData };
