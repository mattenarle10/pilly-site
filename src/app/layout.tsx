import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { site } from '@/config';

import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
