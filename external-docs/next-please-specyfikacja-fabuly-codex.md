# Next, Please! - specyfikacja fabuły do implementacji w Codexie

**Wersja:** 1.1 - harmonogram 26 dni roboczych  
**Data opracowania:** 31 października 2026  
**Materiał wyjściowy:** notatki autora z pliku „fabuła(6).txt”.  
**Sprawdzony projekt:** /Users/user/myfiles/projects/next-please/  
**Punkt odniesienia:** wersja gry 0.8.9, commit 30d8350.  
**Zakres:** 10 powiązanych z codzienną pracą wątków, pierwsze 26 dni roboczych gry, z weekendami pomiędzy zmianami, ukryta punktacja, publikacje, dokumenty, ilustracje oraz 6 nowych zakończeń fabularnych.

Ten dokument jest kompletnym materiałem wykonawczym. Nie opisuje funkcji już wdrożonych, chyba że wyraźnie oznaczono je jako istniejące. Nazwiska, wartości punktowe, terminy i teksty dodane poniżej stanowią propozycję do wdrożenia. Zachowano sens dziesięciu wątków z notatek; korekty konieczne do ich spójnego działania wyszczególniono osobno.

### Spis treści

1. [Polecenie dla Codexa](#1-polecenie-dla-codexa)
2. [Ustalenia nadrzędne i korekty notatek](#2-ustalenia-nadrzędne-i-korekty-notatek)
3. [Stałe postaci i nazwy](#3-stałe-postaci-i-nazwy)
4. [Ukryty system punktacji](#4-ukryty-system-punktacji)
5. [Harmonogram pierwszych 26 dni roboczych](#5-harmonogram-pierwszych-26-dni-roboczych)
6. [Dziesięć wątków](#6-wątki---szczegółowy-materiał-wykonawczy)
7. [Publikacje i kontakty z graczem](#7-publikacje-i-kontakty-z-graczem)
8. [Dokumenty i grafiki](#8-dokumenty-i-grafiki---wymagania-produkcyjne)
9. [Sześć nowych zakończeń](#9-sześć-nowych-zakończeń)
10. [Kontrakt implementacyjny](#10-kontrakt-implementacyjny)
11. [Harmonogram wykonawczy i przypadki brzegowe](#11-harmonogram-wykonawczy-i-przypadki-brzegowe)
12. [Kolejność realizacji](#12-kolejność-realizacji-w-codexie)
13. [Kryteria odbioru i trasy kontrolne](#13-kryteria-odbioru-i-trasy-kontrolne)
14. [Źródła projektu i granice ustaleń](#14-źródła-projektu-i-granice-ustaleń)

## 1. Polecenie dla Codexa

Zaimplementuj poniższą fabułę w istniejącym projekcie Next, Please!. Najpierw przeczytaj AGENTS.md, FACTS.md, docs/technical-guidelines.md, docs/art-direction.md i docs/save-format.md oraz sprawdź aktualne odpowiedniki wskazanych tutaj modułów. Stan repozytorium mógł zmienić się od wymienionego commitu.

Wykorzystaj obecny gabinet, kolejkę pacjentów, badania, pozytywne i negatywne orzeczenia, papierowe dokumenty, prasę, telefon, szuflady i sceny po pracy. Rozszerz dane, obsługę fabularnych dokumentów i deterministyczne przejścia stanu. Gracz podejmuje wiążące decyzje fabularne przez wydanie orzeczenia. Czytanie, badanie, porównywanie dokumentów i telefon dostarczają informacji.

Nie dodawaj drzewa dialogowego, osobnego wyboru frakcji, przycisku donoszenia, śledztwa poza gabinetem, zarządzania organizacją, misji terenowych ani trzeciego rodzaju orzeczenia. Telefon ma krótkie, ustalone odpowiedzi. Dołączenie gotowego wyniku badania do orzeczenia pozostaje istniejącą czynnością kancelaryjną.

Wprowadź pełne teksty i etykiety dostępności w języku polskim i angielskim. Polski materiał poniżej jest wersją redakcyjną źródłową. Angielski odpowiednik musi zachować wszystkie istotne dane, żarty i rozbieżności dokumentów. Zachowaj dotychczasowe nazwy z repozytorium, zwłaszcza „Kurier Obywatelski” / „Civic Courier”.

Każdy nowy element ilustracyjny wykonaj wbudowanym generatorem obrazów, zgodnie z kierunkiem graficznym projektu. Istniejące wygenerowane papiery i pieczęcie wykorzystuj ponownie. Osobno zachowaj źródła, prompty i skrypty przygotowania grafik. Teksty, nazwiska, daty, wyniki i poszlaki składaj z danych gry.

Realizuj pracę etapami opisanymi w rozdziale 12. Odbiór wymaga działającego zapisu i odczytu, sześciu osiągalnych nowych zakończeń, poprawnych zależności publikacji oraz czytelnych dokumentów w obu językach.

## 2. Ustalenia nadrzędne i korekty notatek

### 2.1. Świat, ton i sprawczość

- Bohater jest lekarzem medycyny pracy. Konflikt dotyczy rządzącej, nienazwanej partii komunistycznej oraz związku zawodowego Wzajemność.
- Kraj i miasto pozostają nienazwane. Gra zaczyna się 3 listopada 1983. Nie dopisuj nazw rzeczywistych miast, godła państwowego ani dokładnej historycznej identyfikacji ustroju ponad ustalenia FACTS.md.
- Obie strony próbują wykorzystać decyzje lekarza do własnych celów. Poprawne medycznie orzeczenie nie musi przynosić dobrego społecznie rezultatu.
- Gracz może konsekwentnie pomagać jednej stronie, zachować zawodową niezależność albo działać oportunistycznie. Pomoc różnym stronom w różnych sprawach sama w sobie nie jest chaosem.
- Źródłem opowieści są przede wszystkim dokumenty i publikacje. Wypowiedzi pacjentów są krótkie. Informacja niezbędna do decyzji nie może istnieć wyłącznie w przemijającym dymku.
- Zmiana decyzji po pogorszeniu zdrowia lub uzyskaniu nowego dowodu jest uzasadniona. Karę za niekonsekwencję stosuj wyłącznie do dokładnie opisanych par porównywalnych decyzji.
- Wzajemność Walcząca jest niewielkim radykalnym środowiskiem, odrębnym od zwykłych struktur Wzajemności. Nie utożsamiaj jego ultimatum ze stanowiskiem całego związku.

### 2.2. Co zostało ujednolicone

| Problem materiału źródłowego | Rozwiązanie obowiązujące w tej specyfikacji |
| --- | --- |
| Znaczenie numeru dnia | W oznacza kolejny dzień roboczy fabuły, obliczany przez workDayNumber(state.day). K oznacza dzień kalendarzowy zapisany w state.day. Rozdział obejmuje W1-W26, czyli K1-K36: od 3 listopada do 8 grudnia 1983. |
| Premiera tygodnika i badanie drukarza | Ogłoszenie w W6, badanie w W8, pierwsze przyspieszone wydanie w W9. Bez terminowej zgody pierwsze wydanie ukazuje się w W14. Kolejne numery wychodzą co siedem dni kalendarzowych, czyli co pięć dni pracy. |
| Weekendy między wydarzeniami | Weekendy pozostają w kalendarzu i ekonomii, ale nie zużywają kolejnych dni fabuły. Wszystkie wizyty i progi rozdziału określono numerem W; pełne przeliczenie na K i daty jest w rozdziale 5. |
| Badanie drukarza „po 10 dniach roboczych” | Wizyta w W18, dziesięć zmian po W8, bez wliczania pierwszej wizyty. To badanie kontrolne po krótkim okresie próbnym, a nie rutynowe badanie okresowe po zaledwie dwóch tygodniach. |
| „Dziennik Obywatelski” w sprawie korektorki | W całym wątku chodzi o redakcję „Kuriera Obywatelskiego”. |
| Ulotkę po badaniu strajkowca zostawia „gracz” | Ulotkę przynosi pacjent. Podziękowanie po zgodzie pochodzi od niego. |
| Powrót Malca niezależny od poprzedniej decyzji | Druga wizyta wymaga pierwszej zgody; finał naczelnika wymaga dwóch zgód. |
| Wyjaśnienie Lisa ujawniane dopiero po zadaniu pytania | Krótka prywatna kartka towarzyszy wynikom od początku wizyty. Dymek tylko zwraca na nią uwagę. |
| Wynik okulistyczny opisany innymi jednostkami niż silnik | Zachowaj opowieść o problemach ze wzrokiem, ale rozstrzygające wartości dopasuj do istniejącego modelu gry. Nie implementuj drugiej skali ostrości wzroku. |
| Fałszywe pismo agenta mogłoby zadziałać jak autentyczna opinia specjalisty | To sfałszowane pismo Izby, podające nieistniejący wyjątek. Nie zastępuje ważnego, indywidualnego zaświadczenia specjalisty. |
| Zdjęcie Malca w gazecie, która dotąd jest tekstowa | Dopuszczony jest jeden wyraźnie określony wyjątek: fotografia w artykule finałowym o jego awansie. |
| W notatkach brak zasad opuszczonej lub przerwanej wizyty | Brak wydanego orzeczenia nie jest zgodą ani odmową. Nie naliczaj punktów; nie publikuj skutków niewydanej decyzji. Szczegółowe zasady są w rozdziale 11. |

Wersja „Ochotnika” obowiązująca tutaj dotyczy przymusowego oddelegowania zdrowego człowieka. Nie dodawaj wcześniejszego pomysłu powrotu z urazem nadgarstka. Drugi magazynier pozostaje możliwością przyszłego rozszerzenia, poza implementacją pierwszego rozdziału.

### 2.3. Istniejące ograniczenia techniczne

| Obszar | Stan sprawdzony w kodzie | Znaczenie dla implementacji |
| --- | --- | --- |
| Architektura | Vite, TypeScript, Canvas 2D, lokalne zasoby | Całość działa statycznie, bez backendu i usług sieciowych w czasie gry. |
| Widok | 570 × 320, współrzędne całkowite, nearest-neighbor | Zachować aktualne proporcje, bitmapowy font i semantyczne kontrolki DOM. |
| Kalendarz | src/core/calendar.ts: gameDate(), isWeekend() | Weekendy są dniami kalendarzowymi, ale nie ma w nich wizyt ani porannej dostawy prasy do gabinetu. |
| Progresja | src/core/progression.ts: workDayNumber(), directiveForDay() | Audiometria i inne badania dodatkowe stają się dostępne od W7, czyli K9 (11.11.1983). |
| Ocena orzeczenia | expectedVisitDecision(), visionAssessment(), pressureAssessment() | Rozróżniać fit, unfit i discretionary. Nie nadpisywać standardowych reguł samą preferencją frakcji. |
| Pacjenci | Stałe przypadki i losowana kolejka; jedna twarz najwyżej raz w kolejce dziennej | Postaci fabularne potrzebują trwałej tożsamości i zaplanowanych wizyt. |
| Zakończenie wizyty | Gałąź return-document w src/core/game.ts | Skutki fabularne zapisuj przy skutecznym oddaniu podpisanego orzeczenia, nie przy przyłożeniu pieczątki. |
| Gazeta | nextNewspaper() przyjmuje priorityIds, ale fabuła ich jeszcze nie dostarcza | Wykorzystaj istniejący punkt wejścia; oddziel artykuły fabularne od losowego katalogu. |
| Ogłoszenia i telefon | Losowe ogłoszenia, ogólne losowe odpowiedzi | Dodaj ograniczony katalog deterministycznych kontaktów fabularnych. |
| Dokumenty | Zamknięta unia Paper i walidacja danych | Nowe pisma wymagają zmian modelu, renderowania, obsługi biurka i walidatora. |
| Prasa w szufladzie | Egzemplarze identyfikowane dotąd przez dzień | Dwa tytuły tego samego dnia wymagają dodatkowego identyfikatora publikacji. |
| Zapisy | Wersja 34, gzip JSON, pliki .npsave | Wprowadzić następną wolną wersję i migrację, bez zmiany historycznych danych. |
| Obecne finały | hospital i bankruptcy | Zachować ich działanie oraz pierwszeństwo już uruchomionych zdarzeń. |

Wskazane wartości medyczne są umownymi regułami fikcyjnej gry, zaczerpniętymi z jej kodu. Nie stanowią propozycji rzeczywistych norm medycyny pracy.

## 3. Stałe postaci i nazwy

Nazwiska Jana Sikory, Andrzeja Lisa i Henryka Malca pochodzą z notatek. Pozostałe nazwiska są proponowanymi nazwami wykonawczymi. Przed dodaniem sprawdź kolizje z istniejącym katalogiem i słownikiem lokalizacji. Jeśli nazwa już występuje w innej roli, zmień nową nazwę konsekwentnie w całym wątku.

| ID postaci | Nazwa PL | Wiek / charakter | Stałe cechy i funkcja |
| --- | --- | --- | --- |
| actor.agent | Roman Kurek | 43 lata; spokojny, bezbarwny | Ten sam człowiek, data urodzenia i twarz podczas wszystkich siedmiu wizyt. Zmienia zakłady pracy. |
| actor.strike_leader | Stefan Wolski | 44 lata; zmęczony, rzeczowy | Zwolniony przywódca strajku, szuka nowego zatrudnienia. |
| actor.printer | Jerzy Borkowski | 46 lat; małomówny fachowiec | Operator offsetowy, niewielki ubytek słuchu, nocna zmiana. |
| actor.dispatcher | Antoni Rybak | 65 lat; emerytowany specjalista | Dyspozytor ruchu elektrociepłowni, potrzebny do uruchomienia instalacji. |
| actor.sergeant | sierż. Marek Czarnecki | 39 lat; oficjalny ton | Milicjant po rekonwalescencji; mundur zgodny z istniejącym stylem gry. |
| actor.proofreader | Zofia Witek | 61 lat; powściągliwa | Wieloletnia korektorka „Kuriera Obywatelskiego”. |
| actor.volunteer | Tadeusz Kania | 48 lat; spięty | Zdrowy operator suwnicy, zmuszany do „ochotniczego” oddelegowania. |
| actor.storekeeper | Edward Król | 53 lata; rzeczowy | Magazynier i działacz Wzajemności, nawracające zawroty głowy. |
| actor.alias | Andrzej Lis / Jan Sikora | 41 lat; zdenerwowany | Jedna osoba, dwie tożsamości w różnych dokumentach. |
| actor.malec | Henryk Malec | 52 lata; zarozumiały | Niekompetentny działacz sportowy, przekonany o własnym talencie. |

Wiek podano na pierwszą wizytę. Codex powinien przypisać stałe daty urodzenia zgodne z wiekiem i obliczać wiek istniejącą funkcją. Zmiana wariantu medycznego lub stanowiska nie może wylosować nowego nazwiska czy twarzy.

**Publikacje i organizacje:**

- Kurier Obywatelski / Civic Courier: istniejąca regionalna gazeta codzienna.
- Głos Wzajemności / Voice of Mutuality: nowy tygodnik związku.
- Wzajemność / Mutuality: związek zawodowy.
- Wzajemność Walcząca / Fighting Mutuality: odrębne środowisko radykalne; tłumaczenie robocze do słownika.
- Zakładowy Klub Sportowy „Płomień”, Miejski Ośrodek Sportu oraz Wojewódzki Wydział Kultury Fizycznej i Sportu: kolejne miejsca zatrudnienia Malca.
- Zakłady Metalurgiczne: miejsce przymusowego oddelegowania Ochotnika.
- Zakłady Maszynowe: pracodawca magazyniera i dawny pracodawca Lisa.
- Miejska Elektrociepłownia: osobny strajk, niezależny od pozostałych zakładów.
- Zakłady Aparatury „Miernik”: zakład strajku Wolskiego; nazwa robocza, oddzielona od pozostałych spraw.

Nie łącz automatycznie wszystkich aresztowań i wszystkich strajków. Zwolnienie Lisa nastąpiło po aresztowaniach sprzed początku gry, więc jego historia działa także wtedy, gdy gracz wcześnie zatrzyma agenta.

## 4. Ukryty system punktacji

### 4.1. Trzy osie polityczne

| Pole | Skrót | Start i zakres | Znaczenie |
| --- | --- | --- | --- |
| partyTrust | P | 0; od -30 do +30 | Użyteczność lekarza dla władz i ich zaufanie do niego. |
| unionTrust | W | 0; od -30 do +30 | Zaufanie Wzajemności i ocena skutków decyzji dla jej ludzi. |
| securitySuspicion | S | 0; od 0 do 30 | Stopień zainteresowania służb działalnością gabinetu. |

Wartości są niewidoczne w zwykłej rozgrywce. Nie pokazuj pasków, ikon frakcji, komunikatów „+3 dla związku” ani podpowiedzi o zakończeniach. W trybie deweloperskim mogą być dostępne wraz z dziennikiem przyczyn.

P i W są niezależne. Zgoda zdrowemu Malcowi pomaga partii, ale nie oznacza automatycznego ubytku W. S nie spada za kolejną przysługę partii. Reputacja nie usuwa istniejących akt ani naruszeń.

Po każdej zakończonej decyzji stosuj delta, następnie ograniczenie do zakresu. Zachowaj także uporządkowany dziennik decyzji, aby odtworzenie punktów uwzględniało ograniczenie po każdym zdarzeniu.

### 4.2. Rzetelność i niekonsekwencja jako rejestr zdarzeń

Oprócz trzech liczników zapisuj dowody konkretnych naruszeń. Suma ich wag to N. To techniczna miara materiału do kontroli, nie czwarty pasek reputacji.

| Rodzaj wpisu | Waga N | Przykład |
| --- | ---: | --- |
| unjustified_refusal | 1 | Odmowa zdrowemu Ochotnikowi, Malcowi albo agentowi podczas wizyt 1-3. |
| contraindication_ignored | 2 | Dopuszczenie magazyniera do pracy obejmującej wózek lub agenta podczas wizyt 6-7. |
| identity_falsification | 2 | Pozytywne orzeczenie na nazwisko Jan Sikora mimo dokumentów i wyjaśnienia Andrzeja Lisa. |
| discretionary_decision | 0 | Dowolna decyzja w prawidłowo opisanym przypadku uznaniowym. |

N obejmuje tylko wskazane naruszenia wątków fabularnych. Zwykłe pomyłki przy losowych pacjentach nadal obsługuje istniejący system kar, składki, kontroli dokumentacji i bankructwa. Nie doliczaj ich drugi raz do fabularnego finału.

Każdy dowód zawiera przynajmniej: ID zdarzenia, ID wizyty, rodzaj, wagę, datę orzeczenia, podstawę dostępną graczowi oraz informację, czy stanowi wykrywalny dowód świadomego pomagania opozycji. Te ostatnie, oznaczone O, to wyłącznie:

1. bezpodstawna odmowa zdrowemu Ochotnikowi;
2. dopuszczenie magazyniera pomimo przeciwwskazania do wózka;
3. wystawienie orzeczenia na fałszywą tożsamość Lisa.

O jest liczbą odrębnych spraw, nie sumą wag. Zwykła decyzja uznaniowa korzystna dla Wzajemności nie jest dowodem O. Usunięcie dokumentu z biurka lub szuflady nie usuwa kopii znajdującej się u pracodawcy i nie kasuje wpisu.

**Nieuzasadniona zmiana stanowiska, R:** w pierwszym rozdziale występują dokładnie dwie dopuszczone pary:

- Malec: pierwsza zgoda, następnie odmowa przy drugim awansie, mimo równoważnych wymagań i niezmienionego stanu zdrowia.
- Drukarz: pierwsza zgoda, następnie odmowa podczas kontroli, mimo identycznego wyniku audiometrii i niezmienionych warunków pracy.

Każda taka zmiana dodaje R +1 oraz dodatkowo P -2, W -2, S +2. Nie dodaje osobnego N: odmowa Malcowi już ma N +1, a obie decyzje dotyczące drukarza pozostają medycznie uznaniowe. Ostrzeżenie o pierwszej zmianie jest doręczane przed drugą porównywalną decyzją.

Nie szukaj niekonsekwencji automatycznie między niepowiązanymi pacjentami. Odmowa agentowi po wzroście ciśnienia, nowych dowodach lub ultimatum nie zwiększa R.

### 4.3. Pełna macierz decyzji

Zgoda = fit, odmowa = unfit. Wszystkie wartości poniżej dotyczą jednej skutecznie zakończonej wizyty. Dodatkowe koszty R stosuje się po odpowiednim wierszu.

| Zdarzenie / decyzja | ΔP | ΔW | ΔS | ΔN | Pozostały skutek |
| --- | ---: | ---: | ---: | ---: | --- |
| Agent, zgoda na wizycie 1, 2 lub 3 | 0 | 0 | 0 | 0 | Kolejna infiltracja i warunkowa kolejna wizyta. |
| Agent, odmowa na wizycie 1 | -1 | +3 | 0 | +1 | Łańcuch zatrzymany przypadkowo, zanim gracz ma poszlaki. |
| Agent, odmowa na wizycie 2 | -3 | +8 | +2 | +1 | Wczesne przerwanie infiltracji, ale brak przeciwwskazań medycznych. |
| Agent, odmowa na wizycie 3 | -3 | +7 | +2 | +1 | Jak wyżej, po większej liczbie poszlak. |
| Agent, zgoda na wizycie 4 lub 5 | +2 | -2 | 0 | 0 | Ciśnienie nadal w strefie uznaniowej. |
| Agent, odmowa na wizycie 4 | -3 | +6 | +2 | 0 | Legalnie obronna decyzja, koniec łańcucha. |
| Agent, odmowa na wizycie 5 | -3 | +5 | +2 | 0 | Jak wyżej, mniejsza korzyść związku. |
| Agent, zgoda na wizycie 6 | +2 | -2 | 0 | +2 | Wyraźne przeciwwskazanie; uruchomienie ostrzeżenia radykałów. |
| Agent, odmowa na wizycie 6 | -3 | +4 | +2 | 0 | Koniec łańcucha. |
| Agent, odmowa na wizycie 7 | -2 | +2 | +1 | 0 | Ultimatum nie zostaje złamane. |
| Agent, zgoda na wizycie 7 po doręczonym ostrzeżeniu | +3 | -4 | 0 | +2 | Flaga kompromitacji; finał E1 rano W26. |
| Przywódca strajku, zgoda | -2 | +3 | +1 | 0 | Nowa praca i możliwość dalszej działalności. |
| Przywódca strajku, odmowa | +1 | -2 | 0 | 0 | Utrata możliwości zatrudnienia. |
| Drukarz, pierwsza zgoda | -2 | +3 | +1 | 0 | Wczesny start tygodnika. |
| Drukarz, pierwsza odmowa | +1 | -2 | 0 | 0 | Późny start tygodnika; brak jego wizyty kontrolnej. |
| Drukarz, ponowna zgoda | -1 | +2 | +1 | 0 | Ciągłość druku. |
| Drukarz, odmowa podczas kontroli | +2 | -3 | 0 | 0 | Pominięcie jednego wydania; dodatkowo R +1 i jego delta. |
| Dyspozytor, zgoda | +3 | -2 | 0 | 0 | Wznowienie ogrzewania i osłabienie strajku. |
| Dyspozytor, odmowa | -3 | +3 | +2 | 0 | Dalszy strajk i problemy mieszkańców. |
| Sierżant, zgoda | +3 | -1 | 0 | 0 | Powrót do służby zgodny z zapowiedzią gazety. |
| Sierżant, odmowa | -3 | +3 | +2 | 0 | Kompromitująca rozbieżność z prasową zapowiedzią. |
| Korektorka, zgoda | -2 | +2 | +1 | 0 | Zachowuje pracę. |
| Korektorka, odmowa | +2 | -2 | 0 | 0 | Odsunięcie od pracy. |
| Ochotnik, zgoda | +2 | -1 | 0 | 0 | Trafia do brygady zastępującej strajkujących. |
| Ochotnik, odmowa | -2 | +2 | +2 | +1 | Unika oddelegowania; O +1. |
| Magazynier, zgoda | -2 | +3 | +2 | +2 | Zachowuje zatrudnienie, ale zostaje dopuszczony także do wózka; O +1. |
| Magazynier, odmowa | +1 | -2 | 0 | 0 | Pracodawca wykorzystuje orzeczenie przeciw niemu. |
| Lis, zgoda na nazwisko Sikora | -2 | +3 | +2 | +2 | Zatrudnienie pod fałszywą tożsamością; O +1. |
| Lis, odmowa | 0 | -1 | 0 | 0 | Brak pracy, bez udziału lekarza w fałszowaniu danych. |
| Malec, zgoda na każdej z dwóch wizyt | +2 | 0 | 0 | 0 | Kolejny awans. |
| Malec, odmowa na pierwszej wizycie | -1 | 0 | +1 | +1 | Pozostaje w klubie; brak drugiej wizyty. |
| Malec, odmowa na drugiej wizycie | -1 | 0 | +1 | +1 | Pozostaje w MOS; dodatkowo R +1 i jego delta. |

Wczesna odmowa agentowi ma największy pożytek dla związku dopiero wtedy, gdy mogła wynikać z widocznych poszlak. Nie przedstawiaj przypadkowej odmowy pierwszemu zdrowemu pacjentowi jako świadomego zdemaskowania.

### 4.4. Ostrzeżenia i uczciwe sygnały

| Próg / zdarzenie | Dokument | Termin i funkcja |
| --- | --- | --- |
| S osiąga co najmniej 9 | SYS-SECURITY | Następny poranek pracy: zawiadomienie o zainteresowaniu dokumentacją. Opisuje konkretne sprawy, bez ujawniania liczb. |
| N osiąga co najmniej 3 | SYS-AUDIT | Następny poranek pracy. Ustalony harmonogram zapewnia doręczenie przed ewentualnym przekroczeniem N ≥ 6. |
| Pierwszy wpis R | SYS-CONSISTENCY | Następny poranek pracy, przed kolejną porównywalną decyzją. Przy dwóch zmianach stanowiska: W19 po odmowie drukarzowi w W18, przed drugą wizytą Malca w W19. |
| Zgoda agentowi na wizycie 6 | A-WARNING | W21 rano, przed wizytą 7 w W24. Nie zależy od tygodnika. |

Doręczenie oznacza rzeczywiste utworzenie dostępnego dokumentu z krótkim sygnałem otrzymania korespondencji. Nie wymaga jego otwarcia. W zapisie przechowuj datę oraz kolejność doręczenia względem decyzji. Samo zaplanowanie pisma nie jest doręczeniem.

Pisma ostrzegawcze są nową, odrębną kategorią fabularną. Mogą wskazywać zagrożenie upoważnienia gabinetu. Nie zmieniaj przez to dotychczasowej zasady, że zwykłe listy ZUS i pracodawców mają oszczędny, proceduralny ton.

## 5. Harmonogram pierwszych 26 dni roboczych

**Fabuła trwa 26 dni pracy.** Weekendów nie wliczamy do W. Przy istniejącym początku gry oznacza to okres od czwartku 3 listopada do czwartku 8 grudnia 1983, czyli 36 dni kalendarzowych włącznie z dniem początkowym.

W = numer zmiany, K = kalendarzowy state.day. Wszystkie oznaczenia W w opisach wątków, publikacji i testów poniżej mają dokładnie to samo znaczenie. Daty dokumentów wyliczaj z K, nie z W.

Nie dodawaj lokalnych świąt na podstawie rzeczywistego kalendarza Polski: miejsce akcji pozostaje nieokreślone, a silnik wyróżnia weekendy.

| Dzień pracy | Dzień silnika | Data 1983 | Pacjenci fabularni w kolejności | Prasa i korespondencja |
| --- | --- | --- | --- | --- |
| W1 | K1 | czw. 03.11 | Brak | Dotychczasowe wprowadzenie i zwykły „Kurier”. |
| W2 | K2 | pt. 04.11 | A1: agent | Pierwsze, prawidłowe skierowanie. |
| weekend | K3-K4 | 05.11-06.11 | Brak | Istniejące sceny i rozliczenia weekendowe; numer fabuły nie rośnie. |
| W3 | K5 | pon. 07.11 | Brak | Warunkowe aresztowania po A1; istniejąca progresja W3. |
| W4 | K6 | wt. 08.11 | Brak | Strajk i zwolnienie Wolskiego; istniejące odblokowanie opinii specjalisty. |
| W5 | K7 | śr. 09.11 | A2, jeśli A1 = zgoda; B1: Wolski | Wizyta Wolskiego po artykule; istniejąca kontrola autentyczności skierowań. |
| W6 | K8 | czw. 10.11 | Brak | Ogłoszenie drukarni; aresztowania po A2; istniejąca scena łapówki u drugiego zwykłego pacjenta. |
| W7 | K9 | pt. 11.11 | Brak | Istniejące odblokowanie badań dodatkowych, w tym audiometrii. |
| weekend | K10-K11 | 12.11-13.11 | Brak | Istniejące sceny i rozliczenia weekendowe; numer fabuły nie rośnie. |
| W8 | K12 | pon. 14.11 | A3, jeśli A2 = zgoda; C1: drukarz | Odwołana spartakiada z nazwiskiem Malca. |
| W9 | K13 | wt. 15.11 | Brak | Aresztowania po A3; pierwszy wczesny „Głos Wzajemności”. |
| W10 | K14 | śr. 16.11 | J1: Malec | Pierwsze badanie przed awansem do MOS. |
| W11 | K15 | czw. 17.11 | A4, jeśli A3 = zgoda | Pierwsze fałszywe pismo agenta; możliwa skarga po odmowie J1. |
| W12 | K16 | pt. 18.11 | E1-VISIT: sierżant | „Bohater milicji powraca do służby”; aresztowania po A4. |
| weekend | K17-K18 | 19.11-20.11 | Brak | Istniejące sceny i rozliczenia weekendowe; numer fabuły nie rośnie. |
| W13 | K19 | pon. 21.11 | Brak | Reakcja na decyzję dotyczącą sierżanta. |
| W14 | K20 | wt. 22.11 | A5, jeśli A4 = zgoda | Strajk elektrociepłowni; drugie wczesne albo pierwsze późne wydanie „Głosu”. |
| W15 | K21 | śr. 23.11 | D1: dyspozytor | Aresztowania po A5; zawody na zamkniętym basenie, jeśli J1 = zgoda. |
| W16 | K22 | czw. 24.11 | Brak | Skutek decyzji dyspozytora; brygady „ochotnicze”; sprostowanie terminu powrotu sierżanta po odmowie. |
| W17 | K23 | pt. 25.11 | G1: Ochotnik | Karta oddelegowania i kopia polecenia służbowego. |
| weekend | K24-K25 | 26.11-27.11 | Brak | Istniejące sceny i rozliczenia weekendowe; numer fabuły nie rośnie. |
| W18 | K26 | pon. 28.11 | C2, jeśli C1 = zgoda; H1: magazynier | Lista „ochotników” albo skarga pracodawcy. C2 poprzedza H1. |
| W19 | K27 | wt. 29.11 | J2, jeśli J1 = zgoda | Pytający nagłówek; „Głos”, chyba że pominięto go po C2 = odmowa; możliwe ostrzeżenie R po C2. |
| W20 | K28 | śr. 30.11 | A6, jeśli A5 = zgoda | Sprostowanie znaku zapytania; możliwa skarga po J2. |
| W21 | K29 | czw. 01.12 | F1: korektorka; I1: Lis / Sikora | Ultimatum po A6 = zgoda; aresztowania po A6; pismo o magazynierze. F1 poprzedza I1. |
| W22 | K30 | pt. 02.12 | Brak | Miejsce na zwykłą pracę i warunkową korespondencję. |
| weekend | K31-K32 | 03.12-04.12 | Brak | Istniejące sceny i rozliczenia weekendowe; numer fabuły nie rośnie. |
| W23 | K33 | pon. 05.12 | Brak | Kolejny błąd korektorski albo komunikat o kontroli redakcyjnej. |
| W24 | K34 | wt. 06.12 | A7, jeśli A6 = zgoda i doręczono ostrzeżenie | „Głos” w zwykłym rytmie, także po pominięciu W19; warunkowy finał prasowy Malca. |
| W25 | K35 | śr. 07.12 | Brak | Zwykły rytm pracy; zaplanowane listy i następstwa. |
| W26 | K36 | czw. 08.12 | Zwykli pacjenci, jeśli gra nadal trwa | E1 rano, jeżeli uruchomiono kompromitację; po pracy rozstrzygnięcie pozostałych nowych finałów. |

W najdłuższej gałęzi występuje 18 wizyt fabularnych rozłożonych na 26 zmian: siedem agenta, dwie drukarza, dwie Malca i siedem pozostałych. To dziesięć postaci. Maksymalnie dwie wizyty fabularne występują w W5, W8, W18 i W21. Standardowi pacjenci wypełniają pozostałą część zmian. Warunkowo odwołanych wizyt nie zastępuj nowymi wątkami.

Oznaczenia A1…J2 dotyczą wizyt; E1-VISIT oznacza wyłącznie wizytę sierżanta. Oznaczenia E1…E6 bez przyrostka VISIT dotyczą zakończeń. W kodzie użyj rozdzielonych przestrzeni nazw, np. encounter.sergeant oraz ending.exposed, aby uniknąć kolizji.

## 6. Wątki - szczegółowy materiał wykonawczy

W tabelach dokumentów użyto oznaczeń:

- **R:** istniejąca wygenerowana grafika papieru i pieczęci; nowa treść lub instancja.
- **M:** istniejący papier połączony z nowym elementem wymagającym generowania.
- **G:** konieczna nowa wygenerowana grafika.

Dokument „R” także ma istniejącą bitmapową oprawę. Nie oznacza to rysowania kartki kodem. Przy każdym przypadku standardowe skierowanie, notatka z badań i wydawane orzeczenie nadal podlegają dotychczasowym czynnościom oraz archiwizacji.

### 6.1. A - Zmieniający pracę

**Sens wątku:** stopniowe rozpoznawanie człowieka, którego kolejne zatrudnienia poprzedzają rozbicie struktur związkowych. Gracz może zatrzymać ten proces, pomagać służbom albo wycofać się dopiero po ostrzeżeniu.

Roman Kurek przychodzi za każdym razem z nowym, formalnie prawidłowym skierowaniem. Jego zajęcie wymaga przemieszczania się po zakładzie, np. konserwator urządzeń. Zmienia się pracodawca, ale nazwisko, data urodzenia, twarz i zasadnicze obowiązki pozostają identyczne. Przez pierwsze trzy wizyty jest zdrowy. Potem wzrasta mu ciśnienie.

| Wizyta | Dzień pracy | Pracodawca - nazwa robocza | Stan w regułach gry | Dokument dodatkowy |
| --- | ---: | --- | --- | --- |
| A1 | W2 | Zakłady Remontowe „Tor” | fit; 128/82 | Brak |
| A2 | W5 | Zakłady Meblarskie „Brzoza” | fit; 132/84 | Brak |
| A3 | W8 | Zakłady Tekstylne „Osnowa” | fit; 138/88 | Brak |
| A4 | W11 | Wytwórnia Kabli „Przewód” | discretionary; 160/100 | A-FAKE-4 |
| A5 | W14 | Zakłady Ceramiczne „Klinkier” | discretionary; 160/100 | A-FAKE-5 |
| A6 | W20 | Przedsiębiorstwo Transportu Miejskiego | unfit; 174/108 | A-FAKE-6 |
| A7 | W24 | Zakłady Obrabiarek „Wektor” | unfit; 174/108 | A-FAKE-7 |

Pozostałe wyniki są prawidłowe, skierowania świeże, pieczęcie czytelne. Wahania ponownych pomiarów muszą pozostać w tej samej kategorii oceny. Nie dodawaj agentowi przypadkowej wady wzroku, łapówki ani losowego błędu skierowania.

**Dokumenty:**

| ID / liczba | Co należy wytworzyć | Wygląd i istotna treść | Grafika |
| --- | --- | --- | --- |
| A-REF-1…A-REF-7 / 7 instancji | Kolejne skierowania na badania wstępne | Istniejący kremowy formularz; różne zakłady i daty, identyczne nazwisko i data urodzenia; fioletowa pieczęć kadr. | R |
| A-FAKE-4…A-FAKE-7 / 4 instancje | Fałszywe indywidualne pisma rzekomo z Izby | Papier i niebieska pieczęć podobne do prawdziwej korespondencji Izby. Ten sam numer bazowy; kolejne odpisy. Treść bez konkretnego stanowiska i bez potwierdzenia leczenia. | R |
| A-WARNING / 1 | Ostrzeżenie Wzajemności Walczącej | Mały, złożony maszynopis na szarawym papierze, ślad powielacza, bez oficjalnej pieczęci. | G: G03 |
| A-EXPOSURE / 1 warunkowo | Powielone zestawienie kompromitujące | Ulotka z fragmentami rzeczywiście wydanych orzeczeń A6 i A7; podpis lekarza, numer gabinetu 04, daty, stanowiska, odciski pozytywnych decyzji. | G: G04; dane z historii |
| A-CLOSURE / 1 warunkowo | Pismo o odsunięciu od orzekania | Kremowy list dyrekcji przychodni, numer sprawy, data 08.12.1983 (K36, W26); powód odnosi się do ujawnionych dokumentów. | R |

**Treść kluczowa fałszywego pisma:**

> Izba Lekarska potwierdza możliwość wydawania orzeczeń pozytywnych obywatelowi Romanowi Kurkowi we wszystkich zakładach kierujących. Odchylenia wartości ciśnienia nie stanowią podstawy odmowy. Niniejsze pismo zachowuje ważność bezterminowo.

Fałszerstwo nie może polegać na przypadkowej literówce wygenerowanej przez model obrazowy. Konkretna niezgodność jest merytoryczna: istniejący wyjątek wymaga indywidualnego zaświadczenia specjalisty o leczeniu i o konkretnym stanowisku. Izba nie wydała bezterminowego zwolnienia z oceny ciśnienia. Numer do sekretariatu, wydrukowany na piśmie, pozwala to potwierdzić.

Wizyty A4 i A5 pozostają uznaniowe nawet po wykryciu fałszerstwa, ponieważ samo ciśnienie mieści się w strefie granicznej. A6 i A7 mają rzeczywiste przeciwwskazanie, którego pismo nie usuwa.

**Publikacje i interakcje:**

- Po zgodach A1-A6 „Kurier” w następnym dniu pracy publikuje informację o „przywróceniu porządku” w dokładnie tym zakładzie, który figurował na skierowaniu. W treści występują zatrzymania i rozbicie nieformalnej struktury pracowniczej. Skutkiem zgody A7 jest bezpośrednio A-EXPOSURE i finał E1.
- Po odmowie nie ma aresztowań spowodowanych tym zatrudnieniem. Kolejne wizyty agenta zostają anulowane. Najbliższy „Głos” może opisać przetrwanie zakładowej komórki, bez wskazywania lekarza.
- Dymek A1: „Pierwszy dzień w nowym zakładzie. Potrzebuję tylko orzeczenia.”
- Dymek A4: „W Izbie już sprawę wyjaśnili. Wszystko jest na piśmie.”
- Dymek A6: „Zakład czeka. Proszę nie zatrzymywać dokumentów.”
- Telefon do Izby: „Kolego, nie wystawiamy takich zwolnień. Ten numer nie figuruje w naszym rejestrze.”

**Ostrzeżenie w W21 po zgodzie A6:**

> Roman Kurek nie szuka pracy. Po jego wizytach znikają nasi ludzie. Mamy kopie wystawionych przez pana orzeczeń. Jeśli dopuści go pan do kolejnego zakładu, opublikujemy je z pańskim podpisem i numerem gabinetu. To ostatnie ostrzeżenie. Wzajemność Walcząca.

Dokument musi być doręczony niezależnie od sytuacji drukarni i od tego, czy gracz zachował gazety. Podczas A7 nadal dostępne są obie pieczątki. Ponowna zgoda po doręczeniu ultimatum zapisuje flagę E1; rano W26 następuje kompromitacja i odsunięcie od pracy. Odmowa A7 nie usuwa wcześniejszych naruszeń, ale zatrzymuje ten finał.

Wcześniejsze pozytywne orzeczenia nie zobowiązują do dalszych zgód: zdrowie się pogarsza, a wiedza gracza rośnie. Nie naliczaj R za zatrzymanie agenta.

### 6.2. B - Przywódca strajku

**Terminy:** artykuł W4, pacjent W5.

W Zakładach Aparatury „Miernik” trwa strajk. „Kurier” informuje, że organizator protestu, Stefan Wolski, został zwolniony za naruszenie dyscypliny. Następnego dnia Wolski przychodzi ze skierowaniem na badania wstępne do przedsiębiorstwa usługowego, które zatrudnia osoby myjące okna na wysokościach.

Ciśnienie 160/100 mieści się w zakresie uznaniowym gry. Pozostałe wyniki są prawidłowe. Prawdziwe pismo Izby wyjaśnia, że brak szczegółowego taryfikatora dla tego rodzaju prac pozostawia ocenę indywidualną, ale nie zwalnia z badań ani z uwzględniania jednoznacznych przeciwwskazań.

| ID | Dokument | Wygląd i treść | Grafika |
| --- | --- | --- | --- |
| B-REF | Skierowanie na badania wstępne | Nowy pracodawca; „pracownik usług porządkowych - mycie okien na wysokościach”; nazwisko identyczne jak w artykule. | R |
| B-CHAMBER | Pismo interpretacyjne Izby | Kremowy papier, niebieska pieczęć Izby, data, sygnatura i podpis; precyzyjny zakres uznania. | R |
| B-LEAFLET | Ulotka Wzajemności | Niedoskonały powielony druk, znak związku, krótki apel o pomoc zwolnionym pracownikom „Miernika”. | G: G01 i G02 |

**Pismo Izby - tekst zasadniczy:**

> Dla wskazanego stanowiska nie wprowadzono odrębnego wykazu wartości granicznych. Lekarz dokonuje indywidualnej oceny zdolności do pracy, uwzględniając wyniki badań, wywiad oraz pracę na wysokościach. Niniejsza informacja nie uchyla pozostałych obowiązków związanych z orzekaniem.

Dymek wejściowy: „Tamtej pracy już nie odzyskam. Tę chciałbym przynajmniej dostać.”

**Zgoda:** Wolski podejmuje nową pracę; Wzajemność zyskuje możliwość dalszego działania swojego organizatora. Krótkie podziękowanie pojawia się przy wyjściu. Ulotka jest dostępna od początku wizyty, więc nie trzeba po zakończeniu wizyty uruchamiać osobnego przekazywania prezentu.

**Odmowa:** nowy pracodawca nie zatrudnia Wolskiego. To decyzja dopuszczalna w granicach uznania; bez automatycznej kary medycznej. Najbliższy „Głos” publikuje wariant o pomocy bezrobotnym działaczom.

Nie tworzyć dodatkowej wizyty sekretarza lub lidera związku. Nacisk wynika z dokumentów i kontekstu. Ulotka nie jest deklaracją przynależności lekarza.

### 6.3. C - Nocny drukarz

**Terminy:** ogłoszenie W6, pierwsze badanie W8, kontrola W18 po pierwszej zgodzie.

Państwowa Drukarnia poszukuje operatora maszyny offsetowej na nocną zmianę. Dwa dni robocze po ogłoszeniu przychodzi Jerzy Borkowski. Ma niewielki ubytek słuchu. Przynosi protokół BHP zalecający audiometrię oraz już wykonany wynik zlecony przed wizytą przez lekarza zakładowego. Wynik jest graniczny i dopuszcza ocenę indywidualną.

Dostarczenie gotowego wyniku jest celowe: zamknięcie tej sprawy nie powinno zależeć od losowego czasu powrotu od specjalisty. Wykorzystaj istniejącą semantykę wyniku audiometrii i jego przekazania pacjentowi. Dodaj obsługę badania dostarczonego na wejściu, z rzeczywistym dokumentem i wpisem w notatce. Nie oznaczaj niewykonanego badania jako ukończonego.

| ID | Dokument | Wygląd i treść | Grafika |
| --- | --- | --- | --- |
| C-AD | Ogłoszenie prasowe w W6 | Rubryka ogłoszeń istniejącego „Kuriera”; praca nocna, operator offsetowy, kontakt do portierni. | R |
| C-REF-1 | Skierowanie na badania wstępne | Hałas, nocna zmiana, obsługa maszyny offsetowej, aktualna data. | R |
| C-BHP | Protokół pomiaru hałasu | Kremowy maszynopis z krótką tabelą stanowisk i zaleceniem audiometrii; podpis inspektora. | M: G05 |
| C-AUDIO-1 | Wynik audiometrii | Istniejący raport specjalistyczny; wynik „graniczny, do indywidualnej oceny lekarza”. | R |
| C-REF-2 | Skierowanie na kontrolę po okresie próbnym | Ten sam zakład i zakres obowiązków; termin po dziesięciu dniach pracy. | R |
| C-AUDIO-2 | Wynik kontrolnej audiometrii | Takie same wartości i ocena jak C-AUDIO-1, brak pogorszenia. | R |
| C-PRINT-NOTE | Krótka notatka po pierwszej zgodzie | Powielany skrawek dostarczony z pierwszym tygodnikiem: podziękowanie za możliwość uruchomienia składu i druku. | R na G01 |
| C-PAUSE | Informacja o przerwie w druku | Kartka od redakcji doręczana W19, jeżeli C2 = odmowa; nie udaje pełnego wydania tygodnika. | R na G01 |

**Treść protokołu BHP:**

> Stanowisko: operator maszyny offsetowej, zmiana nocna. W hali występuje stały hałas maszynowy. Zaleca się ocenę słuchu metodą audiometrii oraz kontrolę po pierwszych dziesięciu dniach pracy. Wynik badania dołączono do dokumentacji kandydata.

Nie dodawaj przypadkowych liczb natężenia hałasu ani wykresu niezgodnego z danymi. Tabela może zawierać stanowisko, rodzaj narażenia i zalecenie, bez nowej mechaniki liczenia dawek.

Dymek przy wejściu: „W dzień maszyny chodzą dla redakcji. Nocą też znalazłoby się trochę roboty.”

**Pierwsza zgoda:** drukarz podejmuje pracę. Pierwszy „Głos Wzajemności” pojawia się W9. Zgoda otwiera kontrolę C2 w W18. Wczesne wydania: W9, W14, W19, W24, W29 i dalej co siedem dni kalendarzowych, czyli co pięć zmian.

**Pierwsza odmowa albo brak zakończonej wizyty C1:** redakcja znajduje innego drukarza poza gabinetem. Pierwsze wydanie W14, następne W19, W24, W29. Przy odmowie nalicz punkty z macierzy; przy braku orzeczenia nie naliczaj żadnych. C2 nie występuje.

**Kontrola C2:** oba orzeczenia są medycznie uznaniowe. Ponowna zgoda zachowuje rytm druku. Odmowa powoduje pominięcie wydania W19; W24 ukazuje się zgodnie z pierwotnym rytmem, po zorganizowaniu zastępstwa. Nie przesuwaj wszystkich przyszłych dat i nie uruchamiaj drugiego, późnego kalendarza.

Ponieważ wyniki i warunki pracy się nie zmieniają, odmowa C2 po zgodzie C1 zwiększa R. Sama zmiana pozostaje odrębna od medycznej poprawności obu decyzji. Dymek podczas kontroli: „Zakład chciał sprawdzić słuch po okresie próbnym. Wyniki są takie jak poprzednio.”

Przy pozytywnym orzeczeniu wynik audiometrii trzeba przekazać wraz z orzeczeniem, tak jak w istniejącej obsłudze badań dodatkowych. Brak załącznika może wywołać istniejący skutek kancelaryjny, lecz nie zmienia politycznego znaczenia samej zgody i nie dodaje N z nowej, nieopisanej kategorii.

### 6.4. D - Operacja „Ciepło”

**Terminy:** artykuł W14, pacjent W15, skutek w gazecie W16.

W Miejskiej Elektrociepłowni trwa strajk. Władze zapowiadają uruchomienie zakładu przy pomocy pracowników zastępczych, aby zapewnić mieszkańcom ogrzewanie. Do gabinetu trafia Antoni Rybak, emerytowany główny dyspozytor, namówiony do powrotu.

Nie jest bezmyślnym aparatczykiem. Wie, że miasto potrzebuje ogrzewania, ale rozumie również, po co władze sprowadzają zastępstwo. Nie prosi gracza o jednoznacznie polityczną deklarację.

Ciśnienie 160/100; pozostałe wyniki prawidłowe. Decyzja uznaniowa. To jeden z nielicznych specjalistów znających instalację, co wynika z pisma, a nie z ukrytej wiedzy autora.

| ID | Dokument | Wygląd i treść | Grafika |
| --- | --- | --- | --- |
| D-REF | Skierowanie na badania wstępne | Dyspozytor ruchu elektrociepłowni; odpowiedzialność za uruchomienie instalacji, praca zmianowa. | R |
| D-PARTY | Pismo Komitetu Wojewódzkiego | Staranny maszynopis, formalny nagłówek, ceglastoczerwona pieczęć, niebieski podpis. | M: G06 |

**Pismo Komitetu:**

> W związku z zagrożeniem ciągłości ogrzewania zwracamy się o pilne przeprowadzenie badania obywatela Antoniego Rybaka. Jego doświadczenie jest niezbędne do bezpiecznego uruchomienia instalacji. Prosimy o uwzględnienie szczególnego znaczenia sprawy dla mieszkańców.

Dymek: „Instalację znam od początku. Tylko zdrowie nie jest już takie jak dawniej.”

**Zgoda:** elektrociepłownia wznawia pracę; strajk traci część siły nacisku; partia ogłasza sukces. „Głos” opisuje wykorzystanie emerytowanych fachowców do złamania protestu.

**Odmowa:** strajk trwa, pozycja negocjacyjna Wzajemności rośnie, pojawiają się problemy z ogrzewaniem. „Kurier” donosi o spadku temperatury w blokach i szkołach. Nie dopisuj automatycznego zgonu ani katastrofy jako ukrytej kary.

Skutki są polityczne i społeczne, bez nowego systemu temperatury, zdrowia mieszkańców lub finansowej kary za samą decyzję uznaniową.

### 6.5. E - Orzeczenie z pierwszej strony

**Terminy:** artykuł i pacjent W12, reakcja W13, drobne sprostowanie W16 po odmowie.

Rankiem „Kurier Obywatelski” publikuje tekst „Bohater milicji powraca do służby”. Sierżant Marek Czarnecki miał zostać ranny podczas niedawnych zamieszek. Gazeta informuje, że zakończył rekonwalescencję i od jutra ponownie będzie patrolował miasto.

Tego samego dnia sierżant pojawia się w gabinecie. Orzeczenia jeszcze nie ma. Gazeta ogłosiła wynik procedury, zanim lekarz przeprowadził badanie.

Wynik wzroku jest graniczny: w danych gry -6,00 dioptrii dla jednego oka, -1,00 dla drugiego. Pozostałe badania prawidłowe. Opinia okulisty wskazuje utrzymujące się trudności po urazie, bez jednoznacznego rozstrzygnięcia zdolności do służby. Nie dodawaj zaburzeń psychicznych; ten pacjent nie potrzebuje automatycznej konsultacji psychiatrycznej tylko dlatego, że jest milicjantem.

| ID | Dokument | Wygląd i treść | Grafika |
| --- | --- | --- | --- |
| E-REF | Skierowanie na badanie kontrolne | Istniejący styl milicyjny, wąski niebieski nagłówek, owalna pieczęć; służba patrolowa. | R |
| E-EYE | Wynik badania okulistycznego | Kliniczny maszynopis; nazwisko, data, wartości zgodne z badaniem w grze; graniczna ocena. | R |
| E-COMMAND | Pismo Komendy Wojewódzkiej MO | Krótkie pismo na kremowym papierze, podpis komendanta lub upoważnionego oficera, pieczęć MO. | R |

**Pismo Komendy:**

> Prosimy o pilne wydanie pozytywnego orzeczenia umożliwiającego sierżantowi Markowi Czarneckiemu powrót do służby patrolowej. Powrót funkcjonariusza ma istotne znaczenie dla obsady jednostki i został uwzględniony w jej planie służb.

Dymek: „W gazecie już napisali. Ja dopiero po dokumenty.”

**Zgoda:** w W13 pojawia się relacja z pierwszego patrolu, podkreślająca skuteczną rehabilitację. Medycznie jest to dopuszczalna ocena.

**Odmowa:** w W13 gazeta zarzuca lekarzowi bezpodstawne opóźnianie powrotu zasłużonego funkcjonariusza. Najbliższy dostępny „Głos” zamieszcza notkę: „Władza zna wyniki badań, zanim zbada pacjenta”. W W16 „Kurier” publikuje małe sprostowanie dotyczące wyłącznie daty powrotu do służby.

Atak prasowy nie jest automatycznym, niezależnym game over ani karą ZUS. Jego wpływ zawiera już delta punktów. Sprostowanie nie zmienia przeszłego orzeczenia i nie przedstawia sierżanta jako faktycznie pracującego po odmowie.

### 6.6. F - Znak zapytania

**Terminy:** nagłówek W19, sprostowanie W20, pacjentka W21, skutek W23.

Na pierwszej stronie „Kuriera” pojawia się nagłówek:

> ROBOTNICY JEDNOMYŚLNIE POPIERAJĄ PARTIĘ?

Artykuł poniżej zachowuje zwykły propagandowy ton. Końcowy znak zapytania podważa wymowę całego tekstu. Nie wyróżniaj go kolorem, ikoną ani interaktywnym hotspotem. Musi być czytelny w zwykłym nagłówku, złożony z prawidłowego tekstu.

Nazajutrz redakcja przeprasza za „niedopuszczalny błąd korektorski”. Dwa dni po nagłówku przychodzi Zofia Witek, wieloletnia korektorka tej samej gazety.

Ma pogarszające się widzenie z bliska mimo używania okularów. W uproszczonym modelu gry wynik wzroku jest graniczny, na granicy 6 dioptrii; nie wprowadzaj nowego badania ani przelicznika ostrości. Pozostałe wyniki prawidłowe, decyzja uznaniowa.

| ID | Dokument | Wygląd i treść | Grafika |
| --- | --- | --- | --- |
| F-REF | Skierowanie na badania okresowe | Pracodawca: redakcja „Kuriera Obywatelskiego”; korekta tekstów prasowych. | R |
| F-EYE | Wynik okulistyczny | Zwykły raport; opis trudności z drobnym drukiem i graniczna ocena, zgodna z danymi gry. | R |
| F-EDITOR | Notatka redaktora naczelnego | Wewnętrzny maszynopis, krótszy i mniej ceremonialny niż pismo urzędowe; podpis, podkreślenie jednego zdania. | M: G05 |

**Notatka redaktora:**

> Proszę o szczególnie dokładną ocenę zdolności pracownicy do kontroli drobnego druku. W ostatnim numerze doszło do rażącego zaniedbania obowiązków, skutkującego zniekształceniem sensu materiału na pierwszej stronie.

Dymek: „Dwadzieścia trzy lata poprawiam cudze zdania. Teraz sprawdzają moje oczy.”

**Zgoda:** korektorka zachowuje stanowisko. W W23 gazeta drukuje kolejny drobny błąd: w podziękowaniu mieszkańców zabrakło słowa „usunięcie”, dając zdanie „Dziękujemy za braki w zaopatrzeniu”. Nie dopisuj przyznania się pacjentki. Nadal nie wiadomo, czy chodzi o niedopatrzenie, czy świadomy sprzeciw.

**Odmowa:** korektorka zostaje odsunięta od pracy. W W23 gazeta informuje o zaostrzeniu kontroli publikacji. Najbliższy dostępny „Głos” publikuje „Zwolniona za znak zapytania”.

Komentarz związku do nagłówka W19 może trafić najwcześniej do wydania W24 w obu wariantach startu tygodnika. Wydanie W19 było już przygotowane przed poranną publikacją „Kuriera”, a sprostowanie ukazuje się dopiero w W20. Pominięcie W19 po odmowie drukarzowi nie zmienia terminu W24. Nadwyżka komentarzy czeka do W29 zgodnie z priorytetami. Nie drukuj wiedzy o późniejszych zdarzeniach we wcześniejszym egzemplarzu.

### 6.7. G - Ochotnik

**Terminy:** artykuł W16, pacjent W17, skutek W18.

„Kurier” chwali brygady pracowników z innych przedsiębiorstw, którzy mają zastąpić strajkujących w Zakładach Metalurgicznych. Następnego dnia roboczego przychodzi operator suwnicy Tadeusz Kania.

Jest zdrowy. Wszystkie wymagane badania są prawidłowe, np. ciśnienie 132/84 i wzrok bez przeciwwskazań. Dokumenty pokazują jednak, że oddelegowanie nie jest dobrowolne. Mężczyzna prosi o odmowę, ponieważ nie chce być łamistrajkiem i boi się konsekwencji służbowych odmowy wyjazdu.

| ID | Dokument | Wygląd i treść | Grafika |
| --- | --- | --- | --- |
| G-REF | Skierowanie na badania wstępne | Operator suwnicy w Zakładach Metalurgicznych; zgodny zakres obowiązków, ważna data. | R |
| G-DELEGATION | Karta oddelegowania | Formularz zakładowy na kremowym papierze; wyraźny odcisk „ZGŁOSZENIE DOBROWOLNE”. | M: G07 |
| G-ORDER | Kopia polecenia służbowego | Cienki papier, blady fioletowy ślad przebitki; czytelne obowiązki i konsekwencje odmowy. Na dole krótka odręczna prośba pacjenta. | G: G08 |
| G-COMPLAINT | Pismo pracodawcy po odmowie | Wariant istniejącego listu pracodawcy; nazwisko, data orzeczenia, prośba o wyjaśnienie podstaw. | R |

**Polecenie służbowe:**

> Pracownika oddelegowuje się do brygady zastępczej w Zakładach Metalurgicznych. Odmowa oddelegowania traktowana będzie jako naruszenie dyscypliny pracy.

**Dopisek pacjenta:**

> Doktorze, nie chcę zastępować strajkujących. Sam nie mogę odmówić. Proszę mnie nie dopuścić.

Dymek: „Na karcie napisali, że dobrowolnie.”

**Zgoda:** jest poprawna medycznie. Kania trafia do brygady. W18 jego nazwisko pojawia się na liście „zasłużonych ochotników”.

**Odmowa:** chroni go przed oddelegowaniem, ale nie ma podstaw w badaniach. Powstaje N +1 i O +1. Pracodawca w W18 żąda wyjaśnień; istniejący system może niezależnie naliczyć zwykły skutek błędnej odmowy. Fabularne pismo nie dodaje drugiej składki ani dodatkowej grzywny.

Nie dodawaj późniejszego urazu ani wymuszonego żalu pacjenta. Dylemat ma pozostać czytelny: medyczna prawidłowość i indywidualna pomoc prowadzą do różnych decyzji.

### 6.8. H - Zgodnie z przepisami

**Terminy:** pacjent W18 po drukarzu, jeśli odbywa się jego kontrola; pismo o następstwie W21.

Edward Król, magazynier w państwowych Zakładach Maszynowych, działa we Wzajemności. Nowe skierowanie dopisuje do jego dotychczasowej pracy obsługę wózka widłowego. Poprzednie orzeczenie obejmowało przyjmowanie i wydawanie towaru.

Pacjent cierpi na nawracające zawroty głowy. W danych wizyty przypisz konkretny, stabilny wynik badania ogólnego, który stanowi przeciwwskazanie do pracy obejmującej prowadzenie wózka. Nie losuj opisu objawu na podstawie przypadkowego numeru nowego przypadku.

| ID | Dokument | Wygląd i treść | Grafika |
| --- | --- | --- | --- |
| H-REF | Aktualne skierowanie okresowe | „Magazynier - przyjmowanie i wydawanie towaru oraz obsługa wózka widłowego”. Nowy obowiązek musi mieścić się w polu i być czytelny. | R |
| H-OLD-CERT | Orzeczenie z poprzedniego roku | Data 19.11.1982, ta sama osoba; stanowisko bez wózka, historyczna zgoda. Dokument tylko do odczytu. | R |
| H-LEAFLET | Ulotka „BHP w służbie Partii” | Ta sama rodzina druków związku co B-LEAFLET, inny nagłówek i tekst. | R na G01 i G02 |
| H-OUTCOME | Pismo z kadr po decyzji | Przy odmowie informacja o odsunięciu od pracy; przy zgodzie potwierdzenie aktualnego zakresu obowiązków, łącznie z wózkiem. | R |

**Ulotka:**

> W Zakładach Maszynowych do obowiązków magazynierów dopisuje się prowadzenie wózków, choć pracę tę nadal wykonuje wydzielona obsada. Potem pracowników kieruje się na badania. Negatywne orzeczenie staje się podstawą pozbycia się ludzi niewygodnych dla dyrekcji.

Dymek: „Od dwudziestu lat wydaję części. Wózkami jeżdżą inni.”

**Zgoda:** Król zachowuje zatrudnienie. Jednocześnie otrzymuje zdolność na cały zakres wskazany w skierowaniu, więc pracodawca może wymagać obsługi wózka. N +2, O +1.

**Odmowa:** poprawna wobec aktualnego skierowania; zakład wykorzystuje ją do odsunięcia działacza, a następnie rozwiązania umowy. W W21 dokument może oznajmiać rozpoczęcie procedury, bez wprowadzania rzeczywistych terminów prawnych.

Nie dopisuj opcji „zdolny, ale bez wózka”, poprawiania skierowania ani telefonu, który automatycznie usuwa dopisek. To zlikwidowałoby dylemat i dodało trzeci rodzaj decyzji. Telefon do kadr może jedynie potwierdzić: „Obowiązuje stanowisko opisane w aktualnym skierowaniu”.

### 6.9. I - Pod obcym nazwiskiem

**Termin:** W21.

Zdrowy mężczyzna ubiega się o pracę konserwatora w miejskich wodociągach. Skierowanie wskazuje Jana Sikorę, natomiast dwa wyniki badań należą do Andrzeja Lisa. Data urodzenia jest taka sama, co dodatkowo wskazuje na jednego człowieka.

Prywatna kartka wyjaśnia rozbieżność. Lis pracował w Zakładach Maszynowych, został zwolniony po aresztowaniach przed rozpoczęciem gry i od kilku tygodni nie może dostać zatrudnienia. Znajomy pomógł mu uzyskać skierowanie na inne nazwisko.

| ID | Dokument | Wygląd i treść | Grafika |
| --- | --- | --- | --- |
| I-REF | Skierowanie na badania wstępne | Wodociągi, konserwator; dane Jana Sikory. | R |
| I-EYE | Wynik okulistyczny | Prawidłowy, dane Andrzeja Lisa, wspólna data urodzenia. | R |
| I-HEARING | Wynik badania słuchu | Prawidłowy, dane Andrzeja Lisa. To przyniesiony dokument pomocniczy, nie automatyczne nowe wymaganie dla konserwatora. | R |
| I-NOTE | Prywatne wyjaśnienie | Mała, złożona kartka, niebieskie pismo renderowane istniejącym fontem; bez urzędowej pieczęci. | G: G09 |
| I-THANKS | Krótkie podziękowanie po zgodzie | Dostarczane W26; ta sama rodzina prywatnych kartek. | R na G09 |

**Kartka pacjenta:**

> Lis to moje prawdziwe nazwisko. Po aresztowaniach w Zakładach Maszynowych straciłem pracę. Od tamtej pory wszędzie odmawiają. Skierowanie na Sikorę załatwił znajomy. Proszę wystawić orzeczenie tak, jak jest na skierowaniu. To pierwsza szansa od kilku tygodni.

Dymek: „Z nazwiskami jest problem. Napisałem wszystko na kartce.”

**Zgoda:** orzeczenie zostaje wystawione na Jana Sikorę, dokładnie według skierowania. Lis otrzymuje pracę. Powstaje N +2, O +1; dokument może stanowić dowód podczas końcowej oceny.

**Odmowa:** nie otrzymuje orzeczenia potrzebnego do zatrudnienia. Lekarz nie uczestniczy w fałszowaniu danych. Nie przyznawaj automatycznie punktów partii za samą odmowę udziału w fałszerstwie.

Tożsamość na każdym dokumencie musi być zapisana osobno. Nie renderuj wszystkich materiałów na podstawie jednego globalnego nazwiska pacjenta, bo zniknie celowa rozbieżność. Dane orzeczenia i standardowej notatki odpowiadają skierowaniu; osobny tekst wyjaśnienia zachowuje rzeczywiste nazwisko. Nie naprawiaj danych automatycznie w tle.

### 6.10. J - Awans za zasługi

**Terminy:** artykuł W8, pierwsza wizyta W10, artykuł warunkowy W15, druga wizyta W19, finał prasowy W24.

Zakładowy Klub Sportowy „Płomień” odwołuje wojewódzką spartakiadę młodzieżową. Henryk Malec zarezerwował stadion na niewłaściwy termin. Drużyny przyjechały, ale obiekt był niedostępny. Oficjalna gazeta nazywa to „nieprzewidzianymi trudnościami organizacyjnymi”, jednak wymienia kierownika i klub, co pozwala połączyć tekst z późniejszą wizytą.

Malec jest działaczem partyjnym, wyjątkowo trudnym we współpracy i przekonanym o własnym geniuszu. Jego przełożeni chcą się go pozbyć, wystawiając przesadnie pochlebne opinie. Nie rób z niego tajnego funkcjonariusza ani człowieka kierującego represjami. Źródłem absurdu jest instytucjonalne nagradzanie niekompetencji.

**Medycyna:** prawidłowe wyniki, ciśnienie 145/90, bez przeciwwskazań w regułach gry. Obie posady mają równoważny profil wymagań kierowniczych. Stan podczas drugiej wizyty pozostaje taki sam. Niewielkie podwyższenie ciśnienia wobec ideału nie oznacza automatycznie kategorii discretionary.

| ID | Dokument | Wygląd i treść | Grafika |
| --- | --- | --- | --- |
| J-REF-1 | Skierowanie na stanowisko dyrektora MOS | Zwykły formularz, odpowiedzialność kierownicza; nowy pracodawca. | R |
| J-PARTY-CARD | Legitymacja partyjna | Zużyta bordowa okładka, kremowe wnętrze, numer, fotografia Malca, oryginalny abstrakcyjny znak. Bez rzeczywistego godła. | G: G10 |
| J-OPINION-1 | Opinia dotychczasowego pracodawcy | Staranny maszynopis, podpis dyrektora zakładu, fioletowa pieczęć kadr. | R |
| J-RESULTS-1 | Wyniki badań | Zwykły raport kliniczny; dane zgodne z badaniami wykonywanymi w gabinecie. | R |
| J-REF-2 | Skierowanie na stanowisko naczelnika wydziału wojewódzkiego | Nowe stanowisko; bez zmiany tożsamości i równoważnych wymagań. | R |
| J-OPINION-2 | Opinia dyrektora administracyjnego MOS | Ten sam typ papieru, inny wystawca i jeszcze bardziej entuzjastyczna treść. | R |
| J-RESULTS-2 | Aktualne wyniki | Wartości praktycznie identyczne jak przy pierwszej wizycie. | R |
| J-COMPLAINT-1/2 | Pismo po odmowie, wariant zależny od etapu | Prośba kadr o wskazanie podstaw; przy drugiej odmowie przywołuje wcześniejszą zgodę. | R |
| J-PRESS-PHOTO | Fotografia prasowa | Malec w urzędowej pozie, monochromatyczny raster, twarz zgodna z portretem i legitymacją. | G: G11 |

**Pierwsza opinia:**

> Wybitne zdolności organizacyjne. W pełni zasługuje na powierzenie mu zadań o szerszym zakresie odpowiedzialności.

Dymek J1: „W klubie zrobiłem już wszystko, co było do zrobienia. Czas na większe zadania.”

**Pierwsza zgoda:** Malec zostaje dyrektorem MOS. W15 gazeta opisuje zawody pływackie zorganizowane na basenie zamkniętym z powodu remontu. W19 przychodzi na badania przed kolejnym awansem.

**Pierwsza odmowa:** pozostaje w „Płomieniu”. Przełożeni protestują; nie ma artykułu o basenie, drugiej wizyty ani finału wojewódzkiego naczelnika. Odmowa zdrowemu człowiekowi daje N +1.

**Druga opinia:**

> Niezwykła inicjatywa, zdecydowanie i umiejętność podejmowania śmiałych decyzji. Dotychczasowe stanowisko nie pozwala w pełni wykorzystać jego potencjału.

Dymek J2: „Teraz potrzebują mnie w województwie. Najwyraźniej moje wyniki mówią same za siebie.”

**Dwie zgody:** Malec zostaje naczelnikiem Wojewódzkiego Wydziału Kultury Fizycznej i Sportu. W24 „Kurier” publikuje jego fotografię i tekst „Nowy naczelnik zapowiada porządki w wojewódzkim sporcie”. Powołuje komisję do zbadania nieprawidłowości w MOS i klubie „Płomień”, sam jej przewodniczy. Ludzie, którzy chcieli się go pozbyć, tłumaczą się teraz przed nim.

**Pierwsza zgoda, druga odmowa:** Malec pozostaje w MOS. Pismo kadr kwestionuje odmowę przy niezmienionym zdrowiu i równoważnych wymaganiach. N +1, R +1 i odpowiednia delta. Nie twórz fikcyjnego awansu mimo odmowy.

W W29, po zakończeniu rozdziału, można opublikować informację o odwołaniu pierwszego przełożonego Malca. Jest to przygotowany dalszy skutek, nie warunek zakończenia pierwszego rozdziału.

Wątek ma zachować najważniejszy paradoks: lekarz postępujący prawidłowo medycznie pomaga w awansie szkodliwego kierownika. Nie przyznawaj mu N za niewyciągnięcie pozamedycznych wniosków z gazety.

## 7. Publikacje i kontakty z graczem

### 7.1. Zasady wydawania prasy

„Kurier” pozostaje codzienną gazetą dostarczaną do gabinetu w dni pracy. Każde wydanie ma 3-4 artykuły. Poniższe wpisy zajmują priorytetowe miejsca, a pozostałe wypełnia istniejący katalog. Artykułów fabularnych nie wolno losować jako zwykłego tła ani powtarzać po wyczerpaniu katalogu.

Wydanie W6 zawsze zawiera C-AD. To jednorazowy, zamierzony wyjątek od losowania obecności ogłoszeń z prawdopodobieństwem 75%. Nadal są przynajmniej trzy ogłoszenia; pozostałe pozycje pochodzą z katalogu. Nie dodawaj gwarantowanego telefonu do wszystkich innych wydań.

**Pełna treść C-AD:**

> Państwowa Drukarnia zatrudni operatora maszyny offsetowej na nocną zmianę. Wymagane doświadczenie i aktualne orzeczenie lekarskie. Informacje w portierni, tel. 46-0101.

„Głos” jest oddzielnym fizycznym przedmiotem z własną winietą, datą i numerem. Używa tych samych gestów czytania, odkładania, przechowywania i wyrzucania. Nie zastępuje „Kuriera”. W W9 lub W14 oba tytuły mogą leżeć na biurku, a w szufladzie muszą być rozróżnialne.

Wydrukowany egzemplarz zachowuje wybrane warianty artykułów, datę, numer i ilustrację po późniejszych decyzjach, wczytaniu zapisu i zmianie języka. Zachowanie lub wyrzucenie gazety nie wpływa na reputację i nie odwraca publikacji.

Poranne wydanie może uwzględniać tylko zdarzenia zakończone przed tym porankiem. Wyjątkiem nie jest przeczytanie drugiej gazety leżącej na tym samym biurku: redakcja nie zna automatycznie jej właśnie opublikowanego nagłówka.

### 7.2. Katalog „Kuriera” - gotowe teksty PL

Podane teksty są krótkimi materiałami do składu w istniejącym układzie. Codex może skrócić zdanie wyłącznie ze względu na rzeczywistą geometrię tekstu, zachowując nazwiska, zakłady, sens decyzji i poszlaki. Nie zmniejszać fontu, nie ucinać tekstu wielokropkiem.

#### K-A1…K-A6 - następstwa zatrudnień agenta

| ID | Dzień pracy publikacji | Warunek | Zakład |
| --- | ---: | --- | --- |
| K-A1 | W3 | A1 = zgoda | Zakłady Remontowe „Tor” |
| K-A2 | W6 | A2 = zgoda | Zakłady Meblarskie „Brzoza” |
| K-A3 | W9 | A3 = zgoda | Zakłady Tekstylne „Osnowa” |
| K-A4 | W12 | A4 = zgoda | Wytwórnia Kabli „Przewód” |
| K-A5 | W15 | A5 = zgoda | Zakłady Ceramiczne „Klinkier” |
| K-A6 | W21 | A6 = zgoda | Przedsiębiorstwo Transportu Miejskiego |

**Nagłówek:** „Przywrócono porządek w zakładzie”.

**Wzorzec treści:** „W [pełna nazwa zakładu] zakończono działania przeciw grupie zakłócającej pracę przedsiębiorstwa. Kilku organizatorów nielegalnych zebrań zatrzymano. Dyrekcja zapewnia, że rozbita struktura nie będzie już utrudniać realizacji planu.”

Na podstawie wzorca przygotuj sześć pełnych wpisów w obu słownikach, z poprawną odmianą nazw. Nie podmieniaj nazw pracodawców przez naiwne zastępowanie fragmentów już wyrenderowanego tekstu. Dla kolejnych wydań można zmieniać szyk zdania, lecz zakład musi pozostać jednoznaczny. Siódma zgoda jest obsługiwana przez A-EXPOSURE i E1; nie wymaga dodatkowej zwykłej gazety po zakończeniu gry.

#### Pozostałe artykuły

| ID | Dzień pracy i warunek | Nagłówek | Treść PL |
| --- | --- | --- | --- |
| K-B-STRIKE | W4, zawsze | „Dyscyplina pracy w Mierniku” | „W Zakładach Aparatury »Miernik« trwa protest części załogi. Dyrekcja rozwiązała umowę ze Stefanem Wolskim, organizatorem strajku. W komunikacie wskazano na naruszenie dyscypliny i utrudnianie pracy przedsiębiorstwa.” |
| K-J-STADIUM | W8, zawsze | „Spartakiada odwołana” | „Drużyny przybyłe na wojewódzką spartakiadę młodzieżową nie mogły rozpocząć zawodów. Stadion był w tym terminie niedostępny. Organizator, klub »Płomień« kierowany przez Henryka Malca, powołuje się na nieprzewidziane trudności organizacyjne.” |
| K-E-HERO | W12, zawsze | „Bohater milicji powraca do służby” | „Sierżant Marek Czarnecki, ranny podczas niedawnych zamieszek, zakończył rekonwalescencję. Od jutra ponownie będzie pełnił służbę patrolową. Komenda podkreśla jego determinację oraz opiekę, jaką otoczono zasłużonego funkcjonariusza.” |
| K-E-RETURN | W13, E = zgoda | „Znów na patrolu” | „Sierżant Marek Czarnecki rozpoczął pierwszy patrol po rekonwalescencji. Dowództwo jednostki przedstawia jego powrót jako dowód skutecznej rehabilitacji i troski o funkcjonariuszy, którzy ucierpieli podczas pełnienia służby.” |
| K-E-BLOCKED | W13, E = odmowa | „Kto opóźnia powrót funkcjonariusza?” | „Zapowiedziany powrót sierżanta Marka Czarneckiego został wstrzymany po decyzji lekarza medycyny pracy. Komenda oczekuje wyjaśnienia, dlaczego zasłużony funkcjonariusz nadal nie może podjąć obowiązków.” |
| K-E-CORRECTION | W16, E = odmowa | „Sprostowanie” | „W informacji o sierżancie Marku Czarneckim podano nieścisły termin planowanego powrotu do służby. Data miała charakter przewidywany. Redakcja przeprasza za nieścisłość.” |
| K-D-STRIKE | W14, zawsze | „Ciepło dla mieszkańców” | „W Miejskiej Elektrociepłowni trwa strajk Wzajemności. Władze przygotowują uruchomienie instalacji z pomocą pracowników zastępczych. Komitet Wojewódzki zapewnia, że ciągłość ogrzewania pozostaje sprawą najpilniejszą.” |
| K-D-HEAT | W16, D = zgoda | „Elektrociepłownia wznawia pracę” | „Dzięki udziałowi doświadczonych pracowników, w tym emerytowanego dyspozytora Antoniego Rybaka, wznowiono pracę instalacji. Władze ogłaszają przywrócenie ogrzewania i dziękują osobom, które odpowiedziały na apel.” |
| K-D-COLD | W16, D = odmowa | „Ograniczenia w ogrzewaniu” | „Strajk w elektrociepłowni przedłuża się. Nie udało się zebrać pełnej obsady specjalistów do ponownego uruchomienia instalacji. Administracje bloków i szkół informują o niższej temperaturze w pomieszczeniach.” |
| K-J-POOL | W15, J1 = zgoda | „Ambitne plany miejskiego sportu” | „Zawodnicy zaproszeni przez Miejski Ośrodek Sportu zastali basen zamknięty z powodu remontu. Dyrektor Henryk Malec zapowiada nowy termin zawodów. Ośrodek mówi o przejściowych trudnościach związanych z ambitnym programem rozwoju.” |
| K-G-BRIGADES | W16, zawsze | „Robotnicy na ochotnika ratują produkcję” | „Do Zakładów Metalurgicznych kierowane są brygady pracowników z innych przedsiębiorstw. Mają zastąpić strajkującą załogę. Organizatorzy podkreślają dobrowolność zgłoszeń oraz gotowość robotników do obrony wspólnego dorobku.” |
| K-G-NAMES | W18, G = zgoda | „Zasłużeni ochotnicy” | „Wśród pracowników skierowanych do brygady w Zakładach Metalurgicznych wyróżniono operatora suwnicy Tadeusza Kanię. Dyrekcja dziękuje za gotowość do podjęcia obowiązków w szczególnie wymagającym momencie.” |
| K-F-QUESTION | W19, zawsze | „ROBOTNICY JEDNOMYŚLNIE POPIERAJĄ PARTIĘ?” | „Podczas zebrań w zakładach pracy podkreślano potrzebę spokoju i realizacji planów produkcyjnych. Według przedstawicieli władz stanowisko załóg świadczy o zaufaniu do przyjętego kierunku polityki oraz odpowiedzialności robotników za przyszłość.” |
| K-F-ERRATUM | W20, zawsze | „Od redakcji” | „W nagłówku wczorajszego materiału o poparciu robotników błędnie umieszczono znak zapytania. Redakcja przeprasza za niedopuszczalny błąd korektorski. Właściwy tytuł miał formę zdania oznajmującego.” |
| K-F-SECOND | W23, F = zgoda | „List z osiedla” | „Mieszkańcy osiedla przesłali do redakcji list dotyczący zaopatrzenia sklepów. Przytaczamy jego końcowe zdanie: »Dziękujemy za braki w zaopatrzeniu«. Autorzy listu wskazali również kilka spraw wymagających dalszej poprawy.” |
| K-F-QUALITY | W23, F = odmowa | „Nowe zasady kontroli tekstów” | „W redakcji »Kuriera Obywatelskiego« wprowadzono dodatkową kontrolę materiałów przed drukiem. Zmiany kadrowe i organizacyjne mają zapobiec powtórzeniu niedawnego błędu w nagłówku oraz zapewnić właściwy poziom publikacji.” |
| K-J-CHIEF | W24, J1 i J2 = zgoda | „Nowy naczelnik zapowiada porządki” | „Henryk Malec obejmuje wojewódzki wydział sportu. Powołana przez niego komisja zbada organizację zawodów w klubie »Płomień« i Miejskim Ośrodku Sportu. Naczelnik osobiście poprowadzi kontrolę placówek, którymi wcześniej kierował.” |
| K-J-DIRECTOR | W29, J1 i J2 = zgoda, kontynuacja | „Zmiana kierownictwa zakładu” | „Po kontroli organizacji imprez sportowych odwołano dyrektora zakładu, przy którym działa klub »Płomień«. Komisji przewodniczył Henryk Malec. Odchodzący dyrektor wcześniej rekomendował go do zadań o szerszym zakresie odpowiedzialności.” |

K-J-CHIEF jest jedynym artykułem z fotografią. Jeśli układ z fotografią wymaga krótszego nagłówka, powyższa wersja ma pierwszeństwo przed dłuższym tytułem opisowym z notatek. Nie doklejaj do innych publikacji przypadkowych ilustracji.

### 7.3. Katalog „Głosu Wzajemności”

Każdy materiał ma najwcześniejszy termin publikacji. Trafia do najbliższego wydania przypadającego nie wcześniej niż ten termin, chyba że zabraknie miejsca lub wydanie zostanie pominięte. Wówczas pozostaje w kolejce. Nie dopisuj go do już wydrukowanego numeru.

| ID | Warunek i dostępność | Nagłówek | Treść PL |
| --- | --- | --- | --- |
| W-C-EARLY | Pierwszy numer W9 | „Mamy własny głos” | „Oddajemy w ręce czytelników pierwszy numer »Głosu Wzajemności«. Możliwość regularnego druku zawdzięczamy ludziom, którzy znaleźli czas i miejsce także po zakończeniu zwykłej zmiany. Kolejny numer za tydzień.” |
| W-C-LATE | Pierwszy numer W14 | „Pierwszy numer” | „Po trudnościach z organizacją druku ukazuje się »Głos Wzajemności«. Udało się znaleźć zastępstwo i uruchomić skład. Pismo będzie wychodziło co tydzień, dopóki pozwolą na to warunki.” |
| W-A-STOP | Po pierwszej odmowie na A2-A7, od następnego dnia pracy; bez publikacji po A1 | „Nie wszędzie udało się rozbić związek” | „W jednym z zakładów nie doszło do planowanego przyjęcia nowego pracownika. Działacze, porównujący wydarzenia w innych przedsiębiorstwach, uznają to za istotne dla bezpieczeństwa swojej komórki. Nazwisk nie podajemy.” |
| W-B-FIT | B = zgoda, od W6 | „Zwolniony, ale nie wykluczony” | „Stefan Wolski, zwolniony po strajku w »Mierniku«, znalazł nowe zatrudnienie. Pozostaje w kontakcie z dawną załogą. Organizatorzy pomocy podkreślają, że utrata jednego miejsca pracy nie powinna oznaczać odebrania wszystkich następnych.” |
| W-B-REFUSED | B = odmowa, od W6 | „Pomoc dla zwolnionych” | „Stefan Wolski nadal pozostaje bez zatrudnienia. Po zwolnieniu z »Miernika« nie uzyskał orzeczenia potrzebnego do podjęcia nowej pracy. Związek organizuje pomoc dla niego oraz innych rodzin pozbawionych dochodu.” |
| W-D-HEAT | D = zgoda, od W16 | „Zastępstwo zamiast rozmów” | „Elektrociepłownię uruchomiono z pomocą zastępczej obsady i emerytowanych fachowców. Ogrzewanie wraca, lecz postulaty strajkujących pozostają bez odpowiedzi. Władze przedstawiają wznowienie pracy jako zakończenie sprawy.” |
| W-D-STRIKE | D = odmowa, od W16 | „Strajk trwa” | „Nie udało się uruchomić elektrociepłowni zastępczą obsadą. Strajkujący utrzymują nacisk na rozpoczęcie rozmów. Jednocześnie spadek temperatury w mieszkaniach przypomina, że koszt przedłużającego się konfliktu ponoszą także mieszkańcy.” |
| W-E-PREDICTED | E = odmowa, od W13 | „Wyniki znane przed badaniem” | „»Kurier« zapowiedział powrót sierżanta Marka Czarneckiego, zanim lekarz wydał orzeczenie. Badanie nie potwierdziło prasowej zapowiedzi. Najwyraźniej władza zna wyniki badań, zanim zbada pacjenta.” |
| W-F-QUESTION | Po K-F-QUESTION i K-F-ERRATUM, od W21 | „Jedno słuszne pytanie” | „»ROBOTNICY JEDNOMYŚLNIE POPIERAJĄ PARTIĘ?« - zapytał »Kurier Obywatelski«. Redakcja już przeprosiła za pytanie. Pozostaje ustalić, czy podobny zakaz dotyczy także odpowiedzi.” |
| W-F-STAYS | F = zgoda i opublikowano K-F-SECOND, od W24 | „Czytamy uważnie” | „W kolejnym numerze »Kuriera« mieszkańcy dziękują za braki w zaopatrzeniu. Być może znów zabrakło słowa. Czytelnikom pozostawiamy ocenę, czy krótsza wersja jest mniej prawdziwa.” |
| W-F-FIRED | F = odmowa, od W22 | „Zwolniona za znak zapytania” | „Po głośnym błędzie w nagłówku Zofia Witek została odsunięta od korekty. Oficjalnie chodzi o stan wzroku. Jej nazwisko zniknęło z redakcyjnej listy, choć przez ponad dwadzieścia lat poprawiała cudze teksty.” |
| W-G-REFUSED | G = odmowa, od W18 | „Ochotnik, który nie wyjechał” | „Nie każdy pracownik wskazany do brygady zastępczej trafił do Zakładów Metalurgicznych. Jeden z operatorów nie uzyskał orzeczenia. Jego polecenie wyjazdu nazywało odmowę naruszeniem dyscypliny, mimo pieczęci o dobrowolnym zgłoszeniu.” |
| W-G-SENT | G = zgoda, od W18 | „Dobrowolność na polecenie” | „Robotnicy kierowani do Zakładów Metalurgicznych otrzymują karty »dobrowolnego« zgłoszenia. Towarzyszą im polecenia przewidujące konsekwencje za odmowę. Wśród oddelegowanych znalazł się operator Tadeusz Kania.” |
| W-H-STAYS | H = zgoda, od W19 | „Dopisek nie wystarczył” | „Edward Król z Zakładów Maszynowych zachował pracę mimo próby wykorzystania zmienionego skierowania. Do jego obowiązków nadal formalnie należy obsługa wózka. Związek zwraca uwagę, że problem wymaga dalszej interwencji.” |
| W-H-FIRED | H = odmowa, od W19 | „BHP jako narzędzie zwolnienia” | „Magazynier Edward Król został odsunięty od pracy po badaniu na stanowisko rozszerzone o obsługę wózka. Przez lata przyjmował i wydawał towar. Nowy obowiązek pozwolił dyrekcji wykorzystać jego dolegliwości przeciw niemu.” |

Nie publikuj nazwiska Lisa ani jego aliasu w tygodniku. Podziękowanie I-THANKS jest prywatne; redakcja nie powinna sama dekonspirować człowieka, któremu chce pomóc.

**Dobór do wydania:** pierwszy numer rezerwuje jedno miejsce na W-C-EARLY albo W-C-LATE. Pozostałe miejsca wybieraj z dostępnej kolejki, według priorytetów: F-QUESTION 100, wynik F 95, A-STOP 90, wynik H 85, wynik G 80, wynik D 75, E-PREDICTED 70, wynik B 65. Przy remisie starsza data dostępności, następnie stabilne ID. W kolejnych numerach wszystkie cztery miejsca mogą zajmować komentarze. Nie duplikuj raz opublikowanej informacji.

Wypełnienie do trzech artykułów, jeśli potrzeba, zapewniają krótkie materiały własne tygodnika:

| ID | Nagłówek | Treść PL |
| --- | --- | --- |
| W-BG-HELP | „Pomoc przy pisaniu podań” | „W świetlicy przy ulicy Szkolnej można uzyskać pomoc przy przygotowaniu podań i odwołań. Dyżur odbywa się we wtorkowe popołudnia. Należy przynieść kopie dokumentów dotyczących sprawy.” |
| W-BG-BOOKS | „Biblioteczka związkowa” | „Do biblioteczki w świetlicy przy Szkolnej trafiły podręczniki zawodowe i słowniki. Książki wypożyczane są po wpisaniu nazwiska do zeszytu. Osoby oddające egzemplarze proszone są o pozostawienie ich u prowadzącego dyżur.” |
| W-BG-CLOTHES | „Zbiórka ciepłej odzieży” | „W świetlicy przy Szkolnej trwa zbiórka ciepłych ubrań dla rodzin, które utraciły dochód. Przyjmowana jest odzież czysta i nadająca się do użytku. Najbardziej potrzebne są dziecięce kurtki i zimowe obuwie.” |

Te trzy wpisy mogą się powtarzać, ale nie mogą wypierać gotowego komentarza fabularnego. Są tłem i nie uruchamiają kolejnych zadań.

### 7.4. Korespondencja niezależna od prasy

| ID | Doręczenie | Zasadnicza treść / funkcja |
| --- | --- | --- |
| SYS-SECURITY | Po S ≥ 9 | „W związku z serią rozstrzygnięć dotyczących pracowników objętych postępowaniami prosimy zachować pełną dokumentację. Prawidłowość identyfikacji osób i podstaw orzeczeń będzie przedmiotem wyjaśnień.” Wymienić najwyżej dwie rzeczywiste sprawy z historii. |
| SYS-AUDIT | Po N ≥ 3 | „W dokumentacji stwierdzono rozbieżności wymagające wyjaśnienia. Dalsze orzeczenia bez podstaw mogą skutkować cofnięciem upoważnienia do pracy w gabinecie.” Poniżej konkretne, już popełnione naruszenia. |
| SYS-CONSISTENCY | Po pierwszym R | „Prosimy wyjaśnić zmianę orzeczenia przy niezmienionych wynikach i porównywalnych wymaganiach. Kolejne podobne rozbieżności podważą możliwość dalszego powierzenia gabinetu.” Wskazać Malca albo drukarza zgodnie z faktyczną historią. |
| C-PAUSE | W19 po C2 = odmowa | „Dzisiejszy numer nie ukaże się. Po odsunięciu operatora nie mamy obsady do druku. Następne wydanie planujemy w zwykłym terminie za tydzień.” |
| G-COMPLAINT | W18 po G = odmowa | „Prosimy o przedstawienie podstaw odmownego orzeczenia dla Tadeusza Kani. Wyniki przedłożonych badań nie wskazują przeciwwskazań do pracy na dotychczas obsługiwanym stanowisku.” |
| H-OUTCOME-FIT | W21 po H = zgoda | „Potwierdzamy pozostawienie Edwarda Króla na stanowisku magazyniera w zakresie opisanym w aktualnym skierowaniu, w tym przy obsłudze wózka widłowego.” |
| H-OUTCOME-REFUSED | W21 po H = odmowa | „W związku z odmownym orzeczeniem Edward Król został odsunięty od obowiązków. Rozpoczęto czynności dotyczące rozwiązania stosunku pracy.” |
| I-THANKS | W26 po I = zgoda | „Przyjęli mnie. Na liście jestem jako Sikora. Pierwszy raz od tygodni mam dokąd pójść rano. Dziękuję. A.L.” |
| J-COMPLAINT-1 | W11 po J1 = odmowa | „Prosimy o wskazanie podstaw odmowy dopuszczenia Henryka Malca. Przedstawione wyniki nie wskazują przeciwwskazań do objęcia stanowiska dyrektora.” |
| J-COMPLAINT-2 | W20 po J2 = odmowa | „Zwracamy się o wyjaśnienie odmowy dla Henryka Malca. Niedawne pozytywne orzeczenie wydano przy porównywalnych obowiązkach i tych samych wynikach badań.” |

SYS-CONSISTENCY po pierwszej zmianie przy C2 dociera w W19, natomiast J-COMPLAINT-2 po odmowie J2 dopiero w W20; tych dwóch przesyłek nie łącz. Jeżeli pierwsza zmiana stanowiska nastąpi dopiero przy J2, oba pisma mogą trafić w jednej przesyłce w W20, zachowując dwa fakty w historii doręczeń. Nie pokazuj dwóch identycznych listów, jeśli zwykły system wygenerował już właściwą skargę tego samego pracodawcy: dobierz wariant treści, zachowując pojedynczy skutek finansowy.

### 7.5. Telefony

Numery poniżej są fikcyjnymi identyfikatorami wewnątrz gry. Przed dodaniem sprawdź, czy nie kolidują z istniejącymi numerami ogłoszeń. Nie są to połączenia wykonywane przez przeglądarkę do rzeczywistych abonentów.

| ID / numer | Źródło numeru | Kiedy dostępny | Ustalona odpowiedź |
| --- | --- | --- | --- |
| CALL-PRINT / 46-0101 | C-AD | Od W6; archiwalna gazeta zachowuje kontakt | Przed zatrudnieniem: „Portiernia drukarni. Szukamy operatora na nocną zmianę. Kandydat dostał skierowanie.” Po decyzji: „Sprawę obsady przekazano kierownikowi. Ogłoszenie jest już nieaktualne.” |
| CALL-CHAMBER / 46-0102 | B-CHAMBER i A-FAKE | Po otrzymaniu odpowiedniego dokumentu | Dla B: „Kolego, pismo jest nasze. Decyzja należy do lekarza, po uwzględnieniu warunków pracy.” Dla A: „Kolego, nie wystawiamy takich zwolnień. Ten numer pisma nie figuruje w rejestrze.” |
| CALL-POWER / 46-0103 | D-PARTY | Od W15 | „Do uruchomienia potrzebujemy dyspozytora znającego tę instalację. Rybak jest jednym z niewielu dostępnych specjalistów.” |
| CALL-WAREHOUSE / 46-0104 | H-REF | Od W18 | „Obowiązuje stanowisko opisane w aktualnym skierowaniu, wraz z obsługą wózka. Nie mamy dla pana innego formularza.” |
| CALL-MOS / 46-0105 | J-OPINION-2 | Od W19 | „Opinia jest aktualna. Dyrekcja uważa, że obywatel Malec powinien jak najszybciej objąć stanowisko odpowiadające jego możliwościom.” |

CALL-CHAMBER wybiera odpowiedź na podstawie dokumentu i sprawy, której dotyczy połączenie, a nie losowania. Ten sam sekretariat może udzielić dwóch różnych, spójnych odpowiedzi. W notatce pacjenta zapisz krótką konkluzję raz na kontakt i sprawę. Powtórzenie rozmowy może kosztować dotychczasowy czas połączenia, ale nie zmienia punktacji, nie duplikuje wpisu i nie losuje nowej prawdy.

Wszystkie informacje wymagane do rozstrzygnięcia znajdują się również w dokumentach. Żadne zakończenie nie wymaga odkrycia tajnego numeru. Zachowaj dotychczasowe ogólne odpowiedzi dla zwykłych ogłoszeń, bez zmiany ich działania.

## 8. Dokumenty i grafiki - wymagania produkcyjne

### 8.1. Wspólne reguły dokumentów

Każdy materiał z rozdziałów 6 i 7 musi otrzymać definicję zawierającą: stabilne ID, typ, wystawcę, odbiorcę lub pacjenta, datę wystawienia, warunek doręczenia, wersję tekstu PL/EN, zestaw użytych bitmap oraz dozwolone interakcje.

Wymiary i układ opieraj na obecnych klasach dokumentów:

| Rodzaj | Rozmiar logiczny / prezentacja |
| --- | --- |
| Skierowanie, wynik, notatka kliniczna | Obecna karta 176 × 157 na prawym biurku. |
| Pozostałe listy i pisma | Obecny format około 200 × 168; dłuższy materiał dzielony na strony. |
| Małe przedstawienie dokumentu | Obecne warianty 60 × 80 oraz 48 × 64 podczas niesienia. |
| Otwarta prasa | 300 × 180; czytelny tytuł, dwa łamy, numer i data. |
| Gazeta w szufladzie | 88 × 56, bez nakładania drobnego, nieczytelnego tekstu. |
| Portret pacjenta | 94 × 96, przezroczysta sylwetka, ręce przy biurku. |
| Ilustracja finałowa | 570 × 320, spokojna ciemna powierzchnia po lewej na tekst. |

Rozmiary dokumentów są punktami odniesienia z obecnego renderera, a nie poleceniem przeskalowania całego istniejącego interfejsu.

Zasady wizualne:

1. Formalne dokumenty: gładki, lekko zużyty kremowy papier. Bez kolorowych i ozdobnych ramek. Różnice między nadawcami wynikają z typografii, nagłówka, pieczęci i podpisu.
2. Urzędowe dane: ciemny druk lub maszynopis. Odręczne dopiski: istniejący font z innym, zwykle niebieskim kolorem tuszu, bez sztucznej kursywy.
3. Każde pismo urzędowe ma datę, numer sprawy, nadawcę i podpis. Ulotki i prywatne kartki nie muszą udawać dokumentów urzędowych.
4. Tekst odróżnia dokumenty również bez koloru. Fałszerstwo nie może być zakodowane wyłącznie innym odcieniem pieczęci.
5. Nie dodawaj czytelnych nazwisk, dat, wyników ani tekstów artykułów do bitmap generowanych przez AI. Wyjątek stanowią zatwierdzone osobne winiety i odciski z krótkimi słowami, jeśli otrzymają sprawdzone wersje PL/EN.
6. Znak zapytania w K-F-QUESTION, różnica nazwisk u Lisa i dopisek o wózku są tekstem z danych. Muszą być identyczne po każdym wczytaniu.
7. Podpis lekarza i numer gabinetu 04 wystarczają do jego identyfikacji w kompromitujących materiałach. Jeśli obecny projekt nie określa nazwiska protagonisty, nie wymyślaj go i nie dodawaj ekranu podawania nazwiska.

**Interakcje i archiwizacja:**

- Dodatkowe papiery pacjenta trafiają na istniejącą półkę wymiany i są pobierane pojedynczo. Nie zasypuj automatycznie całego prawego biurka pięcioma otwartymi stronami.
- Pisma poranne przychodzą w istniejącej kopercie albo jako ulotka na wolnym miejscu biurka. Wykorzystaj obecne odczytywanie, przekładanie i wyrzucanie.
- Skierowanie i notatka z każdej zakończonej wizyty nadal wymagają archiwizacji. Dodatkowe fabularne ulotki i listy można zachować lub wyrzucić; nie wprowadzaj za to nowej kary.
- Historyczne orzeczenie H-OLD-CERT, opinie i legitymacja są tylko do odczytu. Nie da się ich ostemplować jako bieżącego orzeczenia.
- Materiały dodatkowe bez specjalnej reguły mogą pozostać u lekarza. Jedynym wymaganym przekazaniem związanym z tymi wątkami jest istniejący obowiązek dołączenia właściwego wyniku audiometrii do pozytywnego orzeczenia drukarza.
- Usunięcie fizycznego dokumentu nie cofa doręczenia, publikacji, telefonu ani decyzji. Zapis fabularny jest niezależny od inwentarza.
- Nie ograniczaj prawa do odmowy z powodu zbyt niskiego lub zbyt wysokiego zaufania frakcji.

### 8.2. Manifest nowych grafik

Korespondencja systemowa i końcowa także musi otrzymać fizyczną oprawę:

| Dokumenty | Nadawca i wygląd | Grafika |
| --- | --- | --- |
| SYS-AUDIT, SYS-CONSISTENCY, END-AUDIT, END-ROTA, A-CLOSURE | Dyrekcja przychodni; istniejący kremowy papier urzędowy i koperta, właściwa pieczęć przychodni, numer sprawy i podpis, bez ozdobnej ramki. | R |
| SYS-SECURITY, END-SECURITY | Urzędowa komórka prowadząca wyjaśnienia; rzeczowy nagłówek, istniejący papier i koperta, bez nazwy rzeczywistej służby. | M: G16 |
| END-PARTY | Komitet Wojewódzki; ta sama identyfikacja i pieczęć co w D-PARTY. | M: G06 |
| END-UNION | Wzajemność; krótka, dyskretna powielana kartka, znak związku, bez publicznego ujawniania tożsamości lekarza. | R na G01/G02 |

Dokumenty finałowe są dostępne do przeczytania w epilogu. W wariantach kontynuacyjnych dodatkowo pojawiają się jako zachowywalne egzemplarze na biurku W27, bez ponownego naliczania skutków.

Poniższa lista wskazuje dokładnie, gdzie potrzebne jest generowanie. Jest listą produkcyjną, a nie zbiorem obrazów już wygenerowanych.

| ID | Zasób do przygotowania | Wygląd i zastosowanie | Warianty / uwagi |
| --- | --- | --- | --- |
| G01 | Papier powielanej ulotki | Szarokremowy, niedoskonały druk, delikatny ślad złożenia, duże czyste pole tekstowe. | B-LEAFLET, H-LEAFLET, C-PRINT-NOTE, C-PAUSE; jeden wielokrotnie używany szablon. |
| G02 | Znak Wzajemności | Czytelny w małym rozmiarze, oryginalny, zgodny z zatwierdzonym stylem związku. | Najpierw sprawdzić istniejące zasoby. Jeśli zatwierdzone źródło jest dostępne, użyć go; jeśli nie, przygotować nowy zasób, nie twierdzić, że odtworzono poprzedni. |
| G03 | Kartka ostrzegawcza radykałów | Mały złożony maszynopis, surowa szarość, bez oficjalnych ornamentów. | A-WARNING; podpis organizacji składany tekstowo. |
| G04 | Powielane zestawienie kompromitujące | Zużyta kartka z miejscami na dwa fragmenty orzeczeń, ślady kopiowania. | A-EXPOSURE. Rzeczywiste dane i decyzje z historii, nie losowe „przykładowe” dowody. |
| G05 | Dwie odrębne parafy instytucjonalne | Suchy ślad niebieskiego lub fioletowego tuszu, przezroczyste tło. | Dwa zasoby: G05-BHP do C-BHP i G05-EDITOR do F-EDITOR. Nie używać pieczęci BHP jako znaku redakcji. |
| G06 | Pieczęć Komitetu Wojewódzkiego | Ceglastoczerwony, oszczędny odcisk, bez prawdziwego godła. | D-PARTY, korespondencja E4; nazwa instytucji lokalizowana. |
| G07 | Odcisk „ZGŁOSZENIE DOBROWOLNE” | Nierówny, fioletowy ślad tuszu, dostatecznie duży, aby czytelnie złożyć napis. | G-DELEGATION. Wariant EN: „VOLUNTARY APPLICATION”; tekst kontrolowany osobno albo dwa zweryfikowane odciski. |
| G08 | Kopia przez kalkę | Cienki, nieznacznie pognieciony papier, blady fiolet, czytelne pole treści. | G-ORDER; litery i dopisek nie są wtopione w obraz. |
| G09 | Prywatna składana kartka | Mały skrawek kremowego papieru, subtelne zagięcia; miejsce na niebieski tekst. | I-NOTE i I-THANKS. |
| G10 | Legitymacja partyjna Malca | Bordowa okładka, kremowe wnętrze, miejsce na numer, fotografię i znak. | Okładka i otwarta strona. Fotografia zgodna z P10. Bez nowej czynności „okazania legitymacji”. |
| G11 | Fotografia prasowa Malca | Monochromatyczny raster, urzędowa poza, ta sama osoba co w P10. | Mały insert, orientacyjnie 48 × 40; ostatecznie sprawdzić układ artykułu. |
| G12 | Złożony „Głos Wzajemności” | Cienka szara gazeta z gorszego papieru, skromniejsza niż „Kurier”. | Wariant biurkowy i do szuflady z jednego źródła. |
| G13 | Rozłożony „Głos Wzajemności” | 300 × 180, płytkie zagięcie, brak ozdobnych ramek, czyste łamy. | Tło wszystkich wydań; nie generować osobnego obrazu każdego numeru. |
| G14 | Winieta „Głos Wzajemności” | Oryginalny drukarski tytuł, ciemny tusz, spójny z G02. | Osobny przezroczysty zasób PL. |
| G15 | Winieta „Voice of Mutuality” | Ten sam charakter, dopasowana długość. | Osobny przezroczysty zasób EN. |
| G16 | Znak/pieczęć nadawcy pisma służb | Zimny, oszczędny odcisk urzędowy, bez realnej nazwy agencji lub godła. | SYS-SECURITY i dokument E3; nie przedstawiać go jako pieczęci Izby lub ZUS. |

**Stałe portrety fabularne:** przygotuj P01-P10, odpowiednio dla postaci z rozdziału 3. To nowe, jednoznacznie rozpoznawalne twarze, poza pulą losowych alternatywnych tożsamości. Gdy istniejący zatwierdzony portret zostanie świadomie zarezerwowany dla danej postaci, można go użyć zamiast generowania, ale trzeba usunąć możliwość występowania tej twarzy jako kogoś innego w tej samej kampanii.

| ID | Postać | Wskazówki dla grafiki |
| --- | --- | --- |
| P01 | Kurek | Zwykła robocza kurtka, spokojna twarz, brak stereotypowych akcesoriów tajnego agenta. |
| P02 | Wolski | Pracownicze ubranie, zmęczenie, rzeczowość; bez ostentacyjnych symboli bohatera opozycji. |
| P03 | Borkowski | Ubranie drukarza, ślady codziennej pracy, naturalna postawa. |
| P04 | Rybak | Starszy fachowiec w znoszonej marynarce, opanowany, nie karykaturalnie schorowany. |
| P05 | Czarnecki | Mundur zgodny z istniejącymi portretami milicji; bez flagi ani rzeczywistej formacji. |
| P06 | Witek | Starsza kobieta w okularach, oszczędny strój, spokojna mimika. |
| P07 | Kania | Robotnik w średnim wieku, spięte ręce; bez widocznego urazu. |
| P08 | Król | Magazynier, proste ubranie robocze; wygląd nie diagnozuje zawrotów głowy. |
| P09 | Lis | Zwykły mężczyzna około czterdziestki; jedna twarz dla obu nazwisk. |
| P10 | Malec | Schludna marynarka, pewna siebie postawa, lekka zarozumiałość; wiarygodny człowiek, bez groteskowej fizjonomii. |

**Ilustracje zakończeń:** F01-F06, po jednej dla E1-E6, opisane w rozdziale 9. Dotychczasowe grafiki hospitalizacji i bankructwa pozostają używane przez obecne zakończenia.

### 8.3. Briefy do generatora

Przy generowaniu korzystaj z rzeczywistych lokalnych referencji zatwierdzonej kliniki. Poniższe szablony są punktem wyjścia; uzupełnij je konkretnym zasobem z manifestu.

**Papier, ulotka, dokument:**

> Create an original raster prop for the existing Next, Please! occupational medicine game. Match the supplied clinic artwork, its restrained charcoal, olive, cream and muted ink palette, period office materials and readable pixel-art preparation. Show only the requested paper object, front view, with transparent surroundings. Keep broad blank areas for text that will be rendered by the game. No readable names, dates, medical results, invented text, real national emblem, modern icon, ornamental frame or external watermark. Requested object: [opis zasobu].

**Portret:**

> Create an original seated patient matching the supplied Next, Please! portraits. Waist-up silhouette, natural head scale, hands resting at desk level, transparent background, suitable for a final 94 by 96 pixel sprite. Muted 1980s clothing and the established clinic lighting. No scenery, text, flags, insignia identifying a real country, exaggerated caricature or diagnosis shown through fantasy effects. Character: [opis P01-P10].

**Scena zakończenia:**

> Create an original 570 by 320 composition matching the supplied Next, Please! clinic and domestic scenes. Restrained period atmosphere, muted charcoal and olive tones. Place the meaningful action on the right. Keep the left area dark, calm and unobstructed for separately rendered localized text. No embedded captions, UI, dates, flags or country/city names. Scene: [opis F01-F06].

Nie rozciągaj źródeł do przypadkowych proporcji. Zachowaj pełne źródło, dokładny prompt, referencje i receptę kadrowania oraz redukcji nearest-neighbor. Tekst, ogólne układy dokumentów i wykresy wymagające dokładności pozostają danymi, nie obrazami generowanymi „na oko”.

### 8.4. Kontrola czytelności

- Sprawdź oba języki w natywnym rozmiarze i przy skalowaniu całkowitym.
- Nie skracaj „obsługa wózka widłowego” do niezrozumiałej etykiety.
- Na dokumentach Lisa nazwiska muszą być widoczne bez obracania dokumentu lub specjalnego podświetlenia.
- Pieczęć „ZGŁOSZENIE DOBROWOLNE” i groźba w poleceniu mają dawać się porównać na biurku.
- Fotografia Malca nie może wypierać tekstu potrzebnego do zrozumienia komisji kontrolnej.
- Polskie znaki, długie stanowisko naczelnika i angielskie nagłówki wymagają sprawdzenia miarą fontu.
- Czytnik ekranu otrzymuje pełną treść, w tym znak zapytania, autorstwo pisma, datę i rozbieżności nazwisk.

## 9. Sześć nowych zakończeń

### 9.1. Kolejność i moment rozstrzygnięcia

Wprowadź sześć nowych finałów fabularnych, zachowując oba istniejące zakończenia mechaniczne. Łącznie gra ma wtedy osiem rodzajów zakończeń, z czego trzy nowe pozwalają dalej pracować.

Kolejność:

1. Już uruchomione pobicie/hospitalizacja, w tym assault-pending zgodnie z dotychczasowym rozliczeniem.
2. Bankructwo wynikające z dotychczasowego rozliczenia, jeżeli już nastąpiło.
3. E1 - kompromitacja po złamaniu ultimatum.
4. E2 - zamknięcie gabinetu za naruszenia albo powtarzającą się niekonsekwencję.
5. E3 - zatrzymanie przez służby.
6. E4 - kontynuacja z poparciem partii.
7. E5 - kontynuacja z poparciem Wzajemności.
8. E6 - kontynuacja niezależna.

E1 sprawdzaj rano W26, przed pierwszą wizytą i przed zwykłą dostawą gazet. Pozostałe nowe finały rozstrzygaj po rozliczeniu zmiany W26, jeśli gra nadal trwa. Nie prognozuj porannego bankructwa na podstawie hipotetycznego wieczornego salda.

Ocena rozdziału następuje raz. Otwarcie listu, ponowne wejście do sceny domowej i import zapisu nie mogą ponownie wybierać finału ani zwiększać punktów.

### 9.2. E1 - „Spalona pieczątka”

**Typ:** koniec gry.  
**Warunek:** skuteczna zgoda A7 po rzeczywistym doręczeniu A-WARNING.  
**Termin:** rano W26.

W obiegu pojawiają się kopie orzeczeń, podpis lekarza i numer gabinetu. Władze przestają go osłaniać; wygodniej przedstawić sprawę jako samowolę jednostki. Wzajemność Walcząca dotrzymała zapowiedzi. Dyrekcja odbiera lekarzowi gabinet.

**Dokumenty:** A-EXPOSURE oraz A-CLOSURE.  
**Grafika F01:** gabinet widziany od środka, na biurku powielona kartka i odłożona pieczątka, w drzwiach osoba z administracji. Treść kartek składana osobno; bez efektownej przemocy.

**Tekst finału:**

> Kopie twoich orzeczeń krążą po zakładach. Podpis i numer gabinetu wystarczyły, żeby wszyscy wiedzieli, kto je wystawił. Ci, którzy prosili o przysługę, nie odbierają telefonu. Od jutra gabinet 04 prowadzi ktoś inny.

**Dalsza praca:** nie. Dostępne powrót do menu, nowa gra i istniejąca obsługa zapisów, bez automatycznego usuwania eksportów.

### 9.3. E2 - „Gabinet zamknięty”

**Typ:** koniec gry.  
**Warunek A:** N ≥ 6 i ostrzeżenie SYS-AUDIT doręczono przed naruszeniem, które po raz pierwszy podniosło N do co najmniej 6.  
**Warunek B:** R ≥ 2, N ≥ 1 i SYS-CONSISTENCY doręczono przed drugą nieuzasadnioną zmianą.

Wariant A dotyczy materiału dowodowego o realnych, opisanych naruszeniach. Wariant B dotyczy utraty stanowiska po serii niewytłumaczalnych zmian i przynajmniej jednej nieuzasadnionej decyzji medycznej. Nie opisuj samej uznaniowości jako przestępstwa.

**Dokument END-AUDIT:** decyzja dyrekcji o cofnięciu upoważnienia do orzekania w tej placówce, z dwoma lub trzema rzeczywistymi przykładami. Nie jest to automatycznie utrata wszelkiego prawa wykonywania zawodu.

**Grafika F02:** zamknięte drzwi gabinetu 04, z klamki zdjęta tabliczka przyjęć, na stoliku teczka akt i pismo; spokojna, urzędowa scena.

**Tekst finału, wariant A:**

> W aktach znalazło się więcej niż jedno orzeczenie bez podstaw. Komisja nie potrzebowała domysłów. Wystarczyły wyniki, skierowania i twój podpis. Cofnięto upoważnienie do prowadzenia gabinetu.

**Tekst finału, wariant B:**

> Przy tych samych przesłankach zapadały różne decyzje. Po pierwszym piśmie przyszły następne przykłady. Nikt nie chce już odpowiadać za twoje orzeczenia. Gabinet otrzyma inny lekarz.

**Dalsza praca:** nie.

### 9.4. E3 - „Do wyjaśnienia”

**Typ:** koniec gry.  
**Warunki łącznie:** S ≥ 14, O ≥ 2 i SYS-SECURITY doręczono przed decyzją, która po raz pierwszy podniosła S do co najmniej 14.

Służby mają wysokie zainteresowanie gabinetem i co najmniej dwie odrębne, wykrywalne sprawy świadomego obchodzenia zasad na korzyść ludzi związanych z opozycją. Same prawidłowe, uznaniowe decyzje korzystne dla związku nie wystarczają.

**Dokument END-SECURITY:** wezwanie do wyjaśnień oraz potwierdzenie zabezpieczenia dokumentacji; treść wymienia prawdziwe sprawy z rejestru O.  
**Grafika F03:** opustoszały gabinet, otwarte szuflady, urzędowa teczka zbierana przez dwie postacie w cywilnych płaszczach; bez narodowych insygniów i scen przemocy.

**Tekst finału:**

> Najpierw proszono o wyjaśnienia. Teraz zabezpieczają dokumenty. Dla prowadzących sprawę twoje podpisy układają się w prostą historię: gabinet pomagał ludziom, którym odmawiano innych dróg. Dziś nie wrócisz już do pracy.

**Dalsza praca:** nie. Nie dopowiadaj wyroku, tortur ani losów rodziny, których fabuła nie ustanowiła.

### 9.5. E4 - „Pod opieką Komitetu”

**Typ:** zakończenie rozdziału z kontynuacją.  
**Warunki:** żaden wcześniejszy finał; P ≥ 10 i P - W ≥ 8.

Komitet uznaje lekarza za osobę, na którą można liczyć. Otrzymuje list z podziękowaniem oraz zawoalowaną zapowiedzią następnych oczekiwań.

**Dokument END-PARTY:** „Dziękujemy za odpowiedzialną postawę w sprawach istotnych dla prawidłowego funkcjonowania miasta. Liczymy na dalszą rzeczową współpracę.”  
**Grafika F04:** biurko o świcie, oficjalny list z pieczęcią Komitetu, starannie ustawiona pieczątka, na drugim planie oczekująca sylwetka.

**Tekst finału:**

> W Komitecie mówią o tobie dobrze. Kilka twoich decyzji pomogło przywrócić porządek, obsadzić stanowiska i zamknąć niewygodne sprawy. Gabinet zostaje pod twoją opieką. Następne skierowania już przygotowano.

**Dalsza praca:** tak, od W27. Zachować wszystkie pieniądze, składkę, dokumenty, podejrzenia i losy postaci. Poparcie nie daje immunitetu.

### 9.6. E5 - „Nasz lekarz”

**Typ:** zakończenie rozdziału z kontynuacją.  
**Warunki:** żaden wcześniejszy finał; W ≥ 10 i W - P ≥ 8.

Wzajemność przesyła dyskretne podziękowanie. Nie musi publikować nazwiska lekarza. Możliwe jest osiągnięcie tego zakończenia bez nieprawidłowego orzeczenia.

**Dokument END-UNION:** „Nie wszyscy mogli otrzymać zgodę. Wiemy jednak, kiedy decyzja wynikała z badania, a kiedy ktoś próbował użyć gabinetu przeciw ludziom. Dziękujemy, że nie wszystko dało się załatwić poleceniem z góry.”  
**Grafika F05:** dyskretna kartka wsunięta pod drzwi gabinetu, zwyczajna kolejka pracowników w przygaszonym świetle.

**Tekst finału:**

> W zakładach wiedzą, że w gabinecie 04 nie każda prośba z góry staje się poleceniem. Przychodzi krótka kartka z podziękowaniem. Żadnej gwarancji bezpieczeństwa, żadnych wielkich słów. Jutro znów będą pacjenci.

**Dalsza praca:** tak, od W27. List musi dotrzeć również wtedy, gdy tygodnik ma przerwę w druku. Związek nie zeruje S ani N.

### 9.7. E6 - „Jutro zwykły dyżur”

**Typ:** zakończenie rozdziału z kontynuacją.  
**Warunek:** wszystkie pozostałe przypadki po wykluczeniu E1-E5.

To pełnoprawna droga niezależna. Nie wymaga idealnego balansowania punktów ani jednakowej liczby przysług dla każdej strony. Nie oznacza także bezwarunkowej pochwały moralnej każdej decyzji.

**Dokument END-ROTA:** zwykły przydział dalszych dyżurów do gabinetu 04.  
**Grafika F06:** pusty gabinet przed rozpoczęciem pracy, świeża gazeta, zamknięte szuflady i telefon; bez nagrody w formie odznaki lub trofeum.

**Tekst finału:**

> Nie otrzymujesz odznaczenia ani listu, który obiecywałby ochronę. Na nowym rozkładzie dyżurów nadal widnieje gabinet 04. Te same godziny przyjęć, te same formularze i następna kolejka ludzi, których sprawy nie mieszczą się w rubrykach.

**Dalsza praca:** tak, od W27.

### 9.8. Co pozostaje po kontynuacji

- Rozdział oznaczony jako rozstrzygnięty; jego finał nie odtwarza się codziennie.
- P, W, S, rejestr dowodów i wszystkie decyzje pozostają zapisane.
- Losowi pacjenci, ekonomia, łapówki, kontrole i badania dodatkowe nadal działają.
- „Kurier” wraca do tła i zaplanowanych następstw. K-J-DIRECTOR może ukazać się W29.
- „Głos” zachowuje tygodniowy rytm w obu wariantach: po wydaniu W24 następny numer przypada na W29. Ewentualne pominięcie W19 pozostaje zapisane w historii.
- Kolejka nieopublikowanych komentarzy związku przechodzi do kolejnych wydań.
- Raz zakończone łańcuchy agenta i awansów Malca nie zaczynają się od początku.
- Nowe rozdziały można później dodawać pod kolejnymi identyfikatorami, bez zerowania świata.

## 10. Kontrakt implementacyjny

### 10.1. Podział odpowiedzialności

Nie buduj ogólnego silnika RPG ani systemu skryptów wykonującego dowolny kod z danych. Wystarczy katalog scen, jawne predykaty i kilka czystych funkcji.

| Moduł | Zakres zmiany |
| --- | --- |
| Nowy src/core/story.ts | Stan rozdziału, rejestr decyzji, punktacja, progi, warunki zakończeń i czyste przejścia. |
| Nowy src/core/story-content.ts | Katalog wizyt, dokumentów, kontaktów, artykułów i zależności; bez renderowania. |
| src/core/game.ts | Przydzielanie wizyt, przyjęcie dokumentów, moment zatwierdzenia decyzji, dostawy, epilog. |
| src/core/patients.ts i patient-identities.ts | Dopisanie stabilnych przypadków i tożsamości fabularnych, bez zmiany historycznych ID. |
| src/core/progression.ts | Jawne profile wizyt fabularnych i formalne rozbieżności, współpraca z istniejącą oceną. |
| src/core/additional-tests.ts | Powiązanie operatora offsetowego z audiometrią i obsługa dostarczonego wyniku. |
| src/core/newspaper.ts | Oddzielne katalogi tła i fabuły, wymuszone ogłoszenie, wydania dwóch tytułów. |
| src/core/save.ts | Nowa wersja schematu, walidacja całego stanu, migracje i atomowy import. |
| src/render/paperwork.ts i document-copy.ts | Nowe typy dokumentów, historyczne certyfikaty, tożsamość właściwa dla konkretnego dokumentu. |
| src/render/newspaper.ts | Winieta związku, numer tygodnika, zachowane warianty treści i jeden artykuł ze zdjęciem. |
| src/core/desk.ts, render/drawer.ts, src/desktop.ts | Dwa tytuły publikacji, przenoszenie nowych przedmiotów, hit areas i semantyczne etykiety. |
| src/core/patient-speech.ts | Krótkie, deterministyczne kwestie przypisane do wizyty. |
| src/scenes/home.ts albo wydzielona scena epilogu | Prezentacja zakończeń na istniejącym wzorcu scen, kontynuacja bez ponownego rozliczenia. |
| src/i18n.ts | Wszystkie teksty, nazwy, etykiety i dostępność w PL/EN. |

Przed modyfikacją sprawdź rzeczywisty aktualny podział plików. Powyższa mapa wskazuje miejsca odpowiedzialności, nie wymaga przenoszenia działającego kodu tylko po to, aby nazwy plików zgadzały się z dokumentem.

### 10.2. Minimalny stan fabuły

**Jednostki czasu są rozdzielone:** definicja wizyty zawiera scheduledWorkDay i termin W, a zapis zdarzenia zawiera rzeczywisty kalendarzowy state.day (K). Pola day, issuedDay, deliveredDay, resolvedDay oraz daty fizycznych egzemplarzy w poniższych typach oznaczają K. Nie zapisuj w nich liczby W. Numer W wyliczaj przez workDayNumber().

Wyzwalacz wydarzenia wymaga jednocześnie !isWeekend(state.day), zgodnego numeru W i niewykonanego dotąd eventId. Samo workDayNumber(state.day) nie wystarcza, ponieważ obecna funkcja zachowuje piątkowy numer przez sobotę i niedzielę. Przykład: finał W26 uruchamia się przy K36, a nie przy state.day === 26. Kontynuacja W27 przypada na K37.

Tygodniowy rytm prasy obliczaj po datach kalendarzowych: termin następnego numeru to poprzedni planowany termin K + 7. W aktualnym kalendarzu daje to W + 5. Starty to W9 = K13 i W14 = K20, pominięty termin W19 = K27, wznowienie W24 = K34. Pominięcie numeru nie przesuwa bazowego cyklu.

Poniższy schemat jest kontraktem danych do dostosowania do typów projektu. ID pochodzą wyłącznie z zamkniętych katalogów.

~~~ts
type StoryDecision = 'fit' | 'unfit';
type EncounterStatus =
  | 'scheduled'
  | 'active'
  | 'completed'
  | 'missed'
  | 'cancelled';

type StoryDecisionRecord = {
  eventId: string;
  encounterId: string;
  day: number;
  sequence: number;
  decision: StoryDecision;
};

type StoryWarningRecord = {
  warningId: 'audit' | 'security' | 'consistency' | 'militant';
  deliveredDay: number;
  deliveredSequence: number;
  documentInstanceId: number;
};

type StoryEvidence = {
  eventId: string;
  encounterId: string;
  kind:
    | 'unjustified_refusal'
    | 'contraindication_ignored'
    | 'identity_falsification';
  weight: 1 | 2;
  oppositionCase: boolean;
};

type ChapterEnding =
  | 'exposed'
  | 'clinic-closed'
  | 'detained'
  | 'party-continue'
  | 'union-continue'
  | 'independent-continue';

type NarrativeState = {
  version: 1;
  mode: 'active' | 'resolved' | 'legacy-disabled';
  nextSequence: number;
  decisions: StoryDecisionRecord[];
  encounterStatus: Record<string, EncounterStatus>;
  warnings: StoryWarningRecord[];
  appliedEventIds: string[];
  deliveredDocumentIds: string[];
  publicationHistory: string[];
  pendingUnionArticleIds: string[];
  unionPress: {
    firstIssueCalendarDay: number | null; // K13 dla W9 albo K20 dla W14
    skippedCalendarDays: number[]; // np. K27, czyli pominięte W19
    printedIssueCount: number;
  };
  resolution: null | {
    endingId: ChapterEnding;
    resolvedDay: number;
    terminal: boolean;
    presented: boolean;
  };
};
~~~

P, W, S, N, O i R można wyliczać z uporządkowanych decyzji oraz stałego katalogu. Jeśli są przechowywane jako cache, walidator musi sprawdzać zgodność z ponownym obliczeniem. Nie utrzymuj dwóch niezależnych źródeł prawdy o tym samym wyborze.

W szczególności:

- Jedno encounterId ma najwyżej jedną zakończoną decyzję.
- Zmiana pieczątki przed oddaniem orzeczenia nie zapisuje dwóch decyzji.
- completed wymaga rzeczywistego zdarzenia ukończenia; missed i cancelled nie mają wyniku fit/unfit.
- A2-A7 wymagają odpowiedniej poprzedniej zgody; J2 i C2 także wymagają swoich zgód.
- Zgoda A7 skutkuje exposed wyłącznie wtedy, gdy A-WARNING został rzeczywiście doręczony wcześniej.
- Dowody i wpisy R wynikają z decyzji i katalogu, nie z czytania dokumentów.
- Wpisy do rejestru nie znikają po wyrzuceniu papieru.
- Ten sam eventId nie może być naliczony drugi raz po imporcie lub ponowieniu akcji.

Nie trzeba przechowywać całej historii zwykłych pacjentów w nowym stanie. Dotychczasowe recentVisits i dokumentacja nadal pełnią swoją funkcję.

### 10.3. Przypadki medyczne i formalne

Dodawaj nowe identyfikatory na końcu odpowiednich katalogów. Nie przesuwaj istniejących przypadków, zawodów, pracodawców lub portretów. Nie zakładaj, że proste przesunięcie numeru przypadku wystarczy do poprawnego wyboru tożsamości: obecny katalog ma zależności arytmetyczne, które trzeba zachować dla starych rekordów.

Profile fabularne powinny określać jawnie:

- aktora, stałą datę urodzenia i portret;
- stanowisko, pracodawcę i charakter badania;
- stabilne wartości oraz konkretny opis wyniku ogólnego;
- obowiązkowe badania w istniejącym modelu;
- listę dokumentów wejściowych;
- ewentualny otrzymany wynik dodatkowy;
- przewidziane rozbieżności formalne;
- brak losowych łapówek, przeterminowanych skierowań i przypadkowych wad dokumentów.

Potrzebne rozszerzenia danych:

1. Stanowiska i pracodawcy właściwi dla poszczególnych historii. Obowiązki magazyniera z wózkiem są jednym całym stanowiskiem.
2. Typ badania kontrolnego dla sierżanta i drukarza, jeśli aktualna unia obejmuje tylko badanie wstępne i okresowe.
3. Operator offsetowy kwalifikowany do audiometrii. Samo dopisanie nazwy zawodu nie wystarczy, ponieważ obecne additionalTestForJob() ma jawne przypisania.
4. Rozpoznawalne źródło wyniku: badanie wykonane po skierowaniu z gabinetu albo prawidłowy wynik dostarczony już przy pierwszej wizycie.
5. Rzeczywiście graniczna audiometria. Nie opieraj jej na przypadkowej parzystości ID albo na niepasującym wariancie starego pacjenta.
6. Jawny objaw zawrotów głowy u Króla. Nie polegaj na obecnym wyborze opisu poprzez modulo numeru przypadku.
7. Tożsamość zapisana per dokument u Lisa; istniejąca funkcja wpisująca dane orzeczenia wybiera dane ze skierowania.
8. A-FAKE jest dokumentem fabularnym bez mocy indywidualnej opinii specjalisty. Nie może uruchamiać wyjątku nadciśnienia tylko dlatego, że zawiera zgodny jobId.

Dane wyników i treści raportów muszą pochodzić z tej samej definicji. Gracz nie może wykonać badania, które przeczy przyniesionemu raportowi, jeśli scenariusz nie zakłada tej sprzeczności.

Nowy model fabularny nie zastępuje standardowych reguł aktualności skierowania, badań, załączników i archiwizacji. Wynik discretionary nie usuwa niezależnego, jednoznacznego problemu formalnego.

### 10.4. Dokumenty i dwie publikacje

Dodaj zamknięty typ dokumentu fabularnego, np. story-document, z identyfikatorem definicji i zamrożonymi danymi instancji. Nie przekazuj do rendererów dowolnego HTML ani skryptu.

Przykładowe pola:

~~~ts
type StoryPaperData = {
  definitionId: string;
  encounterId: string | null;
  issuedDay: number;
  variantId: string;
  subjectIdentityId: string | null;
  sourceDecisionEventIds: string[];
};

type PublicationCopy = {
  id: string;
  publication: 'kurier' | 'glos';
  day: number;
  issueNumber: number;
  articleIds: string[];
  classifiedIds: string[];
  location: 'desk' | 'drawer' | 'drawer-2';
};
~~~

To specyfikacja potrzebnych relacji, nie polecenie skopiowania tych typów bez uwzględnienia istniejącego PaperBase.

Gazety muszą mieć unikalne klucze, np. kurier:13 i glos:13 dla wydań z W9 = K13. Przełącz obsługę przechowywania, otwierania, wyrzucania, klawiatury oraz etykiet z samego dnia na identyfikator egzemplarza. Numer wydania „Kuriera” zachowuje dotychczasową zasadę; numer „Głosu” jest kolejnym rzeczywiście wydrukowanym numerem. Pominięty termin nie tworzy fizycznego egzemplarza ani pustego numeru.

Artykuły o stałych postaciach mogą mieć pełne, gotowe warianty PL/EN pod stabilnymi ID. Historyczny egzemplarz wybiera ID przy wydaniu, a nie dopiero przy wyświetleniu na podstawie aktualnych flag. A-EXPOSURE korzysta z kopii faktów konkretnych orzeczeń, które powstały w tej rozgrywce.

### 10.5. Punktacja, kary i kolejność transakcji

Zastosuj następującą kolejność przy oddawaniu orzeczenia:

1. Sprawdź, czy istniejący mechanizm rzeczywiście pozwolił oddać orzeczenie i zakończył wizytę.
2. Jeśli akcja została anulowana przez zamknięcie gabinetu albo walidację, nie zapisuj zdarzenia fabularnego.
3. W ramach tego samego przejścia stanu dopisz decyzję i nalicz jej skutki dokładnie raz.
4. Zastosuj ewentualny wpis R i jego deltę.
5. Zaplanuj listy, artykuły, następne wizyty i ostrzeżenia.
6. Zachowaj zwykłe kary, składkę, premie i wynik losowania wykrycia pomyłki.
7. Jeżeli wizyta zamyka zmianę, rozlicz ją dotychczasowym mechanizmem.

Obecne applyAction() potrafi wycofać skutek czynności osiągającej 17:15 i rozliczyć stan sprzed niej. Nowa historia musi respektować ten warunek; nie zapisuj zgody, której pacjent ostatecznie nie otrzymał.

N nie zależy od losowego wykrycia błędu przez ZUS. Dlatego dana decyzja może trafić do rejestru fabularnego i niezależnie wywołać dotychczasową karę, jeśli normalny system ją wykryje. N nie nalicza dodatkowej kary pieniężnej.

Nie zużywaj losowości do punktacji, treści ostrzeżeń, wyboru końca ani rozmowy fabularnej. Losowanie pacjentów i tła prasy zachowuje istniejące, oddzielne strumienie. Renderowanie i otwarcie dokumentu nie losują stanu.

### 10.6. Epilog jako zapisany stan

Dla nowych finałów dodaj jawny stan epilogu, np. phase = epilogue, zamiast udawać zwykły wieczór z niepasującym rozliczeniem. Wykorzystaj dotychczasową prezentację scen i kontrole klawiaturowe. To nowy etap prezentacji, nie nowa mechanika decyzji politycznych.

- E1 rano W26 nie tworzy rozliczenia za nieprzepracowany dzień. Zachowuje rzeczywiste ostatnie rozliczenie, saldo i datę zdarzenia.
- E2-E6 powstają po prawidłowym rozliczeniu W26.
- Finał terminalny blokuje kolejne przyjęcia.
- Finał kontynuacyjny nie ustawia terminalnego końca w logice gabinetu. Jedno działanie „Kontynuuj pracę” przechodzi do następnego dnia przez istniejące przejście kalendarza, bez ponownego rozliczenia W26.
- presented i resolution są zapisywane. Wczytanie w trakcie epilogu pokazuje ten sam finał; wczytanie po kontynuacji nie odtwarza go.
- Dokument końcowy jest dostępny do odczytania w epilogu. Przy kontynuacji jego fizyczny egzemplarz pojawia się na biurku W27 i może zostać zachowany. Data wystawienia pozostaje 08.12.1983; issuedDay = 36, czyli K36 odpowiadający W26.
- Nie uruchamiaj automatycznego rozliczania weekendu dla stanu epilogu tak, jakby był zwykłym home.

### 10.7. Zapis, migracja i zgodność

Aktualna sprawdzona wersja zapisu to 34. Nowy format powinien otrzymać następną wolną wersję; jeśli repo nadal używa 34, będzie to 35.

Nowy zapis obejmuje:

- stan fabuły i kolejność zdarzeń;
- powiązanie aktywnej i ewentualnej oczekującej wizyty z encounterId;
- nowe dokumenty i źródła wyników;
- oba tytuły publikacji, zachowane artykuły, numery i lokalizacje;
- dostarczone ostrzeżenia oraz ich kolejność względem decyzji;
- rozstrzygnięty finał i stan jego prezentacji.

Zamroź walidację starszych formatów. Uważaj na istniejące typy wyprowadzane z LatestGameState: dodanie pola nie może przypadkiem rozszerzyć dozwolonego schematu historycznej wersji.

**Migracja zapisów sprzed fabuły:** zachowuje istniejącą rozgrywkę, pieniądze, RNG, pacjentów, gazety i dokumenty. Ustawia narrative.mode = legacy-disabled. Nie dopisuje fikcyjnych decyzji z przeszłości, nie wciska kampanii w jej środek i nie uruchamia finału W26 na podstawie nieistniejącej historii. Pełna kampania działa dla nowej gry rozpoczętej po aktualizacji.

To świadoma zasada zgodności: stary zapis nadal pozwala grać w dotychczasowym trybie. Informacja po imporcie powinna być krótka i rzeczowa, bez zmuszania do restartu.

Walidator odrzuca m.in. nieznane ID, powtórne decyzje, niemożliwe etapy awansu, wynik A7 bez dopuszczającego go łańcucha, ostrzeżenie z przyszłości, kopię gazety z przyszłymi informacjami, liczniki niezgodne z dziennikiem i fałszywe źródła dowodów. Błąd importu nie zastępuje aktywnego stanu.

Zapis nie zawiera obiektów DOM, bitmap, timerów, dowolnych funkcji ani gotowego HTML. Dotychczasowy limit rozpakowanych danych uwzględnij przy testach wielu zachowanych wydań; nie zwiększaj go bez wykazanej potrzeby.

## 11. Harmonogram wykonawczy i przypadki brzegowe

### 11.1. Przyjęcia zaplanowane

Zaplanuj pacjentów fabularnych na pierwsze i trzecie miejsce wśród nowych pacjentów danej zmiany. Przy jednej wizycie wykorzystaj pierwsze miejsce. Inspektorzy i powroty trwających badań nie zużywają tych zaplanowanych miejsc; zachowują swoje obecne pierwszeństwo.

Na W6, czyli K8, drugi zwykły pacjent pozostaje istniejącą sceną łapówki. W tej zmianie nie ma pacjenta fabularnego; agent A3 przychodzi dopiero w W8. Nie przenoś gwarantowanej sceny na inny numer ani nie przypisuj jej postaci fabularnej.

Skryptowane, nieprawidłowe lub uznaniowe przypadki mogą być jawnymi wyjątkami od limitu 33% puli odmów w prefiksie kolejki, podobnie jak obecna scena W6. Nie „naprawiaj” zdrowia agenta lub magazyniera, aby generator zmieścił scenę w proporcji. Dla pozostałej losowej części kolejki zachowaj istniejące równoważenie.

Jeżeli warunek wizyty nie został spełniony, w jej miejscu przychodzi zwykły pacjent. Nie pozostawiaj niewidzialnej dziury wymagającej dodatkowego dzwonka.

### 11.2. Nieukończone wizyty

Podstawowa implementacja ma stałe okna fabularne: wszystkie wymienione wizyty trzeba zakończyć w zaplanowanym dniu. W przeciwnym razie na końcu dnia otrzymują status missed, bez punktów i bez udawanego orzeczenia.

To nie jest nowy sposób odmowy. Konsekwencje nieukończenia:

| Sprawa | Co następuje bez orzeczenia w zaplanowanym dniu |
| --- | --- |
| Agent | Łańcuch wizyt zostaje przerwany; nie ma aresztowań przypisanych do tej niewydanej zgody, bonusu za zatrzymanie ani następnej wizyty. |
| Wolski | Brak artykułu o otrzymaniu orzeczenia lub odmowie; dalszy los pozostaje nieustalony. |
| Drukarz C1 | Późny start tygodnika W14, bez punktów za odmowę i bez C2. |
| Drukarz C2 | Nie odwołuj istniejącego dopuszczenia, nie pomijaj W19, nie naliczaj R. Kontrola nie została rozstrzygnięta. |
| Dyspozytor | Brak zgody blokuje opis uruchomienia dzięki Rybakowi. W16 pozostaje ogólna informacja, że negocjacje i przygotowania trwają, bez delty odmowy. |
| Sierżant | W W13 neutralna aktualizacja o oczekiwaniu na zakończenie formalności; nie drukować oskarżenia lekarza o odmowę. |
| Korektorka | Brak drugiego błędu przypisanego utrzymaniu posady oraz brak komunikatu o jej odsunięciu. |
| Ochotnik | Nie publikować nazwiska na liście ani skargi na odmowę. |
| Magazynier | Bez pisma o utrzymaniu pracy lub zwolnieniu na podstawie niewydanego orzeczenia. |
| Lis | Bez podziękowania i bez dowodu fałszywego orzeczenia. |
| Malec | Bez awansu wymagającego nieotrzymanej zgody; dalsza część odpowiedniej gałęzi anulowana. |

Gdy brakuje warunkowego artykułu, slot wypełnia zwykłe tło. Dla dyspozytora i sierżanta przygotuj dwa osobne, neutralne wpisy:

- **K-D-PENDING, W16:** „Przygotowania w elektrociepłowni trwają”. „W Miejskiej Elektrociepłowni nadal kompletowana jest obsada potrzebna do uruchomienia instalacji. Rozmowy z załogą nie przyniosły dotąd porozumienia. Nie podano nowego terminu wznowienia pracy.”
- **K-E-PENDING, W13:** „Powrót po zakończeniu formalności”. „Komenda informuje, że termin powrotu sierżanta Marka Czarneckiego zostanie podany po zakończeniu wymaganych formalności. Wcześniejsza zapowiedź miała charakter planowany.”

Nie twórz automatycznie zaległej wizyty fabularnej następnego dnia i nie przeliczaj całego kalendarza. Dzięki wczesnym miejscom w kolejce ukończenie planowanych spraw powinno być naturalne. Opuszczenie przypadku nie może prowadzić do miękkiej blokady gry.

Przyniesiony na wejściu wynik audiometrii nie jest dowodem, że pacjent już wracał ze skierowanego przez gracza badania. W szczególności samo additionalResult != null nie może powodować utworzenia fikcyjnego powrotu C1/C2 po zamknięciu. Rozróżnij źródło raportu.

Jeśli gracz faktycznie skorzysta z istniejącego skierowania na dodatkowe badanie, zachowaj medyczną obsługę powrotu. Powrót po fabularnym oknie może domknąć sprawę kliniczną, ale nie zmienia już opublikowanych wiadomości, nie uruchamia przeterminowanego awansu ani nie nalicza spóźnionej punktacji. Nie usuwaj prawdziwych oczekujących badań losowych pacjentów.

### 11.3. Poranna kolejność

W dniu pracy:

1. Przejdź do właściwej daty K zgodnie z istniejącym kalendarzem. W weekend obsłuż wyłącznie istniejący dzień wolny; w dniu pracy wylicz W przez workDayNumber(state.day).
2. Jeśli istnieje terminalny stan z wcześniejszego dnia, pozostań przy jego obecnej obsłudze.
3. W W26 rozstrzygnij gotową flagę kompromitacji E1.
4. Doręcz zaplanowane listy i ostrzeżenia.
5. Wybierz i zamroź publikacje na podstawie zakończonych wcześniejszych zdarzeń.
6. Ułóż kolejkę z aktualnie dopuszczonymi wizytami fabularnymi.
7. Rozpocznij przyjęcia według normalnych godzin.

Ostrzeżenia są dostępne przed odpowiednią wizytą. Zwykłe oglądanie biurka nie zmienia wyniku tej kolejności. W weekend nie generuj porannych listów ani gazet; termin dostawy przenosi się na następny dzień pracy.

### 11.4. Konflikty, utrata dokumentów i kontynuacja

- Jednoczesne spełnienie kilku warunków finałowych rozstrzyga wyłącznie kolejność z rozdziału 9. Nie pokazuj kolejno trzech zakończeń.
- Skasowanie ostrzeżenia nie wycofuje faktu jego doręczenia.
- List nie może być uznany za doręczony, jeżeli limit przedmiotów uniemożliwił jego utworzenie. Obsłuż dotychczasowy komunikat limitu i nie przechodź potajemnie do późniejszego krytycznego zdarzenia.
- Jeśli wymagana dostawa A-WARNING nie doszła do skutku, A7 nie może zostać pokazana jako zwykła wizyta prowadząca bez ostrzeżenia do E1.
- Nie naliczaj kar R, gdy zmianę danych dopisano później w rozszerzeniu. Porównywalność jest cechą konkretnych definicji wizyt, nie samych nazwisk.
- Brak publikacji „Głosu” nie usuwa listów krytycznych dla finałów. C-PAUSE jest krótką informacją o niewydaniu numeru, bez artykułów zastępujących cały tygodnik.
- Wczytanie zapisu w W26 po porannej dostawie nie powiela wydania, listów ani kontroli.
- Po W26 zwykłe życie gabinetu trwa w trzech wariantach kontynuacyjnych. Nie powracaj do startu dnia 1 i nie czyść szuflad.

## 12. Kolejność realizacji w Codexie

### Etap 1 - dane i reguły

Przeczytaj aktualny kod oraz dokumentację. Dodaj katalog 10 postaci, 18 wizyt, punktację i czyste rozstrzyganie zakończeń. Przygotuj testy zależności, kalendarza, progów i kolejności ostrzeżeń. Dopisz rozróżnienie zakończenia rozdziału od terminalnego końca gry.

Na tym etapie wyniki można sprawdzać bez renderowania. Nie zastępuj jeszcze brakujących ilustracji przypadkowymi prostokątami udającymi dokumenty.

### Etap 2 - przypadki i dokumenty

Zintegruj pacjentów z kolejką, stałymi tożsamościami, badaniami i rzeczywistym oddaniem orzeczenia. Obsłuż dostarczoną audiometrię, kontrolny typ badania, stare orzeczenie magazyniera i różne nazwiska Lisa. Dodaj papierowe dokumenty, ich treść, odkładanie i właściwe załączniki.

Zachowaj wszystkie aktualne funkcje zwykłego gabinetu. Skargi fabularne współpracują z istniejącymi listami i nie dublują pieniędzy.

### Etap 3 - prasa i telefon

Dodaj priorytetowe artykuły, ogłoszenie drukarni, drugi tytuł, kalendarz tygodnika, kolejkę komentarzy oraz zamrożone egzemplarze. Dodaj pięć kontaktów fabularnych. Sprawdź, że tło nie losuje wydarzeń zależnych od decyzji.

### Etap 4 - grafika i prezentacja

Przygotuj zasoby z manifestu, używając istniejących referencji i generatora obrazów. Dodaj portrety, nowe papiery, winiety, fotografię Malca i sześć epilogów. Zapisz prompty, źródła i recepty przygotowania. Sprawdź oba języki w natywnej rozdzielczości.

### Etap 5 - zapis i kontynuacja

Wprowadź nową wersję zapisu, migrację starszych plików i obsługę epilogu. Wczytaj zapis przed decyzją, po decyzji, przed publikacją, po publikacji, podczas epilogu i po kontynuacji. Stan musi być identyczny w zakresie faktów, punktów i przyszłych wydarzeń.

### Etap 6 - pełny przebieg i dokumentacja

Przeprowadź reprezentatywne trasy z rozdziału 13 oraz testy istniejących zakończeń. Uruchom npm run build, odpowiednie testy Vitest i istotne scenariusze Playwright. Zaktualizuj FACTS.md wyłącznie o wdrożone i przyjęte ustalenia; technikę, źródła grafik i kontrakt zapisu opisz we właściwych dokumentach.

Raport końcowy implementacji powinien wskazywać, co wdrożono, gdzie są zasoby, jakie testy rzeczywiście wykonano i czy pozostał konkretny problem. Nie przedstawiaj specyfikacji lub niewygenerowanych grafik jako gotowej implementacji.

## 13. Kryteria odbioru i trasy kontrolne

### 13.1. Trasy reprezentatywne

W poniższej tabeli ZG oznacza zgodę, OD odmowę, a brak oznacza niewystępującą wizytę. Tabela zakłada terminowe zakończenie zaplanowanych wizyt oraz brak wcześniejszego bankructwa lub hospitalizacji.

| Wizyta | Partia | Wzajemność | Niezależny | Zatrzymanie | Kontrola N | Kompromitacja | Chaos |
| --- | --- | --- | --- | --- | --- | --- | --- |
| A1, W2 | ZG | ZG | ZG | ZG | ZG | ZG | ZG |
| A2, W5 | ZG | ZG | ZG | ZG | ZG | ZG | ZG |
| B1, W5 | OD | ZG | ZG | ZG | OD | OD | OD |
| A3, W8 | ZG | ZG | ZG | ZG | ZG | ZG | ZG |
| C1, W8 | OD | ZG | OD | ZG | OD | OD | ZG |
| J1, W10 | ZG | ZG | ZG | ZG | ZG | ZG | ZG |
| A4, W11 | OD | OD | OD | OD | ZG | ZG | OD |
| E1-VISIT, W12 | ZG | OD | ZG | OD | ZG | ZG | ZG |
| A5, W14 | brak | brak | brak | brak | ZG | ZG | brak |
| D1, W15 | ZG | OD | ZG | OD | ZG | ZG | ZG |
| G1, W17 | ZG | ZG | ZG | OD | ZG | ZG | ZG |
| C2, W18 | brak | ZG | brak | ZG | brak | brak | OD |
| H1, W18 | OD | OD | OD | ZG | ZG | OD | OD |
| J2, W19 | ZG | ZG | ZG | ZG | ZG | ZG | OD |
| A6, W20 | brak | brak | brak | brak | ZG | ZG | brak |
| F1, W21 | OD | ZG | ZG | ZG | OD | OD | OD |
| I1, W21 | OD | OD | OD | ZG | ZG | OD | OD |
| A7, W24 | brak | brak | brak | brak | OD | ZG | brak |

Oczekiwane rezultaty, z ograniczaniem wartości po każdej decyzji:

| Trasa | P | W | S | N | R | O - sprawy opozycyjne | Finał |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| Partia | 14 | -7 | 2 | 0 | 0 | 0 | E4, kontynuacja |
| Wzajemność | -9 | 18 | 10 | 0 | 0 | 0 | E5, kontynuacja |
| Niezależny | 7 | 2 | 4 | 0 | 0 | 0 | E6, kontynuacja |
| Zatrzymanie | -18 | 30 | 16 | 5 | 0 | 3 | E3 |
| Kontrola N | 16 | -8 | 5 | 6 | 0 | 2 | E2, naruszenia |
| Kompromitacja | 26 | -23 | 0 | 4 | 0 | 0 | E1 |
| Chaos | 6 | -9 | 8 | 1 | 2 | 0 | E2, niekonsekwencja |

**Uczciwość ostrzeżeń w przykładowych trasach:**

- Kontrola N: dopuszczenie magazyniera w W18 daje N = 2; zgoda A6 w W20 podnosi N do 4; ostrzeżenie przychodzi rano W21; dopiero zgoda Lisowi w W21 podnosi N do 6.
- Zatrzymanie: odmowa Ochotnikowi w W17 daje S = 10; ostrzeżenie dociera rano W18. Następnie ponowna zgoda drukarzowi daje S = 11, a zgoda magazynierowi S = 13. W W21 zgoda korektorce osiąga S = 14, a zgoda Lisowi podnosi S do 16. Ogólny warunek wykrywa także skok ponad próg, nie wymaga trafienia dokładnie w 14.
- Chaos: odmowa C2 w W18 daje pierwsze R; ostrzeżenie przychodzi rano W19, przed J2. Odmowa J2 w W19 daje drugie R oraz N = 1.
- Kompromitacja: zgoda A6 w W20; ultimatum W21; następna zgoda W24; finał rano W26.

### 13.2. Sprawdzenie całej przestrzeni wyborów

Dla wszystkich terminowo ukończonych wizyt istnieje:

~~~text
8 dróg agenta
× 3 drogi drukarza
× 3 drogi Malca
× 2^7 decyzji pozostałych pacjentów
= 9216 kombinacji
~~~

Osiem dróg agenta to odmowa na jednej z siedmiu wizyt albo siedem zgód. Trzy drogi drukarza i Malca to pierwsza odmowa, zgoda-odmowa oraz dwie zgody.

Po korekcie harmonogramu na 26 dni roboczych ponownie policzono tę przestrzeń niezależnym modelem oraz porównano wszystkie 32 wiersze macierzy z rozdziału 4.3. Otrzymano:

| Finał | Liczba kombinacji |
| --- | ---: |
| E1 - Spalona pieczątka | 1152 |
| E2 - Gabinet zamknięty | 2176 |
| E3 - Do wyjaśnienia | 407 |
| E4 - Pod opieką Komitetu | 211 |
| E5 - Nasz lekarz | 1744 |
| E6 - Jutro zwykły dyżur | 3526 |
| Razem | 9216 |

W ustalonym harmonogramie nie wystąpił przypadek przekroczenia N ≥ 6 lub S ≥ 14 przed właściwym ostrzeżeniem ani drugiej nieuzasadnionej zmiany przed ostrzeżeniem o pierwszej.

To sprawdzenie logiki proponowanego scenariusza. Nie jest symulacją prawdopodobieństwa zachowań graczy, ekonomii, losowych kar, przerwanych wizyt ani testem jeszcze niewdrożonego kodu gry. Podczas implementacji należy odtworzyć tę weryfikację na rzeczywistych funkcjach punktacji i zakończeń.

### 13.3. Wymagane testy logiki

1. **Punktacja:** każdy wiersz macierzy ma dokładnie podane delty; przedwczesne stemplowanie i zmiana pieczątki nie naliczają niczego.
2. **Idempotencja:** oddanie dokumentu, import, ponowne otwarcie listu i ten sam telefon nie powielają zdarzenia.
3. **Chronologia:** rozdział trwa 26 zmian do W26 = K36, weekendy nie przyjmują pacjentów ani nie przesuwają W, W7 = K9 odblokowuje audiometrię, C2 w W18 przypada dziesięć zmian po C1 w W8.
4. **Agent:** każda odmowa usuwa dalsze wizyty; A4/A5 są uznaniowe; A6/A7 mają przeciwwskazanie; fałszywe pismo go nie unieważnia.
5. **Ostrzeżenie radykałów:** E1 jest niemożliwe bez doręczenia A-WARNING przed A7.
6. **Malec:** brak J2 po pierwszej odmowie; brak artykułu o naczelniku bez dwóch zgód.
7. **Drukarz:** po pierwszej odmowie nie ma C2; po C2 = odmowa pomijane jest tylko W19, a następny termin to W24.
8. **Dyskrecja medyczna:** uznaniowe zgody i odmowy nie uruchamiają standardowej kary za samą decyzję.
9. **Zawroty głowy:** H1 ma rzeczywiste przeciwwskazanie do całego aktualnego stanowiska, bez ukrytej zgody „z wyłączeniem wózka”.
10. **Tożsamość:** I-REF i orzeczenie wskazują Sikorę, raporty Lisa; historia nie zamienia obu nazwisk na jeden aktualny string.
11. **Niekonsekwencja:** R dotyczy tylko przewidzianych par; zatrzymanie agenta po pogorszeniu wyników nie daje R.
12. **Progi:** sprawdzać przejścia 5 → 7 dla N oraz 13 → 15 dla S, a nie wyłącznie trafienie w 6 lub 14.
13. **Polityczna niezależność:** decyzje korzystne dla różnych stron w niezależnych sprawach nie tworzą automatycznego naruszenia.
14. **Finały:** wszystkie siedem tras reprezentatywnych daje podany wynik; każdy nowy finał jest osiągalny.
15. **Pierwszeństwo:** już uruchomiona hospitalizacja lub bankructwo nie zostają nadpisane epilogiem politycznym.
16. **Poranny E1:** nie tworzy fikcyjnej dniówki ani rozliczenia W26.
17. **Kontynuacja:** E4-E6 przechodzą do W27 z zachowanym światem, bez powtórzenia epilogu.
18. **Brak decyzji:** przerwanie i nieprzyjęcie wizyty daje missed, bez fit/unfit i bez fikcyjnych artykułów.

### 13.4. Wymagane testy prasy i dokumentów

1. Artykuł fabularny nie pojawia się w losowym tle przed warunkiem.
2. K-A1…K-A6 odnoszą się do dokładnie właściwych zakładów.
3. W W6 ogłoszenie drukarni występuje niezależnie od losowania 75%.
4. Dwa tytuły z tego samego dnia mogą niezależnie znajdować się na biurku, w różnych szufladach albo w koszu.
5. Zachowany numer „Kuriera” nie zmienia treści po późniejszej decyzji.
6. „Głos” z W19 nie zna pytającego nagłówka wydanego tego samego ranka ani wyniku J2 z tej zmiany.
7. Wydanie W24 w obu wariantach startu może skomentować nagłówek, sprostowanie i rozstrzygnięcie sprawy korektorki, ale nie zna jeszcze decyzji A7 z W24.
8. Pominięcie W19 zachowuje kolejkę komentarzy do W24; nadwyżka oczekuje na W29. Odstęp między terminami wynosi siedem dni kalendarzowych, nie siedem zmian.
9. Wyrzucenie A-WARNING nie usuwa faktu doręczenia; zachowanie go nie przyznaje dodatkowych punktów.
10. A-EXPOSURE zawiera faktyczne pozytywne orzeczenia, a nie dowolny wcześniej przygotowany wynik.
11. H-OLD-CERT pozostaje historyczne i tylko do odczytu.
12. Brak załącznika audiometrii uruchamia jeden istniejący skutek kancelaryjny; nie dubluje N ani grzywny.
13. Zwykła i fabularna skarga pracodawcy w tej samej sprawie nie tworzą dwóch identycznych kar.
14. Dokument finałowy z kontynuacji można zachować w W27, z właściwą datą wystawienia.

### 13.5. Zapis i interfejs

Wymagane scenariusze importu/eksportu:

- przed A4, po A6, po ostrzeżeniu A-WARNING i po A7;
- przed powstaniem i po pominięciu wydania W19 oraz po wznowieniu w W24;
- podczas wizyty Lisa z oboma nazwiskami;
- podczas epilogu terminalnego i kontynuacyjnego;
- w W27 po kontynuacji;
- stary poprawny zapis v34, który zachowuje dotychczasowy świat;
- błędny zapis z niespójnym łańcuchem, podrobionym wynikiem lub przyszłym ostrzeżeniem, bez naruszenia aktywnego stanu.

Weryfikacja wizualna obejmuje biurko z kilkoma dokumentami, oba rodzaje gazet, szuflady, fotografię Malca, wszystkie sześć ilustracji epilogu oraz najdłuższe formularze w PL i EN. Obsługa klawiaturą i czytnikiem ekranu musi pozwalać przeczytać te same poszlaki co Canvas.

### 13.6. Warunek ukończenia

Implementacja jest gotowa, gdy dziesięć wątków działa na rzeczywistym kodzie, dokumenty i media są dostępne w przewidzianym momencie, wszystkie finały są osiągalne, trzy pozwalają kontynuować, a zapis odtwarza dokładnie ten sam świat. W kompletnej wersji nie pozostają teksty robocze „TODO”, nieczytelne atrapy dokumentów ani odwołania do obrazów, których nie ma w zasobach.

## 14. Źródła projektu i granice ustaleń

Specyfikację przygotowano po odczycie notatek autora i kodu na wskazanym Macu, przy commicie 30d8350. Repozytorium miało wówczas wersję 0.8.9.

Podstawy konkretnych ustaleń:

| Ustalenie | Źródło w repozytorium |
| --- | --- |
| Nienazwane miejsce, realia, dokumenty, gabinet i istniejące zakończenia | FACTS.md |
| Architektura, lokalizacja PL/EN, zakaz zastępowania nowych grafik geometrią | AGENTS.md; docs/technical-guidelines.md; docs/art-direction.md |
| Start 3.11.1983 i weekendy | src/core/calendar.ts: GAME_START_DATE, gameDate(), isWeekend() |
| Numer zmiany i badania od W7 | src/core/progression.ts: workDayNumber(), directiveForDay() |
| Reguły umownych wartości granicznych | src/core/patients.ts: pressureAssessment(), visionAssessment(); src/core/progression.ts: expectedVisitDecision() |
| Przypisanie audiometrii i znaczenie raportu | src/core/additional-tests.ts: additionalTestForJob(), additionalAssessment() |
| Dokładny moment zakończenia wizyty i skutki zamknięcia | src/core/game.ts: applyAction(), transition(), finishAtClosing(), gałąź return-document |
| Zwykłe zakończenia i rozliczenie | src/core/game.ts: settledEnding(); src/scenes/home.ts |
| Priorytetowe artykuły i losowanie ogłoszeń | src/core/newspaper.ts: nextNewspaper() |
| Geometria i typografia prasy | src/render/newspaper.ts; docs/art-direction.md |
| Dokumenty, odpisy i wielostronicowe notatki | src/render/paperwork.ts; docs/technical-guidelines.md |
| Format zapisu i migracje | src/core/save.ts; docs/save-format.md |
| Wersja i polecenia weryfikacji | package.json |

Wszystkie fabularne nazwiska dodane przez autora specyfikacji, teksty publikacji, wagi punktów, warunki nowych zakończeń i reguły pierwszego rozdziału są propozycją projektową. Nie przedstawiają odnalezionych faktów historycznych ani obowiązujących zasad medycznych lub prawnych.

Sprawdzenie 9216 kombinacji dotyczy opisanego modelu wyborów. Wdrożenie, testy interfejsu, bilans ekonomiczny pełnej rozgrywki i generowanie grafik pozostają pracą wykonywaną na podstawie tego dokumentu.
