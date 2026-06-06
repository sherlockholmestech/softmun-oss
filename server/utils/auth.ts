import {
	randomBytes,
	scrypt as scryptCallback,
	timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";
import { and, eq, inArray } from "drizzle-orm";
import {
	createError,
	deleteCookie,
	getCookie,
	getRequestHeader,
	setCookie,
	type H3Event,
} from "h3";
import { useDatabase } from "./db";
import { serializeUser } from "./serializers";
import {
	committees,
	committeeMembers,
	committeeMotions,
	sessions,
	speakingEvents,
	users,
} from "./schema";

const scrypt = promisify(scryptCallback);
const SESSION_COOKIE_NAME = "softmun_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
const PASSWORD_KEY_LENGTH = 64;
const PASSWORD_SCRYPT_N = 16384;
const PASSWORD_SCRYPT_R = 8;
const PASSWORD_SCRYPT_P = 1;
const PASSWORD_SCRYPT_MAXMEM = 128 * 1024 * 1024;
const SECURE_ALPHABET = "abcdefghijkmnpqrstuvwxyz23456789";

export function generateId(size = 24) {
	const bytes = randomBytes(size);
	let value = "";

	for (let index = 0; index < bytes.length; index += 1) {
		value += SECURE_ALPHABET[bytes[index] >> 3];
	}

	return value;
}

async function hashPassword(password: string, salt: Buffer) {
	const derivedKey = (await scrypt(password, salt, PASSWORD_KEY_LENGTH, {
		N: PASSWORD_SCRYPT_N,
		r: PASSWORD_SCRYPT_R,
		p: PASSWORD_SCRYPT_P,
		maxmem: PASSWORD_SCRYPT_MAXMEM,
	})) as Buffer;

	return derivedKey.toString("base64");
}

export async function createPasswordHash(password: string) {
	const salt = randomBytes(16);
	const derivedKey = await hashPassword(password, salt);
	return `scrypt:${PASSWORD_SCRYPT_N}:${PASSWORD_SCRYPT_R}:${PASSWORD_SCRYPT_P}:${salt.toString("base64")}:${derivedKey}`;
}

export async function verifyPassword(password: string, storedHash: string) {
	const [algorithm, n, r, p, saltBase64, hashBase64] = storedHash.split(":");

	if (algorithm !== "scrypt" || !n || !r || !p || !saltBase64 || !hashBase64) {
		return false;
	}

	const salt = Buffer.from(saltBase64, "base64");
	const expectedHash = Buffer.from(hashBase64, "base64");
	const derivedKey = (await scrypt(password, salt, expectedHash.length, {
		N: Number(n),
		r: Number(r),
		p: Number(p),
		maxmem: PASSWORD_SCRYPT_MAXMEM,
	})) as Buffer;

	return timingSafeEqual(expectedHash, derivedKey);
}

async function hashSessionSecret(secret: string) {
	const encoded = new TextEncoder().encode(secret);
	const digest = await crypto.subtle.digest("SHA-256", encoded);
	return Buffer.from(digest).toString("hex");
}

function getSessionCookieName() {
	const config = useRuntimeConfig();
	return config.sessionCookieName || SESSION_COOKIE_NAME;
}

export function assertSameOrigin(event: H3Event) {
	if (!event.method || ["GET", "HEAD", "OPTIONS"].includes(event.method)) {
		return;
	}

	if (process.env.NODE_ENV !== "production") {
		return;
	}

	const origin = getRequestHeader(event, "origin");
	const host = getRequestHeader(event, "host");

	if (!origin || !host) {
		throw createError({ statusCode: 403, statusMessage: "Forbidden" });
	}

	const originHost = new URL(origin).host;
	if (originHost !== host) {
		throw createError({ statusCode: 403, statusMessage: "Forbidden" });
	}
}

export async function createSession(event: H3Event, userId: string) {
	const db = useDatabase();
	const id = generateId();
	const secret = generateId();
	const token = `${id}.${secret}`;
	const secretHash = await hashSessionSecret(secret);
	const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);

	await db.insert(sessions).values({
		id,
		userId,
		secretHash,
		expiresAt,
	});

	setCookie(event, getSessionCookieName(), token, {
		httpOnly: true,
		sameSite: "lax",
		secure: process.env.NODE_ENV === "production",
		path: "/",
		maxAge: SESSION_MAX_AGE_SECONDS,
	});
}

