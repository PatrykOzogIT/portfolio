import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

async function jsonLd(page: import('@playwright/test').Page) {
  const raw = await page.locator('script[type="application/ld+json"]').first().textContent();
  return JSON.parse(raw ?? '{}') as Record<string, unknown>;
}

test.describe('SEO metadata in prerendered HTML', () => {
  test('home page', async ({ page }) => {
    await page.goto('/pl');
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      'content',
      /ERP, WMS i B2B/,
    );
    await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute('content', 'pl_PL');
    const person = await jsonLd(page);
    expect(person['@type']).toBe('Person');
    expect(person['sameAs']).toEqual([
      'https://github.com/PatrykOzogIT',
      'https://www.linkedin.com/in/patryk-ozog/',
    ]);
  });

  test('project page', async ({ page }) => {
    await page.goto('/en/projects/alpha');
    await expect(page).toHaveTitle('Alpha EN — Patryk Ożóg');
    const data = await jsonLd(page);
    expect(data['@type']).toBe('SoftwareSourceCode');
    expect(data['codeRepository']).toBe('https://github.com/PatrykOzogIT');
  });

  test('robots.txt is published', async ({ request }) => {
    const response = await request.get('/robots.txt');
    expect(response.ok()).toBe(true);
    expect(await response.text()).toContain('User-agent: *');
  });
});

test.describe('accessibility (axe, WCAG 2.2 AA)', () => {
  // Final colours, not mid-animation: sections fading in would be measured at partial opacity.
  test.use({ reducedMotion: 'reduce' });

  for (const url of ['/pl', '/en', '/pl/projects/alpha', '/pl/projects/gamma', '/pl/not-found']) {
    test(url, async ({ page }) => {
      await page.goto(url);
      const results = await new AxeBuilder({ page }).withTags(WCAG).analyze();
      expect(results.violations.map((v) => `${v.id}: ${v.help} (${v.nodes.length})`)).toEqual([]);
    });
  }

  test('open image viewer', async ({ page }) => {
    await page.goto('/pl/projects/gamma');
    await page.locator('app-gallery .slide .frame').first().click();
    await expect(page.locator('dialog.viewer')).toBeVisible();
    const results = await new AxeBuilder({ page }).withTags(WCAG).analyze();
    expect(results.violations.map((v) => `${v.id}: ${v.help} (${v.nodes.length})`)).toEqual([]);
  });

  test('open mobile menu', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'mobile layout');
    await page.goto('/pl');
    await page.getByRole('button', { name: 'Otwórz menu' }).click();
    const results = await new AxeBuilder({ page }).withTags(WCAG).analyze();
    expect(results.violations.map((v) => `${v.id}: ${v.help} (${v.nodes.length})`)).toEqual([]);
  });
});
