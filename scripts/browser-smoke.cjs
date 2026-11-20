/** Smoke test against the running LOCAL KUJUK sandbox. Requires Playwright Chromium. */
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const { chromium } = require('playwright-core');

(async () => {
  const origin = new URL(process.env.KUJUK_TEST_URL || 'http://127.0.0.1:3000');
  assert(['127.0.0.1', 'localhost'].includes(origin.hostname), 'Use the local sandbox only');
  assert.equal((await (await fetch(new URL('/api/health', origin))).json()).store, 'memory');
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined, headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    const goto = path => page.goto(new URL(path, origin).toString());
    const first = page.locator('main article').first();
    await goto('/');
    await page.getByRole('heading', { name: /Your Order.*Your Way\./ }).waitFor();
    await page.getByRole('heading', { name: 'Shop by Category' }).waitFor();
    await page.getByRole('button', { name: 'العربية' }).first().click();
    await page.locator('html[lang="ar"][dir="rtl"]').waitFor({ state: 'attached' });
    await page.setViewportSize({ width: 390, height: 844 });
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'Arabic homepage should not overflow mobile viewport');
    await page.getByRole('button', { name: 'English' }).first().click();
    await page.locator('html[lang="en"][dir="ltr"]').waitFor({ state: 'attached' });
    await goto('/register');
    const email = `browser-${randomUUID()}@example.test`;
    await page.locator('#reg-name').fill('KUJUK Browser QA');
    await page.locator('#reg-email').fill(email);
    await page.locator('#reg-password').fill('BrowserFixture42!');
    await page.locator('#reg-confirm').fill('BrowserFixture42!');
    await page.locator('form').getByRole('button', { name: 'Create Account' }).click();
    await page.waitForURL('**/');
    // Reauthenticate independently rather than relying on the registration session.
    await page.evaluate(() => localStorage.removeItem('kujuk.token'));
    await goto('/login');
    await page.locator('#login-email').fill(email);
    await page.locator('#login-password').fill('BrowserFixture42!');
    await page.locator('form').getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL('**/');
    const search = page.locator('input[type=search]:visible');
    await search.fill('watch');
    await search.press('Enter');
    await page.waitForURL('**/search?q=watch');
    await first.getByRole('link', { name: /Pulse Pro Smart Watch/ }).first().click();
    await page.getByRole('heading', { name: 'Pulse Pro Smart Watch' }).waitFor();
    await page.getByRole('button', { name: 'Add to Cart', exact: true }).first().click();
    await page.locator('header a[href="/cart"]').click();
    await page.getByRole('button', { name: 'Proceed to Checkout' }).click();
    await page.locator('#co-phone').fill('+201111111111');
    await page.locator('#co-city').fill('Cairo');
    await page.locator('#co-area').fill('Nasr City');
    await page.locator('#co-address').fill('10 Test Street');
    await page.getByRole('button', { name: /Place Order/ }).click();
    await page.getByRole('heading', { name: 'Order placed successfully!' }).waitFor();
    await page.getByRole('link', { name: 'Track your order' }).click();
    await page.waitForURL('**/orders/track?ref=*');
    await page.getByText(/^KUJUK-[a-f0-9]{32}$/).waitFor();
    assert.deepEqual(errors, [], 'No uncaught runtime errors');
    console.log('PASS: desktop/mobile, en/ar RTL, registration, login, search, product, cart, COD checkout and order tracking');
  } finally { await browser.close(); }
})().catch(err => { console.error(err); process.exitCode = 1; });
