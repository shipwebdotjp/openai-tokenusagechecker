# Repository Guidelines

## Project Structure & Module Organization
The CLI entrypoint lives in `bin/cli.js` and forwards to modules in `src/`, where configuration (`config.js`, `configLoader.js`), usage retrieval (`usageClient.js`), aggregation, evaluation, and notification live. Shared assets and reference documents are under `doc/`, while sample configuration defaults are in `config.sample.yml` (copy to `config.yml` for local runs). Tests reside in `test/`, mirroring the CLI surface; keep helper fixtures close to the consuming test.

## Build, Test, and Development Commands
Run `npm install` once to sync dependencies. Execute `npm start` (or `node src/index.js`) to invoke the CLI locally with your current working directory. Use `npm test` for the headless Vitest suite; add `npx vitest --watch` when iterating. There is no separate build pipeline (`npm run build` is a stub), so package publishing pulls straight from `src/` and `bin/`.

## Coding Style & Naming Conventions
Target Node.js 16+ and ES modules (`import`/`export`). Follow the existing 2-space indentation, trailing semicolons, and single quotes unless interpolation is needed. Name files with camelCase (`usageClient.js`) and constants in SCREAMING_SNAKE_CASE (see `GROUP_1M`). Prefer small pure functions and async/await over promise chains. Update `config.js` when introducing new tiers or limits to keep policies centralized.

## Testing Guidelines
Vitest drives the suite; co-locate new specs in `test/` using `*.test.js`. Stub network calls with `vi.mock` as shown in `test/index.test.js:1` to keep runs deterministic. Extend the critical-path scenarios (success, alerts, failure) before shipping features. Optional `npx vitest run --coverage` helps track regressions; aim to cover new branches that impact the CLI exit codes.

## Commit & Pull Request Guidelines
Write imperative, concise commits; conventional prefixes (`feat:`, `fix:`) are encouraged and align with recent history (`1a1f61e feat: Make project argument optional`). Reference issue IDs where applicable and note any config changes. Pull requests should summarize behavior, list test commands executed, and attach CLI output or screenshots when surfacing new warning states. Confirm secrets remain out of tracked files before requesting review.

## Configuration & Secrets
Use `config.sample.yml` as the baseline, copy to `config.yml`, and never commit real keys. For quick checks, export `OPENAI_ADMIN_KEY` in your shell or store it in `.env`, then rely on `dotenv`. Keep SMTP credentials scoped to testing sandboxes, and rotate admin keys if they were ever exposed in logs or crash dumps.
