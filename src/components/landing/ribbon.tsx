'use client';

import { Check } from 'lucide-react';
import { useEffect, useId, useRef } from 'react';

import { Medicine } from '@/graphics';
import type { MedicineForm } from '@/graphics';

import styles from './ribbon.module.css';

const items: ReadonlyArray<{
  form: MedicineForm;
  label: string;
  color: string;
  secondaryColor?: string;
  complete?: boolean;
}> = [
  { form: 'tablet', label: 'Tablet', color: '#f3ccd7', complete: true },
  { form: 'capsule', label: 'Capsule', color: '#f2c6ad', secondaryColor: '#cdc8e8' },
  { form: 'liquid', label: 'Liquid', color: '#cdc8e8' },
  { form: 'injection', label: 'Injection', color: '#f3ccd7' },
  { form: 'drops', label: 'Drops', color: '#f2c6ad' },
  { form: 'inhaler', label: 'Inhaler', color: '#cdc8e8' },
];

export function Ribbon() {
  const instructionsId = useId();
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const source = useRef<HTMLUListElement>(null);
  const clone = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const node = viewport.current;
    const trackNode = track.current;
    const sourceNode = source.current;
    const cloneNode = clone.current;
    if (!node || !trackNode || !sourceNode || !cloneNode) return;

    const mobile = window.matchMedia('(max-width: 680px)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let previousTime = 0;
    let resumeAt = 0;
    let focused = false;
    let position = node.scrollLeft;

    const pause = () => {
      resumeAt = performance.now() + 3000;
      position = node.scrollLeft;
    };
    const pauseForFocus = () => {
      focused = true;
      pause();
    };
    const resumeAfterFocus = () => {
      focused = false;
      pause();
    };
    const loopWidth = () => cloneNode.offsetLeft - sourceNode.offsetLeft;
    const tick = (time: number) => {
      const elapsed = previousTime ? Math.min(time - previousTime, 64) : 0;
      previousTime = time;
      if (
        mobile.matches &&
        !reducedMotion.matches &&
        !focused &&
        document.visibilityState === 'visible' &&
        time >= resumeAt
      ) {
        const cycle = loopWidth();
        if (cycle > 0) {
          position += elapsed * 0.018;
          if (position >= cycle) position -= cycle;
          node.scrollLeft = position;
        }
      }
      frame = requestAnimationFrame(tick);
    };

    const reset = () => {
      previousTime = 0;
      position = node.scrollLeft;
      if (!mobile.matches || reducedMotion.matches) position = 0;
      else if (position >= loopWidth()) position %= loopWidth();
      node.scrollLeft = position;
    };
    const syncManualScroll = () => {
      if (performance.now() < resumeAt) position = node.scrollLeft;
    };

    node.addEventListener('pointerdown', pause);
    node.addEventListener('touchstart', pause, { passive: true });
    node.addEventListener('keydown', pause);
    node.addEventListener('focusin', pauseForFocus);
    node.addEventListener('focusout', resumeAfterFocus);
    node.addEventListener('scroll', syncManualScroll, { passive: true });
    document.addEventListener('visibilitychange', reset);
    mobile.addEventListener('change', reset);
    reducedMotion.addEventListener('change', reset);
    const observer = new ResizeObserver(reset);
    observer.observe(trackNode);
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      node.removeEventListener('pointerdown', pause);
      node.removeEventListener('touchstart', pause);
      node.removeEventListener('keydown', pause);
      node.removeEventListener('focusin', pauseForFocus);
      node.removeEventListener('focusout', resumeAfterFocus);
      node.removeEventListener('scroll', syncManualScroll);
      document.removeEventListener('visibilitychange', reset);
      mobile.removeEventListener('change', reset);
      reducedMotion.removeEventListener('change', reset);
    };
  }, []);

  return (
    <div className={styles.root} data-motion-group="ribbon">
      <div
        className={styles.viewport}
        ref={viewport}
        data-ribbon
        tabIndex={0}
        role="region"
        aria-label="Medicine forms"
        aria-describedby={instructionsId}
      >
        <span className={styles.srOnly} id={instructionsId}>
          Six medicine forms. Scroll horizontally if more cards are off screen.
        </span>
        <div className={styles.track} ref={track}>
          <ul className={styles.sequence} ref={source}>
            {items.map((item) => (
              <li className={styles.slot} key={item.form} data-card-motion>
                <div className={styles.item}>
                  {item.complete && (
                    <span className={styles.complete}>
                      <Check aria-hidden="true" size={15} strokeWidth={2.4} />
                      <span className={styles.srOnly}>Recorded</span>
                    </span>
                  )}
                  <Medicine
                    className={styles.medicine}
                    form={item.form}
                    color={item.color}
                    secondaryColor={item.secondaryColor}
                  />
                  <span className={styles.label}>{item.label}</span>
                </div>
              </li>
            ))}
          </ul>
          <ul className={`${styles.sequence} ${styles.clone}`} ref={clone} aria-hidden="true">
            {items.map((item) => (
              <li className={styles.slot} key={`clone-${item.form}`}>
                <div className={styles.item}>
                  {item.complete && (
                    <span className={styles.complete}>
                      <Check aria-hidden="true" size={15} strokeWidth={2.4} />
                    </span>
                  )}
                  <Medicine
                    className={styles.medicine}
                    form={item.form}
                    color={item.color}
                    secondaryColor={item.secondaryColor}
                  />
                  <span className={styles.label}>{item.label}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
