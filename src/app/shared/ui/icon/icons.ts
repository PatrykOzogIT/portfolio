/**
 * Icon registry. Outline icons come from Lucide (ISC licence), brand icons from Simple Icons (CC0).
 * Only icons actually used are included — no icon library in the bundle.
 */
export interface IconDef {
  readonly paths: readonly string[];
  /** Brand icons are filled; Lucide icons are stroked. */
  readonly filled?: boolean;
}

export const ICONS = {
  'arrow-right': { paths: ['M5 12h14', 'm12 5 7 7-7 7'] },
  'arrow-left': { paths: ['M19 12H5', 'm12 19-7-7 7-7'] },
  'arrow-up-right': { paths: ['M7 7h10v10', 'M7 17 17 7'] },
  'chevron-left': { paths: ['m15 18-6-6 6-6'] },
  'chevron-right': { paths: ['m9 18 6-6-6-6'] },
  menu: { paths: ['M4 6h16', 'M4 12h16', 'M4 18h16'] },
  close: { paths: ['M18 6 6 18', 'm6 6 12 12'] },
  check: { paths: ['M20 6 9 17l-5-5'] },
  copy: {
    paths: [
      'M10 8h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2z',
      'M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2',
    ],
  },
  mail: {
    paths: [
      'M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
      'm22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7',
    ],
  },
  download: { paths: ['M12 15V3', 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4', 'm7 10 5 5 5-5'] },
  cart: {
    paths: [
      'M7 21a1 1 0 1 0 2 0a1 1 0 1 0-2 0',
      'M18 21a1 1 0 1 0 2 0a1 1 0 1 0-2 0',
      'M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12',
    ],
  },
  layers: {
    paths: [
      'M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z',
      'm22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65',
      'm22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65',
    ],
  },
  warehouse: {
    paths: [
      'M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35Z',
      'M6 18h12',
      'M6 14h12',
      'M6 10h12v12H6z',
    ],
  },
  database: {
    paths: [
      'M3 5a9 3 0 1 0 18 0a9 3 0 1 0-18 0',
      'M3 5v14a9 3 0 0 0 18 0V5',
      'M3 12a9 3 0 0 0 18 0',
    ],
  },
  github: {
    filled: true,
    paths: [
      'M12 .3a12 12 0 0 0-3.8 23.38c.6.12.83-.26.83-.57L9 21.07c-3.34.72-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.08-.74.09-.73.09-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49 1 .1-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.14-.3-.54-1.52.1-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.28-1.55 3.29-1.23 3.29-1.23.64 1.66.24 2.88.12 3.18a4.65 4.65 0 0 1 1.23 3.22c0 4.61-2.8 5.63-5.48 5.92.42.36.81 1.1.81 2.22l-.01 3.29c0 .31.2.69.82.57A12 12 0 0 0 12 .3',
    ],
  },
  linkedin: {
    filled: true,
    paths: [
      'M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zm1.78 13.02H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z',
    ],
  },
} as const satisfies Record<string, IconDef>;

export type IconName = keyof typeof ICONS;
