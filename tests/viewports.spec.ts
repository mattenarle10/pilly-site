import { expect, test } from '@playwright/test';
import type { Locator, Page, TestInfo } from '@playwright/test';

import { referenceViewports } from './helpers/viewports';

const routes = ['/', '/privacy', '/terms', '/support'] as const;

// Each case walks the entire route and captures several settled viewport screenshots.
test.setTimeout(60_000);
test.describe.configure({ mode: 'parallel' });

async function expectNoPageOverflow(page: Page) {
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
  ).toBeLessThanOrEqual(1);
}

async function expectReachable(item: Locator) {
  await item.scrollIntoViewIfNeeded();
  await expect(item).toBeInViewport({ ratio: 0.999 });
  const bounds = await item.boundingBox();
  const width = item.page().viewportSize()!.width;
  expect(bounds!.x).toBeGreaterThanOrEqual(-1);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width + 1);
}

async function capture(page: Page, testInfo: TestInfo, name: string) {
  const path = testInfo.outputPath(`${name}.png`);
  await page.screenshot({ path });
  await testInfo.attach(name, { path, contentType: 'image/png' });
}

for (const viewport of referenceViewports) {
  for (const colorScheme of ['light', 'dark'] as const) {
    for (const route of routes) {
      test(`${route} at ${viewport.width}x${viewport.height}, ${colorScheme}`, async ({
        page,
      }, testInfo) => {
        await page.setViewportSize(viewport);
        await page.emulateMedia({ colorScheme });
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        await page.goto(route);
        await expectNoPageOverflow(page);
        await expect(page.locator('html')).toHaveCSS('color-scheme', 'light');
        await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
        await expectReachable(page.getByRole('heading', { level: 1 }));
        await capture(page, testInfo, 'heading');

        if (route === '/') {
          await expect(page.locator('[data-axis]')).toHaveAttribute('data-axis', 'vertical');
          await expect(page.locator('[data-axis]')).not.toHaveAttribute('tabindex');
          await expectReachable(
            page.getByRole('link', { name: /download on the app store/i }).first(),
          );

          const ribbon = page.getByRole('region', { name: 'Medicine forms', exact: true });
          await ribbon.scrollIntoViewIfNeeded();
          await ribbon.focus();
          await expect(ribbon.getByRole('listitem')).toHaveCount(6);
          for (const index of [0, 5]) {
            const card = ribbon.getByRole('listitem').nth(index);
            await card.scrollIntoViewIfNeeded();
            await expectReachable(card);
          }
          await capture(page, testInfo, 'ribbon-end');

          const routine = page.getByRole('region', { name: 'Your routine, at a glance.' });
          await expectReachable(routine.getByRole('heading'));
          for (const card of await routine.locator('article').all()) await expectReachable(card);
          await capture(page, testInfo, 'routine');

          const identity = page.getByRole('region', { name: 'Recognize it instantly.' });
          await expectReachable(identity.getByRole('heading'));
          const tablet = identity.getByRole('button', { name: 'Tablet', exact: true });
          await tablet.click();
          const peach = identity.getByRole('button', { name: 'Peach and rose', exact: true });
          await peach.click();
          await expect(tablet).toHaveAttribute('aria-pressed', 'true');
          await expect(peach).toHaveAttribute('aria-pressed', 'true');
          await expect(
            identity.getByLabel('Medicine preview: Tablet, Peach and rose'),
          ).toBeVisible();
          for (const button of await identity.getByRole('button').all()) {
            await expectReachable(button);
            const box = (await button.boundingBox())!;
            expect(box.width).toBeGreaterThanOrEqual(44);
            expect(box.height).toBeGreaterThanOrEqual(44);
          }
          await capture(page, testInfo, 'identity');
          await expectReachable(page.getByRole('heading', { name: 'Ready when you are.' }));
          await expectReachable(
            page.getByRole('link', { name: /download on the app store/i }).last(),
          );
        } else {
          const main = page.getByRole('main');
          expect(
            await main.evaluate((node) => node.scrollHeight - node.clientHeight),
          ).toBeGreaterThan(0);
          // Legal headings have no motion. Check their actual scroll container in one browser pass.
          const clippedHeadings = await page
            .getByRole('heading', { level: 2 })
            .evaluateAll((headings) =>
              headings.flatMap((heading) => {
                heading.scrollIntoView({
                  block: 'nearest',
                  inline: 'nearest',
                  behavior: 'instant',
                });
                const box = heading.getBoundingClientRect();
                return box.left < -1 ||
                  box.right > innerWidth + 1 ||
                  box.top < -1 ||
                  box.bottom > innerHeight + 1
                  ? [heading.textContent]
                  : [];
              }),
            );
          expect(clippedHeadings).toEqual([]);
        }

        const navigation = page.getByRole('navigation', { name: 'Legal and support' });
        for (const link of await navigation.getByRole('link').all()) await expectReachable(link);
        if (route !== '/') {
          expect(await page.getByRole('main').evaluate((node) => node.scrollTop)).toBeGreaterThan(
            0,
          );
        }
        await capture(page, testInfo, 'footer');
        await expectNoPageOverflow(page);
        expect(errors).toEqual([]);
      });
    }
  }
}

