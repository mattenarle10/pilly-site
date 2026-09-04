'use client';

import gsap from 'gsap';
import { Children, useEffect, useId, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';

import styles from './journey.module.css';

const defaultBackgroundTokens = ['--background', '--surface'] as const;
const horizontalJourneyQuery =
  '(min-width: 901px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)';

type Props = {
  children: ReactNode;
  backgroundTokens?: ReadonlyArray<string>;
};

export function Journey({ children, backgroundTokens = defaultBackgroundTokens }: Props) {
  const viewport = useRef<HTMLDivElement>(null);
  const instructionsId = useId();
  const [isHorizontal, setIsHorizontal] = useState(false);

  useEffect(() => {
    const node = viewport.current;
    if (!node) return;

    const journeyHeader = node.querySelector<HTMLElement>('[data-journey-header]');
    const rootStyles = getComputedStyle(document.documentElement);
    const backgrounds = backgroundTokens.map((token) => rootStyles.getPropertyValue(token).trim());
    const media = window.matchMedia(horizontalJourneyQuery);
    let removeHorizontalListeners = () => {};

    const configureJourney = () => {
      removeHorizontalListeners();
      setIsHorizontal(media.matches);
      node.style.removeProperty('background-color');
      if (journeyHeader) gsap.set(journeyHeader, { clearProps: 'opacity,visibility' });

      if (!media.matches) return;

      const maxScroll = () => Math.max(0, node.scrollWidth - node.clientWidth);
      const moveTo = (next: number, behavior: ScrollBehavior = 'auto') => {
        node.scrollTo({ left: Math.min(maxScroll(), Math.max(0, next)), behavior });
      };
      const renderJourney = () => {
        const sceneProgress = node.clientWidth ? node.scrollLeft / node.clientWidth : 0;
        const currentScene = Math.min(Math.floor(sceneProgress), backgrounds.length - 1);
        const nextScene = Math.min(currentScene + 1, backgrounds.length - 1);
        const localProgress = Math.min(1, Math.max(0, sceneProgress - currentScene));
        node.style.backgroundColor = gsap.utils.interpolate(
          backgrounds[currentScene],
          backgrounds[nextScene],
          localProgress,
        );
        if (journeyHeader) {
          gsap.set(journeyHeader, {
            autoAlpha: gsap.utils.clamp(0, 1, 1 - sceneProgress * 2.2),
          });
        }
      };
      const handleWheel = (event: WheelEvent) => {
        const dominantDelta =
          Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
        const unit =
          event.deltaMode === WheelEvent.DOM_DELTA_LINE
            ? 18
            : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
              ? node.clientWidth
              : 1;
        const next = Math.min(maxScroll(), Math.max(0, node.scrollLeft + dominantDelta * unit));
        if (next === node.scrollLeft) return;

        event.preventDefault();
        moveTo(next);
      };
      const handleKey = (event: KeyboardEvent) => {
        if (event.target !== node) return;

        const destinations: Partial<Record<string, number>> = {
          ArrowRight: node.scrollLeft + 160,
          ArrowLeft: node.scrollLeft - 160,
          PageDown: node.scrollLeft + node.clientWidth * 0.8,
          PageUp: node.scrollLeft - node.clientWidth * 0.8,
          Home: 0,
          End: maxScroll(),
        };
        const destination = destinations[event.key];
        if (destination === undefined) return;

        event.preventDefault();
        moveTo(destination, 'smooth');
      };
      const handleResize = () => {
        moveTo(node.scrollLeft);
        renderJourney();
      };

      node.addEventListener('wheel', handleWheel, { passive: false });
      node.addEventListener('scroll', renderJourney, { passive: true });
      node.addEventListener('keydown', handleKey);
      window.addEventListener('resize', handleResize);
      renderJourney();

      removeHorizontalListeners = () => {
        node.removeEventListener('wheel', handleWheel);
        node.removeEventListener('scroll', renderJourney);
        node.removeEventListener('keydown', handleKey);
        window.removeEventListener('resize', handleResize);
      };
    };

    media.addEventListener('change', configureJourney);
    configureJourney();

    return () => {
      media.removeEventListener('change', configureJourney);
      removeHorizontalListeners();
    };
  }, [backgroundTokens]);

  return (
    <div
      className={styles.journey}
      ref={viewport}
      role="region"
      tabIndex={isHorizontal ? 0 : undefined}
      aria-label="Pilly product tour"
      aria-describedby={isHorizontal ? instructionsId : undefined}
    >
      {isHorizontal ? (
        <span className={styles.srOnly} id={instructionsId}>
          Use the left and right arrow keys to explore.
        </span>
      ) : null}
      {Children.map(children, (child, index) => (
        <div
          className={styles.scene}
          style={
            {
              '--scene-background': `var(${backgroundTokens[index] ?? '--background'})`,
            } as CSSProperties
          }
        >
          {child}
        </div>
      ))}
    </div>
  );
}
