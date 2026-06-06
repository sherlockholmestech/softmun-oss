<script setup lang="ts">
import Floor from "~/components/gsl/Floor.vue";
import Timer from "~/components/gsl/Timer.vue";
import Speakers from "~/components/gsl/Speakers.vue";

useSeoMeta({
	title: "SoftMUN - General Speaker's List",
	description:
		"Manage and moderate the General Speaker's List for your committee.",
});

const isReady = computed(
	() =>
		currentUser.value != null &&
		selectedCommittee.value != null &&
		selectedCommitteeData.value != null,
);
</script>

<template>
	<div v-if="isReady" class="page-shell">
		<header class="page-header">
			<h1 class="page-title">General Speaker's List</h1>
			<p class="page-description">
				{{ selectedCommitteeData?.name }} speaker queue and timer.
			</p>
		</header>
		<div class="grid min-w-0 grid-cols-1 items-stretch gap-4 lg:grid-cols-2">
			<Floor />
			<Timer />
			<Speakers class="lg:col-span-2" />
		</div>
	</div>
	<div v-else class="empty-state">
		<div class="empty-state-icon">
			<UIcon name="i-lucide-list-ordered" class="size-6" />
		</div>
		<h1 class="text-lg font-semibold text-slate-950 dark:text-white">
			Select a committee
		</h1>
		<p class="mt-2 text-sm text-slate-500 dark:text-slate-400">
			Log in and choose a committee to use the General Speaker's List.
		</p>
	</div>
</template>
