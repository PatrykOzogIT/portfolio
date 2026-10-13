import { expect, type Page } from '@playwright/test';

/** Fails the test on uncaught errors and console errors (missing files, runtime exceptions…). */
export function trackErrors(page: Page): () => void {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  return () => expect(errors, 'console / page errors').toEqual([]);
}

/** The page must never scroll horizontally. */
export async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  const { scrollWidth, innerWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  }));
  expect(scrollWidth, 'horizontal overflow').toBeLessThanOrEqual(innerWidth);
}

/** Smooth scrolling makes position assertions flaky; tests check positions, not the animation. */
export async function disableSmoothScroll(page: Page): Promise<void> {
  await page.addStyleTag({ content: 'html { scroll-behavior: auto !important; }' });
}
