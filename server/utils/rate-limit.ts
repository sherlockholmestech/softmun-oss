import {
	createError,
	getRequestHeader,
	setResponseHeader,
	type H3Event,
} from "h3";

type RateLimitOptions = {
	name: string;
	identifiers?: Array<string | null | undefined>;
	limit: number;
	windowMs: number;
};

type Bucket = {
	count: number;
	resetAt: number;
};

const buckets = new Map<string, Bucket>();
let lastPruneAt = 0;

function getClientAddress(event: H3Event) {
	const forwardedFor = getRequestHeader(event, "x-forwarded-for")
		?.split(",")[0]
		?.trim();

	return (
		getRequestHeader(event, "cf-connecting-ip") ||
		getRequestHeader(event, "x-real-ip") ||
		forwardedFor ||
		event.node.req.socket.remoteAddress ||
		"unknown"
	);
}

function pruneExpiredBuckets(now: number) {
	if (now - lastPruneAt < 60_000) {
		return;
	}

	lastPruneAt = now;
	for (const [key, bucket] of buckets) {
		if (bucket.resetAt <= now) {
			buckets.delete(key);
		}
	}
}

export function assertRateLimit(event: H3Event, options: RateLimitOptions) {
	const now = Date.now();
	pruneExpiredBuckets(now);

	const key = [
		options.name,
		getClientAddress(event),
		...(options.identifiers ?? []),
	]
		.filter((part): part is string => Boolean(part))
		.map((part) => part.toLowerCase())
		.join(":");

	const bucket = buckets.get(key);
	if (!bucket || bucket.resetAt <= now) {
		buckets.set(key, {
			count: 1,
			resetAt: now + options.windowMs,
		});
		return;
	}

	bucket.count += 1;

	if (bucket.count > options.limit) {
		const retryAfterSeconds = Math.ceil((bucket.resetAt - now) / 1000);
		setResponseHeader(event, "Retry-After", String(retryAfterSeconds));
		throw createError({
			statusCode: 429,
			statusMessage: "Too many requests. Please try again later.",
		});
	}
}
