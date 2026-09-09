import { Closing, Hero, Identity, Journey, Routine } from '@/components/landing';
import { Header } from '@/components/layout';

import styles from './page.module.css';

const sceneBackgrounds = ['--background', '--surface', '--lavender-soft', '--background'] as const;

export default function Home() {
  return (
    <main>
      <Journey backgroundTokens={sceneBackgrounds}>
        <div className={styles.intro}>
          <Header />
          <Hero />
        </div>
        <Routine />
        <Identity />
        <Closing />
      </Journey>
    </main>
  );
}
