import { Analytics } from '@vercel/analytics/next';
import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

import { site } from '@/config';
import { horizontalJourneyQuery, journeyReadyEvent } from '@/motion/journey-mode';

import './globals.css';

const journeyStartupScript = `
if (location.pathname === '/') {
  const media = matchMedia(${JSON.stringify(horizontalJourneyQuery)});
  const update = () => document.documentElement.toggleAttribute('data-horizontal-journey', media.matches);
  update();
  media.addEventListener('change', update);
  window.addEventListener(${JSON.stringify(journeyReadyEvent)}, () => {
    media.removeEventListener('change', update);
  }, { once: true });
}
`;

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
        {/* Keep the layout responsive before paint and until React takes ownership. */}
        <script dangerouslySetInnerHTML={{ __html: journeyStartupScript }} />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
