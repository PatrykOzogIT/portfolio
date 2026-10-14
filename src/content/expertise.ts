import type { ExpertiseArea } from './model';

/** What I do — capabilities, not tools (tools live in tech-stack.ts). */
export const EXPERTISE: readonly ExpertiseArea[] = [
  {
    id: 'architecture',
    icon: 'architecture',
    title: { pl: 'Architektura i modelowanie danych', en: 'Architecture and data modeling' },
    description: {
      pl: 'Projektuję strukturę aplikacji, API i relacyjne modele danych z myślą o dalszym rozwoju systemu, a nie tylko o najbliższym wdrożeniu.',
      en: 'I design application structure, APIs and relational data models with the system’s future in mind — not just the next release.',
    },
    points: {
      pl: [
        'Podział aplikacji na moduły i odpowiedzialności',
        'Projektowanie REST API',
        'Relacyjne modele danych',
        'Decyzje techniczne i ich kompromisy',
      ],
      en: [
        'Module boundaries and responsibilities',
        'REST API design',
        'Relational data models',
        'Technical decisions and their trade-offs',
      ],
    },
  },
  {
    id: 'fullstack',
    icon: 'fullstack',
    title: { pl: 'Full-stack: Angular i NestJS', en: 'Full-stack: Angular and NestJS' },
    description: {
      pl: 'Dostarczam funkcjonalności w całości — od bazy danych i logiki backendu po interfejs, z którego korzysta użytkownik.',
      en: 'I deliver features end to end — from the database and backend logic to the interface people actually use.',
    },
    points: {
      pl: [
        'Aplikacje frontendowe w Angularze',
        'Backend i API w NestJS',
        'Funkcjonalności od bazy danych po UI',
        'Wydajność aplikacji i zapytań',
      ],
      en: [
        'Angular frontends',
        'NestJS backends and APIs',
        'Features from database to UI',
        'Application and query performance',
      ],
    },
  },
  {
    id: 'process',
    icon: 'process',
    title: { pl: 'Procesy biznesowe i integracje', en: 'Business processes and integrations' },
    description: {
      pl: 'Zaczynam od zrozumienia, jak ludzie pracują. Analizuję potrzeby, projektuję procesy i łączę systemy, tak by usprawniały codzienną pracę.',
      en: 'I start by understanding how people work. I analyze needs, design processes and connect systems so they genuinely improve day-to-day work.',
    },
    points: {
      pl: [
        'Analiza potrzeb z użytkownikami biznesowymi',
        'Procesy: zamówienia, faktury, magazyn',
        'Integracje z systemami zewnętrznymi',
        'Automatyzacja i reguły biznesowe',
      ],
      en: [
        'Requirements analysis with business users',
        'Processes: orders, invoicing, warehouse',
        'Integrations with external systems',
        'Automation and business rules',
      ],
    },
  },
  {
    id: 'modernization',
    icon: 'modernization',
    title: { pl: 'Modernizacja systemów', en: 'System modernization' },
    description: {
      pl: 'Utrzymuję starsze aplikacje PHP i stopniowo zastępuję je rozwiązaniami w Angularze, NestJS i TypeScript — łącznie z migracją danych i funkcjonalności.',
      en: 'I maintain legacy PHP applications and gradually replace them with Angular, NestJS and TypeScript — including data and feature migration.',
    },
    points: {
      pl: [
        'Utrzymanie i rozwój systemów legacy',
        'Etapowa modernizacja i przygotowanie migracji',
        'Migracje danych między systemami',
        'Refaktoryzacja i debugowanie',
      ],
      en: [
        'Maintaining and evolving legacy systems',
        'Phased modernization and migration planning',
        'Data migration between systems',
        'Refactoring and debugging',
      ],
    },
    caseStudy: {
      id: 'case-modernization',
      label: { pl: 'Modernizacja', en: 'Modernization' },
      title: {
        pl: 'Kontrolowana modernizacja systemu legacy',
        en: 'Controlled legacy system modernization',
      },
      navLabel: { pl: 'Modernizacja legacy', en: 'Legacy modernization' },
      summary: {
        pl: 'Zaprojektowałem i przeprowadziłem migrację kluczowych danych operacyjnych firmy ze starszego systemu PHP/Zend do nowej architektury. Proces obejmował m.in. kontrahentów, produkty, stany magazynowe, zamówienia i dokumenty handlowe. Dzięki wielokrotnym migracjom testowym, raportom rozbieżności i mechanizmom weryfikacji możliwe było przygotowanie kontrolowanego przełączenia. Nowy system rozwijałem iteracyjnie, uwzględniając uwagi użytkowników i umożliwiając im testowanie na rzeczywistych danych.',
        en: 'I designed and carried out the migration of the company’s key operational data from a legacy PHP/Zend system into a modern architecture. The process covered customers, products, inventory, orders and commercial documents. Repeated trial migrations, discrepancy reports and verification mechanisms enabled a controlled cutover. I developed the new system iteratively, incorporating user feedback and allowing testing with real migrated data.',
      },
      decisions: {
        pl: [
          'Migracja jako powtarzalny, weryfikowalny proces',
          'Wielokrotne przebiegi testowe i raporty rozbieżności',
          'Podgląd i cofanie migracji pojedynczych zamówień',
          'Iteracyjny rozwój z udziałem użytkowników',
        ],
        en: [
          'Migration as a repeatable, verifiable process',
          'Repeated trial runs and discrepancy reports',
          'Preview and per-order rollback',
          'Iterative development with users involved',
        ],
      },
      outcome: {
        pl: 'Przełączenie produkcyjne odbyło się w ciągu jednej nocy, a następnego dnia użytkownicy rozpoczęli pracę w nowym systemie.',
        en: 'The production cutover took place overnight, and users started working in the new system the following morning.',
      },
    },
  },
];
