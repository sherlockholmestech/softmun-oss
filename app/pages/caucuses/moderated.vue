<script setup lang="ts">
import SpeakerTimer from "~/components/caucuses/moderated/SpeakerTimer.vue";
import TotalTimer from "~/components/caucuses/moderated/TotalTimer.vue";
import Floor from "~/components/caucuses/moderated/Floor.vue";
import Speakers from "~/components/caucuses/moderated/Speakers.vue";
import Topic from "~/components/caucuses/moderated/Topic.vue";

useSeoMeta({
	title: "SoftMUN - Moderated Caucus",
	description: "Manage and moderate a moderated caucus for your committee.",
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
			<h1 class="page-title">Moderated Caucus</h1>
			<p class="page-description">
				{{ selectedCommitteeData?.name }} topic, speaker queue, and caucus
				timers.
			</p>
		</header>
		<Topic />
		<div
			class="mt-4 grid min-w-0 grid-cols-1 items-stretch gap-4 lg:grid-cols-2"
		>
			<Floor />
			<SpeakerTimer />
			<Speakers />
			<TotalTimer />
		</div>
	</div>
	<div v-else class="empty-state">
		<div class="empty-state-icon">
			<UIcon name="i-lucide-podcast" class="size-6" />
		</div>
		<h1 class="text-lg font-semibold text-slate-950 dark:text-white">
			Select a committee
		</h1>
		<p class="mt-2 text-sm text-slate-500 dark:text-slate-400">
			Log in and choose a committee to run a moderated caucus.
		</p>
	</div>
</template>
