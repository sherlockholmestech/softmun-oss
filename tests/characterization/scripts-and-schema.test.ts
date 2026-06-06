import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();

describe("schema and migration asset characterization", () => {
	test("drizzle config and migration artifacts stay present", async () => {
		expect(existsSync(path.resolve(repoRoot, "drizzle.config.ts"))).toBe(true);
		expect(
			existsSync(path.resolve(repoRoot, "db/migrations/meta/_journal.json")),
		).toBe(true);
	});
});

describe("db utils environment precedence characterization", () => {
	test("target/env/url inference order remains stable", async () => {
		const script = `
			process.env.SOFTMUN_DB_TARGET = "production";
			process.env.APP_ENV = "staging";
			process.env.NEON_DATABASE_URL = "postgres://example";
			const m = await import(${JSON.stringify(path.resolve(repoRoot, "scripts/db-utils.mjs"))});
			const one = m.getDatabaseTarget();
			delete process.env.SOFTMUN_DB_TARGET;
			const two = m.getDatabaseTarget();
			delete process.env.APP_ENV;
			process.env.NEON_DATABASE_URL = "postgres://prod-main-neon";
			const three = m.getDatabaseTarget();
			console.log(JSON.stringify({ one, two, three, inferred: m.inferDatabaseTarget("postgres://staging-branch"), dev: m.inferDatabaseTarget("postgres://feature-123") }));
		`;
		const parsed = JSON.parse((await Bun.$`bun -e ${script}`.text()).trim());
		expect(parsed).toEqual({
			one: "production",
			two: "staging",
			three: "production",
			inferred: "staging",
			dev: "development",
		});
	});
});
