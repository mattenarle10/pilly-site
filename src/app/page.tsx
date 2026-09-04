import { Hero, Identity, Routine, SlideDeck } from '@/components/landing';
import { Header } from '@/components/layout';

import styles from './page.module.css';

const sceneBackgrounds = ['--background', '--surface', '--lavender-soft'] as const;

export default function Home() {
  return (
    <main>
      <SlideDeck backgroundTokens={sceneBackgrounds}>
        <div className={styles.intro}>
          <Header />
          <Hero />
        </div>
        <Routine />
        <Identity />
      </SlideDeck>
    </main>
  );
}
