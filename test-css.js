const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  // Intercept CSS requests
  const cssUrls = [];
  page.on('response', resp => {
    if (resp.url().includes('.css')) {
      cssUrls.push(resp.url());
    }
  });
  
  await page.goto('http://localhost:3099/deal');
  await page.waitForTimeout(5000);
  
  console.log('CSS URLs loaded:', cssUrls.length);
  cssUrls.forEach(u => console.log('  ', u));
  
  // Check if bg-background resolves
  const resolved = await page.evaluate(() => {
    const el = document.body;
    const s = getComputedStyle(el);
    return {
      bg: s.backgroundColor,
      color: s.color,
      display: s.display,
      fontFamily: s.fontFamily,
    };
  });
  console.log('Body computed:', resolved);
  
  // Check a utility class
  const asideCheck = await page.evaluate(() => {
    const aside = document.querySelector('aside');
    if (!aside) return 'no aside';
    const s = getComputedStyle(aside);
    return {
      display: s.display,
      width: s.width,
      bg: s.backgroundColor,
      borderRight: s.borderRight,
    };
  });
  console.log('Aside computed:', asideCheck);
  
  // Fetch a CSS file to check its content
  if (cssUrls.length > 0) {
    const cssContent = await page.evaluate(async (url) => {
      const resp = await fetch(url);
      const text = await resp.text();
      // Check for bg-background class
      return {
        hasBgBackground: text.includes('bg-background'),
        hasHidden: text.includes('hidden'),
        hasMdFlex: text.includes('md:flex'),
        length: text.length,
        snippet: text.substring(0, 500),
      };
    }, cssUrls[0]);
    console.log('CSS content check:', cssContent);
  }
  
  await browser.close();
})().catch(e => { console.error(e.message); process.exit(1); });
