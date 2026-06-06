<script setup lang="ts">
import type { InputMenuItem } from "@nuxt/ui";
import type { SoftmunMember } from "~~/shared/softmun";

function getFlag(speakerId: string) {
	const member = memberData.value?.find(
		(m: SoftmunMember) => m.$id === speakerId,
	);
	if (!member?.name) return "/flags/default.svg";

	const alpha2 = countryData.find(
		(country) => country.en.toLowerCase() === member.name.toLowerCase(),
	)?.alpha2;

	return alpha2 ? `/flags/${alpha2.toLowerCase()}.svg` : "/flags/default.svg";
}

function getName(speakerId: string) {
	return (
		memberData.value?.find((m: SoftmunMember) => m.$id === speakerId)?.name ??
		"Unknown"
	);
}

const members = computed(() => {
	if (!memberData.value) return [];
	return memberData.value
		.filter((m) => m.present)
		.map((m) => ({ label: m.name, value: m.$id }))
		.sort((a, b) => a.label.localeCompare(b.label)) satisfies InputMenuItem[];
});

const selectedSpeakerInput = ref<{ label: string; value: string } | null>(null);
const draggedSpeakerIndex = ref<number | null>(null);
const dragTargetIndex = ref<number | null>(null);
const dragInsertAfter = ref(false);

function addSpeaker() {
	if (!selectedSpeakerInput.value) return;
	const currentList = selectedCommitteeData.value?.modList
		? [...selectedCommitteeData.value.modList]
		: [];
	currentList.push(selectedSpeakerInput.value.value);
	updateCommittee(selectedCommittee.value!, { modList: currentList });
	selectedSpeakerInput.value = null;
}

function removeSpeaker(index: number) {
	if (!selectedCommitteeData.value?.modList) return;
	const currentList = [...selectedCommitteeData.value.modList];
	currentList.splice(index, 1);
	updateCommittee(selectedCommittee.value!, { modList: currentList });
}

function reorderSpeaker(fromIndex: number, toIndex: number) {
	const list = selectedCommitteeData.value?.modList;
	if (!list || fromIndex === toIndex) return;
	const currentList = [...list];
	const [speaker] = currentList.splice(fromIndex, 1);
	if (!speaker) return;
	const adjustedIndex = fromIndex < toIndex ? toIndex - 1 : toIndex;
	if (fromIndex === adjustedIndex) return;
	currentList.splice(adjustedIndex, 0, speaker);
	updateCommittee(selectedCommittee.value!, { modList: currentList });
}

function startDraggingSpeaker(event: DragEvent, index: number) {
	draggedSpeakerIndex.value = index;
	event.dataTransfer?.setData("text/plain", String(index));
	if (event.dataTransfer) {
		event.dataTransfer.effectAllowed = "move";
		const row = (event.currentTarget as HTMLElement).closest(
			"[data-speaker-row]",
		);
		if (row instanceof HTMLElement) {
			event.dataTransfer.setDragImage(row, 16, row.offsetHeight / 2);
		}
	}
}

function updateDropTarget(event: DragEvent, index: number) {
	const row = event.currentTarget as HTMLElement;
	const rect = row.getBoundingClientRect();
	dragTargetIndex.value = index;
	dragInsertAfter.value = event.clientY > rect.top + rect.height / 2;
}

function clearDragState() {
	draggedSpeakerIndex.value = null;
	dragTargetIndex.value = null;
	dragInsertAfter.value = false;
}

function dropSpeaker() {
	if (draggedSpeakerIndex.value === null) return;
	if (dragTargetIndex.value === null) {
		clearDragState();
		return;
	}

	const toIndex = dragInsertAfter.value
		? dragTargetIndex.value + 1
		: dragTargetIndex.value;
	reorderSpeaker(draggedSpeakerIndex.value, toIndex);
	clearDragState();
}

const listLength = computed(
	() => selectedCommitteeData.value?.modList.length ?? 0,
);
</script>

<template>
	<UCard class="panel-card min-w-0">
		<template #header>
			<h3 class="text-lg font-semibold">Speakers</h3>
			<p class="text-sm text-slate-500 dark:text-slate-400">
				The list of speakers.
			</p>
		</template>

		<div
			v-if="listLength > 0 && memberData != null"
			class="max-h-[clamp(10rem,calc(100vh-32rem),24rem)] space-y-2 overflow-y-auto pr-2"
		>
			<div
				v-for="(speakerId, index) in selectedCommitteeData!.modList"
				:key="speakerId"
				data-speaker-row
				class="relative flex min-w-0 flex-row items-center justify-between rounded-lg bg-slate-50 p-2 dark:bg-slate-800/70"
				:class="{
					'opacity-60': draggedSpeakerIndex === index,
					'before:absolute before:left-2 before:right-2 before:top-0 before:h-0.5 before:-translate-y-1 before:rounded-full before:bg-slate-400 dark:before:bg-slate-500':
						dragTargetIndex === index && !dragInsertAfter,
					'after:absolute after:bottom-0 after:left-2 after:right-2 after:h-0.5 after:translate-y-1 after:rounded-full after:bg-slate-400 dark:after:bg-slate-500':
						dragTargetIndex === index && dragInsertAfter,
				}"
				@dragover.prevent="updateDropTarget($event, index)"
				@dragenter.prevent="updateDropTarget($event, index)"
				@drop.prevent="dropSpeaker"
			>
				<div class="flex min-w-0 flex-1 flex-row items-center">
					<span
						class="mr-2 flex cursor-grab items-center text-slate-400 active:cursor-grabbing dark:text-slate-500"
						role="button"
						aria-label="Drag speaker"
						draggable="true"
						@dragstart="startDraggingSpeaker($event, index)"
						@dragend="clearDragState"
					>
						<UIcon name="i-lucide-grip-vertical" class="size-4" />
					</span>
					<img
						:src="getFlag(speakerId)"
						:alt="`Flag of ${getName(speakerId)}`"
						class="h-4 mr-2 flex-shrink-0"
					/>
					<span class="truncate font-semibold">{{ getName(speakerId) }}</span>
				</div>
				<div class="flex flex-row items-center gap-1 flex-shrink-0 ml-2">
					<UButton
						icon="i-lucide-trash"
						variant="outline"
						color="error"
						size="sm"
						@click="removeSpeaker(index)"
					/>
				</div>
			</div>
		</div>
		<div v-else class="text-sm text-slate-500 dark:text-slate-400">
			No speakers in the list.
		</div>

		<template #footer>
			<div class="flex flex-row justify-between items-center gap-2">
				<UInputMenu
					v-model="selectedSpeakerInput"
					:items="members"
					class="flex-1"
					@keyup.enter="addSpeaker"
				/>
				<UButton
					icon="i-lucide-plus"
					:disabled="!selectedSpeakerInput"
					@click="addSpeaker"
				/>
			</div>
		</template>
	</UCard>
</template>
