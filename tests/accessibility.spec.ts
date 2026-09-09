import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const routes = ['/', '/privacy', '/terms', '/support'] as const;

for (const route of routes) {
  test(`${route} has no automatically detectable WCAG A or AA violations`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(route);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();

    expect(results.violations).toEqual([]);
  });
}

test('small phone remains usable at 200% text size', async ({ page }, testInfo) => {
  test.skip(
    (testInfo.project.use.viewport?.width ?? 1280) > 320,
    'Small-phone project owns the reflow gate.',
  );

  await page.goto('/');
  await page.locator('html').evaluate((node) => {
    node.style.fontSize = '200%';
  });

  const layout = await page.evaluate(() => ({
    pageWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth,
  }));
  expect(layout.pageWidth - layout.viewportWidth).toBeLessThanOrEqual(1);

  const closing = page.getByRole('region', { name: 'Ready when you are.' });
  await closing.scrollIntoViewIfNeeded();
  await expect(closing.getByRole('link', { name: 'Support' })).toBeVisible();
});
