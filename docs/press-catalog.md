# Kurier Obywatelski — rozszerzony katalog

Baza zawiera 170 artykułów i 166 ogłoszeń w obu słownikach `src/i18n.ts`. Rozszerzenie dodaje 150 artykułów i 150 ogłoszeń do [zaakceptowanej próbki](press-sample.md) i pierwotnych 16 ogłoszeń. Teksty są oryginalnym tłem redakcyjnym gry, utrzymanym w realiach 1983 roku i anonimowego miasta; nie wyznaczają wydarzeń głównej fabuły.

60 ze 150 nowych artykułów ma flagę `reusable` (40%); łącznie wracać może 70 ze 170. Powtórki następują dopiero po wykorzystaniu wszystkich świeżych tekstów. Materiały powtarzalne opisują zwyczaje, zajęcia i codzienną pracę, bez jednorazowych wyników lub zakończonych wydarzeń.

Numer telefonu ma 24 ze 150 nowych ogłoszeń i 32 ze 166 w całej bazie (19,3%). Numerowane skrytki występują w czterech wpisach całej bazy. Przeważają wiadomości u portiera, dozorcy, w warsztacie, bibliotece lub świetlicy. Limit 25% dotyczy całego katalogu, nie pojedynczej strony. Losowanie 3–4 różnych ogłoszeń nie wymusza telefonu: wydanie może nie zawierać żadnego. Połączenia z ogłoszeń i sygnał aparatu są dostępne od pierwszego dnia.

Identyfikatory są dopisywane bez zmiany wcześniejszych. Tekst nie trafia do plików zapisu; zachowane wydania przechowują swoje dotychczasowe identyfikatory i kolejność. Rozszerzenie treści nie zmienia formatu zapisu v34.

## Audyt redakcyjny 0.8.9

Przeczytano cały katalog: 170 artykułów i 166 ogłoszeń w PL i EN. Przepisano 150 artykułów rozszerzenia, doprecyzowano 10 z pierwotnej próbki i zmieniono 85 ogłoszeń. Pozostałe wpisy zachowano po przeglądzie. [Raport audytu](press-editorial-audit.md) opisuje kryteria, przykłady i spójność tła. Poniższe tabele obejmują wszystkie wpisy; aktualna treść jest w `src/i18n.ts`.

## 170 artykułów po audycie

