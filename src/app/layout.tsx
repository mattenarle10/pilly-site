import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

import { site } from '@/config';
import { horizontalJourneyQuery } from '@/motion/journey-mode';

import './globals.css';

export const viewport: Viewport = { viewportFit: 'cover' };

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  icons: { icon: '/favicon.png' },
  title: `${site.name} · Medicine tracker for iPhone`,
  description: site.description,
  alternates: { canonical: '/' },
  openGraph: {
    title: `${site.name} · Medicine tracker for iPhone`,
    description: site.description,
    type: 'website',
    url: '/',
  },
};

export default function Layout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Select the landing layout before paint, while React is still loading. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `if(location.pathname === '/') document.documentElement.toggleAttribute('data-horizontal-journey',matchMedia(${JSON.stringify(horizontalJourneyQuery)}).matches);`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
