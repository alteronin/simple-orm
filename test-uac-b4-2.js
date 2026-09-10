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
    const boolBadge = await page.$('button:has-text("Completed")');
    check('B4-2.3: Boolean badge exists', !!boolBadge);

    if (boolBadge) {
      const boolText = await boolBadge.textContent();
      await boolBadge.click();

      // Wait for toast to appear (check every 200ms for 3 seconds)
      let toastFound = false;
      for (let i = 0; i < 15; i++) {
        await page.waitForTimeout(200);
        const toastText = await page.$eval('.fixed.bottom-4.right-4', el => el.textContent || '').catch(() => '');
        if (toastText.length > 0) {
          check('B4-2.5: Toast on boolean toggle', true, toastText.slice(0, 50));
          toastFound = true;
          break;
        }
      }
      if (!toastFound) {
        check('B4-2.5: Toast on boolean toggle', false, 'no toast appeared');
      }

      // Refresh and verify value changed
      await page.goto(`${BASE}/task`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
      const newBoolBadge = await page.$('button:has-text("Completed")');
      const newText = newBoolBadge ? await newBoolBadge.textContent() : '';
      check('B4-2.7: Boolean value updated', newText !== boolText, `${boolText} -> ${newText}`);
    }

    // B4-2.1 + B4-2.2: Click a select field badge to edit
    const priorityBadge = await page.$('button:has-text("Priority:")');
    if (priorityBadge) {
      await priorityBadge.click();
      await page.waitForTimeout(500);

      const select = await page.$('select[class*="border-primary"]');
      check('B4-2.2: Select dropdown for select field', !!select);

      if (select) {
        // B4-2.4: Escape to cancel
        await select.press('Escape');
        await page.waitForTimeout(300);
        const gone = !(await page.$('select[class*="border-primary"]'));
        check('B4-2.4: Escape cancels edit', gone);

        // Re-query and test Enter — re-query because DOM changed
        const priorityBadge2 = await page.$('button:has-text("Priority:")');
        if (priorityBadge2) {
          await priorityBadge2.click();
          await page.waitForTimeout(500);
          const select2 = await page.$('select[class*="border-primary"]');
          if (select2) {
            await select2.press('Enter');
            await page.waitForTimeout(1000);
            const gone2 = !(await page.$('select[class*="border-primary"]'));
            check('B4-2.4: Enter saves and closes', gone2);
          }
        }
      }
    }

    // Navigate to deal page for text field test
    await page.goto(`${BASE}/deal`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Find a Value badge (number field)
    const valueBadge = await page.$('button:has-text("Value:")');
    if (valueBadge) {
      await valueBadge.click();
      await page.waitForTimeout(500);

      const input = await page.$('input[class*="border-primary"]');
      check('B4-2.1: Input appears on click', !!input);

      if (input) {
        await input.fill('77777');
        await input.press('Enter');
        await page.waitForTimeout(1500);

        // Wait for toast
        let toastFound2 = false;
        for (let i = 0; i < 10; i++) {
          await page.waitForTimeout(200);
          const toastText = await page.$eval('.fixed.bottom-4.right-4', el => el.textContent || '').catch(() => '');
          if (toastText.length > 0) {
            check('B4-2.5: Toast on text save', true, toastText.slice(0, 50));
            toastFound2 = true;
            break;
          }
        }
        if (!toastFound2) {
          check('B4-2.5: Toast on text save', false, 'no toast');
        }
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
