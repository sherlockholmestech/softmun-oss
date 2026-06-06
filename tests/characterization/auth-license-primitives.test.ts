import { beforeEach, describe, expect, test } from "bun:test";
import type { H3Event } from "h3";
import { assertRateLimit } from "../../server/utils/rate-limit";
import {
	assertSameOrigin,
	createPasswordHash,
	generateId,
	verifyPassword,
} from "../../server/utils/auth";

describe("auth and rate-limit characterization", () => {
	beforeEach(() => {
		process.env.NODE_ENV = "production";
	});

	test("same-origin allows safe methods and rejects missing/mismatched origins", () => {
		expect(() =>
			assertSameOrigin({ method: "GET" } as unknown as H3Event),
		).not.toThrow();
		expect(() =>
			assertSameOrigin({
				method: "POST",
				node: { req: { socket: {} } },
				headers: {},
			} as unknown as H3Event),
		).toThrow();
		expect(() =>
			assertSameOrigin({
				method: "POST",
				node: { req: { socket: {} } },
				headers: { origin: "https://evil.test", host: "app.test" },
			} as unknown as H3Event),
		).toThrow();
		expect(() =>
			assertSameOrigin({
				method: "POST",
				node: {
					req: {
						socket: {},
						headers: { origin: "https://app.test", host: "app.test" },
					},
				},
			} as unknown as H3Event),
		).not.toThrow();
	});

	test("rate limit returns 429 and retry-after after limit", () => {
		const event = {
			method: "POST",
			node: {
				req: { socket: { remoteAddress: "1.2.3.4" } },
				res: { setHeader() {} },
			},
			headers: {},
		} as unknown as H3Event;
		assertRateLimit(event, {
			name: "signup",
			limit: 1,
			windowMs: 60_000,
			identifiers: ["a@b.c"],
		});
		expect(() =>
			assertRateLimit(event, {
				name: "signup",
				limit: 1,
				windowMs: 60_000,
				identifiers: ["a@b.c"],
			}),
		).toThrow();
	});

	test("password primitives preserve observable behavior", async () => {
		const hash = await createPasswordHash("correct horse battery staple");
		expect(hash.startsWith("scrypt:16384:8:1:")).toBe(true);
		expect(await verifyPassword("correct horse battery staple", hash)).toBe(
			true,
		);
		expect(await verifyPassword("wrong", hash)).toBe(false);
		expect(await verifyPassword("x", "bad-format")).toBe(false);
		expect(generateId(24)).toHaveLength(24);
	});
});
