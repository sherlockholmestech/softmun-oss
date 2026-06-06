import { describe, expect, test } from "bun:test";
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import {
	asDatabaseWriteError,
	isUniqueViolation,
} from "../../server/utils/db-errors";

const repoRoot = process.cwd();

describe("foundational helpers characterization", () => {
	test("validation helper maps first issue with 400 in source", () => {
		const src = readFileSync(
			path.resolve(repoRoot, "server/utils/validation.ts"),
			"utf8",
		);
		expect(src).toContain("statusCode: 400");
		expect(src).toContain(
			'result.error.issues[0]?.message || "Invalid request body"',
		);
	});

	test("db error helpers preserve conflict and production redaction", () => {
		expect(isUniqueViolation({ code: "23505" })).toBe(true);
		expect(asDatabaseWriteError({ code: "23505" }, "Taken")).toMatchObject({
			statusCode: 409,
			statusMessage: "Taken",
		});
		process.env.NODE_ENV = "production";
		expect(asDatabaseWriteError(new Error("db blew up"), "x")).toMatchObject({
			statusCode: 500,
			statusMessage: "Database write failed",
		});
	});

	test("motion sorting helper keeps precedence/tie-breaker rules in source", () => {
		const src = readFileSync(
			path.resolve(repoRoot, "app/utils/motions.ts"),
			"utf8",
		);
		expect(src).toContain("precedenceA - precedenceB");
		expect(src).toContain("return timeB - timeA");
		expect(src).toContain("return speakersB - speakersA");
		expect(src).toContain(
			"new Date(a.$createdAt).getTime() - new Date(b.$createdAt).getTime()",
		);
	});
});

describe("invite-code signup gate characterization", () => {
	test("signup env var maps to runtime config", () => {
		const src = readFileSync(
			path.resolve(repoRoot, "server/api/auth/signup.post.ts"),
			"utf8",
		);
		expect(src).toContain("NUXT_SIGNUP_INVITE_CODES");
		expect(src).toContain("Invalid invite code");
	});
});

describe("route safety wiring characterization", () => {
	const apiRoot = path.resolve(repoRoot, "server/api");
	const listFiles = (dir: string): string[] =>
		readdirSync(dir).flatMap((name) => {
			const full = path.join(dir, name);
			return statSync(full).isDirectory() ? listFiles(full) : [full];
		});

	test("unsafe routes keep same-origin guard", () => {
		const postPutDelete = listFiles(apiRoot).filter((f) =>
			/\.(post|put|delete)\.ts$/.test(f),
		);
		for (const file of postPutDelete) {
			const src = readFileSync(file, "utf8");
			expect(src).toContain("assertSameOrigin(event)");
		}
	});

	test("method-specific handlers remain method-specific files", () => {
		const all = listFiles(apiRoot).filter((f) => f.endsWith(".ts"));
		for (const file of all) {
			expect(file).toMatch(/\.(get|post|put|delete)\.ts$/);
		}
	});
});