test('touch resizing retains selections and reachable sections without reloading', async ({
  page,
}) => {
  await page.goto('/');
  const tablet = page.getByRole('button', { name: 'Tablet', exact: true });
  const peach = page.getByRole('button', { name: 'Peach and rose', exact: true });
  await tablet.click();
  await peach.click();
  for (const viewport of referenceViewports) {
    await page.setViewportSize(viewport);
    await expect(page.locator('[data-axis]')).toHaveAttribute('data-axis', 'vertical');
    await expect(tablet).toHaveAttribute('aria-pressed', 'true');
    await expect(peach).toHaveAttribute('aria-pressed', 'true');
    await expectReachable(tablet);
    await expectReachable(peach);
    await expectNoPageOverflow(page);
    await expectReachable(page.getByRole('link', { name: 'Support', exact: true }));
  }
});

for (const route of routes.slice(1)) {
  test(`${route} keeps its footer scrollable across viewport changes`, async ({ page }) => {
    await page.goto(route);
    for (const viewport of referenceViewports) {
      await page.setViewportSize(viewport);
      await expectReachable(page.getByRole('navigation', { name: 'Legal and support' }));
      expect(await page.getByRole('main').evaluate((node) => node.scrollTop)).toBeGreaterThan(0);
      await expectNoPageOverflow(page);
    }
  });
}

for (const viewport of [referenceViewports[0], referenceViewports[2]]) {
  test(`reduced motion stays usable at ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await expect(page.locator('[data-axis]')).toHaveAttribute('data-axis', 'static');
    for (const item of await page.locator('[data-card-motion], [data-motion-group]').all()) {
      await expect(item).toHaveCSS('transform', 'none');
    }
    await expectReachable(page.getByRole('button', { name: 'Drops', exact: true }));
    await expectReachable(page.getByRole('link', { name: 'Support', exact: true }));
    await expectNoPageOverflow(page);
  });

  test(`delayed hydration preserves the compact layout at ${viewport.width}x${viewport.height}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    let release!: () => void;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    await page.route('**/_next/**/*.js*', async (route) => {
      await gate;
      await route.continue();
    });
    await page.goto('/', { waitUntil: 'commit' });
    try {
      const heading = page.getByRole('heading', { level: 1 });
      await expect(heading).toBeVisible();
      await expect(page.locator('[data-axis]')).toHaveCSS('display', 'block');
      const before = (await heading.boundingBox())!;
      release();
      await expect(page.locator('[data-axis]')).toHaveAttribute('data-axis', 'vertical');
      const after = (await heading.boundingBox())!;
      for (const key of ['x', 'y', 'width', 'height'] as const) {
        expect(Math.abs(after[key] - before[key])).toBeLessThanOrEqual(1);
      }
      await expectNoPageOverflow(page);
    } finally {
      release();
      await page.unrouteAll({ behavior: 'wait' });
    }
  });
}
