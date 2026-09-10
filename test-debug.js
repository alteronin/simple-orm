import { chromium } from 'playwright';

const BASE = 'https://simple-orm.vercel.app';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  try {
    await page.goto(`${BASE}/task`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Debug: what badges exist?
    const allBadges = await page.$$eval('[class*="rounded-full"]', els => els.map(el => ({
      tag: el.tagName,
      text: el.textContent?.trim(),
      classes: el.className.slice(0, 100)
    })));
    console.log('All badges:', JSON.stringify(allBadges, null, 2));

    // Debug: try clicking the first span badge
    const spans = await page.$$('span[class*="rounded-full"]');
    console.log(`Found ${spans.length} span badges`);
    for (let i = 0; i < Math.min(3, spans.length); i++) {
      const text = await spans[i].textContent();
      const classes = await spans[i].getAttribute('class');
      console.log(`  Span ${i}: text="${text}", classes="${classes?.slice(0, 80)}"`);
    }

    // Click first span badge
    if (spans.length > 0) {
      console.log('Clicking first span badge...');
      await spans[0].click();
      await page.waitForTimeout(1000);

      const inputs = await page.$$('input');
      console.log(`Inputs after click: ${inputs.length}`);
      for (const inp of inputs) {
        const type = await inp.getAttribute('type');
        const classes = await inp.getAttribute('class');
        console.log(`  Input: type=${type}, classes="${classes?.slice(0, 80)}"`);
      }
    }

    // Debug: check toast after boolean toggle
    await page.goto(`${BASE}/task`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const boolBtns = await page.$$('button[class*="rounded-full"]');
    console.log(`\nBoolean buttons: ${boolBtns.length}`);
    if (boolBtns.length > 0) {
      const text = await boolBtns[0].textContent();
      console.log(`  Clicking: "${text}"`);
      await boolBtns[0].click();
      await page.waitForTimeout(500);

      // Check all fixed elements
      const fixedEls = await page.$$eval('.fixed', els => els.map(el => ({
        classes: el.className.slice(0, 100),
        text: el.textContent?.slice(0, 50),
        visible: el.offsetHeight > 0
      })));
      console.log('Fixed elements:', JSON.stringify(fixedEls, null, 2));
    }

  } catch (err) {
    console.error('FATAL:', err.message);
  }

  await browser.close();
}

run().catch(() => {});
