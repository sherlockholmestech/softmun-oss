<script setup lang="ts">
import { addMotion } from "~/utils/motions";
import { minutesToRoundedSeconds } from "~/utils/proceedings";

const state = reactive({
	motionType: "",
	proposerId: "",
	modTopic: "",
	unmodMinutes: null as number | null,
	modSpeakingMinutes: null as number | null,
	modTotalMinutes: null as number | null,
	amendMinutes: null as number | null,
	resolutionName: "",
});

const isLoading = ref(false);

const members = computed(() => {
	if (!memberData.value) return [];
	return memberData.value
		.filter((m) => m.present)
		.map((m) => ({ label: m.name, value: m.$id }))
		.sort((a, b) => a.label.localeCompare(b.label));
});

const motionTypes = computed<string[]>(
	() => selectedCommitteeData.value?.motionTypes ?? [],
);

const isValid = computed(() => {
	if (!state.motionType || !state.proposerId) return false;
	switch (state.motionType) {
		case "Unmoderated Caucus":
			return (state.unmodMinutes ?? 0) > 0;
		case "Moderated Caucus":
			return (
				state.modTopic.trim().length > 0 &&
				(state.modSpeakingMinutes ?? 0) > 0 &&
				(state.modTotalMinutes ?? 0) > 0
			);
		case "Amend Speaking Time":
			return (state.amendMinutes ?? 0) > 0;
		default:
			return true;
	}
});

const needsResolution = computed(() =>
	[
		"Introduce Draft Resolution",
		"Introduce Unfriendly Ammendment",
		"Table Draft Resolution",
	].includes(state.motionType),
);

async function handleSubmit() {
	try {
		isLoading.value = true;
		const body: Record<string, string | number | null> = {
			proposer: state.proposerId,
			motionType: state.motionType,
		};

		if (state.motionType === "Unmoderated Caucus")
			body.unmodTotalTime = minutesToRoundedSeconds(state.unmodMinutes);
		if (state.motionType === "Moderated Caucus") {
			body.modTopic = state.modTopic.trim();
			body.modSpeakingTime = minutesToRoundedSeconds(state.modSpeakingMinutes);
			body.modTotalTime = minutesToRoundedSeconds(state.modTotalMinutes);
		}
		if (state.motionType === "Amend Speaking Time")
			body.amendedSpeakingTime = minutesToRoundedSeconds(state.amendMinutes);
		if (needsResolution.value) body.draftReso = state.resolutionName;

		await addMotion(body);
		resetForm();
	} catch (error) {
		console.error("Error proposing motion:", error);
	} finally {
		isLoading.value = false;
	}
}

function resetForm() {
	state.motionType = "";
	state.proposerId = "";
	state.modTopic = "";
	state.unmodMinutes = null;
	state.modSpeakingMinutes = null;
	state.modTotalMinutes = null;
	state.amendMinutes = null;
	state.resolutionName = "";
}
</script>

<template>
	<UCard class="panel-card mb-6">
		<template #header>
			<h3 class="text-lg font-semibold text-slate-950 dark:text-white">
				New Motion
			</h3>
			<p class="text-sm text-slate-500 dark:text-slate-400">
				Propose a motion for consideration by the committee.
			</p>
		</template>

		<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
			<UInputMenu
				v-model="state.motionType"
				:items="motionTypes"
				placeholder="Type of motion..."
				:disabled="isLoading"
				class="w-full"
			/>

			<UInputMenu
				v-model="state.proposerId"
				:items="members"
				placeholder="Proposer..."
				label-key="label"
				value-key="value"
				:disabled="isLoading"
				class="w-full"
			/>

			<UInput
				v-if="state.motionType === 'Moderated Caucus'"
				v-model="state.modTopic"
				placeholder="Topic of discussion..."
				:disabled="isLoading"
				class="w-full sm:col-span-2"
			/>

			<UInput
				v-if="needsResolution"
				v-model="state.resolutionName"
				placeholder="Resolution name..."
				:disabled="isLoading"
				class="w-full sm:col-span-2"
			/>

			<UInput
				v-if="state.motionType === 'Unmoderated Caucus'"
				v-model="state.unmodMinutes"
				type="number"
				step="0.5"
				min="0.5"
				placeholder="Duration (minutes)..."
				:disabled="isLoading"
				class="w-full sm:col-span-2"
			/>

			<template v-if="state.motionType === 'Moderated Caucus'">
				<UInput
					v-model="state.modSpeakingMinutes"
					type="number"
					step="0.5"
					min="0.5"
					placeholder="Speaking time (minutes)..."
					:disabled="isLoading"
					class="w-full"
				/>
				<UInput
					v-model="state.modTotalMinutes"
					type="number"
					step="0.5"
					min="0.5"
					placeholder="Total time (minutes)..."
					:disabled="isLoading"
					class="w-full"
				/>
			</template>

			<UInput
				v-if="state.motionType === 'Amend Speaking Time'"
				v-model="state.amendMinutes"
				type="number"
				step="0.5"
				min="0.5"
				placeholder="New speaking time (minutes)..."
				:disabled="isLoading"
				class="w-full sm:col-span-2"
			/>
		</div>

		<template #footer>
			<div class="flex justify-end">
				<UButton
					label="Propose Motion"
					color="primary"
					icon="i-lucide-plus"
					:loading="isLoading"
					:disabled="!isValid"
					@click="handleSubmit"
				/>
			</div>
		</template>
	</UCard>
</template>
