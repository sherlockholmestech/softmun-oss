<script setup lang="ts">
import { committees } from "#imports";

interface Committee {
	name: string;
	$id: string;
}

const MAX_NAME_LENGTH = 35;

const committeesList = computed(
	() =>
		committees.value?.map((c: Committee) => ({
			label:
				c.name.length > MAX_NAME_LENGTH
					? c.name.slice(0, MAX_NAME_LENGTH) + "..."
					: c.name,
			value: c.$id,
		})) || [],
);
const value = ref<string | undefined>(undefined);

watch(value, (newVal) => {
	selectCommittee(newVal!);
});
</script>

<template>
	<USelect
		v-model="value"
		placeholder="Select Committee"
		:items="committeesList"
		class="w-48 truncate"
	/>
</template>
