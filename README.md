# Pilly site

The public home, privacy, terms, and support pages for Pilly. The site is static Astro; the landing page uses isolated GSAP motion around real product screens and remains complete without JavaScript.

## Commands

```sh
bun install
bun run dev
bun run verify
```

The site is fully static. Production hosting is managed separately in the private `pilly-infra` repository.

## Implementation sources

- [Astro scripts](https://docs.astro.build/en/guides/client-side-scripts/) and [images](https://docs.astro.build/en/guides/images/)
- [GSAP](https://gsap.com/docs/v3/) and [ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/)
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [WCAG animation from interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)
