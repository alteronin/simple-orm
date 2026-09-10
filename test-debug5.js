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
    // Test record type creation with unique slug
    await page.goto(`${BASE}/settings`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const newBtn = await page.$('button:has-text("New Record Type")');
    await newBtn.click();
    await page.waitForTimeout(500);

    const nameInput = await page.$('input[placeholder="e.g. Deal"]');
    await nameInput.fill('Vendor');
    await page.waitForTimeout(300);

    // Add name field
    const addBtn = await page.$('button:has-text("+ Add Field")');
    await addBtn.click();
    await page.waitForTimeout(200);
    const nameFields = await page.$$('input[placeholder="field_name"]');
    await nameFields[0].fill('company');
    const labelFields = await page.$$('input[placeholder="Label"]');
    await labelFields[0].fill('Company');

    // Listen for console errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    const createBtn = await page.$('button:has-text("Create Record Type")');
    await createBtn.click();
    await page.waitForTimeout(3000);

    console.log('Console errors:', consoleErrors);

    // Check toast
    const toastEl = await page.$('.fixed.bottom-4.right-4');
    const toastText = toastEl ? await toastEl.textContent() : 'NO TOAST';
    console.log('Toast:', toastText);

    // Check if vendor appears
    const body = await page.textContent('body');
    check('Vendor created', body.includes('Vendor'), body.includes('/vendor') ? 'slug found' : 'no slug');

    // Check /vendor page
    const resp = await page.goto(`${BASE}/vendor`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    check('Vendor page accessible', resp?.status() === 200, `status ${resp?.status()}`);

  } catch (err) {
    console.error('ERROR:', err.message);
  }

  await browser.close();
  const pass = results.filter(r => r.pass).length;
  const fail = results.filter(r => !r.pass).length;
  console.log(`\n=== Results: ${pass}/${pass + fail} passed ===`);
}

run().catch(() => {});
