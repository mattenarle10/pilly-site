'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { RefObject } from 'react';

import { motion } from './tokens';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function useCardMotion(root: RefObject<HTMLDivElement | null>, mode: string) {
  useGSAP(
    () => {
      const node = root.current;
      if (!node || mode === 'static') return;
      const media = gsap.matchMedia();
      media.add('(prefers-reduced-motion: no-preference)', () => {
        const originalStyles = Array.from(
          node.querySelectorAll<HTMLElement>('[data-card-motion], [data-motion-group]'),
        ).map((card) => ({ card, style: card.getAttribute('style') }));
        const horizontal = mode === 'horizontal';
        const scroll = {
          scroller: horizontal ? node : undefined,
          horizontal,
          scrub: horizontal ? motion.scrollSmoothing : true,
          invalidateOnRefresh: true,
        };
        const ribbon = node.querySelector<HTMLElement>('[data-ribbon]');
        if (ribbon) {
          const cards = ribbon.querySelectorAll<HTMLElement>('[data-card-motion]');
          if (horizontal) {
            gsap.to(ribbon.closest('[data-motion-group]'), {
              y: -motion.ribbonTravel,
              ease: 'none',
              scrollTrigger: {
                ...scroll,
                trigger: ribbon.closest('[data-journey-scene]') ?? undefined,
                start: 'left left',
                end: () => `+=${node.clientWidth * 0.65}`,
              },
            });
            gsap.to(cards, {
              y: -motion.cardTravel,
              stagger: 0.06,
              ease: 'none',
              scrollTrigger: {
                ...scroll,
                trigger: ribbon.closest('[data-journey-scene]') ?? undefined,
                start: 'left left',
                end: () => `+=${node.clientWidth * 0.65}`,
              },
            });
          } else {
            gsap.to(ribbon.closest('[data-motion-group]'), {
              y: -motion.ribbonTravel / 2,
              ease: 'none',
              scrollTrigger: {
                ...scroll,
                trigger: ribbon.closest('[data-journey-scene]') ?? undefined,
                start: 'top top',
                end: () => `+=${window.innerHeight * 0.65}`,
              },
            });
            cards.forEach((card) => {
              gsap
                .timeline({
                  scrollTrigger: {
                    trigger: card,
                    scroller: ribbon,
                    horizontal: true,
                    start: 'center right',
                    end: 'center left',
                    scrub: true,
                    invalidateOnRefresh: true,
                  },
                })
                .fromTo(card, { scale: 0.98 }, { scale: 1, duration: 0.5, ease: 'none' })
                .to(card, { scale: 0.98, duration: 0.5, ease: 'none' });
            });
          }
        }
        for (const kind of ['routine', 'identity', 'closing'] as const) {
          const group = node.querySelector<HTMLElement>(`[data-motion-group="${kind}"]`);
          if (!group) continue;
          const distance = kind === 'routine' ? motion.routineTravel : motion.identityTravel;
          const cards = group.querySelectorAll('[data-card-motion]');
          const travel = horizontal ? distance : distance / 2;
          const cardTravel = horizontal ? motion.cardTravel : motion.cardTravel / 2;
          gsap.set(group, { y: travel });
          if (cards.length) gsap.set(cards, { y: cardTravel });
          const timeline = gsap.timeline({
            scrollTrigger: {
              ...scroll,
              trigger: horizontal ? (group.closest('[data-journey-scene]') ?? undefined) : group,
              start: horizontal ? 'left 95%' : 'top 90%',
              end: horizontal ? 'left 15%' : 'top 55%',
            },
          });
          timeline.to(group, { y: 0, duration: 1, ease: 'none' }, 0);
          if (cards.length) {
            timeline.to(
              cards,
              { y: 0, duration: 0.8, ease: 'none', stagger: kind === 'routine' ? 0.06 : 0 },
              0.08,
            );
          }
        }
        // Measure after the layout mode and fonts settle; never reset scroll position.
        let disposed = false;
        const refresh = () => {
          if (!disposed) ScrollTrigger.refresh();
        };
        const frame = requestAnimationFrame(refresh);
        void document.fonts.ready.then(refresh);
        window.addEventListener('pageshow', refresh);
        const observer = new ResizeObserver(refresh);
        observer.observe(node);
        return () => {
          disposed = true;
          cancelAnimationFrame(frame);
          observer.disconnect();
          window.removeEventListener('pageshow', refresh);
          // Initial offsets and scrubbed tweens share transforms; restore the pre-motion styles.
          for (const { card, style } of originalStyles) {
            if (style === null) card.removeAttribute('style');
            else card.setAttribute('style', style);
          }
        };
      });
      return () => media.revert();
    },
    { scope: root, dependencies: [mode], revertOnUpdate: true },
  );
}
