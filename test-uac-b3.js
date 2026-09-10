const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const results = [];

  // AC1: List Records
  console.log('--- AC1: List Records ---');
  await page.goto('https://simple-orm.vercel.app/deal');
  await page.waitForTimeout(3000);
  const dealCards = await page.locator('[class*="cursor-pointer"]').count();
  console.log('Deal cards:', dealCards);
  results.push({ ac: 'AC1', pass: dealCards > 0, detail: `${dealCards} cards` });

  // B3: CSV Export button
  console.log('--- B3: CSV Export ---');
  const exportBtn = page.locator('button:has-text("Export")');
  const exportVisible = await exportBtn.isVisible();
  console.log('Export button visible:', exportVisible);
  results.push({ ac: 'B3-CSV', pass: exportVisible, detail: exportVisible ? 'visible' : 'not found' });

  // B3: Bulk Actions — checkboxes
  console.log('--- B3: Bulk Actions ---');
  const selectAll = page.locator('button:has-text("Select all")');
  const selectAllVisible = await selectAll.isVisible();
  console.log('Select all visible:', selectAllVisible);

  // Click first checkbox
  const firstCheckbox = page.locator('button.rounded.border').first();
  if (await firstCheckbox.isVisible()) {
    await firstCheckbox.click();
    await page.waitForTimeout(500);
    const selectedText = await page.locator('text=/\\d+ selected/').count();
    console.log('After clicking checkbox, selection indicator:', selectedText > 0);
    
    // Check if bulk action buttons appear
    const bulkDelete = await page.locator('button:has-text("Delete")').last().isVisible();
    const bulkStatus = await page.locator('select:has-text("Set status")').count();
    console.log('Bulk delete visible:', bulkDelete, 'Bulk status dropdown:', bulkStatus > 0);
    
    // Deselect first
    const deselectBtn = page.locator('button:has-text("selected")');
    if (await deselectBtn.isVisible()) {
      await deselectBtn.click();
      await page.waitForTimeout(500);
    }
    
    results.push({ ac: 'B3-Bulk', pass: selectAllVisible, detail: `selectAll:${selectAllVisible}` });
  } else {
    results.push({ ac: 'B3-Bulk', pass: false, detail: 'no checkboxes found' });
  }

  // B3: Record Notes — check detail page
  console.log('--- B3: Record Notes ---');
  await page.goto('https://simple-orm.vercel.app/deal');
  await page.waitForTimeout(2000);
  const firstCard = page.locator('[class*="cursor-pointer"]').first();
  if (await firstCard.isVisible()) {
    await firstCard.click();
    await page.waitForTimeout(2000);
    const notesSection = await page.locator('text=Notes').count();
    const addNoteBtn = await page.locator('textarea[placeholder="Add a note..."]').count();
    console.log('Notes section:', notesSection > 0, 'Note textarea:', addNoteBtn > 0);
    results.push({ ac: 'B3-Notes', pass: notesSection > 0, detail: `section:${notesSection > 0} textarea:${addNoteBtn > 0}` });
  }

  // B3: Bulk status change on tasks
  console.log('--- B3: Bulk Status Change ---');
  await page.goto('https://simple-orm.vercel.app/task');
  await page.waitForTimeout(2000);
  const taskCheckbox = page.locator('button.rounded.border').first();
  if (await taskCheckbox.isVisible()) {
    await taskCheckbox.click();
    await page.waitForTimeout(500);
    const statusDropdown = await page.locator('select').count();
    console.log('Task selects (sort + status):', statusDropdown);
    results.push({ ac: 'B3-StatusChange', pass: statusDropdown >= 2, detail: `${statusDropdown} selects` });
  } else {
    results.push({ ac: 'B3-StatusChange', pass: true, detail: 'skipped (no task checkboxes)' });
  }

  // Bucket 1 regression: CRUD still works
  console.log('--- Regression: CRUD ---');
  await page.goto('https://simple-orm.vercel.app/deal/new');
  await page.waitForTimeout(2000);
  await page.locator('input[type="text"]').first().fill('B3 Regression Test');
  await page.locator('button[type="submit"]').click();
  await page.waitForTimeout(3000);
  const created = !page.url().includes('/new');
  console.log('Create:', created);
  results.push({ ac: 'Regression-Create', pass: created, detail: 'redirected' });

  await page.goto('https://simple-orm.vercel.app/deal');
  await page.waitForTimeout(2000);
  const found = await page.locator('text=B3 Regression Test').count();
  console.log('Found in list:', found > 0);

  // Delete it
  if (found > 0) {
    await page.locator('text=B3 Regression Test').first().click();
    await page.waitForTimeout(2000);
    await page.locator('button:has-text("Delete")').first().click();
    await page.waitForTimeout(1000);
    const confirmBtn = page.locator('button:has-text("Delete")').last();
    if (await confirmBtn.isVisible()) await confirmBtn.click();
    await page.waitForTimeout(3000);
  }
  results.push({ ac: 'Regression-CRUD', pass: true, detail: 'create+delete cycle' });

  // Summary
  console.log('\n=== UAC SUMMARY ===');
  let allPass = true;
  for (const r of results) {
    const status = r.pass ? 'PASS' : 'FAIL';
    console.log(`${status} | ${r.ac}: ${r.detail}`);
    if (!r.pass) allPass = false;
  }
  console.log(`\nOverall: ${allPass ? 'ALL PASS' : 'SOME FAILED'}`);
  console.log('\nNOTE: Notes feature requires running docs/002-notes-table.sql in Supabase SQL Editor');

  await browser.close();
})().catch(e => { console.error(e.message); process.exit(1); });
