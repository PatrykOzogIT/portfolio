import type { ProjectMeta } from '../../model';

export const project: ProjectMeta = {
  slug: 'cookivo',
  order: 1,
  published: true,
  kind: 'personal',
  isLive: true,
  developmentStatus: 'in-development',
  title: { pl: 'Cookivo', en: 'Cookivo' },
  shortDescription: {
    pl: 'Niekomercyjna aplikacja do planowania posiłków: kalkulator zapotrzebowania, przepisy z wartościami odżywczymi i alergenami, spiżarnia i listy zakupów. Działa produkcyjnie i jest stale rozwijana.',
    en: 'A non-commercial meal-planning app: calorie and macro calculator, recipes with nutrition and allergen data, pantry and shopping lists. Live in production and under active development.',
  },
  technologies: [
    'angular',
    'typescript',
    'angular-material',
    'nestjs',
    'prisma',
    'postgresql',
    'claude-api',
    'docker',
    'playwright',
    'ci-cd',
  ],
  highlight: {
    title: { pl: 'Import przepisów ze zdjęć z AI', en: 'AI-powered recipe import from photos' },
    text: {
      pl: 'Zamiana zdjęć przepisów w edytowalne szkice z automatycznym dopasowaniem składników i oznaczaniem danych wymagających weryfikacji.',
      en: 'Turn recipe photos into editable drafts with automatic ingredient matching and clear flags for entries requiring review.',
    },
  },
  githubUrl: 'https://github.com/PatrykOzogIT/Cookivo',
  appUrl: 'https://cookivo.pl',
  coverImage: {
    src: 'projects/cookivo/home-dark.png',
    width: 1920,
    height: 1200,
    alt: {
      pl: 'Strona główna Cookivo w ciemnym motywie: hasło „Jedz smacznie i zgodnie z celem” i wykres makroskładników',
      en: 'Cookivo home page in the dark theme: the headline and a macronutrient chart',
    },
  },
  images: [
    {
      src: 'projects/cookivo/home.png',
      width: 1920,
      height: 1200,
      alt: {
        pl: 'Strona główna Cookivo w jasnym motywie',
        en: 'Cookivo home page in the light theme',
      },
      caption: {
        pl: 'Strona główna — jasny motyw (motyw podąża za ustawieniem systemu)',
        en: 'Home page — light theme (the theme follows the system setting)',
      },
    },
    {
      src: 'projects/cookivo/calculator.png',
      width: 1920,
      height: 1200,
      alt: {
        pl: 'Kalkulator zapotrzebowania: formularz z płcią, datą urodzenia, wzrostem, wagą, aktywnością i celem oraz wynik 2710 kcal z podziałem na makroskładniki',
        en: 'Needs calculator: a form with sex, date of birth, height, weight, activity and goal, and a result of 2710 kcal split into macronutrients',
      },
      caption: {
        pl: 'Kalkulator zapotrzebowania (wzór Mifflina-St Jeora) — liczy w przeglądarce, bez logowania',
        en: 'Needs calculator (Mifflin-St Jeor equation) — runs in the browser, no account needed',
      },
    },
    {
      src: 'projects/cookivo/ingredients.png',
      width: 1920,
      height: 1200,
      alt: {
        pl: 'Katalog składników: filtry kategorii, wyszukiwarka i karty z kaloriami, białkiem, tłuszczami i węglowodanami na 100 g',
        en: 'Ingredient catalogue: category filters, search and cards with calories, protein, fat and carbohydrates per 100 g',
      },
      caption: {
        pl: 'Katalog składników — wartości odżywcze na 100 g, alergeny i przeliczniki kuchenne',
        en: 'Ingredient catalogue — nutrition per 100 g, allergens and kitchen unit conversions',
      },
    },
    {
      src: 'projects/cookivo/mobile.png',
      width: 780,
      height: 1688,
      alt: {
        pl: 'Strona główna Cookivo na telefonie z dolnym paskiem nawigacji',
        en: 'Cookivo home page on a phone with the bottom navigation bar',
      },
      caption: {
        pl: 'Widok na telefonie — interfejs projektowany od wersji mobilnej',
        en: 'Phone view — the interface is designed mobile-first',
      },
    },
  ],
};
