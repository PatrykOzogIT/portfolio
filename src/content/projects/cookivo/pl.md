# about

**Cookivo** to mój niekomercyjny projekt po godzinach: full-stackowa aplikacja do planowania posiłków, zarządzania przepisami, zakupami i zapasami gospodarstwa domowego. Liczy dzienne zapotrzebowanie, planuje posiłki, uwzględnia alergie i zawartość lodówki, a na koniec układa listę zakupów.

Dziesięć funkcji opartych na modelach językowych (LLM) odczytuje przepisy, paragony i etykiety ze zdjęć, układa plany posiłków i harmonogram gotowania — zawsze jako szkic, który zatwierdza użytkownik.

Aplikacja działa produkcyjnie pod adresem [cookivo.pl](https://cookivo.pl) i **jest stale rozwijana**. Bez logowania można przejrzeć przepisy publiczne, katalog składników i kalkulator zapotrzebowania. Pozostałe funkcje wymagają konta.

# problem

Planowanie posiłków zwykle rozkłada się na kilka narzędzi: kalkulator kalorii, notatki z przepisami, osobną listę zakupów i pamięć o tym, kto w domu czego nie może jeść. Cookivo łączy to w jeden przepływ:

1. **Cel**, czyli zapotrzebowanie wyliczone ze sprawdzonego wzoru.
2. **Przepisy** z automatycznie liczonymi wartościami odżywczymi i alergenami.
3. **Plan tygodnia** z porcjami dla domowników.
4. **Lista zakupów**, pomniejszona o to, co już jest w lodówce.

Wartości odżywcze nie są wpisywane ręcznie. Wynikają ze składników przepisu, więc zmiana składnika lub gramatury od razu zmienia kalorie, makroskładniki i listę alergenów.

# features

## Planowanie, przepisy i zakupy

- **Kalkulator zapotrzebowania**:
  - wzór Mifflina-St Jeora;
  - współczynnik aktywności od 1,2 do 1,9;
  - cel: redukcja, łagodna redukcja, utrzymanie albo masa;
  - podział na makroskładniki.
- **Przepisy**:
  - prywatne, publiczne, dla gospodarstwa domowego albo dla wybranych grup znajomych;
  - podprzepisy, np. sos użyty w kilku daniach;
  - wartości odżywcze i alergeny liczone ze składników;
  - tryb gotowania krok po kroku;
  - zdjęcia.
- **Katalog składników**: ponad 580 pozycji z baz USDA i Ciqual, z wartościami na 100 g, 14 alergenami UE i przelicznikami jednostek kuchennych; nowe składniki są nadal dodawane.
- **Planer tygodniowy**: gotowanie na kilka dni naprzód i porcje dopasowane do każdego domownika.
- **Gospodarstwo domowe**: zaproszenia do wspólnego planowania i alergie domowników brane pod uwagę przy propozycjach.
- **Grupy znajomych**: dołączanie do grupy po akceptacji jej właściciela i udostępnianie przepisów wybranym grupom.
- **Lodówka (zapasy)** z datami ważności.
- **Listy zakupów** z planu albo z pojedynczego przepisu, z odjęciem zapasów z lodówki; uzupełnianie o produkty kupowane regularnie, liczone z historii zakupów.
- **Cenniki** z historią cen i szacowanie kosztu porcji, przepisu i planu.
- **Społeczność**: oceny i warianty przepisów, zgłoszenia treści i kolejka moderacji.
- **Panel administracyjny**: role (gość, użytkownik, administrator, superadministrator) i blokady kont.
- **Prywatność (RODO)**: eksport danych i usunięcie konta.
- **Interfejs**:
  - polski i angielski;
  - 6 motywów kolorystycznych, w tym wysoki kontrast;
  - projektowany od wersji mobilnej, z dolną nawigacją na telefonie.

## Funkcje AI (LLM)

- **Import przepisów ze zdjęć** — 1–3 zdjęcia z książki, odręcznej notatki lub zrzutu ekranu zamieniane w edytowalny szkic.
- **Paragony do lodówki i cennika** — pozycje z paragonu trafiają do zapasów, cennika i historii cen po zatwierdzeniu.
- **Składnik ze zdjęcia etykiety** — wartości odżywcze i alergeny przeliczone na 100 g, z ostrzeżeniem o możliwym duplikacie.
- **Asystent** — prośba zwykłym językiem kierowana do właściwego zadania; tematy spoza aplikacji są odrzucane.
- **Planer z preferencjami i budżetem** — plan na 1–7 dni z przepisów użytkownika, z gotowaniem partiami i kosztem porcji.
- **Przepisy z lodówki** — do 5 propozycji, najpierw z produktów z kończącym się terminem.
- **Warianty przepisów** — np. wegańska, bez glutenu, lżejsza, z opisem każdej zmiany.
- **Dyktowanie listy zakupów** — mowa lub wklejony tekst zamieniane w pozycje listy.
- **Zamiennik „Nie mam”** — 1–3 zamienniki w trakcie gotowania, z uwzględnieniem lodówki i unikanych alergenów.
- **Harmonogram gotowania kilku dań** — jedna kolejność kroków dla kilku przepisów naraz.

# architecture

## Frontend

Angular 22 w nowoczesnym modelu:

- komponenty standalone;
- sygnały;
- tryb zoneless.

Interfejs zbudowany jest na Angular Material 3 z własnym motywem. Tłumaczenia PL/EN obsługuje Transloco.

## Backend

NestJS z podziałem na moduły domenowe, m.in. przepisy, składniki, planer, lodówka, zakupy, ceny, paragony, etykiety, asystent, gospodarstwo domowe, grupy, moderacja i konta. Dostęp do danych zapewnia Prisma, a baza to PostgreSQL. Schemat ewoluuje przez wersjonowane migracje.

## Architektura funkcji AI

Wszystkie funkcje AI korzystają z jednej warstwy integracji z Claude API, a model jest używany tam, gdzie wnosi wartość: przy interpretacji zdjęć, tekstu i preferencji. To nie jest agent — każde zadanie to jedno wywołanie modelu, a resztę wykonuje deterministyczny kod aplikacji.

- **Structured outputs + Zod** — każda odpowiedź ma wymuszony schemat; nie ma swobodnego parsowania tekstu.
- **Rozdzielenie AI i logiki biznesowej** — model interpretuje dane i wybiera, a backend liczy ceny, wartości odżywcze, godziny harmonogramu i listy zakupów oraz zapisuje wynik.
- **Kontrola halucynacji** — model wybiera istniejące kody przepisów, kroków i jednostek, a serwer odrzuca nieznane; czego nie odczytano, zostaje puste, nie zgadnięte.
- **Human-in-the-loop** — wyniki trafiają do edytowalnych szkiców; plan, zakupy, paragon i przepis zapisuje użytkownik.
- **Koszty** — Haiku do odczytu i wyboru, Sonnet do wariantów i harmonogramu, prompt caching stałego kontekstu, zmniejszanie zdjęć (sharp), limity dzienne i miesięczne oraz rejestr tokenów.
- **Pamięć powiązań z paragonów** — zatwierdzone przez użytkowników dopasowania pozycji są zapamiętywane, więc te same produkty nie wymagają ponownego rozpoznawania.
- **Bezpieczeństwo** — tekst użytkownika i ze zdjęć jest traktowany wyłącznie jako dane, z ochroną przed prompt injection.
- **Prywatność i testy** — zdjęcia bez metadanych i bez przechowywania; cel kcal i alergeny trafiają do modelu tylko za zgodą zdrowotną; testy jednostkowe, integracyjne i E2E bez płatnych wywołań modelu.

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

## Harmonogram gotowania kilku dań

Gotowanie kilku dań naraz to problem kolejności: co zacząć najpierw, co zrobić, gdy coś się piecze. Model (Sonnet) proponuje kolejność kroków wszystkich dań i czasy pracy, ale **godziny wylicza serwer**, pilnując zasad, których model mógłby nie dotrzymać:

- jedna osoba robi rękami jedną rzecz naraz;
- kolejny krok dania zaczyna się dopiero po czasie „w tle” poprzedniego (pieczenie, duszenie);
- kolejność kroków w każdym daniu zawsze jak w przepisie.

## Paragon: od zdjęcia do cennika

Model odczytuje pozycje paragonu, ale kwoty liczy kod: z każdej pozycji powstaje „N opakowań × wielkość opakowania po cenie”, w groszach. Niezgodność ilości, ceny i wartości, brak ceny albo wielkości opakowania są oznaczane do sprawdzenia. Pozycje są dopasowywane do bazy składników z pomocą pamięci powiązań, a zatwierdzenie zapisuje w jednej transakcji lodówkę, cennik i historię cen.

## Baza danych za zablokowanym portem

Hosting blokuje połączenia wychodzące na port 5432, więc API nie może połączyć się z PostgreSQL w zwykły sposób.

Rozwiązanie:

- na produkcji Prisma korzysta z adaptera Neon, który łączy się z bazą przez WebSocket na porcie 443;
- lokalnie i w testach działa zwykłe połączenie TCP;
- sterownik wybiera zmienna środowiskowa, więc kod aplikacji jest wspólny.

## Dane odżywcze zgodne z etykietą UE

Wartości odżywcze składników pochodzą z dwóch publicznych baz: amerykańskiej USDA FoodData Central i francuskiej ANSES Ciqual. Każda ma własne narzędzie importu, a wynik musi być zgodny ze standardem etykiety UE:

- **USDA** stosuje amerykański standard, więc import przelicza dane: węglowodany bez błonnika, sól wyliczona z sodu;
- **Ciqual** podaje wartości już w standardzie UE, ale ma wartości nieliczbowe (np. „ślady”, „poniżej progu”), które import zamienia według stałych reguł, a brak danych zostawia jako brak, nigdy jako zero.

Do tego dochodzą polskie nazwy, kategorie, alergeny i typowe gramatury, np. sztuki czy łyżki. Źródło jest zapisane przy każdym składniku, a katalog jest rozbudowywany kolejnymi paczkami.

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
