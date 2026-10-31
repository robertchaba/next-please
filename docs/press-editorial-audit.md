# Audyt redakcyjny Kuriera — 0.8.9

31 października 2026. Przegląd obejmuje wszystkie **170 artykułów i 166 ogłoszeń**, osobno w polskiej i angielskiej wersji. Aktualne teksty są w `src/i18n.ts`; [pełny katalog](press-catalog.md) podaje wynik dla każdego ID. Historyczna [próbka 20 materiałów](press-sample.md) pozostaje zapisem zaakceptowanego kierunku.

## Wynik

| Materiał | Zakres redakcji | Zachowane po przeglądzie |
| --- | --- | --- |
| Artykuły | 150 przepisanych; 10 pierwotnych doprecyzowanych | 10 |
| Ogłoszenia | 85 zmienionych, w tym korekty przekładu | 81 |

W artykułach sprawdzono podmiot, miejsce, przebieg i sens opisywanej sytuacji, zgodność tytułu z treścią oraz naturalność zakończenia. Nie wystarczało dopisanie nazwy szkoły do nieprzekonującej anegdoty. Nowe wersje opisują konkretne warunki pracy, wyniki spotkań, powody zmian albo codzienne zwyczaje mieszkańców. Usunięto powtarzający się schemat zajęć zakończonych podpisaniem prac, wystawką i ogólnym morałem.

W ogłoszeniach sprawdzono przedmiot, zamiar ogłoszeniodawcy i możliwość odnalezienia miejsca kontaktu. Numer telefonu jest drukowany osobno na podstawie `src/core/newspaper.ts`. Brak ulicy w treści takiego ogłoszenia nie oznacza braku kontaktu. Przy kontakcie osobistym czytelnik dostaje placówkę i ulicę, nazwę jednoznacznej instytucji, numer szkoły lub konkretny adres dozorcy. Nie musi znać innego artykułu ani poprzedniego wydania.

## Przykłady decyzji

| ID | Problem | Wprowadzona zmiana |
| --- | --- | --- |
| `seed-observation` | „Dwie klasy” bez wskazania szkoły; zakończenie o ładnym rysunku zamiast wyniku doświadczenia. | Klasy piąte A i B szkoły nr 12, fasola, trzy dni różnicy rozpoczęcia oraz nauczycielka Irena Wolska; wyjaśnienie błędnego porównania. |
| `allotment-bench` | „Zgłoszenia u gospodarza ogrodów” bez miejsca. | Gospodarz ogrodu Zacisze, Ogrodowa 42. |
| `clothes-pegs` | Mało przekonująca wymiana klamerek na wieszaki i nieokreślona pralnia na osiedlu. | Oddanie nieużywanych klamerek; wiadomość u gospodarza domu przy Lipowej 12. |
| `poetry-copying` | Przepisywanie wierszy nie miało czytelnego powodu jako osobna usługa. | Kaligrafowanie dyplomów i zaproszeń; kontakt w pracowni plastycznej na Szkolnej. |
| `plant-identification` | Oferta rozpoznawania roślin brzmiała jak poradnik przepisany na ogłoszenie. | Oddanie nadwyżki sadzonek zielistki; wiadomość w kwiaciarni na Północy. |
| `curtain-rods`, `pram` | Przedmiot opisany bez wyraźnego zamiaru ogłoszeniodawcy. | Dopisane „sprzedam” i odpowiednik w EN. |
| `books`, `school-atlas`, `wall-map`, `language-practice` | Skrytka bez wskazania, czy chodzi o pocztę, czy redakcję. | Cztery skrytki odpowiedzi redakcyjnych, z zachowaniem numerów. |
| `lost-keys` | Kino Świt w EN występowało jako Dawn, inaczej niż w pozostałych tekstach. | Jedna nazwa Świt w obu słownikach. |

Nowe tytuły odpowiadają treści: między innymi „Klucz bez wzoru”, „Obiad na dwie zmiany”, „Zakupy czekają przy ladzie” i „Szkolne koła w gazetce”. Teksty o szyciu, roślinach i wyposażeniu świetlicy sprawdzono także pod kątem sztucznych szczegółów, które nie wynikały z opisanej sytuacji.

## Spójność lokalnego tła

