const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  // 1. Deal list
  await page.goto('https://simple-orm.vercel.app/deal');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'D:\\Onin\\ocs\\simple-orm\\screenshots\\fix-01-deal-list.png', fullPage: false });
  console.log('1. Deal list - done');

  // 2. Check sidebar dimensions
  const sidebar = page.locator('aside');
  if (await sidebar.isVisible()) {
    const box = await sidebar.boundingBox();
    console.log(`2. Sidebar: ${JSON.stringify(box)}`);
  } else {
    console.log('2. Sidebar NOT visible');
  }

  // 3. Check computed background color
  const bgColor = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  console.log(`3. Body background: ${bgColor}`);

  // 4. Check if icons are properly sized
  const svgs = await page.locator('aside svg').all();
  for (let i = 0; i < svgs.length; i++) {
    const box = await svgs[i].boundingBox();
    if (box) console.log(`   SVG ${i}: ${box.width}x${box.height}`);
  }

  // 5. Deal detail
  const firstCard = page.locator('[class*="cursor-pointer"]').first();
  if (await firstCard.isVisible()) {
    await firstCard.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'D:\\Onin\\ocs\\simple-orm\\screenshots\\fix-02-deal-detail.png', fullPage: false });
    console.log('5. Deal detail - done');
  }

  // 6. New deal form
  await page.goto('https://simple-orm.vercel.app/deal/new');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'D:\\Onin\\ocs\\simple-orm\\screenshots\\fix-03-new-deal.png', fullPage: false });
  console.log('6. New deal form - done');

  // 7. Mobile
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('https://simple-orm.vercel.app/deal');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'D:\\Onin\\ocs\\simple-orm\\screenshots\\fix-04-mobile.png', fullPage: false });
  console.log('7. Mobile - done');

  await browser.close();
  console.log('All done');
})();
