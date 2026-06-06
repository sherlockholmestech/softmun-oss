import { defineConfig } from "drizzle-kit";

export default defineConfig({
	dialect: "postgresql",
	schema: "./server/utils/schema.ts",
	out: "./db/migrations",
	dbCredentials: {
		url:
			process.env.NEON_DATABASE_URL || process.env.NUXT_NEON_DATABASE_URL || "",
	},
});
