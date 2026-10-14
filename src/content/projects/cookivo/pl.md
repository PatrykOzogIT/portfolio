# about

**Cookivo** to mój niekomercyjny projekt po godzinach: aplikacja, która liczy dzienne zapotrzebowanie, planuje posiłki na cały tydzień, uwzględnia alergie i zawartość spiżarni, a na koniec układa listę zakupów.

Aplikacja działa produkcyjnie pod adresem [cookivo.pl](https://cookivo.pl) i **jest stale rozwijana**. Bez logowania można przejrzeć katalog składników i skorzystać z kalkulatora zapotrzebowania. Pozostałe funkcje wymagają konta.

# problem

Planowanie posiłków zwykle rozkłada się na kilka narzędzi: kalkulator kalorii, notatki z przepisami, osobną listę zakupów i pamięć o tym, kto w domu czego nie może jeść. Cookivo łączy to w jeden przepływ:

1. **Cel**, czyli zapotrzebowanie wyliczone ze sprawdzonego wzoru.
2. **Przepisy** z automatycznie liczonymi wartościami odżywczymi i alergenami.
3. **Plan tygodnia** z porcjami dla domowników.
4. **Lista zakupów**, pomniejszona o to, co już jest w spiżarni.

Wartości odżywcze nie są wpisywane ręcznie. Wynikają ze składników przepisu, więc zmiana składnika lub gramatury od razu zmienia kalorie, makroskładniki i listę alergenów.

# features

- **Kalkulator zapotrzebowania**:
  - wzór Mifflina-St Jeora;
  - współczynnik aktywności od 1,2 do 1,9;
  - cel: redukcja, łagodna redukcja, utrzymanie albo masa;
  - podział na makroskładniki.
- **Przepisy**:
  - publiczne lub prywatne;
  - podprzepisy, np. sos użyty w kilku daniach;
  - wartości odżywcze i alergeny liczone ze składników;
  - tryb gotowania krok po kroku;
  - zdjęcia.
- **Katalog składników**: około 350 pozycji z wartościami na 100 g, 14 alergenami UE i przelicznikami jednostek kuchennych.
- **Planer tygodniowy**: gotowanie na kilka dni naprzód i porcje dopasowane do każdego domownika.
- **Gospodarstwo domowe**: zaproszenia do wspólnego planowania i alergie domowników brane pod uwagę przy propozycjach.
- **Spiżarnia** z datami ważności.
- **Listy zakupów** z planu albo z pojedynczego przepisu, z odjęciem zapasów ze spiżarni.
- **Cenniki** i szacowanie kosztu zakupów.
- **Społeczność**: oceny i warianty przepisów, zgłoszenia treści i kolejka moderacji.
- **Panel administracyjny**: role (gość, użytkownik, administrator, superadministrator) i blokady kont.
- **Prywatność (RODO)**: eksport danych i usunięcie konta.
- **Interfejs**:
  - polski i angielski;
  - jasny i ciemny motyw;
  - projektowany od wersji mobilnej, z dolną nawigacją na telefonie.

# architecture

## Frontend

Angular 22 w nowoczesnym modelu:

- komponenty standalone;
- sygnały;
- tryb zoneless.

Interfejs zbudowany jest na Angular Material 3 z własnym motywem. Tłumaczenia PL/EN obsługuje Transloco.

## Backend

NestJS z podziałem na moduły domenowe, m.in. przepisy, składniki, planer, spiżarnia, zakupy, ceny, gospodarstwo domowe, moderacja i konta. Dostęp do danych zapewnia Prisma, a baza to PostgreSQL. Schemat ewoluuje przez wersjonowane migracje.

## Środowiska

- **Lokalnie** Docker Compose uruchamia PostgreSQL i Mailpit do testowania wiadomości e-mail.
- **Na produkcji**:
  - API działa jako aplikacja Node.js pod `/api` na hostingu współdzielonym;
  - frontend to statyczne pliki;
  - baza to zarządzany PostgreSQL w Neon (region Frankfurt).

## Jakość i wdrożenie

- **Testy**:
  - jednostkowe w Vitest;
  - end-to-end w Playwright z automatycznym audytem dostępności axe-core (WCAG AA).
- **Pipeline w GitHub Actions**:
  1. uruchamia migracje bazy;
  2. wysyła pliki przez FTPS;
  3. restartuje aplikację Node.js;
  4. na koniec sprawdza, czy wdrożona wersja odpowiada (smoke test).

# challenges

## Baza danych za zablokowanym portem

Hosting blokuje połączenia wychodzące na port 5432, więc API nie może połączyć się z PostgreSQL w zwykły sposób.

Rozwiązanie:

- na produkcji Prisma korzysta z adaptera Neon, który łączy się z bazą przez WebSocket na porcie 443;
- lokalnie i w testach działa zwykłe połączenie TCP;
- sterownik wybiera zmienna środowiskowa, więc kod aplikacji jest wspólny.

## Dane odżywcze zgodne z etykietą UE

Wartości odżywcze składników pochodzą z publicznej bazy USDA FoodData Central. Amerykański standard różni się od europejskiego, dlatego własne narzędzie importu przelicza dane na standard etykiety UE:

- węglowodany bez błonnika;
- sól wyliczona z sodu.

Do tego dochodzą polskie nazwy, kategorie, alergeny i typowe gramatury, np. sztuki czy łyżki.

## Przepisy złożone z przepisów

Przepis może zawierać inne przepisy, więc liczenie wartości odżywczych i alergenów jest rekurencyjne. Backend:

- wykrywa cykle, czyli przepis, który pośrednio zawiera sam siebie;
- ogranicza głębokość zagnieżdżenia;
- przelicza jednostki kuchenne i objętość na gramy.

## Bezpieczeństwo kont

- **Tokeny**:
  - krótko żyjący token dostępu (15 minut);
  - rotowany refresh token w ciasteczku `httpOnly`;
  - wykrywanie ponownego użycia starego refresh tokenu.
- **Ochrona logowania**: czasowa blokada konta po 5 nieudanych próbach.
- **Polityka haseł**:
  - ocena siły hasła;
  - sprawdzenie w bazie wycieków Have I Been Pwned metodą k-anonimowości (hasło nie opuszcza serwera).
- **Prywatność zdjęć**: przesłane zdjęcia są przetwarzane do WebP w trzech rozmiarach, bez metadanych (w tym lokalizacji GPS).
