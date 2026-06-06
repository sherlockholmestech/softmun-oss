<script setup lang="ts">
import NewMotion from "~/components/motions/NewMotion.vue";
import MotionCard from "~/components/motions/MotionCard.vue";
import { motionData, sortMotionsByDisruptiveness } from "~/utils/motions";

useSeoMeta({
	title: "SoftMUN - Motions",
	description: "Manage and view motions for your committee.",
});

const sortedMotions = computed(() =>
	sortMotionsByDisruptiveness(motionData.value),
);

const isReady = computed(
	() =>
		currentUser.value != null &&
		selectedCommittee.value != null &&
		selectedCommitteeData.value != null,
);

onMounted(async () => {
	if (isReady.value) {
		await getMotions();
	}
});

watch(
	() => selectedCommitteeData.value,
	async () => {
		if (isReady.value) {
			await getMotions();
		} else {
			motionData.value = [];
		}
	},
);
</script>

<template>
	<div class="page-shell max-w-3xl">
		<template v-if="isReady">
			<header class="page-header">
				<h1 class="page-title">Motions</h1>
				<p class="page-description">
					{{ selectedCommitteeData?.name }}
				</p>
			</header>

			<NewMotion />

			<div v-if="sortedMotions.length" class="grid gap-3">
				<MotionCard
					v-for="motion in sortedMotions"
					:key="motion.$id"
					:motion="motion"
				/>
			</div>
			<div v-else class="empty-state min-h-72">
				<div class="empty-state-icon">
					<UIcon name="i-lucide-gavel" class="size-6" />
				</div>
				<p class="text-sm text-slate-500 dark:text-slate-400">
					No motions proposed yet
				</p>
			</div>
		</template>
		<div v-else class="empty-state">
			<div class="empty-state-icon">
				<UIcon name="i-lucide-gavel" class="size-6" />
			</div>
			<h1 class="text-lg font-semibold text-slate-950 dark:text-white">
				Select a committee
			</h1>
			<p class="mt-2 text-sm text-slate-500 dark:text-slate-400">
				Select a committee to manage motions.
			</p>
		</div>
	</div>
</template>
