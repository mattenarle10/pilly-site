import Link from 'next/link';

import { EarlyAccessLink } from '@/components/actions';

import styles from './closing.module.css';

export function Closing() {
  return (
    <section className={styles.section} aria-labelledby="closing-title">
      <div className={styles.inner}>
        <div className={styles.copy} data-motion-group="closing">
          <h2 id="closing-title">Ready when you are.</h2>
          <p>Private medicine tracking for iPhone.</p>
          <EarlyAccessLink className={styles.action} />
          <span className={styles.note}>No account required.</span>
        </div>

        <nav className={styles.links} aria-label="Legal and support">
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/support">Support</Link>
        </nav>
      </div>
    </section>
  );
}
