import { expect, test } from '@playwright/test';

test('updates the medicine identity from real controls', async ({ page }) => {
  await page.goto('/');
  const section = page.getByRole('region', { name: 'Recognize it instantly.' });
  await section.scrollIntoViewIfNeeded();
  await expect(section.getByText('Private photos with Pilly Plus')).toBeVisible();
  await expect(section.getByRole('link', { name: /join early access/i })).toHaveCount(0);

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

test('keeps identity controls at least 44 CSS pixels', async ({ page }) => {
  await page.goto('/');
  const section = page.getByRole('region', { name: 'Recognize it instantly.' });
  await section.scrollIntoViewIfNeeded();

  for (const control of await section.getByRole('button').all()) {
    const box = await control.boundingBox();
    expect(box, 'control should have a measurable box').not.toBeNull();
    expect(box!.height).toBeGreaterThanOrEqual(44);
    expect(box!.width).toBeGreaterThanOrEqual(44);
  }
});
