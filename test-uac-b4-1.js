import { chromium } from 'playwright';

const BASE = 'https://simple-orm.vercel.app';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const desktopPage = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const mobilePage = await browser.newPage({ viewport: { width: 375, height: 667 } });
  const results = [];

  const check = (name, pass, detail = '') => {
    results.push({ check: name, pass, detail });
    console.log(`${pass ? '✅' : '❌'} ${name}${detail ? ' — ' + detail : ''}`);
  };

  try {
    // === DESKTOP ===
    await desktopPage.goto(`${BASE}/deal`, { waitUntil: 'networkidle' });
    await desktopPage.waitForTimeout(2000);

    const desktopSidebar = await desktopPage.$('aside');
    const sidebarVisible = desktopSidebar ? await desktopSidebar.isVisible() : false;
    check('B4-1.6: Sidebar visible on desktop', sidebarVisible);

    const desktopHamburger = await desktopPage.$('button:has(svg path[d*="M3.75 6.75"])');
    const hamburgerHiddenDesktop = desktopHamburger ? !(await desktopHamburger.isVisible()) : true;
    check('B4-1.1: Hamburger hidden on desktop', hamburgerHiddenDesktop);

    const desktopLinks = await desktopPage.$$('aside a');
    check('B4-1.4: Desktop nav links present', desktopLinks.length >= 4, `${desktopLinks.length} links`);

    const settingsLink = await desktopPage.$('a[href="/settings"]');
    check('B4-1.5: Settings link on desktop', !!settingsLink);
    await desktopPage.close();

    // === MOBILE ===
    await mobilePage.goto(`${BASE}/deal`, { waitUntil: 'networkidle' });
    await mobilePage.waitForTimeout(2000);

    // B4-1.1: Hamburger visible on mobile
    const mobileHamburger = await mobilePage.$('button:has(svg path[d*="M3.75 6.75"])');
    const hamburgerVisibleMobile = mobileHamburger ? await mobileHamburger.isVisible() : false;
    check('B4-1.1: Hamburger visible on mobile', hamburgerVisibleMobile);

    // B4-1.2: Sidebar hidden by default — check transform class
    const sidebarClasses = await mobilePage.$eval('aside', el => el.className);
    const isTranslated = sidebarClasses.includes('-translate-x-full');
    check('B4-1.2: Sidebar hidden by default on mobile', isTranslated);

    // B4-1.2: Tap hamburger opens sidebar
    if (mobileHamburger) {
      await mobileHamburger.click();
      await mobilePage.waitForTimeout(500);
      const openClasses = await mobilePage.$eval('aside', el => el.className);
      const isOpen = openClasses.includes('translate-x-0') && !openClasses.includes('-translate-x-full');
      check('B4-1.2: Sidebar opens on hamburger tap', isOpen);

      // B4-1.3: Backdrop exists
      const backdrop = await mobilePage.$('.fixed.inset-0.bg-black\\/50');
      check('B4-1.3: Backdrop visible when open', !!backdrop);

      // B4-1.4: Mobile nav links
      const mobileNavLinks = await mobilePage.$$('aside nav a');
      check('B4-1.4: Mobile nav links present', mobileNavLinks.length >= 4, `${mobileNavLinks.length} links`);

      // B4-1.5: Settings link on mobile
      const mobileSettingsLink = await mobilePage.$('a[href="/settings"]');
      check('B4-1.5: Settings link on mobile', !!mobileSettingsLink);

      // Close via X button
      const closeBtn = await mobilePage.$('aside button:has(svg path[d*="M6 18"])');
      if (closeBtn) {
        await closeBtn.click();
        await mobilePage.waitForTimeout(500);
        const closedClasses = await mobilePage.$eval('aside', el => el.className);
        const isClosed = closedClasses.includes('-translate-x-full');
        check('B4-1.2: Sidebar closes on X button', isClosed);
      }

      // Re-open and test backdrop click (click to the right of sidebar)
      await mobileHamburger.click();
      await mobilePage.waitForTimeout(500);

      // Click at x=350 (beyond 256px sidebar width)
      await mobilePage.click('body', { position: { x: 350, y: 333 } });
      await mobilePage.waitForTimeout(500);
      const afterBackdropClick = await mobilePage.$eval('aside', el => el.className);
      const closedAfterBackdrop = afterBackdropClick.includes('-translate-x-full');
      check('B4-1.3: Sidebar closes on backdrop tap', closedAfterBackdrop);

      // Navigate to settings from mobile
      await mobileHamburger.click();
      await mobilePage.waitForTimeout(500);
      const settingsBtn = await mobilePage.$('a[href="/settings"]');
      if (settingsBtn) {
        await settingsBtn.click();
        await mobilePage.waitForTimeout(2000);
        const settingsHeading = await mobilePage.textContent('h1');
        check('B4-1.5: Settings page loads from mobile', settingsHeading?.includes('Record Types'), settingsHeading || '');
      }
    }

    await mobilePage.close();
  } catch (err) {
    console.error('FATAL:', err.message);
  }

  await browser.close();

  const pass = results.filter(r => r.pass).length;
  const fail = results.filter(r => !r.pass).length;
  console.log(`\n=== B4-1 UAC Results: ${pass}/${pass + fail} passed ===`);
  if (fail > 0) process.exit(1);
}

run().catch(() => process.exit(1));
