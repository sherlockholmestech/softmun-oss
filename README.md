# SoftMUN

Nuxt 4 + Bun app for Model UN committee management.

The Appwrite backend has been replaced with:

- Neon Postgres for data storage
- Drizzle ORM for schema/querying
- Cookie-based email/password auth implemented through the current Lucia-style session model on the Nuxt server

## Environment

Use one of the included templates:

```bash
cp .env.local.example .env.local
```

Important variables:

- `SOFTMUN_DB_TARGET`
- `NEON_DATABASE_URL`
- `NUXT_NEON_DATABASE_URL`
- `ALLOW_PROD_DB_WRITE`
- `NUXT_SIGNUP_INVITE_CODES` (optional, see below)

## Optional Invite-Only Sign Up

Set `NUXT_SIGNUP_INVITE_CODES` to a comma-separated list of allowlisted
codes to gate sign up:

```env
NUXT_SIGNUP_INVITE_CODES=alpha,bravo,charlie
```

When set, `/auth/signup` requires the visitor to enter one of the codes.
Leave the variable empty or unset to allow open sign up.

## Install

```bash
bun install
```

## Database Commands

Generate migrations:

```bash
bun run db:generate
```

Apply migrations:

```bash
bun run db:migrate
```

Fast schema sync for disposable dev branches:

```bash
bun run db:push
```

Seed a local or staging branch:

```bash
bun run db:seed
```

This creates:

- `users`
- `sessions`
- `committees`
- `committee_members`
- `committee_motions`
- `speaking_events`

Production write commands are guarded. `db:migrate`, `db:push`, and `db:seed`
will refuse to run when `SOFTMUN_DB_TARGET=production` unless
`ALLOW_PROD_DB_WRITE=true`.

## Branch Workflow

Use Git branches and Neon branches together:

1. `main` maps to the Neon production branch.
2. `staging` maps to the Neon staging branch.
3. Each `feature/*` branch gets its own Neon branch.
4. Local `.env.local` should always point to a non-production Neon branch.
5. Merge code first, then run production migrations intentionally during deploy.

The full workflow is documented in [docs/database-workflow.md](./docs/database-workflow.md).

## Run

```bash
bun run dev
```

## Verification

Useful local checks:

```bash
bun run lint
./node_modules/.bin/tsc --noEmit -p tsconfig.json
bun test
```
