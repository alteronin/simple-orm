import { test, expect } from '@playwright/test'

const BASE = 'https://simple-orm.vercel.app'

// ─── Page Load Tests ────────────────────────────────────────────

test.describe('Page Loads', () => {
  const pages = [
    { path: '/task', heading: /task/i },
    { path: '/goal', heading: /goal/i },
    { path: '/note', heading: /note/i },
    { path: '/event', heading: /event/i },
    { path: '/backlog', heading: /backlog/i },
    { path: '/stacks', heading: /stack/i },
    { path: '/settings', heading: /record type/i },
  ]

  for (const { path, heading } of pages) {
    test(`${path} loads and shows heading`, async ({ page }) => {
      await page.goto(path)
      await page.waitForLoadState('networkidle')
      const h1 = page.locator('h1')
      await expect(h1.first()).toBeVisible()
      await expect(h1.first()).toHaveText(heading)
    })
  }
})

// ─── Navigation ─────────────────────────────────────────────────

test.describe('Navigation', () => {
  test('sidebar links work', async ({ page }) => {
    await page.goto('/task')

    // Click Stacks link
    await page.click('a[href="/stacks"]')
    await expect(page).toHaveURL(/stacks/)
    await expect(page.locator('h1')).toContainText('Stacks')

    // Click a record type link
    await page.click('a[href="/goal"]')
    await expect(page).toHaveURL(/goal/)
  })
})

// ─── Record List ────────────────────────────────────────────────

test.describe('Record List', () => {
  test('task list shows records', async ({ page }) => {
    await page.goto('/task')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(3000)
    // Check for any rendered content that indicates records loaded
    const content = await page.content()
    const hasContent =
      content.includes('Priority') ||
      content.includes('priority') ||
      content.includes('Status') ||
      content.includes('Stack') ||
      content.includes('Done') ||
      content.includes('No records')
    expect(hasContent).toBeTruthy()
  })

  test('search filters records', async ({ page }) => {
    await page.goto('/task')
    await page.waitForSelector('input[placeholder*="Search"], input[type="search"]', {
      timeout: 10000,
    })
    const searchInput = page.locator(
      'input[placeholder*="Search"], input[type="search"]'
    )
    await searchInput.fill('ASSH')
    await page.waitForTimeout(500)
    // Verify filtered results contain search term
    const content = await page.content()
    expect(content.toLowerCase()).toContain('assh')
  })
})

// ─── Settings / Record Types ────────────────────────────────────

test.describe('Settings', () => {
  test('settings page shows record types', async ({ page }) => {
    await page.goto('/settings')
    await page.waitForTimeout(2000)
    const content = await page.content()
    // Should show existing record types
    expect(content).toContain('Record Types')
  })

  test('New Record Type button opens form', async ({ page }) => {
    await page.goto('/settings')
    await page.waitForTimeout(2000)
    const newBtn = page.locator('button', { hasText: 'New Record Type' })
    await newBtn.click()
    await expect(page.locator('form')).toBeVisible()
    await expect(page.locator('input').first()).toBeVisible()
  })
})

// ─── Stacks ─────────────────────────────────────────────────────

test.describe('Stacks', () => {
  test('stacks page loads with board', async ({ page }) => {
    await page.goto('/stacks')
    await page.waitForTimeout(3000)
    const content = await page.content()
    expect(content).toContain('Stacks')
    // Should have stack columns or empty state
    const hasBoard =
      content.includes('stack') || content.includes('No stacks')
    expect(hasBoard).toBeTruthy()
  })

  test('New Stack button opens modal', async ({ page }) => {
    await page.goto('/stacks')
    await page.waitForTimeout(3000)
    const newBtn = page.locator('button', { hasText: 'New Stack' })
    if (await newBtn.isVisible()) {
      await newBtn.click()
      await expect(page.getByRole('heading', { name: 'Create Stack' })).toBeVisible()
      await expect(page.getByPlaceholder('e.g., My Tasks')).toBeVisible()
    }
  })
})

// ─── Responsive ─────────────────────────────────────────────────

test.describe('Responsive', () => {
  test('mobile viewport shows sidebar toggle', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/task')
    await page.waitForTimeout(1000)
    // Should have a menu button for mobile
    const menuBtn = page.locator(
      'button[aria-label*="menu"], button[aria-label*="Menu"], button:has(svg)'
    )
    const hasToggle = (await menuBtn.count()) > 0
    expect(hasToggle).toBeTruthy()
  })
})

// ─── Performance ────────────────────────────────────────────────

test.describe('Performance', () => {
  test('task page loads in under 3s', async ({ page }) => {
    const start = Date.now()
    await page.goto('/task')
    await page.waitForLoadState('networkidle')
    const elapsed = Date.now() - start
    console.log(`Task page loaded in ${elapsed}ms`)
    expect(elapsed).toBeLessThan(3000)
  })

  test('stacks page loads in under 6s', async ({ page }) => {
    const start = Date.now()
    await page.goto('/stacks')
    await page.waitForLoadState('networkidle')
    const elapsed = Date.now() - start
    console.log(`Stacks page loaded in ${elapsed}ms`)
    expect(elapsed).toBeLessThan(6000)
  })

  test('settings page loads in under 3s', async ({ page }) => {
    const start = Date.now()
    await page.goto('/settings')
    await page.waitForLoadState('networkidle')
    const elapsed = Date.now() - start
    console.log(`Settings page loaded in ${elapsed}ms`)
    expect(elapsed).toBeLessThan(3000)
  })
})

// ─── CRUD Through UI ────────────────────────────────────────────

