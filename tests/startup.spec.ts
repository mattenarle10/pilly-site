import { expect, test } from '@playwright/test';

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
          () =>
            matchMedia(
              '(min-width: 901px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
            ).matches,
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
