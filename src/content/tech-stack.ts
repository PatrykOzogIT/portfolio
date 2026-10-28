import type { TechStackGroup } from './model';

/**
 * Order is the priority: the main stack (Angular, TypeScript, NestJS, Node.js) opens the first two groups.
 * Each technology appears once; PHP / Zend is legacy experience, shown muted.
 */
export const TECH_STACK: readonly TechStackGroup[] = [
  {
    id: 'frontend',
    title: { pl: 'Frontend', en: 'Frontend' },
    technologies: [
      'angular',
      'typescript',
      'rxjs',
      'javascript',
      'html',
      'scss',
      'angular-material',
      'primeng',
    ],
    note: {
      pl: 'Integracja z REST API, responsywne interfejsy, wielojęzyczność.',
      en: 'REST API integration, responsive interfaces, internationalization.',
    },
  },
  {
    id: 'backend',
    title: { pl: 'Backend i API', en: 'Backend & APIs' },
    technologies: ['nestjs', 'nodejs', 'rest', 'typeorm'],
    legacy: ['php'],
    note: {
      pl: 'Projektowanie REST API i integracji między systemami, uwierzytelnianie i autoryzacja. PHP / Zend — utrzymanie i etapowa modernizacja systemów legacy.',
      en: 'Designing REST APIs and integrations between systems, authentication and authorization. PHP / Zend — maintaining and modernizing legacy systems in phases.',
    },
  },
  {
    id: 'data',
    title: { pl: 'Bazy danych', en: 'Databases' },
    technologies: ['mysql-mariadb'],
    note: {
      pl: 'Projektowanie baz i modelowanie danych, migracje schematu, wspólna baza jako źródło prawdy dla kilku aplikacji.',
      en: 'Database design and data modeling, schema migrations, a shared database as the single source of truth for several applications.',
    },
  },
  {
    id: 'engineering',
    title: { pl: 'CI/CD i warsztat', en: 'CI/CD & tooling' },
    technologies: ['ci-cd', 'git'],
    note: {
      pl: 'Pipeline’y CI/CD projektuję i konfiguruję samodzielnie: build, testy, migracje i automatyczne wdrożenia.',
      en: 'I design and configure CI/CD pipelines hands-on: builds, tests, migrations and automated deployments.',
    },
  },
];
