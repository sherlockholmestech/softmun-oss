<script setup lang="ts">
import { formatTimerTime, getTimerColor } from "~/utils/proceedings";
type TimerVariant = "outline" | "subtle" | "solid" | "soft" | "link" | "ghost";
type TimerColor =
	| "primary"
	| "secondary"
	| "success"
	| "warning"
	| "error"
	| "info";

const state = ref({
	timeLeft: selectedCommitteeData.value?.modTotalTime ?? 90,
	totalTime: selectedCommitteeData.value?.modTotalTime ?? 90,
	progress: 100,
	buttonVariant: "outline" as TimerVariant,
	buttonColor: "primary" as TimerColor,
	updatingTime: false,
});

const inputMinutes = ref((state.value.totalTime / 60).toFixed(1));

let interval: ReturnType<typeof setInterval> | null = null;

watch(
	() => selectedCommitteeData.value?.modTotalTime,
	(newTime) => {
		if (!timerRunning.value) {
			state.value.totalTime = newTime ?? 90;
			state.value.timeLeft = newTime ?? 90;
			state.value.progress = 100;
			inputMinutes.value = (state.value.totalTime / 60).toFixed(1);
		}
	},
);

function startTimer() {
	state.value.buttonVariant = "solid";
	timerRunning.value = true;
	interval = setInterval(() => {
		if (state.value.timeLeft > 0) {
			state.value.timeLeft--;
			state.value.progress =
				(1 -
					(state.value.totalTime - state.value.timeLeft) /
						state.value.totalTime) *
				100;
			state.value.buttonColor = getTimerColor(
				state.value.timeLeft,
			) as TimerColor;
		} else {
			clearInterval(interval!);
			interval = null;
			timerRunning.value = false;
		}
	}, 1000);
}

function pauseTimer() {
	timerRunning.value = false;
	state.value.buttonVariant = "outline";
	if (interval) {
		clearInterval(interval);
		interval = null;
	}
}

function resetTimer() {
	state.value.timeLeft = state.value.totalTime;
	timerRunning.value = false;
	state.value.progress = 100;
	state.value.buttonVariant = "outline";
	state.value.buttonColor = "primary";
	if (interval) {
		clearInterval(interval);
		interval = null;
	}
}

watch(
	() => timerRunning.value,
	(newVal) => {
		if (!newVal) pauseTimer();
		else startTimer();
	},
);

function updateTotalTime(minutesInput: number) {
	const duration = Math.round(minutesInput * 60);
	state.value.updatingTime = true;
	state.value.totalTime = duration;
	state.value.timeLeft = duration;
	state.value.progress = 100;
	if (selectedCommitteeData.value) {
		updateCommittee(selectedCommittee.value!, {
			modTotalTime: duration,
		});
	}
	resetTimer();
	state.value.updatingTime = false;
}
</script>

<template>
	<UCard class="panel-card h-full">
		<template #header>
			<h3 class="text-lg font-semibold">Caucus Timer</h3>
			<p class="text-sm text-slate-500 dark:text-slate-400">
				The time left in the moderated caucus.
			</p>
		</template>

		<div class="flex flex-col items-center p-4">
			<UButton
				size="xl"
				:variant="state.buttonVariant"
				class="text-6xl flex items-center justify-center w-48"
				:color="state.buttonColor"
			>
				{{ formatTimerTime(state.timeLeft) }}
			</UButton>
			<UProgress v-model="state.progress" class="w-full mt-4" />
		</div>

		<template #footer>
			<div
				class="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
			>
				<UButton
					label="Reset"
					icon="i-lucide-refresh-cw"
					color="warning"
					variant="outline"
					:loading="state.updatingTime"
					@click="resetTimer"
				/>
				<div class="flex gap-2">
					<UInput
						v-model="inputMinutes"
						type="number"
						step="0.1"
						min="0.1"
						placeholder="Minutes"
						class="w-28"
						@keyup.enter="updateTotalTime(Number(inputMinutes))"
					/>
					<UButton
						label="Save"
						icon="i-material-symbols-save-outline-rounded"
						variant="outline"
						:loading="state.updatingTime"
						@click="updateTotalTime(Number(inputMinutes))"
					/>
				</div>
			</div>
		</template>
	</UCard>
</template>
