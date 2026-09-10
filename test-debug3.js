import { chromium } from 'playwright';
const BASE = 'https://simple-orm.vercel.app';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  try {
    // Try to create via API to see error
    const result = await page.goto('https://vhgcmdgmmvarkqjfcytj.supabase.co/rest/v1/record_types?select=*', { waitUntil: 'networkidle' });
    const text = await page.textContent('body');
    console.log('Supabase raw response:', text?.slice(0, 500));
  } catch (err) {
    console.log('Error:', err.message);
  }

  // Also try via the app settings page console
  await page.goto(`${BASE}/settings`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Check if we can see the toast after creation
  const newBtn = await page.$('button:has-text("New Record Type")');
  if (newBtn) {
    await newBtn.click();
    await page.waitForTimeout(500);

    const nameInput = await page.$('input[placeholder="e.g. Deal"]');
    if (nameInput) await nameInput.fill('Supplier');
    await page.waitForTimeout(200);

    // Add field
    const addBtn = await page.$('button:has-text("+ Add Field")');
    if (addBtn) {
      await addBtn.click();
      await page.waitForTimeout(200);
      const nameFields = await page.$$('input[placeholder="field_name"]');
      if (nameFields[0]) await nameFields[0].fill('company');
      const labelFields = await page.$$('input[placeholder="Label"]');
      if (labelFields[0]) await labelFields[0].fill('Company');
    }

    // Listen for console errors
    page.on('console', msg => {
      if (msg.type() === 'error') console.log('CONSOLE ERROR:', msg.text());
    });

    const createBtn = await page.$('button:has-text("Create Record Type")');
    if (createBtn) {
      await createBtn.click();
      await page.waitForTimeout(3000);

      // Check toast
      const toastEl = await page.$('.fixed.bottom-4.right-4');
      const toastText = toastEl ? await toastEl.textContent() : 'NO TOAST';
      console.log('Toast after create:', toastText);

      // Check page content
      const body = await page.textContent('body');
      console.log('Has Supplier:', body.includes('Supplier'));
      console.log('Has /supplier:', body.includes('/supplier'));
    }
  }

  await browser.close();
}

run().catch(() => {});
