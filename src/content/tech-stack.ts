import type { TechStackGroup } from './model';

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
    title: { pl: 'Backend', en: 'Backend' },
    technologies: ['nestjs', 'nodejs', 'typescript', 'typeorm', 'php'],
    note: {
      pl: 'REST API, uwierzytelnianie i autoryzacja. PHP — systemy legacy.',
      en: 'REST APIs, authentication and authorization. PHP — legacy systems.',
    },
  },
  {
    id: 'data',
    title: { pl: 'Bazy danych', en: 'Databases' },
    technologies: ['mysql', 'mariadb', 'sql'],
  },
  {
    id: 'engineering',
    title: { pl: 'Warsztat', en: 'Tooling' },
    technologies: ['git', 'ci-cd'],
    note: {
      pl: 'Pipeline’y CI/CD projektuję i konfiguruję samodzielnie.',
      en: 'I design and configure CI/CD pipelines hands-on.',
    },
  },
];
