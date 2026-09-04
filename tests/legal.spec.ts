import { expect, test } from '@playwright/test';

test('privacy explains the local-first and optional backup boundary', async ({ page }) => {
  await page.goto('/privacy');

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://getpilly.app/privacy',
  );

  await expect(
    page.getByRole('heading', { name: 'Your medicine data starts on your iPhone.' }),
  ).toBeVisible();
  await expect(page.getByText(/works without an account/i)).toBeVisible();
  await expect(page.getByText(/deleting your Pilly account does not cancel/i)).toBeVisible();
  await expect(page.getByRole('link', { name: 'Apple subscription settings' })).toHaveAttribute(
    'href',
    'https://apps.apple.com/account/subscriptions',
  );
});

test('terms cover subscriptions and the non-medical boundary', async ({ page }) => {
  await page.goto('/terms');

  await expect(
    page.getByRole('heading', { name: 'A calm tracker, not medical advice.' }),
  ).toBeVisible();
  await expect(page.getByText(/does not diagnose, prescribe, identify pills/i)).toBeVisible();
  await expect(page.getByRole('link', { name: /Apple's Standard EULA/i })).toBeVisible();
});

test('support provides real contact and account guidance', async ({ page }) => {
  await page.goto('/support');

  await expect(page.getByRole('heading', { name: 'How can we help?' })).toBeVisible();
  await expect(page.getByRole('link', { name: siteSupportEmail })).toHaveAttribute(
    'href',
    `mailto:${siteSupportEmail}`,
  );
  await expect(
    page.getByText(/Deleting the Pilly Plus account removes active cloud records/i),
  ).toBeVisible();
});

const siteSupportEmail = 'enarlem10@gmail.com';
