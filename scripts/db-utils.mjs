import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PRODUCTION_PATTERNS = [/prod/i, /production/i, /main/i, /live/i];
const STAGING_PATTERNS = [/stage/i, /staging/i, /preview/i];

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const originalEnvKeys = new Set(Object.keys(process.env));

function loadEnvFile(filename) {
	const filePath = path.join(repoRoot, filename);

	if (!fs.existsSync(filePath)) {
		return;
	}

	const fileContents = fs.readFileSync(filePath, "utf8");
	for (const rawLine of fileContents.split(/\r?\n/u)) {
		const line = rawLine.trim();

		if (!line || line.startsWith("#")) {
			continue;
		}

		const separatorIndex = line.indexOf("=");
		if (separatorIndex === -1) {
			continue;
		}

		const key = line.slice(0, separatorIndex).trim();
		if (!key || originalEnvKeys.has(key)) {
			continue;
		}

		let value = line.slice(separatorIndex + 1).trim();
		if (
			(value.startsWith('"') && value.endsWith('"')) ||
			(value.startsWith("'") && value.endsWith("'"))
		) {
			value = value.slice(1, -1);
		}

		process.env[key] = value;
	}
}

loadEnvFile(".env");

const configuredEnv =
	process.env.APP_ENV || process.env.SOFTMUN_DB_TARGET || process.env.NODE_ENV;

if (configuredEnv) {
	loadEnvFile(`.env.${configuredEnv}`);
}

loadEnvFile(".env.local");

export function getDatabaseUrl() {
	return (
		process.env.NEON_DATABASE_URL || process.env.NUXT_NEON_DATABASE_URL || ""
	);
}

export function inferDatabaseTarget(url) {
	if (!url) {
		return "unknown";
	}

	if (PRODUCTION_PATTERNS.some((pattern) => pattern.test(url))) {
		return "production";
	}

	if (STAGING_PATTERNS.some((pattern) => pattern.test(url))) {
		return "staging";
	}

	return "development";
}

export function getDatabaseTarget() {
	return (
		process.env.SOFTMUN_DB_TARGET ||
		process.env.APP_ENV ||
		inferDatabaseTarget(getDatabaseUrl())
	);
}

export function assertDatabaseUrl(action) {
	const url = getDatabaseUrl();
	if (!url) {
		throw new Error(
			`Missing NEON_DATABASE_URL or NUXT_NEON_DATABASE_URL for db:${action}.`,
		);
	}

	return url;
}

export function assertSafeWriteTarget(action) {
	const target = getDatabaseTarget();
	if (target === "production" && process.env.ALLOW_PROD_DB_WRITE !== "true") {
		throw new Error(
			`Refusing to run db:${action} against a production database target. Set ALLOW_PROD_DB_WRITE=true only for intentional production operations.`,
		);
	}

	return target;
}
