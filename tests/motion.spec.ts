import { expect, test } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';

const offset = (node: Locator) =>
  node.evaluate((element) => {
    const transform = getComputedStyle(element).transform;
    return transform === 'none' ? 0 : new DOMMatrixReadOnly(transform).m42;
  });

async function moveToRoutine(page: Page, progress: number) {
  await page.locator('[data-motion-group="routine"]').evaluate((group, value) => {
    const journey = document.querySelector<HTMLElement>('[data-axis]')!;
    if (journey.dataset.axis === 'horizontal') {
      journey.scrollTo({ left: journey.clientWidth * value, behavior: 'instant' });
    } else {
      const top =
        group.getBoundingClientRect().top +
        window.scrollY -
        new DOMMatrixReadOnly(getComputedStyle(group).transform).m42;
      window.scrollTo({
        top: value ? top - innerHeight * (0.9 - 0.35 * value) : 0,
        behavior: 'instant',
      });
    }
  }, progress);
}

test('routine cards track intermediate scroll positions and reverse', async ({
  page,
}, testInfo) => {
  await page.goto('/');
  const card = page.locator('[data-motion-group="routine"] [data-card-motion]').first();
  const distance = testInfo.project.use.hasTouch ? 3 : 6;
  await expect.poll(() => offset(card)).toBeCloseTo(distance, 0);
  await moveToRoutine(page, 0.5);
  await expect.poll(() => offset(card)).toBeLessThan(distance - 1);
  expect(await offset(card)).toBeGreaterThan(0);
  await page.screenshot({ path: testInfo.outputPath('routine-mid-scroll.png') });
  await moveToRoutine(page, 1);
  await expect.poll(() => offset(card)).toBeCloseTo(0, 0);
  await moveToRoutine(page, 0);
  await expect.poll(() => offset(card)).toBeCloseTo(distance, 0);
});

test('reduced motion removes scroll transforms immediately and can be restored', async ({
  page,
}) => {
  await page.goto('/');
  const card = page.locator('[data-motion-group="routine"] [data-card-motion]').first();
  await expect.poll(() => offset(card)).toBeGreaterThan(1);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('[data-axis]')).toHaveAttribute('data-axis', 'static');
  for (const item of await page.locator('[data-card-motion], [data-motion-group]').all()) {
    await expect(item).toHaveCSS('transform', 'none');
    await expect(item).toHaveCSS('opacity', '1');
  }
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect.poll(() => offset(card)).toBeGreaterThan(1);
});

test('identity controls stay aligned with their moving panel during selection', async ({
  page,
}) => {
  await page.goto('/');
  const section = page.locator('[data-motion-group="identity"]');
  await section.scrollIntoViewIfNeeded();
  const button = section.getByRole('button', { name: 'Tablet', exact: true });
  const controls = section.locator('fieldset').first();
  const relativeTop = () =>
    controls.evaluate(
      (element) =>
        element.getBoundingClientRect().top -
        element.closest('[data-motion-group]')!.getBoundingClientRect().top,
    );
  const before = await relativeTop();
  await button.click();
  await expect(button).toHaveAttribute('aria-pressed', 'true');
  await expect(section.getByLabel(/Amoxicillin preview: Tablet/)).toBeVisible();
  expect(await relativeTop()).toBeCloseTo(before, 0);
});

test('touch ribbon scales toward its center without moving the page tour', async ({
  page,
}, testInfo) => {
  test.skip(!testInfo.project.use.hasTouch, 'Native swipe behavior requires a touch layout.');
  await page.goto('/');
  const ribbon = page.locator('[data-ribbon]');
  await ribbon.scrollIntoViewIfNeeded();
  const card = ribbon.getByRole('listitem').nth(2);
  const scale = () =>
    card.evaluate((node) => new DOMMatrixReadOnly(getComputedStyle(node).transform).m11);
  await expect.poll(scale).toBeLessThan(0.9999);
  await ribbon.evaluate((node) => {
    const card = node.querySelectorAll<HTMLElement>('li')[2];
    node.scrollLeft +=
      card.getBoundingClientRect().left +
      card.offsetWidth / 2 -
      node.getBoundingClientRect().left -
      node.clientWidth / 2;
  });
  await expect.poll(scale).toBeCloseTo(1, 3);
  expect(await page.locator('[data-axis]').evaluate((node) => node.scrollLeft)).toBe(0);
  await ribbon.evaluate((node) => {
    node.scrollLeft = node.scrollWidth;
  });
  await expect(ribbon.getByRole('listitem').last()).toBeInViewport({ ratio: 0.999 });
  const bounds = await ribbon.getByRole('listitem').last().boundingBox();
  expect(bounds!.x).toBeGreaterThanOrEqual(-1);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(page.viewportSize()!.width + 1);
});