| ID | Tytuł polski | Dział | Powtórka | Wynik audytu PL/EN |
| --- | --- | --- | --- | --- |
| `reading-circle` | Jedna powieść, 43 chętnych | culture | nie | zachowany |
| `choir` | Próba po drugiej zmianie | culture | nie | doprecyzowany |
| `film-club` | Film poza repertuarem | culture | nie | zachowany |
| `theatre` | Drugie życie kostiumu | craft | nie | zachowany |
| `chess` | Kolejarze przy szachownicy | sport | nie | doprecyzowany |
| `table-tennis` | Po lekcjach przy stole | sport | nie | zachowany |
| `stamps` | Miasto na kopercie | hobby | tak | zachowany |
| `cassette` | Koncert z odbiornika | technology | tak | doprecyzowany |
| `knitting` | Włóczka z odzysku | household | tak | doprecyzowany |
| `darning` | Krawiec od drobnych spraw | craft | tak | zachowany |
| `plants` | Ogród na parapecie | home | tak | zachowany |
| `bread` | Obiad spod kredowej tablicy | kitchen | tak | doprecyzowany |
| `station-clock` | Miasto na dwóch biletach | transport | tak | doprecyzowany |
| `lost-scarf` | Magazyn rzeczy niczyich | everyday | nie | zachowany |
| `handwriting` | Co mówi szkolny zeszyt | education | nie | zachowany |
| `aquarium` | Podwodny świat w świetlicy | hobby | nie | doprecyzowany |
| `bookbinding` | Rocznik w twardej oprawie | craft | tak | zachowany |
| `starlight` | Niebo znad kamienic | science | tak | doprecyzowany |
| `noticeboard` | Czyja kolej do suszarni? | community | nie | doprecyzowany |
| `bicycle` | Rower szuka kąta | technology | tak | doprecyzowany |
| `prompter` | Głos spod sceny | culture | tak | przepisany |
| `cinema-booth` | Okno nad widownią | culture | tak | przepisany |
| `score-library` | Nuty do zwrotu | culture | tak | przepisany |
| `poster-lettering` | Afisz spod pędzla | culture | tak | przepisany |
| `puppet-tour` | Scena w dwóch walizach | culture | nie | przepisany |
| `accordion-duet` | Dwa akordeony | culture | nie | przepisany |
| `matinee-survey` | Kto chodzi na poranki | culture | nie | przepisany |
| `dance-shoes` | Walce na zmianę | culture | nie | przepisany |
| `recitation-finals` | Wiersz bez mikrofonu | culture | nie | przepisany |
| `folk-recording` | Taśma z okolic miasta | culture | nie | przepisany |
| `reading-room` | Gazeta na drewnie | culture | tak | przepisany |
| `portrait-studio` | Przed obiektywem | culture | tak | przepisany |
| `museum-labels` | Mała kartka w gablocie | culture | tak | przepisany |
| `book-cart` | Biblioteka na kółkach | culture | tak | przepisany |
| `photo-exhibition` | Podwórka na wystawie | culture | nie | przepisany |
| `poetry-evening` | Autor przy małym stole | culture | nie | przepisany |
| `museum-donation` | Album bez podpisów | culture | nie | przepisany |
| `radio-play` | Kroki z pudełka | culture | nie | przepisany |
| `poster-collection` | Repertuar sprzed lat | culture | nie | przepisany |
| `book-display` | Książki z drugiej półki | culture | nie | przepisany |
| `umbrella-ribs` | Pod jedną czaszą | craft | tak | przepisany |
| `shoe-lasts` | But na prawidle | craft | tak | przepisany |
| `brush-maker` | Włosie w równym rzędzie | craft | tak | przepisany |
| `frame-shop` | Rama do wspomnienia | craft | tak | przepisany |
| `upholstery-course` | Krzesło na warsztacie | craft | nie | przepisany |
| `engraver-cup` | Miejsce na nazwisko | craft | nie | przepisany |
| `ceramic-glaze` | Kolor po wypale | craft | nie | przepisany |
| `joinery-drawer` | Szuflada według miary | craft | nie | przepisany |
| `weaving-sample` | Wzór zapisany nitką | craft | nie | przepisany |
| `locksmith-apprentice` | Klucz bez wzoru | craft | nie | przepisany |
| `book-gilding` | Litery na grzbiecie | craft | tak | przepisany |
| `scissors-grinder` | Ostrze i zawias | craft | tak | przepisany |
| `basket-work` | Kosz przed targiem | craft | tak | przepisany |
| `watch-parts` | Części pod numerem | craft | tak | przepisany |
| `leather-satchel` | Tornister po starszym | craft | nie | przepisany |
| `plaster-mould` | Kopia małego liścia | craft | nie | przepisany |
| `hat-block` | Kapelusz odzyskał kształt | craft | nie | przepisany |
| `metal-signs` | Numer czytelny z bramy | craft | nie | przepisany |
| `pottery-jug` | Dzbanek według rysunku | craft | nie | przepisany |
| `carving-letters` | Deska dla kronikarza | craft | nie | przepisany |
| `club-kit` | Koszulki według numerów | sport | tak | przepisany |
| `referee-notebook` | Gwizdek i notes | sport | tak | przepisany |
| `pool-lanes` | Tor dla każdego | sport | tak | przepisany |
| `running-log` | Kilometry w zeszycie | sport | tak | przepisany |
| `volleyball-shift` | Siatka po godzinach | sport | nie | przepisany |
| `cross-country` | Meta przy starej bramie | sport | nie | przepisany |
| `boxing-score` | Punkty dla juniorów | sport | nie | przepisany |
| `handball-goalkeeper` | Bramkarz z rezerwy | sport | nie | przepisany |
| `relay-baton` | Pałeczka bez pośpiechu | sport | nie | przepisany |
| `chess-clock` | Partia do odtworzenia | sport | nie | przepisany |
| `model-railway` | Rozkład na małym torze | hobby | tak | przepisany |
| `coin-cabinet` | Moneta z historią | hobby | tak | przepisany |
| `postcard-box` | Widokówki w pudełku | hobby | tak | przepisany |
| `amateur-radio` | Głos zapisany w dzienniku | hobby | tak | przepisany |
| `model-boat` | Próba na małej wodzie | hobby | nie | przepisany |
| `philately-swap` | Znaczek za kopertę | hobby | nie | przepisany |
| `fish-show` | Akwarium z podpisem | hobby | nie | przepisany |
| `photo-darkroom` | Odbitka z jednego filmu | hobby | nie | przepisany |
| `boardgame-evening` | Pionki do policzenia | hobby | nie | przepisany |
| `mineral-display` | Kamienie z podpisami | hobby | nie | przepisany |
| `radio-aerial` | Antena przy oknie | technology | tak | przepisany |
| `typewriter-ribbon` | Oryginał i dwie kopie | technology | tak | przepisany |
| `tape-index` | Co jest na stronie B | technology | tak | przepisany |
| `bicycle-dynamo` | Światło od koła | technology | tak | przepisany |
| `slide-projector` | Obraz na jasnej ścianie | technology | nie | przepisany |
| `workshop-meter` | Wskazówka na próbę | technology | nie | przepisany |
| `sewing-maintenance` | Maszyna po przeglądzie | technology | nie | przepisany |
| `telephone-display` | Słuchawki z różnych lat | technology | nie | przepisany |
| `record-speed` | Płyta we właściwym tempie | technology | nie | przepisany |
| `drafting-tools` | Krzywa według wzoru | technology | nie | przepisany |
| `button-tin` | Pudełko po herbacie | household | tak | przepisany |
| `sheet-hems` | Pościel na mniejsze łóżko | household | tak | przepisany |
| `shopping-bag` | Torba z poszewki | household | tak | przepisany |
| `leftover-yarn` | Resztki dla początkujących | household | tak | przepisany |
| `repair-evening` | Wieczór z igłą | household | nie | przepisany |
| `linen-swap` | Obrus na inny stół | household | nie | przepisany |
| `recipe-index` | Zeszyt odzyskał spis | household | nie | przepisany |
| `curtain-measure` | Firanka na właściwe okno | household | nie | przepisany |
| `patchwork-cover` | Narzuta ze skrawków | household | nie | przepisany |
| `shopping-notes` | Lista z dwóch stron | household | nie | przepisany |
| `shared-landing` | Półka na półpiętrze | home | tak | przepisany |
| `folding-table` | Stół na większą rodzinę | home | tak | przepisany |
| `window-sill` | Parapet ma swoje strony | home | tak | przepisany |
| `family-bookshelf` | Książki na dwa rzędy | home | tak | przepisany |
| `room-divider` | Regał podzielił pokój | home | nie | przepisany |
| `stairwell-curtains` | Okno wspólnej klatki | home | nie | przepisany |
| `furniture-plan` | Miara przed zakupem | home | nie | przepisany |
| `plant-cuttings` | Sadzonka z nazwiskiem | home | nie | przepisany |
| `child-desk` | Biurko po starszej siostrze | home | nie | przepisany |
| `coat-hooks` | Wieszak na dobrej wysokości | home | nie | przepisany |
| `soup-ladle` | Obiad na dwie zmiany | kitchen | tak | przepisany |
| `market-scales` | Jabłka z rodzinnego sadu | kitchen | tak | przepisany |
| `canteen-tray` | Taca wraca do okienka | kitchen | tak | przepisany |
| `family-dumplings` | Pierogi w kilka par rąk | kitchen | tak | przepisany |
| `bakery-visitors` | Chleb przed świtem | kitchen | nie | przepisany |
| `recipe-contest` | Przepis z dopiskiem | kitchen | nie | przepisany |
| `school-sandwiches` | Śniadanie z własnej torby | kitchen | nie | przepisany |
| `market-baskets` | Zakupy czekają przy ladzie | kitchen | nie | przepisany |
| `tea-service` | Filiżanki nie do pary | kitchen | nie | przepisany |
| `potato-varieties` | Ziemniak ma swoją nazwę | kitchen | nie | przepisany |
| `tram-terminus` | Kilka minut na pętli | transport | tak | przepisany |
| `luggage-label` | Walizka z karteczką | transport | tak | przepisany |
| `railway-porter` | Wózek zna każdy próg | transport | tak | przepisany |
| `bus-ticket-book` | Bilet w małym okienku | transport | tak | przepisany |
| `route-map` | Mapa dla przyjezdnych | transport | nie | przepisany |
| `commuter-survey` | Przesiadka w zeszycie | transport | nie | przepisany |
| `bicycle-rack` | Miejsce przy bramie | transport | nie | przepisany |
| `station-signs` | Strzałka z drugiej strony | transport | nie | przepisany |
| `walking-club` | Trasa według kroków | transport | nie | przepisany |
| `tram-model` | Wagon na szkolnym stole | transport | nie | przepisany |
| `cloakroom-tokens` | Numerek do kieszeni | everyday | tak | przepisany |
| `letter-carrier` | Adres znany od lat | everyday | tak | przepisany |
| `barber-mirror` | Rozmowa przed lustrem | everyday | tak | przepisany |
| `porter-ledger` | Wiadomość u portiera | everyday | tak | przepisany |
| `lost-glasses` | Okulary znalazły drogę | everyday | nie | przepisany |
| `queue-seats` | Krzesła przy okienku | everyday | nie | przepisany |
| `family-photo-names` | Kto stoi obok ciotki | everyday | nie | przepisany |
| `returning-umbrella` | Parasol wrócił do kina | everyday | nie | przepisany |
| `market-bench` | Ławka przesunięta o krok | everyday | nie | przepisany |
| `address-correction` | Dwa wejścia, jeden list | everyday | nie | przepisany |
| `chalk-board` | Tablica przed lekcją | education | tak | przepisany |
| `exercise-book` | Margines na poprawkę | education | tak | przepisany |
| `school-map` | Mapa wraca do tuby | education | tak | przepisany |
| `evening-students` | Zeszyt po pracy | education | tak | przepisany |
| `spelling-contest` | Dyktando z komentarzem | education | nie | przepisany |
| `school-garden-plan` | Grządka na papierze | education | nie | przepisany |
| `reading-pairs` | Starszy czyta młodszemu | education | nie | przepisany |
| `geometry-models` | Bryła z rozłożonej kartki | education | nie | przepisany |
| `school-newspaper` | Szkolne koła w gazetce | education | nie | przepisany |
| `workshop-aprons` | Fartuch z własną kieszenią | education | nie | przepisany |
| `weather-notebook` | Pogoda z tego podwórza | science | tak | przepisany |
| `shadow-dial` | Cień zmienia miejsce | science | tak | przepisany |
| `leaf-collection` | Liść i miejsce znalezienia | science | tak | przepisany |
| `magnifier-table` | Zwykła nitka pod lupą | science | tak | przepisany |
| `star-chart` | Niebo na szkolnej mapie | science | nie | przepisany |
| `water-level` | Ten sam poziom | science | nie | przepisany |
| `seed-observation` | Kiełek w dwóch zeszytach | science | nie | przepisany |
| `sound-string` | Dźwięk według długości | science | nie | przepisany |
| `soil-jars` | Ziemia z kilku miejsc | science | nie | przepisany |
| `bridge-paper` | Most z jednej kartki | science | nie | przepisany |
| `common-key` | Klucz z dużą zawieszką | community | tak | przepisany |
| `allotment-path` | Ścieżka między płotami | community | tak | przepisany |
| `neighbour-tools` | Wiertarka w zeszycie | community | tak | przepisany |
| `noticeboard-space` | Kartka ma swój termin | community | tak | przepisany |
| `laundry-roster` | Pralnia z wolnym okienkiem | community | nie | przepisany |
| `club-bookcase` | Regał dla świetlicy | community | nie | przepisany |
| `bench-painting` | Ławka z odnowionym oparciem | community | nie | przepisany |
| `allotment-library` | Poradniki pod wspólnym kluczem | community | nie | przepisany |
| `shared-room-hours` | Godziny na jednej kartce | community | nie | przepisany |
| `courtyard-chronicle` | Kronika jednego podwórza | community | nie | przepisany |

