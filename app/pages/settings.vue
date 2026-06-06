<script setup lang="ts">
import AccountSettings from "~/components/settings/AccountSettings.vue";

useSeoMeta({
	title: "SoftMUN - Settings",
	description: "Manage your account settings and preferences.",
});
</script>

<template>
	<div v-if="currentUser != null" class="page-shell max-w-4xl">
		<header class="page-header">
			<h1 class="page-title">Settings</h1>
			<p class="page-description">Manage account details and committees.</p>
		</header>
		<AccountSettings />
	</div>
	<div v-else class="empty-state">
		<div class="empty-state-icon">
			<UIcon name="i-lucide-settings" class="size-6" />
		</div>
		<h1 class="text-lg font-semibold text-slate-950 dark:text-white">
			Login required
		</h1>
		<p class="mt-2 text-sm text-slate-500 dark:text-slate-400">
			You must be logged in to view this page.
		</p>
	</div>
</template>
