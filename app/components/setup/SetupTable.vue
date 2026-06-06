<script setup lang="ts">
import { h, resolveComponent } from "vue";
import type { TableColumn, TabsItem } from "@nuxt/ui";
import type { SoftmunMember } from "~~/shared/softmun";
import NewMemberTable from "./NewMemberTable.vue";
import { memberData } from "#imports";

type Member = {
	$id: string;
	name: string;
	voteType: "Observer" | "Standard" | "Veto";
	present: boolean;
	voting: boolean;
};

const updatingMembers = ref(new Set<string>());
const deletingMembers = ref(new Set<string>());
const sortedMembers = computed(() =>
	(memberData.value || []).map((member) => toTableMember(member)),
);

function toTableMember(member: SoftmunMember): Member {
	return {
		$id: member.$id,
		name: member.name,
		voteType: member.voteType,
		present: member.present,
		voting: member.voting,
	};
}

const data = ref<Member[]>([]);

function markMemberUpdating(memberId: string) {
	updatingMembers.value = new Set(updatingMembers.value).add(memberId);
	setTimeout(() => {
		const next = new Set(updatingMembers.value);
		next.delete(memberId);
		updatingMembers.value = next;
	}, 350);
}

async function handleDeleteMember(memberId: string) {
	deletingMembers.value = new Set(deletingMembers.value).add(memberId);
	await deleteMember(memberId);
	const next = new Set(deletingMembers.value);
	next.delete(memberId);
	deletingMembers.value = next;
	data.value = [...data.value];
}

const columns: TableColumn<Member>[] = [
	{
		accessorKey: "name",
		header: "Name",
		meta: {
			class: {
				th: "text-slate-950 dark:text-white",
				td: "text-slate-950 dark:text-white",
			},
		},
		cell: ({ row }) => row.getValue("name"),
	},
	{
		accessorKey: "voteType",
		header: "Vote Type",
		cell: ({ row }) =>
			h(resolveComponent("URadioGroup"), {
				modelValue: row.getValue("voteType"),
				orientation: "horizontal",
				variant: "table",
				indicator: "hidden",
				loading: updatingMembers.value.has(row.original.$id),
				items: ["Observer", "Standard", "Veto"],
				"onUpdate:modelValue": (value: "Observer" | "Standard" | "Veto") => {
					markMemberUpdating(row.original.$id);
					updateMember(row.original.$id, { voteType: value });
				},
			}),
	},
	{
		accessorKey: "status",
		header: "Status",
		cell: ({ row }) =>
			h(resolveComponent("UCheckboxGroup"), {
				orientation: "horizontal",
				variant: "table",
				indicator: "hidden",
				loading: updatingMembers.value.has(row.original.$id),
				modelValue: [
					row.original.present ? "present" : "",
					row.original.voting ? "voting" : "",
				],
				items: [
					{ label: "Present", value: "present" },
					{ label: "Voting", value: "voting" },
				],
				"onUpdate:modelValue": (values: string[]) => {
					const present = values.includes("present");
					const voting = values.includes("voting");
					markMemberUpdating(row.original.$id);
					updateMember(row.original.$id, { present, voting });
				},
			}),
	},
	{
		accessorKey: "actions",
		header: "Actions",
		cell: ({ row }) =>
			h(resolveComponent("UButton"), {
				icon: "i-lucide-trash",
				color: "error",
				variant: "outline",
				loading: deletingMembers.value.has(row.original.$id),
				onClick: () => handleDeleteMember(row.original.$id),
			}),
	},
];

watch(sortedMembers, (newVal) => {
	data.value = newVal;
	data.value.sort((a, b) => a.name.localeCompare(b.name));
});

function handleAddMember() {
	data.value = sortedMembers.value;
	data.value.sort((a, b) => a.name.localeCompare(b.name));
	data.value = [...data.value];
}

data.value = sortedMembers.value.sort((a, b) => a.name.localeCompare(b.name));

const tabs = [
	{
		label: "Committee Members",
		description: "Manage existing committee members.",
		icon: "i-lucide-users",
		slot: "members-list" as const,
	},
	{
		label: "Add New Member",
		description: "Add a new member to the committee",
		icon: "i-lucide-plus",
		slot: "add-member" as const,
	},
] satisfies TabsItem[];
</script>
<template>
	<div class="flex flex-col space-y-4">
		<UTabs
			:items="tabs"
			variant="pill"
			:ui="{ trigger: 'grow' }"
			class="gap-4 w-full"
		>
			<template #members-list="{ item }">
				<p class="text-muted mb-4">
					{{ item.description }}
				</p>

				<UCard class="panel-card overflow-hidden">
					<UTable :data="data" :columns="columns" />
				</UCard>
			</template>

			<template #add-member="{ item }">
				<p class="text-muted mb-4">
					{{ item.description }}
				</p>

				<NewMemberTable @add-member="handleAddMember" />
			</template>
		</UTabs>
	</div>
</template>