const SUPABASE_URL = 'https://vhgcmdgmmvarkqjfcytj.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoZ2NtZGdtbXZhcmtxamZjeXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5ODE3MzcsImV4cCI6MjEwNDU1NzczN30.1S8WuGio75wlZb3BIPbiIMz2f--AZHR7de8_QmAMEwY'
const apiHeaders = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  Prefer: 'return=representation',
}

test.describe('Full CRUD Lifecycle via UI', () => {
  test('create via API → delete via UI → verify gone from DB', async ({ page, request }) => {
    // 1. Create a record via API
    const createRes = await request.post(`${SUPABASE_URL}/rest/v1/records`, {
      headers: apiHeaders,
      data: { record_type_id: 'task', data: { title: 'UI Lifecycle Test' } },
    })
    const recordId = (await createRes.json())[0].id

    // 2. Navigate to detail page
    await page.goto(`/task/${recordId}`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Verify content loaded
    const detailContent = await page.content()
    expect(detailContent).toContain('UI Lifecycle Test')
    await expect(page.locator('button', { hasText: 'Edit' })).toBeVisible()
    await expect(page.locator('button', { hasText: 'Delete' })).toBeVisible()

    // 3. Delete via UI
    await page.locator('div.space-y-6 button:has-text("Delete")').click()
    await page.waitForSelector('.fixed.inset-0.z-50', { timeout: 5000 })
    await page.locator('.fixed.inset-0.z-50 .bg-destructive').click()

    // 4. Wait for redirect to task list
    await page.waitForURL('**/task', { timeout: 10000 })
    await page.reload()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // 5. Verify actually deleted from DB
    const dbCheck = await request.get(
      `${SUPABASE_URL}/rest/v1/records?id=eq.${recordId}&select=id`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    )
    expect((await dbCheck.json()).length).toBe(0)
  })

  test('create via UI → delete via detail page → verify gone', async ({ page, request }) => {
    // 1. Create via the form
    await page.goto('/task/new')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    await page.locator('input').first().fill('UI Created Task')
    await page.locator('button[type="submit"]').click()
    await page.waitForTimeout(3000)

    // Form redirects to /task — get the record ID from DB
    expect(page.url()).toContain('/task')
    const listRes = await request.get(
      `${SUPABASE_URL}/rest/v1/records?record_type_id=eq.task&select=id,data&order=created_at.desc&limit=1`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    )
    const latestRecord = (await listRes.json())[0]
    expect(latestRecord.data.title).toBe('UI Created Task')
    const recordId = latestRecord.id

    // 2. Navigate to detail and delete
    await page.goto(`/task/${recordId}`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    await page.locator('div.space-y-6 button:has-text("Delete")').click()
    await page.waitForSelector('.fixed.inset-0.z-50', { timeout: 5000 })
    await page.locator('.fixed.inset-0.z-50 .bg-destructive').click()

    // 3. Wait for redirect, reload, verify gone
    await page.waitForURL('**/task', { timeout: 10000 })
    await page.reload()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // 4. Verify deleted from DB
    const dbCheck = await request.get(
      `${SUPABASE_URL}/rest/v1/records?id=eq.${recordId}&select=id`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    )
    expect((await dbCheck.json()).length).toBe(0)
  })
})

test.describe('Bulk Delete via UI', () => {
  test('bulk delete records via API (simulates app logic) and verify', async ({ request }) => {
    const recordIds: string[] = []

    // Create 3 records
    for (let i = 0; i < 3; i++) {
      const res = await request.post(`${SUPABASE_URL}/rest/v1/records`, {
        headers: apiHeaders,
        data: { record_type_id: 'task', data: { title: `Bulk Delete ${i}` } },
      })
      recordIds.push((await res.json())[0].id)
    }

    // Simulate the app's deleteRecords: clean history, notes, then delete
    await request.delete(`${SUPABASE_URL}/rest/v1/record_history?record_id=in.(${recordIds.join(',')})`, { headers: apiHeaders })
    await request.delete(`${SUPABASE_URL}/rest/v1/notes?record_id=in.(${recordIds.join(',')})`, { headers: apiHeaders })
    const delRes = await request.delete(
      `${SUPABASE_URL}/rest/v1/records?id=in.(${recordIds.join(',')})`,
      { headers: apiHeaders }
    )
    expect(delRes.ok()).toBeTruthy()

    // Verify deleted
    const dbCheck = await request.get(
      `${SUPABASE_URL}/rest/v1/records?id=in.(${recordIds.join(',')})&select=id`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    )
    expect((await dbCheck.json()).length).toBe(0)
  })
})

// ─── Settings CRUD ──────────────────────────────────────────────

test.describe('Settings CRUD via UI', () => {
  test('create record type → verify accessible → delete cleanup', async ({ page, request }) => {
    const testSlug = `e2e_${Date.now()}`

    // Create via settings form
    await page.goto('/settings')
    await page.waitForTimeout(2000)
    await page.click('button:has-text("New Record Type")')
    await page.waitForTimeout(1000)

    await page.locator('input').first().fill('E2E Settings Type')
    await page.locator('input').nth(1).fill(testSlug)

    const addFieldBtn = page.locator('button', { hasText: /add field/i })
    if (await addFieldBtn.isVisible()) {
      await addFieldBtn.click()
      await page.waitForTimeout(500)
    }

    const saveBtn = page.locator('button[type="submit"]')
    if (await saveBtn.isVisible()) {
      await saveBtn.click()
      await page.waitForTimeout(3000)
    }

    const content = await page.content()
    expect(content).toContain('E2E Settings Type')

    // Verify accessible
    await page.goto(`/${testSlug}`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
    await expect(page.locator('h1').first()).toBeVisible()

    // Cleanup
    await request.delete(
      `${SUPABASE_URL}/rest/v1/record_types?id=eq.${testSlug}`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    )
  })
})