## 166 ogłoszeń po audycie

| ID | Kontakt telefoniczny | Wynik audytu PL/EN |
| --- | --- | --- |
| `sewing-machine` | 46-28-15 | zachowane |
| `sideboard` | 32-71-08 | zachowane |
| `pram` | 58-14-26 | zmienione |
| `radio-repair` | 27-63-40 | zachowane |
| `piano-lessons` | 41-85-32 | zachowane |
| `garage` | 63-20-74 | zmienione |
| `typewriter` | 35-49-18 | zachowane |
| `bicycle-parts` | 52-16-83 | zachowane |
| `books` | nie | zmienione |
| `jars` | nie | zachowane |
| `lost-keys` | nie | zmienione |
| `allotment` | nie | zmienione |
| `knitting-help` | nie | zachowane |
| `room` | nie | zmienione |
| `records` | nie | zmienione |
| `clock-repair` | nie | zachowane |
| `coal-scuttle` | nie | zachowane |
| `curtain-rods` | nie | zmienione |
| `children-skates` | nie | zmienione |
| `violin-case` | nie | zmienione |
| `sofa-bed` | 48-21-36 | zachowane |
| `jam-pots` | nie | zmienione |
| `music-stand` | nie | zmienione |
| `wool-remnants` | nie | zachowane |
| `pram-wheels` | nie | zachowane |
| `piano-tuning` | 36-72-19 | zachowane |
| `chess-set` | nie | zmienione |
| `travel-trunk` | nie | zmienione |
| `plant-pots` | nie | zachowane |
| `school-atlas` | nie | zmienione |
| `handcart` | 57-34-20 | zachowane |
| `spare-buttons` | nie | zachowane |
| `found-mittens` | nie | zmienione |
| `bookends` | nie | zachowane |
| `coat-alteration` | nie | zmienione |
| `mandolin` | 24-69-53 | zachowane |
| `photo-albums` | nie | zachowane |
| `folding-stool` | nie | zachowane |
| `wood-offcuts` | nie | zachowane |
| `travel-chess` | nie | zmienione |
| `electric-iron` | 62-18-45 | zmienione |
| `baking-tins` | nie | zmienione |
| `sewing-patterns` | nie | zachowane |
| `record-sleeves` | nie | zmienione |
| `allotment-bench` | nie | zmienione |
| `accordion-sale` | 43-56-27 | zmienione |
| `curtain-sewing` | nie | zachowane |
| `bicycle-basket` | nie | zmienione |
| `reading-lamp` | nie | zachowane |
| `schoolbag-sale` | nie | zachowane |
| `wardrobe-mirror` | 51-83-24 | zachowane |
| `knitting-needles` | nie | zmienione |
| `old-magazines` | nie | zmienione |
| `garden-rake` | nie | zmienione |
| `found-scarf` | nie | zmienione |
| `reel-recorder` | 29-47-61 | zachowane |
| `copper-kettle` | nie | zachowane |
| `embroidered-cloth` | nie | zachowane |
| `baby-clothes` | nie | zmienione |
| `photo-enlarger` | nie | zmienione |
| `furniture-moving` | 38-65-12 | zachowane |
| `wooden-sled` | nie | zachowane |
| `cookbooks` | nie | zachowane |
| `plant-stand` | nie | zachowane |
| `chess-opponent` | nie | zmienione |
| `violin-lessons` | 65-23-48 | zachowane |
| `suitcase-straps` | nie | zmienione |
| `radio-cabinet` | nie | zachowane |
| `children-books` | nie | zmienione |
| `wall-map` | nie | zmienione |
| `clock-sale` | 47-19-62 | zachowane |
| `wooden-hangers` | nie | zachowane |
| `garden-chair` | nie | zmienione |
| `ink-bottles` | nie | zmienione |
| `knitting-books` | nie | zachowane |
| `car-seat-covers` | 33-82-56 | zmienione |
| `found-notebook` | nie | zmienione |
| `chair-caning` | nie | zachowane |
| `postcard-exchange` | nie | zachowane |
| `coffee-grinder` | nie | zmienione |
| `portable-radio` | 56-31-79 | zachowane |
| `table-leaf` | nie | zachowane |
| `glass-vases` | nie | zachowane |
| `children-costumes` | nie | zachowane |
| `fishing-float` | nie | zmienione |
| `sewing-table` | 28-54-63 | zachowane |
| `coat-lining` | nie | zmienione |
| `record-brush` | nie | zmienione |
| `seed-boxes` | nie | zmienione |
| `found-pencilcase` | nie | zmienione |
| `armchair-pair` | 44-78-23 | zachowane |
| `theatre-programmes` | nie | zmienione |
| `travelling-chest` | nie | zmienione |
| `wicker-basket` | nie | zmienione |
| `needlework-frame` | nie | zachowane |
| `room-painting` | 61-42-85 | zachowane |
| `old-spectacle-case` | nie | zmienione |
| `book-binding` | nie | zachowane |
| `school-uniform` | nie | zachowane |
| `photo-trays` | nie | zachowane |
| `folding-bike` | 37-26-54 | zachowane |
| `watercolour-box` | nie | zachowane |
| `chess-books` | nie | zmienione |
| `curtain-hooks` | nie | zachowane |
| `school-compass` | nie | zachowane |
| `typing-service` | 53-64-18 | zachowane |
| `allotment-watercan` | nie | zmienione |
| `small-rug` | nie | zmienione |
| `bottle-crates` | nie | zmienione |
| `language-practice` | nie | zmienione |
| `car-roof-rack` | 26-91-43 | zmienione |
| `portrait-drawing` | nie | zmienione |
| `children-gloves` | nie | zmienione |
| `tapes-for-records` | nie | zmienione |
| `wooden-toys` | nie | zachowane |
| `desk-sale` | 49-35-72 | zachowane |
| `reading-help` | nie | zachowane |
| `chess-clock-ad` | nie | zmienione |
| `kitchen-stool` | nie | zachowane |
| `found-sheet-music` | nie | zmienione |
| `carpet-weaving` | 34-57-82 | zachowane |
| `model-paint` | nie | zachowane |
| `old-city-photos` | nie | zmienione |
| `hat-box` | nie | zachowane |
| `mending-basket` | nie | zmienione |
| `double-bed` | 58-46-13 | zachowane |
| `curtain-remnants` | nie | zachowane |
| `walking-companion` | nie | zmienione |
| `plant-identification` | nie | zmienione |
| `folding-screen` | nie | zachowane |
| `camera-sale` | 42-68-35 | zachowane |
| `book-jackets` | nie | zmienione |
| `found-shopping-bag` | nie | zmienione |
| `thread-spools` | nie | zachowane |
| `picture-glass` | nie | zachowane |
| `room-to-let` | 64-29-57 | zmienione |
| `poetry-copying` | nie | zmienione |
| `found-brooch` | nie | zmienione |
| `school-desk-ad` | nie | zmienione |
| `empty-tins` | nie | zmienione |
| `sheet-music-copy` | nie | zmienione |
| `picture-hook` | nie | zmienione |
| `borrowed-ladder` | nie | zachowane |
| `wooden-puzzle` | nie | zmienione |
| `sewing-foot` | nie | zachowane |
| `family-album-help` | nie | zmienione |
| `chess-pieces` | nie | zmienione |
| `found-keyring` | nie | zmienione |
| `carpentry-help` | nie | zachowane |
| `potted-geranium` | nie | zachowane |
| `choir-singers` | nie | zachowane |
| `wooden-cradle` | nie | zmienione |
| `found-beret` | nie | zachowane |
| `recipe-swap` | nie | zmienione |
| `old-calendar` | nie | zachowane |
| `portrait-frame` | nie | zachowane |
| `fabric-samples` | nie | zachowane |
| `window-box` | nie | zmienione |
| `borrowed-book` | nie | zmienione |
| `umbrella-handle` | nie | zmienione |
| `lesson-notes` | nie | zachowane |
| `clothes-pegs` | nie | zmienione |
| `found-wristwatch` | nie | zmienione |
| `model-cardboard` | nie | zachowane |
| `weaving-shuttle` | nie | zmienione |
| `walking-maps` | nie | zmienione |
