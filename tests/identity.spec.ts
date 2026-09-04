import { expect, test } from '@playwright/test';

test('updates the medicine identity from real controls', async ({ page }) => {
  await page.goto('/');
  const section = page.getByRole('region', { name: 'Recognize it instantly.' });
  await section.scrollIntoViewIfNeeded();
  await expect(section.getByRole('link', { name: /join early access/i })).toBeVisible();
  await expect(section.getByRole('navigation', { name: 'Legal and support' })).toBeVisible();

  const capsule = section.getByRole('button', { name: 'Capsule' });
  const tablet = section.getByRole('button', { name: 'Tablet' });
  await expect(capsule).toHaveAttribute('aria-pressed', 'true');

  await tablet.click();
  await expect(tablet).toHaveAttribute('aria-pressed', 'true');
  await expect(capsule).toHaveAttribute('aria-pressed', 'false');
  await expect(section.getByLabel(/Amoxicillin preview: Tablet/)).toBeVisible();

  const peach = section.getByRole('button', { name: 'Peach and rose' });
  await peach.click();
  await expect(peach).toHaveAttribute('aria-pressed', 'true');
  await expect(section.getByLabel('Amoxicillin preview: Tablet, Peach and rose')).toBeVisible();
});
