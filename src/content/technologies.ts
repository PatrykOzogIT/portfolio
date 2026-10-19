import type { Tech } from './model';

/**
 * Technology registry — the single source of technology names.
 * Projects, the ecosystem and the Technology section reference entries by key,
 * so a label is spelled the same everywhere.
 */
export const TECHNOLOGIES = {
  angular: { label: 'Angular' },
  typescript: { label: 'TypeScript' },
  javascript: { label: 'JavaScript' },
  html: { label: 'HTML5' },
  scss: { label: 'CSS / SCSS' },
  rxjs: { label: 'RxJS' },
  'angular-material': { label: 'Angular Material' },
  primeng: { label: 'PrimeNG' },
  nodejs: { label: 'Node.js' },
  nestjs: { label: 'NestJS' },
  rest: { label: 'REST API' },
  typeorm: { label: 'TypeORM' },
  php: { label: 'PHP / Zend' },
  mysql: { label: 'MySQL / MariaDB' },
  git: { label: 'Git' },
  'ci-cd': { label: 'CI/CD' },
  postgresql: { label: 'PostgreSQL' },
  'claude-api': { label: 'Claude API' },
  prisma: { label: 'Prisma' },
  docker: { label: 'Docker' },
  playwright: { label: 'Playwright' },
} as const satisfies Record<string, Tech>;

export type TechId = keyof typeof TECHNOLOGIES;
