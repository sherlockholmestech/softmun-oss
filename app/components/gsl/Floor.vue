<script setup lang="ts">
import type { SoftmunMember } from "~~/shared/softmun";

const speaker = computed(() => {
	if (!selectedCommitteeData.value?.gslFloor) return null;
	const member = memberData.value?.find(
		(m: SoftmunMember) => m.$id === selectedCommitteeData.value?.gslFloor,
	);
	return member?.name ?? null;
});

const flag = computed(() => {
	if (!speaker.value) return "/flags/default.svg";
	const alpha2 = countryData.find(
		(country) => country.en.toLowerCase() === speaker.value!.toLowerCase(),
	)?.alpha2;
	return alpha2 ? `/flags/${alpha2.toLowerCase()}.svg` : "/flags/default.svg";
});

function nextSpeaker() {
	const currentSpeaker = selectedCommitteeData.value?.gslFloor;
	const nextSpeakerId = selectedCommitteeData.value?.gslList?.[0];

	if (currentSpeaker) {
		void logSpeakingEnd(currentSpeaker);
	}

	if (nextSpeakerId) {
		const newList = selectedCommitteeData.value!.gslList.slice(1);
		updateCommittee(selectedCommittee.value!, {
			gslFloor: nextSpeakerId,
			gslList: newList,
		});
		void logSpeakingStart(nextSpeakerId);
	} else {
		updateCommittee(selectedCommittee.value!, { gslFloor: null });
	}
}

function clearFloor() {
	const currentSpeaker = selectedCommitteeData.value?.gslFloor;
	if (currentSpeaker) {
		void logSpeakingEnd(currentSpeaker);
	}
	updateCommittee(selectedCommittee.value!, { gslFloor: null });
}

const hasSpeaker = computed(
	() => selectedCommitteeData.value?.gslFloor != null,
);
const hasNextSpeaker = computed(
	() => (selectedCommitteeData.value?.gslList.length ?? 0) > 0,
);
</script>

<template>
	<UCard class="panel-card h-full min-w-0">
		<template #header>
			<h3 class="text-lg font-semibold">Floor</h3>
			<p class="text-sm text-slate-500 dark:text-slate-400">
				The current speaker speaking.
			</p>
		</template>

		<div
			class="flex min-h-[180px] min-w-0 flex-col items-center justify-center p-4"
		>
			<img
				v-if="hasSpeaker"
				:src="flag"
				:alt="`Flag of ${speaker}`"
				class="h-20 mb-4"
			/>
			<h1
				v-if="hasSpeaker"
				class="max-w-full break-words text-center text-2xl font-bold"
			>
				{{ speaker }}
			</h1>
			<p v-else class="text-sm text-slate-400 dark:text-slate-500">
				No speaker on the floor
			</p>
		</div>
		<template #footer>
			<div class="flex w-full flex-wrap items-center justify-center gap-2">
				<UButton
					label="Next Speaker"
					icon="i-lucide-arrow-up"
					variant="outline"
					:disabled="!hasNextSpeaker"
					@click="nextSpeaker"
				/>
				<UButton
					label="Clear Floor"
					icon="i-lucide-x"
					variant="outline"
					color="warning"
					:disabled="!hasSpeaker"
					@click="clearFloor"
				/>
			</div>
		</template>
	</UCard>
</template>
