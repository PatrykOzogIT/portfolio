/**
 * Polish UI dictionary — the reference shape. `en.ts` must match it exactly (enforced by the type system).
 */
export const pl = {
  meta: {
    homeTitle: 'Patryk Ożóg — Senior Full-Stack Developer',
    homeDescription:
      'Senior Full-Stack Developer: Angular, NestJS, TypeScript. Projektuję i rozwijam systemy ERP, WMS i B2B — od architektury i modelu danych po integracje i interfejsy.',
    notFoundTitle: 'Nie znaleziono strony',
    styleguideTitle: 'Design system',
  },
  a11y: {
    skipLink: 'Przejdź do treści',
    mainNav: 'Główna nawigacja',
    openMenu: 'Otwórz menu',
    closeMenu: 'Zamknij menu',
    newTab: '(otwiera się w nowej karcie)',
    languageSwitch: 'Wybór języka',
    homeLink: 'Patryk Ożóg — strona główna',
  },
  languages: {
    pl: 'Polski',
    en: 'English',
  },
  nav: {
    expertise: 'Specjalizacje',
    ecosystem: 'Ekosystem',
    technology: 'Technologie',
    projects: 'Projekty',
    contact: 'Kontakt',
  },
  hero: {
    lead: 'Projektuję i rozwijam systemy biznesowe — od analizy procesów i modelu danych, przez architekturę i integracje, po interfejsy, z których ludzie korzystają na co dzień.',
    primaryCta: 'Zobacz ekosystem',
    contactCta: 'Kontakt i CV',
  },
  project: {
    sections: {
      about: 'O projekcie',
      problem: 'Problem i rozwiązanie',
      features: 'Funkcjonalności',
      architecture: 'Architektura',
      challenges: 'Wyzwania techniczne',
    },
    technologies: 'Technologie',
    github: 'Kod na GitHub',
    demo: 'Live Demo',
    allProjects: 'Wszystkie projekty',
    previous: 'Poprzedni projekt',
    next: 'Następny projekt',
  },
  notFound: {
    title: 'Nie znaleziono strony',
    text: 'Ta strona nie istnieje albo została przeniesiona.',
    home: 'Wróć na stronę główną',
  },
  footer: {
    rights: 'Wszystkie prawa zastrzeżone.',
  },
};

export type Dictionary = typeof pl;
