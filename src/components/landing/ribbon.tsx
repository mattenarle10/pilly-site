'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Check } from 'lucide-react';
import { useEffect, useRef } from 'react';

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
  const scrollTarget = useRef(0);

  useEffect(() => {
    const node = viewport.current;
    if (!node) return;
    scrollTarget.current = node.scrollLeft;

    const syncTarget = () => {
      if (!gsap.isTweening(node)) scrollTarget.current = node.scrollLeft;
    };

    const handleWheel = (event: WheelEvent) => {
      const bounds = node.getBoundingClientRect();
      const isVisible = bounds.top < window.innerHeight && bounds.bottom > 0;
      if (!isVisible) return;

      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      const end = node.scrollWidth - node.clientWidth;
      const canAdvance = delta > 0 && node.scrollLeft < end - 1;
      const canReturn = delta < 0 && node.scrollLeft > 1;

      if (!canAdvance && !canReturn) return;

      event.preventDefault();
      scrollTarget.current = Math.min(end, Math.max(0, scrollTarget.current + delta));

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        node.scrollLeft = scrollTarget.current;
        return;
      }

      gsap.to(node, {
        scrollLeft: scrollTarget.current,
        duration: 0.34,
        ease: motion.easeOut,
        overwrite: true,
      });
    };

    node.addEventListener('scroll', syncTarget, { passive: true });
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      gsap.killTweensOf(node);
      node.removeEventListener('scroll', syncTarget);
      window.removeEventListener('wheel', handleWheel);
    };
  }, []);

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
      <div className={styles.viewport} ref={viewport} tabIndex={0} aria-label="Medicine forms">
        <div className={styles.track}>
          {items.map((item) => (
            <article className={styles.item} key={item.form} data-medicine>
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
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
