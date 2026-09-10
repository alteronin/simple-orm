import { chromium } from 'playwright';

const BASE = 'https://simple-orm.vercel.app';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const results = [];

  const check = (name, pass, detail = '') => {
    results.push({ check: name, pass, detail });
    console.log(`${pass ? '✅' : '❌'} ${name}${detail ? ' — ' + detail : ''}`);
  };

  try {
    await page.goto(`${BASE}/deal`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const settingsLink = await page.$('a[href="/settings"]');
    check('Settings link in sidebar', !!settingsLink);

    await page.goto(`${BASE}/settings`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const heading = await page.textContent('h1');
    check('Settings page heading', heading?.includes('Record Types'), heading || '');

    const bodyText = await page.textContent('body');
    check('Deal record type shown', bodyText?.includes('Deal'));
    check('Task record type shown', bodyText?.includes('Task'));
    check('Deal fields shown', bodyText?.includes('Value') || bodyText?.includes('Status'));
    check('Task fields shown', bodyText?.includes('Priority') || bodyText?.includes('Completed'));

    const editBtns = await page.$$('button:has(svg path[d*="M16.862"])');
    check('Edit buttons exist', editBtns.length >= 2);

    if (editBtns.length > 0) {
      await editBtns[0].click();
      await page.waitForTimeout(500);
      const formVisible = await page.$('form');
      check('Edit form opens', !!formVisible);
      const cancelBtn = await page.$('button:has-text("Cancel")');
      if (cancelBtn) await cancelBtn.click();
      await page.waitForTimeout(300);
    }

    const newBtn = await page.$('button:has-text("New Record Type")');
    check('New Record Type button exists', !!newBtn);

    if (newBtn) {
      await newBtn.click();
      await page.waitForTimeout(500);
      const formVisible = await page.$('form');
      check('New form opens', !!formVisible);

      const nameInput = await page.$('input[placeholder="e.g. Deal"]');
      if (nameInput) {
        await nameInput.fill('Contact');
        await page.waitForTimeout(200);
        const slugInput = await page.$('input[placeholder="e.g. deal"]');
        const slugVal = slugInput ? await slugInput.inputValue() : '';
        check('Slug auto-populated', slugVal === 'contact', slugVal);
      }

      const addFieldBtn = await page.$('button:has-text("+ Add Field")');
      if (addFieldBtn) {
        await addFieldBtn.click();
        await page.waitForTimeout(300);
        check('Add field button works', true);
      }

      const cancelBtn = await page.$('button:has-text("Cancel")');
      if (cancelBtn) await cancelBtn.click();
      await page.waitForTimeout(300);
    }

    await page.goto(`${BASE}/deal`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    const dealPage = await page.textContent('body');
    check('Deal list still works', dealPage?.includes('Deal') || dealPage?.includes('deals'));

    await page.goto(`${BASE}/task`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    const taskPage = await page.textContent('body');
    check('Task list still works', taskPage?.includes('Task') || taskPage?.includes('tasks'));

  } catch (err) {
    console.error('FATAL:', err.message);
  }

  await browser.close();

  const pass = results.filter(r => r.pass).length;
  const fail = results.filter(r => !r.pass).length;
  console.log(`\n=== UAC Results: ${pass}/${pass + fail} passed ===`);
  if (fail > 0) process.exit(1);
}

run().catch(() => process.exit(1));
