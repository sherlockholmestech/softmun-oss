<script setup lang="ts">
import type { SoftmunMotion } from "~~/shared/softmun";
import {
	formatDurationMinutes,
	motionEnterUpdateData,
} from "~/utils/proceedings";
function formatMotionDuration(seconds: number | null) {
	if (!seconds || seconds <= 0) return "";
	return formatDurationMinutes(seconds);
}

const props = defineProps<{
	motion: SoftmunMotion;
}>();

function getProposerName(proposerId: string) {
	return memberData.value?.find((m) => m.$id === proposerId)?.name ?? "Unknown";
}

const motionIcon = computed(() => {
	switch (props.motion.motionType) {
		case "Adjourn Debate":
			return "i-lucide-door-open";
		case "Suspend Debate":
			return "i-lucide-pause";
		case "Unmoderated Caucus":
			return "i-lucide-users";
		case "Moderated Caucus":
			return "i-lucide-mic";
		case "Introduce Draft Resolution":
			return "i-lucide-file-text";
		case "Introduce Unfriendly Ammendment":
			return "i-lucide-file-pen";
		case "Table Draft Resolution":
			return "i-lucide-archive";
		case "Move into Direct Voting Procedure on Draft Resolutions":
			return "i-lucide-vote";
		case "Amend Speaking Time":
			return "i-lucide-clock";
		default:
			return "i-lucide-gavel";
	}
});

const isEnterable = computed(() =>
	["Moderated Caucus", "Unmoderated Caucus", "Amend Speaking Time"].includes(
		props.motion.motionType,
	),
);

const motionDetails = computed(() => {
	const details: { label: string; value: string }[] = [];

	if (props.motion.modTopic) {
		details.push({ label: "Topic", value: props.motion.modTopic });
	}
	if (props.motion.motionType === "Unmoderated Caucus") {
		details.push({
			label: "Total time",
			value: formatMotionDuration(props.motion.unmodTotalTime),
		});
	}
	if (props.motion.motionType === "Moderated Caucus") {
		details.push({
			label: "Speaking",
			value: formatMotionDuration(props.motion.modSpeakingTime),
		});
		details.push({
			label: "Total",
			value: formatMotionDuration(props.motion.modTotalTime),
		});
	}
	if (props.motion.motionType === "Amend Speaking Time") {
		details.push({
			label: "New speaking time",
			value: formatMotionDuration(props.motion.amendedSpeakingTime),
		});
	}
	if (props.motion.resolutionName) {
		details.push({ label: "Resolution", value: props.motion.resolutionName });
	}

	return details.filter((detail) => detail.value);
});

const enterLoading = ref(false);

async function enterMotion() {
	if (!selectedCommittee.value) return;
	enterLoading.value = true;
	try {
		const data: Record<string, unknown> = motionEnterUpdateData(props.motion);
		if (props.motion.motionType === "Moderated Caucus") {
			if (
				props.motion.proposer &&
				!selectedCommitteeData.value?.modList.includes(props.motion.proposer)
			) {
				data.modList = [
					props.motion.proposer,
					...(selectedCommitteeData.value?.modList ?? []),
				];
			}
			await updateCommittee(selectedCommittee.value, data);
			await navigateTo("/caucuses/moderated");
		} else if (props.motion.motionType === "Unmoderated Caucus") {
			if (props.motion.unmodTotalTime != null) {
				data.unmodTotalTime = props.motion.unmodTotalTime;
			}
			await updateCommittee(selectedCommittee.value, data);
			await navigateTo("/caucuses/unmoderated");
		} else if (props.motion.motionType === "Amend Speaking Time") {
			if (props.motion.amendedSpeakingTime != null) {
				data.modSpeakingTime = props.motion.amendedSpeakingTime;
			}
			await updateCommittee(selectedCommittee.value, data);
			await navigateTo("/gsl");
		}
	} catch (error) {
		console.error("Error entering motion:", error);
	} finally {
		enterLoading.value = false;
	}
}
</script>

<template>
	<UCard class="panel-card overflow-hidden">
		<template #header>
			<div class="flex items-start justify-between gap-4">
				<div class="flex min-w-0 items-start gap-3">
					<div
						class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300"
					>
						<UIcon :name="motionIcon" class="size-4" />
					</div>
					<div class="min-w-0">
						<h3
							class="truncate text-sm font-semibold text-slate-950 dark:text-white"
						>
							{{ motion.motionType }}
						</h3>
						<p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
							Proposed by {{ getProposerName(motion.proposer) }}
						</p>
					</div>
				</div>
				<div class="flex shrink-0 items-center gap-1">
					<UButton
						v-if="isEnterable"
						label="Enter"
						color="primary"
						variant="soft"
						size="sm"
						:loading="enterLoading"
						@click="enterMotion"
					/>
					<UButton
						icon="i-lucide-trash-2"
						color="error"
						variant="ghost"
						size="sm"
						@click="deleteMotion(motion.$id)"
					/>
				</div>
			</div>
		</template>

		<div v-if="motionDetails.length" class="grid gap-2 text-sm sm:grid-cols-2">
			<div
				v-for="detail in motionDetails"
				:key="`${detail.label}:${detail.value}`"
				class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/50"
			>
				<p
					class="text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500"
				>
					{{ detail.label }}
				</p>
				<p class="mt-1 font-medium text-slate-700 dark:text-slate-200">
					{{ detail.value }}
				</p>
			</div>
		</div>
		<p v-else class="text-sm text-slate-500 dark:text-slate-400">
			No additional motion details.
		</p>
	</UCard>
</template>
