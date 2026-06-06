# Database Workflow

This repo is set up for branch-isolated Neon development.

## Branch Mapping

- `main` -> Neon `production`
- `staging` -> Neon `staging`
- `feature/*` -> Neon preview or feature branches

Do not point local development at the production Neon branch.

## Environment Convention

Use one env file per target:

- `.env.local`
- `.env.staging`
- `.env.production`

Set:

- `SOFTMUN_DB_TARGET=development|staging|production`
- `NEON_DATABASE_URL=...`

Production write commands are blocked unless `ALLOW_PROD_DB_WRITE=true`.

## Recommended Daily Flow

1. Create a Git feature branch.
2. Create a matching Neon branch from `staging` or `production`.
3. Put that branch connection string in `.env.local`.
4. Make schema changes in [server/utils/schema.ts](../server/utils/schema.ts).
5. Generate SQL with `bun run db:generate`.
6. Apply locally with `bun run db:migrate`.
7. Seed demo data with `bun run db:seed` if needed.
8. Run the app and test the feature branch in isolation.
9. Merge code after review.
10. Apply migrations to staging or production intentionally during deployment.

## Commands

```bash
bun run db:generate
bun run db:migrate
bun run db:push
bun run db:seed
bun run db:check
```

Guidance:

- `db:generate` creates migration files in `db/migrations/`
- `db:migrate` applies committed migrations
- `db:push` is for fast disposable environments, not your normal production path
- `db:seed` is blocked on production unless explicitly overridden

## Production Safety

These commands refuse to write to production unless you opt in:

- `bun run db:migrate`
- `bun run db:push`
- `bun run db:seed`

To override intentionally:

```bash
ALLOW_PROD_DB_WRITE=true bun run db:migrate
```

Use that only in controlled deploy steps.
