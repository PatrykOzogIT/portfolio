import type { EcosystemPerspective, EcosystemRole, EcosystemSystem } from './model';

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
    technologies: ['angular', 'typescript', 'nestjs', 'mysql-mariadb'],
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
    technologies: ['angular', 'typescript', 'nestjs', 'mysql-mariadb'],
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
    technologies: ['angular', 'typescript', 'nestjs', 'mysql-mariadb'],
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

/**
 * Architecture perspectives on the map (REST band, shared data layer) — real decisions, as confirmed by me.
 * No security implementation details, configuration or internal trade-offs.
 */
export const ECOSYSTEM_PERSPECTIVES: readonly EcosystemPerspective[] = [
  {
    id: 'communication',
    label: { pl: 'Architektura', en: 'Architecture' },
    title: {
      pl: 'Bezpieczna komunikacja i wspólne uprawnienia',
      en: 'Secure communication and shared authorization',
    },
    navLabel: { pl: 'Bezpieczna komunikacja', en: 'Secure communication' },
    summary: {
      pl: 'Aplikacje B2B, ERP i WMS korzystają ze wspólnej bazy danych, zachowując odrębne sesje użytkowników. Zaprojektowałem mechanizmy bezpiecznej komunikacji między backendami oraz wspólny model uprawnień obejmujący role, indywidualne nadania i dziedziczenie. Każda usługa samodzielnie egzekwuje zasady dostępu, a interfejs użytkownika odzwierciedla przyznane uprawnienia. Dzięki temu kontrola dostępu pozostaje spójna między aplikacjami i nie zależy wyłącznie od ograniczeń interfejsu.',
      en: 'The B2B, ERP and WMS applications share a database while maintaining separate user sessions. I designed secure backend-to-backend communication and a shared authorization model covering roles, individual permissions and inheritance. Each service enforces access rules independently, while the user interface reflects the permissions granted. This keeps access control consistent across applications without relying solely on UI restrictions.',
    },
    decisions: {
      pl: [
        'Bezpieczna komunikacja między usługami',
        'Wspólny model uprawnień',
        'Role, nadania i dziedziczenie',
        'Autoryzacja egzekwowana przez backendy',
      ],
      en: [
        'Secure service-to-service communication',
        'Shared authorization model',
        'Roles, grants and inheritance',
        'Backend-enforced authorization',
      ],
    },
  },
  {
    id: 'data',
    label: { pl: 'Dane i reguły', en: 'Data and rules' },
    title: {
      pl: 'Automatyczna alokacja i rezerwacja towarów',
      en: 'Automated stock allocation and reservations',
    },
    navLabel: { pl: 'Alokacja i rezerwacje', en: 'Allocation and reservations' },
    summary: {
      pl: 'Zaprojektowałem mechanizm alokacji i rezerwacji towarów dla wielu kanałów sprzedaży, firm i magazynów. System automatycznie dobiera źródło realizacji zamówienia według konfiguracji kanału, dostępności i priorytetów biznesowych — także dla produktów złożonych (BOM). Reguły pilnują spójności rezerwacji i lokalizacji, a dziennik ruchów magazynowych jest podstawą ewidencji stanów i rozliczeń międzyfirmowych, z których po zatwierdzeniu automatycznie powstają faktury.',
      en: 'I designed a stock allocation and reservation mechanism spanning multiple sales channels, companies and warehouses. The system automatically selects where each order is fulfilled based on channel configuration, availability and business priorities — including products assembled from components (BOM). Business rules keep reservations and locations consistent, and a stock movement ledger underpins inventory records and intercompany settlements, invoiced automatically once approved.',
    },
    decisions: {
      pl: [
        'Alokacja według kanału, dostępności i priorytetów',
        'Obsługa produktów złożonych (BOM)',
        'Spójność rezerwacji i lokalizacji',
        'Dziennik ruchów jako podstawa ewidencji',
      ],
      en: [
        'Allocation by channel, availability and priorities',
        'Support for bills of materials (BOM)',
        'Reservation and location consistency',
        'Stock movement ledger',
      ],
    },
  },
];
