# Bucket 5: Performance & Data Efficiency

## Objective
Eliminate the remaining high-impact performance bottlenecks identified in the analysis: unbounded data fetching, N+1 query patterns, in-JS filtering, and per-card update storms.

## Prerequisites
- B1-B4 complete and deployed
- Playwright test suite in place (41 tests passing)
- Supabase connected and operational

---

## B5-1: Server-Side Pagination

**Problem:** `getRecordsByTypeId` does `select('*')` with no `.range()`. Every record of a type is loaded into memory and sent to the client, even though the UI shows 10 at a time. With 114 tasks, all 114 are transferred on every page load.

**Solution:**
- Add `.range(offset, offset + limit - 1)` to `getRecordsByTypeId`
- Return `{ records: AppRecord[], total: number }` from the query
- Update `[slug]/page.tsx` to pass pagination params from searchParams
- Keep client-side pagination UI (already works), but data is now bounded

**Files:**
- `src/lib/record-operations.ts` — add pagination params
- `src/app/[slug]/page.tsx` — read searchParams, pass to query
- `src/components/RecordList.tsx` — adapt to server-paginated data

**UAC:**
1. Record list page loads <500ms regardless of total record count
2. Page 1 shows first 10 records
3. Clicking page 2 loads next 10 (full page reload, not client-side)
4. Search still works (client-side filter on current page)
5. Total record count displayed correctly
6. URL reflects page: `/task?page=2`

---

## B5-2: Eliminate N+1 Link Badge Queries

**Problem:** `LinkedRecordBadge` (RecordList.tsx:282-311) fires 2 Supabase queries per link field per record. 100 records × 3 link fields = **600 client-side queries** just to render badges.

**Solution:**
- Before rendering the list, collect all `{ recordId, targetType }` pairs from link fields
- Batch-fetch all linked records in 1-2 queries (one for record_types, one for records)
- Pass a `Map<recordId, { record, recordType }>` to each LinkedRecordBadge
- Badge becomes a pure lookup component (no fetching)

**Files:**
- `src/components/RecordList.tsx` — prefetch logic + pass map
- `src/components/LinkedRecordBadge.tsx` — accept prefetched data, remove fetch logic

**UAC:**
1. Record list with link fields loads in <1s (down from 5-10s)
2. Linked badges display correctly (name, type)
3. No console network flood (should see 2-3 batch requests, not hundreds)
4. Empty link fields handled gracefully
5. Loading state shows while prefetching

---

## B5-3: Push Stack Filters to Database

**Problem:** `populateStackFromType` fetches ALL records of a type into memory, then filters in JavaScript. For types with thousands of records, this is slow and memory-intensive.

**Solution:**
- Build the filter criteria into the Supabase query using `.or()` or chained `.eq()` filters
- Only fetch records that match the criteria AND are not already in the stack
- Use a subquery or two-step approach: first get existing card IDs, then query records with filters + `.not('id', 'in', existingIds)`

**Files:**
- `src/lib/actions.ts` — rewrite `populateStackFromType` to build DB-level filters

**UAC:**
1. Populate stack with 1 filter completes in <500ms
2. Populate stack with 3 filters (AND logic) works correctly
3. Dedup still works (existing cards not re-added)
4. Empty filter = all records (no change in behavior)
5. Large record sets (500+) don't cause timeouts

---

## B5-4: Batch Stack Card Updates

**Problem:** `reorderStackCards` creates N individual `supabase.from('stack_cards').update(...)` calls via `Promise.all`. For 20 cards, this fires 20 HTTP requests.

**Solution:**
- Use a single Supabase RPC call or a batch update approach
- Option A: Single RPC `reorder_stack_cards(stack_id, card_ids[])` that does the update in Postgres
- Option B: Use Supabase's `.upsert()` with a batch payload
- Option C: Raw SQL via `supabase.rpc()` for maximum efficiency

**Files:**
- `src/lib/actions.ts` — rewrite `reorderStackCards`
- `docs/006-reorder-rpc.sql` — migration for RPC function (if Option A)

**UAC:**
1. Reorder 20 cards completes in <500ms (currently ~1-2s)
2. Card order persists after page reload
3. No position conflicts or gaps
4. Works for both single-stack reorder and cross-stack moves
5. Optimistic UI still works (local state updates instantly)

---

## B5-5: Optimize StackBoard Re-render

**Problem:** `StackBoard.tsx:39` runs `JSON.stringify(stacks.map(s => s.id)) !== JSON.stringify(localStacks.map(s => s.id))` on every render, serializing the full stacks array twice.

**Solution:**
- Replace with `useMemo` to memoize the serialized ID list
- Or use a ref to track the previous stacks reference and compare by reference
- Or use a simple array equality check function

**Files:**
- `src/components/StackBoard.tsx` — fix the comparison logic

**UAC:**
1. Stack board renders in <100ms after state change
2. No unnecessary re-renders (verify with React DevTools)
3. Drag-and-drop still works correctly
4. Stack add/delete/populate still triggers correct updates

---

## Test Plan

After implementation:
1. Run full Playwright suite: `npm test` (all 41 existing + new tests)
2. Add performance-specific tests for each UAC
3. Compare before/after metrics:
   - Record list page load time
   - Network request count on record list
   - Stack populate time with filters
   - Stack reorder time
4. Deploy to production and verify

## Estimated Effort
| Item | Effort | Impact |
|------|--------|--------|
| B5-1: Server pagination | 1-2 hours | HIGH |
| B5-2: N+1 link badges | 1-2 hours | HIGH |
| B5-3: DB-level filters | 1 hour | MEDIUM |
| B5-4: Batch reorder | 1 hour | MEDIUM |
| B5-5: StackBoard render | 30 min | LOW |
| **Total** | **5-7 hours** | |
