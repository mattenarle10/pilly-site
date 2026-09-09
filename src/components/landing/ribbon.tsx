'use client';

import { Check } from 'lucide-react';
import { useId } from 'react';

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

  return (
    <div className={styles.root} data-motion-group="ribbon">
      <div
        className={styles.viewport}
        data-ribbon
        tabIndex={0}
        role="region"
        aria-label="Medicine forms"
        aria-describedby={instructionsId}
      >
        <span className={styles.srOnly} id={instructionsId}>
          Six medicine forms. Scroll horizontally if more cards are off screen.
        </span>
        <ul className={styles.track}>
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
      </div>
    </div>
  );
}
