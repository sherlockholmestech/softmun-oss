<script setup lang="ts">
import Timer from "~/components/caucuses/unmoderated/Timer.vue";

useSeoMeta({
	title: "SoftMUN - Unmoderated Caucus",
	description: "Manage and moderate an unmoderated caucus for your committee.",
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
			<h1 class="page-title">Unmoderated Caucus</h1>
			<p class="page-description">
				{{ selectedCommitteeData?.name }} open discussion timer.
			</p>
		</header>
		<div class="mx-auto flex max-w-xl justify-center">
			<Timer class="w-full" />
		</div>
	</div>
	<div v-else class="empty-state">
		<div class="empty-state-icon">
			<UIcon name="i-lucide-mic" class="size-6" />
		</div>
		<h1 class="text-lg font-semibold text-slate-950 dark:text-white">
			Select a committee
		</h1>
		<p class="mt-2 text-sm text-slate-500 dark:text-slate-400">
			Log in and choose a committee to start an unmoderated caucus.
		</p>
	</div>
</template>
