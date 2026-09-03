'use client';

import gsap from 'gsap';
import { Children, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

import styles from './slide-deck.module.css';

export function SlideDeck({ children }: { children: ReactNode }) {
  const viewport = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = viewport.current;
    if (!node) return;

    const journeyHeader = node.querySelector<HTMLElement>('[data-journey-header]');
    const rootStyles = getComputedStyle(document.documentElement);
    const firstBackground = rootStyles.getPropertyValue('--background').trim();
    const nextBackground = rootStyles.getPropertyValue('--surface').trim();
    const maxScroll = () => Math.max(0, node.scrollWidth - node.clientWidth);
    const renderJourney = () => {
      const progress = maxScroll() ? node.scrollLeft / maxScroll() : 0;
      node.style.backgroundColor = gsap.utils.interpolate(
        firstBackground,
        nextBackground,
        progress,
      );
      if (journeyHeader) {
        gsap.set(journeyHeader, {
          autoAlpha: gsap.utils.clamp(0, 1, 1 - progress * 2.2),
        });
      }
    };
    const moveTo = (next: number) => {
      node.scrollLeft = Math.min(maxScroll(), Math.max(0, next));
    };

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      const unit = event.deltaMode === WheelEvent.DOM_DELTA_LINE ? 18 : 1;
      moveTo(node.scrollLeft + delta * unit);
    };

    const handleKey = (event: KeyboardEvent) => {
      const distance =
        event.key === 'ArrowRight'
          ? 160
          : event.key === 'ArrowLeft'
            ? -160
            : event.key === 'PageDown'
              ? node.clientWidth * 0.8
              : event.key === 'PageUp'
                ? node.clientWidth * -0.8
                : 0;
      if (!distance) return;

      event.preventDefault();
      moveTo(node.scrollLeft + distance);
    };

    const handleScroll = () => {
      renderJourney();
    };
    const handleResize = () => {
      moveTo(Math.min(node.scrollLeft, maxScroll()));
      renderJourney();
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    node.addEventListener('scroll', handleScroll, { passive: true });
    node.addEventListener('keydown', handleKey);
    window.addEventListener('resize', handleResize);
    renderJourney();

    return () => {
      window.removeEventListener('wheel', handleWheel);
      node.removeEventListener('scroll', handleScroll);
      node.removeEventListener('keydown', handleKey);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className={styles.deck} ref={viewport} tabIndex={0} aria-label="Pilly product tour">
      {Children.map(children, (child) => (
        <div className={styles.slide}>{child}</div>
      ))}
    </div>
  );
}
