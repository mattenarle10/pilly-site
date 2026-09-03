import { expect, test } from '@playwright/test';

test('wheel creates continuous horizontal travel without vertical movement', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Mouse-wheel navigation is desktop-only.');

  await page.goto('/');
  const deck = page.getByLabel('Pilly product tour');

  await page.mouse.move(20, 20);
  await page.mouse.wheel(0, 360);

  await expect.poll(() => deck.evaluate((node) => node.scrollLeft)).toBeGreaterThan(100);
  const position = await deck.evaluate((node) => ({
    left: node.scrollLeft,
    width: node.clientWidth,
  }));
  expect(position.left).toBeLessThan(position.width - 100);
  expect(await page.evaluate(() => window.scrollY)).toBe(0);

  await page.mouse.wheel(0, -360);
  await expect.poll(() => deck.evaluate((node) => Math.abs(node.scrollLeft) <= 2)).toBe(true);
});

test('touch-sized viewport can rest between scenes', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'iphone', 'Touch-sized acceptance is covered on iPhone.');

  await page.goto('/');
  const deck = page.getByLabel('Pilly product tour');
  await deck.evaluate((node) => node.scrollTo({ left: node.clientWidth * 0.5, behavior: 'auto' }));

  const position = await deck.evaluate((node) => ({
    left: node.scrollLeft,
    width: node.clientWidth,
  }));
  expect(position.left).toBeGreaterThan(position.width * 0.45);
  expect(position.left).toBeLessThan(position.width * 0.55);
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
});

test('the header belongs to the first scene', async ({ page }) => {
  await page.goto('/');
  const deck = page.getByLabel('Pilly product tour');
  const header = page.locator('header').filter({ has: page.getByLabel('Pilly home') });

  await expect(header).toBeInViewport();
  await deck.evaluate((node) => node.scrollTo({ left: node.clientWidth, behavior: 'auto' }));
  await expect(header).not.toBeInViewport();
});

test('the canvas background fades between scenes', async ({ page }) => {
  await page.goto('/');
  const deck = page.getByLabel('Pilly product tour');
  const first = await deck.evaluate((node) => getComputedStyle(node).backgroundColor);

  await deck.evaluate((node) => node.scrollTo({ left: node.clientWidth, behavior: 'auto' }));
  await expect
    .poll(() => deck.evaluate((node) => getComputedStyle(node).backgroundColor))
    .not.toBe(first);
});
