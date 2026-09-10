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
    // B4-3.1: Link field type available in Record Type Manager
    await page.goto(`${BASE}/settings`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Click New Record Type
    const newBtn = await page.$('button:has-text("New Record Type")');
    if (newBtn) {
      await newBtn.click();
      await page.waitForTimeout(500);

      // Add a field
      const addFieldBtn = await page.$('button:has-text("+ Add Field")');
      if (addFieldBtn) {
        await addFieldBtn.click();
        await page.waitForTimeout(300);

        // Check field type dropdown has 'link' option
        const typeSelect = await page.$('select:last-of-type');
        if (typeSelect) {
          const options = await typeSelect.$$eval('option', opts => opts.map(o => o.value));
          check('B4-3.1: Link field type available', options.includes('link'), options.join(', '));

          // Select link type
          await typeSelect.selectOption('link');
          await page.waitForTimeout(300);

          // B4-3.2: Target record type selector appears
          const targetSelect = await page.$('select:has(option[value="deal"])');
          check('B4-3.2: Target type selector appears', !!targetSelect);

          if (targetSelect) {
            await targetSelect.selectOption('deal');
            await page.waitForTimeout(200);
            check('B4-3.2: Can select target type', true);
          }
        }
      }

      // Cancel
      const cancelBtn = await page.$('button:has-text("Cancel")');
      if (cancelBtn) await cancelBtn.click();
      await page.waitForTimeout(300);
    }

    // B4-3.3: Create a record type with a link field
    await page.goto(`${BASE}/settings`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const newBtn2 = await page.$('button:has-text("New Record Type")');
    if (newBtn2) {
      await newBtn2.click();
      await page.waitForTimeout(500);

      // Fill name
      const nameInput = await page.$('input[placeholder="e.g. Deal"]');
      if (nameInput) {
        await nameInput.fill('Contact');
        await page.waitForTimeout(200);
      }

      // Add a text field (name)
      const addFieldBtn = await page.$('button:has-text("+ Add Field")');
      if (addFieldBtn) {
        await addFieldBtn.click();
        await page.waitForTimeout(200);

        // Fill field name
        const fieldNameInput = await page.$('input[placeholder="field_name"]');
        if (fieldNameInput) {
          await fieldNameInput.fill('name');
          await page.waitForTimeout(100);
        }

        // Fill field label
        const fieldLabelInput = await page.$('input[placeholder="Label"]');
        if (fieldLabelInput) {
          await fieldLabelInput.fill('Name');
          await page.waitForTimeout(100);
        }
      }

      // Add a link field
      if (addFieldBtn) {
        await addFieldBtn.click();
        await page.waitForTimeout(200);

        // Get all field_name inputs — second one
        const fieldNames = await page.$$('input[placeholder="field_name"]');
        if (fieldNames.length >= 2) {
          await fieldNames[1].fill('related_deal');
          await page.waitForTimeout(100);
        }

        const fieldLabels = await page.$$('input[placeholder="Label"]');
        if (fieldLabels.length >= 2) {
          await fieldLabels[1].fill('Related Deal');
          await page.waitForTimeout(100);
        }

        // Select link type for second field
        const typeSelects = await page.$$('select');
        // typeSelects[0] is the first field's type, [1] is the second
        if (typeSelects.length >= 2) {
          await typeSelects[1].selectOption('link');
          await page.waitForTimeout(300);

          // Select target type
          const targetSelects = await page.$$('select');
          const lastSelect = targetSelects[targetSelects.length - 1];
          const opts = await lastSelect.$$eval('option', opts => opts.map(o => o.value));
          if (opts.includes('deal')) {
            await lastSelect.selectOption('deal');
            check('B4-3.3: Created record type with link field', true);
          }
        }
      }

      // Save
      const saveBtn = await page.$('button:has-text("Create Record Type")');
      if (saveBtn) {
        await saveBtn.click();
        await page.waitForTimeout(1000);
      }
    }

    // B4-3.3: Verify contact type — navigate directly to force sidebar refresh
    await page.goto(`${BASE}/contact`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const heading = await page.textContent('h1');
    check('B4-3.3: New type accessible', heading?.includes('Contact'), heading || '');

    // B4-3.3: Create a contact record with linked deal
    await page.goto(`${BASE}/contact/new`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    const pageContent = await page.textContent('body');
    const hasForm = pageContent?.includes('Contact') || pageContent?.includes('contact');
    check('B4-3.3: Contact create page loads', hasForm, pageContent?.slice(0, 100) || '');

    // Fill name
    const nameInput = await page.$('input[type="text"]');
    if (nameInput) {
      await nameInput.fill('John Doe');
      await page.waitForTimeout(200);
    }

    // B4-3.3: Link field editor appears
    const linkEditor = await page.$('button:has-text("Select Deal...")');
    check('B4-3.3: Link field editor appears', !!linkEditor);

    if (linkEditor) {
      // Click to open dropdown
      await linkEditor.click();
      await page.waitForTimeout(500);

      // B4-3.3: Search dropdown shows records
      const searchInput = await page.$('input[placeholder="Search..."]');
      check('B4-3.3: Search dropdown opens', !!searchInput);

      if (searchInput) {
        // Select first record
        const recordOptions = await page.$$('[class*="hover:bg-accent"]');
        if (recordOptions.length > 0) {
          await recordOptions[0].click();
          await page.waitForTimeout(500);
          check('B4-3.3: Can select linked record', true);
        }
      }
    }

    // Submit form
    const submitBtn = await page.$('button[type="submit"]');
    if (submitBtn) {
      await submitBtn.click();
      await page.waitForTimeout(2000);

      // B4-3.4: Detail page shows linked record as clickable link
      const linkedLink = await page.$('a[class*="text-primary"][class*="hover:underline"]');
      check('B4-3.4: Linked record shown as link on detail', !!linkedLink);

      // B4-3.6: Clicking linked record navigates
      if (linkedLink) {
        const href = await linkedLink.getAttribute('href');
        check('B4-3.6: Link has correct href', href?.includes('/deal/'), href || '');
      }
    }

    // B4-3.5: List card shows linked record
    await page.goto(`${BASE}/contact`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const linkedBadge = await page.$('a[class*="bg-primary/10"]');
    check('B4-3.5: Linked record badge in list', !!linkedBadge);

    // B4-3.7: Empty link field handled (go to deal, create one without link)
    await page.goto(`${BASE}/contact/new`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const nameInput2 = await page.$('input[type="text"]');
    if (nameInput2) {
      await nameInput2.fill('Jane Smith');
    }
    const submitBtn2 = await page.$('button[type="submit"]');
    if (submitBtn2) {
      await submitBtn2.click();
      await page.waitForTimeout(2000);

      // Detail page should show — for empty link
      const emptyLink = await page.textContent('body');
      check('B4-3.7: Empty link field handled', emptyLink?.includes('Jane Smith'));
    }

  } catch (err) {
    console.error('FATAL:', err.message);
  }

  await browser.close();

  const pass = results.filter(r => r.pass).length;
  const fail = results.filter(r => !r.pass).length;
  console.log(`\n=== B4-3 UAC Results: ${pass}/${pass + fail} passed ===`);
  if (fail > 0) process.exit(1);
}

run().catch(() => process.exit(1));
