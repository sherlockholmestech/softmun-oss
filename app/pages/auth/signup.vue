<script setup lang="ts">
import * as z from "zod";

useSeoMeta({
	title: "SoftMUN - Sign Up",
	description: "Sign up for a SoftMUN account.",
});

const runtime = useRuntimeConfig();
const inviteCodes = computed(() => {
	const raw = runtime.public.signupInviteCodes;
	const value = Array.isArray(raw) ? raw.join(",") : (raw ?? "");
	return value
		.split(",")
		.map((code) => code.trim())
		.filter(Boolean);
});
const requiresInviteCode = computed(() => inviteCodes.value.length > 0);

const schema = z
	.object({
		email: z.email("Invalid email"),
		password: z.string().min(8, "Must be at least 8 characters"),
		inviteCode: z.string().trim().optional(),
	})
	.refine(
		(value) =>
			!requiresInviteCode.value ||
			(typeof value.inviteCode === "string" && value.inviteCode.length > 0),
		{ message: "Invite code is required", path: ["inviteCode"] },
	);

type Schema = z.output<typeof schema>;

const state = reactive<Partial<Schema>>({
	email: undefined,
	password: undefined,
	inviteCode: undefined,
});

const toast = useToast();
const loading = ref(false);

async function onSubmit() {
	if (requiresInviteCode.value && !state.inviteCode) {
		return;
	}
	loading.value = true;
	try {
		const result = await signup(
			state.email!,
			state.password!,
			requiresInviteCode.value ? state.inviteCode : undefined,
		);
		currentUser.value = result.user;
		toast.add({
			color: "success",
			description: "Account created. Welcome to SoftMUN.",
			duration: 500,
		});
		await navigateTo("/setup");
	} catch (error) {
		toast.add({
			color: "error",
			description: "Failed to sign up: " + getErrorMessage(error),
		});
		console.error(error);
	} finally {
		loading.value = false;
	}
}
</script>

<template>
	<div class="page-shell flex min-h-screen items-center justify-center">
		<UCard class="panel-card w-full max-w-md">
			<template #header>
				<div>
					<h1 class="text-xl font-semibold text-slate-950 dark:text-white">
						Sign Up
					</h1>
					<p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
						Create a SoftMUN account.
					</p>
				</div>
			</template>

			<UForm
				:schema="schema"
				:state="state"
				class="space-y-4"
				@submit="onSubmit"
			>
				<UFormField label="Email" name="email" class="w-full">
					<UInput v-model="state.email" class="w-full" />
				</UFormField>

				<UFormField label="Password" name="password" class="w-full">
					<UInput v-model="state.password" type="password" class="w-full" />
				</UFormField>

				<UFormField
					v-if="requiresInviteCode"
					label="Invite code"
					name="inviteCode"
					description="This instance requires an invite code to sign up."
					class="w-full"
				>
					<UInput
						v-model="state.inviteCode"
						class="w-full"
						autocomplete="off"
					/>
				</UFormField>

				<UButton type="submit" block :loading="loading">Create Account</UButton>
			</UForm>
		</UCard>
	</div>
</template>
