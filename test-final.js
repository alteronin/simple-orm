const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  await page.goto('http://localhost:3099/deal');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'D:\\Onin\\ocs\\simple-orm\\screenshots\\final-01-deal-list.png', fullPage: false });
  console.log('1. Deal list done');

  // Click first record
  const card = page.locator('[class*="cursor-pointer"]').first();
  if (await card.isVisible()) {
    await card.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'D:\\Onin\\ocs\\simple-orm\\screenshots\\final-02-deal-detail.png', fullPage: false });
    console.log('2. Deal detail done');
  }

  await page.goto('http://localhost:3099/task');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'D:\\Onin\\ocs\\simple-orm\\screenshots\\final-03-task-list.png', fullPage: false });
  console.log('3. Task list done');

  await page.goto('http://localhost:3099/deal/new');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'D:\\Onin\\ocs\\simple-orm\\screenshots\\final-04-new-deal.png', fullPage: false });
  console.log('4. New deal done');

  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('http://localhost:3099/deal');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'D:\\Onin\\ocs\\simple-orm\\screenshots\\final-05-mobile.png', fullPage: false });
  console.log('5. Mobile done');

  await browser.close();
  console.log('All done');
})().catch(e => { console.error(e); process.exit(1); });
