import { assertSameOrigin, deleteCurrentSession } from "~~/server/utils/auth";

export default defineEventHandler(async (event) => {
	assertSameOrigin(event);
	await deleteCurrentSession(event);
	return { success: true };
});
