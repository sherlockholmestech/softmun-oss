export async function addMemberToGsl(memberId: string) {
	const toast = useToast();
	if (!currentUser.value) {
		console.error("User not logged in");
		return;
	}
	try {
		const gsl = [...selectedCommitteeData.value.gsl, memberId];
		await updateCommittee(selectedCommittee.value!, {
			gsl,
		});
		toast.add({
			color: "success",
			description: "Member added to GSL successfully",
			duration: 500,
		});
	} catch (error) {
		console.error("Error adding member to GSL:", error);
		toast.add({
			color: "error",
			description: "Error adding member to GSL: " + (error as Error).message,
		});
	}
}

export async function removeMemberFromGsl(memberId: string) {
	const toast = useToast();
	if (!currentUser.value) {
		console.error("User not logged in");
		return;
	}
	try {
		const gsl = selectedCommitteeData.value.gsl.filter(
			(id: string) => id !== memberId,
		);
		await updateCommittee(selectedCommittee.value!, {
			gsl,
		});
		toast.add({
			color: "success",
			description: "Member removed from GSL successfully",
			duration: 500,
		});
	} catch (error) {
		console.error("Error removing member from GSL:", error);
		toast.add({
			color: "error",
			description:
				"Error removing member from GSL: " + (error as Error).message,
		});
	}
}

export async function moveNextSpeakerToFloor() {
	const toast = useToast();
	if (!currentUser.value) {
		console.error("User not logged in");
		return;
	}
	try {
		if (selectedCommitteeData.value.speakers.length === 0) {
			toast.add({
				color: "info",
				description: "No speakers in the list",
				duration: 2000,
			});
			return;
		}
		const [nextSpeaker, ...speakers] = selectedCommitteeData.value.speakers;
		await updateCommittee(selectedCommittee.value!, {
			speakers,
			floor: nextSpeaker,
		});
		toast.add({
			color: "success",
			description: "Moved next speaker to the floor",
			duration: 500,
		});
	} catch (error) {
		console.error("Error moving next speaker to floor:", error);
		toast.add({
			color: "error",
			description:
				"Error moving next speaker to floor: " + (error as Error).message,
		});
	}
}

export async function clearFloor() {
	const toast = useToast();
	if (!currentUser.value) {
		console.error("User not logged in");
		return;
	}
	try {
		if (!selectedCommitteeData.value.floor) {
			toast.add({
				color: "info",
				description: "No speaker is currently on the floor",
				duration: 2000,
			});
			return;
		}
		await updateCommittee(selectedCommittee.value!, {
			floor: null,
		});
		toast.add({
			color: "success",
			description: "Cleared the floor speaker",
			duration: 500,
		});
	} catch (error) {
		console.error("Error clearing floor speaker:", error);
		toast.add({
			color: "error",
			description: "Error clearing floor speaker: " + (error as Error).message,
		});
	}
}
