# about

**Od zgłoszenia w Linear do zintegrowanej zmiany:** wyspecjalizowani agenci AI wykonują pracę, system ją weryfikuje, a człowiek podejmuje kluczowe decyzje.

AI Dev Team to moja autorska platforma do orkiestracji agentów AI w procesie wytwarzania oprogramowania — od zadania w Linear, przez analizę, plan, implementację, kontrolę jakości i review, po pull request i scalenie. Nie jest wrapperem na LLM ani chatbotem: model wykonuje kroki, a przejściami, kontrolami, operacjami Git i decyzjami steruje deterministyczny kod orkiestratora i człowiek.

To prywatny projekt — do portfolio i nauki projektowania systemów agentowych. Nie jest wdrożony w firmie ani oferowany jako usługa i nadal jest rozwijany.

**Praktyczna weryfikacja.** System został zweryfikowany w kompletnych scenariuszach realizacji zadań programistycznych — od analizy zgłoszenia, przez planowanie, implementację i kontrolę jakości, aż po integrację oraz wdrożenie zmian. Wnioski z tych przebiegów zostały wprowadzone do systemu, m.in. porównanie nieudanych kontroli z bazą i ponowna weryfikacja bez ponownego uruchamiania agenta. Do tego 115 testów jednostkowych, 71 testów end-to-end oraz tryb demonstracyjny z fikcyjnymi danymi, z którego pochodzą wszystkie zrzuty ekranu.

**Ograniczenia:** aplikacja lokalna (Windows), jeden użytkownik i jeden aktywny projekt; kontrole uruchamiane na całym repozytorium; wyniki Badań są opisowe.

# problem

Agenci AI potrafią napisać kod, ale w realnym procesie wytwarzania oprogramowania liczy się więcej: zrozumienie zadania, zgodność z architekturą, sprawdzone testy, bezpieczne operacje na repozytorium zespołu i kontrola nad tym, co trafia na produkcję. Pojedyncza sesja z modelem nie daje ani powtarzalności, ani audytu, ani pomiaru jakości.

AI Dev Team rozkłada pracę nad zadaniem na wyspecjalizowane role i otacza je deterministycznym procesem:

- **Analityk** ocenia zgłoszenie, zadaje najwyżej kilka konkretnych pytań i ocenia złożoność.
- **Architekt** analizuje kod (tylko odczyt) i przygotowuje plan z ryzykami, zmianami bazy, testami i założeniami do potwierdzenia.
- **Programista** implementuje plan w izolowanej kopii roboczej i zgłasza blokadę zamiast zgadywać.
- **Recenzent** w świeżej sesji niezależnie ocenia zmianę.

Agenci nie rozmawiają ze sobą — orkiestrator przekazuje między nimi ustrukturyzowane wyniki, walidowane w kodzie.

# features

- **4 agentów** (Analityk, Architekt, Programista, Recenzent) zarządzanych przez orkiestrator z kolejką i kontrolą współbieżności.
- **Human-in-the-loop:** akceptacja planu, kodu i scalenia — każda przypięta do dokładnej wersji.
- **Bezpieczna warstwa Git**, izolowane worktree i bramki jakości uruchamiane przez system.
- **Badania skuteczności agentów** i wersjonowane reguły AI.
- **Odpowiedzialne zarządzanie** limitami AI i doborem modeli.

# architecture

## Architektura

![Diagram architektury: panel Angular, orkiestrator NestJS z maszyną stanów, schedulerem, bramkami jakości, SafeGit i Badaniami, baza MySQL, agenci jako osobne procesy Claude Code CLI z hookiem PreToolUse, izolowane worktree, Linear i GitHub](projects/ai-dev-team/diagram-architecture.pl.png "Architektura: jedna lokalna aplikacja — orkiestrator, panel, baza i agenci jako osobne procesy")

- **NestJS jako orkiestrator:** maszyna stanów, scheduler, integracje; **Angular** jako panel z aktualizacjami na żywo (SSE); **MySQL** jako stan, kolejka i dziennik audytu — bez dodatkowej infrastruktury.
- **Kolejka** z priorytetami i idempotencją, 1–4 sloty agentów zmieniane na żywo, blokady zasobów brane atomowo, odzyskiwanie przerwanych kroków po restarcie.
- **Integracje:** Linear (synchronizacja, statusy z wykrywaniem konfliktów), Git i GitHub (worktree, PR, merge), Claude Code CLI (agenci jako osobne procesy z wynikiem w JSON Schema).

## Workflow z trzema akceptacjami

