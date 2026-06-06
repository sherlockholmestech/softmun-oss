import type { SoftmunMember } from "~~/shared/softmun";

type MemberUpdate = Partial<
	Pick<SoftmunMember, "name" | "voteType" | "present" | "voting">
>;

const memberData = ref<SoftmunMember[]>([]);
const memberSaveQueue = new Map<
	string,
	{
		committeeId: string;
		patch: MemberUpdate;
		snapshot: SoftmunMember | undefined;
		version: number;
	}
>();
const memberSaveInFlight = new Set<string>();
const memberVersions = new Map<string, number>();

function sortMembersByName(members: SoftmunMember[]) {
	return [...members].sort((a, b) => a.name.localeCompare(b.name));
}

function replaceMember(memberId: string, member: SoftmunMember) {
	memberData.value = sortMembersByName(
		memberData.value.map((item) => (item.$id === memberId ? member : item)),
	);
}

function applyMemberPatch(memberId: string, patch: MemberUpdate) {
	memberData.value = sortMembersByName(
		memberData.value.map((member) =>
			member.$id === memberId ? { ...member, ...patch } : member,
		),
	);
}

function getMemberVersion(memberId: string) {
	return memberVersions.get(memberId) ?? 0;
}

function bumpMemberVersion(memberId: string) {
	const version = getMemberVersion(memberId) + 1;
	memberVersions.set(memberId, version);
	return version;
}

async function persistQueuedMemberUpdates(memberId: string) {
	if (memberSaveInFlight.has(memberId)) return;

	memberSaveInFlight.add(memberId);
	const toast = useToast();

	while (memberSaveQueue.has(memberId)) {
		const queued = memberSaveQueue.get(memberId)!;
		memberSaveQueue.delete(memberId);

		beginSyncOperation();
		try {
			const updatedMember = await $fetch<SoftmunMember>(
				`/api/committees/${queued.committeeId}/members/${memberId}`,
				{
					method: "PUT",
					body: queued.patch,
				},
			);

			if (
				!memberSaveQueue.has(memberId) &&
				getMemberVersion(memberId) === queued.version
			) {
				replaceMember(memberId, updatedMember);
			}
			completeSyncOperation();
		} catch (error) {
			console.error("Error updating member:", error);
			if (queued.snapshot && getMemberVersion(memberId) === queued.version) {
				replaceMember(memberId, queued.snapshot);
			}
			failSyncOperation();
			toast.add({
				color: "error",
				description: "Error updating member: " + (error as Error).message,
			});
		}
	}

	memberSaveInFlight.delete(memberId);
}

function queueMemberUpdate(
	committeeId: string,
	memberId: string,
	patch: MemberUpdate,
	snapshot: SoftmunMember | undefined,
	version: number,
) {
	const queued = memberSaveQueue.get(memberId);
	memberSaveQueue.set(memberId, {
		committeeId: queued?.committeeId ?? committeeId,
		patch: queued ? { ...queued.patch, ...patch } : patch,
		snapshot: queued?.snapshot ?? snapshot,
		version,
	});
	void persistQueuedMemberUpdates(memberId);
}

export async function getMembers(committeeId: string) {
	if (currentUser.value === null) {
		console.error("User not logged in");
		return;
	}
	if (selectedCommittee.value === null) {
		console.error("No committee selected");
		return;
	}
	if (selectedCommitteeData.value === null) {
		console.error("No committee data available");
		return [];
	}
	try {
		memberData.value = await $fetch<SoftmunMember[]>(
			`/api/committees/${committeeId}/members`,
		);
	} catch (error) {
		console.error("Error fetching members:", error);
	}
}

export async function newMember(
	name: string,
	voteType: string,
	present: boolean,
	voting: boolean,
	_ownerId: string,
	committeeId: string,
) {
	const toast = useToast();
	if (currentUser.value === null) {
		console.error("User not logged in");
		toast.add({ color: "error", description: "User not logged in" });
		return;
	}
	if (selectedCommittee.value === null) {
		console.error("No committee selected");
		toast.add({ color: "error", description: "No committee selected" });
		return;
	}
	try {
		const member = await $fetch<SoftmunMember>(
			`/api/committees/${committeeId}/members`,
			{
				method: "POST",
				body: {
					name: name,
					voteType: voteType,
					present: present,
					voting: voting,
				},
			},
		);
		memberData.value = sortMembersByName([...memberData.value, member]);
		if (selectedCommitteeData.value) {
			selectedCommitteeData.value = {
				...selectedCommitteeData.value,
				members: [...selectedCommitteeData.value.members, member.$id],
			};
		}
		toast.add({
			color: "success",
			description: "Member created successfully",
			duration: 500,
		});
	} catch (error) {
		console.error("Error creating member:", error);
		toast.add({
			color: "error",
			description: "Error creating member: " + getErrorMessage(error),
		});
	}
}

export async function deleteMember(memberId: string) {
	const toast = useToast();
	if (currentUser.value === null) {
		console.error("User not logged in");
		toast.add({ color: "error", description: "User not logged in" });
		return;
	}
	if (selectedCommittee.value === null) {
		console.error("No committee selected");
		toast.add({ color: "error", description: "No committee selected" });
		return;
	}
	try {
		await $fetch(
			`/api/committees/${selectedCommittee.value}/members/${memberId}`,
			{
				method: "DELETE",
			},
		);
		memberData.value = memberData.value.filter(
			(member) => member.$id !== memberId,
		);
		if (selectedCommitteeData.value) {
			selectedCommitteeData.value = {
				...selectedCommitteeData.value,
				members: selectedCommitteeData.value.members.filter(
					(id) => id !== memberId,
				),
				gsl: selectedCommitteeData.value.gsl.filter((id) => id !== memberId),
				speakers: selectedCommitteeData.value.speakers.filter(
					(id) => id !== memberId,
				),
				gslList: selectedCommitteeData.value.gslList.filter(
					(id) => id !== memberId,
				),
				modList: selectedCommitteeData.value.modList.filter(
					(id) => id !== memberId,
				),
				floor:
					selectedCommitteeData.value.floor === memberId
						? null
						: selectedCommitteeData.value.floor,
				gslFloor:
					selectedCommitteeData.value.gslFloor === memberId
						? null
						: selectedCommitteeData.value.gslFloor,
				modFloor:
					selectedCommitteeData.value.modFloor === memberId
						? null
						: selectedCommitteeData.value.modFloor,
			};
		}
		toast.add({
			color: "success",
			description: "Member deleted successfully",
			duration: 500,
		});
	} catch (error) {
		console.error("Error deleting member:", error);
		toast.add({
			color: "error",
			description: "Error deleting member: " + (error as Error).message,
		});
	}
}

export function updateMember(memberId: string, updatedData: MemberUpdate) {
	const toast = useToast();
	if (currentUser.value === null) {
		console.error("User not logged in");
		toast.add({ color: "error", description: "User not logged in" });
		return;
	}
	if (selectedCommittee.value === null) {
		console.error("No committee selected");
		toast.add({ color: "error", description: "No committee selected" });
		return;
	}

	const snapshot = memberData.value.find((member) => member.$id === memberId);
	const version = bumpMemberVersion(memberId);
	applyMemberPatch(memberId, updatedData);
	queueMemberUpdate(
		selectedCommittee.value,
		memberId,
		updatedData,
		snapshot,
		version,
	);
}
export { memberData };
