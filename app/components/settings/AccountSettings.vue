<script setup lang="ts">
import type { TabsItem } from "@nuxt/ui";
import NewCommitteePopover from "./NewCommitteePopover.vue";
import EditCommitteeModal from "./EditCommitteeModal.vue";

const validate = (state: { email?: string; emailChangePassword?: string }) => {
	const errors = [];
	if (!state.email || !/\S+@\S+\.\S+/.test(state.email)) {
		errors.push({ name: "email", message: "A valid email is required." });
	}
	if (!state.emailChangePassword || state.emailChangePassword.length < 6) {
		errors.push({
			name: "emailChangePassword",
			message:
				"Current password is required and must be at least 6 characters.",
		});
	}
	return errors;
};

const items = [
	{
		label: "Committees",
		description: "Manage your Committees here.",
		icon: "i-lucide-list-checks",
		slot: "committees" as const,
	},
	{
		label: "Account",
		description:
			"Make changes to your account here. Click save when you're done.",
		icon: "i-lucide-user",
		slot: "account" as const,
	},
	{
		label: "Password",
		description:
			"Change your password here. After saving, you'll be logged out.",
		icon: "i-lucide-lock",
		slot: "password" as const,
	},
	{
		label: "Danger",
		description: "Permanently delete your account and all data.",
		icon: "i-lucide-triangle-alert",
		slot: "danger" as const,
	},
] satisfies TabsItem[];

const state = reactive({
	email: currentUser.value?.email || "",
	emailChangePassword: "",
	currentPassword: "",
	newPassword: "",
	confirmPassword: "",
	deletePassword: "",
});

const loading = reactive({
	emailUpdate: false,
	passwordChange: false,
	deletingCommittee: {} as Record<string, boolean>,
	deletingAccount: false,
});

async function handleEmailUpdate() {
	loading.emailUpdate = true;
	try {
		await updateEmail(state.email!, state.emailChangePassword!);
	} catch (error) {
		console.error("Error updating email:", error);
	} finally {
		loading.emailUpdate = false;
	}
}

async function handlePasswordChange() {
	loading.passwordChange = true;
	try {
		await updatePassword(state.currentPassword, state.newPassword);
		state.currentPassword = "";
		state.newPassword = "";
		state.confirmPassword = "";
	} catch (error) {
		console.error("Error changing password:", error);
	} finally {
		loading.passwordChange = false;
	}
}

async function handleDeleteCommittee(committeeId: string) {
	loading.deletingCommittee[committeeId] = true;
	try {
		await deleteCommittee(committeeId);
	} catch (error) {
		console.error("Error deleting committee:", error);
	} finally {
		loading.deletingCommittee[committeeId] = false;
	}
}

async function handleDeleteAccount() {
	loading.deletingAccount = true;
	try {
		await deleteAccount(state.deletePassword);
		state.deletePassword = "";
		await navigateTo("/");
	} catch {
		// Toast handled in deleteAccount
	} finally {
		loading.deletingAccount = false;
	}
}
</script>

