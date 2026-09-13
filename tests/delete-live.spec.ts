import { test, expect } from '@playwright/test';

const SUPABASE_URL = 'https://vhgcmdgmmvarkqjfcytj.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoZ2NtZGdtbXZhcmtxamZjeXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5ODE3MzcsImV4cCI6MjEwNDU1NzczN30.1S8WuGio75wlZb3BIPbiIMz2f--AZHR7de8_QmAMEwY';
const apiHeaders = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  Prefer: 'return=representation',
};

const PROD_URL = 'https://simple-orm.vercel.app';

test('FULL E2E: create task via UI → delete via UI → verify DB', async ({ page, request }) => {
  // 1. Go to task/new
  await page.goto(`${PROD_URL}/task/new`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // 2. Fill the title field
  const titleInput = page.locator('input').first();
  await expect(titleInput).toBeVisible({ timeout: 10000 });
  const testTitle = 'E2E Delete Test ' + Date.now();
  await titleInput.fill(testTitle);

  // 3. Submit form
  await page.locator('button[type="submit"]').click();
  await page.waitForTimeout(3000);

  // 4. Verify we navigated somewhere on /task
  console.log('After create URL:', page.url());
  expect(page.url()).toContain('/task');

  // 5. Find the record we just created via DB
  const listRes = await request.get(
    `${SUPABASE_URL}/rest/v1/records?record_type_id=eq.task&select=id,data&order=created_at.desc&limit=5`,
    { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
  );
  const allRecent = await listRes.json();
  const latest = allRecent.find((r: any) => r.data.title === testTitle);
  expect(latest).toBeTruthy();
  const recordId = latest.id;
  console.log('Created record:', recordId, 'title:', latest.data.title);

  // 6. Navigate to detail page
  await page.goto(`${PROD_URL}/task/${recordId}`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // 7. Verify detail page loaded with the title
  const pageContent = await page.textContent('body');
  console.log('Detail page has title:', pageContent?.includes(latest.data.title));
  expect(pageContent).toContain(latest.data.title);

  // 8. Click Delete button
  const deleteBtn = page.locator('button:has-text("Delete")');
  await expect(deleteBtn).toBeVisible({ timeout: 5000 });
  console.log('Clicking Delete...');
  await deleteBtn.click();
  await page.waitForTimeout(1000);

  // 9. Confirm dialog should appear
  const confirmDialog = page.locator('.fixed.inset-0.z-50');
  await expect(confirmDialog).toBeVisible({ timeout: 5000 });
  console.log('Confirm dialog appeared');

  // 10. Click the confirm (destructive) button inside the dialog
  const confirmBtn = confirmDialog.locator('button:has-text("Delete")');
  await expect(confirmBtn).toBeVisible();
  console.log('Clicking confirm Delete...');
  await confirmBtn.click();

  // 11. Wait for redirect to task list
  await page.waitForURL('**/task', { timeout: 10000 });
  console.log('Redirected to:', page.url());
  expect(page.url()).not.toContain(recordId);

  // 12. Reload and verify record is gone from the page
  await page.reload();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  const bodyAfter = await page.textContent('body');
  expect(bodyAfter).not.toContain(latest.data.title);

  // 13. Verify record is deleted from DB
  const dbCheck = await request.get(
    `${SUPABASE_URL}/rest/v1/records?id=eq.${recordId}&select=id`,
    { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
  );
  const remaining = (await dbCheck.json()).length;
  console.log('Records remaining in DB:', remaining);
  expect(remaining).toBe(0);

  console.log('DELETE VERIFIED SUCCESSFULLY');
});
