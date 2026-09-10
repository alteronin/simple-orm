import { chromium } from 'playwright';
const BASE = 'https://simple-orm.vercel.app';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  try {
    // Check current record types on settings page
    await page.goto(`${BASE}/settings`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    const body = await page.textContent('body');
    console.log('Settings has Contact:', body.includes('Contact'));
    console.log('Settings has contact:', body.includes('/contact'));

    // Check if /contact page exists
    const resp = await page.goto(`${BASE}/contact`, { waitUntil: 'networkidle' });
    console.log('/contact status:', resp?.status());
    await page.waitForTimeout(2000);
    const h1 = await page.textContent('h1').catch(() => 'N/A');
    console.log('/contact h1:', h1);

    // Try creating a record type manually
    await page.goto(`${BASE}/settings`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const newBtn = await page.$('button:has-text("New Record Type")');
    if (newBtn) {
      await newBtn.click();
      await page.waitForTimeout(500);

      // Fill name = "Contact"
      const nameInput = await page.$('input[placeholder="e.g. Deal"]');
      if (nameInput) {
        await nameInput.fill('Contact');
        await page.waitForTimeout(300);
        // Check slug auto-populated
        const slugInput = await page.$('input[placeholder="e.g. deal"]');
        const slug = slugInput ? await slugInput.inputValue() : 'EMPTY';
        console.log('Slug auto-populated:', slug);
      }

      // Add field 1: name (text)
      const addBtn = await page.$('button:has-text("+ Add Field")');
      if (addBtn) {
        await addBtn.click();
        await page.waitForTimeout(200);
        const nameFields = await page.$$('input[placeholder="field_name"]');
        if (nameFields[0]) await nameFields[0].fill('name');
        const labelFields = await page.$$('input[placeholder="Label"]');
        if (labelFields[0]) await labelFields[0].fill('Name');
      }

      // Click Create
      const createBtn = await page.$('button:has-text("Create Record Type")');
      if (createBtn) {
        console.log('Clicking Create...');
        await createBtn.click();
        await page.waitForTimeout(2000);
        
        // Check for errors
        const afterBody = await page.textContent('body');
        console.log('After create, has Contact:', afterBody.includes('Contact'));
        console.log('After create, has /contact:', afterBody.includes('/contact'));
      } else {
        console.log('Create button NOT found');
        // List all buttons
        const buttons = await page.$$eval('button', btns => btns.map(b => b.textContent?.trim()));
        console.log('Buttons:', buttons);
      }
    }

    // Check /contact again
    const resp2 = await page.goto(`${BASE}/contact`, { waitUntil: 'networkidle' });
    console.log('/contact status after create:', resp2?.status());

  } catch (err) {
    console.error('ERROR:', err.message);
  }

  await browser.close();
}

run().catch(() => {});
