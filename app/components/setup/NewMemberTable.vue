<script setup lang="ts">
interface NewMember {
	name: string;
	voteType: "Observer" | "Standard" | "Veto";
	present: boolean;
	voting: boolean;
}

const newName = ref("");
const newVoteType = ref<"Observer" | "Standard" | "Veto">("Standard");
const newPresent = ref(true);
const newVoting = ref(true);
const suggestCountries = ref(true);
const inputMenuOpen = ref(false);
const addingRow = ref(false);

const voteTypeOptions = [
	{ label: "Observer", value: "Observer" },
	{ label: "Standard", value: "Standard" },
	{ label: "Veto", value: "Veto" },
];

const countrySuggestions = ref(countryData.map((country) => country.en));

const emit = defineEmits<{
	"add-member": [member: NewMember];
}>();

async function handleAddMember() {
	addingRow.value = true;
	const toast = useToast();
	if (newName.value != "") {
		try {
			await newMember(
				newName.value,
				newVoteType.value,
				newPresent.value,
				newVoting.value,
				currentUser.value!.$id,
				selectedCommittee.value!,
			);

			// Also emit to parent component for local state update
			emit("add-member", {
				name: newName.value,
				voteType: newVoteType.value,
				present: newPresent.value,
				voting: newVoting.value,
			});
			addingRow.value = false;
		} catch (error) {
			console.error("Error adding member:", error);
			toast.add({
				color: "error",
				title: "Error",
				description: `Failed to add member: ${(error as Error).message}`,
				duration: 5000,
			});
			addingRow.value = false;
		}
		resetForm();
		addingRow.value = false;
	}
	addingRow.value = false;
}

function resetForm() {
	newName.value = "";
	newVoteType.value = "Standard";
	newPresent.value = true;
	newVoting.value = true;
}
</script>

<template>
	<UCard class="panel-card mb-4">
		<template #header>
			<div
				class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
			>
				<h3 class="text-lg font-semibold">Add New Member</h3>
				<UTooltip text="Limits input to countries/territories only.">
					<UCheckbox
						v-model="suggestCountries"
						label="Limit to Countries/Territories"
					/>
				</UTooltip>
			</div>
		</template>

		<div
			class="grid grid-cols-1 gap-4 p-1 sm:grid-cols-2 lg:grid-cols-5 lg:items-end"
		>
			<div class="flex flex-col">
				<label class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
					>Name</label
				>
				<UInputMenu
					v-if="suggestCountries"
					v-model="newName"
					v-model:open="inputMenuOpen"
					:items="countrySuggestions"
					class="w-full"
					@keyup.enter="
						async () => {
							if (!addingRow) {
								await handleAddMember();
							}
						}
					"
				/>
				<UInput
					v-else
					v-model="newName"
					class="w-full"
					@keyup.enter="
						async () => {
							if (!addingRow) {
								await handleAddMember();
							}
						}
					"
				/>
			</div>
			<div class="flex flex-col">
				<label class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
					>Vote Type</label
				>
				<USelect
					v-model="newVoteType"
					:items="voteTypeOptions"
					class="w-full"
				/>
			</div>

			<div class="flex flex-col items-start sm:items-center">
				<label class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
					>Present</label
				>
				<USwitch v-model="newPresent" />
			</div>

			<div class="flex flex-col items-start sm:items-center">
				<label class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
					>Voting</label
				>
				<USwitch v-model="newVoting" />
			</div>

			<div class="flex flex-col">
				<label class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
					>Action</label
				>
				<UButton
					class="w-full"
					icon="i-lucide-plus"
					:disabled="!newName"
					:loading="addingRow"
					color="primary"
					@click="
						async () => {
							await handleAddMember();
						}
					"
				>
					Add Member
				</UButton>
			</div>
		</div>
	</UCard>
</template>
