import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

import { site } from '@/config';

import styles from './header.module.css';

export function Header() {
  const href = `mailto:${site.supportEmail}?subject=Pilly%20early%20access`;

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link className={styles.brand} href="/" aria-label="Pilly home">
          <Image src="/app-icon.png" width={38} height={38} alt="" loading="eager" />
          <span>Pilly</span>
        </Link>
        <a className={styles.action} href={href}>
          Join early access
          <ArrowUpRight aria-hidden="true" size={17} strokeWidth={2} />
        </a>
      </div>
    </header>
  );
}
