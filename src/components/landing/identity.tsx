'use client';

import { Camera } from 'lucide-react';
import { useState } from 'react';

import { Medicine } from '@/graphics';
import type { MedicineForm } from '@/graphics';

import styles from './identity.module.css';

const forms: ReadonlyArray<{ form: MedicineForm; label: string }> = [
  { form: 'capsule', label: 'Capsule' },
  { form: 'tablet', label: 'Tablet' },
  { form: 'drops', label: 'Drops' },
];

const palettes = [
  { label: 'Rose and lavender', primary: '#f3ccd7', secondary: '#cdc8e8' },
  { label: 'Peach and rose', primary: '#f2c6ad', secondary: '#f3ccd7' },
  { label: 'Lavender and peach', primary: '#cdc8e8', secondary: '#f2c6ad' },
  { label: 'Soft rose', primary: '#e9a9bc', secondary: '#f3ccd7' },
] as const;

export function Identity() {
  const [form, setForm] = useState<MedicineForm>('capsule');
  const [paletteIndex, setPaletteIndex] = useState(0);
  const palette = palettes[paletteIndex];
  const formLabel = forms.find((item) => item.form === form)?.label ?? 'Medicine';

  return (
    <section className={styles.section} aria-labelledby="identity-title">
      <div className={styles.inner}>
        <div className={styles.copy}>
          <h2 id="identity-title">Recognize it instantly.</h2>
          <p>Choose the form and colors you know.</p>
          <span className={styles.plusNote}>
            <Camera aria-hidden="true" size={17} strokeWidth={1.9} />
            Private photos with Pilly Plus
          </span>
        </div>

        <div className={styles.studio}>
          <div
            className={styles.preview}
            aria-live="polite"
            aria-label={`Amoxicillin preview: ${formLabel}, ${palette.label}`}
          >
            <span className={styles.eyebrow}>Amoxicillin</span>
            <div className={styles.medicineFrame} key={`${form}-${paletteIndex}`}>
              <Medicine
                className={styles.medicine}
                form={form}
                color={palette.primary}
                secondaryColor={palette.secondary}
              />
            </div>
            <span className={styles.identity}>{formLabel}</span>
          </div>

          <div className={styles.controls}>
            <fieldset>
              <legend>Form</legend>
              <div className={styles.formOptions}>
                {forms.map((item) => (
                  <button
                    className={styles.formOption}
                    type="button"
                    aria-pressed={form === item.form}
                    key={item.form}
                    onClick={() => setForm(item.form)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend>Color</legend>
              <div className={styles.paletteOptions}>
                {palettes.map((option, index) => (
                  <button
                    className={styles.palette}
                    type="button"
                    aria-label={option.label}
                    aria-pressed={paletteIndex === index}
                    key={option.label}
                    onClick={() => setPaletteIndex(index)}
                    style={
                      {
                        '--primary': option.primary,
                        '--secondary': option.secondary,
                      } as React.CSSProperties
                    }
                  />
                ))}
              </div>
            </fieldset>
          </div>
        </div>
      </div>
    </section>
  );
}
