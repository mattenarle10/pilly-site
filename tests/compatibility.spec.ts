import { expect, test } from '@playwright/test';

for (const route of ['/', '/privacy', '/terms', '/support']) {
  test(`${route} reflows at 200% with ordinary text wrapping`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 700 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(route);
    await page.addStyleTag({
      content: 'html { font-size: 200%; } * { text-wrap: wrap !important; }',
    });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
    ).toBeLessThanOrEqual(1);
    for (const heading of await page.getByRole('heading').all()) {
      await heading.scrollIntoViewIfNeeded();
      const box = await heading.boundingBox();
      expect(box!.x).toBeGreaterThanOrEqual(-1);
      expect(box!.x + box!.width).toBeLessThanOrEqual(321);
    }
    const support = page
      .getByRole('navigation', { name: 'Legal and support' })
      .getByRole('link', { name: 'Support', exact: true });
    await support.scrollIntoViewIfNeeded();
    await expect(support).toBeInViewport();
  });
}

test('all sections fit a narrow desktop viewport', async ({ page }, testInfo) => {
  test.skip(Boolean(testInfo.project.use.hasTouch), 'Horizontal desktop layout.');
  await page.setViewportSize({ width: 901, height: 900 });
  await page.goto('/');
  const scenes = page.locator('[data-journey-scene]');
  for (let index = 0; index < (await scenes.count()); index++) {
    await page.locator('[data-axis]').evaluate((node, value) => {
      node.scrollLeft = node.clientWidth * value;
    }, index);
    for (const item of await scenes
      .nth(index)
      .locator('h1, h2, button, [data-motion-group]')
      .all()) {
      await expect(item).toBeInViewport({ ratio: 0.999 });
    }
  }
});