test('motion survives route navigation without runtime errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  for (let pass = 0; pass < 2; pass++) {
    const closing = page.getByRole('region', { name: 'Ready when you are.' });
    await closing.scrollIntoViewIfNeeded();
    await closing.getByRole('link', { name: 'Privacy', exact: true }).click();
    await expect(page).toHaveURL(/\/privacy\/?$/);
    await expect(page.locator('html')).not.toHaveAttribute('data-horizontal-journey');
    if (pass === 0) await page.getByRole('link', { name: 'Pilly home' }).click();
    else await page.goBack();
    await expect(page.locator('[data-axis]')).not.toHaveAttribute('data-axis', 'static');
    await moveToRoutine(page, 1);
    await expect
      .poll(() => offset(page.locator('[data-motion-group="routine"] [data-card-motion]').first()))
      .toBeCloseTo(0, 0);
  }
  expect(errors).toEqual([]);
});

test('content and legal navigation work without JavaScript', async ({
  browser,
  baseURL,
}, testInfo) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: testInfo.project.use.viewport,
    hasTouch: Boolean(testInfo.project.use.hasTouch),
  });
  try {
    const page = await context.newPage();
    await page.goto(baseURL!);
    await expect(page.locator('body')).toHaveCSS('overflow-y', 'auto');
    const closing = page.getByRole('region', { name: 'Ready when you are.' });
    await closing.scrollIntoViewIfNeeded();
    await expect(closing).toBeInViewport();
    await closing.getByRole('link', { name: 'Support', exact: true }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('How can we help?');
  } finally {
    await context.close();
  }
});

test('resize and orientation preserve usable layouts and motion', async ({ page }, testInfo) => {
  await page.goto('/');
  const touch = Boolean(testInfo.project.use.hasTouch);
  for (const viewport of touch
    ? [
        { width: 844, height: 390 },
        { width: 390, height: 844 },
      ]
    : [
        { width: 800, height: 900 },
        { width: 1440, height: 900 },
      ]) {
    await page.setViewportSize(viewport);
    await expect(page.locator('[data-axis]')).toHaveAttribute(
      'data-axis',
      !touch && viewport.width > 900 ? 'horizontal' : 'vertical',
    );
    await moveToRoutine(page, 1);
    await expect
      .poll(() => offset(page.locator('[data-motion-group="routine"] [data-card-motion]').first()))
      .toBeCloseTo(0, 0);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
    ).toBeLessThanOrEqual(1);
    const section = page.getByRole('region', { name: 'Recognize it instantly.' });
    await section.scrollIntoViewIfNeeded();
    await section.getByRole('button', { name: 'Tablet', exact: true }).click();
    await expect(section.getByRole('button', { name: 'Tablet', exact: true })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  }
});

test('routine cards keep their gaps throughout the stagger', async ({ page }) => {
  await page.goto('/');
  const cards = page.locator('[data-motion-group="routine"] [data-card-motion]');
  await expect.poll(() => offset(cards.first())).toBeGreaterThan(1);
  for (const progress of [0, 0.25, 0.5, 0.75, 1, 0]) {
    await moveToRoutine(page, progress);
    await expect
      .poll(async () => {
        const boxes = await cards.evaluateAll((nodes) =>
          nodes.map((node) => {
            const { top, bottom } = node.getBoundingClientRect();
            return { top, bottom };
          }),
        );
        return Math.min(...boxes.slice(1).map((box, i) => box.top - boxes[i].bottom));
      })
      .toBeGreaterThanOrEqual(7);
  }
});

for (const kind of ['routine', 'identity', 'closing']) {
  test(`${kind} container follows scrolling and reverses`, async ({ page }, testInfo) => {
    await page.goto('/');
    const group = page.locator(`[data-motion-group="${kind}"]`);
    const distance = (kind === 'routine' ? 20 : 16) / (testInfo.project.use.hasTouch ? 2 : 1);
    await expect.poll(() => offset(group)).toBeCloseTo(distance, 0);
    const move = async (progress: number) =>
      group.evaluate((element, value) => {
        const journey = document.querySelector<HTMLElement>('[data-axis]')!;
        if (journey.dataset.axis === 'horizontal') {
          const scene = element.closest<HTMLElement>('[data-journey-scene]')!;
          const left = scene.getBoundingClientRect().left + journey.scrollLeft;
          journey.scrollTo({
            left: left - journey.clientWidth * (0.95 - 0.8 * value),
            behavior: 'instant',
          });
        } else {
          const top =
            element.getBoundingClientRect().top +
            scrollY -
            new DOMMatrixReadOnly(getComputedStyle(element).transform).m42 +
            (element.getAttribute('data-motion-group') === 'routine' ? 10 : 8);
          window.scrollTo({ top: top - innerHeight * (0.9 - 0.35 * value), behavior: 'instant' });
        }
      }, progress);
    await move(0.5);
    await expect.poll(() => offset(group)).toBeLessThan(distance - 1);
    expect(await offset(group)).toBeGreaterThan(1);
    await move(1);
    await expect.poll(() => offset(group)).toBeCloseTo(0, 0);
    await move(0);
    await expect.poll(() => offset(group)).toBeCloseTo(distance, 0);
  });
}
