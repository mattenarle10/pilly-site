import { Check } from 'lucide-react';

import { Medicine } from '@/graphics';
import type { MedicineForm } from '@/graphics';

import styles from './routine.module.css';

type Dose = {
  form: MedicineForm;
  color: string;
  secondaryColor?: string;
};

const morning: ReadonlyArray<Dose> = [
  { form: 'tablet', color: '#f3ccd7' },
  { form: 'capsule', color: '#f2c6ad', secondaryColor: '#cdc8e8' },
  { form: 'drops', color: '#cdc8e8' },
];

const midday: ReadonlyArray<Dose> = [
  { form: 'capsule', color: '#cdc8e8', secondaryColor: '#fbe9de' },
  { form: 'tablet', color: '#f3ccd7' },
  { form: 'injection', color: '#f2c6ad' },
];

function DoseMarks({ doses, more }: { doses: ReadonlyArray<Dose>; more?: number }) {
  return (
    <div className={styles.doses} aria-hidden="true">
      {doses.map((dose, index) => (
        <span className={styles.dose} key={`${dose.form}-${index}`}>
          <Medicine {...dose} />
        </span>
      ))}
      {more ? <span className={styles.more}>+{more}</span> : null}
    </div>
  );
}

export function Routine() {
  return (
    <section className={styles.section} aria-labelledby="routine-title">
      <div className={styles.inner}>
        <div className={styles.copy}>
          <h2 id="routine-title">
            Your routine,
            <br /> at a glance.
          </h2>
          <p>Due now, recorded, and coming up.</p>
        </div>

        <div className={styles.board} data-motion-group="routine">
          <header className={styles.boardHeader}>
            <strong>Today</strong>
            <span>Wednesday</span>
          </header>

          <div className={styles.packs}>
            <article data-card-motion className={`${styles.pack} ${styles.recorded}`}>
              <div className={styles.packTop}>
                <strong>6:30 AM</strong>
                <span className={styles.state}>
                  <Check aria-hidden="true" size={17} strokeWidth={2.3} />
                  Recorded
                </span>
              </div>
              <DoseMarks doses={morning} more={2} />
            </article>

            <article data-card-motion className={`${styles.pack} ${styles.due}`}>
              <div className={styles.packTop}>
                <strong>8:00 AM</strong>
                <span className={styles.dueCount}>5 due</span>
              </div>
              <DoseMarks doses={midday} more={2} />
            </article>

            <article data-card-motion className={`${styles.pack} ${styles.progress}`}>
              <div className={styles.packTop}>
                <strong>9:00 AM</strong>
                <span className={styles.progressCopy}>
                  <b>1 due</b>
                  <small>4 of 5 done</small>
                </span>
              </div>
              <DoseMarks doses={morning} more={2} />
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
