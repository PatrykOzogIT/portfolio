import type { EcosystemRole, EcosystemSystem } from './model';

/**
 * Commercial ecosystem — anonymized. Three separate applications (Angular frontend + NestJS API each),
 * sharing one MySQL/MariaDB database and communicating backend-to-backend over REST.
 */
export const ECOSYSTEM: readonly EcosystemSystem[] = [
  {
    id: 'b2b',
    name: 'B2B',
    fullName: { pl: 'Business-to-Business', en: 'Business-to-Business' },
    role: { pl: 'Sprzedaż B2B', en: 'B2B sales' },
    summary: {
      pl: 'Platforma, przez którą klienci biznesowi przeglądają ofertę i składają zamówienia — z logiką dopasowaną do warunków współpracy B2B.',
      en: 'The platform business customers use to browse the offer and place orders — with logic tailored to B2B trading terms.',
    },
    areas: {
      pl: [
        'Katalog produktów',
        'Składanie i obsługa zamówień',
        'Logika biznesowa klientów B2B',
        'Synchronizacja danych z pozostałymi systemami',
      ],
      en: [
        'Product catalog',
        'Order placement and handling',
        'B2B customer-specific business logic',
        'Data synchronization with the other systems',
      ],
    },
    technologies: ['angular', 'typescript', 'nestjs', 'mysql'],
  },
  {
    id: 'erp',
    name: 'ERP',
    fullName: { pl: 'Enterprise Resource Planning', en: 'Enterprise Resource Planning' },
    role: { pl: 'Procesy biznesowe', en: 'Business operations' },
    summary: {
      pl: 'Centralna aplikacja obsługująca kluczowe procesy firmy — od zamówień i fakturowania po reguły biznesowe i automatyzację.',
      en: 'The central application behind core business processes — from orders and invoicing to business rules and automation.',
    },
    areas: {
      pl: [
        'Zamówienia',
        'Faktury i korekty',
        'Produkty i stany magazynowe',
        'Procesy sprzedażowe',
        'Dokumenty biznesowe i PDF',
        'Reguły biznesowe i automatyzacja',
      ],
      en: [
        'Orders',
        'Invoices and credit notes',
        'Products and stock levels',
        'Sales processes',
        'Business documents and PDFs',
        'Business rules and automation',
      ],
    },
    technologies: ['angular', 'typescript', 'nestjs', 'mysql'],
  },
  {
    id: 'wms',
    name: 'WMS',
    fullName: { pl: 'Warehouse Management System', en: 'Warehouse Management System' },
    role: { pl: 'Operacje magazynowe', en: 'Warehouse operations' },
    summary: {
      pl: 'System wspierający codzienną pracę magazynu — od rezerwacji stanów, przez kompletację, po pakowanie i weryfikację zamówień.',
      en: 'Supports day-to-day warehouse work — from stock reservations through picking to packing and order verification.',
    },
    areas: {
      pl: [
        'Obsługa zamówień magazynowych',
        'Rezerwacje stanów',
        'Kompletacja',
        'Pakowanie i weryfikacja',
        'Identyfikacja produktów i numery seryjne',
        'Interfejsy operatorów magazynowych',
      ],
      en: [
        'Warehouse order handling',
        'Stock reservations',
        'Picking',
        'Packing and verification',
        'Product identification and serial numbers',
        'Warehouse operator interfaces',
      ],
    },
    technologies: ['angular', 'typescript', 'nestjs', 'mysql'],
  },
];

/**
 * My role in the ecosystem — as confirmed by me. Deliberately not a job title, and not a claim of
 * having written the whole ecosystem alone.
 */
export const ECOSYSTEM_ROLE: EcosystemRole = {
  intro: {
    pl: 'Zaprojektowałem ten ekosystem i przez pierwsze miesiące sam go budowałem — jako następcę systemu PHP/Zend, który wcześniej w całości napisałem. Gdy projekt nabrał tempa, do implementacji dołączył niewielki zespół. Nadal odpowiadam za architekturę i dalszy rozwój, łącząc decyzje techniczne z praktycznymi potrzebami użytkowników.',
    en: 'I designed this ecosystem and built it on my own for the first months — as the successor to a PHP/Zend system I had previously written entirely by myself. As the project gained momentum, a small team joined to help with implementation. I remain responsible for the architecture and further development, connecting technical decisions with the practical needs of its users.',
  },
  responsibilities: [
    {
      area: 'architecture',
      description: {
        pl: 'Zaprojektowałem szkielet systemu i postawiłem bazę danych: trzy aplikacje z osobnymi backendami, wspólna baza MySQL/MariaDB jako jedno źródło prawdy i komunikacja REST między backendami.',
        en: 'I designed the system’s foundation and set up its database: three applications with separate backends, a shared MySQL/MariaDB database as the single source of truth, and REST communication between the backends.',
      },
    },
    {
      area: 'analysis',
      description: {
        pl: 'Analizuję potrzeby użytkowników i procesy biznesowe.',
        en: 'I analyze user needs and business processes.',
      },
    },
    {
      area: 'integrations',
      description: {
        pl: 'Projektuję modele danych, API oraz integracje.',
        en: 'I design data models, APIs and integrations.',
      },
    },
    {
      area: 'frontend',
      description: {
        pl: 'Implementuję funkcjonalności w aplikacjach Angular.',
        en: 'I implement features in the Angular applications.',
      },
    },
    {
      area: 'backend',
      description: {
        pl: 'Implementuję funkcjonalności w backendach NestJS.',
        en: 'I implement features in the NestJS backends.',
      },
    },
    {
      area: 'maintenance',
      description: {
        pl: 'Odpowiadam za rozwój i utrzymanie systemów oraz modernizację starszych rozwiązań PHP/Zend.',
        en: 'I’m responsible for evolving and maintaining the systems, and for modernizing legacy PHP/Zend solutions.',
      },
    },
  ],
};
