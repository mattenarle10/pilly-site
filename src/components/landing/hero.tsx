import { EarlyAccessLink } from '@/components/actions';

import { Ribbon } from './ribbon';
import styles from './hero.module.css';

export function Hero() {
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.copy}>
        <h1 id="hero-title">
          <span className={styles.line}>
            <span data-hero-line>Know what’s due.</span>
          </span>
          <span className={styles.line}>
            <span data-hero-line>Keep moving.</span>
          </span>
        </h1>
        <p data-hero-copy>Private medicine reminders and tracking for iPhone.</p>
        <div className={styles.ctaGroup} data-hero-copy>
          <EarlyAccessLink className={styles.action} />
          <span className={styles.note}>No account required.</span>
        </div>
      </div>
      <Ribbon />
    </section>
  );
}
