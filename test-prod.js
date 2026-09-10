const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  await page.goto('https://simple-orm.vercel.app/deal');
  await page.waitForTimeout(3000);

  // Verify dark mode
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  console.log('Body BG:', bg);
  const ok = bg === 'rgb(9, 9, 11)';
  console.log('Dark mode OK:', ok);

  // Verify sidebar
  const sidebar = page.locator('aside');
  const w = await sidebar.evaluate(el => getComputedStyle(el).width);
  console.log('Sidebar width:', w);

  // Verify SVGs
  const svgs = await page.locator('aside svg').all();
  for (let i = 0; i < svgs.length; i++) {
    const box = await svgs[i].boundingBox();
    if (box) console.log('  SVG', i, ':', box.width.toFixed(0), 'x', box.height.toFixed(0));
  }

  await page.screenshot({ path: 'D:\\Onin\\ocs\\simple-orm\\screenshots\\prod-01.png', fullPage: false });
  console.log('Production screenshot saved');
  await browser.close();
})().catch(e => { console.error(e.message); process.exit(1); });
