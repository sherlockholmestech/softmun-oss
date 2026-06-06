<script setup lang="ts">
const currentTopic = ref(selectedCommitteeData.value?.modTopic ?? "");

watch(
	() => selectedCommitteeData.value?.modTopic,
	(newTopic) => {
		currentTopic.value = newTopic ?? "";
	},
);

async function saveTopic() {
	if (!selectedCommittee.value || !currentTopic.value) {
		console.error("No committee selected or topic is empty");
		return;
	}
	await updateCommittee(selectedCommittee.value, {
		modTopic: currentTopic.value,
	});
}
</script>

<template>
	<div class="flex flex-col gap-2 sm:flex-row">
		<UInput
			v-model="currentTopic"
			size="xl"
			placeholder="Moderated caucus topic"
			class="flex-1"
			@keyup.enter="saveTopic"
		/>
		<UButton
			icon="i-material-symbols-save-outline-rounded"
			size="xl"
			color="primary"
			@click="saveTopic"
		/>
	</div>
</template>
