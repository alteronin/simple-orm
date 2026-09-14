import { test, expect } from '@playwright/test'

const API = 'https://vhgcmdgmmvarkqjfcytj.supabase.co/rest/v1'
const KEY = process.env.SUPABASE_ANON_KEY || ''
const HEADERS = { apikey: KEY, Authorization: `Bearer ${KEY}` }

const STACK_ID = '02f5226a-9f34-4aa9-8b92-cf6d630139cd' // "test" stack

async function getCards(page: any) {
  const resp = await page.request.get(
    `${API}/stack_cards?select=id,record_id,position&stack_id=eq.${STACK_ID}&order=position`,
    { headers: HEADERS }
  )
  return resp.json()
}

async function getTitle(page: any, recordId: string) {
  const resp = await page.request.get(`${API}/records?select=data&id=eq.${recordId}`, { headers: HEADERS })
  const rec = await resp.json()
  return rec[0]?.data?.title || '?'
}

async function logCards(label: string, page: any, cards: any[]) {
  const entries = await Promise.all(cards.map(async (c: any) => {
    const t = await getTitle(page, c.record_id)
    return `${t}(${c.position})`
  }))
  console.log(`${label}: ${entries.join(', ')}`)
}

test.describe('Sort-then-Reorder Bug - Debug', () => {
  test('trace the full flow', async ({ page }) => {
    const initial = await getCards(page)
    await logCards('1. DB initial', page, initial)

    // Open page
    await page.goto('/stacks')
    await page.waitForTimeout(4000)

    // Find test stack
    const stackHeading = page.locator('h3:has-text("test")').first()
    await expect(stackHeading).toBeVisible({ timeout: 10000 })
    const stackContainer = stackHeading.locator('xpath=ancestor::div[contains(@class,"rounded-lg")]')

    // Get DOM order before sort
    const cardsBeforeSort = stackContainer.locator('[class*="cursor-grab"]')
    const countBefore = await cardsBeforeSort.count()
    const titlesBeforeSort: string[] = []
    for (let i = 0; i < Math.min(5, countBefore); i++) {
      const text = await cardsBeforeSort.nth(i).textContent()
      titlesBeforeSort.push(text?.substring(0, 30) || '?')
    }
    console.log(`2. DOM before sort (${countBefore} cards): ${titlesBeforeSort.join(' | ')}`)

    // Click Title sort
    const titleBtn = stackContainer.locator('button:has-text("Title")')
    await titleBtn.click()
    await page.waitForTimeout(1000)

    // Get DOM order after sort
    const cardsAfterSort = stackContainer.locator('[class*="cursor-grab"]')
    const countAfter = await cardsAfterSort.count()
    const titlesAfterSort: string[] = []
    for (let i = 0; i < Math.min(5, countAfter); i++) {
      const text = await cardsAfterSort.nth(i).textContent()
      titlesAfterSort.push(text?.substring(0, 30) || '?')
    }
    console.log(`3. DOM after sort (${countAfter} cards): ${titlesAfterSort.join(' | ')}`)

    // DB should NOT have changed yet
    const dbAfterSort = await getCards(page)
    await logCards('4. DB after sort (should be same as initial)', page, dbAfterSort)

    // Drag first card to third position
    const firstCard = cardsAfterSort.nth(0)
    const thirdCard = cardsAfterSort.nth(2)
    const firstBox = await firstCard.boundingBox()
    const thirdBox = await thirdCard.boundingBox()

    if (firstBox && thirdBox) {
      console.log(`5. Dragging from (${firstBox.x},${firstBox.y}) to (${thirdBox.x},${thirdBox.y})`)
      await page.mouse.move(firstBox.x + firstBox.width / 2, firstBox.y + firstBox.height / 2)
      await page.mouse.down()
      await page.waitForTimeout(300)
      for (let step = 1; step <= 20; step++) {
        const p = step / 20
        await page.mouse.move(
          firstBox.x + firstBox.width / 2 + (thirdBox.x - firstBox.x) * p,
          firstBox.y + firstBox.height / 2 + (thirdBox.y - firstBox.y) * p
        )
        await page.waitForTimeout(25)
      }
      await page.waitForTimeout(300)
      await page.mouse.up()
      await page.waitForTimeout(3000)
    }

    // Check DB after drag
    const dbAfterDrag = await getCards(page)
    await logCards('6. DB after drag', page, dbAfterDrag)

    // Check DOM after drag
    const cardsAfterDrag = stackContainer.locator('[class*="cursor-grab"]')
    const countDrag = await cardsAfterDrag.count()
    const titlesAfterDrag: string[] = []
    for (let i = 0; i < Math.min(5, countDrag); i++) {
      const text = await cardsAfterDrag.nth(i).textContent()
      titlesAfterDrag.push(text?.substring(0, 30) || '?')
    }
    console.log(`7. DOM after drag (${countDrag} cards): ${titlesAfterDrag.join(' | ')}`)

    // Reload
    await page.reload()
    await page.waitForTimeout(4000)

    // Check DB after reload
    const dbAfterReload = await getCards(page)
    await logCards('8. DB after reload', page, dbAfterReload)

    // Check DOM after reload
    const stackHeading2 = page.locator('h3:has-text("test")').first()
    await expect(stackHeading2).toBeVisible({ timeout: 10000 })
    const stackContainer2 = stackHeading2.locator('xpath=ancestor::div[contains(@class,"rounded-lg")]}')
    const cardsAfterReload = stackContainer2.locator('[class*="cursor-grab"]')
    const countReload = await cardsAfterReload.count()
    const titlesAfterReload: string[] = []
    for (let i = 0; i < Math.min(5, countReload); i++) {
      const text = await cardsAfterReload.nth(i).textContent()
      titlesAfterReload.push(text?.substring(0, 30) || '?')
    }
    console.log(`9. DOM after reload (${countReload} cards): ${titlesAfterReload.join(' | ')}`)

    // Compare DB orders
    const afterDragIds = dbAfterDrag.map((c: any) => c.id)
    const afterReloadIds = dbAfterReload.map((c: any) => c.id)
    console.log(`10. DB order changed: ${JSON.stringify(afterDragIds !== afterReloadIds)}`)

    if (afterDragIds.join(',') !== afterReloadIds.join(',')) {
      console.log('BUG CONFIRMED: DB order changed after reload!')
      console.log('  Before reload:', afterDragIds.join(', '))
      console.log('  After reload:', afterReloadIds.join(', '))
    }

    expect(afterReloadIds).toEqual(afterDragIds)
  })
})
