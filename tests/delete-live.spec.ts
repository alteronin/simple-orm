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

test('LIVE: delete record on production via real user clicks', async ({ page, request }) => {
  // 1. Create record via API
  const createRes = await request.post(`${SUPABASE_URL}/rest/v1/records`, {
    headers: apiHeaders,
    data: { record_type_id: 'task', data: { title: 'LIVE DELETE TEST' } },
  });
  const recordId = (await createRes.json())[0].id;
  console.log('Created record:', recordId);

  // 2. Navigate to production detail page
  await page.goto(`${PROD_URL}/task/${recordId}`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  const content = await page.content();
  console.log('Page loaded, has title:', content.includes('LIVE DELETE TEST'));
  console.log('URL:', page.url());

  // 3. Click the Delete button on the detail page
  const deleteBtn = page.locator('div.space-y-6 button:has-text("Delete")');
  console.log('Delete button visible:', await deleteBtn.isVisible());

  await deleteBtn.click();
  await page.waitForTimeout(1000);

  // 4. Confirm dialog
  const dialogVisible = await page.locator('.fixed.inset-0.z-50').isVisible();
  console.log('Confirm dialog visible:', dialogVisible);

  await page.locator('.fixed.inset-0.z-50 .bg-destructive').click();
  await page.waitForTimeout(5000);

  console.log('After delete URL:', page.url());

  // 5. Verify from DB
  const dbCheck = await request.get(
    `${SUPABASE_URL}/rest/v1/records?id=eq.${recordId}&select=id`,
    { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
  );
  const remaining = (await dbCheck.json()).length;
  console.log('Records remaining in DB:', remaining);
  expect(remaining).toBe(0);
});