export async function getAuthSession(event: H3Event) {
	const token = getCookie(event, getSessionCookieName());

	if (!token) {
		return null;
	}

	const [sessionId, sessionSecret] = token.split(".");
	if (!sessionId || !sessionSecret) {
		return null;
	}

	const db = useDatabase();
	const session = await db.query.sessions.findFirst({
		where: eq(sessions.id, sessionId),
	});

	if (!session) {
		return null;
	}

	if (session.expiresAt.getTime() <= Date.now()) {
		await db.delete(sessions).where(eq(sessions.id, session.id));
		clearSessionCookie(event);
		return null;
	}

	const secretHash = await hashSessionSecret(sessionSecret);
	const valid = timingSafeEqual(
		Buffer.from(session.secretHash, "hex"),
		Buffer.from(secretHash, "hex"),
	);

	if (!valid) {
		return null;
	}

	return session;
}

export async function requireUser(event: H3Event) {
	const session = await getAuthSession(event);

	if (!session) {
		throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
	}

	const db = useDatabase();
	const user = await db.query.users.findFirst({
		where: eq(users.id, session.userId),
	});

	if (!user) {
		throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
	}

	return { session, user };
}

export async function requireCommitteeOwner(
	event: H3Event,
	committeeId: string,
) {
	const { user } = await requireUser(event);
	const db = useDatabase();
	const committee = await db.query.committees.findFirst({
		where: and(eq(committees.id, committeeId), eq(committees.ownerId, user.id)),
	});

	if (!committee) {
		throw createError({
			statusCode: 404,
			statusMessage: "Committee not found",
		});
	}

	return { user, committee };
}

export async function deleteCurrentSession(event: H3Event) {
	const session = await getAuthSession(event);

	if (!session) {
		clearSessionCookie(event);
		return;
	}

	const db = useDatabase();
	await db.delete(sessions).where(eq(sessions.id, session.id));
	clearSessionCookie(event);
}

export async function deleteAllUserSessions(event: H3Event, userId: string) {
	const db = useDatabase();
	await db.delete(sessions).where(eq(sessions.userId, userId));
	clearSessionCookie(event);
}

export function clearSessionCookie(event: H3Event) {
	deleteCookie(event, getSessionCookieName(), { path: "/" });
}

export async function getSerializedCurrentUser(event: H3Event) {
	const auth = await requireUser(event);
	return serializeUser(auth.user);
}

export async function deleteCommitteeGraph(committeeId: string) {
	const db = useDatabase();
	await db
		.delete(speakingEvents)
		.where(eq(speakingEvents.committeeId, committeeId));
	await db
		.delete(committeeMotions)
		.where(eq(committeeMotions.committeeId, committeeId));
	await db
		.delete(committeeMembers)
		.where(eq(committeeMembers.committeeId, committeeId));
	await db.delete(committees).where(eq(committees.id, committeeId));
}

export async function listCommitteeIdsForOwner(ownerId: string) {
	const db = useDatabase();
	const ownedCommittees = await db.query.committees.findMany({
		where: eq(committees.ownerId, ownerId),
	});
	return ownedCommittees.map((committee) => committee.id);
}

export async function removeDanglingCommitteeRelations(committeeIds: string[]) {
	if (committeeIds.length === 0) {
		return;
	}

	const db = useDatabase();
	await db
		.delete(speakingEvents)
		.where(inArray(speakingEvents.committeeId, committeeIds));
	await db
		.delete(committeeMotions)
		.where(inArray(committeeMotions.committeeId, committeeIds));
	await db
		.delete(committeeMembers)
		.where(inArray(committeeMembers.committeeId, committeeIds));
}
