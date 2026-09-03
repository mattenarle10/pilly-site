import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const MOTION_QUERY = '(prefers-reduced-motion: no-preference)';

export function initLandingMotion(): void {
  gsap.registerPlugin(ScrollTrigger);

  const media = gsap.matchMedia();
  media.add(MOTION_QUERY, () => {
    const hero = document.querySelector<HTMLElement>('[data-landing-hero]');
    const pill = document.querySelector<HTMLElement>('[data-hero-pill]');
    const cards = gsap.utils.toArray<HTMLElement>('[data-feature-card]');

    if (hero && pill) {
      gsap.to(pill, {
        yPercent: 24,
        rotation: 9,
        ease: 'none',
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.6,
        },
      });

      gsap.to('.dose-orbit-left', {
        rotation: -7,
        ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.6 },
      });
      gsap.to('.dose-orbit-right', {
        rotation: 7,
        ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.6 },
      });
    }

    cards.forEach((card, index) => {
      gsap.from(card, {
        y: 42,
        autoAlpha: 0,
        duration: 0.7,
        delay: index % 2 === 1 ? 0.08 : 0,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 86%',
          once: true,
        },
      });
    });

    return () => ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
  });
}
