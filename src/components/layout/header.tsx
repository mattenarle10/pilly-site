import Image from 'next/image';
import Link from 'next/link';

import { AppStoreLink } from '@/components/actions';

import styles from './header.module.css';

export function Header() {
  return (
    <header className={styles.header} data-journey-header>
      <div className={styles.inner}>
        <Link className={styles.brand} href="/" aria-label="Pilly home">
          <Image src="/app-icon.png" width={38} height={38} alt="" loading="eager" />
          <span>Pilly</span>
        </Link>
        <AppStoreLink className={styles.action} direction="up-right" />
      </div>
    </header>
  );
}
