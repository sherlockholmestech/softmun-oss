import { createError, isError } from "h3";

type PostgresErrorLike = {
	code?: string;
};

export function isUniqueViolation(error: unknown) {
	if (!error || typeof error !== "object") {
		return false;
	}

	const postgresError = error as PostgresErrorLike;
	return postgresError.code === "23505";
}

export function asDatabaseWriteError(error: unknown, conflictMessage: string) {
	if (isError(error)) {
		return error;
	}

	if (isUniqueViolation(error)) {
		return createError({
			statusCode: 409,
			statusMessage: conflictMessage,
		});
	}

	const message =
		error instanceof Error && error.message
			? error.message
			: "Database write failed";

	return createError({
		statusCode: 500,
		statusMessage:
			process.env.NODE_ENV === "production" ? "Database write failed" : message,
	});
}
