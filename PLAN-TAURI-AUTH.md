# Plan: Tauri Port With GitHub Login

## Goal

Port `dlx_sv` from a web-only SvelteKit app to a Tauri desktop app with
GitHub login, following the same broad architecture already used in
`../lush-all`.

The target is not just "wrap the frontend in Tauri". This repo already
depends on server endpoints for:

- file save
- folder open
- TS scene MP4 render
- Python MP4 render
- MP4 status checks

That means the practical target is:

1. keep SvelteKit server capabilities
2. add a Tauri shell
3. add GitHub auth through WorkOS AuthKit
4. make the packaged app boot a local embedded app server so auth and
   existing server endpoints keep working

## Non-Goals

This plan does not yet implement:

- notebook persistence to GitHub
- collaborative sync
- a remote production auth backend
- automatic distribution of Node, ffmpeg, Playwright, or Manim
- a fully offline app

Those may become follow-up tracks after the first desktop-auth milestone.

## Why The `lush-all` Pattern Fits This Repo

First features of [lush-all](https://github.com/cognominal/lush-all) are intended to be retrofitted in `iLit`.

`dlx_sv` currently uses SvelteKit server routes such as:

- `app/src/routes/ts-scenes/[script]/[scene]/save-ts/+server.ts`
- `app/src/routes/ts-scenes/[script]/[scene]/open-folder/+server.ts`
- `app/src/routes/ts-scenes/[script]/[scene]/render-mp4/+server.ts`
- `app/src/routes/dlxn/render-py-mp4/+server.ts`

These routes assume a Node-capable server process with filesystem and
child-process access.

The `lush-all` Tauri auth build works by:

- building SvelteKit with `adapter-node`
- embedding that build inside the Tauri bundle
- launching a local server on `127.0.0.1`
- pointing the Tauri webview at that server

That same shape fits `dlx_sv` because it preserves both:

- existing route behavior
- OAuth callback endpoints required for GitHub login

## Current State Snapshot

### Web App

- Root scripts proxy into `app/`
- `app/` is a SvelteKit app
- `app/svelte.config.ts` currently uses `@sveltejs/adapter-vercel`
- there is no auth implementation
- there is no Tauri project

### Auth

- no login UI
- no session hook
- no GitHub OAuth flow
- no protected application actions

### Desktop

- no `src-tauri/`
- no Tauri build scripts
- no native menu integration
- no desktop packaging story

## Architecture Decision

Use the same first-pass architecture as `lush-all`:

1. `dlx_sv` keeps a SvelteKit server build for desktop mode
2. Tauri launches a local Node server in packaged builds
3. the app uses WorkOS AuthKit with GitHub as the initial OAuth provider
4. auth session state stays server-side in sealed HTTP-only cookies
5. Tauri login is initiated from app UI and optionally from a native menu

This is the fastest path because it reuses existing route assumptions.

## Constraints And Risks

## Constraint 1: Static Tauri Is Not Enough

A static frontend bundle cannot handle:

- `/login`
- `/auth/callback`
- `/logout`
- existing server endpoints that write files or spawn tools

Therefore a packaged Tauri build must include a local server or use a
remote backend. The local server is the short-term plan.

## Constraint 2: Runtime Tooling Dependencies

The current server routes assume local executables exist:

- `node`
- `open` on macOS
- `ffmpeg`
- `ffprobe`
- `manim`
- Playwright browser runtime

A first desktop milestone can document those as prerequisites instead of
solving bundling immediately.

## Constraint 3: Secret Handling

The `lush-all` local-server auth build copies a keys file into the app
bundle for local developer convenience. That is acceptable for local
developer builds but not for a broadly distributed public desktop app.

The first milestone may match that behavior for local builds only, while
explicitly documenting that a real distributable app should move auth
code exchange to a backend we control.

## Constraint 4: Cross-Platform Surface

The current repo already uses `open`, which is macOS-specific. A Tauri
port may initially target macOS only, then generalize.

## Work Phases

## Phase 0: Preflight Inventory And Branching

### Objective

Establish the exact baseline and isolate the work.

### Tasks

1. Create a branch with the required prefix:
   - `codex/tauri-auth`
2. Record current build behavior:
   - `bun run check`
   - `bun run build`
3. Inventory server endpoints that depend on Node APIs or external
   executables.
4. Inventory app entry points that should show auth state:
   - top navigation
   - notebook route
   - TS sweep editor routes
5. Confirm whether the initial Tauri target is:
   - macOS only
   - or cross-platform from the start

### Deliverables

- clean baseline validation
- written inventory of OS-specific and tool-specific assumptions

## Phase 1: Introduce Build Modes For Web And Desktop

### Objective

Stop treating the app as Vercel-only, while keeping the current web
deployment working.

### Tasks

1. Refactor `app/svelte.config.ts` to select adapter by environment.
2. Keep Vercel behavior as the default web mode.
3. Add a desktop/server mode using `@sveltejs/adapter-node`.
4. Define environment switches clearly, for example:
   - `TAURI=1`
   - `TAURI_SERVER=1`
5. Ensure `bun run build` still produces the current web output when no
   Tauri env vars are set.
6. Add any missing package dependencies needed for adapter-node.

### Likely Files

- `app/svelte.config.ts`
- `app/package.json`
- root `package.json`

### Validation

- web build still works
- server build produces a runnable Node bundle

## Phase 2: Add Tauri Project Skeleton

### Objective

Create the native wrapper and establish dev/build commands.

### Tasks

1. Add a Tauri project under a repo-local directory, likely:
   - `tauri-app/` or `tauri-svelte-app/`
2. Initialize:
   - `src-tauri/Cargo.toml`
   - `src-tauri/tauri.conf.json`
   - `src-tauri/src/main.rs`
   - optional `build.rs`
3. Configure the Tauri window:
   - title
   - dimensions
   - dev URL
   - packaged app URL behavior
4. Add root scripts mirroring the `lush-all` ergonomics:
   - `dev:tauri`
   - `build:tauri`
   - `build:tauri:auth`
5. Ensure Tauri dev mode points at the existing Svelte dev server.

### Design Notes

At this stage the app can launch as a desktop shell even before auth is
enabled.

### Validation

- `bun run dev` still works for web
- Tauri dev mode opens the app shell against local SvelteKit

## Phase 3: Port The WorkOS Auth Server Layer

### Objective

Bring the proven GitHub login flow from `lush-all` into this repo,
adapted to `dlx_sv` paths and types.

### Tasks

1. Add server-side WorkOS config loader.
2. Add cookie constants and auth-user mapping helpers.
3. Add PKCE helper utilities if not already present.
4. Add `hooks.server.ts` to:
   - read sealed session cookie
   - validate current session
   - populate `event.locals.user`
   - populate `event.locals.sessionId`
   - clear invalid cookies
5. Add `GET /login`.
6. Add `GET /auth/callback`.
7. Add `GET /logout`.
8. Add any auth-related shared types.

### Likely Files

- `app/src/lib/server/workos.ts`
- `app/src/lib/server/auth.ts`
- `app/src/lib/server/pkce.ts`
- `app/src/hooks.server.ts`
- `app/src/routes/login/+server.ts`
- `app/src/routes/auth/callback/+server.ts`
- `app/src/routes/logout/+server.ts`
- `app/src/lib/types/auth.ts`

### Environment / Secrets

Add support for a local ignored file such as `workos-keys.txt` with:

- `WORKOS_API_KEY`
- `WORKOS_CLIENT_ID`
- `WORKOS_REDIRECT_URI`
- `WORKOS_COOKIE_PASSWORD`

### Validation

- `/login` redirects correctly
- callback exchanges code and sets session cookie
- invalid session is cleared cleanly

## Phase 4: Expose Auth State To The UI

### Objective

Make login visible and usable from the current application shell.

### Tasks

1. Decide how client code reads auth state:
   - remote server function
   - page data
   - lightweight endpoint
2. Add a minimal authenticated-session API that returns:
   - `authenticated`
   - `email`
   - basic user fields if needed
3. Add sign-in / sign-out controls in the main layout.
4. Show current user state in the header.
5. Preserve current route when sending the user to login.
6. Ensure login UI still works in:
   - regular web mode
   - Tauri dev mode
   - packaged desktop mode

### Likely Files

- `app/src/routes/+layout.svelte`
- optional `app/src/routes/+layout.server.ts`
- optional `app/src/lib/remote/*.ts`

### UX Requirement

The first cut should be intentionally small:

- `Sign in with GitHub`
- user email when authenticated
- `Logout`

No broad account/settings surface is required yet.

## Phase 5: Define Which Actions Require Login

### Objective

Decide what login actually gates in `dlx_sv`.

### Rationale

Identity alone is not enough. We need a clear rule for which operations
need authentication.

### Initial Proposal

Require login only for notebook-oriented or GitHub-bound behavior once
that exists. Do not block purely local editing/rendering features yet.

That keeps the first migration focused on:

- desktop shell
- working login
- future-ready session model

### Tasks

1. Audit routes and actions that may later depend on GitHub identity.
2. Add server-side guards only where there is already a real reason.
3. Avoid forcing login for local scene editing unless the product
   decision is explicit.
4. Document unauthenticated vs authenticated capabilities.

### Deliverable

- a written auth boundary instead of ad hoc checks

## Phase 6: Add Native Tauri Menu And Login Trigger

### Objective

Match the `lush-all` pattern where desktop users can initiate login from
the native menu as well as from the page UI.

### Tasks

1. Add a Tauri menu in `src-tauri/src/main.rs`.
2. Add at least:
   - `About`
   - `Login`
3. Emit a window event when the menu action is used.
4. Handle that event in Svelte and open the login UI or redirect flow.

### Validation

- native menu click triggers login flow
- web app still works without native menu support

## Phase 7: Add The Embedded Local App Server For Packaged Auth

### Objective

Make packaged Tauri builds support:

- GitHub OAuth callback
- existing server routes

### Tasks

1. Add a build script equivalent to `lush-all/scripts/tauri-auth.ts`.
2. In that script:
   - build SvelteKit in adapter-node mode
   - copy the build output into Tauri resources
   - write a minimal `package.json` with `"type": "module"`
   - optionally copy `workos-keys.txt` for local developer builds
   - invoke `cargo tauri build`
3. In `main.rs`, on packaged startup:
   - locate bundled app-server resources
   - spawn `node index.js`
   - set `HOST` and `PORT`
   - override `WORKOS_REDIRECT_URI` for the local callback URL
   - wait briefly for the server to accept connections
   - navigate the Tauri webview to the local server URL
4. On app exit:
   - stop the spawned child process cleanly

### Likely Files

- `scripts/tauri-auth.ts`
- `src-tauri/src/main.rs`
- `src-tauri/gen/appserver/` at build time

### Important Security Note

If this phase copies secrets into the app bundle, mark the resulting
build as developer-only. Do not present it as a secure public
distribution story.

### Validation

- packaged app launches local server
- login flow works in packaged app
- save and render endpoints still function in packaged mode

## Phase 8: Reconcile Existing Server Routes With Desktop Runtime

### Objective

Make sure the routes that already rely on OS/local tooling behave
correctly under Tauri.

### Areas To Verify

1. Save TS source
2. Open output folder
3. Render TS MP4 via Playwright and ffmpeg
4. Render Python MP4 via Manim
5. Serve MP4 status endpoints

### Tasks

1. Confirm `process.cwd()` assumptions still resolve repo paths
   correctly in:
   - web dev
   - Tauri dev
   - packaged Tauri
2. If packaged mode changes resource layout, add explicit repo-root or
   workspace-root configuration.
3. Decide whether packaged mode is expected to operate against:
   - the checked-out repo on disk
   - or bundled read-only assets only
4. Adjust routes that currently assume direct repo writes if necessary.

### Critical Product Decision

If the desktop app is meant to edit a live checkout, the app needs a
stable concept of workspace root.

If it is meant to be a standalone viewer/editor without a checkout, many
current endpoints will need larger redesign and cannot simply be ported.

## Phase 9: Desktop Runtime Preconditions And Error UX

### Objective

Handle missing local prerequisites explicitly instead of failing with
opaque server errors.

### Tasks

1. Detect or document missing:
   - `node`
   - `ffmpeg`
   - `ffprobe`
   - `manim`
   - Playwright browser runtime
2. Improve endpoint errors so the UI can surface actionable messages.
3. Add a desktop diagnostics section or modal that reports missing tools.
4. Decide whether `open-folder` should remain shell-based or move to a
   Tauri-native command later.

### Deliverable

- predictable user-facing errors for missing dependencies

## Phase 10: Auth-Ready Notebook Foundation

### Objective

Prepare for the repo's stated next step: notebook storage on GitHub.

### Tasks

1. Define the minimal post-login user model needed by notebook features.
2. Decide whether GitHub auth is initially:
   - identity only
   - or identity plus API access
3. If GitHub API access is required later, document the next WorkOS step:
   - request GitHub scopes
   - store server-side tokens safely
4. Add a follow-up design note for mapping authenticated users to
   notebook ownership and repo access.

### Deliverable

- auth model ready for later notebook work

## Detailed File Plan

## Root

- add `PLAN-TAURI-AUTH.md`
- update root `package.json` with Tauri scripts
- add ignored secrets/config entries if needed
- add desktop/auth docs to `README.md`

## App Build Layer

- update `app/svelte.config.ts`
- update `app/package.json`

## App Auth Layer

- add `app/src/hooks.server.ts`
- add `app/src/lib/server/workos.ts`
- add `app/src/lib/server/auth.ts`
- add `app/src/lib/server/pkce.ts`
- add `app/src/lib/types/auth.ts`
- add login/callback/logout routes

## App UI Layer

- update `app/src/routes/+layout.svelte`
- possibly add session data loaders or remote functions

## Native Layer

- add `src-tauri/` project
- add native menu
- add local app-server boot logic

## Build Scripts

- add `scripts/tauri.ts`
- add `scripts/tauri-auth.ts`

## Validation Plan

## Phase Validation Commands

After any Svelte or TS changes:

- `bun run check`

After build-system changes:

- `bun run build`

After Tauri integration:

- `bun run dev:tauri`
- `bun run build:tauri`
- `bun run build:tauri:auth`

If Playwright tests remain valid:

- `bun run test:e2e`

## Auth Flow Validation Matrix

### Web Dev

1. Start SvelteKit dev server.
2. Click sign-in.
3. Complete GitHub login through WorkOS.
4. Verify user appears as authenticated.
5. Verify logout clears session.

### Tauri Dev

1. Start Tauri against local SvelteKit dev server.
2. Trigger login from page UI.
3. Trigger login from native menu.
4. Verify callback returns to app and session is visible.

### Tauri Packaged

1. Build packaged auth variant.
2. Launch app.
3. Verify local app server starts.
4. Complete login.
5. Verify session survives route navigation.
6. Verify local server stops on app exit.

## Open Questions

These should be resolved early because they affect scope.

1. Is the first desktop target macOS only?
2. Is the desktop app expected to edit the live repo checkout on disk?
3. Is the first GitHub login milestone identity only, or does it need
   GitHub API scopes immediately?
4. Is bundling secrets into a local developer build acceptable for the
   first milestone?
5. Do we want packaged builds to require a preinstalled Node runtime, as
   in `lush-all`, or should a later phase remove that dependency?

## Recommended Execution Order

1. Phase 1: build-mode split
2. Phase 2: Tauri shell
3. Phase 3: WorkOS auth server layer
4. Phase 4: auth UI
5. Phase 6: native menu login trigger
6. Phase 7: packaged local app server
7. Phase 8: route/runtime reconciliation
8. Phase 9: dependency diagnostics
9. Phase 10: notebook-oriented follow-up design

## First Milestone Definition

The first milestone is complete when all of the following are true:

- web build still works as it does today
- Tauri dev mode opens the app successfully
- user can sign in with GitHub
- authenticated session is visible in the app UI
- packaged Tauri auth build can complete OAuth through a local callback
- existing save/render server routes still work in the desktop runtime,
  or any temporary unsupported routes are explicitly documented

## Follow-Up After First Milestone

After the first milestone, the next architectural step should likely be
one of:

1. move auth callback/session handling to a remote backend for a
   distributable desktop app
2. define GitHub-backed notebook persistence
3. replace some Node/server routes with native Tauri commands where that
   improves packaging or cross-platform behavior
