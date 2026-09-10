const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  // 1. Homepage / Deal list
  await page.goto('https://simple-orm.vercel.app/deal');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'D:\\Onin\\ocs\\simple-orm\\screenshots\\01-deal-list.png', fullPage: true });
  console.log('1. Deal list - done');
  
  // 2. Deal detail - click first record
  const firstCard = page.locator('.card').first();
  if (await firstCard.isVisible()) {
    await firstCard.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'D:\\Onin\\ocs\\simple-orm\\screenshots\\02-deal-detail.png', fullPage: true });
    console.log('2. Deal detail - done');
  } else {
    console.log('2. No cards visible on deal list');
  }

  // 3. Task list
  await page.goto('https://simple-orm.vercel.app/task');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'D:\\Onin\\ocs\\simple-orm\\screenshots\\03-task-list.png', fullPage: true });
  console.log('3. Task list - done');

  // 4. New deal form
  await page.goto('https://simple-orm.vercel.app/deal/new');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'D:\\Onin\\ocs\\simple-orm\\screenshots\\04-new-deal.png', fullPage: true });
  console.log('4. New deal form - done');

  // 5. Homepage
  await page.goto('https://simple-orm.vercel.app/');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'D:\\Onin\\ocs\\simple-orm\\screenshots\\05-homepage.png', fullPage: true });
  console.log('5. Homepage - done');

  // 6. Check console errors
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  await page.goto('https://simple-orm.vercel.app/deal');
  await page.waitForTimeout(3000);
  
  // 7. Check sidebar visibility
  const sidebar = page.locator('aside');
  const sidebarVisible = await sidebar.isVisible();
  console.log(`7. Sidebar visible: ${sidebarVisible}`);

  // 8. Check all nav links
  const links = await page.locator('nav a').all();
  for (const link of links) {
    const text = await link.textContent();
    const href = await link.getAttribute('href');
    console.log(`   Nav link: "${text}" -> ${href}`);
  }

  // 9. Check for any layout/overflow issues
  const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
  const viewportWidth = await page.evaluate(() => window.innerWidth);
  console.log(`9. Body scroll width: ${bodyWidth}, viewport: ${viewportWidth}, overflow: ${bodyWidth > viewportWidth}`);

  // 10. Mobile viewport
  await page.setViewportSize({ width: 375, height: 812 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'D:\\Onin\\ocs\\simple-orm\\screenshots\\06-mobile.png', fullPage: true });
  console.log('10. Mobile screenshot - done');

  if (errors.length) {
    console.log('Console errors:', errors);
  }

  await browser.close();
  console.log('All done');
})();
