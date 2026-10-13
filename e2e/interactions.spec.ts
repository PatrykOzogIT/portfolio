import { expect, test } from '@playwright/test';
import { disableSmoothScroll } from './helpers';

test.describe('ecosystem', () => {
  test('keyboard: arrows move between systems, Home jumps to the first', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'keyboard scenario');
    await page.goto('/pl');
    const erp = page.getByRole('tab', { name: /ERP/ });
    await expect(erp).toHaveAttribute('aria-selected', 'true');

    await erp.focus();
    await page.keyboard.press('ArrowRight');
    const wms = page.getByRole('tab', { name: /WMS/ });
    await expect(wms).toBeFocused();
    await expect(wms).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('#eco-panel-wms')).toBeVisible();
    await expect(page.locator('#eco-panel-erp')).toBeHidden();

    await page.keyboard.press('Home');
    await expect(page.getByRole('tab', { name: /B2B/ })).toBeFocused();
  });

  test('phone: the sticky switcher selects a system', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'mobile layout');
    await page.goto('/pl');
    await disableSmoothScroll(page);
    await page.locator('#ecosystem .switcher').scrollIntoViewIfNeeded();
    await page.locator('#ecosystem .switch', { hasText: 'WMS' }).click();
    await expect(page.locator('#eco-panel-wms')).toBeVisible();
  });
});

test.describe('contact', () => {
  test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

  test('copying the email address confirms it and fills the clipboard', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'clipboard permissions are desktop-only');
    await page.goto('/pl');
    await page.getByRole('button', { name: 'Kopiuj adres' }).click();
    await expect(page.getByRole('status')).toHaveText('Adres skopiowany do schowka');
    const clipboard = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboard).toBe('patrykozog.it@gmail.com');
  });
});

test.describe('motion', () => {
  test('sections below the fold reveal when scrolled into view', async ({ page }) => {
    await page.goto('/pl');
    const contact = page.locator('section#contact');
    await expect(contact).toHaveClass(/reveal-pending/);
    await contact.scrollIntoViewIfNeeded();
    await expect(contact).not.toHaveClass(/reveal-pending/);
  });

  test('nothing is hidden or animated with reduced motion', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto('/pl');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('.reveal-pending')).toHaveCount(0);
    await context.close();
  });
});