<template>
	<UTabs
		:items="items"
		variant="pill"
		:ui="{ trigger: 'grow' }"
		class="gap-4 w-full"
	>
		<template #committees="{ item }">
			<div
				class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
			>
				<p class="text-muted">
					{{ item.description }}
				</p>
				<NewCommitteePopover />
			</div>
			<div class="grid grid-cols-1 gap-3">
				<UCard
					v-for="committee in committees"
					:key="committee.$id"
					class="panel-card"
					:ui="{ body: 'p-4 sm:p-5' }"
				>
					<div
						class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
					>
						<div class="min-w-0">
							<h3 class="truncate text-lg font-semibold">
								{{ committee.name }}
							</h3>
							<p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
								Created on
								{{ new Date(committee.$createdAt).toLocaleDateString() }}
							</p>
						</div>
						<div class="flex flex-wrap items-center gap-2">
							<EditCommitteeModal :committee-id="committee.$id" />
							<UButton
								label="Delete"
								variant="outline"
								icon="i-lucide-trash"
								color="error"
								:loading="loading.deletingCommittee[committee.$id]"
								:disabled="loading.deletingCommittee[committee.$id]"
								@click="handleDeleteCommittee(committee.$id)"
							/>
						</div>
					</div>
				</UCard>
			</div>
		</template>
		<template #account="{ item }">
			<p class="text-muted mb-4">
				{{ item.description }}
			</p>

			<UForm
				:validate="validate"
				:state="state"
				class="flex flex-col gap-4"
				@submit="handleEmailUpdate"
			>
				<UFormField label="Email" name="email">
					<UInput
						v-model="state.email"
						required
						class="w-full"
						:disabled="loading.emailUpdate"
					/>
				</UFormField>

				<UFormField
					label="Password (for confirmation)"
					name="password"
					description="Enter your current password to confirm changes."
				>
					<UInput
						v-model="state.emailChangePassword"
						type="password"
						required
						class="w-full"
						:disabled="loading.emailUpdate"
					/>
				</UFormField>

				<UButton
					label="Save changes"
					type="submit"
					variant="soft"
					class="self-end"
					:loading="loading.emailUpdate"
					:disabled="loading.emailUpdate"
				/>
			</UForm>
		</template>

		<template #password="{ item }">
			<p class="text-muted mb-4">
				{{ item.description }}
			</p>

			<UForm
				:validate="validate"
				:state="state"
				class="flex flex-col gap-4"
				@submit="handlePasswordChange"
			>
				<UFormField label="Current Password" name="current" required>
					<UInput
						v-model="state.currentPassword"
						type="password"
						required
						class="w-full"
						:disabled="loading.passwordChange"
					/>
				</UFormField>
				<UFormField label="New Password" name="new" required>
					<UInput
						v-model="state.newPassword"
						type="password"
						required
						class="w-full"
						:disabled="loading.passwordChange"
					/>
				</UFormField>
				<UFormField label="Confirm Password" name="confirm" required>
					<UInput
						v-model="state.confirmPassword"
						type="password"
						required
						class="w-full"
						:disabled="loading.passwordChange"
					/>
				</UFormField>

				<UButton
					label="Change password"
					type="submit"
					variant="soft"
					class="self-end"
					:loading="loading.passwordChange"
					:disabled="loading.passwordChange"
				/>
			</UForm>
		</template>

		<template #danger="{ item }">
			<p class="text-muted mb-4">
				{{ item.description }}
			</p>

			<UCard class="border-error-500/30" :ui="{ body: 'p-4 sm:p-5' }">
				<div class="flex flex-col gap-4">
					<div>
						<h3 class="font-medium text-gray-900 dark:text-white">
							Delete account
						</h3>
						<p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
							Once you delete your account, there is no going back. All of your
							committees, members, motions, and data will be permanently
							removed.
						</p>
					</div>

					<UModal
						title="Delete account"
						description="This action is irreversible. Enter your password to confirm."
					>
						<UButton
							label="Delete account"
							color="error"
							variant="outline"
							icon="i-lucide-trash"
						/>

						<template #body>
							<UForm
								:state="state"
								class="flex flex-col gap-4"
								@submit="handleDeleteAccount"
							>
								<UFormField
									label="Password"
									name="deletePassword"
									description="Enter your password to confirm account deletion."
									required
								>
									<UInput
										v-model="state.deletePassword"
										type="password"
										required
										class="w-full"
										:disabled="loading.deletingAccount"
									/>
								</UFormField>

								<UButton
									label="Permanently delete account"
									type="submit"
									color="error"
									variant="solid"
									class="self-end"
									:loading="loading.deletingAccount"
									:disabled="loading.deletingAccount || !state.deletePassword"
								/>
							</UForm>
						</template>
					</UModal>
				</div>
			</UCard>
		</template>
	</UTabs>
</template>
