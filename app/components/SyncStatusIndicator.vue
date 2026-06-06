<script setup lang="ts">
const statusLabel = computed(() => {
	if (syncStatus.value === "syncing") return "syncing";
	if (syncStatus.value === "error") return "sync error";
	if (syncStatus.value === "saved") return "saved";
	return "";
});

const dotClass = computed(() => {
	if (syncStatus.value === "syncing") return "bg-slate-400";
	if (syncStatus.value === "error") return "bg-slate-500";
	return "bg-slate-300 dark:bg-slate-600";
});
</script>

<template>
	<div
		v-if="statusLabel"
		class="pointer-events-none fixed right-3 bottom-3 z-50 flex items-center gap-1 rounded-full bg-white/40 px-1.5 py-0.5 text-[10px] leading-none text-slate-400 opacity-50 shadow-sm backdrop-blur-sm dark:bg-slate-950/30 dark:text-slate-500"
		aria-live="polite"
	>
		<span class="size-1.5 rounded-full" :class="dotClass" />
		<span>{{ statusLabel }}</span>
	</div>
</template>
