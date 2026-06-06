<script setup lang="ts">
import { z } from "zod";

// Define the schema for committee validation
const schema = z.object({
	name: z
		.string()
		.min(1, "Committee name is required")
		.max(100, "Name must be less than 100 characters"),
});

type Committee = z.output<typeof schema>;

// Form state
const state = reactive<Committee>({
	name: "",
});

// Loading and error states
const isLoading = ref(false);
const isOpen = ref(false);

// Validation computed
const isValid = computed(() => {
	try {
		schema.parse(state);
		return true;
	} catch {
		return false;
	}
});

// Submit handler
async function handleSubmit() {
	try {
		isLoading.value = true;

		// Validate the form
		const validatedData = schema.parse(state);

		await newCommittee(validatedData.name, currentUser.value!.$id);
		await getCommittees();

		// Reset form and close popover
		resetForm();
		isOpen.value = false;
	} catch (error) {
		console.error("Error creating committee:", error);
	} finally {
		isLoading.value = false;
	}
}

// Reset form
function resetForm() {
	state.name = "";
}

// Cancel handler
function handleCancel() {
	resetForm();
	isOpen.value = false;
}
</script>

<template>
	<UPopover v-model:open="isOpen">
		<UButton
			label="New Committee"
			color="primary"
			variant="solid"
			icon="i-lucide-plus"
		/>

		<template #content>
			<div class="p-6 w-96">
				<div class="mb-4">
					<h3 class="text-lg font-semibold text-slate-950 dark:text-white">
						Create New Committee
					</h3>
					<p class="text-sm text-slate-500 dark:text-slate-400">
						Set up a new committee for your Model UN session.
					</p>
				</div>

				<UForm
					:schema="schema"
					:state="state"
					class="space-y-4"
					@submit="handleSubmit"
				>
					<UFormField label="Committee Name" name="name" required>
						<UInput
							v-model="state.name"
							placeholder="e.g., United Nations Security Council"
							:disabled="isLoading"
							class="w-full"
						/>
					</UFormField>
					<div class="flex justify-end space-x-2 pt-4">
						<UButton
							label="Cancel"
							color="neutral"
							variant="ghost"
							:disabled="isLoading"
							@click="handleCancel"
						/>
						<UButton
							type="submit"
							label="Create Committee"
							color="primary"
							:loading="isLoading"
							:disabled="!isValid"
						/>
					</div>
				</UForm>
			</div>
		</template>
	</UPopover>
</template>
