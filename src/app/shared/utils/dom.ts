export const FOCUSABLE =
  'input:not(:disabled), select:not(:disabled), textarea:not(:disabled), button:not(:disabled), [href], [tabindex]:not([tabindex="-1"])';

/** Mobile layout, as the `.l-shell` container query (48rem); `false` without `matchMedia` (server, jsdom). */
export const isNarrow = (): boolean => globalThis.matchMedia?.('(width < 48rem)').matches ?? false;
