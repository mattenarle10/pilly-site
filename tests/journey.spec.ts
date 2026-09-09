import { expect, test } from '@playwright/test';

test('desktop wheel creates continuous horizontal travel', async ({ page }, testInfo) => {
  test.skip(Boolean(testInfo.project.use.hasTouch), 'Mouse-wheel navigation is desktop-only.');

  await page.goto('/');
  const journey = page.getByRole('region', { name: 'Pilly product tour' });

  await page.mouse.move(20, 20);
  await page.mouse.wheel(0, 360);

  await expect.poll(() => journey.evaluate((node) => node.scrollLeft)).toBeGreaterThan(100);
  const position = await journey.evaluate((node) => ({
    left: node.scrollLeft,
    width: node.clientWidth,
  }));
  expect(position.left).toBeLessThan(position.width - 100);
  expect(await page.evaluate(() => window.scrollY)).toBe(0);

  await page.mouse.wheel(0, -360);
  await expect.poll(() => journey.evaluate((node) => Math.abs(node.scrollLeft) <= 2)).toBe(true);
});

test('desktop journey supports explicit keyboard navigation', async ({ page }, testInfo) => {
  test.skip(
    Boolean(testInfo.project.use.hasTouch),
    'Keyboard journey enhancement is desktop-only.',
  );

  await page.goto('/');
  const journey = page.getByRole('region', { name: 'Pilly product tour' });
  await journey.focus();
  await page.keyboard.press('End');

  await expect
    .poll(() =>
      journey.evaluate((node) => Math.abs(node.scrollWidth - node.clientWidth - node.scrollLeft)),
    )
    .toBeLessThanOrEqual(2);

  await page.keyboard.press('Home');
  await expect
    .poll(() => journey.evaluate((node) => Math.abs(node.scrollLeft)))
    .toBeLessThanOrEqual(2);
});

test('touch viewports use normal vertical document flow', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.use.hasTouch, 'Vertical reflow is covered on touch viewports.');

  await page.goto('/');
  const journey = page.getByRole('region', { name: 'Pilly product tour' });
  const layout = await page.evaluate(() => ({
    viewportHeight: window.innerHeight,
    pageHeight: document.documentElement.scrollHeight,
    pageWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth,
  }));

  expect(layout.pageHeight).toBeGreaterThan(layout.viewportHeight * 3);
  expect(layout.pageWidth - layout.viewportWidth).toBeLessThanOrEqual(1);
  await expect(journey).not.toHaveAttribute('tabindex');

  const closing = page.getByRole('region', { name: 'Ready when you are.' });
  await closing.scrollIntoViewIfNeeded();
  await expect(closing.getByRole('link', { name: /join early access/i })).toBeVisible();
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
});

test('touch scrolling continuously blends scene backgrounds', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.use.hasTouch, 'Vertical background motion is touch-only.');

  await page.goto('/');
  const journey = page.getByRole('region', { name: 'Pilly product tour' });
  await expect(journey).toHaveAttribute('data-axis', 'vertical');
  const first = await journey.evaluate((node) => getComputedStyle(node).backgroundColor);

  await page.getByRole('region', { name: 'Your routine, at a glance.' }).scrollIntoViewIfNeeded();
  await expect
    .poll(() => journey.evaluate((node) => getComputedStyle(node).backgroundColor))
    .not.toBe(first);
});

test('closing copy keeps its mobile gutters', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.use.hasTouch, 'Mobile projects own the gutter gate.');

  await page.goto('/');
  const heading = page.getByRole('heading', { name: 'Ready when you are.' });
  await heading.scrollIntoViewIfNeeded();
  const box = await heading.boundingBox();
  const viewport = page.viewportSize();

  expect(box).not.toBeNull();
  expect(viewport).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(12);
  expect(box!.x + box!.width).toBeLessThanOrEqual(viewport!.width - 12);
});

test('reduced motion keeps the desktop experience vertically scrollable', async ({
  page,
}, testInfo) => {
  test.skip(Boolean(testInfo.project.use.hasTouch), 'Desktop capability fallback is enough here.');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');

  const journey = page.getByRole('region', { name: 'Pilly product tour' });
  const layout = await journey.evaluate((node) => ({
    pageHeight: document.documentElement.scrollHeight,
    viewportHeight: window.innerHeight,
    overflow: getComputedStyle(document.body).overflowY,
    horizontalOverflow: node.scrollWidth - node.clientWidth,
  }));

  expect(layout.pageHeight).toBeGreaterThan(layout.viewportHeight * 3);
  expect(layout.overflow).toBe('auto');
  expect(layout.horizontalOverflow).toBeLessThanOrEqual(1);
  await expect(journey).not.toHaveAttribute('tabindex');
});

test('the desktop canvas background fades between scenes', async ({ page }, testInfo) => {
  test.skip(
    Boolean(testInfo.project.use.hasTouch),
    'Canvas interpolation is a desktop enhancement.',
  );

  await page.goto('/');
  const journey = page.getByRole('region', { name: 'Pilly product tour' });
  const first = await journey.evaluate((node) => getComputedStyle(node).backgroundColor);

  await journey.evaluate((node) => node.scrollTo({ left: node.clientWidth, behavior: 'auto' }));
  await expect
    .poll(() => journey.evaluate((node) => getComputedStyle(node).backgroundColor))
    .not.toBe(first);
});
