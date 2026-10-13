import { expect, test } from '@playwright/test';
import { disableSmoothScroll, expectNoHorizontalOverflow } from './helpers';

test('switching language keeps the page, the scroll position and the focus', async ({ page }) => {
  await page.goto('/pl/projects/alpha');
  await disableSmoothScroll(page);
  await page.evaluate(() => window.scrollTo(0, 600));

  // Keyboard activation. (A pointer click would let Playwright scroll the sticky header link
  // "into view" first, moving the page by itself and invalidating the measurement.)
  const en = page.getByRole('link', { name: 'EN – English' });
  await en.focus();
  await page.keyboard.press('Enter');

  await expect(page).toHaveURL(/\/en\/projects\/alpha$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Alpha EN');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  expect(Math.abs((await page.evaluate(() => window.scrollY)) - 600)).toBeLessThanOrEqual(2);
  await expect(page.getByRole('link', { name: 'EN – English' })).toBeFocused();
});

test('a section link scrolls below the sticky header and marks the menu item', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'desktop navigation');
  await page.goto('/pl');
  await disableSmoothScroll(page);
  const link = page.locator('app-header .nav').getByRole('link', { name: 'Ekosystem' });
  await link.click();

  await expect(page).toHaveURL(/#ecosystem$/);
  const top = await page.locator('#ecosystem').evaluate((el) => el.getBoundingClientRect().top);
  expect(top).toBeGreaterThanOrEqual(60);
  expect(top).toBeLessThanOrEqual(100);
  await expect(link).toHaveAttribute('aria-current', 'true');
});

test('mobile menu opens, closes with Escape and navigates', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'mobile layout');
  await page.goto('/pl');
  const menu = page.locator('#mobile-nav');

  await page.getByRole('button', { name: 'Otwórz menu' }).click();
  await expect(menu).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(menu).toBeHidden();

  await page.getByRole('button', { name: 'Otwórz menu' }).click();
  await menu.getByRole('link', { name: 'Kontakt' }).click();
  await expect(menu).toBeHidden();
  await expect(page).toHaveURL(/#contact$/);
});

test.describe('no horizontal scrolling', () => {
  const pages = ['/pl', '/en', '/pl/projects/alpha', '/pl/projects/gamma', '/pl/not-found'];
  const widths = [320, 375, 768, 1024, 1440];

  for (const url of pages) {
    test(url, async ({ page }, testInfo) => {
      test.skip(testInfo.project.name === 'mobile', 'sets its own viewports');
      for (const width of widths) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(url);
        await expectNoHorizontalOverflow(page);
      }
    });
  }
});
