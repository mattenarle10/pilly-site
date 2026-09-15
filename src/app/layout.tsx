import { Analytics } from '@vercel/analytics/next';
import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

import { site } from '@/config';
import { horizontalJourneyQuery } from '@/motion/journey-mode';

import './globals.css';

export const viewport: Viewport = { viewportFit: 'cover' };

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  icons: { icon: '/favicon.png', apple: '/app-icon.png' },
  applicationName: site.name,
  other: { 'apple-itunes-app': 'app-id=6801062753' },
  twitter: { card: 'summary_large_image', images: [site.socialImage] },
  title: site.title,
  description: site.description,
  alternates: { canonical: '/' },
  openGraph: {
    title: site.title,
    description: site.description,
    type: 'website',
    siteName: site.name,
    locale: 'en_US',
    images: [site.socialImage],
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
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
