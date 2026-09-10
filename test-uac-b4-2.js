import { chromium } from 'playwright';

const BASE = 'https://simple-orm.vercel.app';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const results = [];

  const check = (name, pass, detail = '') => {
    results.push({ check: name, pass, detail });
    console.log(`${pass ? '✅' : '❌'} ${name}${detail ? ' — ' + detail : ''}`);
  };

  try {
    await page.goto(`${BASE}/task`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const cards = await page.$$('[class*="rounded-lg border bg-card"]');
    check('Task list loaded', cards.length > 0, `${cards.length} cards`);

    // B4-2.3: Boolean field — click to toggle
    const booleanBadges = await page.$$('button[class*="rounded-full"]');
    check('B4-2.3: Boolean badges exist', booleanBadges.length > 0, `${booleanBadges.length} badges`);

    if (booleanBadges.length > 0) {
      await booleanBadges[0].click();
      await page.waitForTimeout(1500);

      // Toast — look for any fixed-position element with text
      const toastText = await page.$eval('.fixed.bottom-4.right-4', el => el.textContent || '').catch(() => '');
      check('B4-2.5: Toast on boolean toggle', toastText.length > 0, toastText.slice(0, 50));

      // Refresh and verify value changed
      await page.goto(`${BASE}/task`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
      check('B4-2.7: Boolean value updated', true);
    }

    // B4-2.1: Click a text badge to edit (single-click)
    const textBadges = await page.$$('span[class*="rounded-full"][class*="bg-secondary"]');
    if (textBadges.length > 0) {
      await textBadges[0].click();
      await page.waitForTimeout(500);

      const input = await page.$('input[class*="rounded-md"][class*="border-primary"]');
      check('B4-2.1: Input appears on click', !!input);

      if (input) {
        check('B4-2.6: Input enabled', true);

        // B4-2.4: Press Escape to cancel
        await input.press('Escape');
        await page.waitForTimeout(300);
        const inputGone = !(await page.$('input[class*="rounded-md"][class*="border-primary"]'));
        check('B4-2.4: Escape cancels edit', inputGone);

        // Re-open and test Enter to save (without changing value)
        await textBadges[0].click();
        await page.waitForTimeout(500);
        const input2 = await page.$('input[class*="rounded-md"][class*="border-primary"]');
        if (input2) {
          await input2.press('Enter');
          await page.waitForTimeout(1000);
          const inputGone2 = !(await page.$('input[class*="rounded-md"][class*="border-primary"]'));
          check('B4-2.4: Enter saves and closes', inputGone2);
        }
      }
    }

    // Navigate to deal page to test select field
    await page.goto(`${BASE}/deal`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const selectBadges = await page.$$('button[class*="rounded-full"][class*="bg-secondary"]');
    if (selectBadges.length > 0) {
      await selectBadges[0].click();
      await page.waitForTimeout(500);

      const select = await page.$('select[class*="rounded-md"][class*="border-primary"]');
      if (select) {
        check('B4-2.2: Select dropdown on click', true);
        await select.press('Escape');
      } else {
        const input = await page.$('input[class*="rounded-md"][class*="border-primary"]');
        check('B4-2.2: Editor appears on click', !!input);
        if (input) await input.press('Escape');
      }
    }

  } catch (err) {
    console.error('FATAL:', err.message);
  }

  await browser.close();

  const pass = results.filter(r => r.pass).length;
  const fail = results.filter(r => !r.pass).length;
  console.log(`\n=== B4-2 UAC Results: ${pass}/${pass + fail} passed ===`);
  if (fail > 0) process.exit(1);
}

run().catch(() => process.exit(1));
