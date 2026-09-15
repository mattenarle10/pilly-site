import { Closing, Hero, Identity, Journey, Routine } from '@/components/landing';
import { Header } from '@/components/layout';
import { site } from '@/config';

import styles from './page.module.css';

const sceneBackgrounds = ['--background', '--surface', '--lavender-soft', '--background'] as const;

export default function Home() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: site.name,
            url: site.url,
            description: site.description,
            inLanguage: 'en',
          }).replace(/</g, '\\u003c'),
        }}
      />
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
