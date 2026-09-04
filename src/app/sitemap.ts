import type { MetadataRoute } from 'next';

import { site } from '@/config';

const routes = ['', '/privacy', '/terms', '/support'] as const;

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${site.url}${route}`,
    lastModified: '2026-09-04',
    changeFrequency: route ? 'monthly' : 'weekly',
    priority: route ? 0.6 : 1,
  }));
}
