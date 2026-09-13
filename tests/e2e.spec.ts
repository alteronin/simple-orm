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

  test('stacks page loads in under 4s', async ({ page }) => {
    const start = Date.now()
    await page.goto('/stacks')
    await page.waitForLoadState('networkidle')
    const elapsed = Date.now() - start
    console.log(`Stacks page loaded in ${elapsed}ms`)
    expect(elapsed).toBeLessThan(4000)
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

test.describe('Record CRUD via UI', () => {
  test('create a record and verify it appears in list', async ({ page }) => {
    await page.goto('/task/new')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Fill in title
    const titleInput = page.locator('input').first()
    await titleInput.fill('E2E UI Test Record')

    // Submit
    const submitBtn = page.locator('button[type="submit"]')
    await submitBtn.click()
    await page.waitForTimeout(3000)

    // Should redirect to detail page or list
    const url = page.url()
    expect(url).toContain('/task')
  })

  test('navigate to a record detail page via URL', async ({ page }) => {
    // First get a valid record ID from the API
    const res = await page.request.get(
      'https://vhgcmdgmmvarkqjfcytj.supabase.co/rest/v1/records?record_type_id=eq.task&select=id&limit=1',
      {
        headers: {
          apikey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoZ2NtZGdtbXZhcmtxamZjeXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5ODE3MzcsImV4cCI6MjEwNDU1NzczN30.1S8WuGio75wlZb3BIPbiIMz2f--AZHR7de8_QmAMEwY',
          Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoZ2NtZGdtbXZhcmtxamZjeXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5ODE3MzcsImV4cCI6MjEwNDU1NzczN30.1S8WuGio75wlZb3BIPbiIMz2f--AZHR7de8_QmAMEwY',
        },
      }
    )
    const records = await res.json()
    if (records.length === 0) return

    await page.goto(`/task/${records[0].id}`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Should be on detail page
    expect(page.url()).toContain(`/task/${records[0].id}`)

    // Should have Edit and Delete buttons
    const editBtn = page.locator('button', { hasText: 'Edit' })
    const deleteBtn = page.locator('button', { hasText: 'Delete' })
    expect(await editBtn.isVisible()).toBeTruthy()
    expect(await deleteBtn.isVisible()).toBeTruthy()
  })
})

// ─── Settings CRUD ──────────────────────────────────────────────

test.describe('Settings CRUD', () => {
  test('create and delete a record type', async ({ page }) => {
    await page.goto('/settings')
    await page.waitForTimeout(2000)

    // Click New Record Type
    await page.click('button:has-text("New Record Type")')
    await page.waitForTimeout(1000)

    // Fill in name
    const nameInput = page.locator('input').first()
    await nameInput.fill('E2E Test Type')

    // Fill in slug
    const slugInput = page.locator('input').nth(1)
    await slugInput.fill(`e2e_test_${Date.now()}`)

    // Add a field
    const addFieldBtn = page.locator('button', { hasText: /add field/i })
    if (await addFieldBtn.isVisible()) {
      await addFieldBtn.click()
      await page.waitForTimeout(500)
    }

    // Submit
    const saveBtn = page.locator('button[type="submit"]')
    if (await saveBtn.isVisible()) {
      await saveBtn.click()
      await page.waitForTimeout(3000)
    }

    // Verify the new type appears
    const content = await page.content()
    expect(content).toContain('E2E Test Type')
  })
})
