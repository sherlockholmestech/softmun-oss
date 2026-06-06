<script setup lang="ts">
import type { CommitteeStatistics } from "~~/shared/softmun";
import { formatDurationMinutes } from "~/utils/proceedings";

useSeoMeta({
	title: "SoftMUN - Statistics",
	description: "Delegate speaking time and action statistics.",
});

const stats = ref<CommitteeStatistics | null>(null);
const isLoading = ref(false);
const isReady = computed(
	() =>
		currentUser.value != null &&
		selectedCommittee.value != null &&
		selectedCommitteeData.value != null,
);

async function fetchStats() {
	if (!isReady.value) {
		stats.value = null;
		return;
	}
	isLoading.value = true;
	try {
		stats.value = await $fetch<CommitteeStatistics>(
			`/api/committees/${selectedCommittee.value}/statistics`,
		);
	} catch (error) {
		console.error("Error fetching statistics:", error);
		stats.value = null;
	} finally {
		isLoading.value = false;
	}
}

onMounted(fetchStats);

watch(() => selectedCommittee.value, fetchStats);
</script>

<template>
	<div class="page-shell max-w-4xl">
		<template v-if="isReady">
			<header class="page-header">
				<h1 class="page-title">Statistics</h1>
				<p class="page-description">
					{{ selectedCommitteeData?.name }}
				</p>
			</header>

			<UCard v-if="isLoading" class="panel-card text-center py-12">
				<p class="text-sm text-slate-500 dark:text-slate-400">
					Loading statistics...
				</p>
			</UCard>

			<UCard v-else-if="stats && stats.delegates.length > 0" class="panel-card">
				<template #header>
					<div class="flex items-center gap-2">
						<UIcon name="i-lucide-bar-chart-3" class="size-4 text-blue-500" />
						<h3 class="text-sm font-semibold">
							{{ stats.delegates.length }} delegate{{
								stats.delegates.length !== 1 ? "s" : ""
							}}
						</h3>
					</div>
				</template>

				<div class="divide-y divide-slate-200 dark:divide-slate-800">
					<div
						v-for="(d, i) in stats.delegates"
						:key="d.memberId"
						class="flex items-center justify-between py-3 first:pt-0 last:pb-0"
					>
						<div class="flex items-center gap-3 min-w-0">
							<span
								class="w-5 font-mono text-xs text-slate-400 dark:text-slate-500"
							>
								{{ i + 1 }}
							</span>
							<span
								class="truncate text-sm font-medium text-slate-950 dark:text-white"
							>
								{{ d.memberName }}
							</span>
						</div>
						<div
							class="flex flex-shrink-0 items-center gap-4 text-xs text-slate-500 dark:text-slate-400"
						>
							<span class="font-mono tabular-nums">
								{{ formatDurationMinutes(d.totalSpeakingTimeSeconds) }}
							</span>
							<span>{{ d.speakingTurns }} turns</span>
							<span>{{ d.motionsProposed }} motions</span>
						</div>
					</div>
				</div>
			</UCard>

			<div v-else class="empty-state min-h-72">
				<div class="empty-state-icon">
					<UIcon name="i-lucide-bar-chart-3" class="size-6" />
				</div>
				<p class="max-w-md text-sm text-slate-500 dark:text-slate-400">
					No statistics available yet. Speaking data is recorded when speakers
					take the floor.
				</p>
			</div>
		</template>
		<div v-else class="empty-state">
			<div class="empty-state-icon">
				<UIcon name="i-lucide-bar-chart-3" class="size-6" />
			</div>
			<h1 class="text-lg font-semibold text-slate-950 dark:text-white">
				Select a committee
			</h1>
			<p class="mt-2 text-sm text-slate-500 dark:text-slate-400">
				Select a committee to view statistics.
			</p>
		</div>
	</div>
</template>
