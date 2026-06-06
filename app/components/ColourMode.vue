<script setup>
const colorMode = useColorMode();

const isDark = computed({
	get() {
		return colorMode.value === "dark";
	},
	set(_isDark) {
		colorMode.preference = _isDark ? "dark" : "light";
	},
});

const modeIcon = computed(() =>
	isDark.value ? "i-lucide-moon" : "i-lucide-sun",
);
</script>

<template>
	<ClientOnly v-if="!colorMode?.forced">
		<UButton
			:icon="modeIcon"
			color="neutral"
			variant="ghost"
			@click="isDark = !isDark"
		/>

		<template #fallback>
			<div class="size-16" />
		</template>
	</ClientOnly>
</template>
