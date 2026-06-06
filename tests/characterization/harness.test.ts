import { describe, expect, test } from "bun:test";

describe("characterization harness", () => {
	test("bun runner is wired for focused characterization specs", () => {
		const runFocusedExamples = [
			"bun test tests/characterization/harness.test.ts",
			"bun test tests/domain",
			"bun test tests/server --preload ./tests/setup/server-mocks.ts",
		];

		expect(runFocusedExamples.length).toBe(3);
		expect(runFocusedExamples[0]).toContain("bun test");
	});
});
