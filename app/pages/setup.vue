<script setup lang="ts">
useSeoMeta({
	title: "SoftMUN - Setup",
	description: "Set up and manage your committees and members.",
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
			<h1 class="page-title">Committee Setup</h1>
			<p class="page-description">
				{{ selectedCommitteeData?.name }} members, attendance, and voting
				configuration.
			</p>
		</header>
		<SetupTable />
	</div>
	<div v-else class="empty-state">
		<div class="empty-state-icon">
			<UIcon name="i-lucide-users-round" class="size-6" />
		</div>
		<h1 class="text-lg font-semibold text-slate-950 dark:text-white">
			Select a committee
		</h1>
		<p class="mt-2 text-sm text-slate-500 dark:text-slate-400">
			Select or create a committee to manage its members.
		</p>
	</div>
</template>
