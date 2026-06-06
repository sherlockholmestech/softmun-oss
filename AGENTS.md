# Repository Guidelines

## Project Structure & Module Organization

SoftMUN is a Nuxt 4 + Bun application for Model UN committee management. Client pages, components, assets, and global Vue `ref` utilities live in `app/`; Nitro API routes and server helpers live in `server/`; shared constants and types live in `shared/`. Drizzle schema is in `server/utils/schema.ts`, generated migrations are in `db/migrations/`, custom database scripts are in `scripts/`, and characterization tests are in `tests/`.

## Build, Test, and Development Commands

Use Bun as the primary package manager; `bun.lock` is authoritative.

```bash
bun install                                      # install dependencies
bun run dev                                     # start local Nuxt dev server
bun run build                                   # create production build
bun test                                        # run Bun tests in tests/
bun run lint                                    # run ESLint
bun run format                                  # check Prettier formatting
./node_modules/.bin/tsc --noEmit -p tsconfig.json # typecheck
```

Database commands include `bun run db:generate`, `bun run db:migrate`, `bun run db:push`, `bun run db:seed`, and `bun run db:studio`. Production writes are guarded unless `ALLOW_PROD_DB_WRITE=true` is set.

## Coding Style & Naming Conventions

Prettier uses tabs (`useTabs: true`, `tabWidth: 2`); keep formatting automated with `bun run format:fix` when needed. Follow existing Vue/Nuxt naming: page files are route-oriented (`app/pages/index.vue`), components use PascalCase, and shared client state utilities live in `app/utils/*.ts`. Prefer existing auto-imported composables and project utilities before adding new dependencies.

## Testing Guidelines

Tests use Bun’s test runner and are currently organized under `tests/characterization/*.test.ts`. Add regression or characterization coverage near related files when behavior changes. Before handing off, run `bun test`, `bun run lint`, and `./node_modules/.bin/tsc --noEmit -p tsconfig.json`; run `bun run build` for deployment-sensitive changes.

## Commit & Pull Request Guidelines

Recent history uses concise Conventional Commit-style messages such as `feat: update homepage look` and `fix: sync status corner`. Keep commits focused and describe the user-visible reason for the change. Pull requests should include a short summary, validation commands run, linked issues when applicable, and screenshots for UI changes.

## Security & Configuration Tips

Copy `.env.local.example` to `.env.local` and use a non-production Neon branch for local work. Database schema changes require generating and committing migrations before applying them.
