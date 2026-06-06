<script setup lang="ts">
async function handleLogout() {
	await logout();
}

onMounted(handleLogout);
</script>

<template>
	<div class="flex flex-col items-center justify-center min-h-[60vh] px-4">
		<h1 class="text-2xl font-bold mb-4">You have been logged out</h1>
		<p class="mb-6 text-center">
			Thank you for using SoftMUN. You have successfully logged out of your
			account.
		</p>
		<UButton label="Login Again" size="lg" as="NuxtLink" to="/auth/sign-in" />
	</div>
</template>
