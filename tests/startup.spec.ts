import { expect, test } from '@playwright/test';

import { horizontalJourneyQuery } from '../src/motion/journey-mode';

test('layout follows viewport changes before hydration and hands off to the journey', async ({
  page,
}, testInfo) => {
  test.skip(
    Boolean(testInfo.project.use.hasTouch),
    'Exercise both horizontal and vertical startup layouts.',
  );
  await page.setViewportSize({ width: 1280, height: 900 });
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route('**/_next/**/*.js*', async (route) => {
    await gate;
    await route.continue();
  });
  await page.goto('/', { waitUntil: 'commit' });
  const journey = page.getByRole('region', { name: 'Pilly product tour' });
  try {
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    for (const viewport of [
      { width: 382, height: 580, horizontal: false },
      { width: 1280, height: 900, horizontal: true },
      { width: 1280, height: 580, horizontal: false },
      { width: 1280, height: 900, horizontal: true },
    ]) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await expect(journey).toHaveAttribute('data-axis', 'static');
      await expect(journey).toHaveCSS('display', viewport.horizontal ? 'flex' : 'block');
      await expect(page.locator('body')).toHaveCSS(
        'overflow-y',
        viewport.horizontal ? 'hidden' : 'auto',
      );
    }
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(journey).toHaveCSS('display', 'block');
    await expect(page.locator('body')).toHaveCSS('overflow-y', 'auto');
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await expect(journey).toHaveCSS('display', 'flex');
    await page.setViewportSize({ width: 382, height: 580 });
    await expect(journey).toHaveCSS('display', 'block');

    const lastCard = page
      .getByRole('region', { name: 'Medicine forms', exact: true })
      .getByRole('listitem')
      .last();
    await lastCard.evaluate((node) =>
      node.scrollIntoView({ block: 'center', inline: 'center', behavior: 'instant' }),
    );
    await expect(lastCard).toBeInViewport({ ratio: 0.999 });
    const support = page.getByRole('link', { name: 'Support', exact: true });
    await support.scrollIntoViewIfNeeded();
    await expect(support).toBeInViewport({ ratio: 0.999 });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
    ).toBeLessThanOrEqual(1);

    release();
    await expect(journey).toHaveAttribute('data-axis', 'vertical');
  } finally {
    release();
    await page.unrouteAll({ behavior: 'wait' });
  }

  await page.setViewportSize({ width: 1280, height: 900 });
  await expect(journey).toHaveAttribute('data-axis', 'horizontal');
  const tablet = page.getByRole('button', { name: 'Tablet', exact: true });
  await tablet.click();
  await page.setViewportSize({ width: 1280, height: 580 });
  await expect(journey).toHaveAttribute('data-axis', 'vertical');
  await expect(page.getByRole('heading', { name: 'Recognize it instantly.' })).toBeInViewport();
  await expect(tablet).toHaveAttribute('aria-pressed', 'true');

  await page.getByRole('link', { name: 'Support', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'How can we help?' })).toBeVisible();
  await page.setViewportSize({ width: 1280, height: 900 });
  await expect(page.locator('html')).not.toHaveAttribute('data-horizontal-journey');
  await expect(page.locator('body')).toHaveCSS('overflow-y', 'auto');
  await page.getByRole('link', { name: 'Pilly home' }).click();
  await expect(journey).toHaveAttribute('data-axis', 'horizontal');
  expect(errors).toEqual([]);
});

for (const reducedMotion of ['reduce', 'no-preference'] as const) {
  test(`first screen stays visible through delayed hydration and reload (${reducedMotion})`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion });
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    for (const reload of [false, true]) {
      let release!: () => void;
      const gate = new Promise<void>((resolve) => {
        release = resolve;
      });
      await page.route('**/_next/**/*.js*', async (route) => {
        await gate;
        await route.continue();
      });
      if (reload) await page.reload({ waitUntil: 'commit' });
      else await page.goto('/', { waitUntil: 'commit' });
      try {
        const heading = page.locator('h1');
        await expect(heading).toBeVisible();
        await expect(page.locator('html')).toHaveCSS('background-color', 'rgb(255, 249, 247)');
        const before = await heading.boundingBox();
        const horizontal = await page.evaluate(
          (query) => matchMedia(query).matches,
          horizontalJourneyQuery,
        );
        await expect(page.locator('[data-axis]')).toHaveCSS(
          'display',
          horizontal ? 'flex' : 'block',
        );
        // Record every animation frame, including the first frames after React starts.
        await page.evaluate(() => {
          const state = window as typeof window & {
            startupFailures: string[];
            stopStartup: () => void;
          };
          state.startupFailures = [];
          let frame = 0;
          const sample = () => {
            for (const element of document.querySelectorAll('[data-hero-line], [data-hero-copy]')) {
              const style = getComputedStyle(element);
              if (Number(style.opacity) < 0.99 || style.visibility !== 'visible') {
                state.startupFailures.push('Hero disappeared during startup');
              }
            }
            frame = requestAnimationFrame(sample);
          };
          sample();
          state.stopStartup = () => cancelAnimationFrame(frame);
        });
        release();
        await expect(page.locator('[data-axis]')).toHaveAttribute(
          'data-axis',
          reducedMotion === 'reduce' ? 'static' : horizontal ? 'horizontal' : 'vertical',
        );
        await page.waitForLoadState('networkidle');
        const after = await heading.boundingBox();
        for (const key of ['x', 'y', 'width', 'height'] as const) {
          expect(Math.abs(after![key] - before![key])).toBeLessThanOrEqual(1);
        }
        const failures = await page.evaluate(() => {
          const state = window as typeof window & {
            startupFailures: string[];
            stopStartup: () => void;
          };
          state.stopStartup();
          return state.startupFailures;
        });
        expect(failures).toEqual([]);
      } finally {
        release();
        await page.unrouteAll({ behavior: 'wait' });
      }
    }
    expect(errors).toEqual([]);
  });
}
