# Local security patch: http-cache-semantics 4.2.0-xyy.1

This package patches the exact `http-cache-semantics` 4.2.0 `index.js` whose
SHA-256 before modification was
`01b7d66c854b2fe53ac05c98feb6e0d64722ab8898a778e2d2426a8b468d178f`.
It can be independently reconstructed from the official npm tarball
`https://registry.npmjs.org/http-cache-semantics/-/http-cache-semantics-4.2.0.tgz`,
whose original lock integrity is
`sha512-dTxcvPXqPvXBQpq5dUr6mEMJX4oIEFv6bwom3FDwKRDsuIjjJGANqhBuoAn9c1RQJIdAKav33ED65E2ys+87QQ==`.
The immutable upstream snapshot is retained in
`output/security/xyy-20261004-01/sol/upstream-4.2.0/`; this package retains its
original BSD-2-Clause license alongside the patched source.

This is a local XYY-WEB patch, not an upstream or npm-published fix. It addresses
GHSA-ch52-4w7c-c8xp / CVE-2026-93748 while npm's latest published version remains
4.2.0. Remove the override only after an upstream release has been independently
reviewed and tested.

The patch adds `_isReusable()`, `_canUseStale()`, and wildcard-aware Vary handling,
then uses them from `evaluateRequest()`, `maxAge()`, `timeToLive()`,
`_useStaleIfError()`, `useStaleWhileRevalidate()`, and `revalidatedPolicy()`.
This makes direct hits, numeric/unbounded `max-stale`, stale-while-revalidate,
stale-if-error, error fallback, and TTL agree.

Shared responses cannot be reused when they have `Set-Cookie` without explicit
`public` or `immutable`, `proxy-revalidate`, `no-cache`, `no-store`, or `private`.
Authorization continues to follow the upstream `storable()` permission rules:
an Authorization-bearing request needs an existing explicit permission such as
`public`, `s-maxage`, or `must-revalidate`. Private caches retain their existing
cookie behavior. `must-revalidate` still allows fresh TTL but cannot extend stale
retention. Shared `s-maxage` retains fresh caching but cannot extend stale use.
`Vary: *` and comma lists containing a whitespace-padded `*` token cannot be
reused by shared or private caches. Failed revalidation only keeps a stale body
for a matching request that did not ask for `no-cache`.
Ordinary public caching, 304 revalidation, and serialization are kept.

`npm audit` does not scan a `file:` dependency against npm advisories. The security
claim for this local package therefore rests on the retained source hash, this
reviewable diff, and behavior tests, not on an audit result.

Upstream references reviewed for scope, not copied wholesale:

- https://github.com/kornelski/http-cache-semantics/pull/58
- https://github.com/kornelski/http-cache-semantics/pull/60
