import { chromium } from 'playwright';
const BASE = 'https://simple-orm.vercel.app';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  try {
    // Check if record_types table is accessible by visiting settings
    await page.goto(`${BASE}/settings`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Check the page content for record types
    const body = await page.textContent('body');
    console.log('Has Deal:', body.includes('Deal'));
    console.log('Has Task:', body.includes('Task'));
    console.log('Has deal:', body.includes('/deal'));
    console.log('Has task:', body.includes('/task'));

    // Check console errors
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    // Reload and check
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    console.log('Console errors:', errors);

    // Check if the create form actually submits
    await page.goto(`${BASE}/settings`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const newBtn = await page.$('button:has-text("New Record Type")');
    if (newBtn) {
      await newBtn.click();
      await page.waitForTimeout(500);

      const nameInput = await page.$('input[placeholder="e.g. Deal"]');
      if (nameInput) await nameInput.fill('TestType');

      // Add field
      const addBtn = await page.$('button:has-text("+ Add Field")');
      if (addBtn) {
        await addBtn.click();
        await page.waitForTimeout(200);
        const nameFields = await page.$$('input[placeholder="field_name"]');
        if (nameFields[0]) await nameFields[0].fill('testfield');
        const labelFields = await page.$$('input[placeholder="Label"]');
        if (labelFields[0]) await labelFields[0].fill('Test Field');
      }

      // Check form values
      const slugInput = await page.$('input[placeholder="e.g. deal"]');
      const slugVal = slugInput ? await slugInput.inputValue() : 'EMPTY';
      const nameVal = nameInput ? await nameInput.inputValue() : 'EMPTY';
      console.log('Form values - name:', nameVal, 'slug:', slugVal);

      const createBtn = await page.$('button:has-text("Create Record Type")');
      if (createBtn) {
        // Use Promise.all to wait for navigation and response
        const [response] = await Promise.all([
          page.waitForResponse(resp => resp.url().includes('record_types') || resp.status() >= 400, { timeout: 10000 }).catch(() => null),
          createBtn.click()
        ]);
        
        if (response) {
          console.log('Response status:', response.status());
          const text = await response.text().catch(() => '');
          console.log('Response body:', text.slice(0, 200));
        }
        
        await page.waitForTimeout(3000);
      }
    }

  } catch (err) {
    console.log('Error:', err.message);
  }

  await browser.close();
}

run().catch(() => {});
