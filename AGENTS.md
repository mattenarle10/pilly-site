# Pilly site agent guide

## Working agreement

- Read this file and inspect `git status --short` before editing. Preserve user work.
- Keep changes scoped, explain the edit briefly, then verify it.
- Read the installed Next.js docs referenced below before changing framework code.
- Never read secret-bearing files or commit credentials, caches, or build output.
- Commit, push, change hosting settings, or deploy only when Matt explicitly asks.
- Use additional skills only when the task needs them; this repo needs no extra plugins.

## Stack and structure

Static marketing site: Next.js App Router, React, TypeScript, CSS Modules, GSAP,
Bun 1.4.0, and Node 24 LTS. Keep `output: 'export'`; no server-only features.

- `src/app`: routes, global tokens, metadata, and sitemap.
- `src/components/landing`: hero, routine, identity controls, closing, and journey motion.
- `src/components/layout`, `legal`, and `actions`: shared page chrome and links.
- `src/graphics`: existing code-native medicine illustrations.
- `src/config`: public site details. `src/motion`: shared GSAP motion tokens.
- `tests`: Playwright interaction, route, accessibility, and export checks.

## Design conventions

- Preserve the hero -> routine -> identity -> closing hierarchy and one h1 per page.
- Reuse global color tokens, CSS Modules, existing icons, and medicine illustrations.
- Keep touch controls at least 44 CSS pixels and visible keyboard focus.
- Desktop supports horizontal travel; touch and reduced-motion views stay vertical.
- Review desktop, iPhone, and 320px layouts for clipping, reflow, and legal-page scrolling.
- Early access intentionally opens email; do not invent a signup backend or change legal claims.
- Fix confirmed defects without unrelated redesigns or abstractions.

## Commands and validation

Use Node 24 (`.nvmrc`) and Bun 1.4.0 (`packageManager`).

- Install: `bun install --frozen-lockfile`.
- Browser setup: `bunx playwright install chromium webkit` (CI also needs `--with-deps`).
- Develop: `bun run dev`.
- Full check: `bun run verify` (format, lint, generated route types, TypeScript, export, browsers).
- Preview: `bun run build && bun run preview` at http://127.0.0.1:4173.
- Browser-only check: `bun run test:e2e` after building. Tests serve `out/`, not `next dev`.
- `PLAYWRIGHT_BASE_URL` can target an existing server instead of starting the local preview.

Add regression tests for meaningful behavior changes. Never weaken checks to hide failures.
Report failed or blocked checks accurately. Keep screenshots and traces in ignored `test-results/`.

## Release workflow

Feature branch -> passing CI and reviewed preview -> merge to main -> Vercel production deployment.
The README owns the one-time hosting and branch-protection setup. CI validates; Vercel deploys.
A local workflow file does not activate hosting or protect main. Report external setup separately.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
