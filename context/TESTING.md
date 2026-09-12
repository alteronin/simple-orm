# Testing & Metrics

## Current Bucket
**Bucket 5: Performance & Data Efficiency** — COMPLETE
- B5-1: Server-side pagination ✅
- B5-2: Eliminate N+1 link badge queries ✅
- B5-3: Push stack filters to DB level ✅
- B5-4: Batch stack card reorder updates ✅
- B5-5: Optimize StackBoard re-render ✅

---

## How to Run

```bash
npm test              # all 41 tests (API + E2E + Performance)
npm run test:api      # API tests only (20)
npm run test:e2e      # Browser E2E only (18)
npm run test:perf     # Performance audits only (3)
npm run test:report   # open HTML report
```

Results saved to `tests/results.json` after each run.

---

## Test Suite Structure

### API Tests (`tests/api.spec.ts`) — 20 tests
| Category | Tests | What it checks |
|----------|-------|----------------|
| Record Type CRUD | 4 | create, read, update, delete |
| Record CRUD | 4 | create, read, update, delete |
| Stack CRUD + Filters | 4 | create with filter, read, update filter, cascade delete |
| Reserved Slug Validation | 5 | blocks settings/stacks/api/new/edit |
| Performance (DB) | 3 | 100 records <2s, record_types <500ms, stacks+cards <1s |

### E2E Browser Tests (`tests/e2e.spec.ts`) — 18 tests
| Category | Tests | What it checks |
|----------|-------|----------------|
| Page Loads | 7 | All pages load with correct h1 heading |
| Navigation | 1 | Sidebar links navigate correctly |
| Record List | 2 | Records render, search filters |
| Settings | 2 | Record types list, New Record Type form opens |
| Stacks | 2 | Board renders, New Stack modal opens |
| Responsive | 1 | Mobile viewport shows sidebar toggle |
| Performance (pages) | 3 | Task <3s, Stacks <4s, Settings <3s |

### Performance Audits (`tests/lighthouse.spec.ts`) — 3 tests
| Page | Metrics collected |
|------|-------------------|
| /task | DNS, TCP, TTFB, FP, FCP, DOM Ready, Load, Resources, Transfer Size |
| /stacks | same |
| /settings | same |

---

## Baseline Metrics (2026-09-11, Post Quick-Wins)

### Database Performance
| Query | Time | Threshold |
|-------|------|-----------|
| Read 100 records | 284ms | <2s ✅ |
| Read record_types | 391ms | <500ms ✅ |
| Read stacks + cards | 494ms | <1s ✅ |

### Page Load (Warm)
| Page | TTFB | FCP | Load | Transfer Size |
|------|------|-----|------|---------------|
| /task | 36ms | 2832ms | 3470ms | 223.4KB |
| /stacks | 35ms | 500ms | 530ms | 229.6KB |
| /settings | 36ms | 452ms | 491ms | 215.2KB |

### API Response Times (per operation)
| Operation | Avg Time |
|-----------|----------|
| Create record type | ~470ms |
| Read record type | ~340ms |
| Update record type | ~340ms |
| Delete record type | ~350ms |
| Create record | ~350ms |
| Read record | ~300ms |
| Update record | ~270ms |
| Delete record | ~340ms |
| Create stack with filter | ~350ms |
| Read stack with filters | ~340ms |
| Cascade delete stack + cards | ~1.4s |

---

## Post-Bucket Checklist

After every bucket, run this checklist:

### 1. Run Full Test Suite
```bash
npm test
```
- [ ] All existing tests still pass (no regressions)
- [ ] New features have corresponding tests added

### 2. Check Performance Metrics
```bash
npm run test:perf
```
Compare against baseline:
- [ ] TTFB within ±10ms of baseline
- [ ] FCP within ±200ms of baseline
- [ ] Transfer Size within ±20KB of baseline
- [ ] No new page exceeds thresholds (task <3s, stacks <4s, settings <3s)

### 3. Check DB Query Performance
```bash
npm run test:api
```
- [ ] 100 records read <2s
- [ ] record_types read <500ms
- [ ] stacks + cards read <1s

### 4. Manual Spot Check
- [ ] All pages load in browser
- [ ] No console errors
- [ ] No broken UI elements
- [ ] Toasts fire correctly

### 5. Update This Document
- [ ] Add new metrics to baseline section
- [ ] Update test counts if new tests added
- [ ] Note any new thresholds or regressions

---

## Known Performance Bottlenecks (Fixed)

| # | Issue | Impact | Status |
|---|-------|--------|--------|
| 1.3 | No server-side pagination | HIGH | ✅ B5-1: .range() + count |
| 2.1 | LinkedRecordBadge N+1 queries | HIGH | ✅ B5-2: Batch prefetch |
| 3.6 | populateStackFromType filters in JS | MEDIUM | ✅ B5-3: DB-level filters |
| 3.3 | reorderStackCards N individual updates | MEDIUM | ✅ B5-4: Batch upsert |
| 2.4 | JSON.stringify on every render (StackBoard) | MEDIUM | ✅ B5-5: useMemo + ref |

---

## Regression History

| Date | Change | Metrics Impact | Notes |
|------|--------|----------------|-------|
| 2026-09-11 | Bucket 5: Server-side pagination | Page loads now bounded | .range() fetches only 10 records |
| 2026-09-11 | Bucket 5: Batch link prefetch | N*2 → 2 queries | 2 queries vs hundreds |
| 2026-09-11 | Bucket 5: DB-level stack filters | Filters executed in Postgres | No more JS filtering |
| 2026-09-11 | Bucket 5: Batch reorder upsert | N → 1 HTTP request | Single upsert call |
| 2026-09-11 | Bucket 5: StackBoard useMemo | Eliminated JSON.stringify | String comparison + ref |
| 2026-09-11 | Removed broken noStoreFetch | None (was no-op) | Caching config was doing nothing |
| 2026-09-11 | Added column pruning | Reduced transfer ~5KB | All queries now use targeted select() |
| 2026-09-11 | Parallelized detail page | Halved detail page latency | Promise.all for type + record |
| 2026-09-11 | Deduplicated stacks fetch | Reduced one redundant query | record_types fetched once |
