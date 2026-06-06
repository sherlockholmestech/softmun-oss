import { createError } from "h3";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

export function useDatabase() {
	const config = useRuntimeConfig();
	const connectionString =
		config.neonDatabaseUrl || process.env.NEON_DATABASE_URL || "";

	if (!connectionString) {
		throw createError({
			statusCode: 500,
			statusMessage: "Missing NEON_DATABASE_URL configuration",
		});
	}

	const client = neon(connectionString);
	return drizzle({ client, schema });
}
