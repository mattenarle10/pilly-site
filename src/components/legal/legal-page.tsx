import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { site } from '@/config';

import styles from './legal-page.module.css';

type LegalPageProps = Readonly<{
  eyebrow: string;
  title: string;
  intro: string;
  children: ReactNode;
}>;

export function LegalPage({ eyebrow, title, intro, children }: LegalPageProps) {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.brand} href="/" aria-label="Pilly home">
          <Image src="/app-icon.png" width={36} height={36} alt="" loading="eager" />
          <span>{site.name}</span>
        </Link>
        <Link className={styles.back} href="/">
          <ArrowLeft aria-hidden="true" size={17} strokeWidth={2} />
          Back to Pilly
        </Link>
      </header>

      <article className={styles.article}>
        <div className={styles.intro}>
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h1>{title}</h1>
          <p className={styles.lede}>{intro}</p>
          <p className={styles.updated}>Effective {site.legalEffectiveDate}</p>
        </div>
        <div className={styles.content}>{children}</div>
      </article>

      <footer className={styles.footer}>
        <span>© 2026 Pilly</span>
        <nav aria-label="Legal and support">
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/support">Support</Link>
        </nav>
      </footer>
    </main>
  );
}
