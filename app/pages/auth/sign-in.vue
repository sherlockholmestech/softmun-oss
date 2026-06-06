<script setup lang="ts">
import * as z from "zod";

useSeoMeta({
	title: "SoftMUN - Login",
	description: "Log in to your SoftMUN account.",
});

const schema = z.object({
	email: z.email("Invalid email"),
	password: z.string().min(8, "Must be at least 8 characters"),
});

type Schema = z.output<typeof schema>;

const state = reactive<Partial<Schema>>({
	email: undefined,
	password: undefined,
});

const toast = useToast();
const successToast = {
	color: "success" as const,
	description: "Logged in successfully",
	duration: 500,
};

async function onSubmit() {
	try {
		await login(state.email!, state.password!);
		toast.add(successToast);
		await navigateTo("/setup");
	} catch (error) {
		toast.add({
			color: "error",
			description: "Failed to log in: " + getErrorMessage(error),
		});
		console.error(error);
	}
}
</script>

<template>
	<div class="page-shell flex min-h-screen items-center justify-center">
		<UCard class="panel-card w-full max-w-md">
			<template #header>
				<div>
					<h1 class="text-xl font-semibold text-slate-950 dark:text-white">
						Login
					</h1>
					<p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
						Access your SoftMUN workspace.
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

				<UButton type="submit" block>Login</UButton>
			</UForm>

			<USeparator class="my-6" label="or" />

			<UButton
				to="/auth/signup"
				variant="outline"
				block
				icon="i-lucide-user-plus"
			>
				Sign Up
			</UButton>
		</UCard>
	</div>
</template>
