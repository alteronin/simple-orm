const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const results = [];

  // AC1: List Records — shows record cards, updates after create
  console.log('--- AC1: List Records ---');
  await page.goto('https://simple-orm.vercel.app/deal');
  await page.waitForTimeout(3000);
  const dealCards = await page.locator('[class*="cursor-pointer"]').count();
  console.log('Deal cards visible:', dealCards);
  results.push({ ac: 'AC1', name: 'List Records', pass: dealCards > 0, detail: `${dealCards} cards` });

  // AC6: Record Type Selection — Deal/Task tabs, different fields
  console.log('--- AC6: Record Type Selection ---');
  const dealsActive = await page.locator('a[href="/deal"]').evaluate(el => el.closest('[class*="bg-accent"]') !== null).catch(() => false);
  console.log('Deals nav active:', dealsActive);
  await page.goto('https://simple-orm.vercel.app/task');
  await page.waitForTimeout(2000);
  const taskCards = await page.locator('[class*="cursor-pointer"]').count();
  console.log('Task cards visible:', taskCards);
  // Check task has "Priority" and "Completed" fields (different from Deal)
  const taskBadge = await page.locator('text=Priority').count();
  const taskDone = await page.locator('text=Completed').count();
  results.push({ ac: 'AC6', name: 'Record Type Selection', pass: taskBadge > 0 && taskDone > 0, detail: `Priority:${taskBadge} Completed:${taskDone}` });

  // AC2: Create Record — form renders correct fields, submit creates
  console.log('--- AC2: Create Record ---');
  await page.goto('https://simple-orm.vercel.app/deal/new');
  await page.waitForTimeout(2000);
  const titleInput = await page.locator('input[type="text"]').count();
  const numberInput = await page.locator('input[type="number"]').count();
  const selectInput = await page.locator('select').count();
  const dateInput = await page.locator('input[type="date"]').count();
  console.log(`Form fields - text:${titleInput} number:${numberInput} select:${selectInput} date:${dateInput}`);
  // Create a test record
  await page.locator('input[type="text"]').first().fill('UAC Test Record');
  await page.locator('input[type="number"]').first().fill('99999');
  await page.locator('select').first().selectOption('new');
  await page.locator('input[type="date"]').first().fill('2026-12-31');
  await page.locator('button[type="submit"]').click();
  await page.waitForTimeout(3000);
  const currentUrl = page.url();
  const createdOk = !currentUrl.includes('/new');
  console.log('After create URL:', currentUrl, 'redirected:', createdOk);
  results.push({ ac: 'AC2', name: 'Create Record', pass: createdOk && titleInput > 0, detail: `fields: text:${titleInput} num:${numberInput} sel:${selectInput} date:${dateInput}` });

  // Verify it shows in list
  await page.goto('https://simple-orm.vercel.app/deal');
  await page.waitForTimeout(2000);
  const testRecord = await page.locator('text=UAC Test Record').count();
  console.log('Created record in list:', testRecord > 0);
  results.push({ ac: 'AC2b', name: 'Create → appears in list', pass: testRecord > 0, detail: `found: ${testRecord}` });

  // AC3: Record Detail — displays all field values + Edit/Delete
  console.log('--- AC3: Record Detail ---');
  if (testRecord > 0) {
    await page.locator('text=UAC Test Record').first().click();
    await page.waitForTimeout(2000);
    const detailTitle = await page.locator('text=UAC Test Record').count();
    const detailValue = await page.locator('text=99999').count();
    const editBtn = await page.locator('text=Edit').count();
    const deleteBtn = await page.locator('text=Delete').count();
    console.log(`Detail - title:${detailTitle} value:${detailValue} edit:${editBtn} delete:${deleteBtn}`);
    results.push({ ac: 'AC3', name: 'Record Detail', pass: detailTitle > 0 && editBtn > 0 && deleteBtn > 0, detail: `title:${detailTitle} value:${detailValue} edit:${editBtn} del:${deleteBtn}` });
  }

  // AC4: Edit Record — page renders, loads data
  console.log('--- AC4: Edit Record ---');
  if (testRecord > 0) {
    await page.locator('text=Edit').first().click();
    await page.waitForTimeout(2000);
    const editTitle = await page.locator('h1:has-text("Edit Deal")').count();
    const inputValue = await page.locator('input[type="text"]').first().inputValue();
    console.log(`Edit page - title:${editTitle} pre-filled:"${inputValue}"`);
    results.push({ ac: 'AC4', name: 'Edit Record', pass: editTitle > 0 && inputValue === 'UAC Test Record', detail: `header:${editTitle} prefilled:"${inputValue}"` });
  }

  // AC5: Delete Record — deletes from Supabase
  console.log('--- AC5: Delete Record ---');
  if (testRecord > 0) {
    // Navigate to the record detail first
    await page.goto('https://simple-orm.vercel.app/deal');
    await page.waitForTimeout(2000);
    await page.locator('text=UAC Test Record').first().click();
    await page.waitForTimeout(2000);
    // Click Delete
    await page.locator('button:has-text("Delete")').first().click();
    await page.waitForTimeout(1000);
    // Confirm in dialog
    const confirmBtn = page.locator('button:has-text("Delete")').last();
    if (await confirmBtn.isVisible()) {
      await confirmBtn.click();
      await page.waitForTimeout(3000);
    }
    // Verify gone from list
    await page.goto('https://simple-orm.vercel.app/deal');
    await page.waitForTimeout(2000);
    const deleted = await page.locator('text=UAC Test Record').count();
    console.log('After delete, record still visible:', deleted);
    results.push({ ac: 'AC5', name: 'Delete Record', pass: deleted === 0, detail: `remaining: ${deleted}` });
  }

  // Summary
  console.log('\n=== UAC SUMMARY ===');
  let allPass = true;
  for (const r of results) {
    const status = r.pass ? 'PASS' : 'FAIL';
    console.log(`${status} | ${r.ac}: ${r.name} — ${r.detail}`);
    if (!r.pass) allPass = false;
  }
  console.log(`\nOverall: ${allPass ? 'ALL PASS' : 'SOME FAILED'}`);

  await browser.close();
})().catch(e => { console.error(e.message); process.exit(1); });
