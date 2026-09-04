'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Check } from 'lucide-react';
import { useId, useRef } from 'react';

import { Medicine } from '@/graphics';
import type { MedicineForm } from '@/graphics';
import { motion } from '@/motion';

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
  const root = useRef<HTMLDivElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const instructionsId = useId();

  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add('(prefers-reduced-motion: no-preference)', () => {
        if (root.current) {
          gsap.from(root.current, {
            autoAlpha: 0,
            y: 18,
            duration: motion.illustration,
            delay: 0.12,
            ease: motion.easeOut,
          });
        }
        gsap.from('[data-medicine]', {
          autoAlpha: 0,
          y: 20,
          duration: 0.36,
          delay: 0.2,
          stagger: 0.055,
          ease: motion.easeOut,
        });
      });
      return () => media.revert();
    },
    { scope: root },
  );

  return (
    <div className={styles.root} ref={root}>
      <div
        className={styles.viewport}
        ref={viewport}
        tabIndex={0}
        role="region"
        aria-label="Medicine forms"
        aria-describedby={instructionsId}
      >
        <span className={styles.srOnly} id={instructionsId}>
          Scroll horizontally to explore six medicine forms.
        </span>
        <ul className={styles.track}>
          {items.map((item) => (
            <li className={styles.item} key={item.form} data-medicine>
              {item.complete && (
                <span className={styles.complete} aria-label="Recorded">
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
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
