import { expect, test } from '@playwright/test';

test.beforeEach(async ({}, testInfo) => {
  test.skip(Boolean(testInfo.project.use.hasTouch), 'Desktop height and pointer regressions.');
});

for (const viewport of [
  { width: 951, height: 585 },
  { width: 951, height: 620 },
  { width: 1280, height: 720 },
  { width: 1280, height: 899 },
]) {
  test(`short desktop uses reachable vertical flow at ${viewport.width}x${viewport.height}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto('/');
    const journey = page.getByRole('region', { name: 'Pilly product tour' });
    await expect(journey).toHaveAttribute('data-axis', 'vertical');
    await expect(journey).not.toHaveAttribute('tabindex');
    await expect(page.locator('body')).toHaveCSS('overflow-y', 'auto');
    for (const item of await page
      .locator('h1, h2, [data-motion-group="routine"] article, button')
      .all()) {
      await item.scrollIntoViewIfNeeded();
      await expect(item).toBeInViewport({ ratio: 0.999 });
    }
    const support = page.getByRole('link', { name: 'Support', exact: true });
    await support.scrollIntoViewIfNeeded();
    await expect(support).toBeInViewport();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
    ).toBeLessThanOrEqual(1);
  });
}

test('desktop layout transitions retain the active section and selected medicine', async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/');
  const journey = page.getByRole('region', { name: 'Pilly product tour' });
  const scenes = page.locator('[data-journey-scene]');
  await expect(journey).toHaveAttribute('data-axis', 'horizontal');
  await journey.evaluate((node) =>
    node.scrollTo({ left: node.clientWidth * 2, behavior: 'instant' }),
  );
  const tablet = page.getByRole('button', { name: 'Tablet', exact: true });
  const peach = page.getByRole('button', { name: 'Peach and rose', exact: true });
  await tablet.click();
  await peach.click();

  for (const viewport of [
    { width: 1280, height: 899, mode: 'vertical' },
    { width: 1280, height: 900, mode: 'horizontal' },
    { width: 900, height: 900, mode: 'vertical' },
    { width: 901, height: 900, mode: 'horizontal' },
    { width: 1280, height: 900, mode: 'horizontal' },
  ]) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await expect(journey).toHaveAttribute('data-axis', viewport.mode);
    await expect(scenes.nth(2).getByRole('heading')).toBeInViewport();
    await expect(tablet).toBeInViewport({ ratio: 0.999 });
    await expect(tablet).toHaveAttribute('aria-pressed', 'true');
    await expect(peach).toHaveAttribute('aria-pressed', 'true');
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
    ).toBeLessThanOrEqual(1);
    const path = testInfo.outputPath(`identity-${viewport.width}x${viewport.height}.png`);
    await page.screenshot({ path });
    await testInfo.attach(`${viewport.width}x${viewport.height}`, {
      path,
      contentType: 'image/png',
    });
  }

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(journey).toHaveAttribute('data-axis', 'static');
  await expect(scenes.nth(2).getByRole('heading')).toBeInViewport();
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(journey).toHaveAttribute('data-axis', 'horizontal');
  await expect(tablet).toBeInViewport({ ratio: 0.999 });

  await journey.focus();
  await page.keyboard.press('End');
  await expect(scenes.last().getByRole('heading')).toBeInViewport({ ratio: 0.999 });
  await page.setViewportSize({ width: 951, height: 585 });
  await expect(journey).toHaveAttribute('data-axis', 'vertical');
  const heading = scenes.last().getByRole('heading');
  await expect(heading).toBeInViewport({ ratio: 0.999 });
  const scrollTop = await page.evaluate(() => scrollY);
  const heightIncrease = 620 - page.viewportSize()!.height;
  await page.setViewportSize({ width: 951, height: 620 });
  await expect(heading).toBeInViewport({ ratio: 0.999 });
  // Native resize anchoring can shift the offset by the viewport-height change, without resetting it.
  await expect
    .poll(() => page.evaluate((top) => Math.abs(scrollY - top), scrollTop))
    .toBeLessThanOrEqual(heightIncrease + 1);
  await page.screenshot({ path: testInfo.outputPath('short-desktop-closing.png') });

  const support = page.getByRole('link', { name: 'Support', exact: true });
  await support.click();
  await expect(page).toHaveURL(/\/support\/?$/);
  await expect(page.locator('html')).not.toHaveAttribute('data-horizontal-journey');
  await page.getByRole('link', { name: 'Pilly home' }).click();
  await expect(journey).toHaveAttribute('data-axis', 'vertical');
  expect(errors).toEqual([]);
});
