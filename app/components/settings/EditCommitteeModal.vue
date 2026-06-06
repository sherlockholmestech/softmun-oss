<script setup lang="ts">
import * as z from "zod";
import { updateCommittee } from "~/utils/committee";

const schema = z.object({
	name: z
		.string()
		.min(1, "Committee name is required")
		.max(100, "Name must be less than 100 characters"),
});
type Schema = z.output<typeof schema>;
const state = reactive<Partial<Schema>>({
	name: "",
});

const props = defineProps<{
	committeeId: string;
}>();
</script>

<template>
	<UModal title="Edit Committee" description="Change the committee name here.">
		<UButton
			label="Edit"
			color="primary"
			variant="outline"
			icon="i-lucide-pen"
		/>

		<template #body>
			<UForm
				:schema="schema"
				:state="state"
				class="flex flex-col gap-4"
				@submit="
					async () => {
						await updateCommittee(props.committeeId, { name: state.name! });
					}
				"
			>
				<UFormField label="Committee Name" name="name">
					<UInput v-model="state.name" required class="w-full" />
				</UFormField>
				<UButton
					label="Save changes"
					type="submit"
					variant="soft"
					class="self-end"
				/>
			</UForm>
		</template>
	</UModal>
</template>
