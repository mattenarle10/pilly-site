import { expect, test } from '@playwright/test';

test('landing page exposes its product promise and legal routes', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1 })).toContainText('Know what’s due.');
  await expect(page.getByRole('link', { name: 'Join early access' }).first()).toBeVisible();
  await expect(page.getByRole('heading', { name: /Your whole routine/ })).toBeVisible();

  for (const route of ['/privacy/', '/terms/', '/support/']) {
    const response = await page.request.get(route);
    expect(response.ok()).toBeTruthy();
  }
});

test('landing page remains complete without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/');

  await expect(page.getByText('Today, sorted.')).toBeVisible();
  await expect(page.getByText('Progress you can feel.')).toBeVisible();
  await expect(page.getByText('Looks like your medicine.')).toBeVisible();

  await context.close();
});

test('reduced motion keeps the product showcase readable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Today, sorted.' })).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Local first. Plus when you want it.' }),
  ).toBeVisible();
});

test('every product moment appears while scrolling without horizontal overflow', async ({
  page,
}) => {
  await page.goto('/');

  const cards = page.locator('[data-feature-card]');
  await expect(cards).toHaveCount(4);

  for (const card of await cards.all()) {
    await card.scrollIntoViewIfNeeded();
    await expect(card).toBeVisible();
  }

  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(hasHorizontalOverflow).toBeFalsy();
});
