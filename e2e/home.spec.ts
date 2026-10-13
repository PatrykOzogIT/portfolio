import { expect, test } from '@playwright/test';
import { trackErrors } from './helpers';

for (const lang of ['pl', 'en'] as const) {
  test(`home page renders in ${lang} without errors`, async ({ page }) => {
    const assertNoErrors = trackErrors(page);
    await page.goto(`/${lang}`);

    await expect(page.locator('html')).toHaveAttribute('lang', lang);
    await expect(page).toHaveTitle(/Patryk Ożóg/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Patryk Ożóg');

    const sectionIds = await page
      .locator('main section[id]')
      .evaluateAll((s) => s.map((e) => e.id));
    expect(sectionIds).toEqual(['expertise', 'ecosystem', 'technology', 'projects', 'contact']);
    assertNoErrors();
  });
}

test('the root redirects to the Polish version', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/pl$/);
});

test('prerendered HTML contains the content before any JavaScript runs', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/en');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Patryk Ożóg');
  await expect(page.locator('#ecosystem')).toContainText('Enterprise Resource Planning');
  await context.close();
});

test('the skip link is the first focusable element and targets the main content', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'keyboard scenario');
  await page.goto('/pl');
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Przejdź do treści' });
  await expect(skip).toBeFocused();
  await expect(skip).toHaveAttribute('href', '/pl#main');
});

test('unknown pages return 404 with a not-found page that is not indexed', async ({ page }) => {
  const response = await page.goto('/pl/does-not-exist');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Nie znaleziono strony');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
});
