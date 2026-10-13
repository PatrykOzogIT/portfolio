import type { Tech } from './model';

/**
 * Technology registry — the single source of technology names.
 * Projects and ecosystem systems reference entries by key, so a label is spelled the same everywhere.
 */
export const TECHNOLOGIES = {
  angular: { label: 'Angular', group: 'frontend' },
  typescript: { label: 'TypeScript', group: 'frontend' },
  javascript: { label: 'JavaScript', group: 'frontend' },
  html: { label: 'HTML5', group: 'frontend' },
  scss: { label: 'CSS / SCSS', group: 'frontend' },
  rxjs: { label: 'RxJS', group: 'frontend' },
  'angular-material': { label: 'Angular Material', group: 'frontend' },
  primeng: { label: 'PrimeNG', group: 'frontend' },
  nodejs: { label: 'Node.js', group: 'backend' },
  nestjs: { label: 'NestJS', group: 'backend' },
  typeorm: { label: 'TypeORM', group: 'backend' },
  php: { label: 'PHP', group: 'backend' },
  mysql: { label: 'MySQL', group: 'data' },
  mariadb: { label: 'MariaDB', group: 'data' },
  sql: { label: 'SQL', group: 'data' },
  git: { label: 'Git', group: 'engineering' },
  'ci-cd': { label: 'CI/CD', group: 'engineering' },
} as const satisfies Record<string, Tech>;

export type TechId = keyof typeof TECHNOLOGIES;
