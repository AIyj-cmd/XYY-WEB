# XYY-20260927-05 — 浏览器语言切换提示

## Contract

- Risk: MEDIUM. User requested an Apple-like browser-language suggestion after the English site implementation. Authorized scope is local UI implementation and testing. No commit, push, deployment, CMS/database/lead write or production/config/permission changes.
- Baseline HEAD: `4a5bb2a3b8aff7bde49a9b6024222ebba0584502`. The completed English site and all existing dirty documents/config/assets are protected. Current 1319-path hashes, status and relevant pre-task files are in `output/language-suggestion/xyy-20260927-05/`.
- Scope: a non-modal, dismissible English-language suggestion on Chinese pages, browser preference detection, remembering explicit choices, and integration with the existing manual language switch.
- Exclusions: automatic redirects, IP/geolocation, server-side locale negotiation, CMS/API/SEO changes, third-party tracking, dependencies, broader navigation redesign or additional translations.

## Behavior and presentation

- Use browser `navigator.languages`, falling back to `navigator.language` when necessary. Match the first supported English/Chinese language in preference order. English ahead of Chinese shows the prompt on a Chinese page only; Chinese-first and unsupported-only preferences do not.
- Show a restrained light strip above the existing navigation: “Prefer English?” with a clear English action, a keep-Chinese action, and an accessible close control. Do not steal focus or block the page. At mobile widths it may wrap into two rows.
- Reuse `englishPathFor` and the existing route-pair registry. Paired pages offer the corresponding English page. Unpaired pages explicitly offer the English homepage, without suggesting an English article exists.
- Default markup is hidden. No JavaScript means no language prompt and the existing language link remains functional. Detect only in the browser; unchanged server HTML lang/canonical/hreflang and URLs.
- Persist only an explicit language choice locally: prompt accept → en; keep/close → zh-CN; existing manual switch → its target language. A valid saved choice suppresses later automatic suggestions, without rewriting URLs. Handle unavailable storage without breaking dismissal or navigation; session storage may be used when local storage is unavailable. No locale inference is saved as an explicit choice.
- The strip is in normal document flow and scrolls away. Offset the fixed header by the still-visible height of the strip, responding to resize/scroll and dismissal. Avoid overlapping banner/header/content; keep header behavior unchanged when no prompt is visible.
- Keyboard controls are operable, focus visibly styled; dismissal while focus is inside the strip restores focus to the existing language switch. Escape is handled within the strip only.

## Ownership and sequence

1. Terra: `src/components/Header.astro`, `src/styles/header-responsive.css`; new `src/components/navigation/LanguageSuggestion.astro`, `src/styles/language-suggestion.css`, `src/scripts/language-suggestion.ts`, `src/i18n/language-preference.ts`; meaningful preference unit tests; append `docs/TERRA.md`; own task evidence. No other files without returning to Sol.
2. Luna: independent validation after implementation freeze; owns new `tests/e2e/language-suggestion*.spec.ts`, own evidence and append-only `docs/LUNA.md`. No application edits, no changes to existing tests/config. Check project line budgets when splitting tests.
3. Nova: independent architecture/scope/security/behavior/test review after Luna PASS; owns own review evidence and append-only `docs/NOVA.md`.
4. Sol: this plan, baseline/freeze/acceptance evidence, `docs/SOL.md` and `DEV_STATE.md`.

All agents preserve existing changes, do not delegate, and return failures to Sol. Fixes and retests keep this Task ID. Only one application writer is active.

## Acceptance criteria

1. Fresh English-preference browser on a Chinese route sees the prompt and is never redirected until choosing its English link. Chinese-first/unsupported-only preferences, English routes and saved choices do not show it. Test preference order and language fallback.
2. Accept navigates to the correct existing English counterpart; unpaired routes explicitly link English home. Dismiss/stay/accept and manual switches persist the choice; reload/next page does not repeat the prompt. Malformed storage and denied storage are safe. No-JS retains the original link and hides the prompt.
3. At 1440/768/390/360 the strip, controls, fixed header and main heading are readable and do not intersect or overflow. Scrolling the strip away restores the normal header position; dismissing and resizing updates the offset. Verify keyboard focus and English/Chinese representative pages.
4. Existing route/SEO/manual-switch behavior, page content/media and Chinese defaults remain compatible. No CMS/lead calls are added. Relevant unit tests, focused existing routes/returns regression, new browser tests, type/lint/build/maintainability and a fresh offline `npm run verify` pass.
5. All task deltas are attributable, protected baseline content remains intact, Luna PASS and Nova APPROVED precede Sol acceptance. Local-only delivery; no release actions.

## Validation environment

Explicit offline/fake dependencies for every build/server/test: `DIRECTUS_URL=http://127.0.0.1:1`, `PUBLIC_DIRECTUS_URL=http://127.0.0.1:1`, `DIRECTUS_CONTENT_TOKEN=local-offline`, `XIANSUO_API_URL=http://127.0.0.1:1`, `XIANSUO_INGEST_TOKEN=fake-local`, `ENABLE_DOMAIN_REDIRECTS=false`, `PUBLIC_SITE_URL=http://127.0.0.1:4526`, `HOST=127.0.0.1`, `PORT=4526`; browser `PLAYWRIGHT_PORT=4526`. Do not read real .env contents or access live CMS/lead/database systems. Leave existing 4321/4322/4524 previews alone.

## Inputs

- Existing Header/Layout, locale route map and responsive header styles. Graphify read-only query locates shared layout relationships; current source is authoritative because the graph predates English implementation.
- Browser preference API reference: [MDN Navigator.languages](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/languages). Storage failure behavior: [MDN localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage).

## Status

CLOSED — local implementation accepted. Final freeze contains 7 application/unit-test paths and 2 independent browser-test paths (9/9); the 7 implementation paths remained unchanged throughout QA. All 1313 baseline protection paths and original role-log content are preserved, with only this task's DEV_STATE block excluded from its original-content comparison.

Luna PASS: fresh full verify (516 typecheck files, zero diagnostics, 82 unit files/537 tests, lint/684-file budgets/assets/build); browser regression 31 passed/1 existing design skip; explicit English-accept persistence probe 2/2. Four-width and representative-page layout checks, keyboard/storage/no-JS behavior, scroll/resize offsets and final readable screenshots passed. Two test-authoring type errors were fixed before the passing verify. Early Home animation frames were excluded; final images wait for animated descendants to become readable.

Nova APPROVED; Sol reviewed final source/test hashes, protection, desktop/mobile screenshots, and the final local preview. Preview: `http://127.0.0.1:4526/`, explicit offline/fake dependencies. No commit, push, deployment or real CMS/database/lead write. HEAD remains `4a5bb2a3b8aff7bde49a9b6024222ebba0584502`. Validation is local Chromium with simulated mobile viewports; no real devices, Firefox/Safari, live dependencies or release gate.

Evidence: `output/language-suggestion/xyy-20260927-05/sol-final-acceptance.json`, `luna/verification-result.md`, `nova/review.md`, and `sol-screenshots/`.
