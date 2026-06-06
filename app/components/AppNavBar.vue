<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";
import type { SoftmunMember } from "~~/shared/softmun";
import ColourMode from "./ColourMode.vue";
import { currentUser } from "#imports";

const route = useRoute();

function isActivePath(path: string) {
	return route.path === path;
}

const items = computed<NavigationMenuItem[]>(() => [
	{
		label: "General Speaker's List",
		icon: "i-lucide-list",
		to: "/gsl",
		active: isActivePath("/gsl"),
		disabled: !hasSelectedCommittee.value,
	},
	{
		label: "Motions",
		icon: "i-lucide-box",
		to: "/motions",
		active: isActivePath("/motions"),
		disabled: !hasSelectedCommittee.value,
	},
	{
		label: "Caucuses",
		icon: "i-lucide-users",
		active: route.path.startsWith("/caucuses"),
		disabled: !hasSelectedCommittee.value,
		children: [
			{
				label: "Moderated",
				icon: "i-lucide-podcast",
				to: "/caucuses/moderated",
				description: "Speeches of a set topic.",
				active: isActivePath("/caucuses/moderated"),
				disabled: !hasSelectedCommittee.value,
			},
			{
				label: "Unmoderated",
				icon: "i-lucide-mic",
				to: "/caucuses/unmoderated",
				description: "Open discussion.",
				active: isActivePath("/caucuses/unmoderated"),
				disabled: !hasSelectedCommittee.value,
			},
		],
	},
	{
		label: "Setup",
		icon: "i-lucide-wrench",
		to: "/setup",
		active: isActivePath("/setup"),
		disabled: !hasSelectedCommittee.value,
	},
	{
		label: "Statistics",
		icon: "i-lucide-bar-chart-3",
		to: "/statistics",
		active: isActivePath("/statistics"),
		disabled: !hasSelectedCommittee.value,
	},
]);

const hasSelectedCommittee = computed(
	() => selectedCommittee.value != null && selectedCommitteeData.value != null,
);

const presentDelegates = computed(() => {
	return (
		memberData.value?.filter((member: SoftmunMember) => member.present)
			.length ?? 0
	);
});

const simpleMajority = computed(() => {
	return Math.floor((presentDelegates.value || 0) / 2) + 1;
});

const votingDelegates = computed(() => {
	return (
		memberData.value?.filter((member: SoftmunMember) => member.voting).length ??
		0
	);
});

const twoThirdsMajority = computed(() => {
	return Math.ceil((votingDelegates.value || 0) * (2 / 3));
});
</script>

<template>
	<header
		class="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90"
	>
		<div class="flex min-h-16 w-full items-center gap-3 px-4">
			<NuxtLink to="/" class="flex shrink-0 items-center gap-2">
				<div
					class="flex size-8 items-center justify-center rounded-lg bg-blue-600"
				>
					<UIcon name="i-lucide-users" class="size-5 text-white" />
				</div>
				<span
					class="hidden text-lg font-semibold text-slate-950 sm:block dark:text-white"
				>
					SoftMUN
				</span>
			</NuxtLink>
			<UNavigationMenu :items="items" class="min-w-0 flex-1" />
			<div class="hidden xl:block">
				<UFieldGroup>
					<UButton variant="outline" color="neutral" icon="mdi:circle-outline">
						{{ presentDelegates }}
					</UButton>
					<UButton variant="outline" color="neutral" icon="mdi:circle-slice-4">
						{{ simpleMajority }}
					</UButton>
					<UButton variant="outline" color="neutral" icon="mdi:circle-slice-5">
						{{ twoThirdsMajority }}
					</UButton>
				</UFieldGroup>
			</div>
			<div class="ml-auto flex shrink-0 items-center gap-2">
				<UButton v-if="currentUser == null" to="/auth/signup">Sign Up</UButton>
				<UButton
					v-if="currentUser == null"
					color="neutral"
					variant="outline"
					to="/auth/login"
					>Login</UButton
				>
				<CommitteeDropdown
					v-if="currentUser != null"
					class="hidden w-64 lg:block"
				/>
				<UButton
					v-if="currentUser != null"
					color="neutral"
					variant="outline"
					to="/settings"
					class="hidden max-w-56 truncate md:inline-flex"
					>{{ currentUser.email }}</UButton
				>
				<UButton
					v-if="currentUser != null"
					color="neutral"
					variant="ghost"
					to="/auth/logout"
					icon="i-lucide-log-out"
					>Logout</UButton
				>
				<ColourMode />
			</div>
		</div>
	</header>
</template>
