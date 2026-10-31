# Nazwy własne PL / EN

Angielska wersja adaptuje imiona, nazwiska, nazwy ulic, miejsc i instytucji. Odpowiednik nie musi być dosłownym tłumaczeniem. Raz wybrana para obowiązuje w całej grze: w skierowaniu, notatkach, orzeczeniu, podpisie urzędnika, kontroli, artykule, ogłoszeniu i etykiecie dostępności. Język nie określa kraju akcji.

Kompletny [słownik odpowiedników](localization-glossary.json) jest rejestrem redakcyjnym. Gotowe teksty obu wersji pozostają w `src/i18n.ts`; gra nie podmienia fragmentów zdań automatycznie. Przy dodawaniu nazw należy sprawdzić istniejącą parę, odmianę, formę dzierżawczą, liczbę mnogą i kontekst. Imię i nazwisko są osobnymi kluczami, a lokalny człon nazwiska dwuczłonowego korzysta z tego samego wpisu co samodzielne nazwisko. Nazwisko i nazwa firmy mogą mieć inne odpowiedniki, np. Kłos → Carter, ale piekarnia Kłos → Harvest Bakery.

## Miejsca i instytucje

| Polska nazwa | Angielski odpowiednik |
| --- | --- |
| Szkolna | Alder Street |
| Ogrodowa | Orchard Street |
| Kolejowa | Station Road |
| Stolarska | Cooper Street |
| Lipowa | Linden Road |
| Sportowa | Recreation Road |
| Rynek | Market Square |
| Północ | Northgate |
| Brzeziny | Birchwood |
| Kino Świt | Daybreak cinema |
| Ogród działkowy Zacisze | Haven allotments |
| Archiwum Zakładów Brzask | Dawn Works Archives |
| Zakłady Mechaniczne Ogniwo | Link Engineering Works |
| Przewozy Pracownicze Szlak | Wayfarer Staff Transport |
| Tkalnia Osnowa | Weft Textile Mill |
| Warsztat Nit | Rivet Workshop |
| Drukarnia Margines | Margin Printworks |
| Spółdzielnia Trybik | Cogwheel Co-operative |
| Warsztat Ścieg | Stitch Workshop |
| Piekarnia Kłos | Harvest Bakery |
| Laboratorium Próba | Assay Laboratory |
| Pralnia Fala | Wave Laundry |
| Stolarnia Słój | Grain Joinery |
| Kopalnia Głębia | Deepwell Mine |
| ZUS | SIO — Social Insurance Office |
| LOT | NAL — National Air Lines |
| Wzajemność | Fellowship — para zarezerwowana dla przyszłych wzmianek fabularnych |
| Kurier Obywatelski | Civic Courier — dotychczasowa nazwa |

Numer domu poprzedza angielską ulicę: Lipowa 6 → 6 Linden Road. Numery domów, szkół, telefonów i skrytek pozostają zgodne między wersjami. Świetlica Północ zawsze jest przy tym samym adresie, a ten sam portier, nauczyciel czy korespondent ma stałe dane także wtedy, gdy występuje tylko pod imieniem lub nazwiskiem.

## Osoby

Przegląd objął wszystkie 940 aktualnych tożsamości portretów oraz historyczne nazwiska, a także kontrolerów, autorów listów, dziennikarzy i mieszkańców opisywanych w prasie. Przykłady:

| PL | EN |
| --- | --- |
| Irena Wolska | Irene Wells |
| Zofia Rataj | Sophia Plowman |
| Janina Wolska | Jean Wells |
| Józef Leśniak | Joseph Forster |
| Ewa Lis | Eve Fox |
| Witold Krawiec | Walter Taylor |
| Marian Zawadzki | Maurice Shaw |
| dr Adam Pieczęć | Dr Adam Seale |
| Amina Diallo-Mazur | Amina Diallo-Mason |

Nazwy międzynarodowe, np. David Mensah i Kenji Sato, zachowują swój charakter. Kobiece nazwiska dwuczłonowe zachowują obcy pierwszy człon i otrzymują odpowiednik drugiego. Ten zabieg nie dopisuje postaciom narodowości. Nazwisko autora **Roberta Chaby**, jego link oraz historyczna postać Waryńskiego na zaakceptowanym banknocie pozostają bez adaptacji. Waluta nadal jest oznaczana jako zł.

## Zapis gry i kontrola jakości

Identyfikatory przypadków, portretów, pracodawców, instytucji, artykułów i ogłoszeń pozostają stałe. Nie zmieniają się płeć, wiek, zawód, wyniki badań, kolejka ani zapisany los. Przełączenie PL/EN lub import starego zapisu wybiera etykietę tej samej osoby i tego samego dokumentu. Format nadal ma wersję 34.

`tests/localization.test.ts` porównuje wszystkie przypadki pacjentów i podpisy ze słownikiem, sprawdza wspólne miejsca oraz szuka pozostawionych polskich fragmentów we wszystkich tekstach EN. Testy pacjentów nadal chronią historyczne dane kliniczne i polskie nazwy, a w obu językach sprawdzają unikalność 940 tożsamości. Testy układu mierzą pełne formularze, listy, 170 artykułów i 166 ogłoszeń w rozdzielczości natywnej. Trzy ogłoszenia EN (`room`, `music-stand`, `old-city-photos`) skrócono po adaptacji adresów, zachowując sens i dane kontaktowe.

Testy przeglądarkowe sprawdzają przełączanie języka po imporcie, opisy pacjenta i jego dokumentów, korespondencję, inspekcję, prasę i obsługę klawiaturą. [Angielska pieczęć SIO](art-localization-2026-10-31.md) jest osobnym wygenerowanym zasobem. Podglądy z gry: [pismo SIO](localization-sio-en-screen.png), [ogłoszenia z nowymi adresami](localization-classifieds-en-screen.png).
