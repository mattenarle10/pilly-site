export const horizontalJourneyViewport = { minWidth: 901, minHeight: 900 } as const;
export const journeyReadyEvent = 'pilly:journey-ready';

export const horizontalJourneyQuery = `(min-width: ${horizontalJourneyViewport.minWidth}px) and (min-height: ${horizontalJourneyViewport.minHeight}px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)`;
