# Product page motion regression

## User journey

As a visitor, I can drag or scroll directly to late sections of `/product` and see their content begin revealing as soon as the section enters the viewport.

## Evidence

| Guarantee | Test | Type | Result |
| --- | --- | --- | --- |
| “HOW WE WORK” reveals when scrolled into view | `tests/e2e/product-motion.spec.ts` | E2E, desktop and mobile | PASS |
| The final consultation CTA reveals when scrolled into view | `tests/e2e/product-motion.spec.ts` | E2E, desktop and mobile | PASS |
| Core responsive and interaction contracts remain intact | `npm run test:e2e` | E2E regression suite | 29 passed, 3 skipped |

## RED / GREEN

- RED: the desktop CTA remained at `opacity: 0` after entering the viewport; the targeted test failed.
- GREEN: after stabilizing section layout and initializing/refreshing ScrollTrigger earlier, the same desktop and mobile test passed.

## Additional validation

- `npm run typecheck`: 0 errors, 0 warnings, 0 hints.
- Manual Playwright checks at 1440px and 430px confirmed stable document height, no horizontal overflow, and complete process/CTA rendering.

## Coverage note

This is a browser timing and layout regression, so coverage is provided by focused E2E behavior rather than JavaScript line coverage.
