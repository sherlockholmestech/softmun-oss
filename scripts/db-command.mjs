import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
	assertDatabaseUrl,
	assertSafeWriteTarget,
	getDatabaseTarget,
} from "./db-utils.mjs";

const action = process.argv[2];

if (!action) {
	console.error("Usage: node scripts/db-command.mjs <action>");
	process.exit(1);
}

const writeActions = new Set(["push", "migrate"]);
const requiresDatabaseUrl = new Set(["push", "migrate", "check", "studio"]);

try {
	if (requiresDatabaseUrl.has(action)) {
		assertDatabaseUrl(action);
	}

	if (writeActions.has(action)) {
		const target = assertSafeWriteTarget(action);
		console.log(`Running db:${action} against ${target}`);
	} else {
		console.log(`Running db:${action} with target ${getDatabaseTarget()}`);
	}
} catch (error) {
	console.error(
		(error instanceof Error ? error.message : String(error)).trim(),
	);
	process.exit(1);
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const drizzleBinary = path.join(
	repoRoot,
	"node_modules",
	".bin",
	"drizzle-kit",
);

const result = spawnSync(drizzleBinary, [action], {
	stdio: "inherit",
	cwd: repoRoot,
	env: process.env,
	shell: process.platform === "win32",
});

process.exit(result.status ?? 1);
