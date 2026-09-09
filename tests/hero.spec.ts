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

test('medicine ribbon remains a native horizontal strip on touch screens', async ({
  page,
}, testInfo) => {
  test.skip(!testInfo.project.use.hasTouch, 'Desktop fits all six cards in the scene.');
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

for (const width of [901, 1440]) {
  test(`desktop medicine cards fit fully inside the hero at ${width}px`, async ({
    page,
  }, testInfo) => {
    test.skip(
      Boolean(testInfo.project.use.hasTouch),
      'Horizontal desktop scene boundary regression.',
    );
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const journey = page.getByRole('region', { name: 'Pilly product tour' });
    await expect(journey).toHaveAttribute('data-axis', 'horizontal');
    const ribbon = page.getByRole('region', { name: 'Medicine forms', exact: true });
    const cards = ribbon.getByRole('listitem');
    await expect(cards).toHaveCount(6);
    for (const card of await cards.all()) {
      await expect(card).toBeInViewport({ ratio: 1 });
    }
    expect(
      await ribbon.evaluate((node) => node.scrollWidth - node.clientWidth),
    ).toBeLessThanOrEqual(1);
    // The last card must also clear the scene edge while the tour is between sections.
    await journey.evaluate((node) => node.scrollTo({ left: 300 }));
    const bounds = await ribbon.evaluate((node) => {
      const scene = node.closest('[data-journey-scene]');
      const card = node.querySelector('li:last-child');
      return {
        sceneRight: scene!.getBoundingClientRect().right,
        cardRight: card!.getBoundingClientRect().right,
      };
    });
    expect(bounds.sceneRight - bounds.cardRight).toBeGreaterThanOrEqual(19);
  });
}

for (const reducedMotion of ['reduce', 'no-preference'] as const) {
  test(`headline glyphs are not cropped after entrance (${reducedMotion})`, async ({
    page,
  }, testInfo) => {
    await page.emulateMedia({ reducedMotion });
    await page.goto('/');
    const lines = page.locator('[data-hero-line]');
    for (const line of await lines.all()) {
      await expect(line).toHaveCSS('opacity', '1');
      await expect
        .poll(() =>
          line.evaluate((node) => {
            const transform = getComputedStyle(node).transform;
            return transform === 'none' || new DOMMatrixReadOnly(transform).isIdentity;
          }),
        )
        .toBe(true);
    }
    const heading = page.getByRole('heading', { level: 1 });
    const box = (await heading.boundingBox())!;
    const viewport = page.viewportSize()!;
    const x = Math.max(0, box.x - 20);
    const y = Math.max(0, box.y - 20);
    const clip = {
      x,
      y,
      width: Math.min(viewport.width - x, box.width + 40),
      height: Math.min(viewport.height - y, box.height + 40),
    };
    const rendered = await page.screenshot({
      clip,
      animations: 'disabled',
      path: testInfo.outputPath('headline.png'),
    });
    // Compare actual glyph paint against the same text without any internal clipping.
    // Geometry checks alone cannot detect missing punctuation or cropped descenders.
    await heading.evaluate((node) => {
      for (const child of node.querySelectorAll<HTMLElement>('*')) child.style.overflow = 'visible';
    });
    const unclipped = await page.screenshot({ clip, animations: 'disabled' });
    expect(
      rendered.equals(unclipped),
      'headline should paint identically without clipping masks',
    ).toBe(true);
  });
}
