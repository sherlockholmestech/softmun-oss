import type { SoftmunUser } from "~~/shared/softmun";

const currentUser = ref<SoftmunUser | null>(null);

export function getErrorMessage(error: unknown) {
	if (error && typeof error === "object" && "statusMessage" in error) {
		return String(error.statusMessage);
	}

	if (error && typeof error === "object" && "data" in error) {
		const data = (error as { data?: { statusMessage?: string } }).data;
		if (data?.statusMessage) {
			return data.statusMessage;
		}
	}

	return (error as Error)?.message || "Unexpected error";
}

function clearClientState() {
	currentUser.value = null;
	selectedCommittee.value = null;
	selectedCommitteeData.value = null;
	committees.value = [];
	memberData.value = [];
	motionData.value = [];
}

export async function logout() {
	try {
		await $fetch("/api/auth/logout", { method: "POST" });
		clearClientState();
	} catch (error) {
		console.error("Error logging out:", error);
		throw error;
	}
}

export async function signup(
	email: string,
	password: string,
	inviteCode?: string,
) {
	const result = await $fetch<{ user: SoftmunUser }>("/api/auth/signup", {
		method: "POST",
		body: { email, password, inviteCode },
	});

	return result;
}

export async function login(email: string, password: string) {
	const user = await $fetch<SoftmunUser>("/api/auth/login", {
		method: "POST",
		body: { email, password },
	});

	currentUser.value = user;
	return user;
}

export async function getCurrentUser() {
	try {
		const user = await $fetch<SoftmunUser>("/api/auth/me");
		currentUser.value = user;
		return user;
	} catch {
		currentUser.value = null;
		return null;
	}
}

export async function updateEmail(newEmail: string, password: string) {
	const toast = useToast();
	if (!currentUser.value) {
		toast.add({
			color: "error",
			description: "No user is currently logged in.",
		});
		throw new Error("No user is currently logged in.");
	}

	try {
		const user = await $fetch<SoftmunUser>("/api/auth/email", {
			method: "PUT",
			body: { email: newEmail, password },
		});

		currentUser.value = user;
		toast.add({
			color: "success",
			description: "Email updated successfully",
			duration: 500,
		});
		return user;
	} catch (error) {
		console.error("Error updating email:", error);
		toast.add({
			color: "error",
			description: "Error updating email: " + getErrorMessage(error),
		});
		throw error;
	}
}

export async function updatePassword(
	currentPassword: string,
	newPassword: string,
) {
	const toast = useToast();
	if (!currentUser.value) {
		toast.add({
			color: "error",
			description: "No user is currently logged in.",
		});
		throw new Error("No user is currently logged in.");
	}

	try {
		await $fetch("/api/auth/password", {
			method: "PUT",
			body: { currentPassword, newPassword },
		});

		clearClientState();
		toast.add({
			color: "success",
			description: "Password updated successfully. Please log in again.",
			duration: 1500,
		});
	} catch (error) {
		console.error("Error updating password:", error);
		toast.add({
			color: "error",
			description: "Error updating password: " + getErrorMessage(error),
		});
		throw error;
	}
}

export async function deleteAccount(password: string) {
	const toast = useToast();
	if (!currentUser.value) {
		toast.add({
			color: "error",
			description: "No user is currently logged in.",
		});
		throw new Error("No user is currently logged in.");
	}

	try {
		await $fetch("/api/auth/me", {
			method: "DELETE",
			body: { password },
		});

		clearClientState();
		toast.add({
			color: "success",
			description: "Account deleted successfully.",
			duration: 1500,
		});
	} catch (error) {
		console.error("Error deleting account:", error);
		toast.add({
			color: "error",
			description: "Error deleting account: " + getErrorMessage(error),
		});
		throw error;
	}
}

export { currentUser };
