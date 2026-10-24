'use client';

import gsap from 'gsap';
import { Children, useLayoutEffect, useId, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';

import {
  horizontalJourneyQuery,
  horizontalJourneyViewport,
  journeyReadyEvent,
} from '@/motion/journey-mode';
import { useCardMotion } from '@/motion/use-card-motion';

import styles from './journey.module.css';

const defaultBackgroundTokens = ['--background', '--surface'] as const;
const reducedMotionQuery = '(prefers-reduced-motion: reduce)';

type JourneyMode = 'static' | 'vertical' | 'horizontal';

type Props = {
  children: ReactNode;
  backgroundTokens?: ReadonlyArray<string>;
};

export function Journey({ children, backgroundTokens = defaultBackgroundTokens }: Props) {
  const viewport = useRef<HTMLDivElement>(null);
  const pendingScene = useRef<number | null>(null);
  const instructionsId = useId();
  const [mode, setMode] = useState<JourneyMode>('static');
  const isHorizontal = mode === 'horizontal';
  useCardMotion(viewport, mode);

  useLayoutEffect(() => {
    const node = viewport.current;
    if (!node || pendingScene.current === null) return;
    // The motion hook schedules its refresh first; restore after it measures the new layout.
    const frame = requestAnimationFrame(() => {
      const scene =
        node.querySelectorAll<HTMLElement>('[data-journey-scene]')[pendingScene.current!];
      pendingScene.current = null;
      if (mode === 'horizontal') {
        window.scrollTo({ top: 0, behavior: 'instant' });
        node.scrollTo({ left: scene.offsetLeft, behavior: 'instant' });
      } else {
        node.scrollLeft = 0;
        window.scrollTo({
          top: scene.getBoundingClientRect().top + window.scrollY,
          behavior: 'instant',
        });
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [mode]);

  useLayoutEffect(() => {
    const node = viewport.current;
    if (!node) return;

    // The journey must own layout changes so it can capture the current section first.
    window.dispatchEvent(new Event(journeyReadyEvent));

    const journeyHeader = node.querySelector<HTMLElement>('[data-journey-header]');
    const rootStyles = getComputedStyle(document.documentElement);
    const backgrounds = backgroundTokens.map((token) => rootStyles.getPropertyValue(token).trim());
    const horizontalMedia = window.matchMedia(horizontalJourneyQuery);
    const reducedMotionMedia = window.matchMedia(reducedMotionQuery);
    const scenes = Array.from(node.querySelectorAll<HTMLElement>('[data-journey-scene]'));
    let previousHorizontal: boolean | undefined;
    let configuredMode: JourneyMode | undefined;
    let progress = 0;
    let horizontalWidth = node.clientWidth;
    let removeJourneyListeners = () => {};

    const paintBackground = (sceneProgress: number) => {
      const currentScene = Math.min(Math.floor(sceneProgress), backgrounds.length - 1);
      const nextScene = Math.min(currentScene + 1, backgrounds.length - 1);
      const localProgress = Math.min(1, Math.max(0, sceneProgress - currentScene));
      node.style.backgroundColor = gsap.utils.interpolate(
        backgrounds[currentScene],
        backgrounds[nextScene],
        localProgress,
      );
    };

    const configureJourney = () => {
      const nextMode = horizontalMedia.matches
        ? 'horizontal'
        : reducedMotionMedia.matches
          ? 'static'
          : 'vertical';
      if (configuredMode === nextMode) return;
      configuredMode = nextMode;
      removeJourneyListeners();
      const horizontal = horizontalMedia.matches;
      const changingAxis = previousHorizontal !== undefined && previousHorizontal !== horizontal;
      // A narrower viewport can clamp scrollLeft before resize; retain its last measured progress.
      if (previousHorizontal && node.clientWidth === horizontalWidth) {
        progress = node.scrollLeft / horizontalWidth;
      }
      const activeScene = Math.min(scenes.length - 1, Math.round(progress));
      previousHorizontal = horizontal;
      document.documentElement.toggleAttribute('data-horizontal-journey', horizontalMedia.matches);
      node.style.removeProperty('background-color');
      if (journeyHeader) gsap.set(journeyHeader, { clearProps: 'opacity,visibility' });

      if (changingAxis) {
        pendingScene.current = activeScene;
        progress = activeScene;
      }

      if (!horizontalMedia.matches) {
        setMode(reducedMotionMedia.matches ? 'static' : 'vertical');
        let frame = 0;
        const renderVerticalJourney = () => {
          frame = 0;
          if (horizontalMedia.matches || pendingScene.current !== null) return;
          const viewportCenter = window.innerHeight / 2;
          const centers = scenes.map((scene) => {
            const rect = scene.getBoundingClientRect();
            return rect.top + rect.height / 2;
          });

          let sceneProgress = 0;
          if (viewportCenter >= centers[centers.length - 1]) {
            sceneProgress = centers.length - 1;
          } else {
            for (let index = 0; index < centers.length - 1; index += 1) {
              if (viewportCenter < centers[index]) break;
              if (viewportCenter <= centers[index + 1]) {
                const distance = centers[index + 1] - centers[index];
                sceneProgress = index + (viewportCenter - centers[index]) / distance;
                break;
              }
            }
          }
          progress = sceneProgress;
          if (!reducedMotionMedia.matches) paintBackground(sceneProgress);
        };
        const scheduleVerticalRender = () => {
          if (frame) return;
          frame = window.requestAnimationFrame(renderVerticalJourney);
        };

        window.addEventListener('scroll', scheduleVerticalRender, { passive: true });
        window.addEventListener('resize', scheduleVerticalRender);
        renderVerticalJourney();

        removeJourneyListeners = () => {
          window.removeEventListener('scroll', scheduleVerticalRender);
          window.removeEventListener('resize', scheduleVerticalRender);
          if (frame) window.cancelAnimationFrame(frame);
        };
        return;
      }

      setMode('horizontal');

      horizontalWidth = node.clientWidth;
      const maxScroll = () => Math.max(0, node.scrollWidth - node.clientWidth);
      const moveTo = (next: number, behavior: ScrollBehavior = 'auto') => {
        node.scrollTo({ left: Math.min(maxScroll(), Math.max(0, next)), behavior });
      };
      const renderJourney = () => {
        if (
          !horizontalMedia.matches ||
          node.clientWidth !== horizontalWidth ||
          pendingScene.current !== null
        )
          return;
        const sceneProgress = node.clientWidth ? node.scrollLeft / node.clientWidth : 0;
        progress = sceneProgress;
        paintBackground(sceneProgress);
        if (journeyHeader) {
          gsap.set(journeyHeader, {
            autoAlpha: gsap.utils.clamp(0, 1, 1 - sceneProgress * 2.2),
          });
        }
      };
      const handleWheel = (event: WheelEvent) => {
        if (event.ctrlKey || event.defaultPrevented) return;
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
        // Resize precedes media-query change events; read dimensions before changing scroll state.
        if (
          innerWidth < horizontalJourneyViewport.minWidth ||
          innerHeight < horizontalJourneyViewport.minHeight
        )
          return;
        if (node.clientWidth >= horizontalWidth) progress = node.scrollLeft / horizontalWidth;
        horizontalWidth = node.clientWidth;
        moveTo(progress * horizontalWidth);
        renderJourney();
      };

      node.addEventListener('wheel', handleWheel, { passive: false });
      node.addEventListener('scroll', renderJourney, { passive: true });
      node.addEventListener('keydown', handleKey);
      window.addEventListener('resize', handleResize);
      renderJourney();

      removeJourneyListeners = () => {
        node.removeEventListener('wheel', handleWheel);
        node.removeEventListener('scroll', renderJourney);
        node.removeEventListener('keydown', handleKey);
        window.removeEventListener('resize', handleResize);
      };
    };

    horizontalMedia.addEventListener('change', configureJourney);
    reducedMotionMedia.addEventListener('change', configureJourney);
    configureJourney();

    return () => {
      document.documentElement.removeAttribute('data-horizontal-journey');
      horizontalMedia.removeEventListener('change', configureJourney);
      reducedMotionMedia.removeEventListener('change', configureJourney);
      removeJourneyListeners();
      pendingScene.current = null;
    };
  }, [backgroundTokens]);

  return (
    <div
      className={styles.journey}
      ref={viewport}
      role="region"
      data-axis={mode}
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
          data-journey-scene
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