![Diagram workflow: zadanie w Linear, ocena Analityka, plan Architekta, Akceptacja 1, implementacja w worktree, kontrole i recenzja, Akceptacja 2, commit i PR, Akceptacja 3, scalenie](projects/ai-dev-team/diagram-workflow.pl.png "Workflow zadania: trzy akceptacje człowieka, każda przypięta do dokładnej wersji")

Zadanie z Linear → ocena Analityka → pytania albo plan z założeniami → plan Architekta w trybie ręcznym lub automatycznym → **Akceptacja 1** → implementacja w worktree → kontrole systemu, bramki i recenzja → **Akceptacja 2** → commit dokładnie zaakceptowanej wersji, PR, sprawdzenie z aktualnym branchem docelowym → **Akceptacja 3** → scalenie i aktualizacja statusu w Linear. Każde zadanie ma pełną historię: przebiegi agentów, decyzje, zużycie zasobów.

![Lista zadań z Linear w różnych etapach: plany do akceptacji i zadanie zablokowane](projects/ai-dev-team/02-tasks-and-workflow.png "Zadania z Linear prowadzone przez jawną maszynę stanów")

![Plan Architekta z założeniami do potwierdzenia i panelem Akceptacji 1 ze skrótem planu](projects/ai-dev-team/04-implementation-plan.png "Plan Architekta z założeniami do potwierdzenia — akceptacja przypięta do skrótu planu")

## Human-in-the-loop i bezpieczeństwo

Model może źle zrozumieć zadanie, zadeklarować testy, których nie uruchomił, albo wyjść poza zakres. Dlatego nie wszystkie decyzje należą do niego:

- trzy akceptacje są przypięte do dokładnej wersji (skrót planu, git tree SHA kodu, stan brancha docelowego) — każda zmiana unieważnia akceptację,
- agenci nie mają dostępu do commit ani push; operacje Git wykonuje warstwa z listą dozwolonych poleceń, bez force push i bez zapisu do brancha docelowego,
- każde zadanie pracuje w izolowanym worktree, a polityka narzędzi agentów jest wymuszana hookiem typu fail-closed,
- przed scaleniem system sprawdza wynik scalenia z aktualnym branchem docelowym i ostrzega o wdrożeniu produkcyjnym,
- błędy i blokady kończą się decyzją człowieka (ponów, zweryfikuj ponownie, wróć do planu), a przerwane kroki wracają do kolejki po restarcie.

![Kolejka decyzji człowieka: blokada, scalenie i plany do przejrzenia](projects/ai-dev-team/06-approvals-queue.png "Wszystkie decyzje człowieka w jednej kolejce")

![Akceptacja kodu w wersji 2 po recenzji, przypięta do git tree SHA](projects/ai-dev-team/09-code-approval.png "Akceptacja kodu przypięta do git tree SHA, po iteracji poprawek")

![Akceptacja scalenia: branch, PR, sprawdzenie przed scaleniem i ostrzeżenie o wdrożeniu produkcyjnym](projects/ai-dev-team/10-merge-approval.png "Akceptacja scalenia po sprawdzeniu z aktualnym branchem docelowym")

## Kontrola jakości

Lint, formatowanie, typy, testy i build uruchamia system — nie model. Nieudana kontrola jest powtarzana na czystej kopii bazy, żeby odróżnić błąd wprowadzony przez zmianę od długu repozytorium. Bramki w kodzie wykrywają m.in. sekrety, zmiany poza planem, zmiany schematu bazy bez skryptu SQL i zmiany w obszarach wrażliwych. Recenzent oznacza, czego nie mógł sprawdzić, a jego twierdzenia bez potwierdzenia w kontrolach są oznaczane jako niezweryfikowane.

![Kontrole uruchomione przez system z porównaniem do bazy i wyniki bramek jakości](projects/ai-dev-team/07-checks-and-quality-gates.png "Kontrole uruchamiane przez system, z porównaniem do bazy, i bramki jakości")

# research

System mierzy, na ile agenci radzą sobie bez pomocy człowieka — wyłącznie z zapisanej historii, bez dodatkowych wywołań AI.

