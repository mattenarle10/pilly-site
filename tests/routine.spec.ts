import { expect, test } from '@playwright/test';

test('presents the three meaningful routine states', async ({ page }) => {
  await page.goto('/');

  const section = page.getByRole('region', { name: 'Your routine, at a glance.' });
  await section.scrollIntoViewIfNeeded();

  await expect(section.getByText('Recorded', { exact: true })).toBeVisible();
  await expect(section.getByText('5 due')).toBeVisible();
  await expect(section.getByText('4 of 5 done')).toBeVisible();
});
