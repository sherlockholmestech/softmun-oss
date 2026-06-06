import { getSerializedCurrentUser } from "~~/server/utils/auth";

export default defineEventHandler(async (event) => {
	return await getSerializedCurrentUser(event);
});