- **Interwencja człowieka** to odrzucenie planu lub kodu z uwagami albo blokada wynikająca z pracy agenta (także ręczna poprawka kodu). Blokady techniczne i zmiany po stronie zespołu są liczone osobno i nie obciążają oceny agentów.
- **Wskaźniki:** samodzielność (kod zaakceptowany bez korekt), plan i kod przyjęte w pierwszej wersji, odsetek zadań niezrozumiałych, zadania wymagające odpowiedzi człowieka, średnia liczba poprawek, automatycznych poprawek i próśb Recenzenta, czas do akceptacji kodu, zużycie tokenów.
- **Klasyfikacja korekt:** każde odrzucenie ma kategorię (np. błędne zrozumienie, zakres, podejście, błąd, testy, bezpieczeństwo, wydajność) — widać, czego najczęściej dotyczą poprawki.
- **Analiza w czasie:** wykresy tygodniowe lub miesięczne ze znacznikami zmian instrukcji ról, reguł AI i modeli oraz wyniki w podziale na wersje instrukcji każdej roli.
- **Uczciwie o ograniczeniach:** wskaźniki są opisowe; przy małej liczbie zadań nie potwierdzają statystycznie poprawy, a trudność zadań się różni. System nie zmienia instrukcji ani reguł sam — wnioski wprowadza człowiek.

![Pętla doskonalenia: praca agentów, interwencje człowieka, Badania, decyzja człowieka, znacznik zmiany na wykresach](projects/ai-dev-team/diagram-loop.pl.png "Pętla doskonalenia agentów — każdą zmianę wprowadza człowiek")

![Ekran Badań: kafle wskaźników samodzielności i wykres „Jakość w czasie”](projects/ai-dev-team/14-research-autonomy.png "Ekran Badań w trybie demo — dane fikcyjne z jednego dnia; widoczne wartości nie są wynikami")

# challenges

## Reguły AI i ciągłe doskonalenie

Reguły mają zakres (globalne lub projektu), kategorię, ważność i sposób egzekwowania — jako instrukcja dla agentów, bramka w kodzie albo oba. Każda zmiana to nowa wersja z możliwością przywrócenia, a podgląd pokazuje dokładnie ten tekst, który trafia do agentów. Instrukcje ról są wersjonowane, a Architekt proponuje fakty o repozytorium, które po zatwierdzeniu trafiają do kolejnych zadań.

Pętla: korekty z kategorią → analiza w Badaniach → nowa reguła lub wersja instrukcji → porównanie wyników po zmianie. Cel: rosnący odsetek pracy samodzielnej agentów — mierzony, nie deklarowany.

![Lista reguł AI z ważnością, zakresem, sposobem egzekwowania i wersjami](projects/ai-dev-team/13-ai-rules.png "Wersjonowane reguły AI: instrukcje dla agentów i bramki w kodzie")

## Odpowiedzialne zarządzanie zasobami AI

![Diagram zarządzania limitami: odczyt wykorzystania, próg, pauza, sonda limitu, automatyczne wznowienie, kolejka i dobór modelu](projects/ai-dev-team/diagram-limits.pl.png "Zarządzanie limitami i zasobami AI")

- Monitorowanie wykorzystania limitów (okno 5-godzinne i tygodniowe) przy każdym przebiegu; konfigurowalne progi pauzy i opcjonalne automatyczne wznowienie.
- Kolejka z priorytetami i ograniczona równoległość (domyślnie jeden agent).
- Dobór modelu do złożoności zadania: mocniejszy model dla zadań złożonych i po odrzuceniu planu z powodu analizy, szybszy dla prostych.
- Brak zbędnych wywołań: bez ponownej oceny niezmienionych zadań, ponowna weryfikacja bez ponownego uruchamiania agenta, analizy i kontrole bez AI.
- Zużycie tokenów per etap i zadanie oraz bezpiecznik zatrzymujący pracę przy nieoczekiwanym źródle rozliczeń.

![Scheduler z paskami wykorzystania okna 5 h i tygodnia, aktywnymi agentami i kolejką](projects/ai-dev-team/18-scheduler-limits-and-queue.png "Scheduler z monitorowaniem limitów i kolejką")

# role

Odpowiadam za koncepcję produktu, architekturę systemu, projekt workflow z trzema akceptacjami i podział odpowiedzialności agentów, mechanizmy bezpieczeństwa (akceptacje przypięte do wersji, warstwa Git, polityka narzędzi) i kontroli jakości, projekt integracji (Linear, Git/GitHub, Claude Code), decyzje technologiczne, projekt badań skuteczności agentów i optymalizację zasobów.

Kieruję rozwojem i weryfikuję implementację: akceptuję etapy, prowadzę przebiegi na rzeczywistych zadaniach, porównuję wyniki i przekładam wnioski na nowe funkcje i reguły. Implementacja (kod, testy, skrypty) powstała z wykorzystaniem AI jako narzędzia wspierającego — pod moim kierunkiem i z moją weryfikacją.

**Technologie:** Angular 22 · Angular Material · NestJS 12 · TypeScript · Node.js · MySQL 8 · TypeORM · Server-Sent Events · Claude Code CLI · Linear GraphQL · Git (worktree) · GitHub CLI · Vitest · PowerShell
