'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';

import { EarlyAccessLink } from '@/components/actions';
import { motion } from '@/motion';

import { Ribbon } from './ribbon';
import styles from './hero.module.css';

export function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add('(prefers-reduced-motion: no-preference)', () => {
        const timeline = gsap.timeline({ defaults: { ease: motion.easeOut } });
        timeline
          .from('[data-hero-line]', {
            autoAlpha: 0,
            yPercent: 110,
            rotate: 1.2,
            duration: motion.heroReveal,
            stagger: 0.09,
          })
          .from(
            '[data-hero-copy]',
            {
              autoAlpha: 0,
              y: 14,
              duration: motion.illustration,
              stagger: 0.07,
            },
            '-=0.28',
          );
      });
      return () => media.revert();
    },
    { scope: root },
  );

  return (
    <section className={styles.hero} aria-labelledby="hero-title" ref={root}>
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
