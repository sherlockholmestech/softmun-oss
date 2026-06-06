<script setup lang="ts">
useSeoMeta({
	title: "SoftMUN - Digital Model UN Management",
	description: "Sign in to access your SoftMUN committee workspace.",
});

await navigateTo("/auth/sign-in", { replace: true });
</script>

<template>
	<div />
</template>
