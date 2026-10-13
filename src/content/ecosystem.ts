import type { EcosystemSystem } from './model';

/**
 * Commercial ecosystem — anonymised. Three separate applications (Angular frontend + NestJS API each),
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
        'Product catalogue',
        'Order placement and handling',
        'B2B customer-specific business logic',
        'Data synchronisation with the other systems',
      ],
    },
    technologies: ['angular', 'typescript', 'nestjs', 'mysql', 'mariadb'],
    responsibilities: [],
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
    technologies: ['angular', 'typescript', 'nestjs', 'mysql', 'mariadb'],
    responsibilities: [],
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
    technologies: ['angular', 'typescript', 'nestjs', 'mysql', 'mariadb'],
    responsibilities: [],
  },
];