Poniższe powiązania porządkują redakcyjne tło katalogu. Nie ustalają kraju ani nazwy miasta i nie wprowadzają wydarzeń głównej fabuły do `FACTS.md`.

| Miejsce / osoba | Użycie w katalogu |
| --- | --- |
| Szkoła nr 12, Szkolna | Maria Bielecka — język polski; Jadwiga Sikora — pierwsza klasa; Celina Borek — zajęcia praktyczne; Irena Wolska — przyroda; Jan Król — sport. |
| Szkoła nr 7, Kolejowa | Zofia Rataj — geografia i przyroda; jej widokówki i fotografie służą także lokalnym zbiorom. |
| Szkoła zawodowa nr 3, Stolarska | Praktyki rzemieślnicze; naprawiane przedmioty mają wskazanego odbiorcę i cel. |
| Technikum kolejowe, Kolejowa | Piotr Jurek prowadzi zajęcia techniczne. Adam Ruta uczy matematyki, również w szkole nr 7. |
| Dom kultury, Szkolna | Nazwane pracownie i koła; portier Józef Leśniak zbiera wiadomości. Jerzy Kaleta zajmuje się radiotechniką, Kazimierz Orzeł astronomią, Halina Bąk tańcem, Anna Sarna gospodarstwem domowym. |
| Świetlica Północ, Lipowa 6 | Gospodyni Celina Lis, wspólne zajęcia i wyposażenie; adres kontaktów w ogłoszeniach. |
| Blok na Północy, Lipowa 12 | Pralnia, suszarnia, rowerownia i pożyczanie narzędzi pomiędzy lokatorami. |
| Ogród działkowy Zacisze, Ogrodowa 42 | Gospodarz Jan Ryś; plan parceli, wypożyczanie poradników i kontakty do działkowców. |
| Biblioteka, filia nr 6 przy Kolejowej | Janina Wolska, czytelnia i lokalne zbiory; rozpoznawalny punkt odbioru wiadomości. |
| Warsztaty kolejowe, Kolejowa | Stołówka Heleny Bury, chór, orkiestra i fotografie dawnej załogi. |
| Stolarska 8 | Front A i oficyna B we wszystkich tekstach; mieszkanka Wanda Lis. |
| Muzeum Miejskie przy Rynku | Teresa Maj; album Antoniego Raka oddany do muzeum odróżniony od odbitek przyniesionych przez córkę na osobne spotkanie. |
| Wacław Duda | Emerytowany stolarz; zachowana profesja w tekstach o rzeźbieniu, ławce, pomiarach i rzeczach znalezionych. |
| Leon Warda | Emerytowany kasjer kolejowy, zbieracz programów kinowych i monet. |

## Zasady katalogu i weryfikacja

Identyfikatory, kolejność, działy, flagi powtórek i numery telefonów pozostają bez zmian. W starym zapisie gazeta zachowuje wybrane ID, ale pokazuje ich zredagowaną treść z aktualnego słownika. Format zapisu pozostaje v34.

Nadal 70 ze 170 artykułów może wracać po wyczerpaniu świeżej puli, w tym 60 ze 150 dodanych (40%). Telefon ma 32 ze 166 ogłoszeń (19,3%). Cztery ogłoszenia korzystają z numerowanych skrytek; losowanie nie wymusza żadnego telefonu w wydaniu. Obsługa telefonu od pierwszego dnia pozostaje objęta testami.

Kontrola techniczna obejmuje pełną treść, nagłówki, podpisy i marginesy wszystkich wpisów w obu językach przy skali 1×. Testy nie oceniają jakości literackiej: ta wymaga przeczytania tekstu, porównania obu wersji i sprawdzenia kontekstu. Nie zastąpiono audytu listą zakazanych słów ani wymaganiem adresu w każdym zdaniu.

Weryfikacja wydania: `npm run build` zakończone poprawnie; `npm test` — 538/538; `npm run test:browser -- tests/browser/newspaper.spec.ts tests/browser/welcome.spec.ts --workers=3` — 13/13. Obejrzano zrzuty artykułu i ogłoszeń w PL/EN: polskie znaki są czytelne, treść i numery mieszczą się w kolumnach. Testy przeglądarkowe potwierdzają także działanie telefonu pierwszego dnia, zachowanie gazet w szufladach i import/eksport zapisu.
