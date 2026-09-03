import { Hero, Routine, SlideDeck } from '@/components/landing';
import { Header } from '@/components/layout';

import styles from './page.module.css';

export default function Home() {
  return (
    <main>
      <SlideDeck>
        <div className={styles.intro}>
          <Header />
          <Hero />
        </div>
        <Routine />
      </SlideDeck>
    </main>
  );
}
