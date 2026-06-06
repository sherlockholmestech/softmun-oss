const syncPendingCount = ref(0);
const syncLastErrorAt = ref<number | null>(null);
const syncLastSavedAt = ref<number | null>(null);

export const syncStatus = computed(() => {
	if (syncPendingCount.value > 0) return "syncing";
	if (syncLastErrorAt.value !== null) return "error";
	if (syncLastSavedAt.value !== null) return "saved";
	return "idle";
});

export function beginSyncOperation() {
	syncPendingCount.value += 1;
	syncLastErrorAt.value = null;
}

export function completeSyncOperation() {
	syncPendingCount.value = Math.max(0, syncPendingCount.value - 1);
	syncLastSavedAt.value = Date.now();
}

export function failSyncOperation() {
	syncPendingCount.value = Math.max(0, syncPendingCount.value - 1);
	syncLastErrorAt.value = Date.now();
}
