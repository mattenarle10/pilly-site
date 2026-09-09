import { expect, test } from '@playwright/test';

const routes = [
  { path: '/', title: 'Pilly · Medicine tracker for iPhone' },
  { path: '/privacy', title: 'Privacy · Pilly' },
  { path: '/terms', title: 'Terms · Pilly' },
  { path: '/support', title: 'Support · Pilly' },
];

for (const { path, title } of routes) {
  test(`${path} serves a complete page with matching metadata`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(title);
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(new URL(canonical!).pathname).toBe(path);
    expect(new URL(canonical!).origin).toBe('https://getpilly.app');
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', canonical!);
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', title);
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    await expect(page.locator('meta[property="og:description"]')).toHaveAttribute(
      'content',
      description!,
    );
    await expect(page.locator('link[rel="icon"]')).toHaveAttribute('href', '/favicon.png');
  });
}

test('export serves discovery assets and real 404s', async ({ request }) => {
  const icon = await request.get('/favicon.png');
  expect(icon.status()).toBe(200);
  expect(icon.headers()['content-type']).toContain('image/png');
  const robots = await request.get('/robots.txt');
  expect(robots.status()).toBe(200);
  expect(await robots.text()).toContain('Sitemap: https://getpilly.app/sitemap.xml');
  const sitemap = await request.get('/sitemap.xml');
  expect(sitemap.status()).toBe(200);
  const xml = await sitemap.text();
  for (const { path } of routes) {
    expect(xml).toContain(`<loc>https://getpilly.app${path === '/' ? '' : path}</loc>`);
  }
  expect((await request.get('/this-route-does-not-exist')).status()).toBe(404);
});

test('legal routes remain scrollable and connected to the landing page', async ({ page }) => {
  await page.goto('/');
  const closing = page.getByRole('region', { name: 'Ready when you are.' });
  await closing.scrollIntoViewIfNeeded();
  await closing.getByRole('link', { name: 'Privacy', exact: true }).click();
  await expect(page).toHaveURL(/\/privacy$/);
  for (const route of ['Terms', 'Support']) {
    const footer = page.locator('footer');
    await footer.scrollIntoViewIfNeeded();
    await expect(footer).toBeInViewport();
    expect(await page.locator('main').evaluate((node) => node.scrollTop)).toBeGreaterThan(0);
    await footer.getByRole('link', { name: route, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/${route.toLowerCase()}$`));
  }
  await page.getByRole('link', { name: 'Back to Pilly' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Know what’s due.Keep moving.');
});
