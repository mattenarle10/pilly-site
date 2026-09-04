import { expect, test } from '@playwright/test';

test('renders the accepted hero checkpoint', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Know what’s due. Keep moving.' })).toBeVisible();
  await expect(page.getByRole('link', { name: /join early access/i }).first()).toBeVisible();
  await expect(page.getByLabel('Medicine forms', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: /medicines/i })).toHaveCount(0);
  await expect(
    page.getByLabel('Medicine forms', { exact: true }).getByText('Tablet'),
  ).toBeVisible();
  await expect(page.locator('main section')).toHaveCount(4);
  await expect(page.getByRole('heading', { name: 'Ready when you are.' })).toBeVisible();
});

test('medicine ribbon remains a native horizontal strip', async ({ page }) => {
  await page.goto('/');
  const ribbon = page.getByLabel('Medicine forms', { exact: true });
  const before = await ribbon.evaluate((node) => node.scrollLeft);

  await ribbon.evaluate((node) => node.scrollBy({ left: 360, behavior: 'auto' }));

  await expect.poll(() => ribbon.evaluate((node) => node.scrollLeft)).toBeGreaterThan(before);

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
});

test('remains complete with reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.getByText('Inhaler')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Ready when you are.' })).toBeVisible();
});
