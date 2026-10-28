import type { ProjectMeta } from '../../model';

export const project: ProjectMeta = {
  slug: 'cookivo',
  order: 2,
  published: true,
  kind: 'personal',
  isLive: true,
  developmentStatus: 'in-development',
  title: { pl: 'Cookivo', en: 'Cookivo' },
  shortDescription: {
    pl: 'Full-stackowa aplikacja do planowania posiłków, przepisów, zakupów i zapasów domowych — z funkcjami opartymi na LLM, od odczytu paragonów po harmonogram gotowania. Niekomercyjna, działa produkcyjnie i jest stale rozwijana.',
    en: 'A full-stack app for planning meals, recipes, shopping and household stock — with LLM-powered features, from reading receipts to scheduling cooking. Non-commercial, live in production and under active development.',
  },
  technologies: [
    'angular',
    'typescript',
    'angular-material',
    'nestjs',
    'prisma',
    'postgresql',
    'claude-api',
    'zod',
    'playwright',
    'ci-cd',
  ],
  highlight: {
    title: {
      pl: '10 funkcji AI (LLM) w produkcji',
      en: '10 AI (LLM) features in production',
    },
    text: {
      pl: 'Odczyt przepisów, paragonów i etykiet, planer z budżetem, harmonogram gotowania — model interpretuje dane, a obliczenia i zapis zostają po stronie backendu.',
      en: 'Reading recipes, receipts and labels, a budget-aware planner and a cooking schedule — the model interprets the data, while calculations and saving stay in the backend.',
    },
  },
  githubUrl: 'https://github.com/PatrykOzogIT/Cookivo',
  appUrl: 'https://cookivo.pl',
  coverImage: {
    src: 'projects/cookivo/cover.png',
    width: 1920,
    height: 1200,
    alt: {
      pl: 'Strona główna Cookivo w ciemnym motywie: hasło „Jedz smacznie i zgodnie z celem” i panel 11 modułów aplikacji z podglądem kalkulatora kalorii',
      en: 'Cookivo home page in a dark theme: the headline and a panel of 11 app modules with a calorie calculator preview',
    },
  },
  images: [
    {
      src: 'projects/cookivo/features.png',
      width: 1653,
      height: 1489,
      alt: {
        pl: 'Siatka „Możliwości Cookivo”: 11 kart funkcji, m.in. przepisy, baza składników, plan tygodnia, lista zakupów, lodówka, koszty, paragony i asystent',
        en: 'The “Cookivo features” grid: 11 feature cards, including recipes, the ingredient database, a weekly plan, shopping list, fridge, costs, receipts and the assistant',
      },
      caption: {
        pl: 'Możliwości aplikacji ze strony głównej — od przepisów po funkcje AI',
        en: 'App features on the home page — from recipes to AI features',
      },
    },
    {
      src: 'projects/cookivo/assistant.png',
      width: 816,
      height: 912,
      alt: {
        pl: 'Prezentacja asystenta AI: przykładowa prośba „Śniadania lekkie do pracy, obiady sycące, kolacje na słodko” i propozycja planu',
        en: 'AI assistant presentation: a sample request for light breakfasts, filling lunches and sweet suppers, and a proposed plan',
      },
      caption: {
        pl: 'Asystent AI — przykład z prezentacji funkcji na stronie głównej',
        en: 'AI assistant — an example from the feature presentation on the home page',
      },
    },
    {
      src: 'projects/cookivo/receipts.png',
      width: 816,
      height: 944,
      alt: {
        pl: 'Prezentacja importu paragonu: przykładowe pozycje z ilościami i cenami do dodania do lodówki i cennika',
        en: 'Receipt import presentation: sample items with quantities and prices to add to the fridge and price list',
      },
      caption: {
        pl: 'Import paragonu ze zdjęcia — przykład z prezentacji funkcji na stronie głównej',
        en: 'Receipt import from a photo — an example from the feature presentation on the home page',
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
        pl: 'Katalog składników z baz USDA i Ciqual — wartości na 100 g, alergeny i przeliczniki kuchenne',
        en: 'Ingredient catalogue from the USDA and Ciqual databases — values per 100 g, allergens and kitchen unit conversions',
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
