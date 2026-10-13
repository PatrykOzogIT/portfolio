import { expect, test } from '@playwright/test';
import { disableSmoothScroll, trackErrors } from './helpers';

test.describe('project cards', () => {
  test('list published projects in order, featured as a wide card', async ({ page }) => {
    await page.goto('/pl');
    const cards = page.locator('#projects app-project-card');
    await expect(cards).toHaveCount(2);
    await expect(cards.locator('h3')).toHaveText(['Alpha PL', 'Gamma PL']);
    await expect(cards.nth(1)).toHaveClass(/wide/);
  });

  test('never show unpublished projects', async ({ page }) => {
    await page.goto('/pl');
    await expect(page.locator('body')).not.toContainText('BETA');
    const response = await page.goto('/pl/projects/beta');
    expect(response?.status()).toBe(404);
  });

  test('the whole card opens the project page', async ({ page }) => {
    await page.goto('/pl');
    // The stretched title link covers the card; clicking its centre must open the project.
    await page.locator('#projects app-project-card').first().click();
    await expect(page).toHaveURL(/\/pl\/projects\/alpha$/);
  });
});

test.describe('project page', () => {
  test('shows only sections with content and the right links', async ({ page }) => {
    const assertNoErrors = trackErrors(page);
    await page.goto('/pl/projects/alpha');

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Alpha PL');
    await expect(page.locator('.block-title')).toHaveText([
      '01 O projekcie',
      '02 Funkcjonalności',
      '03 Architektura',
      '04 Galeria',
    ]);
    const github = page.getByRole('link', { name: /Kod na GitHub/ });
    await expect(github).toHaveAttribute('target', '_blank');
    await expect(github).toHaveAttribute('rel', 'noopener noreferrer');
    await expect(page.getByRole('link', { name: /Live Demo/ })).toHaveCount(0);
    assertNoErrors();
  });

  test('a single image is shown without carousel controls', async ({ page }) => {
    await page.goto('/pl/projects/alpha');
    await expect(page.locator('app-gallery figure')).toHaveCount(1);
    await expect(page.locator('app-gallery .carousel')).toHaveCount(0);
  });

  test('a project without long-form text shows only its gallery', async ({ page }) => {
    await page.goto('/pl/projects/gamma');
    await expect(page.locator('.block-title')).toHaveText(['01 Galeria']);
    await expect(page.locator('app-gallery .counter')).toHaveText('1 / 3');
    await expect(page.getByRole('link', { name: /Live Demo/ })).toBeVisible();
  });

  test('previous / next navigation starts the next project at the top', async ({ page }) => {
    await page.goto('/pl/projects/alpha');
    await expect(page.locator('.pager')).not.toContainText('Poprzedni projekt');
    await page.locator('.pager-card--next').click();
    await expect(page).toHaveURL(/\/pl\/projects\/gamma$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Gamma PL');
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
    await expect(page.locator('.pager')).not.toContainText('Następny projekt');
  });

  test('serves responsive WebP variants instead of the original images', async ({ page }) => {
    await page.goto('/pl/projects/alpha');
    const cover = page.locator('.cover img');
    await expect(cover).toHaveAttribute('srcset', /\/img\/projects\/alpha\/cover\.w\d+\.webp/);
  });
});

test.describe('gallery and viewer', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'keyboard scenario');
    await page.goto('/pl/projects/gamma');
    await disableSmoothScroll(page);
  });

  test('carousel moves with buttons and arrow keys', async ({ page }) => {
    const counter = page.locator('app-gallery .controls .counter');
    await page.getByRole('button', { name: 'Następne zdjęcie' }).click();
    await expect(counter).toHaveText('2 / 3');
    await page.locator('app-gallery .track').press('ArrowRight');
    await expect(counter).toHaveText('3 / 3');
    await expect(page.getByRole('button', { name: 'Następne zdjęcie' })).toBeDisabled();
  });

  test('viewer opens, navigates, closes with Escape and returns focus', async ({ page }) => {
    await page.locator('app-gallery .slide .frame').first().click();
    const viewer = page.locator('dialog.viewer');
    await expect(viewer).toBeVisible();
    await expect(viewer.locator('.counter')).toHaveText('1 / 3');

    await page.keyboard.press('ArrowRight');
    await expect(viewer.locator('.counter')).toHaveText('2 / 3');

    await page.keyboard.press('Escape');
    await expect(viewer).toBeHidden();
    await expect(page.locator('app-gallery .controls .counter')).toHaveText('2 / 3');
    await expect(page.locator('app-gallery .slide').nth(1).locator('.frame')).toBeFocused();
  });
});
