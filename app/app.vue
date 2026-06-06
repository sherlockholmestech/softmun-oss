<script setup lang="ts">
import AppNavBar from "./components/AppNavBar.vue";
import SyncStatusIndicator from "./components/SyncStatusIndicator.vue";
import type { RouteLocationNormalizedLoaded } from "vue-router";

function isPublicShellRoute(route: RouteLocationNormalizedLoaded) {
	return ["/auth/sign-in", "/auth/signup", "/auth/logout", "/"].includes(
		route.path,
	);
}

function isCommitteeViewRoute(route: RouteLocationNormalizedLoaded) {
	return [
		"/gsl",
		"/motions",
		"/setup",
		"/statistics",
		"/caucuses/moderated",
		"/caucuses/unmoderated",
	].includes(route.path);
}

function clearCommitteeDependentData() {
	memberData.value = [];
	motionData.value = [];
}

watch(selectedCommittee, async (committeeId) => {
	if (committeeId) {
		await Promise.all([getMembers(committeeId), getMotions()]);
		return;
	}

	clearCommitteeDependentData();
});

onMounted(async () => {
	await getCurrentUser();
	await getCommittees();
});
</script>

<template>
	<UApp>
		<AppNavBar v-if="!isPublicShellRoute($route)" />
		<SyncStatusIndicator />
		<div
			v-if="isCommitteeViewRoute($route)"
			class="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col items-center justify-center px-6 py-16 text-center lg:hidden"
		>
			<div
				class="mb-4 flex size-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600 ring-1 ring-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:ring-blue-900"
			>
				<UIcon name="i-lucide-monitor" class="size-6" />
			</div>
			<h1 class="text-lg font-semibold text-slate-950 dark:text-white">
				Mobile not supported
			</h1>
			<p class="mt-2 text-sm text-slate-500 dark:text-slate-400">
				Committee views are designed for larger screens. Please use a desktop or
				laptop for the best experience.
			</p>
		</div>
		<div :class="{ 'hidden lg:block': isCommitteeViewRoute($route) }">
			<NuxtPage />
		</div>
	</UApp>
</template>
