# Pilly site

Static Pilly marketing site built with Next.js, TypeScript, CSS Modules, and GSAP.
The landing page contains a hero, routine examples, interactive medicine identity
controls, and a closing early-access link. Privacy, terms, and support have their
own routes. Early access currently opens an email; there is no signup backend.

## Local setup

Use Node 24 LTS and Bun 1.4.0. With nvm installed, run `nvm install` and `nvm use`
from this directory. The repo records Node in `.nvmrc` and Bun in `package.json`.

```sh
bun install --frozen-lockfile
bunx playwright install chromium firefox webkit
bun run dev
```

No environment variables are required by the site's source code.

## Checks and preview

```sh
bun run verify
```

This checks formatting, lint, generated Next.js route types, TypeScript, the
production static export, and Playwright tests against that export. Browser
projects cover desktop Chromium, Firefox, and WebKit; iPhone and iPad WebKit;
Android-sized Chromium; and 320px touch Chromium.
Accessibility checks include reduced motion, 200% text reflow, and ordinary text
wrapping. Motion checks cover container/card scroll reversal, rotation, navigation
cleanup, and use without JavaScript. Startup checks delay JavaScript on initial
load and reload, checking hero visibility through hydration and stable layout.

```sh
bun run build
bun run preview
```

Preview runs at http://127.0.0.1:4173 and serves `out/` with clean URLs and real
404 responses, without an SPA fallback. `bun run test:e2e` requires a fresh build
and starts this preview automatically. To test an already-running deployment:

```sh
PLAYWRIGHT_BASE_URL=https://your-preview.vercel.app bun run test:e2e
```

The URL must be accessible to the browser; authenticated preview protection may
require a separate approved setup. Failure traces are saved under `test-results/`.
If WebKit is missing after a Playwright update, rerun the browser installation.
On Linux CI, install browsers with `bunx playwright install --with-deps chromium firefox webkit`.

## Agent and design guidance

Read [AGENTS.md](AGENTS.md) before editing. `CLAUDE.md` references that same guide.
It documents folder responsibilities, the existing design hierarchy, motion and
accessibility expectations, and the installed Next.js documentation requirement.

## One-time GitHub and Vercel setup

These are account settings, not enabled by adding local files:

1. Import `mattenarle10/pilly-site` into Vercel, or connect that repository to its
   existing project. Use repository root `.` and the **Next.js** framework preset.
2. Select **Node.js 24.x**, install command `bun install --frozen-lockfile`, build
   command `bun run build`, and output directory `out`. Keep Bun 1.4.0 consistent
   with `packageManager`. Preserve the static export configuration.
3. Set the production branch to `main`. Other branches produce previews.
4. Add `getpilly.app` to the intended project and follow Vercel's displayed DNS
   instructions. Verify domain ownership before changing DNS.
5. After the first CI run exposes **Verify site**, configure a GitHub branch rule
   for `main`: require a pull request, require that status check, require the
   branch to be up to date, and block force pushes/deletion. Do not bypass the rule.
   Required reviewer approvals are optional for this solo repo.

GitHub's repository visibility and plan determine which protection settings are
available. If the required rule cannot be enabled, the pre-merge gate is not
configured; resolve that before treating the release workflow as enforced.

See [Vercel's GitHub integration](https://vercel.com/docs/git/vercel-for-github)
and [GitHub branch protection](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches).

## Release workflow

1. Work on a feature branch and run `bun run verify`.
2. When Matt requests publishing, commit only the intended changes, push the
   feature branch, and open a pull request targeting `main`.
3. Check **Verify site** in GitHub Actions and review the Vercel preview on desktop
   and mobile. The workflow also validates pushes to `main`.
4. Merge the passing, reviewed pull request. Vercel automatically deploys `main`
   to production through its Git integration; no separate deploy action or token
   is needed in GitHub Actions.
5. Confirm the Vercel deployment is Ready and serves the merged commit. Check `/`,
   `/privacy`, `/terms`, `/support`, the favicon, sitemap, and an unknown route.

Vercel does not automatically wait for this GitHub workflow after a direct push
to `main`. Branch protection is the pre-merge gate. If production is broken,
restore the previous working deployment in Vercel, then prepare and verify a
revert or fix through the same pull-request process.

Do not commit, push, change account settings, or deploy without Matt's explicit
request. Local implementation and passing checks do not mean deployment is active.

## Motion and mobile Safari

The supported design target is iOS Safari 16.4+ and current desktop browsers.
Scroll-linked container and card transforms use the installed GSAP ScrollTrigger plugin;
there is no extra animation dependency. Desktop cards follow the horizontal
journey, while touch layouts keep native document/ribbon scrolling. Reduced
motion disables scroll transforms. The hero stays visible from first paint; an
inline script selects the desktop layout before hydration. Content remains visible
without JavaScript.

Browser emulation does not verify a particular released Safari/iOS version.
See [the device checklist](docs/mobile-checks.md) for real-device checks and
Safari Web Inspector performance review before claiming that coverage.
