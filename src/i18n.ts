import { LEGACY_CASE_COUNT, PATIENTS, patientIdentity } from './core/patients';
import { storyPatientForId } from './core/story-patients';

// Localized copy is indexed by stable case IDs. Authored name corrections also apply to archived paperwork.
const patientCopy = {
  pl: {
    names: ["Irena Wolska", "Leon Burek", "Marta Lis", "Anna Łuczak", "Roman Gajda", "Ewa Król", "Paweł Wrona", "Zofia Maj", "Stefan Dudek", "Lidia Żak", "Edward Kłos", "Halina Wójcik", "Adam Wilk", "Halina Kubiak", "Jan Sokół", "Barbara Cicha", "Marek Łoś", "Olga Bąk", "Wiktor Sowa", "Alicja Mróz", "Piotr Górka", "Jadwiga Polna", "Henryk Las", "Danuta Wąs", "Jerzy Lisek", "Danuta Walczak", "Andrzej Kubiak", "Maria Sęk", "Janusz Adamczyk", "Helena Kość", "Franciszek Jarząb", "Ewa Michalska", "Bogdan Krawiec", "Łucja Leśna", "Emil Różycki", "Krystyna Wydra", "Józef Kaczmarek", "Iwona Głaz", "Zbigniew Turek", "Renata Witek", "Jerzy Malicki", "Grażyna Brzoza", "Piotr Marciniak", "Urszula Wichura", "Dariusz Kłosik", "Celina Jastrząb", "Andrzej Piątek", "Monika Sitko", "Kazimierz Rożek", "Teresa Kaczmarek", "Leszek Kędra", "Bożena Szczygieł", "Ryszard Zając", "Wanda Czapla", "Sylwester Dąb", "Regina Kurek", "Artur Jeż", "Joanna Kalina", "Marian Głóg", "Alina Rosa", "Rafał Sitar", "Lucyna Wrzos", "Hubert Cichy", "Kinga Rój", "Tadeusz Kania", "Genowefa Biel", "Łukasz Bór", "Janina Cedro", "Michał Malicki", "Sabina Ruda", "Bartosz Kret", "Aniela Drozd", "Józef Czerwiak", "Dorota Gaj", "Ignacy Duda", "Agata Sikora", "Daniel Rzepka", "Gabriela Żyto", "Wiesław Żmuda", "Bogusław Cisek", "Czesław Pawlik", "Mieczysław Zięba", "Władysław Kocioł", "Grzegorz Jastrząb", "Sławomir Klimek", "Zdzisław Gąsior", "Mirosław Janik", "Bronisław Wójcik", "Michał Wysocki", "Robert Cieślik", "Wojciech Balicki", "Stanisław Żarski", "Kazimierz Bystroń", "Wacław Żelazny", "Natalia Błach", "Brunon Węglarz", "Elżbieta Wąsik", "Alojzy Szlaka", "Bogumiła Bednarz", "Maksymilian Rąb", "Stanisława Janik", "Bolesław Płomień", "Renata Łoza"],
    identityNames: [
      ["Irena Górska", "Ewa Wierna", "Teresa Kępa", "Anna Wolska", "Maria Lipiec"],
      ["Leon Wroński", "Roman Błasik", "Stefan Witek", "Jan Bukowski", "Henryk Cegła"],
      ["Marta Jodła", "Zofia Dębska", "Halina Bielec", "Jadwiga Młyn", "Barbara Kłos"],
      ["Anna Brzoza", "Ewa Malina", "Olga Zielna", "Lidia Kurek", "Iwona Łącka"],
      ["Roman Łęcki", "Henryk Bork", "Stefan Cedro", "Witold Jurek", "Jan Struga"],
      ["Ewa Mrozek", "Teresa Staw", "Irena Dąbek", "Maria Witek", "Alicja Grab"],
      ["Paweł Borek", "Marek Gruda", "Piotr Gacek", "Adam Młyn", "Jerzy Orlik"],
      ["Zofia Gaj", "Jadwiga Kurek", "Maria Wrona", "Halina Sikora", "Barbara Bór"],
      ["Stefan Polak", "Henryk Szpak", "Roman Biela", "Jan Klon", "Witold Las"],
      ["Lidia Łęcka", "Iwona Czapla", "Ewa Łan", "Anna Wrzos", "Alicja Cicha"],
      ["Edward Jodła", "Wiktor Chmiel", "Jerzy Kurek", "Henryk Góral", "Stanisław Bór"],
      ["Halina Mazur", "Teresa Wolska", "Irena Łącka", "Zofia Biela", "Barbara Rak"],
      ["Adam Ruda", "Paweł Kania", "Marek Kret", "Piotr Żyto", "Tomasz Biela"],
      ["Halina Kubiak", "Teresa Jaworska", "Irena Malicka", "Zofia Sadowska", "Barbara Rogala"],
      ["Jan Łuczak", "Roman Jawor", "Henryk Wilk", "Stefan Brzeg", "Jerzy Głaz"],
      ["Barbara Kania", "Halina Ruda", "Maria Cedro", "Jadwiga Wrona", "Irena Gaj"],
      ["Marek Pióro", "Paweł Zimny", "Tomasz Kłos", "Adam Ptak", "Piotr Wilga"],
      ["Olga Wilga", "Nina Wolska", "Ewa Rój", "Anna Kłos", "Kinga Dąb"],
      ["Wiktor Wierny", "Jerzy Bielski", "Edward Sitar", "Henryk Duda", "Stefan Jaśko"],
      ["Alicja Bork", "Irena Rosa", "Teresa Żur", "Ewa Chmiel", "Maria Kret"],
      ["Piotr Jaskier", "Paweł Kłosik", "Marek Sowa", "Adam Migała", "Tomasz Bąk"],
      ["Jadwiga Jodła", "Zofia Cicha", "Maria Kępa", "Halina Bór", "Barbara Wrona"],
      ["Henryk Żuk", "Jerzy Łącki", "Roman Wrona", "Jan Wierny", "Stefan Jodła"],
      ["Danuta Gaj", "Ewa Struga", "Anna Wierna", "Lidia Ruda", "Iwona Klon"],
      ["Jerzy Staw", "Henryk Cichy", "Roman Kłosik", "Stefan Wrona", "Witold Rzepka"],
      ["Danuta Walczak", "Ewa Zawada", "Anna Michalak", "Lidia Sobczak", "Iwona Rataj"],
      ["Andrzej Kubiak", "Marek Sadowski", "Paweł Ratajczak", "Roman Marciniak", "Wiesław Sobota"],
      ["Maria Jaśko", "Halina Śliwa", "Barbara Mrozek", "Irena Biela", "Zofia Pióro"],
      ["Janusz Adamczyk", "Zbigniew Czerwiński", "Ryszard Pawlak", "Bogdan Woźniak", "Krzysztof Sobczak"],
      ["Helena Sowa", "Maria Rybak", "Irena Żyto", "Ewa Róża", "Teresa Czapla"],
      ["Franciszek Gaj", "Edward Leśny", "Wiktor Rybak", "Jerzy Górski", "Henryk Ptak"],
      ["Ewa Michalska", "Anna Janicka", "Teresa Walczak", "Iwona Pawlak", "Lidia Wysocka"],
      ["Bogdan Rój", "Marek Wolski", "Paweł Staw", "Adam Mrozek", "Tomasz Ruda"],
      ["Łucja Dąbek", "Halina Wicher", "Maria Sitar", "Barbara Żak", "Irena Wilga"],
      ["Emil Ruda", "Paweł Czajka", "Marek Młyn", "Piotr Klon", "Adam Łęcki"],
      ["Krystyna Las", "Zofia Kret", "Jadwiga Łan", "Halina Duda", "Maria Głaz"],
      ["Józef Kaczmarek", "Kazimierz Wieczorek", "Stanisław Tomczak", "Marian Kubiak", "Henryk Pawlak"],
      ["Iwona Żyto", "Anna Cicha", "Ewa Górka", "Lidia Rzepka", "Teresa Biela"],
      ["Zbigniew Klon", "Wiktor Mazur", "Edward Wolski", "Jerzy Chmiel", "Henryk Lisek"],
      ["Renata Kłos", "Anna Gacek", "Olga Jodła", "Ewa Kurek", "Lidia Szpak"],
      ["Jerzy Malicki", "Wiktor Jaworski", "Tadeusz Zawada", "Roman Sobota", "Andrzej Michalak"],
      ["Grażyna Witek", "Maria Łan", "Irena Duda", "Halina Jaskier", "Barbara Śliwa"],
      ["Piotr Marciniak", "Marek Janicki", "Paweł Czerwiński", "Jacek Kaczmarek", "Tomasz Woźniak"],
      ["Urszula Kłos", "Teresa Jodła", "Maria Bork", "Ewa Sitar", "Irena Rzepka"],
      ["Dariusz Biela", "Marek Wydra", "Paweł Gaj", "Adam Żur", "Tomasz Rosa"],
      ["Celina Wilk", "Jadwiga Gaj", "Zofia Sitar", "Halina Kępa", "Maria Gacek"],
      ["Andrzej Buk", "Roman Rzepka", "Henryk Sitko", "Jan Dąbek", "Stefan Głaz"],
      ["Monika Gaj", "Anna Kret", "Ewa Czajka", "Iwona Struga", "Lidia Malina"],
      ["Kazimierz Łan", "Edward Bork", "Wiktor Kłos", "Jerzy Wydra", "Henryk Brzeg"],
      ["Teresa Kaczmarek", "Barbara Tomczak", "Irena Adamczyk", "Halina Wieczorek", "Danuta Rogala"],
      ["Leszek Ruda", "Marek Głaz", "Paweł Kurek", "Adam Żuk", "Piotr Sitko"],
      ["Bożena Sowa", "Irena Staw", "Maria Polna", "Halina Klon", "Teresa Ptak"],
      ["Ryszard Dąbek", "Edward Wrona", "Wiktor Kret", "Jerzy Rosa", "Henryk Kłos"],
      ["Wanda Biela", "Anna Cedro", "Ewa Żur", "Lidia Wilga", "Iwona Kurek"],
      ["Sylwester Buk", "Roman Struga", "Henryk Wicher", "Jan Gacek", "Stefan Bór"],
      ["Regina Wrona", "Halina Ptak", "Maria Wilk", "Irena Kret", "Zofia Duda"],
      ["Artur Jawor", "Paweł Rój", "Marek Żyto", "Adam Chmiel", "Piotr Ruda"],
      ["Joanna Sitar", "Ewa Żyto", "Anna Rosa", "Iwona Kłos", "Lidia Biela"],
      ["Marian Kępa", "Edward Ptak", "Wiktor Duda", "Jerzy Sitar", "Henryk Jodła"],
      ["Alina Wolska", "Teresa Mrozek", "Maria Żur", "Irena Sowa", "Halina Wydra"],
      ["Rafał Wrona", "Marek Duda", "Paweł Kret", "Adam Żyto", "Piotr Wolski"],
      ["Lucyna Gaj", "Maria Struga", "Irena Kurek", "Halina Brzeg", "Barbara Staw"],
      ["Hubert Bork", "Marek Łan", "Paweł Głaz", "Adam Sitar", "Tomasz Kępa"],
      ["Kinga Wilk", "Olga Ruda", "Anna Dąbek", "Ewa Jodła", "Nina Gaj"],
      ["Tadeusz Cichy", "Edward Ruda", "Wiktor Buk", "Jerzy Biela", "Henryk Gacek"],
      ["Genowefa Staw", "Maria Wierna", "Irena Ptak", "Halina Wrona", "Zofia Żak"],
      ["Łukasz Żur", "Marek Sitar", "Paweł Biela", "Adam Gaj", "Piotr Rzepka"],
      ["Janina Głaz", "Jadwiga Rosa", "Zofia Kłos", "Maria Cicha", "Halina Leśna"],
      ["Michał Malicki", "Piotr Sobota", "Tomasz Rataj", "Jacek Walczak", "Marek Zawada"],
      ["Sabina Kępa", "Teresa Wrona", "Maria Szpak", "Irena Klon", "Halina Gacek"],
      ["Bartosz Łan", "Marek Ptak", "Paweł Rosa", "Adam Wicher", "Tomasz Cedro"],
      ["Aniela Witek", "Zofia Struga", "Jadwiga Żur", "Maria Duda", "Halina Rybak"],
      ["Józef Gaj", "Roman Dąbek", "Henryk Cedro", "Jan Rzepka", "Stefan Wolski"],
      ["Dorota Wrona", "Anna Pióro", "Ewa Brzeg", "Iwona Gacek", "Lidia Kłos"],
      ["Ignacy Wolski", "Edward Gaj", "Wiktor Biela", "Jerzy Dąbek", "Henryk Śliwa"],
      ["Agata Staw", "Teresa Klon", "Maria Malina", "Irena Cicha", "Halina Żyto"],
      ["Daniel Buk", "Paweł Żyto", "Marek Gacek", "Adam Wrona", "Piotr Cegła"],
      ["Gabriela Łan", "Teresa Wilga", "Maria Rzepka", "Irena Głaz", "Halina Czapla"],
      ["Wiesław Żmuda", "Roman Świerk", "Stefan Kula", "Marek Bujak", "Jan Węgrzyn"],
      ["Bogusław Cisek", "Piotr Stach", "Adam Błach", "Jerzy Kos", "Paweł Górecki"],
      ["Czesław Pawlik", "Henryk Buda", "Witold Łoza", "Leon Bryła", "Tomasz Kłosowski"],
      ["Mieczysław Zięba", "Stanisław Gołąb", "Edward Szela", "Wiktor Jurga", "Józef Kuc"],
      ["Władysław Kocioł", "Tadeusz Wąsik", "Franciszek Wójcik", "Ignacy Cieśla", "Marian Żmij"],
      ["Grzegorz Jastrząb", "Artur Wyrwa", "Rafał Witek", "Jacek Zając", "Bartosz Wąski"],
      ["Sławomir Klimek", "Andrzej Szulc", "Dariusz Mazur", "Leszek Jagła", "Krzysztof Suchy"],
      ["Zdzisław Gąsior", "Kazimierz Moskal", "Jerzy Troć", "Roman Węgiel", "Bogdan Łuk"],
      ["Mirosław Janik", "Henryk Płatek", "Jan Ścigała", "Witold Rataj", "Edward Kozioł"],
      ["Bronisław Wójcik", "Stanisław Rybka", "Tadeusz Krupa", "Władysław Serafin", "Franciszek Kłosik"],
      ["Michał Wysocki", "Paweł Skrzydło", "Łukasz Chmura", "Tomasz Żagle", "Artur Słota"],
      ["Robert Cieślik", "Piotr Wietrzny", "Marek Skowronek", "Adam Lotny", "Rafał Szydło"],
      ["Wojciech Balicki", "Andrzej Woźniak", "Jacek Rudzki", "Grzegorz Szpak", "Sławomir Nurek"],
      ["Stanisław Żarski", "Roman Mirski", "Jerzy Karski", "Henryk Dębiec", "Witold Kosma"],
      ["Kazimierz Bystroń", "Edward Rudnik", "Władysław Wierzbicki", "Tadeusz Łukasz", "Marian Płonka"],
      ["Wacław Żelazny", "Marek Płomień", "Paweł Kocioł", "Adam Grot", "Tomasz Kurek"],
      ["Natalia Błach", "Anna Żelazna", "Ewa Płonka", "Iwona Mirska", "Lidia Karska"],
      ["Brunon Węglarz", "Henryk Szyb", "Roman Bednarz", "Jan Pył", "Stefan Kopa"],
      ["Elżbieta Wąsik", "Teresa Cisek", "Maria Woźniak", "Irena Pawlik", "Halina Żmuda"],
      ["Alojzy Szlaka", "Wiktor Żelazny", "Edward Grot", "Jerzy Ogień", "Franciszek Płomień"],
      ["Bogumiła Bednarz", "Halina Węglarz", "Zofia Szyb", "Maria Kopa", "Jadwiga Pył"],
      ["Maksymilian Rąb", "Paweł Pokład", "Marek Filar", "Adam Sztolnia", "Piotr Węglik"],
      ["Stanisława Janik", "Irena Kuc", "Maria Bujak", "Halina Kos", "Zofia Troć"],
      ["Bolesław Płomień", "Tadeusz Żelazny", "Edward Kocioł", "Jerzy Szlaka", "Henryk Ogień"],
      ["Renata Łoza", "Ewa Rataj", "Anna Bryła", "Iwona Wyrwa", "Lidia Gąsior"],
      ["Katarzyna Kaleta", "Magdalena Nita", "Dorota Urban", "Joanna Baran", "Beata Krupa"],
      ["Tomasz Płoski", "Andrzej Kłosiewicz", "Maciej Grzyb", "Krzysztof Wierzbik", "Jacek Błażej"],
      ["Teresa Wrzesińska", "Halina Drobna", "Zofia Różycka", "Danuta Węgorek", "Barbara Kałuża"],
      ["Feliks Szum", "Antoni Zawadzki", "Władysław Michalak", "Józef Twardy", "Edmund Pawlus"],
      ["Małgorzata Świercz", "Renata Jasna", "Alicja Kędzierska", "Grażyna Urbaniak", "Iwona Wrona"],
      ["Bogdan Dębicki", "Kazimierz Olsza", "Leszek Stryj", "Ryszard Konopka", "Dariusz Słomka"],
      ["Helena Wierzbicka", "Janina Nowicka", "Genowefa Osiak", "Stanisława Piórkowska", "Jadwiga Kłosik"],
      ["Marcin Kowalik", "Wojciech Lasek", "Rafał Marczyk", "Grzegorz Kłosowski", "Artur Dębski"],
      ["Elżbieta Suchocka", "Bożena Kaczor", "Lucyna Węgrzyn", "Urszula Stolarz", "Celina Białek"],
      ["Stanisław Żurawski", "Tadeusz Kurowski", "Marian Wątroba", "Wiktor Jasiek", "Zbigniew Owczarek"],
      ["Agnieszka Lech", "Dorota Bielska", "Beata Mokrzycka", "Joanna Kłoska", "Ewa Szafran"],
      ["Mariusz Rybicki", "Jacek Bęben", "Piotr Chrobot", "Marek Węzeł", "Andrzej Drab"],
      ["Władysława Ćwik", "Zofia Narewska", "Irena Łata", "Halina Zięcina", "Maria Cebula"],
      ["Janusz Głowacki", "Roman Chudzik", "Witold Pękala", "Henryk Groch", "Stefan Zadra"],
      ["Ewelina Cholewa", "Anna Żelazek", "Alicja Kłosz", "Teresa Bryk", "Lidia Rumińska"],
      ["Antoni Żebro", "Edmund Skiba", "Feliks Boruta", "Józef Mielec", "Tadeusz Wiór"],
      ["Marta Wysocka", "Olga Klimczak", "Nina Górna", "Kinga Pająk", "Ewa Śliwka"],
      ["Ryszard Dyl", "Wiesław Sędek", "Bogdan Rozmus", "Kazimierz Bruk", "Leszek Łyko"],
      ["Grażyna Czaplińska", "Danuta Żmijka", "Elżbieta Łuk", "Bożena Stępień", "Urszula Jancz"],
      ["Przemysław Kosik", "Maciej Dzięcioł", "Artur Grabek", "Paweł Stasz", "Marcin Wrona"],
      ["Wanda Rudzka", "Jadwiga Bieda", "Janina Żołądź", "Stanisława Kosik", "Helena Wójcicka"],
      ["Krzysztof Polek", "Dariusz Kołek", "Zbigniew Bocheń", "Marek Oset", "Jerzy Pakuła"],
      ["Monika Włodarz", "Renata Głowacka", "Joanna Chruściel", "Dorota Ząbek", "Iwona Malec"],
      ["Stanisław Darski", "Edward Wrzosik", "Marian Ujazd", "Wiktor Głuszek", "Leon Matusz"],
      ["Krystyna Żegota", "Barbara Skrzyp", "Teresa Witek", "Halina Dębina", "Maria Bielik"],
      ["Szymon Świerczek", "Tomasz Lisowski", "Rafał Rojek", "Adam Bilski", "Piotr Łopian"],
      ["Sabina Skowron", "Lucyna Brzezińska", "Regina Pilch", "Zofia Puch", "Irena Kulesza"],
      ["Waldemar Cieplik", "Marek Budzik", "Paweł Gron", "Jacek Łęg", "Grzegorz Rączka"],
      ["Małgorzata Błaszcz", "Elżbieta Domańska", "Beata Królak", "Alicja Mirek", "Danuta Górka"],
      ["Władysław Szeląg", "Franciszek Miłek", "Antoni Chrzan", "Edmund Różycki", "Ignacy Skalski"],
      ["Katarzyna Cieślak", "Magdalena Żukowska", "Agata Wierzbna", "Joanna Korzeń", "Olga Strzelczyk"],
      ["Wojciech Ręka", "Andrzej Wąchała", "Henryk Lato", "Janusz Grzelak", "Roman Kocur"],
      ["Genowefa Zięba", "Stanisława Piwko", "Halina Skorek", "Jadwiga Ruczaj", "Maria Olszyna"],
      ["Michał Szczepan", "Robert Młotek", "Tomasz Grusza", "Maciej Wójta", "Artur Kłosowicz"],
      ["Dorota Brzeźna", "Renata Nóżka", "Alicja Kłosik", "Iwona Szczęsna", "Lidia Czeremcha"],
      ["Klara Boruta", "Aneta Chaber", "Eliza Flis", "Nina Górecka", "Marta Hubka"],
      ["Grzegorz Bałka", "Robert Chudek", "Wojciech Cygan", "Andrzej Filar", "Janusz Holka"],
      ["Łucja Bławat", "Wanda Czernik", "Regina Furman", "Alina Gałąź", "Irena Jędra"],
      ["Paweł Cieślak", "Marek Ratajczak", "Piotr Sadowski", "Tomasz Michalak", "Jacek Jaworski"],
      ["Karolina Dęba", "Sylwia Foryś", "Joanna Graba", "Beata Hada", "Dorota Jaśmin"],
      ["Edmund Baran", "Feliks Czarnek", "Antoni Drab", "Władysław Gont", "Mieczysław Huta"],
      ["Halina Marciniak", "Teresa Woźniak", "Barbara Janicka", "Irena Czerwińska", "Zofia Pawlak"],
      ["Maciej Balon", "Tomasz Cieśla", "Artur Dębak", "Michał Fita", "Marcin Garstka"],
      ["Aniela Białek", "Janina Dąbrowa", "Helena Fedor", "Zofia Grom", "Genowefa Hara"],
      ["Zygmunt Boruta", "Bogdan Cebula", "Kazimierz Dolec", "Ryszard Foks", "Leszek Gajek"],
      ["Magda Borowik", "Katarzyna Czajda", "Agata Dyl", "Ewelina Figa", "Monika Gil"],
      ["Mariusz Bożek", "Dariusz Cybulski", "Jacek Drzewo", "Rafał Fabia", "Paweł Gola"],
      ["Bożena Burek", "Teresa Cierń", "Grażyna Deka", "Krystyna Fiołek", "Halina Glinka"],
      ["Filip Bratek", "Kamil Cisek", "Marek Dudziak", "Szymon Fajt", "Piotr Gaweł"],
      ["Ewa Bułka", "Anna Cebula", "Renata Drobna", "Iwona Firlej", "Danuta Grzelak"],
      ["Stanisław Bryła", "Józef Czajka", "Edward Drwal", "Ignacy Felek", "Franciszek Grot"],
      ["Paulina Brzeźna", "Lidia Cichoń", "Olga Dębak", "Alicja Fura", "Urszula Gajda"],
      ["Ryszard Tomczak", "Zbigniew Kubiak", "Jerzy Adamczyk", "Wiesław Wieczorek", "Marian Rogala"],
      ["Maria Brzana", "Jadwiga Czubat", "Barbara Dudek", "Stanisława Flis", "Zdzisława Gawra"],
      ["Bartosz Bujak", "Łukasz Cierń", "Tadeusz Dymek", "Witold Fugas", "Wiktor Gajda"],
      ["Ada Brzęk", "Anita Cegła", "Julita Drozd", "Kinga Florek", "Laura Guzik"],
      ["Henryk Brzeźny", "Leon Chaber", "Marian Dudek", "Roman Furtak", "Stefan Graboń"],
      ["Izabela Bujak", "Sabina Chmura", "Celina Dubiel", "Joanna Fudała", "Lucyna Gierka"],
      ["Konrad Bury", "Radosław Cichy", "Wojciech Dyl", "Damian Fiszer", "Mateusz Gucwa"],
      ["Cecylia Burda", "Leokadia Cholewa", "Wiesława Dyl", "Melania Fuks", "Władysława Gruca"],
      ["Marek Białas", "Andrzej Cudny", "Janusz Dudała", "Ryszard Faber", "Jerzy Gonet"],
      ["Natalia Bruk", "Sylwia Czapnik", "Eliza Derda", "Klara Falisz", "Aneta Gajek"],
      ["Witold Borecki", "Zbigniew Cegła", "Edmund Darłak", "Tadeusz Fijał", "Wiktor Górka"],
      ["Elżbieta Brzeg", "Regina Chuda", "Wanda Dygas", "Halina Filas", "Grażyna Gęba"],
      ["Piotr Malicki", "Marek Pawlak", "Paweł Sobczak", "Tomasz Kubiak", "Jacek Sadowski"],
      ["Alicja Borucka", "Ewa Ćwik", "Danuta Drabik", "Iwona Fota", "Renata Gajdos"],
      ["Antoni Bystrek", "Franciszek Czop", "Ignacy Dęba", "Feliks Fara", "Władysław Gruszka"],
      ["Iga Bzowa", "Maja Cichoń", "Lena Durna", "Nina Fajka", "Ada Głowacka"],
      ["Andrzej Kaczmarek", "Wojciech Marciniak", "Janusz Rataj", "Ryszard Zawada", "Zbigniew Walczak"],
      ["Jadwiga Malicka", "Zofia Tomczak", "Genowefa Woźniak", "Helena Sadowska", "Stanisława Kubiak"],
      ["Kazimierz Borek", "Leszek Cholewa", "Bogdan Dobrzań", "Zygmunt Frączek", "Czesław Gubała"],
      ["Anna Adamczyk", "Ewa Jaworska", "Iwona Marciniak", "Danuta Janicka", "Teresa Rataj"],
      ["Kamil Brzozowy", "Filip Chudek", "Szymon Dera", "Marcin Fojcik", "Maciej Gębala"],
      ["Krystyna Brzeska", "Bożena Cuber", "Teresa Dorosz", "Maria Fudala", "Zofia Grabska"],
      ["Jacek Barcz", "Mariusz Cebula", "Grzegorz Długosz", "Robert Fita", "Dariusz Gondek"],
      ["Ewa Rogala", "Anna Kubiak", "Iwona Malicka", "Lidia Tomczak", "Teresa Sadowska"],
      ["Bolesław Bruk", "Wacław Cieśla", "Mieczysław Dera", "Stanisław Furgol", "Józef Gruba"],
      ["Dorota Błysk", "Urszula Chaberska", "Małgorzata Dera", "Lidia Fila", "Celina Gorczyca"],
      ["Paweł Bednarek", "Tomasz Chojka", "Rafał Dudka", "Artur Fronczek", "Michał Gręda"],
      ["Helena Bzowska", "Janina Ćwikła", "Łucja Dryga", "Aniela Fila", "Genowefa Gruda"],
      ["Stanisław Adamczyk", "Henryk Kaczmarek", "Józef Sadowski", "Marian Walczak", "Kazimierz Pawlak"],
      ["Joanna Banasik", "Monika Chmurka", "Beata Dębiec", "Agata Folta", "Katarzyna Grys"],
      ["Piotr Bęben", "Adam Chowaniec", "Bartosz Dziuba", "Łukasz Fojut", "Marek Grześ"],
      ["Anna Bereza", "Irena Chrobak", "Renata Domagała", "Grażyna Fita", "Halina Gudej"],
      ["Marcin Blicharz", "Mariusz Chrzan", "Jacek Dobosz", "Robert Filar", "Dariusz Gruszka"],
    ],
    employers: ['Archiwum Zakładów Brzask', 'Zakłady Mechaniczne Ogniwo', 'Przewozy Pracownicze Szlak', 'Tkalnia Osnowa', 'Warsztat Nit', 'Szkoła Zawodowa', 'Skład Towarowy', 'Biuro Zaopatrzenia', "Drukarnia Margines", "Spółdzielnia Trybik", "Pracownia Ścieg", "Piekarnia Kłos", "Stołówka zakładowa", "Zakład Zieleni", "Urząd Pocztowy", "Służba Techniczna", "Laboratorium Próba", "Pralnia Fala", "Zarząd Kolei", "Dom Wypoczynkowy", "Uniwersytet", "Biblioteka Czytelnia", "Biuro Projektowe", "Stolarnia Słój", "Komenda milicji", "Zespół lotniczy", "Kopalnia Głębia", "Zakłady Remontowe Tor", "Zakłady Meblarskie Brzoza", "Zakłady Tekstylne Osnowa", "Wytwórnia Kabli Przewód", "Zakłady Ceramiczne Klinkier", "Transport Miejski", "Zakłady Obrabiarek Wektor", "Usługi Porządkowe", "Państwowa Drukarnia", "Miejska Elektrociepłownia", "Komenda Wojewódzka MO", "Kurier Obywatelski", "Zakłady Metalurgiczne", "Zakłady Maszynowe", "Miejskie Wodociągi", "Miejski Ośrodek Sportu", "Wojewódzki Wydział Sportu"],
    jobs: ['Archiwista', 'Operator suwnicy', 'Kierowca', 'Tkacz', 'Mechanik', 'Woźny', 'Magazynier', 'Kierownik', "Zecer", "Zegarmistrz", "Krawiec", "Piekarz", "Kucharz", "Sprzątacz", "Ogrodnik", "Listonosz", "Elektryk", "Spawacz", "Hutnik", "Tokarz", "Laborant", "Korektor", "Introligator", "Pracz", "Palacz", "Torowy", "Nastawniczy", "Wózkowy", "Tragarz", "Kontroler jakości", "Brygadzista", "Pomoc geodety", "Nauczyciel", "Profesor", "Bibliotekarz", "Księgowy", "Referent", "Inżynier", "Architekt", "Redaktor", "Kreślarz", "Recepcjonista", "Chemik", "Technik", "Stolarz", "Milicjant", "Pilot", "Górnik", "Konserwator urządzeń", "Mycie okien na wysokości", "Operator offsetowy", "Dyspozytor elektrociepłowni", "Sierżant - służba patrolowa", "Korektorka prasowa", "Operator suwnicy", "Magazynier i operator wózka", "Konserwator wodociągów", "Dyrektor MOS", "Naczelnik wydziału sportu"],
    femaleJobs: ["Archiwistka", "Operatorka suwnicy", "Kierowczyni", "Tkaczka", "Mechanik", "Woźna", "Magazynierka", "Kierowniczka", "Zecerka", "Zegarmistrzyni", "Krawcowa", "Piekarka", "Kucharka", "Sprzątaczka", "Ogrodniczka", "Listonoszka", "Elektryk", "Spawaczka", "Hutnik", "Tokarka", "Laborantka", "Korektorka", "Introligatorka", "Praczka", "Palacz", "Torowa", "Nastawnicza", "Wózkowa", "Tragarz", "Kontrolerka jakości", "Brygadzistka", "Pomoc geodety", "Nauczycielka", "Profesorka", "Bibliotekarka", "Księgowa", "Referentka", "Inżynier", "Architektka", "Redaktorka", "Kreślarka", "Recepcjonistka", "Chemiczka", "Technik", "Stolarka", "Milicjantka", "Pilotka", "Górniczka", "Konserwator urządzeń", "Mycie okien na wysokości", "Operator offsetowy", "Dyspozytor elektrociepłowni", "Sierżant - służba patrolowa", "Korektorka prasowa", "Operator suwnicy", "Magazynier i operator wózka", "Konserwator wodociągów", "Dyrektor MOS", "Naczelnik wydziału sportu"],
    work: ['ewidencja akt', 'obsługa suwnicy', 'przewóz osób', 'maszyny tkackie', 'naprawa maszyn', 'obsługa budynku', 'przeładunek', 'nadzór zespołu', "skład drukarski", "naprawa zegarków", "szycie odzieży", "wypiek pieczywa", "przygotowanie potraw", "sprzątanie sal", "pielęgnacja zieleni", "roznoszenie listów", "naprawa instalacji", "łączenie metali", "obsługa pieca", "obróbka metalu", "odczyty próbek", "korekta druku", "oprawa książek", "pranie przemysłowe", "obsługa kotłów", "naprawa torów", "obsługa zwrotnic", "przewóz palet", "noszenie bagażu", "kontrola wyrobów", "nadzór zmiany", "pomiary terenowe", "prowadzenie lekcji", "wykłady i badania", "katalogowanie książek", "rachunki i rozliczenia", "obsługa dokumentów", "nadzór techniczny", "projekty budynków", "redakcja tekstów", "rysunek techniczny", "obsługa gości", "analizy chemiczne", "pomiary i naprawy", "wykonywanie mebli", "służba patrolowa", "pilotowanie samolotów", "wydobycie węgla", "konserwacja, obchód zakładu", "mycie okien na wysokości", "maszyna offsetowa", "uruchomienie instalacji", "służba patrolowa", "korekta tekstów prasowych", "obsługa suwnicy", "przyjmowanie i wydawanie towaru; obsługa wózka widłowego", "konserwacja wodociągów", "kierowanie ośrodkiem sportu", "kierowanie wydziałem sportu"],
    hazards: ['pył papierowy', 'hałas, wysokość', 'ruch drogowy', 'pył, hałas', 'smary, hałas', 'praca fizyczna', 'ciężkie ładunki', 'stres, siedzenie', "drobny druk, pył", "drobne części", "pył tkanin, igły", "gorąco, ciężary", "gorąco, długie stanie", "detergenty, wysiłek", "chłód, wysiłek", "marsz, ciężka torba", "napięcie, wysokość", "gorąco, odpryski", "gorąco, hałas", "wirujące części", "odczynniki, odczyty", "drobny druk", "kleje, ostrza", "para, detergenty", "gorąco, ciężary", "ruch pociągów, chłód", "sygnały, nocne zmiany", "ruch w hali", "ciężary, schody", "drobne detale", "stres, hałas", "teren, podziałki", "głos, długie stanie", "drobny druk", "pył papierowy", "drobny druk, stres", "drobny druk", "hałas, pomiary", "drobne podziałki", "drobny druk", "drobne podziałki", "stres, długie stanie", "odczynniki", "hałas, pomiary", "hałas, ostrza", "stres, nocne dyżury", "hałas, wysokość", "pył mineralny, hałas", "olej, hałas", "wysokość, środki myjące", "hałas, nocna zmiana", "odpowiedzialność, zmiany", "stres, praca nocą", "drobny druk", "hałas, wysokość", "ładunki, ruch wózków", "olej, ciężary", "stres, odpowiedzialność", "stres, odpowiedzialność"],
    patterns: {"day":"dni","early":"rano","shifts":"zmiany","night":"noc","split":"dzielona","seasonal":"sezon"},
    conditions: {
      healthy: ['Bez istotnych dolegliwości.', 'Wywiad bez obciążeń.'],
      vision: ['Zgłasza pogorszenie wzroku.', 'Trudności z czytaniem.'],
      pressure: ['Nadciśnienie w wywiadzie.', 'Okresowe bóle głowy.'],
      combined: ['Wada wzroku, nadciśnienie.', 'Wymaga dalszej kontroli.'],
      general: ['Dolegliwości ogólne.', 'Odchylenia w badaniu.'],
    },
  },
  en: {
    names: ["Irene Wells", "Leon Brown", "Martha Fox", "Anna Lucas", "Raymond Gale", "Eve King", "Paul Rook", "Sophia May", "Stephen Drake", "Lydia Scholar", "Edward Carter", "Helen Cook", "Adam Wolfe", "Helen Cooper", "John Richards", "Barbara Still", "Mark Hart", "Olga Booth", "Victor Owlett", "Alice Frost", "Peter Hartley", "Edith Owen", "Henry Wood", "Diana Tempest", "George Fowler", "Diana Walker", "Andrew Cooper", "Mary Sherman", "Julian Adams", "Helena Kenney", "Francis Hirst", "Eve Mitchell", "Bernard Taylor", "Lucy Linford", "Emile Prentice", "Christine Stroud", "Joseph Kershaw", "Yvonne Heath", "Neville Sibley", "Renee Wicks", "George Marden", "Grace Birch", "Peter Martin", "Ursula Snow", "Derek Latham", "Celia Hollis", "Andrew Oliver", "Monica Randall", "Clarence Pepper", "Teresa Kershaw", "Leslie Knowles", "Brenda Russell", "Richard Hare", "Winifred Charlton", "Sylvester Dickens", "Regina Crowe", "Arthur Horner", "Joan Hunter", "Maurice Heller", "Aline Peel", "Ralph Raines", "Lucille Stocks", "Hubert Still", "Katie Poole", "Theodore Kite", "Genevieve White", "Luke Blain", "Jean Bradley", "Michael Marden", "Sabine Pettit", "Bartholomew Kerr", "Angela Cross", "Joseph Clegg", "Dorothy Grove", "Ignatius Piper", "Agatha Finch", "Daniel Pitts", "Gabrielle York", "Wesley Woodley", "Basil Yew", "Cecil Newton", "Milton Turpin", "Wallace Jefferies", "Gregory Hollis", "Sidney James", "Edgar Hawes", "Miles Hine", "Bruce Cook", "Michael Swift", "Robert Carlisle", "Albert Abbott", "Stanley Wilcox", "Clarence Bird", "Wilfred Wise", "Natalie Bloomfield", "Bruno Tindall", "Elizabeth Terry", "Aloysius Sands", "Beatrix Allman", "Maximilian Price", "Stella Hine", "Bertram Patrick", "Renee Wake"],
    identityNames: [
      ["Irene Hill", "Eve Sole", "Teresa Lancaster", "Anna Wells", "Mary Lockwood"],
      ["Leon Stevens", "Raymond Bolton", "Stephen Wicks", "John Bellis", "Henry Brick"],
      ["Martha Houghton", "Sophia Oakley", "Helen Beck", "Edith Melton", "Barbara Carter"],
      ["Anna Birch", "Eve Lynch", "Olga Truelove", "Lydia Crowe", "Yvonne Watson"],
      ["Raymond Webster", "Henry Bourne", "Stephen Bradley", "Walter Judd", "John Rodgers"],
      ["Eve Mays", "Teresa Rivers", "Irene Digby", "Mary Wicks", "Alice Gold"],
      ["Paul Burke", "Mark Griffin", "Peter Freer", "Adam Melton", "George Mott"],
      ["Sophia Grove", "Edith Crowe", "Mary Rook", "Helen Finch", "Barbara Blain"],
      ["Stephen Palmer", "Henry Sawyer", "Raymond Bell", "John Jarrett", "Walter Wood"],
      ["Lydia Webster", "Yvonne Charlton", "Eve Vince", "Anna Stocks", "Alice Still"],
      ["Edward Houghton", "Victor Bridger", "George Crowe", "Henry Harker", "Stanley Blain"],
      ["Helen Mason", "Teresa Wells", "Irene Watson", "Sophia Bell", "Barbara Rake"],
      ["Adam Pettit", "Paul Kite", "Mark Kerr", "Peter York", "Thomas Bell"],
      ["Helen Cooper", "Teresa Yardley", "Irene Marden", "Sophia Sadler", "Barbara Rogers"],
      ["John Lucas", "Raymond Holt", "Henry Wolfe", "Stephen Banks", "George Heath"],
      ["Barbara Kite", "Helen Pettit", "Mary Bradley", "Edith Rook", "Irene Grove"],
      ["Mark Odell", "Paul Tully", "Thomas Carter", "Adam Pack", "Peter Staley"],
      ["Olga Staley", "Nina Wells", "Eve Poole", "Anna Carter", "Katie Dickens"],
      ["Victor South", "George Blake", "Edward Raines", "Henry Piper", "Stephen Hooper"],
      ["Alice Bourne", "Irene Peel", "Teresa Wyatt", "Eve Bridger", "Mary Kerr"],
      ["Peter Hodgson", "Paul Latham", "Mark Owlett", "Adam Maitland", "Thomas Booth"],
      ["Edith Houghton", "Sophia Still", "Mary Lancaster", "Helen Blain", "Barbara Rook"],
      ["Henry Workman", "George Watson", "Raymond Rook", "John South", "Stephen Houghton"],
      ["Diana Grove", "Eve Rodgers", "Anna Sole", "Lydia Pettit", "Yvonne Jarrett"],
      ["George Rivers", "Henry Still", "Raymond Latham", "Stephen Rook", "Walter Pitts"],
      ["Diana Walker", "Eve Shaw", "Anna Maddox", "Lydia Sorrell", "Yvonne Plowman"],
      ["Andrew Cooper", "Mark Orchard", "Paul Ratcliffe", "Raymond Martin", "Wesley Sutton"],
      ["Mary Hooper", "Helen Westley", "Barbara Mays", "Irene Bell", "Sophia Odell"],
      ["Julian Adams", "Neville Cherry", "Richard Palmer", "Bernard Steer", "Christopher Sorrell"],
      ["Helena Owlett", "Mary Fisher", "Irene York", "Eve Potter", "Teresa Charlton"],
      ["Francis Grove", "Edward Lloyd", "Victor Fisher", "George Hill", "Henry Pack"],
      ["Eve Mitchell", "Anna Jennings", "Teresa Walker", "Yvonne Palmer", "Lydia Swift"],
      ["Bernard Poole", "Mark Wells", "Paul Rivers", "Adam Mays", "Thomas Pettit"],
      ["Lucy Digby", "Helen Smart", "Mary Raines", "Barbara Scholar", "Irene Staley"],
      ["Emile Pettit", "Paul Chappell", "Mark Melton", "Peter Jarrett", "Adam Webster"],
      ["Christine Wood", "Sophia Kerr", "Edith Vince", "Helen Piper", "Mary Heath"],
      ["Joseph Kershaw", "Clarence Weston", "Stanley Tomlin", "Maurice Cooper", "Henry Palmer"],
      ["Yvonne York", "Anna Still", "Eve Hartley", "Lydia Pitts", "Teresa Bell"],
      ["Neville Jarrett", "Victor Mason", "Edward Wells", "George Bridger", "Henry Fowler"],
      ["Renee Carter", "Anna Freer", "Olga Houghton", "Eve Crowe", "Lydia Sawyer"],
      ["George Marden", "Victor Yardley", "Theodore Shaw", "Raymond Sutton", "Andrew Maddox"],
      ["Grace Wicks", "Mary Vince", "Irene Piper", "Helen Hodgson", "Barbara Westley"],
      ["Peter Martin", "Mark Jennings", "Paul Cherry", "Jack Kershaw", "Thomas Steer"],
      ["Ursula Carter", "Teresa Houghton", "Mary Bourne", "Eve Raines", "Irene Pitts"],
      ["Derek Bell", "Mark Stroud", "Paul Grove", "Adam Wyatt", "Thomas Peel"],
      ["Celia Wolfe", "Edith Grove", "Sophia Raines", "Helen Lancaster", "Mary Freer"],
      ["Andrew Beaumont", "Raymond Pitts", "Henry Randall", "John Digby", "Stephen Heath"],
      ["Monica Grove", "Anna Kerr", "Eve Chappell", "Yvonne Rodgers", "Lydia Lynch"],
      ["Clarence Vince", "Edward Bourne", "Victor Carter", "George Stroud", "Henry Banks"],
      ["Teresa Kershaw", "Barbara Tomlin", "Irene Adams", "Helen Weston", "Diana Rogers"],
      ["Leslie Pettit", "Mark Heath", "Paul Crowe", "Adam Workman", "Peter Randall"],
      ["Brenda Owlett", "Irene Rivers", "Mary Owen", "Helen Jarrett", "Teresa Pack"],
      ["Richard Digby", "Edward Rook", "Victor Kerr", "George Peel", "Henry Carter"],
      ["Winifred Bell", "Anna Bradley", "Eve Wyatt", "Lydia Staley", "Yvonne Crowe"],
      ["Sylvester Beaumont", "Raymond Rodgers", "Henry Smart", "John Freer", "Stephen Blain"],
      ["Regina Rook", "Helen Pack", "Mary Wolfe", "Irene Kerr", "Sophia Piper"],
      ["Arthur Holt", "Paul Poole", "Mark York", "Adam Bridger", "Peter Pettit"],
      ["Joan Raines", "Eve York", "Anna Peel", "Yvonne Carter", "Lydia Bell"],
      ["Maurice Lancaster", "Edward Pack", "Victor Piper", "George Raines", "Henry Houghton"],
      ["Aline Wells", "Teresa Mays", "Mary Wyatt", "Irene Owlett", "Helen Stroud"],
      ["Ralph Rook", "Mark Piper", "Paul Kerr", "Adam York", "Peter Wells"],
      ["Lucille Grove", "Mary Rodgers", "Irene Crowe", "Helen Banks", "Barbara Rivers"],
      ["Hubert Bourne", "Mark Vince", "Paul Heath", "Adam Raines", "Thomas Lancaster"],
      ["Katie Wolfe", "Olga Pettit", "Anna Digby", "Eve Houghton", "Nina Grove"],
      ["Theodore Still", "Edward Pettit", "Victor Beaumont", "George Bell", "Henry Freer"],
      ["Genevieve Rivers", "Mary Sole", "Irene Pack", "Helen Rook", "Sophia Scholar"],
      ["Luke Wyatt", "Mark Raines", "Paul Bell", "Adam Grove", "Peter Pitts"],
      ["Jean Heath", "Edith Peel", "Sophia Carter", "Mary Still", "Helen Linford"],
      ["Michael Marden", "Peter Sutton", "Thomas Plowman", "Jack Walker", "Mark Shaw"],
      ["Sabine Lancaster", "Teresa Rook", "Mary Sawyer", "Irene Jarrett", "Helen Freer"],
      ["Bartholomew Vince", "Mark Pack", "Paul Peel", "Adam Smart", "Thomas Bradley"],
      ["Angela Wicks", "Sophia Rodgers", "Edith Wyatt", "Mary Piper", "Helen Fisher"],
      ["Joseph Grove", "Raymond Digby", "Henry Bradley", "John Pitts", "Stephen Wells"],
      ["Dorothy Rook", "Anna Odell", "Eve Banks", "Yvonne Freer", "Lydia Carter"],
      ["Ignatius Wells", "Edward Grove", "Victor Bell", "George Digby", "Henry Westley"],
      ["Agatha Rivers", "Teresa Jarrett", "Mary Lynch", "Irene Still", "Helen York"],
      ["Daniel Beaumont", "Paul York", "Mark Freer", "Adam Rook", "Peter Brick"],
      ["Gabrielle Vince", "Teresa Staley", "Mary Pitts", "Irene Heath", "Helen Charlton"],
      ["Wesley Woodley", "Raymond Whitney", "Stephen Ball", "Mark Bayley", "John Toole"],
      ["Basil Yew", "Peter Ricketts", "Adam Bloomfield", "George Jukes", "Paul Harris"],
      ["Cecil Newton", "Henry Barry", "Walter Wake", "Leon Briggs", "Thomas Leary"],
      ["Milton Turpin", "Stanley Goddard", "Edward Salmon", "Victor Hoyle", "Joseph Kirk"],
      ["Wallace Jefferies", "Theodore Terry", "Francis Cook", "Ignatius Cann", "Maurice Wolsey"],
      ["Gregory Hollis", "Arthur Styles", "Ralph Wicks", "Jack Hare", "Bartholomew Thomas"],
      ["Sidney James", "Andrew Scrivens", "Derek Mason", "Leslie Hickey", "Christopher Roy"],
      ["Edgar Hawes", "Clarence Mayhew", "George Short", "Raymond Thurston", "Bernard Wale"],
      ["Miles Hine", "Henry Bloom", "John Weller", "Walter Plowman", "Edward Kellett"],
      ["Bruce Cook", "Stanley Pink", "Theodore Keys", "Wallace Radford", "Francis Latham"],
      ["Michael Swift", "Paul Rennie", "Luke Brindley", "Thomas Wickham", "Arthur Shields"],
      ["Robert Carlisle", "Peter Stacey", "Mark Reid", "Adam Lott", "Ralph Sexton"],
      ["Albert Abbott", "Andrew Steer", "Jack Reed", "Gregory Sawyer", "Sidney Mills"],
      ["Stanley Wilcox", "Raymond Marsh", "George Ireland", "Henry Dowling", "Walter Keegan"],
      ["Clarence Bird", "Edward Phelps", "Wallace Willow", "Theodore Waller", "Maurice Paul"],
      ["Wilfred Wise", "Mark Patrick", "Paul Jefferies", "Adam Greaves", "Thomas Crowe"],
      ["Natalie Bloomfield", "Anna Wise", "Eve Paul", "Yvonne Marsh", "Lydia Ireland"],
      ["Bruno Tindall", "Henry Sells", "Raymond Allman", "John Park", "Stephen Johnson"],
      ["Elizabeth Terry", "Teresa Yew", "Mary Steer", "Irene Newton", "Helen Woodley"],
      ["Aloysius Sands", "Victor Wise", "Edward Greaves", "George Moore", "Francis Patrick"],
      ["Beatrix Allman", "Helen Tindall", "Sophia Sells", "Mary Johnson", "Edith Park"],
      ["Maximilian Price", "Paul Orchard", "Mark Ellis", "Adam Scanlon", "Peter Tippett"],
      ["Stella Hine", "Irene Kirk", "Mary Bayley", "Helen Jukes", "Sophia Short"],
      ["Bertram Patrick", "Theodore Wise", "Edward Jefferies", "George Sands", "Henry Moore"],
      ["Renee Wake", "Eve Plowman", "Anna Briggs", "Yvonne Styles", "Lydia Hawes"],
      ["Catherine Collett", "Madeleine Miles", "Dorothy Singleton", "Joan Adley", "Beatrice Keys"],
      ["Thomas Peacock", "Andrew Langford", "Martin Halsey", "Christopher Spear", "Jack Bowles"],
      ["Teresa Stiles", "Helen Croft", "Sophia Prentice", "Diana Tolley", "Barbara Irving"],
      ["Felix Seaton", "Anthony Shaw", "Wallace Maddox", "Joseph Simon", "Edmund Nixon"],
      ["Margaret Whitaker", "Renee Holbrook", "Alice Lamb", "Grace Slade", "Yvonne Rook"],
      ["Bernard Dorsey", "Clarence Moreton", "Leslie Rollins", "Richard Jewell", "Derek Sheridan"],
      ["Helena Willow", "Jean Newell", "Genevieve Murray", "Stella Oak", "Edith Latham"],
      ["Marcus Keene", "Albert Lemon", "Ralph Lyons", "Gregory Leary", "Arthur Oakley"],
      ["Elizabeth Rowe", "Brenda Hume", "Lucille Toole", "Ursula Robinson", "Celia Anson"],
      ["Stanley Wynn", "Theodore Kirkland", "Maurice Thorne", "Victor Hobbs", "Neville Neale"],
      ["Agnes Light", "Dorothy Blake", "Beatrice Mathews", "Joan Lawrie", "Eve Rudman"],
      ["Malcolm Brookfield", "Jack Bland", "Peter Bullock", "Mark Toy", "Andrew Crane"],
      ["Wilhelmina Vane", "Sophia Merritt", "Irene Patch", "Helen Underwood", "Mary Bradbury"],
      ["Julian Hawkins", "Raymond Byrd", "Walter Parry", "Henry Gough", "Stephen Tripp"],
      ["Evelyn Brunt", "Anna Wilton", "Alice Lees", "Teresa Avery", "Lydia Pickett"],
      ["Anthony Wilkins", "Edmund Rawlins", "Felix Barrett", "Joseph Magee", "Theodore Stark"],
      ["Martha Swift", "Olga Jackman", "Nina Hatcher", "Katie Nelson", "Eve Wharton"],
      ["Richard Delaney", "Wesley Shearer", "Bernard Penfold", "Clarence Audley", "Leslie Ware"],
      ["Grace Chatham", "Diana Woodham", "Elizabeth Wale", "Brenda Rosser", "Ursula Higgins"],
      ["Percival Keane", "Martin Dew", "Arthur Goodall", "Paul Riley", "Marcus Rook"],
      ["Winifred Reed", "Edith Armitage", "Jean Woods", "Stella Keane", "Helena Symonds"],
      ["Christopher Oswald", "Derek Kendall", "Neville Ashe", "Mark Mullins", "George Neville"],
      ["Monica Travis", "Renee Hawkins", "Joan Burley", "Dorothy Usher", "Yvonne Small"],
      ["Stanley Cole", "Edward Storey", "Maurice Sims", "Victor Heeley", "Leon Mackay"],
      ["Christine Willis", "Barbara Rice", "Teresa Wicks", "Helen Draper", "Mary Beale"],
      ["Simon Whiting", "Thomas Logan", "Ralph Peart", "Adam Arthur", "Peter Wade"],
      ["Sabine Redmond", "Lucille Baldwin", "Regina Norrie", "Sophia Painter", "Irene Kelsey"],
      ["Warren Caldwell", "Mark Bateman", "Paul Grainger", "Jack Weldon", "Gregory Proctor"],
      ["Margaret Booker", "Elizabeth Cowley", "Beatrice Kilby", "Alice Mercer", "Diana Hartley"],
      ["Wallace Salter", "Francis Martell", "Anthony Burr", "Edmund Prentice", "Ignatius Ransom"],
      ["Catherine Cantrell", "Madeleine Wray", "Agatha Spencer", "Joan Jordan", "Olga Rose"],
      ["Albert Purcell", "Andrew Tapper", "Henry Lever", "Julian Hagan", "Raymond Jennings"],
      ["Genevieve Turpin", "Stella Norton", "Helen Reade", "Edith Perrin", "Mary Morris"],
      ["Michael Rumble", "Robert Meadows", "Thomas Grist", "Martin Tallis", "Arthur Leach"],
      ["Dorothy Barclay", "Renee Minter", "Alice Latham", "Yvonne Sage", "Lydia Clarkson"],
      ["Clara Barrett", "Annette Branson", "Eliza Ewing", "Nina Harris", "Martha Heron"],
      ["Gregory Aldridge", "Robert Butler", "Albert Chalmers", "Andrew Ellis", "Julian Henson"],
      ["Lucy Bowen", "Winifred Cleary", "Regina Foster", "Aline Garside", "Irene Hughes"],
      ["Paul Cantrell", "Mark Ratcliffe", "Peter Orchard", "Thomas Maddox", "Jack Yardley"],
      ["Caroline Donnelly", "Sylvia Fell", "Joan Goldsmith", "Beatrice Henley", "Dorothy Hopkins"],
      ["Edmund Adley", "Felix Clancy", "Anthony Crane", "Wallace Gillis", "Milton Hewett"],
      ["Helen Martin", "Teresa Steer", "Barbara Jennings", "Irene Cherry", "Sophia Palmer"],
      ["Martin Abbot", "Thomas Cann", "Arthur Dore", "Michael Everett", "Marcus Gainsford"],
      ["Angela Anson", "Jean Dodds", "Helena Eaton", "Sophia Grace", "Genevieve Hara"],
      ["Sigmund Barrett", "Bernard Bradbury", "Clarence Cornish", "Richard Faulkner", "Leslie Fyfe"],
      ["Madge Astley", "Catherine Channon", "Agatha Delaney", "Evelyn Edmonds", "Monica Gell"],
      ["Malcolm Atkin", "Derek Catterall", "Jack Daley", "Ralph Duffy", "Paul Gibbs"],
      ["Brenda Brown", "Teresa Cameron", "Grace Colton", "Christine Emmett", "Helen Gerrard"],
      ["Philip Attwood", "Cameron Yew", "Mark Davey", "Simon Dunne", "Peter Gallant"],
      ["Eve Berkeley", "Anna Bradbury", "Renee Croft", "Yvonne English", "Diana Hagan"],
      ["Stanley Briggs", "Joseph Chappell", "Edward Culver", "Ignatius Eden", "Francis Greaves"],
      ["Pauline Barclay", "Lydia Cade", "Olga Dore", "Alice Ford", "Ursula Gale"],
      ["Richard Tomlin", "Neville Cooper", "George Adams", "Wesley Weston", "Maurice Rogers"],
      ["Mary Badger", "Edith Coates", "Barbara Drake", "Stella Ewing", "Mabel Gardner"],
      ["Bartholomew Bayley", "Luke Cameron", "Theodore Denham", "Walter Flint", "Victor Gale"],
      ["Ada Barnett", "Anita Brick", "Julia Cross", "Katie Fairley", "Laura Harding"],
      ["Henry Barclay", "Leon Branson", "Maurice Drake", "Raymond Francis", "Stephen Goodman"],
      ["Isabel Bayley", "Sabine Brindley", "Celia Daltry", "Joan Fleet", "Lucille Gates"],
      ["Conrad Grey", "Roland Still", "Albert Delaney", "Damian Epps", "Matthew Hand"],
      ["Cecilia Benson", "Leonora Brunt", "Wendy Delaney", "Melanie Flynn", "Wilhelmina Gregory"],
      ["Mark Amos", "Andrew Cassidy", "Julian Dancer", "Richard Dryden", "George Gill"],
      ["Natalie Audley", "Sylvia Chisholm", "Eliza Cooper", "Clara Dutton", "Annette Fyfe"],
      ["Walter Ashton", "Neville Brick", "Edmund Collins", "Theodore Egan", "Victor Hartley"],
      ["Elizabeth Banks", "Regina Burton", "Winifred Day", "Helen Elms", "Grace Hayes"],
      ["Peter Marden", "Mark Palmer", "Paul Sorrell", "Thomas Cooper", "Jack Orchard"],
      ["Alice Barratt", "Eve Vane", "Diana Crewe", "Yvonne Fenwick", "Renee Fuller"],
      ["Anthony Betts", "Francis Clive", "Ignatius Donnelly", "Felix Earl", "Wallace Gunn"],
      ["Ida Blackmore", "Maya Cade", "Lena Davis", "Nina Duncan", "Ada Hawkins"],
      ["Andrew Kershaw", "Albert Martin", "Julian Plowman", "Richard Shaw", "Neville Walker"],
      ["Edith Marden", "Sophia Tomlin", "Genevieve Steer", "Helena Sadler", "Stella Cooper"],
      ["Clarence Burke", "Leslie Brunt", "Bernard Corbett", "Sigmund Firth", "Cecil Hammond"],
      ["Anna Adams", "Eve Yardley", "Yvonne Martin", "Diana Jennings", "Teresa Plowman"],
      ["Cameron Barlow", "Philip Butler", "Simon Connell", "Marcus Farley", "Martin Hazel"],
      ["Christine Baird", "Brenda Carson", "Teresa Craddock", "Mary Fitch", "Sophia Gore"],
      ["Jack Alcott", "Malcolm Bradbury", "Gregory Drummond", "Robert Everett", "Derek Gifford"],
      ["Eve Rogers", "Anna Cooper", "Yvonne Marden", "Lydia Tomlin", "Teresa Sadler"],
      ["Bertram Audley", "Wilfred Cann", "Milton Connell", "Stanley Forsyth", "Joseph Greenway"],
      ["Dorothy Boyce", "Ursula Breen", "Margaret Connell", "Lydia Eliot", "Celia Gimson"],
      ["Paul Allen", "Thomas Brookes", "Ralph Darley", "Arthur Fielding", "Michael Hamill"],
      ["Helena Blackmore", "Jean Venn", "Lucy Curtis", "Angela Eliot", "Genevieve Griffin"],
      ["Stanley Adams", "Henry Kershaw", "Joseph Orchard", "Maurice Walker", "Clarence Palmer"],
      ["Joan Acton", "Monica Britton", "Beatrice Dowling", "Agatha Fay", "Catherine Guy"],
      ["Peter Bland", "Adam Buck", "Bartholomew Denton", "Luke Farr", "Mark Hales"],
      ["Anna Alton", "Irene Budd", "Renee Coughlan", "Grace Everett", "Helen Hanna"],
      ["Marcus Ashby", "Malcolm Burr", "Jack Copley", "Robert Ellis", "Derek Gunn"],
    ],
    employers: ['Dawn Works Archives', 'Link Engineering Works', 'Wayfarer Staff Transport', 'Weft Textile Mill', 'Rivet Workshop', 'Vocational School', 'Goods Depot', 'Supply Office', "Margin Printworks", "Cogwheel Co-operative", "Stitch Workshop", "Harvest Bakery", "Works Canteen", "Parks Service", "Post Office", "Technical Service", "Assay Laboratory", "Wave Laundry", "Railway Office", "Holiday Lodge", "University", "Reading Room Library", "Design Office", "Grain Joinery", "Militia station", "Flight unit", "Deepwell Mine", "Track Repair Works", "Birch Furniture Works", "Weft Textile Works", "Conduit Cable Works", "Clinker Ceramics Works", "Municipal Transport", "Vector Machine Tool Works", "Cleaning Services", "State Printing House", "Municipal Heat and Power", "Provincial Militia HQ", "Civic Courier", "Metallurgical Works", "Machine Works", "Municipal Waterworks", "Municipal Sports Centre", "Provincial Sports Dept."],
    jobs: ['Archivist', 'Crane operator', 'Driver', 'Weaver', 'Mechanic', 'Caretaker', 'Storekeeper', 'Manager', "Typesetter", "Watchmaker", "Tailor", "Baker", "Cook", "Cleaner", "Gardener", "Post carrier", "Electrician", "Welder", "Furnace operator", "Lathe operator", "Lab assistant", "Proofreader", "Bookbinder", "Laundry worker", "Boiler attendant", "Track worker", "Signal operator", "Forklift operator", "Porter", "Quality inspector", "Shift supervisor", "Survey assistant", "Teacher", "Professor", "Librarian", "Accountant", "Clerk", "Engineer", "Architect", "Editor", "Drafter", "Receptionist", "Chemist", "Technician", "Carpenter", "Militia officer", "Pilot", "Miner", "Equipment maintenance", "High window cleaner", "Offset press operator", "Heat plant dispatcher", "Sergeant - patrol duty", "Press proofreader", "Crane operator", "Storekeeper and forklift driver", "Waterworks maintenance", "Sports Centre director", "Provincial sports chief"],
    femaleJobs: ['Archivist', 'Crane operator', 'Driver', 'Weaver', 'Mechanic', 'Caretaker', 'Storekeeper', 'Manager', "Typesetter", "Watchmaker", "Tailor", "Baker", "Cook", "Cleaner", "Gardener", "Post carrier", "Electrician", "Welder", "Furnace operator", "Lathe operator", "Lab assistant", "Proofreader", "Bookbinder", "Laundry worker", "Boiler attendant", "Track worker", "Signal operator", "Forklift operator", "Porter", "Quality inspector", "Shift supervisor", "Survey assistant", "Teacher", "Professor", "Librarian", "Accountant", "Clerk", "Engineer", "Architect", "Editor", "Drafter", "Receptionist", "Chemist", "Technician", "Carpenter", "Militia officer", "Pilot", "Miner", "Equipment maintenance", "High window cleaner", "Offset press operator", "Heat plant dispatcher", "Sergeant - patrol duty", "Press proofreader", "Crane operator", "Storekeeper and forklift driver", "Waterworks maintenance", "Sports Centre director", "Provincial sports chief"],
    work: ['records filing', 'crane operation', 'passenger transport', 'weaving machines', 'machine repairs', 'building upkeep', 'loading goods', 'team supervision', "setting type", "watch repairs", "sewing clothes", "baking bread", "preparing food", "cleaning rooms", "tending grounds", "delivering mail", "wiring repairs", "joining metals", "tending furnace", "turning metal", "reading samples", "checking proofs", "binding books", "industrial washing", "tending boilers", "track repairs", "setting points", "moving pallets", "carrying luggage", "checking products", "leading a shift", "land measurements", "teaching classes", "teaching and research", "cataloguing books", "keeping accounts", "handling records", "technical oversight", "building design", "editing texts", "technical drawing", "receiving guests", "chemical analyses", "checks and repairs", "making furniture", "patrol duty", "flying aircraft", "coal extraction", "repairs, works rounds", "cleaning high windows", "offset press operation", "restarting installation", "patrol duty", "checking press proofs", "crane operation", "receiving and issuing goods; forklift operation", "waterworks maintenance", "running sports centre", "running sports department"],
    hazards: ['paper dust', 'noise, heights', 'road traffic', 'dust, noise', 'oil, noise', 'physical work', 'heavy loads', 'stress, sitting', "small type, dust", "small components", "cloth dust, needles", "heat, lifting", "heat, standing", "detergents, exertion", "cold, exertion", "walking, heavy bag", "voltage, heights", "heat, sparks", "heat, noise", "rotating parts", "reagents, readings", "small type", "glue, blades", "steam, detergents", "heat, lifting", "trains, cold", "signals, night work", "shop floor traffic", "loads, stairs", "fine detail", "stress, noise", "terrain, scales", "voice, standing", "small type", "paper dust", "small type, stress", "small type", "noise, readings", "fine scales", "small type", "fine scales", "stress, standing", "reagents", "noise, readings", "noise, blades", "stress, night shifts", "noise, altitude", "mineral dust, noise", "oil, noise", "heights, detergents", "noise, night shift", "responsibility, shifts", "stress, night work", "small print", "noise, heights", "loads, forklifts", "oil, heavy loads", "stress, responsibility", "stress, responsibility"],
    patterns: {"day":"days","early":"early","shifts":"shifts","night":"night","split":"split","seasonal":"seasonal"},
    conditions: {
      healthy: ['No significant symptoms.', 'History without concerns.'],
      vision: ['Reports worsening eyesight.', 'Difficulty reading.'],
      pressure: ['History of hypertension.', 'Occasional headaches.'],
      combined: ['Poor sight, hypertension.', 'Further review required.'],
      general: ['General symptoms.', 'Findings on examination.'],
    },
  },
} as const;

// Authored chapter-one copy. Stable content IDs are persisted; rendered text is not.
export const storyCopy = {
  "pl": {
    "articles": {
      "K-B-STRIKE": {
        "title": "Dyscyplina pracy w Mierniku",
        "body": "W Zakładach Aparatury »Miernik« trwa protest części załogi. Dyrekcja rozwiązała umowę ze Stefanem Wolszakiem, organizatorem strajku. W komunikacie wskazano na naruszenie dyscypliny i utrudnianie pracy przedsiębiorstwa. W obszernym uzasadnieniu przypomniano obowiązki wynikające z regulaminu zakładowego. Szczególne miejsce zajmuje odpowiedzialność za terminowe wykonywanie zamówień. Dyrekcja podkreśla, że spokojna praca poszczególnych wydziałów służy interesom całej załogi.",
        "byline": "Redakcja"
      },
      "K-J-STADIUM": {
        "title": "Spartakiada odwołana",
        "body": "Drużyny przybyłe na wojewódzką spartakiadę młodzieżową nie mogły rozpocząć zawodów. Stadion był w tym terminie niedostępny. Organizator, klub »Płomień« kierowany przez Henryka Malca, powołuje się na nieprzewidziane trudności organizacyjne. W omówieniu przygotowań wiele miejsca poświęcono wychowawczemu znaczeniu sportu i współpracy między klubami. Kwestia dostępności obiektu znalazła się wśród spraw technicznych. Uczestnikom pozostaje oczekiwać na dalsze ustalenia dotyczące wspólnego kalendarza.",
        "byline": "Redakcja"
      },
      "K-E-HERO": {
        "title": "Bohater milicji powraca do służby",
        "body": "Sierżant Marek Czarnecki, ranny podczas niedawnych zamieszek, zakończył rekonwalescencję. Od jutra ponownie będzie pełnił służbę patrolową. Komenda podkreśla jego determinację oraz opiekę, jaką otoczono zasłużonego funkcjonariusza. W informacji dla prasy przypomniano znaczenie doświadczenia zdobywanego w codziennym kontakcie z mieszkańcami. Podkreślono również koleżeńską pomoc w okresie powrotu do zdrowia. Zapowiedziany patrol ma być kolejnym przykładem właściwej postawy całej jednostki.",
        "byline": "Redakcja"
      },
      "K-E-RETURN": {
        "title": "Znów na patrolu",
        "body": "Sierżant Marek Czarnecki rozpoczął pierwszy patrol po rekonwalescencji. Dowództwo jednostki przedstawia jego powrót jako dowód skutecznej rehabilitacji i troski o funkcjonariuszy, którzy ucierpieli podczas pełnienia służby. W omówieniu służby szczególne miejsce zajęła ciągłość wykonywania zadań. Codzienny obchód wymaga znajomości terenu oraz cierpliwości wobec drobnych spraw mieszkańców. Komenda podkreśla, że właśnie w zwykłych obowiązkach najpełniej ujawnia się wartość doświadczenia.",
        "byline": "Redakcja"
      },
      "K-E-BLOCKED": {
        "title": "Kto opóźnia powrót funkcjonariusza?",
        "body": "Zapowiedziany powrót sierżanta Marka Czarneckiego został wstrzymany po decyzji lekarza medycyny pracy. Komenda oczekuje wyjaśnienia, dlaczego zasłużony funkcjonariusz nadal nie może podjąć obowiązków. W stanowisku jednostki przypomniano wcześniejsze przygotowania do uzupełnienia obsady patroli. Podkreśla się potrzebę sprawnego współdziałania wszystkich zainteresowanych placówek. Zdaniem komendy sprawa wymaga uwagi proporcjonalnej do znaczenia codziennej służby.",
        "byline": "Redakcja"
      },
      "K-E-CORRECTION": {
        "title": "Sprostowanie",
        "body": "W informacji o sierżancie Marku Czarneckim podano nieścisły termin planowanego powrotu do służby. Data miała charakter przewidywany. Redakcja przeprasza za nieścisłość. Informację zamieszczono w materiale poświęconym opiece nad funkcjonariuszami wracającymi do zdrowia. Użyte sformułowanie mogło sugerować większą dokładność ustaleń, niż wynikała z ich roboczego charakteru. Prosimy czytelników o uwzględnienie tego wyjaśnienia przy lekturze poprzedniego numeru.",
        "byline": "Redakcja"
      },
      "K-D-STRIKE": {
        "title": "Ciepło dla mieszkańców",
        "body": "W Miejskiej Elektrociepłowni trwa strajk Wzajemności. Władze przygotowują uruchomienie instalacji z pomocą pracowników zastępczych. Komitet Wojewódzki zapewnia, że ciągłość ogrzewania pozostaje sprawą najpilniejszą. W komunikacie wiele miejsca poświęcono potrzebom osiedli, szkół i placówek opieki. Podkreślono znaczenie znajomości urządzeń oraz odpowiedzialności przy obejmowaniu dyżuru. Przygotowania przedstawiono jako wspólne zadanie służb technicznych i administracji.",
        "byline": "Redakcja"
      },
      "K-D-HEAT": {
        "title": "Elektrociepłownia wznawia pracę",
        "body": "Dzięki udziałowi doświadczonych pracowników, w tym emerytowanego dyspozytora Antoniego Rybaka, wznowiono pracę instalacji. Władze ogłaszają przywrócenie ogrzewania i dziękują osobom, które odpowiedziały na apel. W podziękowaniach szczególnie mocno zaakcentowano doświadczenie gromadzone przez wiele lat pracy. Według komunikatu znajomość instalacji ma znaczenie równie duże jak gotowość do objęcia dyżuru. Przywrócenie dostaw przedstawiono jako przykład współdziałania pokoleń.",
        "byline": "Redakcja"
      },
      "K-D-COLD": {
        "title": "Ograniczenia w ogrzewaniu",
        "body": "Strajk w elektrociepłowni przedłuża się. Nie udało się zebrać pełnej obsady specjalistów do ponownego uruchomienia instalacji. Administracje bloków i szkół informują o niższej temperaturze w pomieszczeniach. W komunikatach administracyjnych powraca sprawa oszczędnego gospodarowania dostępnym ciepłem. Samo przygotowanie urządzeń nie rozwiązuje kwestii obsady dyżurów. Władze ponawiają apel o odpowiedzialność, wskazując na potrzeby mieszkańców oczekujących poprawy warunków.",
        "byline": "Redakcja"
      },
      "K-J-POOL": {
        "title": "Ambitne plany miejskiego sportu",
        "body": "Zawodnicy zaproszeni przez Miejski Ośrodek Sportu zastali basen zamknięty z powodu remontu. Dyrektor Henryk Malec zapowiada nowy termin zawodów. Ośrodek mówi o przejściowych trudnościach związanych z ambitnym programem rozwoju. W omówieniu programu wymieniono lepsze wykorzystanie obiektów i potrzebę uzgadniania kalendarza imprez. Sprawy remontowe potraktowano jako część szerszych przygotowań. Dla przybyłych drużyn najważniejszą informacją pozostaje jednak dzień, w którym będzie można wejść do wody.",
        "byline": "Redakcja"
      },
      "K-G-BRIGADES": {
        "title": "Robotnicy na ochotnika ratują produkcję",
        "body": "Do Zakładów Metalurgicznych kierowane są brygady pracowników z innych przedsiębiorstw. Mają zastąpić strajkującą załogę. Organizatorzy podkreślają dobrowolność zgłoszeń oraz gotowość robotników do obrony wspólnego dorobku. W materiałach o organizacji wyjazdów dużo miejsca zajmuje współpraca między zakładami. Podkreśla się znaczenie fachowego przygotowania i właściwego rozdziału obowiązków. Pomoc przedstawiana jest jako sprawdzian odpowiedzialności za produkcję wykraczającej poza własny wydział.",
        "byline": "Redakcja"
      },
      "K-G-NAMES": {
        "title": "Zasłużeni ochotnicy",
        "body": "Wśród pracowników skierowanych do brygady w Zakładach Metalurgicznych wyróżniono operatora suwnicy Tadeusza Karskiego. Dyrekcja dziękuje za gotowość do podjęcia obowiązków w szczególnie wymagającym momencie. W uzasadnieniu wyróżnienia podkreślono przydatność doświadczenia zdobytego przy codziennej pracy. Obsługa urządzeń wymaga zarówno uwagi, jak i znajomości rytmu całego wydziału. Postawę oddelegowanych przedstawiono jako przykład dla pozostałych zespołów pracowniczych.",
        "byline": "Redakcja"
      },
      "K-F-QUESTION": {
        "title": "ROBOTNICY JEDNOMYŚLNIE POPIERAJĄ PARTIĘ?",
        "body": "Podczas zebrań w zakładach pracy podkreślano potrzebę spokoju i realizacji planów produkcyjnych. Według przedstawicieli władz stanowisko załóg świadczy o zaufaniu do przyjętego kierunku polityki oraz odpowiedzialności robotników za przyszłość. W omówieniach wiele miejsca zajęły obowiązki poszczególnych zespołów i znaczenie terminowości. Podkreślano, że codzienny wysiłek najlepiej wyraża przywiązanie do wspólnych celów. Wnioski z zebrań mają służyć dalszemu umacnianiu współpracy na wszystkich szczeblach.",
        "byline": "Redakcja"
      },
      "K-F-ERRATUM": {
        "title": "Od redakcji",
        "body": "W nagłówku wczorajszego materiału o poparciu robotników błędnie umieszczono znak zapytania. Redakcja przeprasza za niedopuszczalny błąd korektorski. Właściwy tytuł miał formę zdania oznajmującego. Treść materiału omawiała stanowiska przedstawione podczas zebrań zakładowych. Omyłka w składzie nagłówka mogła nadać im sens niezgodny z intencją publikacji. Zwracamy się do czytelników o przyjęcie niniejszego wyjaśnienia jako uzupełnienia poprzedniego wydania.",
        "byline": "Redakcja"
      },
      "K-F-SECOND": {
        "title": "List z osiedla",
        "body": "Mieszkańcy osiedla przesłali do redakcji list dotyczący zaopatrzenia sklepów. Przytaczamy jego końcowe zdanie: »Dziękujemy za braki w zaopatrzeniu«. Autorzy listu wskazali również kilka spraw wymagających dalszej poprawy. Korespondencja tego rodzaju stanowi cenne źródło wiadomości o codziennych potrzebach osiedla. Obok ogólnych ocen ważne są uwagi wynikające ze zwykłych zakupów. Redakcja podkreśla znaczenie rzeczowej wymiany opinii między klientami a osobami odpowiedzialnymi za handel.",
        "byline": "Redakcja"
      },
      "K-F-QUALITY": {
        "title": "Nowe zasady kontroli tekstów",
        "body": "W redakcji »Kuriera Obywatelskiego« wprowadzono dodatkową kontrolę materiałów przed drukiem. Zmiany kadrowe i organizacyjne mają zapobiec powtórzeniu niedawnego błędu w nagłówku oraz zapewnić właściwy poziom publikacji. Szczególną uwagę poświęcono nagłówkom, podpisom i zgodności tekstu ze składem. W pracy gazety każdy etap przygotowania numeru wymaga staranności, także gdy termin oddania materiałów jest bliski. Redakcja podkreśla odpowiedzialność całego zespołu za słowo drukowane.",
        "byline": "Redakcja"
      },
      "K-J-CHIEF": {
        "title": "Nowy naczelnik zapowiada porządki",
        "body": "Henryk Malec obejmuje wojewódzki wydział sportu. Powołana przez niego komisja zbada organizację zawodów w klubie »Płomień« i Miejskim Ośrodku Sportu. Naczelnik osobiście poprowadzi kontrolę placówek, którymi wcześniej kierował. W zapowiedzi podkreślono potrzebę lepszego obiegu informacji i jasnego podziału zadań. Znajomość obu placówek przedstawiono jako atut przy ocenie dokumentacji. Wnioski mają posłużyć usprawnieniu kolejnych imprez.",
        "byline": "Redakcja"
      },
      "K-J-DIRECTOR": {
        "title": "Zmiana kierownictwa zakładu",
        "body": "Po kontroli organizacji imprez sportowych odwołano dyrektora zakładu, przy którym działa klub »Płomień«. Komisji przewodniczył Henryk Malec. Odchodzący dyrektor wcześniej rekomendował go do zadań o szerszym zakresie odpowiedzialności. W omówieniu wyników kontroli zaakcentowano odpowiedzialność kierownictwa za nadzór nad przygotowaniami. Wiele miejsca zajęła potrzeba sprawniejszego obiegu informacji. Zmianę przedstawiono jako krok służący uporządkowaniu współpracy zakładu z organizatorami imprez.",
        "byline": "Redakcja"
      },
      "W-C-EARLY": {
        "title": "Mamy własny głos",
        "body": "Oddajemy w ręce czytelników pierwszy numer »Głosu Wzajemności«. Możliwość regularnego druku zawdzięczamy ludziom, którzy znaleźli czas i miejsce także po zakończeniu zwykłej zmiany. Kolejny numer za tydzień. Między informacjami z zakładów znajdzie się miejsce na sprawy pomocy i zwykłe wiadomości od czytelników. Nie każda z nich doczeka się osobnego nagłówka w codziennej prasie. Chcemy, żeby kartka przekazywana z rąk do rąk była także zapisem tego, czym żyjemy po wyjściu z pracy.",
        "byline": "Zespół redakcyjny"
      },
      "W-C-LATE": {
        "title": "Pierwszy numer",
        "body": "Po trudnościach z organizacją druku ukazuje się »Głos Wzajemności«. Udało się znaleźć zastępstwo i uruchomić skład. Pismo będzie wychodziło co tydzień, dopóki pozwolą na to warunki. Samo zebranie wiadomości nie wystarcza, gdy trzeba jeszcze przygotować tekst i doprowadzić go do maszyny. Ten numer jest wynikiem takiej wspólnej pracy. Obok spraw zakładowych chcemy zamieszczać wiadomości o pomocy, bo czytelnicy potrzebują również rzeczy użytecznych na co dzień.",
        "byline": "Zespół redakcyjny"
      },
      "W-A-STOP": {
        "title": "Nie wszędzie udało się rozbić związek",
        "body": "W jednym z zakładów nie doszło do planowanego przyjęcia nowego pracownika. Działacze, porównujący wydarzenia w innych przedsiębiorstwach, uznają to za istotne dla bezpieczeństwa swojej komórki. Nazwisk nie podajemy. Sama zbieżność dat nie wyjaśnia wszystkiego, ale nie należy jej pomijać przy czytaniu kolejnych komunikatów. W zakładowej kronice przyjęcie do pracy zajmuje jedną rubrykę. Dla ludzi próbujących utrzymać kontakt między sobą znaczenie takiego wpisu może być znacznie większe.",
        "byline": "Zespół redakcyjny"
      },
      "W-B-FIT": {
        "title": "Zwolniony, ale nie wykluczony",
        "body": "Stefan Wolszak, zwolniony po strajku w »Mierniku«, znalazł nowe zatrudnienie. Pozostaje w kontakcie z dawną załogą. Organizatorzy pomocy podkreślają, że utrata jednego miejsca pracy nie powinna oznaczać odebrania wszystkich następnych. Nowa praca oznacza możliwość układania codziennych wydatków bez ciągłego pytania o doraźną pomoc. Nie unieważnia jednak przyczyn wcześniejszego zwolnienia. Związek przypomina, że solidarność potrzebna jest również wtedy, gdy nazwisko przestaje pojawiać się w komunikatach.",
        "byline": "Zespół redakcyjny"
      },
      "W-B-REFUSED": {
        "title": "Pomoc dla zwolnionych",
        "body": "Stefan Wolszak nadal pozostaje bez zatrudnienia. Po zwolnieniu z »Miernika« nie uzyskał orzeczenia potrzebnego do podjęcia nowej pracy. Związek organizuje pomoc dla niego oraz innych rodzin pozbawionych dochodu. W domowym rachunku przedłużające się poszukiwanie pracy szybko staje się sprawą czynszu, opału i zakupów. Doraźne wsparcie pozwala przejść przez najbliższe dni, lecz nie zastąpi stałego zarobku. O tych zwykłych potrzebach łatwo zapomnieć, czytając urzędowe uzasadnienia.",
        "byline": "Zespół redakcyjny"
      },
      "W-D-HEAT": {
        "title": "Zastępstwo zamiast rozmów",
        "body": "Elektrociepłownię uruchomiono z pomocą zastępczej obsady i emerytowanych fachowców. Ogrzewanie wraca, lecz postulaty strajkujących pozostają bez odpowiedzi. Władze przedstawiają wznowienie pracy jako zakończenie sprawy. Mieszkańcy potrzebują ciepłych kaloryferów, a załoga potrzebuje odpowiedzi na swoje żądania. Jedna potrzeba nie usuwa drugiej. W komunikatach łatwo połączyć uruchomienie urządzeń z rozwiązaniem konfliktu; znacznie trudniej wskazać w nich miejsce pozostawione dla rozmowy.",
        "byline": "Zespół redakcyjny"
      },
      "W-D-STRIKE": {
        "title": "Strajk trwa",
        "body": "Nie udało się uruchomić elektrociepłowni zastępczą obsadą. Strajkujący utrzymują nacisk na rozpoczęcie rozmów. Jednocześnie spadek temperatury w mieszkaniach przypomina, że koszt przedłużającego się konfliktu ponoszą także mieszkańcy. Spór nie kończy się na bramie zakładu, kiedy w domu trzeba siedzieć w płaszczu. Nie znaczy to jednak, że rozmowę z załogą można zastąpić kolejnym apelem. Im dłużej trwa oczekiwanie, tym mniej użyteczne stają się zapewnienia, że sprawa znajduje się pod należytą kontrolą.",
        "byline": "Zespół redakcyjny"
      },
      "W-E-PREDICTED": {
        "title": "Wyniki znane przed badaniem",
        "body": "»Kurier« zapowiedział powrót sierżanta Marka Czarneckiego, zanim lekarz wydał orzeczenie. Badanie nie potwierdziło prasowej zapowiedzi. Najwyraźniej władza zna wyniki badań, zanim zbada pacjenta. W zwykłej kolejności najpierw odbywa się wizyta, a dopiero później można mówić o powrocie na stanowisko. W gazecie porządek ten okazał się mniej wiążący. Czytelnikowi pozostaje porównać daty i zastanowić się, komu właściwie potrzebne było wcześniejsze zapewnienie.",
        "byline": "Zespół redakcyjny"
      },
      "W-F-QUESTION": {
        "title": "Jedno słuszne pytanie",
        "body": "»ROBOTNICY JEDNOMYŚLNIE POPIERAJĄ PARTIĘ?« - zapytał »Kurier Obywatelski«. Redakcja już przeprosiła za pytanie. Pozostaje ustalić, czy podobny zakaz dotyczy także odpowiedzi. Przez jeden mały znak dobrze znany nagłówek zaczął wymagać zastanowienia. Te same wyrazy, ten sam uroczysty ton, a czytelnik otrzymał niespodziewanie miejsce dla własnego zdania. Sprostowanie starannie je zamknęło, choć trudno oczekiwać, że wszyscy równie szybko odłożą wątpliwości.",
        "byline": "Zespół redakcyjny"
      },
      "W-F-STAYS": {
        "title": "Czytamy uważnie",
        "body": "W kolejnym numerze »Kuriera« mieszkańcy dziękują za braki w zaopatrzeniu. Być może znów zabrakło słowa. Czytelnikom pozostawiamy ocenę, czy krótsza wersja jest mniej prawdziwa. Listy o zakupach zwykle kończą się zapewnieniem, że zgłoszone uwagi przyczynią się do poprawy. Tym razem codzienne doświadczenie klientów mieści się w zdaniu znacznie krótszym. Dla człowieka wracającego z pustą torbą różnica między intencją a drukiem może być trudna do zauważenia.",
        "byline": "Zespół redakcyjny"
      },
      "W-F-FIRED": {
        "title": "Zwolniona za znak zapytania",
        "body": "Po głośnym błędzie w nagłówku Zofia Witek została odsunięta od korekty. Oficjalnie chodzi o stan wzroku. Jej nazwisko zniknęło z redakcyjnej listy, choć przez ponad dwadzieścia lat poprawiała cudze teksty. Praca korektorki jest najmniej widoczna wtedy, gdy zostaje wykonana dobrze. Czytelnik nie liczy usuniętych literówek ani przywróconych przecinków. W tej sprawie całą uwagę skupiono na jednym znaku, a wieloletnią pracę sprowadzono do krótkiego wyjaśnienia kadrowego.",
        "byline": "Zespół redakcyjny"
      },
      "W-G-REFUSED": {
        "title": "Ochotnik, który nie wyjechał",
        "body": "Nie każdy pracownik wskazany do brygady zastępczej trafił do Zakładów Metalurgicznych. Jeden z operatorów nie uzyskał orzeczenia. Jego polecenie wyjazdu nazywało odmowę naruszeniem dyscypliny, mimo pieczęci o dobrowolnym zgłoszeniu. Na papierze wszystko wygląda jak zgodna współpraca przedsiębiorstw. Dopiero zestawienie obu pism pokazuje, ile miejsca pozostawiono na własną decyzję pracownika. Warto czytać także drobny druk pod uroczystym nagłówkiem, zwłaszcza gdy mówi o obowiązkach osoby nazwanej ochotnikiem.",
        "byline": "Zespół redakcyjny"
      },
      "W-G-SENT": {
        "title": "Dobrowolność na polecenie",
        "body": "Robotnicy kierowani do Zakładów Metalurgicznych otrzymują karty »dobrowolnego« zgłoszenia. Towarzyszą im polecenia przewidujące konsekwencje za odmowę. Wśród oddelegowanych znalazł się operator Tadeusz Karski. W urzędowym opisie wyjazd jest świadectwem gotowości do pomocy. W zakładowym poleceniu staje się obowiązkiem, z którego trzeba się rozliczyć. Oba pisma dotyczą tej samej podróży i tej samej osoby, lecz tylko jedno nadaje się do przytoczenia podczas uroczystych podziękowań.",
        "byline": "Zespół redakcyjny"
      },
      "W-H-STAYS": {
        "title": "Dopisek nie wystarczył",
        "body": "Edward Król z Zakładów Maszynowych zachował pracę mimo próby wykorzystania zmienionego skierowania. Do jego obowiązków nadal formalnie należy obsługa wózka. Związek zwraca uwagę, że problem wymaga dalszej interwencji. Samo pozostawienie człowieka na liście płac nie usuwa różnicy między dawną a obecną pracą. Skierowanie nadal opisuje szerszy zakres zadań niż stare orzeczenie. Potrzebne jest uporządkowanie obowiązków, a nie tylko zapewnienie, że po zakończeniu badania sprawę można odłożyć.",
        "byline": "Zespół redakcyjny"
      },
      "W-H-FIRED": {
        "title": "BHP jako narzędzie zwolnienia",
        "body": "Magazynier Edward Król został odsunięty od pracy po badaniu na stanowisko rozszerzone o obsługę wózka. Przez lata przyjmował i wydawał towar. Nowy obowiązek pozwolił dyrekcji wykorzystać jego dolegliwości przeciw niemu. Przy porównywaniu dokumentów trzeba patrzeć nie tylko na nazwę stanowiska, lecz także na opis czynności. Za tym samym słowem »magazynier« mogą kryć się różne wymagania. Stare orzeczenie nie obejmowało wózka, a dopisanie go do zadań nie poprawiło przecież zdrowia pracownika.",
        "byline": "Zespół redakcyjny"
      },
      "W-BG-HELP": {
        "title": "Pomoc przy pisaniu podań",
        "body": "W świetlicy przy ulicy Szkolnej można uzyskać pomoc przy przygotowaniu podań i odwołań. Dyżur odbywa się we wtorkowe popołudnia. Należy przynieść kopie dokumentów dotyczących sprawy. Przed pisaniem warto ułożyć pisma według dat i zaznaczyć, na które nie przyszła odpowiedź. Łatwiej wtedy oddzielić opis zdarzeń od samej prośby. Czytelny odpis przydaje się także później, gdy po kilku tygodniach trzeba przypomnieć sobie dokładne brzmienie złożonego podania.",
        "byline": "Zespół redakcyjny"
      },
      "W-BG-BOOKS": {
        "title": "Biblioteczka związkowa",
        "body": "Do biblioteczki w świetlicy przy Szkolnej trafiły podręczniki zawodowe i słowniki. Książki wypożyczane są po wpisaniu nazwiska do zeszytu. Osoby oddające egzemplarze proszone są o pozostawienie ich u prowadzącego dyżur. Wiele takich tomów przez lata zajmuje miejsce na domowej półce, choć komuś innemu mogłoby pomóc w nauce zawodu. Przy przekazywaniu książki warto sprawdzić, czy ma wszystkie strony. Słownik z luźną okładką wciąż może być użyteczny, jeśli czytelnik znajdzie w nim potrzebne hasło.",
        "byline": "Zespół redakcyjny"
      },
      "W-BG-CLOTHES": {
        "title": "Zbiórka ciepłej odzieży",
        "body": "W świetlicy przy Szkolnej trwa zbiórka ciepłych ubrań dla rodzin, które utraciły dochód. Przyjmowana jest odzież czysta i nadająca się do użytku. Najbardziej potrzebne są dziecięce kurtki i zimowe obuwie. Przed przyniesieniem rzeczy warto sprawdzić zapięcia i dobrać buty w pary. Rozmiar podany na kartce ułatwia znalezienie ubrania dla właściwej osoby. Drobna naprawa wykonana jeszcze w domu oszczędza pracy przy zbiórce i pozwala szybciej przekazać potrzebującym gotową rzecz.",
        "byline": "Zespół redakcyjny"
      },
      "K-A1": {
        "title": "Przywrócono porządek w zakładzie",
        "body": "W Zakładach Remontowych „Tor” zakończono działania przeciw grupie zakłócającej pracę przedsiębiorstwa. Kilku organizatorów nielegalnych zebrań zatrzymano. Dyrekcja zapewnia, że rozbita struktura nie będzie już utrudniać realizacji planu. W omówieniu sytuacji przypomniano znaczenie terminowego przekazywania taboru do ruchu. Rytm napraw zależy od współpracy kolejnych brygad i właściwego wykorzystania stanowisk. Według dyrekcji spokojne wykonywanie obowiązków pozwoli skupić uwagę na zadaniach warsztatów.",
        "byline": "Redakcja"
      },
      "K-A2": {
        "title": "Przywrócono porządek w zakładzie",
        "body": "W Zakładach Meblarskich „Brzoza” zakończono działania przeciw grupie zakłócającej pracę przedsiębiorstwa. Kilku organizatorów nielegalnych zebrań zatrzymano. Dyrekcja zapewnia, że rozbita struktura nie będzie już utrudniać realizacji planu. W komunikacie dużo miejsca poświęcono sprawnemu przekazywaniu pracy między wydziałami. Od przygotowania elementów po wykończenie mebli każdy etap wymaga staranności. Zdaniem dyrekcji troska o wspólny dorobek powinna znajdować wyraz przede wszystkim przy stanowisku pracy.",
        "byline": "Redakcja"
      },
      "K-A3": {
        "title": "Przywrócono porządek w zakładzie",
        "body": "W Zakładach Tekstylnych „Osnowa” zakończono działania przeciw grupie zakłócającej pracę przedsiębiorstwa. Kilku organizatorów nielegalnych zebrań zatrzymano. Dyrekcja zapewnia, że rozbita struktura nie będzie już utrudniać realizacji planu. Dyrekcja przypomina o wzajemnej zależności przędzalni, tkalni i wykończalni. Regularność pracy jednego wydziału wpływa na zadania pozostałych. W komunikacie podkreślono, że odpowiedzialność za jakość tkanin zaczyna się od sumiennego wykonywania zwykłych obowiązków.",
        "byline": "Redakcja"
      },
      "K-A4": {
        "title": "Przywrócono porządek w zakładzie",
        "body": "W Wytwórni Kabli „Przewód” zakończono działania przeciw grupie zakłócającej pracę przedsiębiorstwa. Kilku organizatorów nielegalnych zebrań zatrzymano. Dyrekcja zapewnia, że rozbita struktura nie będzie już utrudniać realizacji planu. Osobne miejsce w komunikacie zajęła odpowiedzialność za jakość wyrobów przekazywanych odbiorcom. Poszczególne etapy produkcji wymagają zgodnego działania wielu stanowisk. Dyrekcja wskazuje, że właściwa atmosfera pracy sprzyja zarówno terminowości, jak i dokładności.",
        "byline": "Redakcja"
      },
      "K-A5": {
        "title": "Przywrócono porządek w zakładzie",
        "body": "W Zakładach Ceramicznych „Klinkier” zakończono działania przeciw grupie zakłócającej pracę przedsiębiorstwa. Kilku organizatorów nielegalnych zebrań zatrzymano. Dyrekcja zapewnia, że rozbita struktura nie będzie już utrudniać realizacji planu. W omówieniu podkreślono konieczność zachowania rytmu kolejnych etapów produkcji. Przygotowanie surowca, wypał i ocena wyrobów tworzą wspólny proces. Zdaniem dyrekcji nie można oddzielać troski o wynik przedsiębiorstwa od odpowiedzialności za własny odcinek pracy.",
        "byline": "Redakcja"
      },
      "K-A6": {
        "title": "Przywrócono porządek w zakładzie",
        "body": "W Przedsiębiorstwie Transportu Miejskiego zakończono działania przeciw grupie zakłócającej pracę przedsiębiorstwa. Kilku organizatorów nielegalnych zebrań zatrzymano. Dyrekcja zapewnia, że rozbita struktura nie będzie już utrudniać realizacji planu. W komunikacie przypomniano, że codzienny wyjazd pojazdów wymaga współpracy obsługi, warsztatów i dyspozytorni. Pasażer ocenia tę pracę przede wszystkim po regularności kursów. Dyrekcja wskazuje punktualność jako wspólny obowiązek wszystkich komórek przedsiębiorstwa.",
        "byline": "Redakcja"
      },
      "K-D-PENDING": {
        "title": "Przygotowania w elektrociepłowni trwają",
        "body": "W Miejskiej Elektrociepłowni nadal kompletowana jest obsada potrzebna do uruchomienia instalacji. Rozmowy z załogą nie przyniosły dotąd porozumienia. Nie podano nowego terminu wznowienia pracy. Przygotowanie grafiku wymaga uwzględnienia kwalifikacji poszczególnych osób i ciągłości dyżurów. W komunikacie podkreśla się, że samo zgłoszenie gotowości nie zamyka spraw organizacyjnych. Władze zapewniają o znaczeniu, jakie przywiązują do potrzeb odbiorców ciepła.",
        "byline": "Redakcja"
      },
      "K-E-PENDING": {
        "title": "Powrót po zakończeniu formalności",
        "body": "Komenda informuje, że termin powrotu sierżanta Marka Czarneckiego zostanie podany po zakończeniu wymaganych formalności. Wcześniejsza zapowiedź miała charakter planowany. W informacji przekazanej prasie podkreślono znaczenie prawidłowego obiegu dokumentów między placówkami. Gotowość funkcjonariusza i ustalenie dnia objęcia patrolu opisano jako odrębne kwestie organizacyjne. Komenda ponownie przypomniała o doświadczeniu zdobytym przez sierżanta podczas wcześniejszej służby.",
        "byline": "Redakcja"
      }
    },
    "actors": {
      "agent": "Roman Kurek",
      "strike-leader": "Stefan Wolszak",
      "printer": "Jerzy Borkowski",
      "dispatcher": "Antoni Rybak",
      "sergeant": "Marek Czarnecki",
      "proofreader": "Zofia Witek",
      "volunteer": "Tadeusz Karski",
      "storekeeper": "Edward Król",
      "alias": "Jan Sikora",
      "alias-real": "Andrzej Lis",
      "malec": "Henryk Malec"
    },
    "issuers": {
      "chamber": "Izba Lekarska",
      "union": "Wzajemność",
      "militant": "Wzajemność Walcząca",
      "clinic": "Dyrekcja przychodni",
      "security": "Biuro postępowań wyjaśniających",
      "employer": "Dział kadr",
      "printing": "Państwowa Drukarnia",
      "editorial": "Redakcja Kuriera Obywatelskiego",
      "militia": "Komenda Wojewódzka MO",
      "committee": "Komitet Wojewódzki",
      "personal": "Korespondencja prywatna",
      "clinical": "Pracownia badań specjalistycznych",
      "party": "Komitet zakładowy"
    },
    "signatures": {
      "chamber": "Sekretarz Izby",
      "union": "Komisja zakładowa",
      "militant": "Wzajemność Walcząca",
      "clinic": "Dyrektor przychodni",
      "security": "Prowadzący postępowanie",
      "employer": "Kierownik działu kadr",
      "printing": "Inspektor BHP",
      "editorial": "Redaktor naczelny",
      "militia": "Z upoważnienia komendanta",
      "committee": "Sekretarz Komitetu",
      "personal": "A.L.",
      "clinical": "Lekarz specjalista",
      "party": "Sekretarz komitetu zakładowego"
    },
    "ui": {
      "continueWork": "KOLEJNY DYŻUR",
      "backToMenu": "MENU",
      "readEndingDocument": "CZYTAJ DOKUMENT",
      "backToEnding": "POWRÓT",
      "previousPage": "Poprzednia strona",
      "nextPage": "Następna strona",
      "call": "Zadzwoń w sprawie dokumentu",
      "document": "Dokument fabularny",
      "unionTitle": "Głos Wzajemności",
      "unionStrapline": "Tygodnik związkowy",
      "readDocument": "Przeczytaj dokument",
      "received": "Doręczono korespondencję.",
      "subject": "Dotyczy",
      "issued": "Wystawiono",
      "reference": "Sygnatura",
      "telephone": "Telefon",
      "room": "Gabinet 04",
      "doctorSignature": "Podpis lekarza gabinetu 04",
      "decisionFit": "ZDOLNY",
      "decisionUnfit": "ODMOWA",
      "dateOfBirth": "Data urodzenia",
      "voluntary": "ZGŁOSZENIE DOBROWOLNE",
      "historical": "ODPIS HISTORYCZNY",
      "returnToEnding": "Wróć do epilogu",
      "chapterComplete": "KONIEC ROZDZIAŁU",
      "endingDescription": "Zakończenie pierwszego rozdziału.",
      "job": "Stanowisko",
      "sourceDecision": "Orzeczenie",
      "page": "Strona",
      "additionalDocuments": "Dodatkowe dokumenty pacjenta",
      "takeDocument": "Weź dokument",
      "readOnly": "Dokument tylko do odczytu",
      "unjustified_refusal": "Odmowa bez przeciwwskazań",
      "contraindication_ignored": "Zgoda pomimo przeciwwskazania",
      "identity_falsification": "Orzeczenie na nieprawdziwe dane",
      "inconsistency": "Zmiana przy tych samych wynikach",
      "certificateNumber": "Numer legitymacji",
      "control": "kontrolne"
    },
    "documents": {
      "A-FAKE": {
        "title": "Potwierdzenie Izby / odpis",
        "body": "Izba Lekarska potwierdza możliwość wydawania orzeczeń pozytywnych obywatelowi Romanowi Kurkowi we wszystkich zakładach kierujących. Odchylenia wartości ciśnienia nie stanowią podstawy odmowy. Niniejsze pismo zachowuje ważność bezterminowo."
      },
      "A-WARNING": {
        "title": "Ostatnie ostrzeżenie",
        "body": "Roman Kurek nie szuka pracy. Po jego wizytach znikają nasi ludzie. Mamy kopie wystawionych przez pana orzeczeń. Jeśli dopuści go pan do kolejnego zakładu, opublikujemy je z pańskim podpisem i numerem gabinetu. To ostatnie ostrzeżenie. Wzajemność Walcząca."
      },
      "A-EXPOSURE": {
        "title": "Podpis z gabinetu 04",
        "body": "Publikujemy kopie pozytywnych orzeczeń wydanych mimo przeciwwskazań oraz naszego ostrzeżenia. Daty i podpis wskazują ten sam gabinet."
      },
      "A-CLOSURE": {
        "title": "Odsunięcie od orzekania",
        "body": "W związku z ujawnieniem kopii orzeczeń i dokumentacji wskazującej podstawy ich wydania odsuwa się lekarza od orzekania w gabinecie 04. Obowiązki przejmie inny lekarz."
      },
      "B-CHAMBER": {
        "title": "Interpretacja wymagań",
        "body": "Dla wskazanego stanowiska nie wprowadzono odrębnego wykazu wartości granicznych. Lekarz dokonuje indywidualnej oceny zdolności do pracy, uwzględniając wyniki badań, wywiad oraz pracę na wysokościach. Niniejsza informacja nie uchyla pozostałych obowiązków związanych z orzekaniem."
      },
      "B-LEAFLET": {
        "title": "Pomoc zwolnionym z Miernika",
        "body": "Stefan Wolszak i inni pracownicy zwolnieni z Zakładów Aparatury „Miernik” potrzebują pracy i pomocy dla rodzin. Utrata zatrudnienia nie może oznaczać wykluczenia ze wspólnoty. Wiadomości przyjmujemy w świetlicy przy Szkolnej."
      },
      "C-BHP": {
        "title": "Protokół narażenia na hałas",
        "body": "Stanowisko: operator maszyny offsetowej, zmiana nocna. W hali występuje stały hałas maszynowy. Zaleca się ocenę słuchu metodą audiometrii oraz kontrolę po pierwszych dziesięciu dniach pracy. Wynik badania dołączono do dokumentacji kandydata."
      },
      "C-AUDIO": {
        "title": "Audiometria",
        "body": "Niewielki ubytek słuchu. Wynik graniczny, do indywidualnej oceny lekarza medycyny pracy. Warunki: obsługa maszyny offsetowej, hałas, zmiana nocna."
      },
      "C-AUDIO-CONTROL": {
        "title": "Audiometria kontrolna",
        "body": "Wynik i ocena identyczne jak w badaniu wstępnym. Niewielki ubytek słuchu, bez pogorszenia. Wynik graniczny, do indywidualnej oceny lekarza. Stanowisko i warunki pracy nie uległy zmianie."
      },
      "C-PRINT-NOTE": {
        "title": "Pierwszy numer",
        "body": "Dziękujemy. Udało się uruchomić skład i druk po zwykłej zmianie. Wraz z tą kartką przekazujemy pierwszy numer Głosu Wzajemności."
      },
      "C-PAUSE": {
        "title": "Przerwa w druku",
        "body": "Dzisiejszy numer nie ukaże się. Po odsunięciu operatora nie mamy obsady do druku. Następne wydanie planujemy w zwykłym terminie za tydzień."
      },
      "D-PARTY": {
        "title": "Pilne uruchomienie instalacji",
        "body": "W związku z zagrożeniem ciągłości ogrzewania zwracamy się o pilne przeprowadzenie badania obywatela Antoniego Rybaka. Jego doświadczenie jest niezbędne do bezpiecznego uruchomienia instalacji. Prosimy o uwzględnienie szczególnego znaczenia sprawy dla mieszkańców."
      },
      "E-EYE": {
        "title": "Wynik okulistyczny",
        "body": "Lewe oko: -6,00 dpt. Prawe oko: -1,00 dpt. Utrzymują się trudności wzrokowe po urazie. Ocena graniczna; o zdolności do służby patrolowej rozstrzyga lekarz medycyny pracy z uwzględnieniem pełnego badania."
      },
      "E-COMMAND": {
        "title": "Powrót do służby",
        "body": "Prosimy o pilne wydanie pozytywnego orzeczenia umożliwiającego sierżantowi Markowi Czarneckiemu powrót do służby patrolowej. Powrót funkcjonariusza ma istotne znaczenie dla obsady jednostki i został uwzględniony w jej planie służb."
      },
      "F-EYE": {
        "title": "Wynik okulistyczny",
        "body": "Lewe oko: -6,00 dpt. Prawe oko: -2,00 dpt. Pogarszające się widzenie z bliska mimo okularów. Trudności z drobnym drukiem. Wynik graniczny, do indywidualnej oceny z uwzględnieniem pracy korektorki."
      },
      "F-EDITOR": {
        "title": "Notatka służbowa",
        "body": "Proszę o szczególnie dokładną ocenę zdolności pracownicy do kontroli drobnego druku. W ostatnim numerze doszło do rażącego zaniedbania obowiązków, skutkującego zniekształceniem sensu materiału na pierwszej stronie."
      },
      "G-DELEGATION": {
        "title": "Karta oddelegowania",
        "body": "Tadeusz Karski. Stanowisko: operator suwnicy. Zakład przyjmujący: Zakłady Metalurgiczne. Przydział: brygada zastępcza. ZGŁOSZENIE DOBROWOLNE."
      },
      "G-ORDER": {
        "title": "Odpis polecenia służbowego",
        "body": "Pracownika oddelegowuje się do brygady zastępczej w Zakładach Metalurgicznych. Odmowa oddelegowania traktowana będzie jako naruszenie dyscypliny pracy.\n\nDoktorze, nie chcę zastępować strajkujących. Sam nie mogę odmówić. Proszę mnie nie dopuścić."
      },
      "G-COMPLAINT": {
        "title": "Podstawy odmowy",
        "body": "Prosimy o przedstawienie podstaw odmownego orzeczenia dla Tadeusza Karskiego. Wyniki przedłożonych badań nie wskazują przeciwwskazań do pracy na dotychczas obsługiwanym stanowisku."
      },
      "H-OLD-CERT": {
        "title": "Orzeczenie z poprzedniego roku",
        "body": "Edward Król. Data wystawienia: 19.11.1982. Stanowisko: magazynier - przyjmowanie i wydawanie towaru. ZDOLNY. Zakres nie obejmuje obsługi wózka widłowego."
      },
      "H-LEAFLET": {
        "title": "BHP w służbie Partii",
        "body": "W Zakładach Maszynowych do obowiązków magazynierów dopisuje się prowadzenie wózków, choć pracę tę nadal wykonuje wydzielona obsada. Potem pracowników kieruje się na badania. Negatywne orzeczenie staje się podstawą pozbycia się ludzi niewygodnych dla dyrekcji."
      },
      "H-OUTCOME-FIT": {
        "title": "Aktualny zakres obowiązków",
        "body": "Potwierdzamy pozostawienie Edwarda Króla na stanowisku magazyniera w zakresie opisanym w aktualnym skierowaniu, w tym przy obsłudze wózka widłowego."
      },
      "H-OUTCOME-REFUSED": {
        "title": "Decyzja kadrowa",
        "body": "W związku z odmownym orzeczeniem Edward Król został odsunięty od obowiązków. Rozpoczęto czynności dotyczące rozwiązania stosunku pracy."
      },
      "I-EYE": {
        "title": "Wynik badania wzroku",
        "body": "Andrzej Lis. Lewe oko: -1,00 dpt. Prawe oko: -1,00 dpt. Wynik prawidłowy. Dane badanej osoby odpowiadają nazwisku na tym wyniku."
      },
      "I-HEARING": {
        "title": "Wynik badania słuchu",
        "body": "Andrzej Lis. Słuch bez zastrzeżeń. Wynik badania prawidłowy. Odpis wydano do rąk badanego."
      },
      "I-NOTE": {
        "title": "Wyjaśnienie",
        "body": "Lis to moje prawdziwe nazwisko. Po aresztowaniach w Zakładach Maszynowych straciłem pracę. Od tamtej pory wszędzie odmawiają. Skierowanie na Sikorę załatwił znajomy. Proszę wystawić orzeczenie tak, jak jest na skierowaniu. To pierwsza szansa od kilku tygodni."
      },
      "I-THANKS": {
        "title": "Podziękowanie",
        "body": "Przyjęli mnie. Na liście jestem jako Sikora. Pierwszy raz od tygodni mam dokąd pójść rano. Dziękuję. A.L."
      },
      "J-PARTY-CARD": {
        "title": "Legitymacja partyjna",
        "body": "Henryk Malec. Numer 04-5182. Członek zakładowej organizacji partyjnej."
      },
      "J-OPINION-1": {
        "title": "Opinia o pracowniku",
        "body": "Wybitne zdolności organizacyjne. W pełni zasługuje na powierzenie mu zadań o szerszym zakresie odpowiedzialności.\n\nDotychczasowe miejsce pracy: Zakładowy Klub Sportowy „Płomień”."
      },
      "J-OPINION-2": {
        "title": "Opinia dyrekcji MOS",
        "body": "Niezwykła inicjatywa, zdecydowanie i umiejętność podejmowania śmiałych decyzji. Dotychczasowe stanowisko nie pozwala w pełni wykorzystać jego potencjału."
      },
      "J-RESULTS": {
        "title": "Wyniki badań",
        "body": "Ciśnienie: 145/90 mmHg. Wzrok: -1,00 / -1,00 dpt. Badanie ogólne: bez zastrzeżeń. Brak przeciwwskazań. Profil wymagań kierowniczych pozostaje taki sam na obu stanowiskach."
      },
      "J-COMPLAINT-1": {
        "title": "Podstawy odmowy",
        "body": "Prosimy o wskazanie podstaw odmowy dopuszczenia Henryka Malca. Przedstawione wyniki nie wskazują przeciwwskazań do objęcia stanowiska dyrektora."
      },
      "J-COMPLAINT-2": {
        "title": "Wyjaśnienie zmiany orzeczenia",
        "body": "Zwracamy się o wyjaśnienie odmowy dla Henryka Malca. Niedawne pozytywne orzeczenie wydano przy porównywalnych obowiązkach i tych samych wynikach badań."
      },
      "SYS-SECURITY": {
        "title": "Zachowanie dokumentacji",
        "body": "W związku z serią rozstrzygnięć dotyczących pracowników objętych postępowaniami prosimy zachować pełną dokumentację. Prawidłowość identyfikacji osób i podstaw orzeczeń będzie przedmiotem wyjaśnień."
      },
      "SYS-AUDIT": {
        "title": "Rozbieżności w dokumentacji",
        "body": "W dokumentacji stwierdzono rozbieżności wymagające wyjaśnienia. Dalsze orzeczenia bez podstaw mogą skutkować cofnięciem upoważnienia do pracy w gabinecie."
      },
      "SYS-CONSISTENCY": {
        "title": "Zmiana stanowiska",
        "body": "Prosimy wyjaśnić zmianę orzeczenia przy niezmienionych wynikach i porównywalnych wymaganiach. Kolejne podobne rozbieżności podważą możliwość dalszego powierzenia gabinetu."
      },
      "END-AUDIT": {
        "title": "Cofnięcie upoważnienia",
        "body": "Po analizie wskazanych poniżej orzeczeń cofa się upoważnienie do orzekania w tej placówce. Gabinet 04 zostaje przekazany innemu lekarzowi. Decyzja dotyczy prowadzenia tego gabinetu."
      },
      "END-SECURITY": {
        "title": "Wezwanie do wyjaśnień",
        "body": "Wzywa się lekarza gabinetu 04 do złożenia wyjaśnień w wymienionych sprawach. Potwierdza się zabezpieczenie dokumentacji wskazanych orzeczeń. Dalsze czynności zostaną przeprowadzone poza przychodnią."
      },
      "END-PARTY": {
        "title": "Podziękowanie Komitetu",
        "body": "Dziękujemy za odpowiedzialną postawę w sprawach istotnych dla prawidłowego funkcjonowania miasta. Liczymy na dalszą rzeczową współpracę."
      },
      "END-UNION": {
        "title": "Krótka kartka",
        "body": "Nie wszyscy mogli otrzymać zgodę. Wiemy jednak, kiedy decyzja wynikała z badania, a kiedy ktoś próbował użyć gabinetu przeciw ludziom. Dziękujemy, że nie wszystko dało się załatwić poleceniem z góry."
      },
      "END-ROTA": {
        "title": "Przydział dalszych dyżurów",
        "body": "Gabinet 04 pozostaje pod dotychczasową obsadą lekarską. Kolejny dyżur rozpoczyna się w następnym dniu pracy. Godziny przyjęć i obowiązki związane z prowadzeniem dokumentacji pozostają bez zmian."
      },
      "REF": {
        "title": "Skierowanie na badania",
        "body": "Pracownika kieruje się na badanie medycyny pracy zgodnie ze stanowiskiem i warunkami podanymi w skierowaniu."
      },
      "C-AD": {
        "title": "Operator na nocną zmianę",
        "body": "Państwowa Drukarnia zatrudni operatora maszyny offsetowej na nocną zmianę. Wymagane doświadczenie i aktualne orzeczenie lekarskie. Informacje w portierni, tel. 46-0101."
      }
    },
    "classifieds": {
      "C-AD": "Państwowa Drukarnia zatrudni operatora maszyny offsetowej na nocną zmianę. Wymagane doświadczenie i aktualne orzeczenie lekarskie. Informacje w portierni."
    },
    "phones": {
      "print-open": "Portiernia drukarni. Szukamy operatora na nocną zmianę. Kandydat dostał skierowanie.",
      "print-closed": "Sprawę obsady przekazano kierownikowi. Ogłoszenie jest już nieaktualne.",
      "chamber-genuine": "Kolego, pismo jest nasze. Decyzja należy do lekarza, po uwzględnieniu warunków pracy.",
      "chamber-forged": "Kolego, nie wystawiamy takich zwolnień. Ten numer pisma nie figuruje w rejestrze.",
      "power": "Do uruchomienia potrzebujemy dyspozytora znającego tę instalację. Rybak jest jednym z niewielu dostępnych specjalistów.",
      "warehouse": "Obowiązuje stanowisko opisane w aktualnym skierowaniu, wraz z obsługą wózka. Nie mamy dla pana innego formularza.",
      "mos": "Opinia jest aktualna. Dyrekcja uważa, że obywatel Malec powinien jak najszybciej objąć stanowisko odpowiadające jego możliwościom."
    },
    "phoneNotes": {
      "print-open": "Drukarnia poszukuje operatora nocnej zmiany.",
      "print-closed": "Ogłoszenie drukarni nieaktualne.",
      "chamber-genuine": "Izba potwierdziła pismo; ocena należy do lekarza.",
      "chamber-forged": "Izba zaprzecza wystawieniu zwolnienia.",
      "power": "Dyspozytor zna instalację; brak zastępstwa.",
      "warehouse": "Kadry potwierdzają obowiązek obsługi wózka.",
      "mos": "MOS potwierdza aktualność opinii."
    },
    "speech": {
      "A1": "Pierwszy dzień w nowym zakładzie. Potrzebuję tylko orzeczenia.",
      "A2": "Nowy zakład. Potrzebuję orzeczenia.",
      "A3": "Znów zmieniam pracę.",
      "A4": "W Izbie już sprawę wyjaśnili. Wszystko jest na piśmie.",
      "A5": "Mam kolejny odpis z Izby.",
      "A6": "Zakład czeka. Proszę nie zatrzymywać dokumentów.",
      "A7": "Dokumenty są. Zakład czeka.",
      "B1": "Tamtej pracy już nie odzyskam. Tę chciałbym przynajmniej dostać.",
      "C1": "W dzień maszyny chodzą dla redakcji. Nocą też byłaby robota.",
      "C2": "Kontrola po okresie próbnym. Wyniki są takie jak poprzednio.",
      "D1": "Instalację znam od początku. Tylko zdrowie już nie takie.",
      "E1-VISIT": "W gazecie już napisali. Ja dopiero po dokumenty.",
      "F1": "Dwadzieścia trzy lata poprawiam cudze zdania. Teraz sprawdzają moje oczy.",
      "G1": "Na karcie napisali, że dobrowolnie.",
      "H1": "Od dwudziestu lat wydaję części. Wózkami jeżdżą inni.",
      "I1": "Z nazwiskami jest problem. Napisałem wszystko na kartce.",
      "J1": "W klubie zrobiłem już wszystko. Czas na większe zadania.",
      "J2": "Teraz potrzebują mnie w województwie. Wyniki mówią same za siebie.",
      "thanks": "Dziękuję, doktorze."
    },
    "endings": {
      "exposed": {
        "title": "Spalona pieczątka",
        "body": "Kopie twoich orzeczeń krążą po zakładach. Podpis i numer gabinetu wystarczyły, żeby wszyscy wiedzieli, kto je wystawił. Ci, którzy prosili o przysługę, nie odbierają telefonu. Od jutra gabinet 04 prowadzi ktoś inny.",
        "description": "Na biurku powielona kartka i odłożona pieczątka. W drzwiach stoi pracownik administracji."
      },
      "clinic-closed": {
        "title": "Gabinet zamknięty",
        "body": "W aktach znalazło się więcej niż jedno orzeczenie bez podstaw. Komisja nie potrzebowała domysłów. Wystarczyły wyniki, skierowania i twój podpis. Cofnięto upoważnienie do prowadzenia gabinetu.",
        "description": "Zamknięte drzwi gabinetu 04. Zdjęta tabliczka przyjęć. Na stoliku leży teczka akt i pismo.",
        "bodyInconsistency": "Przy tych samych przesłankach zapadały różne decyzje. Po pierwszym piśmie przyszły następne przykłady. Nikt nie chce już odpowiadać za twoje orzeczenia. Gabinet otrzyma inny lekarz."
      },
      "detained": {
        "title": "Do wyjaśnienia",
        "body": "Najpierw proszono o wyjaśnienia. Teraz zabezpieczają dokumenty. Dla prowadzących sprawę twoje podpisy układają się w prostą historię: gabinet pomagał ludziom, którym odmawiano innych dróg. Dziś nie wrócisz już do pracy.",
        "description": "Pusty gabinet z otwartymi szufladami. Dwie postacie w cywilnych płaszczach zabierają teczkę dokumentów."
      },
      "party-continue": {
        "title": "Pod opieką Komitetu",
        "body": "W Komitecie mówią o tobie dobrze. Kilka twoich decyzji pomogło przywrócić porządek, obsadzić stanowiska i zamknąć niewygodne sprawy. Gabinet zostaje pod twoją opieką. Następne skierowania już przygotowano.",
        "description": "Biurko o świcie. Oficjalny list z pieczęcią Komitetu, starannie ustawiona pieczątka i oczekująca sylwetka."
      },
      "union-continue": {
        "title": "Nasz lekarz",
        "body": "W zakładach wiedzą, że w gabinecie 04 nie każda prośba z góry staje się poleceniem. Przychodzi krótka kartka z podziękowaniem. Żadnej gwarancji bezpieczeństwa, żadnych wielkich słów. Jutro znów będą pacjenci.",
        "description": "Dyskretna kartka wsunięta pod drzwi. W przygaszonym świetle czeka zwykła kolejka pracowników."
      },
      "independent-continue": {
        "title": "Jutro zwykły dyżur",
        "body": "Nie otrzymujesz odznaczenia ani listu, który obiecywałby ochronę. Na nowym rozkładzie dyżurów nadal widnieje gabinet 04. Te same godziny przyjęć, te same formularze i następna kolejka ludzi, których sprawy nie mieszczą się w rubrykach.",
        "description": "Pusty gabinet przed rozpoczęciem pracy. Świeża gazeta, zamknięte szuflady i telefon."
      }
    }
  },
  "en": {
    "articles": {
      "K-A1": {
        "title": "Order restored at the works",
        "body": "Action against a group disrupting operations at Track Repair Works has concluded. Several organisers of illegal meetings were detained. Management says the dismantled group will no longer obstruct fulfilment of the plan. The report recalls the importance of returning rolling stock to service on time. The pace of repairs depends on successive teams working together and making proper use of workshop space. Management says the calm performance of duties will allow attention to return to the workshops’ tasks.",
        "byline": "The editors"
      },
      "K-A2": {
        "title": "Order restored at the works",
        "body": "Action against a group disrupting operations at Birch Furniture Works has concluded. Several organisers of illegal meetings were detained. Management says the dismantled group will no longer obstruct fulfilment of the plan. The statement gives much space to the smooth transfer of work between departments. From preparing parts to finishing furniture, each stage requires care. Management believes concern for shared achievements should be expressed above all through attention at each employee’s workstation.",
        "byline": "The editors"
      },
      "K-A3": {
        "title": "Order restored at the works",
        "body": "Action against a group disrupting operations at Weft Textile Works has concluded. Several organisers of illegal meetings were detained. Management says the dismantled group will no longer obstruct fulfilment of the plan. Management recalls the dependence of spinning, weaving and finishing departments on one another. Regular work in one department affects the tasks of the others. The statement stresses that responsibility for the quality of cloth begins with the conscientious performance of ordinary duties.",
        "byline": "The editors"
      },
      "K-A4": {
        "title": "Order restored at the works",
        "body": "Action against a group disrupting operations at Conduit Cable Works has concluded. Several organisers of illegal meetings were detained. Management says the dismantled group will no longer obstruct fulfilment of the plan. The statement gives particular attention to responsibility for the quality of goods delivered to customers. The stages of production require co-ordinated work across many stations. Management says a proper working atmosphere encourages both punctual delivery and precision in manufacture.",
        "byline": "The editors"
      },
      "K-A5": {
        "title": "Order restored at the works",
        "body": "Action against a group disrupting operations at Clinker Ceramics Works has concluded. Several organisers of illegal meetings were detained. Management says the dismantled group will no longer obstruct fulfilment of the plan. The report stresses the need to maintain the rhythm of successive production stages. Preparing material, firing and checking finished goods form a shared process. Management says concern for the enterprise’s results cannot be separated from responsibility for one’s own part of the work.",
        "byline": "The editors"
      },
      "K-A6": {
        "title": "Order restored at the works",
        "body": "Action against a group disrupting operations at Municipal Transport Company has concluded. Several organisers of illegal meetings were detained. Management says the dismantled group will no longer obstruct fulfilment of the plan. The statement recalls that getting vehicles out each morning requires co-operation between crews, workshops and dispatchers. Passengers judge this work chiefly by the regularity of services. Management identifies punctuality as a shared duty of every department in the enterprise.",
        "byline": "The editors"
      },
      "K-B-STRIKE": {
        "title": "Discipline at Gauge Works",
        "body": "Part of the workforce at Gauge Instrument Works remains on strike. Management has dismissed Stephen Welsby, the protest organiser. Its statement cites a breach of discipline and disruption of the enterprise’s work. The detailed statement recalls the duties set out in workplace regulations. It gives particular attention to responsibility for completing orders on time. Management stresses that calm, orderly work in each department serves the interests of the entire workforce.",
        "byline": "The editors"
      },
      "K-J-STADIUM": {
        "title": "Youth games cancelled",
        "body": "Teams arriving for the regional youth games could not begin competing. The stadium was unavailable on the booked date. The organiser, Flame Sports Club under Henry Small, cites unforeseen organisational difficulties. The account of preparations devotes much space to the educational value of sport and co-operation between clubs. Availability of the venue is treated as a technical matter. Participants must await further arrangements concerning the shared calendar of events.",
        "byline": "The editors"
      },
      "K-E-HERO": {
        "title": "Militia hero returns to duty",
        "body": "Sergeant Mark Blackwell, injured during recent disturbances, has completed his convalescence. He will resume patrol duty tomorrow. Headquarters praises his determination and the care provided to the distinguished officer. The press statement recalls the importance of experience gained through daily contact with residents. It also praises the support of colleagues during recovery. The announced patrol is presented as a further example of the spirit of service maintained throughout the unit.",
        "byline": "The editors"
      },
      "K-E-RETURN": {
        "title": "Back on patrol",
        "body": "Sergeant Mark Blackwell has completed his first patrol since convalescence. His commanders present the return as proof of effective rehabilitation and care for officers injured in the line of duty. The account of his service gives particular attention to continuity of duties. Daily rounds require knowledge of the area and patience with residents’ smaller concerns. Headquarters stresses that the value of experience is best demonstrated through these ordinary tasks.",
        "byline": "The editors"
      },
      "K-E-BLOCKED": {
        "title": "Who is delaying the officer’s return?",
        "body": "Sergeant Mark Blackwell’s announced return has been suspended following an occupational health doctor’s decision. Headquarters expects an explanation of why the distinguished officer still cannot resume his duties. The unit’s statement recalls earlier preparations to restore the patrol roster. It stresses the need for efficient co-operation between all institutions concerned. Headquarters believes the matter deserves attention proportionate to the importance of everyday service to residents.",
        "byline": "The editors"
      },
      "K-E-CORRECTION": {
        "title": "Correction",
        "body": "Our report on Sergeant Mark Blackwell gave an inaccurate date for his planned return to duty. The date was provisional. The editors apologise for the inaccuracy. The information appeared in an article about care for officers recovering from injury. Its wording may have suggested greater certainty than the provisional arrangements justified. Readers are asked to bear this clarification in mind when consulting the earlier issue of the paper.",
        "byline": "The editors"
      },
      "K-D-STRIKE": {
        "title": "Heating for residents",
        "body": "Mutuality’s strike continues at the Municipal Heat and Power Plant. The authorities are preparing to restart the installation with replacement staff. The Provincial Committee says continuous heating is its most urgent concern. The statement devotes considerable attention to housing estates, schools and care facilities. It stresses familiarity with the equipment and the responsibility involved in taking a shift. Preparations are described as a shared task for technical staff and the administration.",
        "byline": "The editors"
      },
      "K-D-HEAT": {
        "title": "Heat and power plant restarts",
        "body": "Experienced staff, including retired dispatcher Anthony Fisher, have helped restart the installation. The authorities announce the restoration of heating and thank those who answered the appeal. The official thanks place particular emphasis on experience acquired over many years. According to the statement, knowledge of the installation matters as much as readiness to take a shift. Restoring supplies is presented as an example of co-operation between generations.",
        "byline": "The editors"
      },
      "K-D-COLD": {
        "title": "Heating restrictions",
        "body": "The strike at the heat and power plant continues. A complete team of specialists could not be assembled to restart it. Housing blocks and schools report lower indoor temperatures. Administrative notices return to the need to conserve the heat available. Preparing equipment alone does not settle the question of staffing the shifts. The authorities renew their appeal for responsibility, citing residents who are waiting for conditions in their homes to improve.",
        "byline": "The editors"
      },
      "K-J-POOL": {
        "title": "Ambitious plans for city sport",
        "body": "Competitors invited by the Municipal Sports Centre found the swimming pool closed for repairs. Director Henry Small promises a new competition date. The centre cites temporary difficulties linked to its ambitious development programme. The programme calls for better use of facilities and closer co-ordination of the sporting calendar. Repairs are described as part of these wider preparations. For the visiting teams, however, the most useful detail remains the day on which they will actually be able to enter the water.",
        "byline": "The editors"
      },
      "K-G-BRIGADES": {
        "title": "Volunteers rescue production",
        "body": "Brigades from other enterprises are being sent to the Metallurgical Works to replace the striking workforce. The organisers emphasise voluntary applications and workers’ readiness to defend their shared achievements. Accounts of the arrangements devote much space to co-operation between enterprises. They stress professional preparation and the proper allocation of duties. The assistance is presented as a test of responsibility for production extending beyond each worker’s own department.",
        "byline": "The editors"
      },
      "K-G-NAMES": {
        "title": "Distinguished volunteers",
        "body": "Crane operator Theodore Ireland has been singled out among staff assigned to the brigade at the Metallurgical Works. Management thanks him for his readiness to take up duties at a particularly demanding time. The commendation stresses the usefulness of experience gained in everyday work. Operating machinery requires both attention and an understanding of the department’s working rhythm. The conduct of those assigned is presented as an example to other teams across the enterprises.",
        "byline": "The editors"
      },
      "K-F-QUESTION": {
        "title": "WORKERS UNANIMOUSLY SUPPORT THE PARTY?",
        "body": "Meetings at workplaces stressed the need for calm and fulfilment of production plans. Officials say workers’ views demonstrate confidence in the adopted political course and responsibility for the future. The accounts devote much space to the duties of individual teams and the importance of meeting deadlines. Daily effort is described as the clearest expression of commitment to shared goals. The meetings’ conclusions are intended to strengthen co-operation at every level of working life.",
        "byline": "The editors"
      },
      "K-F-ERRATUM": {
        "title": "From the editors",
        "body": "A question mark was mistakenly placed in yesterday’s headline about workers’ support. The editors apologise for this unacceptable proofreading error. The correct headline was a statement. The article discussed views presented at workplace meetings. The error in setting the headline could have given those views a meaning contrary to the publication’s intention. Readers are asked to accept this explanation as a clarification of the material carried in the previous edition.",
        "byline": "The editors"
      },
      "K-F-SECOND": {
        "title": "A letter from the estate",
        "body": "Residents sent the editors a letter about shop supplies. We quote its closing sentence: “Thank you for the shortages.” The authors also listed several matters requiring further improvement. Letters of this kind provide a valuable account of an estate’s daily needs. Alongside general assessments, observations drawn from ordinary shopping deserve attention. The editors stress the value of a practical exchange of views between customers and those responsible for retail supplies.",
        "byline": "The editors"
      },
      "K-F-QUALITY": {
        "title": "New rules for checking copy",
        "body": "The Civic Courier has introduced an additional check of material before printing. Staff and organisational changes will prevent a repeat of the recent headline error and ensure proper publishing standards. Particular attention is being given to headlines, captions and agreement between copy and typeset proofs. Every stage of preparing an issue requires care, even when the printing deadline is close. The editors stress the whole team’s responsibility for the words that reach the reader.",
        "byline": "The editors"
      },
      "K-J-CHIEF": {
        "title": "New chief promises a sporting clean-up",
        "body": "Henry Small takes charge of regional sport. His commission will investigate competition planning at Flame Sports Club and the Municipal Sports Centre. The chief will personally inspect the institutions he previously managed. The announcement calls for better information sharing and a clear allocation of tasks. Familiarity with both institutions is presented as an advantage when assessing their records. The findings are intended to improve future events.",
        "byline": "The editors"
      },
      "K-J-DIRECTOR": {
        "title": "Works director replaced",
        "body": "The director of the works attached to Flame Sports Club has been dismissed after an inquiry into sporting events. Henry Small chaired the commission. The outgoing director had recommended him for wider responsibilities. The account of the inquiry stresses management’s responsibility for supervising preparations. Much space is given to the need for information to circulate more efficiently. The change is presented as a step towards improving co-operation between the works and event organisers.",
        "byline": "The editors"
      },
      "K-D-PENDING": {
        "title": "Preparations at the plant continue",
        "body": "The Municipal Heat and Power Plant is still assembling the staff needed to restart the installation. Talks with the workforce have yet to produce an agreement. No new restart date has been announced. Drawing up a roster requires attention to individual qualifications and continuity between shifts. The statement stresses that an expression of readiness does not settle every organisational matter. The authorities emphasise the importance they attach to the needs of heating customers.",
        "byline": "The editors"
      },
      "K-E-PENDING": {
        "title": "Return after formalities",
        "body": "Headquarters says Sergeant Mark Blackwell’s return date will be announced once the required formalities are complete. The earlier announcement described a planned return. The press statement stresses the importance of documents passing correctly between institutions. The officer’s readiness and the date of his next patrol are described as separate organisational matters. Headquarters again recalls the experience the sergeant acquired during his earlier service.",
        "byline": "The editors"
      },
      "W-C-EARLY": {
        "title": "We have our own voice",
        "body": "We present the first issue of Voice of Mutuality. Regular printing is possible thanks to people who found time and space after their ordinary shift had ended. The next issue will appear in a week. Alongside reports from the works, there will be room for mutual aid and ordinary news from readers. Not every such matter earns a headline in the daily press. We want the paper passed from hand to hand to record something of our lives after we leave the factory gates.",
        "byline": "Editorial collective"
      },
      "W-C-LATE": {
        "title": "Our first issue",
        "body": "After difficulties arranging the printing, Voice of Mutuality has arrived. A replacement has been found and typesetting is under way. The paper will appear weekly for as long as conditions permit. Collecting reports is only a beginning when copy must still be prepared and brought to the press. This issue is the result of that shared effort. Alongside workplace matters, we intend to carry news of mutual aid, since readers also need information useful in everyday life.",
        "byline": "Editorial collective"
      },
      "W-A-STOP": {
        "title": "Not every union cell was broken",
        "body": "A planned new employee did not join one of the works. Activists comparing events in other enterprises believe this matters for the safety of their cell. We are withholding names. Dates alone do not explain everything, but they should not be overlooked when reading successive official reports. In a workplace record, a new appointment occupies a single entry. For people trying to keep in touch with one another, the significance of that entry may be much greater.",
        "byline": "Editorial collective"
      },
      "W-B-FIT": {
        "title": "Dismissed, but not excluded",
        "body": "Stephen Welsby, dismissed after the Gauge Works strike, has found new employment. He remains in touch with his former colleagues. Aid organisers stress that losing one job should not mean losing every chance of another. A new job makes it possible to plan ordinary expenses without continually asking for emergency help. It does not erase the reasons for the earlier dismissal. The union reminds readers that solidarity is still needed after a person’s name stops appearing in official statements.",
        "byline": "Editorial collective"
      },
      "W-B-REFUSED": {
        "title": "Help for dismissed workers",
        "body": "Stephen Welsby remains unemployed. After his dismissal from Gauge Works, he did not receive the certificate required for a new job. The union is organising help for him and other families left without an income. In a household budget, a prolonged search for work soon becomes a question of rent, fuel and shopping. Emergency assistance can help a family through the next few days, but it cannot replace a regular wage. These ordinary needs are easily forgotten when reading official explanations.",
        "byline": "Editorial collective"
      },
      "W-D-HEAT": {
        "title": "Replacement instead of talks",
        "body": "The heat and power plant has restarted with replacement staff and retired specialists. Heating is returning, but the strikers’ demands remain unanswered. The authorities present the restart as the end of the matter. Residents need warm radiators, and the workforce needs an answer to its demands. One need does not remove the other. Official statements can easily join the restart of machinery to the resolution of a dispute; finding the space they leave for discussion is considerably harder.",
        "byline": "Editorial collective"
      },
      "W-D-STRIKE": {
        "title": "The strike continues",
        "body": "Replacement staff could not restart the heat and power plant. The strikers maintain pressure for talks. Falling temperatures in homes are a reminder that residents also pay the price of a prolonged dispute. A dispute does not stop at the factory gate when people must sit at home in their coats. That does not mean another appeal can replace talks with the workforce. The longer the wait continues, the less useful assurances become that the situation remains under proper control.",
        "byline": "Editorial collective"
      },
      "W-E-PREDICTED": {
        "title": "Results known before examination",
        "body": "The Courier announced Sergeant Mark Blackwell’s return before the doctor issued a certificate. The examination did not confirm the newspaper’s prediction. Apparently the authorities know test results before testing the patient. In the ordinary course of events, an appointment comes first and a return to work can be discussed afterwards. The newspaper found that sequence less binding. Readers are left to compare the dates and consider who needed the earlier assurance to appear before the examination.",
        "byline": "Editorial collective"
      },
      "W-F-QUESTION": {
        "title": "The one correct question",
        "body": "“WORKERS UNANIMOUSLY SUPPORT THE PARTY?” asked the Civic Courier. The editors have already apologised for asking. It remains to be established whether the same ban applies to answers. One small mark made a familiar headline require a moment’s thought. The words and solemn tone were unchanged, yet readers unexpectedly had room for an opinion of their own. The correction carefully closed that space, though doubts may not be put aside quite as promptly as a newspaper.",
        "byline": "Editorial collective"
      },
      "W-F-STAYS": {
        "title": "We read carefully",
        "body": "In another issue of the Courier, residents thank the authorities for shortages. Perhaps “ending” was left out again. We leave readers to judge whether the shorter version is any less true. Letters about shopping usually end with assurances that the observations will help bring improvements. This time the customers’ daily experience fits into a much shorter sentence. For someone returning with an empty bag, the difference between intention and printed wording may be difficult to notice.",
        "byline": "Editorial collective"
      },
      "W-F-FIRED": {
        "title": "Dismissed for a question mark",
        "body": "After the notorious headline error, Sophia Wicks was removed from proofreading. Officially, it concerns her eyesight. Her name has vanished from the staff list after more than twenty years correcting other people’s words. A proofreader’s work is least visible when it has been done well. Readers do not count the misprints removed or the commas restored before a paper reaches them. Here, attention has settled on one mark, while years of work have been reduced to a brief explanation from the personnel office.",
        "byline": "Editorial collective"
      },
      "W-G-REFUSED": {
        "title": "The volunteer who stayed",
        "body": "Not every worker assigned to a replacement brigade reached the Metallurgical Works. One operator did not obtain a certificate. His travel order called refusal a breach of discipline, despite the stamp declaring a voluntary application. On paper, the arrangement looks like willing co-operation between enterprises. Only reading the two documents together shows how much room was left for the worker’s own decision. Small print beneath a ceremonial heading deserves attention when it sets out the duties of a supposed volunteer.",
        "byline": "Editorial collective"
      },
      "W-G-SENT": {
        "title": "Volunteering by order",
        "body": "Workers sent to the Metallurgical Works receive “voluntary” application cards. These come with orders specifying consequences for refusal. Operator Theodore Ireland is among those assigned. In the public account, the journey demonstrates a willingness to help. In the workplace order, it becomes a duty for which the employee must answer. Both documents concern the same journey and the same person, but only one lends itself to quotation during ceremonial expressions of thanks.",
        "byline": "Editorial collective"
      },
      "W-H-STAYS": {
        "title": "An added duty was not enough",
        "body": "Edward King of the Machine Works has kept his job despite an attempt to use a changed referral against him. Forklift operation remains formally part of his duties. The union says further intervention is needed. Keeping someone on the payroll does not remove the difference between the old job and the present one. The referral still describes wider duties than the earlier certificate. The duties need to be settled, beyond an assurance that the matter can be filed away now the examination is over.",
        "byline": "Editorial collective"
      },
      "W-H-FIRED": {
        "title": "Safety as a tool for dismissal",
        "body": "Storekeeper Edward King was removed after an examination for a job expanded to include forklift operation. For years he received and issued goods. The added duty allowed management to use his symptoms against him. Comparing the papers means looking beyond the job title to the tasks described. The same word, “storekeeper”, can conceal different requirements. The old certificate did not cover a forklift, and adding one to the duties has plainly done nothing to improve the worker’s health.",
        "byline": "Editorial collective"
      },
      "W-BG-HELP": {
        "title": "Help with applications",
        "body": "The Alder Street clubroom offers help preparing applications and appeals on Tuesday afternoons. Please bring copies of documents relevant to your case. Before writing, it helps to arrange papers by date and mark those still awaiting a reply. This makes it easier to separate an account of events from the request itself. A legible copy is useful weeks later, when the exact wording of an application must be recalled and the original is elsewhere.",
        "byline": "Editorial collective"
      },
      "W-BG-BOOKS": {
        "title": "Union lending library",
        "body": "Vocational textbooks and dictionaries have arrived at the Alder Street clubroom library. Borrowers sign their names in the notebook. Please leave returned books with the duty volunteer. Many such volumes spend years on a shelf at home when someone else could use them to learn a trade. Anyone donating a book should check that all its pages are present. A dictionary with a loose cover can still be useful, provided the reader can find the entry they need inside it.",
        "byline": "Editorial collective"
      },
      "W-BG-CLOTHES": {
        "title": "Warm clothing collection",
        "body": "The Alder Street clubroom is collecting warm clothes for families that have lost their income. Clean, usable clothing is welcome. Children’s coats and winter shoes are most needed. Before bringing items, please check fastenings and pair shoes together. A note of the size makes it easier to match clothing to the right person. A small repair done at home saves work at the collection point and means an item can reach a family ready to be worn without further attention.",
        "byline": "Editorial collective"
      }
    },
    "actors": {
      "agent": "Raymond Crowe",
      "strike-leader": "Stephen Welsby",
      "printer": "George Birkett",
      "dispatcher": "Anthony Fisher",
      "sergeant": "Mark Blackwell",
      "proofreader": "Sophia Wicks",
      "volunteer": "Theodore Ireland",
      "storekeeper": "Edward King",
      "alias": "John Finch",
      "alias-real": "Andrew Fox",
      "malec": "Henry Small"
    },
    "issuers": {
      "chamber": "Medical Chamber",
      "union": "Mutuality",
      "militant": "Fighting Mutuality",
      "clinic": "Clinic management",
      "security": "Office of Inquiries",
      "employer": "Personnel department",
      "printing": "State Printing House",
      "editorial": "Civic Courier editorial office",
      "militia": "Provincial Militia Headquarters",
      "committee": "Provincial Committee",
      "personal": "Private correspondence",
      "clinical": "Specialist examination unit",
      "party": "Works Party Committee"
    },
    "signatures": {
      "chamber": "Chamber secretary",
      "union": "Works committee",
      "militant": "Fighting Mutuality",
      "clinic": "Clinic director",
      "security": "Officer conducting the inquiry",
      "employer": "Head of personnel",
      "printing": "Workplace safety inspector",
      "editorial": "Editor in chief",
      "militia": "For the commanding officer",
      "committee": "Committee secretary",
      "personal": "A.F.",
      "clinical": "Examining specialist",
      "party": "Works committee secretary"
    },
    "ui": {
      "continueWork": "NEXT SHIFT",
      "backToMenu": "MENU",
      "readEndingDocument": "READ DOCUMENT",
      "backToEnding": "BACK",
      "previousPage": "Previous page",
      "nextPage": "Next page",
      "call": "Call about this document",
      "document": "Story document",
      "unionTitle": "Voice of Mutuality",
      "unionStrapline": "Trade union weekly",
      "readDocument": "Read document",
      "received": "Correspondence delivered.",
      "subject": "Concerning",
      "issued": "Issued",
      "reference": "Reference",
      "telephone": "Telephone",
      "room": "Consulting room 04",
      "doctorSignature": "Signature of the doctor in room 04",
      "decisionFit": "FIT",
      "decisionUnfit": "REFUSAL",
      "dateOfBirth": "Date of birth",
      "voluntary": "VOLUNTARY APPLICATION",
      "historical": "HISTORICAL COPY",
      "returnToEnding": "Return to the epilogue",
      "chapterComplete": "CHAPTER COMPLETE",
      "endingDescription": "The end of the first chapter.",
      "job": "Position",
      "sourceDecision": "Certificate",
      "page": "Page",
      "additionalDocuments": "Patient’s additional documents",
      "takeDocument": "Take document",
      "readOnly": "Read-only document",
      "unjustified_refusal": "Refusal without contraindications",
      "contraindication_ignored": "Approval despite contraindication",
      "identity_falsification": "Certificate under false identity",
      "inconsistency": "Changed decision with unchanged findings",
      "certificateNumber": "Membership card number",
      "control": "follow-up"
    },
    "documents": {
      "A-FAKE": {
        "title": "Chamber confirmation / copy",
        "body": "The Medical Chamber confirms that positive fitness certificates may be issued to Raymond Crowe for all referring workplaces. Deviations in blood pressure do not constitute grounds for refusal. This letter remains valid indefinitely."
      },
      "A-WARNING": {
        "title": "Final warning",
        "body": "Raymond Crowe is not looking for work. After his visits, our people disappear. We have copies of the certificates you issued. Clear him for another workplace and we will publish them with your signature and consulting-room number. This is the final warning. Fighting Mutuality."
      },
      "A-EXPOSURE": {
        "title": "The signature from room 04",
        "body": "We publish copies of positive certificates issued despite contraindications and our warning. Their dates and signature identify the same consulting room."
      },
      "A-CLOSURE": {
        "title": "Removal from certification duties",
        "body": "Following disclosure of certificate copies and the records showing the grounds on which they were issued, the doctor is removed from certification duties in room 04. Another doctor will take over."
      },
      "B-CHAMBER": {
        "title": "Interpretation of requirements",
        "body": "No separate schedule of threshold values has been introduced for the stated position. The doctor assesses fitness individually, considering examination results, medical history and work at heights. This information does not waive other certification duties."
      },
      "B-LEAFLET": {
        "title": "Help for those dismissed from Gauge Works",
        "body": "Stephen Welsby and other workers dismissed from Gauge Instrument Works need work and help for their families. Losing employment must not mean exclusion from the community. Leave messages at the Alder Street clubroom."
      },
      "C-BHP": {
        "title": "Noise exposure report",
        "body": "Position: offset press operator, night shift. Constant machinery noise is present in the hall. Audiometry and a follow-up after the first ten working days are recommended. The examination report is enclosed with the candidate’s records."
      },
      "C-AUDIO": {
        "title": "Audiometry",
        "body": "Mild hearing loss. Borderline result, for individual assessment by the occupational health doctor. Conditions: offset press operation, noise, night shift."
      },
      "C-AUDIO-CONTROL": {
        "title": "Follow-up audiometry",
        "body": "Findings and assessment are identical to the initial examination. Mild hearing loss, with no deterioration. Borderline result, for the doctor’s individual assessment. The position and working conditions are unchanged."
      },
      "C-PRINT-NOTE": {
        "title": "Our first issue",
        "body": "Thank you. We have managed to begin typesetting and printing after the ordinary shift. This note accompanies the first issue of Voice of Mutuality."
      },
      "C-PAUSE": {
        "title": "Printing interruption",
        "body": "Today’s issue will not appear. Following the operator’s removal, we have nobody to run the press. The next issue is planned for the usual date in a week."
      },
      "D-PARTY": {
        "title": "Urgent restart of the installation",
        "body": "With continuous heating at risk, we request an urgent examination of Anthony Fisher. His experience is essential to a safe restart of the installation. Please consider the particular importance of this matter to residents."
      },
      "E-EYE": {
        "title": "Ophthalmology report",
        "body": "Left eye: -6.00 dpt. Right eye: -1.00 dpt. Visual difficulties persist following the injury. Borderline assessment; fitness for patrol duty is for the occupational health doctor to decide after a complete examination."
      },
      "E-COMMAND": {
        "title": "Return to duty",
        "body": "Please urgently issue a positive certificate allowing Sergeant Mark Blackwell to return to patrol duty. His return is important to the unit’s staffing and has already been included in its duty roster."
      },
      "F-EYE": {
        "title": "Ophthalmology report",
        "body": "Left eye: -6.00 dpt. Right eye: -2.00 dpt. Near vision is deteriorating despite glasses. Difficulty with small print. Borderline finding for individual assessment in relation to proofreading work."
      },
      "F-EDITOR": {
        "title": "Internal memorandum",
        "body": "Please assess the employee’s ability to check small print with particular care. In the last issue, a gross failure of duty distorted the meaning of material on the front page."
      },
      "G-DELEGATION": {
        "title": "Assignment card",
        "body": "Theodore Ireland. Position: crane operator. Receiving enterprise: Metallurgical Works. Assignment: replacement brigade. VOLUNTARY APPLICATION."
      },
      "G-ORDER": {
        "title": "Copy of duty order",
        "body": "The employee is assigned to the replacement brigade at the Metallurgical Works. Refusal of the assignment will be treated as a breach of workplace discipline.\n\nDoctor, I do not want to replace the strikers. I cannot refuse on my own. Please do not clear me for work."
      },
      "G-COMPLAINT": {
        "title": "Grounds for refusal",
        "body": "Please state the grounds for refusing Theodore Ireland a fitness certificate. The examination results submitted show no contraindications to work in the position he has been performing."
      },
      "H-OLD-CERT": {
        "title": "Previous year’s certificate",
        "body": "Edward King. Issued: 19/11/1982. Position: storekeeper - receiving and issuing goods. FIT. This scope does not include forklift operation."
      },
      "H-LEAFLET": {
        "title": "Safety in the service of the Party",
        "body": "At the Machine Works, forklift operation is being added to storekeepers’ duties, although a dedicated team still does that work. Employees are then sent for examinations. A negative certificate becomes a means of removing people inconvenient to management."
      },
      "H-OUTCOME-FIT": {
        "title": "Current scope of duties",
        "body": "We confirm that Edward King remains employed as a storekeeper under the scope stated in the current referral, including forklift operation."
      },
      "H-OUTCOME-REFUSED": {
        "title": "Personnel decision",
        "body": "Following the refusal of a fitness certificate, Edward King has been removed from his duties. Steps towards terminating his employment have begun."
      },
      "I-EYE": {
        "title": "Vision examination report",
        "body": "Andrew Fox. Left eye: -1.00 dpt. Right eye: -1.00 dpt. Normal finding. The examined person’s details correspond to the name on this report."
      },
      "I-HEARING": {
        "title": "Hearing examination report",
        "body": "Andrew Fox. No hearing concerns. Normal examination finding. A copy has been issued to the person examined."
      },
      "I-NOTE": {
        "title": "An explanation",
        "body": "Fox is my real name. After the arrests at the Machine Works, I lost my job. Since then, everyone has turned me away. A friend arranged the referral under Finch. Please issue the certificate as the referral says. This is my first chance in weeks."
      },
      "I-THANKS": {
        "title": "Thank you",
        "body": "They took me on. I am listed as Finch. For the first time in weeks, I have somewhere to go in the morning. Thank you. A.F."
      },
      "J-PARTY-CARD": {
        "title": "Party membership card",
        "body": "Henry Small. Number 04-5182. Member of the works Party organisation."
      },
      "J-OPINION-1": {
        "title": "Employee reference",
        "body": "Outstanding organisational abilities. Fully deserves to be entrusted with duties carrying wider responsibility.\n\nPrevious workplace: Flame Works Sports Club."
      },
      "J-OPINION-2": {
        "title": "Sports Centre management reference",
        "body": "Exceptional initiative, decisiveness and an ability to take bold decisions. His present position does not allow his potential to be fully realised."
      },
      "J-RESULTS": {
        "title": "Examination results",
        "body": "Blood pressure: 145/90 mmHg. Vision: -1.00 / -1.00 dpt. General examination: no concerns. No contraindications. Both managerial positions have an equivalent requirement profile."
      },
      "J-COMPLAINT-1": {
        "title": "Grounds for refusal",
        "body": "Please state the grounds for refusing Henry Small clearance. The results submitted show no contraindications to his appointment as director."
      },
      "J-COMPLAINT-2": {
        "title": "Explanation of changed certification",
        "body": "We request an explanation of the refusal concerning Henry Small. His recent positive certificate was issued for comparable duties with the same examination results."
      },
      "SYS-SECURITY": {
        "title": "Preservation of records",
        "body": "Following a series of decisions concerning workers subject to proceedings, please retain complete records. The correctness of identification and the grounds for certificates will be examined."
      },
      "SYS-AUDIT": {
        "title": "Discrepancies in records",
        "body": "Discrepancies requiring explanation have been found in the records. Further certificates without proper grounds may result in withdrawal of authorisation to work in this consulting room."
      },
      "SYS-CONSISTENCY": {
        "title": "Changed decision",
        "body": "Please explain the changed certificate despite unchanged findings and comparable requirements. Further such discrepancies will call into question your continued responsibility for the consulting room."
      },
      "END-AUDIT": {
        "title": "Withdrawal of authorisation",
        "body": "Following review of the certificates listed below, authorisation to issue certificates in this clinic is withdrawn. Room 04 is assigned to another doctor. This decision concerns responsibility for this consulting room."
      },
      "END-SECURITY": {
        "title": "Summons for inquiry",
        "body": "The doctor in room 04 is summoned to provide explanations concerning the listed cases. The records of these certificates have been secured. Further proceedings will take place outside the clinic."
      },
      "END-PARTY": {
        "title": "The Committee’s thanks",
        "body": "Thank you for your responsible conduct in matters important to the proper functioning of the city. We look forward to further constructive cooperation."
      },
      "END-UNION": {
        "title": "A short note",
        "body": "Not everyone could be cleared. But we know when a decision followed an examination and when somebody tried to use the consulting room against people. Thank you for ensuring that an order from above could not settle everything."
      },
      "END-ROTA": {
        "title": "Assignment of further shifts",
        "body": "Room 04 retains its current doctor. The next shift begins on the next working day. Admission hours and record-keeping duties remain unchanged."
      },
      "REF": {
        "title": "Occupational health referral",
        "body": "The employee is referred for an occupational health examination for the position and conditions specified in the referral."
      },
      "C-AD": {
        "title": "Night-shift press operator",
        "body": "State Printing House seeks an offset press operator for the night shift. Experience and a current medical certificate required. Enquiries at the gatehouse, tel. 46-0101."
      }
    },
    "classifieds": {
      "C-AD": "State Printing House seeks a night-shift offset press operator. Experience and a current medical certificate required. Enquiries at the gatehouse."
    },
    "phones": {
      "print-open": "Printworks gatehouse. We need an operator for the night shift. The candidate has been given a referral.",
      "print-closed": "Staffing has been referred to the manager. The advertisement is no longer current.",
      "chamber-genuine": "Doctor, the letter is ours. The decision belongs to the examining doctor, taking the working conditions into account.",
      "chamber-forged": "Doctor, we issue no such exemptions. That letter number is not in our register.",
      "power": "Restarting requires a dispatcher who knows this installation. Fisher is one of the few available specialists.",
      "warehouse": "The position in the current referral applies, including forklift operation. We have no other form for you.",
      "mos": "The reference is current. Management believes that Mr Small should take up a position matching his abilities as soon as possible."
    },
    "phoneNotes": {
      "print-open": "Printworks seeks a night-shift operator.",
      "print-closed": "Printworks advertisement is no longer current.",
      "chamber-genuine": "Chamber confirms its letter; doctor decides.",
      "chamber-forged": "Chamber denies issuing the exemption.",
      "power": "Dispatcher knows the plant; few replacements.",
      "warehouse": "Personnel confirms forklift duties apply.",
      "mos": "Sports Centre confirms the reference."
    },
    "speech": {
      "A1": "First day at a new works. I just need the certificate.",
      "A2": "New workplace. I need a certificate.",
      "A3": "Changing jobs again.",
      "A4": "The Chamber has settled it. It is all in writing.",
      "A5": "Another copy from the Chamber.",
      "A6": "The works is waiting. Please do not hold up the papers.",
      "A7": "The papers are here. The works is waiting.",
      "B1": "I cannot get the old job back. I would like a chance at this one.",
      "C1": "The presses work for editors by day. There is night work too.",
      "C2": "The trial-period check. The results are the same as before.",
      "D1": "I have always known the plant. My health is not what it was.",
      "E1-VISIT": "The paper has announced it. I have only come for the papers.",
      "F1": "Twenty-three years correcting others’ words. Now they test my eyes.",
      "G1": "They wrote voluntary on the card.",
      "H1": "Twenty years issuing parts. Others drive the forklifts.",
      "I1": "The names are a problem. I explained it on the note.",
      "J1": "I have done everything at the club. Time for greater tasks.",
      "J2": "The province needs me now. My results speak for themselves.",
      "thanks": "Thank you, doctor."
    },
    "endings": {
      "exposed": {
        "title": "A compromised stamp",
        "body": "Copies of your certificates circulate through the works. Your signature and room number were enough to identify their author. Those who asked for favours no longer answer the telephone. From tomorrow, room 04 belongs to another doctor.",
        "description": "A duplicated sheet and a discarded stamp lie on the desk. An administrator waits in the doorway."
      },
      "clinic-closed": {
        "title": "Consulting room closed",
        "body": "The files contained more than one certificate without grounds. The commission needed no guesses. Results, referrals and your signature were enough. Your authorisation to run this consulting room has been withdrawn.",
        "description": "The door of room 04 is closed. The admission sign has been removed. A file and letter lie on a small table.",
        "bodyInconsistency": "The same grounds produced different decisions. After the first letter came further examples. Nobody is willing to answer for your certificates any longer. Another doctor will receive the consulting room."
      },
      "detained": {
        "title": "For questioning",
        "body": "First they asked for explanations. Now they are securing the records. To those handling the case, your signatures tell a simple story: the consulting room helped people denied other routes. You will not return to work today.",
        "description": "An empty consulting room with open drawers. Two figures in civilian coats collect a file of records."
      },
      "party-continue": {
        "title": "Under the Committee’s care",
        "body": "The Committee speaks well of you. Several of your decisions helped restore order, fill posts and close inconvenient matters. The consulting room remains in your care. The next referrals have already been prepared.",
        "description": "A desk at dawn. An official letter bears the Committee seal; a stamp is neatly placed beside it. A figure waits behind."
      },
      "union-continue": {
        "title": "Our doctor",
        "body": "People at the works know that not every request from above becomes an order in room 04. A short note of thanks arrives. No promise of safety, no grand words. Tomorrow there will be patients again.",
        "description": "A discreet note has been slipped under the door. An ordinary queue of workers waits in muted light."
      },
      "independent-continue": {
        "title": "An ordinary shift tomorrow",
        "body": "There is no decoration or letter promising protection. Room 04 still appears on the new rota. The same admission hours, the same forms and another queue of people whose lives do not fit inside the boxes.",
        "description": "An empty consulting room before work. A fresh newspaper, closed drawers and a telephone."
      }
    }
  }
} as const;

export const translations = {
  pl: {
    story: storyCopy.pl,
    newspaper: {
      "title": "Kurier Obywatelski",
      "shortTitle": "Kurier",
      "classifiedTitle": "Ogłoszenia drobne",
      "telephone": "Tel.",
      "callClassified": "Zadzwoń w sprawie ogłoszenia",
      "classifieds": {
        "sewing-machine": "Sprzedam maszynę do szycia. Napęd nożny, szafka w komplecie.",
        "sideboard": "Kredens kuchenny sprzedam. Odbiór własny z trzeciego piętra.",
        "pram": "Wózek głęboki po jednym dziecku sprzedam. Koła niedawno wymienione.",
        "radio-repair": "Naprawa odbiorników radiowych. Lampy proszę przynieść własne.",
        "piano-lessons": "Lekcje gry na pianinie. Początkujący mile widziani.",
        "garage": "Garaż na Ogrodowej zamienię na bliższy pętli Północ. Suchy, bez prądu.",
        "typewriter": "Kupię maszynę do pisania. Brak taśmy nie stanowi przeszkody.",
        "bicycle-parts": "Części do roweru sprzedam. Siodełko, bagażnik, dwa dzwonki.",
        "books": "Powieści przygodowe zamienię na atlas grzybów. Oferty: redakcja, skrytka 18.",
        "jars": "Oddam słoiki po ogórkach. Bez pokrywek. Wiadomość u dozorcy, Ogrodowa 7.",
        "lost-keys": "Znaleziono klucze z blaszką. Do odbioru u portiera kina Świt.",
        "allotment": "Sadzonki porzeczek zamienię na agrest. Wiadomość: ogród Zacisze, Ogrodowa 42, gospodarz.",
        "knitting-help": "Swetry na drutach wykonam. Wełna powierzona. Pytać w pasmanterii na Ogrodowej.",
        "room": "Spokojny lokator szuka pokoju na Północy. Wiadomość: dom kultury na Szkolnej, portier.",
        "records": "Płyty taneczne zamienię na jazz. Wiadomość w klubie muzycznym przy Szkolnej.",
        "clock-repair": "Zegary naprawiam. Przynosić z kluczem. Stolarska 4, wejście od podwórza.",
        "coal-scuttle": "Węglarkę blaszaną oddam. Uchwyt cały. Pytać u dozorcy przy Stolarskiej 8.",
        "curtain-rods": "Dwa karnisze drewniane sprzedam. Wiadomość w pasmanterii na Ogrodowej.",
        "children-skates": "Łyżwy dziecięce zamienię na większe. Wiadomość: dom kultury na Szkolnej, portier.",
        "violin-case": "Futerał do skrzypiec sprzedam. Wiadomość u portiera szkoły muzycznej na Ogrodowej.",
        "sofa-bed": "Tapczan jednoosobowy sprzedam. Skrzynia na pościel. Transport we własnym zakresie.",
        "jam-pots": "Słoiczki po dżemie oddam. Odbiór w świetlicy Północ, Lipowa 6, u gospodyni.",
        "music-stand": "Pulpit do nut kupię, może być składany. Wiadomość: szkoła muzyczna, Ogrodowa, portier.",
        "wool-remnants": "Resztki wełny zamienię na guziki płaszczowe. Pytać w pasmanterii na Ogrodowej.",
        "pram-wheels": "Koła do wózka dziecięcego oddam. Dwa różne rozmiary. Dozorca, Kolejowa 14.",
        "piano-tuning": "Pianina stroję. Dojazd po uzgodnieniu. Proszę podać piętro i stan instrumentu.",
        "chess-set": "Szachy drewniane sprzedam, brak pionka. Wiadomość w klubie szachowym na Szkolnej.",
        "travel-trunk": "Kufer podróżny sprzedam. Zamykany na klucz. Wiadomość u szewca, Kolejowa 22.",
        "plant-pots": "Doniczki gliniane oddam za sadzonkę zielistki. Wiadomość w kwiaciarni na Północy.",
        "school-atlas": "Atlas szkolny kupię, starsze wydanie też. Oferty: redakcja, skrytka 22.",
        "handcart": "Wózek ręczny na dwóch kołach sprzedam. Dobry do przewozu skrzynek.",
        "spare-buttons": "Guziki mundurowe zamienię na rogowe. Wiadomość w punkcie krawieckim na Ogrodowej.",
        "found-mittens": "Rękawiczki dziecięce znaleziono w tramwaju nr 4. Odbiór u portiera kina Świt.",
        "bookends": "Podpórki do książek kupię. Ciężkie, para. Pytać w czytelni przy Kolejowej.",
        "coat-alteration": "Płaszcze skracam, podszewki wymieniam. Zakład krawiecki, Ogrodowa 6, oficyna.",
        "mandolin": "Mandolinę sprzedam. Futerał w komplecie, jedna struna do wymiany.",
        "photo-albums": "Albumy na zdjęcia zamienię na ramki. Wiadomość u fotografa przy Ogrodowej.",
        "folding-stool": "Taboret składany kupię. Do rysowania w plenerze. Pracownia plastyczna, Szkolna.",
        "wood-offcuts": "Ścinki drewna dla modelarzy oddam. Odbiór w warsztacie przy Stolarskiej 5.",
        "travel-chess": "Szachy kieszonkowe znaleziono na dworcu przy Kolejowej. Odbiór w przechowalni bagażu.",
        "electric-iron": "Sprawne żelazko z regulacją temperatury kupię. Dzwonić po osiemnastej.",
        "baking-tins": "Dwie keksówki zamienię na tortownicę. Wiadomość w barze mlecznym przy dworcu, Kolejowa.",
        "sewing-patterns": "Wykroje sukienek pożyczę do przerysowania. Klub robótek na Szkolnej, po zajęciach.",
        "record-sleeves": "Koperty do płyt oddam, bez płyt. Odbiór u portiera domu kultury na Szkolnej.",
        "allotment-bench": "Ławkę na działkę kupię. Wiadomość u gospodarza ogrodu Zacisze, Ogrodowa 42.",
        "accordion-sale": "Akordeon z pasami i futerałem sprzedam. Do obejrzenia po pracy.",
        "curtain-sewing": "Firanki obszywam. Proszę przynieść dokładne wymiary. Kolejowa 11, od podwórza.",
        "bicycle-basket": "Koszyk rowerowy sprzedam. Wiadomość w warsztacie rowerowym, Kolejowa 20.",
        "reading-lamp": "Lampkę do czytania kupię. Z ciężką podstawą. Pytać w czytelni na Kolejowej.",
        "schoolbag-sale": "Tornister skórzany po uczniu oddam. Klamry całe. Woźny szkoły nr 12 przyjmie wiadomość.",
        "wardrobe-mirror": "Szafę z lustrem sprzedam. Rozkładana do przewozu. Brak jednej gałki.",
        "knitting-needles": "Druty do robótek zamienię na szydełka. Wiadomość w klubie robótek na Szkolnej.",
        "old-magazines": "Roczniki pism technicznych oddam. Odbiór w pracowni technicznej na Szkolnej.",
        "garden-rake": "Grabie zamienię na małą łopatę. Wiadomość u gospodarza Zacisza, Ogrodowa 42.",
        "found-scarf": "Szalik w kratę został po próbie chóru. Odbiór u portiera domu kultury na Szkolnej.",
        "reel-recorder": "Magnetofon szpulowy sprzedam. Pokrywa i mikrofon w komplecie, taśm brak.",
        "copper-kettle": "Czajnik z gwizdkiem zamienię na duży garnek. Wiadomość u dozorcy, Ogrodowa 9.",
        "embroidered-cloth": "Obrus haftowany sprzedam. Owalny. Pytać w punkcie krawieckim przy Ogrodowej.",
        "baby-clothes": "Ubranka niemowlęce oddam, wyprane. Wiadomość w świetlicy Północ, Lipowa 6.",
        "photo-enlarger": "Powiększalnik kupię. Wiadomość w pracowni fotograficznej domu kultury na Szkolnej.",
        "furniture-moving": "Pomogę przy znoszeniu mebli. Bez samochodu. Terminy po uzgodnieniu.",
        "wooden-sled": "Sanki drewniane zamienię na większe. Wiadomość u dozorcy przy Kolejowej 7.",
        "cookbooks": "Książkę kucharską zamienię na poradnik szycia. Pytać w bibliotece przy Kolejowej.",
        "plant-stand": "Kwietnik metalowy sprzedam. Na trzy doniczki. Wiadomość w kwiaciarni na Północy.",
        "chess-opponent": "Partnera do szachów szukam, gram wolno. Wiadomość w klubie szachowym na Szkolnej.",
        "violin-lessons": "Lekcji skrzypiec udzielę. Własny instrument konieczny. Początkujący również.",
        "suitcase-straps": "Pasy do walizek dorabiam. Okucia własne lub powierzone. Kaletnik, Kolejowa 26.",
        "radio-cabinet": "Obudowę starego radia oddam modelarzowi. Pytać w pracowni technicznej na Szkolnej.",
        "children-books": "Bajki zamienię na książki dla starszych dzieci. Wiadomość: biblioteka nr 6, Kolejowa.",
        "wall-map": "Mapę ścienną kupię. Niewielkie rozdarcia nie przeszkadzają. Redakcja, skrytka 39.",
        "clock-sale": "Zegar ścienny z wahadłem sprzedam. Klucz w komplecie. Odbiór osobisty.",
        "wooden-hangers": "Wieszaki drewniane oddam. Różne rozmiary. Wiadomość w szatni kina Świt.",
        "garden-chair": "Krzesło wiklinowe sprzedam. Wiadomość u gospodarza Zacisza, Ogrodowa 42.",
        "ink-bottles": "Buteleczki po atramencie oddam. Umyte. Odbiór: dom kultury na Szkolnej, portiernia.",
        "knitting-books": "Wzory na druty pożyczę do przepisania. Wiadomość w pasmanterii na Ogrodowej.",
        "car-seat-covers": "Uniwersalne pokrowce na przednie fotele sprzedam. Wymiary podam przez telefon.",
        "found-notebook": "Nuty znaleziono na przystanku przy Ogrodowej. Odbiór: szkoła muzyczna na Ogrodowej, portier.",
        "chair-caning": "Siedziska krzeseł wyplatam. Przyjmuję po obejrzeniu ramy. Stolarska 3, warsztat.",
        "postcard-exchange": "Widokówki miasta zamienię na starsze wydania. Koło zbieraczy, dom kultury na Szkolnej.",
        "coffee-grinder": "Młynek ręczny kupię. Wiadomość w barze mlecznym przy dworcu na Kolejowej.",
        "portable-radio": "Radio przenośne sprzedam. Pokrowiec skórzany, pasek naprawiany.",
        "table-leaf": "Dodatkowy blat do stołu oddam. Wymiary u dozorcy przy Ogrodowej 4.",
        "glass-vases": "Wazony szklane zamienię na gliniane. Wiadomość w kwiaciarni na Północy.",
        "children-costumes": "Stroje do szkolnego teatrzyku pożyczę. Pytać u woźnej szkoły nr 12.",
        "fishing-float": "Spławiki własnej roboty sprzedam. Wiadomość u gospodarza Zacisza, Ogrodowa 42.",
        "sewing-table": "Stolik pod maszynę do szycia sprzedam. Dwie szuflady. Maszyny nie sprzedaję.",
        "coat-lining": "Resztę podszewki płaszczowej oddam. Wiadomość w punkcie krawieckim na Ogrodowej.",
        "record-brush": "Szczoteczkę do płyt kupię. Wiadomość w klubie muzycznym przy Szkolnej.",
        "seed-boxes": "Skrzynki na sadzonki oddam. Odbiór u gospodarza ogrodu Zacisze, Ogrodowa 42.",
        "found-pencilcase": "Piórnik z inicjałami znaleziono pod biblioteką nr 6 na Kolejowej. Odbiór przy ladzie.",
        "armchair-pair": "Dwa fotele sprzedam razem. Obicia różne, konstrukcja jednakowa.",
        "theatre-programmes": "Programy teatralne wymienię. Wiadomość u portiera Teatru Miejskiego.",
        "travelling-chest": "Drewnianą skrzynkę na narzędzia kupię. Wiadomość w stolarni, Stolarska 5.",
        "wicker-basket": "Duży kosz zamienię na mniejszy. Pytać u Kurka, stoisko wikliny na targu przy Kolejowej.",
        "needlework-frame": "Tamborek do haftu oddam. Brak śrubki. Odbiór w klubie robótek na Szkolnej.",
        "room-painting": "Pokoje maluję. Materiały powierzone. Termin po obejrzeniu ścian.",
        "old-spectacle-case": "Puste etui do okularów znaleziono w czytelni przy Kolejowej. Odbiór u bibliotekarki.",
        "book-binding": "Luźne tomy oprawiam. Proszę przynieść wszystkie kartki. Introligator, Stolarska 6.",
        "school-uniform": "Fartuszek szkolny oddam. Kołnierzyk osobno. Wiadomość u woźnej szkoły nr 12.",
        "photo-trays": "Kuwety fotograficzne zamienię na szczypce. Koło fotograficzne przy Szkolnej.",
        "folding-bike": "Rower składany sprzedam. Błotniki kompletne, dzwonek do wymiany.",
        "watercolour-box": "Pudełko akwareli kupię. Może być niepełne. Wiadomość w pracowni plastycznej na Szkolnej.",
        "chess-books": "Podręczniki szachowe sprzedam. Wiadomość w klubie szachowym przy Szkolnej.",
        "curtain-hooks": "Żabki do firanek oddam. Kilka rodzajów. Pytać w pasmanterii na Ogrodowej.",
        "school-compass": "Cyrkiel znaleziono na ławce przy szkole nr 12. Odbiór u woźnego po podaniu opisu.",
        "typing-service": "Teksty przepisuję na maszynie. Czytelne rękopisy. Kopie po uzgodnieniu.",
        "allotment-watercan": "Metalową konewkę sprzedam. Wiadomość u gospodarza Zacisza, Ogrodowa 42.",
        "small-rug": "Wąski chodnik sprzedam. Bez frędzli. Wiadomość u dozorcy, Kolejowa 9.",
        "bottle-crates": "Drewniane skrzynki oddam. Odbiór na zapleczu baru mlecznego przy dworcu na Kolejowej.",
        "language-practice": "Partnera do nauki niemieckiego szukam. Poziom podstawowy. Redakcja, skrytka 51.",
        "car-roof-rack": "Bagażnik dachowy z uchwytami do rynienek sprzedam. Wymiary podam przez telefon.",
        "portrait-drawing": "Portrety ołówkiem wykonam z natury lub zdjęcia. Pracownia plastyczna na Szkolnej.",
        "children-gloves": "Rękawiczki dziecięce oddam. Wiadomość w świetlicy Północ, Lipowa 6.",
        "tapes-for-records": "Kasety czyste zamienię na płyty. Wiadomość w klubie muzycznym na Szkolnej.",
        "wooden-toys": "Zabawki drewniane oddam do świetlicy. Pytać w warsztacie przy Stolarskiej 5.",
        "desk-sale": "Biurko z trzema szufladami sprzedam. Blat porysowany, zamki bez kluczy.",
        "reading-help": "Starszej osobie poczytam książki. Popołudniami. Wiadomość w bibliotece przy Kolejowej.",
        "chess-clock-ad": "Zegar szachowy kupię, sprawny. Wiadomość w klubie szachowym na Szkolnej.",
        "kitchen-stool": "Dwa stołki kuchenne oddam. Jeden wymaga sklejenia. Dozorca, Ogrodowa 12.",
        "found-sheet-music": "Nuty na akordeon zostały w świetlicy Północ, Lipowa 6. Odbiór u gospodyni, podać tytuł.",
        "carpet-weaving": "Chodniki ze skrawków wykonam. Materiał proszę wcześniej pokazać.",
        "model-paint": "Farby modelarskie zamienię na cienkie pędzle. Koło modelarskie na Szkolnej.",
        "old-city-photos": "Stare zdjęcia miasta kupię. Wiadomość w czytelni przy Kolejowej, dla Zofii Rataj.",
        "hat-box": "Pudełko na kapelusz oddam. Okrągłe, z pokrywą. Pytać u modystki na Ogrodowej.",
        "mending-basket": "Wyściełany koszyczek na robótki sprzedam. Wiadomość w pasmanterii na Ogrodowej.",
        "double-bed": "Łóżko podwójne sprzedam bez materaca. Rama drewniana, odbiór własny.",
        "curtain-remnants": "Resztki firanek oddam na szkolne prace. Punkt krawiecki przy Ogrodowej, odbiór na miejscu.",
        "walking-companion": "Towarzystwa do spacerów po parku na Lipowej szukam. Wiadomość w świetlicy, Lipowa 6.",
        "plant-identification": "Nadwyżkę sadzonek zielistki oddam. Wiadomość w kwiaciarni na Północy.",
        "folding-screen": "Parawan kupię do małego pokoju. Oferty u dozorcy przy Kolejowej 11.",
        "camera-sale": "Aparat fotograficzny sprzedam z futerałem. Pasek nowy. Oględziny przy świetle dziennym.",
        "book-jackets": "Obwoluty do książek oddam zbieraczowi. Wiadomość w bibliotece nr 6 na Kolejowej.",
        "found-shopping-bag": "Torba została w barze mlecznym przy dworcu na Kolejowej. Odbiór u kasjerki, podać zawartość.",
        "thread-spools": "Drewniane szpulki oddam do prac ręcznych. Pytać w punkcie krawieckim na Ogrodowej.",
        "picture-glass": "Szybki do ramek kupię. Niewielkie rozmiary. Wiadomość u ramiarza na Stolarskiej.",
        "room-to-let": "Pokój na Północy wynajmę spokojnej osobie. Wejście wspólne, dostęp do kuchni.",
        "poetry-copying": "Dyplomy i zaproszenia wykaligrafuję. Wiadomość w pracowni plastycznej na Szkolnej.",
        "found-brooch": "Broszka została po spotkaniu w bibliotece nr 6 na Kolejowej. Odbiór przy ladzie, podać opis.",
        "school-desk-ad": "Małe biurko zamienię na regał. Wiadomość w świetlicy Północ, Lipowa 6.",
        "empty-tins": "Puszki po herbacie oddam na drobiazgi. Odbiór u portiera domu kultury na Szkolnej.",
        "sheet-music-copy": "Nuty walców i polek pożyczę do przepisania. Wiadomość w sali prób domu kultury na Szkolnej.",
        "picture-hook": "Haczyki do obrazów oddam. Wiadomość w stolarni przy Stolarskiej 5.",
        "borrowed-ladder": "Osobę, która pożyczyła drabinę z Ogrodowej 8, proszę o zwrot. Wiadomość u dozorcy.",
        "wooden-puzzle": "Drewnianą układankę oddam, kompletna. Wiadomość w świetlicy Północ, Lipowa 6.",
        "sewing-foot": "Stopkę do starej maszyny kupię. Wzór pokażę na miejscu. Zakład krawiecki, Ogrodowa.",
        "family-album-help": "Albumy rodzinne uporządkuję i opiszę. Wiadomość w czytelni przy Kolejowej, dla Zofii Rataj.",
        "chess-pieces": "Dwie białe wieże i czarnego konia oddam. Wiadomość w klubie szachowym na Szkolnej.",
        "found-keyring": "Klucze znaleziono na targu przy Kolejowej. Odbiór u gospodarza placu po podaniu opisu.",
        "carpentry-help": "Półki dopasuję do wnęki. Proszę przynieść szkic. Warsztat przy Stolarskiej 5.",
        "potted-geranium": "Pelargonię zamienię na roślinę do cienia. Wiadomość w kwiaciarni na Północy.",
        "choir-singers": "Chór szuka niskich głosów. Nuty pożyczamy. Zgłoszenia w domu kultury na Szkolnej.",
        "wooden-cradle": "Kołyskę drewnianą oddam na dekoracje. Wiadomość u portiera Teatru Miejskiego.",
        "found-beret": "Beret granatowy został w szatni kina Świt. Pod podszewką inicjały. Odbiór na miejscu.",
        "recipe-swap": "Przepisy na proste ciasta wymienię. Wiadomość w świetlicy Północ, Lipowa 6.",
        "old-calendar": "Stare kalendarze ścienne zbieram. Kartki również luzem. Pytać w czytelni na Kolejowej.",
        "portrait-frame": "Ramę owalną kupię do rodzinnego zdjęcia. Wymiary zostawiłem u ramiarza na Stolarskiej.",
        "fabric-samples": "Próbki tkanin oddam na kolaże. Odbiór w punkcie krawieckim przy Ogrodowej.",
        "window-box": "Skrzynkę kwiatową oddam. Wiadomość u gospodarza Zacisza, Ogrodowa 42.",
        "borrowed-book": "Proszę o zwrot atlasu pożyczonego od Zofii Rataj. Można zostawić w bibliotece na Kolejowej.",
        "umbrella-handle": "Drewnianą rączkę do parasola kupię. Wzór u naprawiacza na targu przy Kolejowej.",
        "lesson-notes": "Notatki z kursu kreślarskiego pożyczę. Wiadomość u portiera domu kultury na Szkolnej.",
        "clothes-pegs": "Nieużywane klamerki drewniane oddam. Wiadomość u gospodarza domu, Lipowa 12.",
        "found-wristwatch": "Zegarek znaleziono przy bramie Zacisza, Ogrodowa 42. Odbiór u gospodarza po podaniu opisu.",
        "model-cardboard": "Karton gruby oddam modelarzom. Arkusze nierówne. Odbiór u introligatora na Stolarskiej.",
        "weaving-shuttle": "Czółenko tkackie kupię. Wiadomość w pracowni tkackiej domu kultury na Szkolnej.",
        "walking-maps": "Mapy okolic miasta pożyczę. Wiadomość w kole krajoznawczym przy domu kultury na Szkolnej."
      },
      "strapline": "DZIENNIK MIASTA I REGIONU",
      "issue": "Nr",
      "page": "Strona",
      "open": "Rozłóż gazetę",
      "close": "Złóż i odłóż gazetę na lewą stronę",
      "next": "Następna strona",
      "previous": "Poprzednia strona",
      "closed": "Gazeta złożona na lewym biurku.",
      "emptyRoom": "Jeszcze nikogo nie ma.",
      "contents": "W tym numerze",
      "imprint": "Redakcja Kuriera Obywatelskiego",
      "help": "Po prawej gazeta rozkłada się do czytania. Rogi: strony. Enter: rozłóż lub odłóż na lewo. Spacja: podnieś. Strzałki: przenieś. Enter: odłóż. Escape: anuluj lub odłóż gazetę.",
      "topics": {
        "culture": "Kultura",
        "craft": "Rzemiosło",
        "sport": "Sport",
        "hobby": "Zainteresowania",
        "technology": "Technika",
        "household": "Gospodarność",
        "home": "Dom",
        "kitchen": "Kuchnia",
        "transport": "Podróże",
        "everyday": "Z życia",
        "education": "Szkoła",
        "science": "Nauka",
        "community": "Osiedle"
      },
      "articles": {
        "reading-circle": {
          "title": "Jedna powieść, 43 chętnych",
          "body": "W filii nr 6 biblioteki miejskiej przy ulicy Kolejowej na najpoczytniejszą powieść zapisano 43 osoby. Do dyspozycji jest jeden egzemplarz; drugi wrócił z wypożyczenia bez kilkunastu stron. Bibliotekarka Janina Wolska pokazuje zeszyt rezerwacji. Najdłużej czekają czytelnicy, którzy mogą przyjść dopiero po drugiej zmianie. Filia wymienia książki z placówkami na obrzeżach, lecz tam poszukiwane są te same tytuły. W sprawozdaniu rocznym każdy obrót tego egzemplarza będzie kolejnym wypożyczeniem. Zeszyt pani Wolskiej opisuje drugą stronę tej statystyki.",
          "byline": "Ewa Lis - Dział miejski"
        },
        "choir": {
          "title": "Próba po drugiej zmianie",
          "body": "Chór warsztatów kolejowych przy Kolejowej ćwiczy w sali nad zakładową stołówką. Czterdziestu śpiewaków ma różne rozkłady służby, więc dyrygent nigdy nie słyszy na próbie całego zespołu. Partie basowe powtarza osobno z ludźmi schodzącymi z nocnej zmiany. Nuty przepisuje na kalce pracownica kancelarii; wspólny śpiewnik mieści się w dwóch teczkach. W repertuarze są pieśni ludowe i utwory przedwojenne. Na występy chór jeździ po całym województwie. Jak mówi jego kierownik, trudniej zebrać wszystkich na dworcu niż nauczyć ich nowej pieśni.",
          "byline": "Marek Boruta - Kultura"
        },
        "film-club": {
          "title": "Film poza repertuarem",
          "body": "W klubie filmowym przy kinie Świt rozmowa trwa zwykle dłużej niż seans. Przychodzą studenci, nauczyciele i stali bywalcy, których bileterka zna po nazwisku. Klub sprowadza starsze filmy pomijane w zwykłym repertuarze. Jedna kopia krąży między kilkoma miastami, dlatego program trzeba uzgadniać z dużym wyprzedzeniem. Prowadzący spotkania prosi widzów o pytania na kartkach. Najwięcej dotyczy obyczajów i codziennego życia bohaterów. O warsztacie reżysera, przewidzianym w konspekcie, dyskutuje już znacznie mniej osób.",
          "byline": "Marek Boruta - Kultura"
        },
        "theatre": {
          "title": "Drugie życie kostiumu",
          "body": "W pracowni miejskiego teatru suknie wiszą według epok, a nie według przedstawień. Kostium sprzed dziesięciu sezonów wraca na scenę po zmianie rękawów i kołnierza. Krawcowa Helena Mazur od lat odkłada skrawki tkanin do opisanych pudełek. Z nich dobiera łaty niewidoczne z widowni. Nowego materiału starcza przede wszystkim na stroje pierwszoplanowe; reszta obsady korzysta z magazynu. Przed premierą najwięcej pracy wymagają nie efektowne suknie, lecz zwykłe surduty, które muszą dobrze leżeć na kolejnych aktorach.",
          "byline": "Ewa Lis - Za kulisami"
        },
        "chess": {
          "title": "Kolejarze przy szachownicy",
          "body": "Szachiści kolejarzy pokonali drużynę budowlanych 5:3 w kolejnej rundzie ligi miejskiej. O wyniku przesądziły ostatnie szachownice, przy których grali juniorzy. Kapitan zwycięzców podkreśla pracę sekcji szkoły nr 12: młodzi mają stałe zajęcia, podczas gdy starsi zawodnicy uzgadniają treningi z grafikiem zmian. Mecze odbywają się w świetlicach zakładowych, bez opłat za wstęp. Widzowie mogą śledzić zapis partii na tablicy. Liga nie ma własnej sali, ale dzięki gospodarzom z kilku dzielnic rozgrywki zachowują regularny rytm.",
          "byline": "Jan Rudzki - Sport"
        },
        "table-tennis": {
          "title": "Po lekcjach przy stole",
          "body": "Drużyna spółdzielców wygrała 6:4 z pocztowcami w miejskiej lidze tenisa stołowego. Spotkanie rozegrano w sali szkoły nr 12, udostępnianej klubom po lekcjach. Zawodnicy sami ustawili stoły i ogrodzenia z ławek, a po meczu przygotowali salę na poranną gimnastykę. Trener spółdzielców chwali zwłaszcza grę deblową młodszej pary. Sekcja przyjmuje uczniów, lecz ma tylko dwa wieczory treningowe w tygodniu. Korzystają z nich na zmianę juniorzy i dorośli. Dla części zawodników dojazd z przedmieść trwa dłużej niż sam trening.",
          "byline": "Jan Rudzki - Sport"
        },
        "stamps": {
          "title": "Miasto na kopercie",
          "body": "Na spotkaniach koła filatelistów przy domu kultury na Szkolnej coraz częściej ogląda się całe koperty, nie tylko znaczki. Stemple dawnych urzędów pocztowych pozwalają odtworzyć rozwój przedmieść. Kolekcjoner Antoni Witek zbiera przesyłki z adresami ulic, które zmieniły nazwy. Większość znalazł w rodzinnych papierach, resztę wymienił z innymi członkami koła. Prosi, by przed oddaniem makulatury przejrzeć stare listy. Odcięty znaczek traci część opowieści, którą zachowują adres, data i pieczęć na odwrocie koperty.",
          "byline": "Ewa Lis - Zainteresowania"
        },
        "cassette": {
          "title": "Koncert z odbiornika",
          "body": "W listach do działu technicznego powraca pytanie, jak nagrać audycję bez głosów domowników. W wielu mieszkaniach magnetofon stoi przy radiu, a muzykę zbiera mikrofon. Instruktor pracowni przy domu kultury na Szkolnej pokazuje inne połączenie, wykorzystujące gniazda obu aparatów. Nie każdy odbiornik je posiada, a odpowiedniego przewodu trzeba nieraz szukać w kilku sklepach. Na zajęcia przynosi się własny sprzęt i instrukcje. Uczestnicy wymieniają też spisy audycji: przy niewielu kasetach warto wiedzieć, co zajmuje drugą stronę.",
          "byline": "Dział techniczny"
        },
        "knitting": {
          "title": "Włóczka z odzysku",
          "body": "Przy ladzie pasmanterii na Ogrodowej klientki porównują próbki wełny przyniesione z domu. Potrzeba często jednego motka, lecz dokładnie w tym samym odcieniu. Sprzedawczyni radzi wtedy zmienić cały kołnierz albo oba mankiety. W świetlicy Północ przy Lipowej 6 kobiety prują stare swetry i łączą odzyskaną włóczkę w pasy. Wzory krążą w zeszytach, przepisywane z pożyczonych czasopism. Nie wszystko da się wykorzystać: najbardziej wytarte fragmenty odpadają. Z dobrego swetra dla dorosłego zostaje jednak materiał na kamizelkę dla dziecka.",
          "byline": "Anna Wrona - Dom i rodzina"
        },
        "darning": {
          "title": "Krawiec od drobnych spraw",
          "body": "Punkt krawiecki w pasażu przy Ogrodowej ma dwie maszyny i zeszyt pełen zamówień. Nie szyje się tu na miarę: skraca spodnie, wymienia podszewki, dopasowuje płaszcze kupione na wyrost. Mistrz Stanisław Bury najwięcej czasu poświęca rzeczom przynoszonym po kimś z rodziny. Każdą trzeba najpierw rozpruć i sprawdzić zapasy materiału. Cennik ujmuje taką pracę w kilku rubrykach, choć dwa podobne płaszcze mogą wymagać zupełnie innych zabiegów. Klienci pytają przede wszystkim o termin; od niego zależy, czy będą mieli w czym chodzić.",
          "byline": "Ewa Lis - Usługi"
        },
        "plants": {
          "title": "Ogród na parapecie",
          "body": "W kwiaciarni na osiedlu Północ pytania o rośliny dotyczą najczęściej mieszkań, nie ogrodów. Klienci opisują wąskie parapety, suche powietrze i okna wychodzące na sąsiedni blok. Florystka Zofia Kurek namawia, by najpierw ustalić, ile miejsca rzeczywiście można przeznaczyć na donice. Okazały okaz z wystawy nie zawsze się tam zmieści. Wśród mieszkańców krążą sadzonki zielistek i pelargonii; sklep sprzedaje do nich ziemię oraz podstawki. Najwięcej porad wymaga roślina otrzymana w prezencie, której nazwy nikt nie zapamiętał.",
          "byline": "Anna Wrona - Dom i rodzina"
        },
        "bread": {
          "title": "Obiad spod kredowej tablicy",
          "body": "W barze mlecznym przy dworcu na Kolejowej jadłospis zapisuje się kredą. Zanim przyjdą pierwsi podróżni, kuchnia wydaje już śniadania pracownikom okolicznych sklepów. Kierowniczka mówi, że stały gość chce przede wszystkim znać cenę i dostać posiłek bez długiego czekania. Dlatego obok potraw mącznych codziennie jest prosta zupa. Pieczywo z poprzedniego dnia przeznacza się na grzanki, a dostawy planuje według utargów z całego tygodnia. Najtrudniej przewidzieć ruch w dni targowe: wtedy przy stolikach spotyka się miasto i okoliczne wsie.",
          "byline": "Anna Wrona - Handel"
        },
        "station-clock": {
          "title": "Miasto na dwóch biletach",
          "body": "Przed siódmą w poczekalni dworca przy Kolejowej spotykają się ludzie dojeżdżający z całego województwa. Po zejściu z pociągu wielu czeka jeszcze przejazd tramwajem. W teczkach, obok śniadania, noszą dwa bilety miesięczne. Pani Teresa, księgowa, zna rozkład na pamięć, lecz do domu wraca według godzin odbioru dziecka z przedszkola. Zmiana służbowego zebrania o pół godziny oznacza dla niej godzinę na peronie. W miejskich statystykach jest pracownikiem biurowym. Sporą część jej dnia pracy wyznacza jednak kolejowy zegar.",
          "byline": "Ewa Lis - Miasto i region"
        },
        "lost-scarf": {
          "title": "Magazyn rzeczy niczyich",
          "body": "Pracownicy miejskiego biura rzeczy znalezionych porządkują przedmioty przekazane przez zajezdnie tramwajowe. Najwięcej jest parasoli, rękawiczek i toreb z drobnymi zakupami. Po dokumenty właściciele zgłaszają się szybko; ubrania potrafią czekać miesiącami. Każda rzecz otrzymuje numer i opis okoliczności znalezienia. Urzędniczka wyjaśnia, że pytanie o sam kolor szalika rzadko wystarcza: na półce leży zwykle kilka podobnych. Przy zgłoszeniu warto podać trasę i przybliżoną godzinę przejazdu. To pozwala odnaleźć właściwy wpis w księdze.",
          "byline": "Dział miejski"
        },
        "handwriting": {
          "title": "Co mówi szkolny zeszyt",
          "body": "W śródmiejskiej szkole nr 12 nauczyciele porównali zeszyty pierwszoklasistów z początku roku i po kilku tygodniach nauki. Zwracali uwagę nie tylko na kształt liter, lecz także na tempo pisania. Wychowawczyni tłumaczy, że staranny uczeń potrafi zostać daleko za dyktowanym zdaniem. Rodzice proszą o dodatkowe wzory do ćwiczeń; szkoła powiela je wspólnie dla kilku klas. Część dzieci pisze piórem po starszym rodzeństwie. Dopasowanie stalówki i spokojne prowadzenie ręki okazują się ważniejsze niż ozdobna okładka zeszytu.",
          "byline": "Anna Wrona - Oświata"
        },
        "aquarium": {
          "title": "Podwodny świat w świetlicy",
          "body": "Na spotkanie koła akwarystów w świetlicy Północ przy Lipowej 6 przyniesiono słoiki z sadzonkami i zeszyty obserwacji. Członkowie porównywali urządzenie małych zbiorników, takich, na jakie wystarcza miejsca w blokach. Pokazowy zbiornik w świetlicy skompletowano z darów: szkło dostarczył rzemieślnik, lampę jeden z klubowiczów, rośliny reszta koła. Dyżury przy nim dzielą uczniowie i emeryci. Instruktor podkreśla, że najpierw trzeba nauczyć się stałej opieki. Efektowną rybę łatwo przynieść z giełdy; trudniej zorganizować zastępstwo na czas urlopu.",
          "byline": "Marek Boruta - Zainteresowania"
        },
        "bookbinding": {
          "title": "Rocznik w twardej oprawie",
          "body": "Introligator przy ulicy Stolarskiej oprawia roczniki dla czytelni i domowych zbieraczy. Na stole leżą czasopisma techniczne, gazety oraz zeszyty z wykrojami. Zanim powstanie okładka, trzeba sprawdzić kolejność numerów i kompletność wkładek. Najwięcej kłopotu sprawiają wycięte porady: właściciel pamięta cały rocznik, lecz w środku brakuje połowy strony. Mistrz zachowuje dawne okładki i spisy treści. Jak wyjaśnia, dobra oprawa ma ułatwić znalezienie potrzebnego tekstu, a nie tylko wyrównać grzbiety na półce.",
          "byline": "Ewa Lis - Rzemiosło"
        },
        "starlight": {
          "title": "Niebo znad kamienic",
          "body": "W kole astronomicznym domu kultury na Szkolnej pierwszym przyrządem nie jest luneta, lecz mapa nieba. Instruktor uczy odnajdywać kilka jasnych gwiazd, zanim pozwoli ustawić teleskop. W śródmieściu obserwację utrudniają światła i ciasne podwórza; na lepszy widok uczestnicy wyjeżdżają za ostatnie zabudowania. Zajęcia przyciągają uczniów, ale także dorosłych przynoszących dawno nieużywane lornetki. Najwięcej cierpliwości wymaga wspólne czekanie na przejaśnienie. W zeszycie koła obok rysunków nieba zapisuje się więc również pogodę.",
          "byline": "Marek Boruta - Nauka"
        },
        "noticeboard": {
          "title": "Czyja kolej do suszarni?",
          "body": "Mieszkanka Lipowej 12 na osiedlu Północ pisze do redakcji w sprawie wspólnej suszarni. Na tablicy wisi regulamin, ale nie ma wykazu dyżurów ani informacji, kto przechowuje klucz. Spółdzielnia w odpowiedzi wskazuje gospodarza domu. Ten prowadzi zeszyt rezerwacji, o którym część nowych lokatorów nie wiedziała. Rada bloku zapowiada wywieszenie tej informacji obok regulaminu. Czytelniczka nie domagała się nowych urządzeń: chciała korzystać z pomieszczenia, za które płaci w czynszu. Do załatwienia sprawy wystarczyła czytelna kartka.",
          "byline": "Listy do redakcji"
        },
        "bicycle": {
          "title": "Rower szuka kąta",
          "body": "W sklepach sportowych rower ogląda się z każdej strony. W mieszkaniu trzeba jeszcze znaleźć dla niego miejsce. Czytelnicy z nowych osiedli piszą o wąskich piwnicach i schodach bez podjazdów. Gospodarz Lipowej 12 na Północy pokazuje nam wspólną rowerownię: stoją w niej także wózki, sanki i sprzęt turystyczny. Lokatorzy sami oznaczyli miejsca, by można było dojść do dalszej ściany. Rower pozostaje dla wielu środkiem dojazdu na działkę albo do pracy na przedmieściu. Jego użyteczność zaczyna się od możliwości wyprowadzenia go z domu.",
          "byline": "Dział miejski"
        },
        "prompter": {
          "title": "Głos spod sceny",
          "body": "Irena Domańska, suflerka Teatru Miejskiego, zna teksty kilku przedstawień naraz. W egzemplarzu zaznacza pauzy i miejsca zmienione podczas prób. Podpowiada początek zdania, zanim cisza stanie się słyszalna na widowni. Zastępstwo aktora oznacza dla niej dodatkową próbę, nawet gdy sztuka jest grana od lat. Najtrudniejsze są sceny zbiorowe: musi rozpoznać, kto zapomniał kwestii, a kto czeka na swoją kolej. Egzemplarz zabiera ze sceny dopiero po opuszczeniu kurtyny.",
          "byline": "Marek Boruta - Kultura"
        },
        "cinema-booth": {
          "title": "Okno nad widownią",
          "body": "Operator kina Świt, Roman Gajda, ogląda każdą kopię przed pierwszym seansem. Sprawdza sklejenia i oznaczenia kolejnych szpul. Na pudełkach zostają uwagi kolegów z innych kin, czasem ostrzeżenie o uszkodzonej końcówce. Podczas projekcji pan Roman patrzy przez okienko nad ostatnim rzędem. W kabinie słychać przede wszystkim pracę aparatów. Film, o którym dyskutują wychodzący widzowie, zna dobrze, lecz rzadko ma okazję usiąść i obejrzeć go od początku do końca.",
          "byline": "Marek Boruta - Kultura"
        },
        "score-library": {
          "title": "Nuty do zwrotu",
          "body": "Orkiestra dęta warsztatów kolejowych przy Kolejowej przechowuje nuty w dwóch szafach nad stołówką. Bibliotekarz Henryk Ruta rozdziela partie przed próbą i zbiera je po występie. Najszybciej zużywają się marsze grane także na dworze: karty mają ślady deszczu i zagięcia od klamerek. Brakującej partii nie da się zastąpić egzemplarzem sąsiada, który gra na innym instrumencie. Dlatego nowe nuty pan Henryk najpierw przepisuje, a dopiero potem oddaje oryginały do grania.",
          "byline": "Marek Boruta - Kultura"
        },
        "poster-lettering": {
          "title": "Afisz spod pędzla",
          "body": "Afisze domu kultury przy Szkolnej maluje Zygmunt Karaś. Na dwóch stołach rozkłada papier, obok kładzie zatwierdzony program. Najwięcej miejsca przeznacza na tytuł i godzinę, bo plakat ma być czytelny z drugiej strony ulicy. Długie nazwiska wykonawców wymagają osobnego rozplanowania. Przy zmianie terminu nie zawsze wystarcza doklejony pasek: stary napis prześwituje w witrynie. W takich przypadkach plastyk maluje cały afisz ponownie, choć pozostałe egzemplarze są już rozwieszone.",
          "byline": "Marek Boruta - Kultura"
        },
        "puppet-tour": {
          "title": "Scena w dwóch walizach",
          "body": "Teatrzyk lalkowy domu kultury przy Szkolnej wrócił z objazdu trzech wiejskich świetlic. Czworo instruktorów grało bajkę o zgubionym psie; lalki i dekoracje mieściły się w dwóch walizach. W Brzezinach pokaz trzeba było powtórzyć, bo dzieci z drugiego końca wsi przyjechały późniejszym autobusem. Zespół nie ma własnego samochodu. Kierowniczka Anna Król uzgadnia więc trasy z gospodarzami świetlic, którzy przewożą parawan i odbierają aktorów z przystanku.",
          "byline": "Marek Boruta - Kultura"
        },
        "accordion-duet": {
          "title": "Dwa akordeony",
          "body": "Marian Nowak i Leon Sowa z warsztatów kolejowych otrzymali wyróżnienie na przeglądzie muzyki amatorskiej w domu kultury przy Szkolnej. Ich duet akordeonowy wykonał trzy melodie taneczne. Obaj grają ze słuchu; zapis na potrzeby przeglądu przygotowała nauczycielka szkoły muzycznej przy Ogrodowej. Próby odbywali w mieszkaniu Nowaków, między powrotem z pracy a snem dzieci. Jury pochwaliło wspólne tempo i zaleciło poszerzenie repertuaru przed następnym występem.",
          "byline": "Marek Boruta - Kultura"
        },
        "matinee-survey": {
          "title": "Kto chodzi na poranki",
          "body": "Kino Świt zebrało 58 odpowiedzi od opiekunów przychodzących na dziecięce poranki. Rodzice z przedmieść prosili o późniejszy początek, aby zdążyć z autobusu. Mieszkańcy centrum woleli wcześniejszy koniec, przed obiadem. Kierownik kina Jerzy Łata sprawdza, czy można rozdzielić godziny seansów dla grup szkolnych i rodzin. Nie zapowiedział jeszcze zmiany repertuaru. Bileterki zwróciły uwagę na szatnię: dwie grupy przybywające jednocześnie blokują wejście do sali.",
          "byline": "Marek Boruta - Kultura"
        },
        "dance-shoes": {
          "title": "Walce na zmianę",
          "body": "Kurs tańca w domu kultury przy Szkolnej zakończył się pokazem dla rodzin. Dwanaście par zatańczyło walca i polkę. Instruktorka Halina Bąk przyjmuje przede wszystkim dorosłych przygotowujących się do wesel i zakładowych zabaw. Część kursantów nie miała dotąd gdzie ćwiczyć; w domu odsuwali kuchenny stół. Na pokazie udało się zatańczyć pełny układ bez zatrzymywania muzyki. Po występie rodzice uczestników przejęli parkiet, a kursanci zajęli ich miejsca przy ścianie.",
          "byline": "Marek Boruta - Kultura"
        },
        "recitation-finals": {
          "title": "Wiersz bez mikrofonu",
          "body": "Ewa Sokołowska ze szkoły nr 12 wygrała miejski konkurs recytatorski w domu kultury przy Szkolnej. W finale wystąpiło jedenastu uczniów. Jury wyróżniło wyraźną mowę i spokojną interpretację, bez gestów zasłaniających sens wiersza. Laureatka przygotowywała się z polonistką Marią Bielecką, a w domu czytała babci. Nagrodą był tom poezji i udział w warsztatach teatralnych. Organizatorzy udostępnią nauczycielom nagranie finału, wykonane przez klub radioamatorów.",
          "byline": "Marek Boruta - Kultura"
        },
        "folk-recording": {
          "title": "Taśma z okolic miasta",
          "body": "Muzeum Miejskie przy Rynku otrzymało nagranie pieśni weselnych z Brzezin. Taśmę przyniósł Jan Cichy, wnuk jednej z czterech śpiewaczek. Nagrywał je w kuchni babci, bez akompaniamentu. Kobiety przerywały śpiew, by uzgodnić zapomniane słowa; jedna pamiętała inne zakończenie niż pozostałe. Etnografka Teresa Maj zachowa obie wersje. Przed włączeniem taśmy do zbiorów pojedzie do Brzezin ustalić, od kogo śpiewaczki nauczyły się poszczególnych pieśni.",
          "byline": "Marek Boruta - Kultura"
        },
        "reading-room": {
          "title": "Gazeta na drewnie",
          "body": "W czytelni filii nr 6 przy Kolejowej gazety zakłada się na drewniane uchwyty. Przy długim stole spotykają się emeryci i pasażerowie czekający na pociąg. Najbardziej oblegany jest dziennik z programem radiowym; bibliotekarka Janina Wolska odkłada drugi egzemplarz dla osób spisujących godziny audycji. Starsze numery trzyma przez miesiąc na zapleczu. Czytelnicy wracają po ogłoszenia i wyniki meczów, dlatego prosi, by potrzebne wiadomości przepisywali, zamiast wycinać.",
          "byline": "Marek Boruta - Kultura"
        },
        "portrait-studio": {
          "title": "Przed obiektywem",
          "body": "Fotograf Witold Lenart przy Ogrodowej robi rodzinne portrety przede wszystkim w niedziele. Wtedy udaje się zebrać domowników pracujących na różne zmiany. Przy większej rodzinie ustawienie osób trwa dłużej niż samo zdjęcie. Dzieci sadza się na stołku, starsi stoją za nimi. Klienci zamawiają kilka odbitek: dla siebie i dla krewnych poza miastem. Lenart przechowuje negatywy według numerów zleceń, żeby po latach można było dorobić zdjęcie bez ponownego zbierania rodziny.",
          "byline": "Marek Boruta - Kultura"
        },
        "museum-labels": {
          "title": "Mała kartka w gablocie",
          "body": "Teresa Maj z Muzeum Miejskiego przy Rynku opisuje przedmioty przynoszone przez mieszkańców. Do drewnianego narzędzia potrzebuje więcej informacji niż nazwiska ofiarodawcy: pyta, kto go używał i przy jakiej pracy. Rodzinne określenia porównuje z dawnymi katalogami. Nie zawsze udaje się ustalić jedną nazwę. W gablocie drukuje wtedy oba spotykane określenia. Szczegóły rozmowy zostają w dokumentacji, dostępnej dla osób badających dzieje miejscowego rzemiosła.",
          "byline": "Marek Boruta - Kultura"
        },
        "book-cart": {
          "title": "Biblioteka na kółkach",
          "body": "W każdy wtorek bibliotekarka technikum kolejowego przy Kolejowej odwiedza internat z wózkiem książek. Wychowawcy zbierają wcześniej zamówienia od uczniów. Obok lektur jeżdżą powieści podróżnicze i podręczniki potrzebne do poprawiania ocen. Wieczorne wypożyczanie pomaga tym, którzy po warsztatach nie zdążają do biblioteki. Największy ruch jest przed wyjazdami do domu. Uczniowie biorą książki na drogę, a bibliotekarka zapisuje termin zwrotu po ich powrocie.",
          "byline": "Marek Boruta - Kultura"
        },
        "photo-exhibition": {
          "title": "Podwórka na wystawie",
          "body": "Koło fotograficzne domu kultury przy Szkolnej pokazało trzydzieści zdjęć podwórek z Kolejowej i Stolarskiej. Autorzy fotografowali warsztaty, wspólne studnie i klatki schodowe zamiast reprezentacyjnych ulic. Na otwarcie przyszli mieszkańcy uwiecznionych domów. Pomogli uzupełnić podpisy o nazwiska rzemieślników i dawne przeznaczenie oficyn. Odbitki po zakończeniu wystawy trafią do filii bibliotecznej nr 6, która zbiera materiały o obu ulicach.",
          "byline": "Marek Boruta - Kultura"
        },
        "poetry-evening": {
          "title": "Autor przy małym stole",
          "body": "Poeta Wiktor Leski spotkał się z czytelnikami filii nr 6 przy Kolejowej. Przeczytał wiersze o dojazdach do pracy i podwórkach, znanych mu z młodości. Rozmowa zeszła na poprawianie tekstów. Autor pokazał dwie wersje jednego utworu i wyjaśnił, dlaczego zrezygnował z opisania całej ulicy na rzecz jednej bramy. Czytelnicy pytali również o możliwość kupienia tomu. Biblioteka ma dwa egzemplarze do wypożyczenia; w okolicznych księgarniach nakład się wyczerpał.",
          "byline": "Marek Boruta - Kultura"
        },
        "museum-donation": {
          "title": "Album bez podpisów",
          "body": "Muzeum Miejskie przy Rynku otrzymało album Antoniego Raka, dawnego fotografa warsztatów kolejowych. Córka przekazała zdjęcia wycieczek załogi, jubileuszy i zawodów sportowych. Część odbitek nie ma dat. Na spotkanie w muzeum przyszło sześciu emerytowanych kolejarzy; rozpoznali kolegów, lecz nie wszystkie miejsca. Kustosz prosi dawnych pracowników o pomoc. Album można obejrzeć w dziale historii miasta po uzgodnieniu wizyty w sekretariacie muzeum.",
          "byline": "Marek Boruta - Kultura"
        },
        "radio-play": {
          "title": "Kroki z pudełka",
          "body": "W domu kultury przy Szkolnej dzieci ze szkoły nr 12 nagrały krótką scenę dworcową. Instruktor klubu radiowego pokazał, jak uzyskać odgłos kroków w pudełku żwiru i turkot kół na drewnianym blacie. Uczniowie podzielili między siebie dialogi i efekty. Pierwszą próbę zagłuszył śmiech osób czekających na swoją kolej, drugą udało się nagrać w całości. Taśma posłuży podczas szkolnego przedstawienia, którego skromna scena nie pomieści dekoracji dworca.",
          "byline": "Marek Boruta - Kultura"
        },
        "poster-collection": {
          "title": "Repertuar sprzed lat",
          "body": "Leon Warda, emerytowany kasjer kolejowy, przekazał Muzeum Miejskiemu programy kina Świt zbierane przez osiemnaście lat. Ołówkiem zaznaczał obejrzane filmy i nazwiska aktorów, dla których kupował bilet. Zbiór pozwala porównać repertuar oraz ceny poranków i seansów wieczornych. Brakuje jednego rocznika, pożyczonego dawniej sąsiadowi. Pan Warda szuka go przez redakcję. Muzeum przy Rynku przyjmie także pojedyncze programy, które pomogą uzupełnić brak.",
          "byline": "Marek Boruta - Kultura"
        },
        "book-display": {
          "title": "Książki z drugiej półki",
          "body": "W filii nr 6 przy Kolejowej bibliotekarki wyłożyły powieści, których nikt nie wypożyczył przez ostatni rok. Obok tomów położyły krótkie omówienia fabuły, bez zdradzania zakończeń. W ciągu tygodnia czytelnicy zabrali dziewięć z piętnastu książek. Janina Wolska nie uważa tego jeszcze za dowód zmiany gustów. Tom wystawiony przy ladzie łatwiej zauważyć niż grzbiet w drugim rzędzie półki. Kolejna wystawka obejmie reportaże, o które również rzadko ktoś pyta.",
          "byline": "Marek Boruta - Kultura"
        },
        "umbrella-ribs": {
          "title": "Pod jedną czaszą",
          "body": "W budce przy targowisku na Kolejowej Władysław Lis naprawia parasole. Zbierane przez lata zapasowe druty zajmują więcej miejsca niż gotowe wyroby. Do starych modeli części trzeba dopasowywać ręcznie; najczęściej wymienia się złamane końcówki i mocowanie rączki. Przed przyjęciem zlecenia rzemieślnik ogląda tkaninę. Jeśli jest przetarta przy szwach, sama naprawa szkieletu niewiele pomoże. Klient poznaje koszt przed zostawieniem parasola i sam decyduje, czy naprawa się opłaca.",
          "byline": "Ewa Lis - Rzemiosło"
        },
        "shoe-lasts": {
          "title": "But na prawidle",
          "body": "Szewc Józef Noga z Kolejowej zaczyna naprawę od obejrzenia obu butów. Klienci często przynoszą tylko ten z odklejoną podeszwą, tymczasem drugi bywa równie zużyty. Najwięcej zamówień dotyczy obcasów i łat przy zgięciu cholewki. Pan Józef przechowuje skórzane resztki według grubości; na małą łatę nie potrzeba całego nowego kawałka. Obuwie robocze stali klienci zostawiają po zmianie. Termin odbioru ustalają tak, by zdążyć przed następną służbą.",
          "byline": "Ewa Lis - Rzemiosło"
        },
        "brush-maker": {
          "title": "Włosie w równym rzędzie",
          "body": "Szczotkarnia przy Stolarskiej 14 przyjmuje zamówienia z piekarń, warsztatów i od prywatnych klientów. Mistrz Edward Łoś dobiera twardość włosia do przeznaczenia szczotki. Drewniane oprawy zamawia u sąsiedniego stolarza, a zużyte sprawdza przed ponownym obsadzeniem. Nie każdą warto ratować: pęknięcia przy otworach osłabiają mocowanie. Piekarze przynoszą stare szczotki jako wzór, bo długość uchwytu musi pasować do ich stołów i sposobu pracy.",
          "byline": "Ewa Lis - Rzemiosło"
        },
        "frame-shop": {
          "title": "Rama do wspomnienia",
          "body": "Ramiarz przy Stolarskiej 9 oprawia najwięcej dyplomów i rodzinnych fotografii. Klient wybiera listwę, ale o szerokości obramowania często decyduje stan zdjęcia. Wyblakłego brzegu nie zawsze da się schować bez zasłonięcia czyjejś twarzy. Rzemieślnik pokazuje więc układ na stole przed cięciem materiału. Szyby do małych ramek wycina z pozostałości po większych zamówieniach. Dzięki temu szkolne świadectwo można oprawić taniej niż w gotową ramę z wystawy.",
          "byline": "Ewa Lis - Rzemiosło"
        },
        "upholstery-course": {
          "title": "Krzesło na warsztacie",
          "body": "Uczniowie szkoły zawodowej nr 3 przy Stolarskiej odnowili sześć krzeseł dla świetlicy na Północy. Drewniane ramy były całe, lecz siedziska zapadły się po latach użytkowania. Pod kierunkiem tapicera Romana Bryły wymieniono pasy i wyściółkę. Tkaninę dostarczyła spółdzielnia mieszkaniowa. Było jej niewiele, dlatego na oparciach wykorzystano zachowane obicie. Krzesła wróciły do świetlicy; szkoła rozliczyła pracę jako zajęcia praktyczne, bez opłaty za robociznę.",
          "byline": "Ewa Lis - Rzemiosło"
        },
        "engraver-cup": {
          "title": "Miejsce na nazwisko",
          "body": "Grawer przy Ogrodowej 16 ukończył puchar miejskiej ligi tenisa stołowego. Na podstawie znalazła się nazwa zwycięskiej drużyny pocztowców i nazwiska sześciu zawodników. Organizatorzy poprawili skład tuż przed odbiorem, dopisując rezerwowego, który grał w pierwszych rundach. Napis trzeba było rozmieścić od nowa. Puchar trafi do świetlicy głównego urzędu pocztowego. Drużyna otrzymała także dyplomy dla zawodników, w tym dla nieobecnego na zakończeniu rezerwowego.",
          "byline": "Ewa Lis - Rzemiosło"
        },
        "ceramic-glaze": {
          "title": "Kolor po wypale",
          "body": "W domu kultury przy Szkolnej pokazano naczynia z pierwszego wypału kursu ceramiki. Z dwudziestu kubków trzy pękły, a w kilku szkliwo pokryło spód i wymagało oczyszczenia. Instruktorka Barbara Mirek omówiła te błędy z autorami przed wystawą. Kursanci uczą się formowania ręcznego, bez koła garncarskiego. Gotowe prace mogą zabrać do domu; opłata za zajęcia obejmuje glinę i wspólny wypał. Kolejna grupa będzie pracować nad miskami o grubszym dnie.",
          "byline": "Ewa Lis - Rzemiosło"
        },
        "joinery-drawer": {
          "title": "Szuflada według miary",
          "body": "Stolarnia przy Stolarskiej 5 dorobiła szufladę do katalogu biblioteki przy Kolejowej. Poprzednia pękła pod ciężarem kart i od miesięcy stała na zapleczu. Uczeń Marek Wilk mierzył sąsiednie szuflady, lecz każda miała nieco inną szerokość. Mistrz wyjaśnił, że stary mebel składano i dopasowywano ręcznie. Nowy element przymierzono więc w bibliotece przed wykończeniem. Karty wróciły na swoje miejsce; czytelnicy nie muszą już prosić bibliotekarki o przyniesienie pudełka.",
          "byline": "Ewa Lis - Rzemiosło"
        },
        "weaving-sample": {
          "title": "Wzór zapisany nitką",
          "body": "Koło tkackie domu kultury przy Szkolnej przyjęło osiem nowych uczestniczek. Instruktorka Olga Kania przygotowała dla nich próbki podstawowych splotów. Zamiast zaczynać od dużych makat, kursantki wykonują niewielkie paski z resztek przędzy. Pozwala to poprawić naprężenie bez prucia całej pracy. Dwa warsztaty tkackie dzielą na zmiany z bardziej doświadczoną grupą. Na razie lista chętnych jest dłuższa niż liczba miejsc przy krosnach.",
          "byline": "Ewa Lis - Rzemiosło"
        },
        "locksmith-apprentice": {
          "title": "Klucz bez wzoru",
          "body": "Piotr Zając ze szkoły zawodowej nr 3 przy Stolarskiej zdał praktyczny sprawdzian ślusarski. Dorobił klucz do zamka starej szafki warsztatowej, korzystając z mechanizmu zamiast gotowego wzoru. Mistrz Antoni Kłos oceniał dopasowanie i sposób wykończenia krawędzi. Klucz po próbie otwierał zamek bez zacinania, ale uczeń musiał jeszcze wygładzić uchwyt. Była to pierwsza samodzielna praca Zająca przeznaczona do użytku w szkolnym warsztacie.",
          "byline": "Ewa Lis - Rzemiosło"
        },
        "book-gilding": {
          "title": "Litery na grzbiecie",
          "body": "Introligator przy Stolarskiej 6 tłoczy tytuły na grzbietach oprawianych roczników. Metalowe litery dobiera osobno do każdego napisu. Wąska oprawa mieści mniej niż okładka, dlatego skróty uzgadnia z właścicielem. Biblioteki proszą przede wszystkim o nazwę pisma i rok; prywatni zbieracze częściej zamawiają także ozdobne linie. Najwięcej przygotowań wymagają niekompletne roczniki. Trzeba wyraźnie zaznaczyć, jakie numery zawiera tom, zanim nowa oprawa ukryje braki.",
          "byline": "Ewa Lis - Rzemiosło"
        },
        "scissors-grinder": {
          "title": "Ostrze i zawias",
          "body": "Ostrzarz przy targowisku na Kolejowej obsługuje krawców i domowe szwaczki. Nożyczki, które szarpią materiał, nie zawsze wymagają ostrzenia: czasem poluzowało się połączenie ostrzy. Każdą parę sprawdza na tkaninie, od cienkiej podszewki po filc. Klientki przynoszą też własne skrawki, zwłaszcza gdy pracują z delikatnym materiałem. Duże nożyce zakładowe zostawia się do następnego dnia. Małe poprawki przy śrubie wykonuje zwykle od ręki.",
          "byline": "Ewa Lis - Rzemiosło"
        },
        "basket-work": {
          "title": "Kosz przed targiem",
          "body": "Stanisław Kurek z Brzezin sprzedaje kosze na targowisku przy Kolejowej. Część wyplata na zamówienie piekarzy, pozostałe kupują mieszkańcy na zakupy i działki. Kosze na ziemniaki robi z grubszych prętów niż te na chleb. Najwięcej uszkodzeń powstaje przy pałąku, gdy mokry kosz podnosi się z pełnym ładunkiem. Kurek przyjmuje wyroby do naprawy, lecz najpierw sprawdza dno. Jeśli splot jest kruchy na całej powierzchni, wymiana samego uchwytu nie wystarczy.",
          "byline": "Ewa Lis - Rzemiosło"
        },
        "watch-parts": {
          "title": "Części pod numerem",
          "body": "Zegarmistrz przy Stolarskiej 4 odkłada części każdego zegarka do osobnego pudełka z numerem zlecenia. Starsze mechanizmy wymagają nieraz części z odzysku, dlatego termin podaje dopiero po rozebraniu koperty. Klienci przynoszą także zegarki pamiątkowe, od dawna nienoszone. Mistrz odróżnia przywrócenie im chodu od dokładnej regulacji. Po naprawie obserwuje wskazania przez kilka dni. Dopiero wtedy wydaje zegarek, prosząc właściciela o sprawdzenie go również podczas noszenia.",
          "byline": "Ewa Lis - Rzemiosło"
        },
        "leather-satchel": {
          "title": "Tornister po starszym",
          "body": "Pracownia kaletnicza szkoły zawodowej nr 3 przy Stolarskiej naprawiła dwanaście tornistrów przekazanych przez rodziców. W większości skóra była jeszcze mocna, a wymiany wymagały nici, sprzączki i paski. Uczniowie pracowali pod nadzorem mistrzyni Wandy Górskiej. Rodzice pokryli koszt okuć; robociznę zaliczono do praktyk. Tornistry wrócą do młodszego rodzeństwa. Dwie torby odrzucono po oględzinach, ponieważ popękana skóra nie utrzymałaby nowych szwów.",
          "byline": "Ewa Lis - Rzemiosło"
        },
        "plaster-mould": {
          "title": "Kopia małego liścia",
          "body": "Sztukatorzy ze Stolarskiej odtworzyli brakujący liść w dekoracji klatki przy Ogrodowej 9. Wzór pobrali z zachowanego ornamentu na drugim piętrze. Pod warstwami farby znaleźli drobne nacięcia niewidoczne z dołu. Nowy odlew trzeba było dopasować do starego tynku, a nie tylko powtórzyć jego kształt. Naprawę zleciła administracja domu przy okazji odnawiania schodów. Pozostałe ozdoby zostaną oczyszczone na miejscu, bez zdejmowania ze ścian.",
          "byline": "Ewa Lis - Rzemiosło"
        },
        "hat-block": {
          "title": "Kapelusz odzyskał kształt",
          "body": "Modystka przy Ogrodowej przygotowała trzy kapelusze dla zespołu teatralnego domu kultury na Szkolnej. Stroje wypożyczono ze starego magazynu i trzeba je było dopasować do nowych wykonawców. Dwa kapelusze straciły kształt od przechowywania pod cięższymi pudełkami. Po przymiarkach zmieniono obwód i wstążki, zachowując dawny fason. Kierownik zespołu zamówił też pudła do transportu. Dotąd nakrycia głowy wożono razem z płaszczami, co niweczyło część pracy modystki.",
          "byline": "Ewa Lis - Rzemiosło"
        },
        "metal-signs": {
          "title": "Numer czytelny z bramy",
          "body": "Dom przy Stolarskiej 8 otrzymał tablice oznaczające wejścia: A do frontowego budynku i B do oficyny. Dotychczas listonosz i dostawcy pytali mieszkańców o kolor drzwi, zmieniony podczas malowania. Metalowe oznaczenia wykonał warsztat ślusarski przy tej samej ulicy. Umieszczono je na wysokości widocznej z bramy, a przy dzwonkach dodano nazwiska. Administracja zapowiedziała podobną kontrolę oznaczeń w sąsiednich domach. Lokatorzy proszą, by uwzględnić także wejścia do zakładów na podwórzach.",
          "byline": "Ewa Lis - Rzemiosło"
        },
        "pottery-jug": {
          "title": "Dzbanek według rysunku",
          "body": "Maria Kula ze szkoły zawodowej nr 3 wykonała dzbanek na konkurs prac uczniowskich w domu kultury przy Szkolnej. Projekt konsultowała z instruktorką ceramiki Barbarą Mirek. Pierwszy model miał zbyt szeroki uchwyt i kapał przy nalewaniu. Po zmianie dziobka drugi egzemplarz nadawał się już do użytku. Jury wyróżniło go za wygodę trzymania, choć szkliwo nie było całkiem równe. Uczennica przygotuje następny komplet podczas praktyk w pracowni ceramicznej.",
          "byline": "Ewa Lis - Rzemiosło"
        },
        "carving-letters": {
          "title": "Deska dla kronikarza",
          "body": "Koło rzeźbiarskie przy Szkolnej wykonało okładkę kroniki swojego domu kultury. Lipowe deski dostarczyła stolarnia, a metalowe zawiasy pobliski warsztat. Uczestnicy podzielili między siebie ornament; napis wyciął emerytowany stolarz Wacław Duda. Praca trwała sześć spotkań, bo deski wymagały sklejenia i wyrównania przed rzeźbieniem. Księga jest dostępna w sekretariacie. Obok zdjęć z imprez zawiera nazwiska osób, które od lat prowadzą zajęcia i pomagają przy urządzaniu sal.",
          "byline": "Ewa Lis - Rzemiosło"
        },
        "club-kit": {
          "title": "Koszulki według numerów",
          "body": "Magazynier klubu kolejowego przy Kolejowej, Franciszek Polak, wydaje piłkarzom stroje przed każdym meczem. Seniorzy i juniorzy korzystają z dwóch kompletów koszulek, więc terminy prania zależą od terminarza obu drużyn. Drobne rozdarcia zaszywa żona jednego z zawodników. Najtrudniej uzupełnić brakujące rozmiary: dostawa jednakowych koszulek nie oznacza, że każda będzie pasować. W torbie na wyjazd pan Franciszek zostawia zapasowy komplet, sznurowadła i opatrunki.",
          "byline": "Jan Rudzki - Sport"
        },
        "referee-notebook": {
          "title": "Gwizdek i notes",
          "body": "Kazimierz Bury sędziuje mecze piłki nożnej w miejskiej lidze zakładowej. Przed spotkaniem sprawdza składy i stan boiska, po nim wypełnia protokół. Grają głównie pracownicy znający się z innych drużyn, co nie ułatwia rozstrzygania sporów. Najwięcej uwag dotyczy spóźnień i brakujących rezerwowych. Bury prosi kapitanów, by zgłaszali zmiany przed wejściem zawodnika. Gdy ktoś pojawia się prosto ze zmiany roboczej, ławka bywa szybsza od osoby prowadzącej zapis.",
          "byline": "Jan Rudzki - Sport"
        },
        "pool-lanes": {
          "title": "Tor dla każdego",
          "body": "Na pływalni przy Sportowej wieczorne lekcje dla dorosłych prowadzi Teresa Ryś. Uczestnicy dostają osobny tor, żeby nie ćwiczyć oddechu między szybko pływającymi klubowiczami. Część przychodzi po raz pierwszy od czasów szkolnych i wstydzi się trzymać brzegu. Instruktorka zaczyna od ćwiczeń w płytkiej wodzie. Zapisów dokonuje kasa pływalni, a grupy są małe ze względu na potrzebny nadzór. Najwięcej chętnych zgłasza się na godziny po drugiej zmianie.",
          "byline": "Jan Rudzki - Sport"
        },
        "running-log": {
          "title": "Kilometry w zeszycie",
          "body": "Koło rekreacyjne osiedla Północ zbiera się na bieganie przy bramie parku na Lipowej. Grupa dzieli się według tempa: początkujący pokonują krótszą pętlę, pozostali biegną aż do ogródków działkowych. Prowadzący Andrzej Malec zaznacza, że nie są to przygotowania do zawodów. Wiele osób wraca do ruchu po latach siedzącej pracy. W zeszycie zapisują przebyte odcinki i przerwy, żeby nie zwiększać dystansu zbyt pochopnie pod wpływem szybszych kolegów.",
          "byline": "Jan Rudzki - Sport"
        },
        "volleyball-shift": {
          "title": "Siatka po godzinach",
          "body": "Pocztowcy pokonali drukarzy 3:2 w miejskiej lidze siatkówki zakładowej. Mecz w sali szkoły nr 12 rozpoczął się pół godziny później, bo dwóch gości kończyło zmianę. Drukarze wygrali pierwsze dwa sety, lecz po przerwie coraz częściej tracili punkty przy przyjęciu zagrywki. Kapitan pocztowców Paweł Baran wyróżnił grę rezerwowego rozgrywającego. Obie drużyny zwróciły się do organizatorów o późniejsze rozpoczynanie spotkań rozgrywanych w dni robocze.",
          "byline": "Jan Rudzki - Sport"
        },
        "cross-country": {
          "title": "Meta przy starej bramie",
          "body": "Tomasz Cisek ze szkoły nr 12 wygrał miejski bieg przełajowy uczniów na dwóch kilometrach. Trasa prowadziła alejkami parku przy Lipowej, z metą przy głównej bramie. Startowało 46 biegaczy z dziewięciu szkół. Cisek objął prowadzenie na ostatnim okrążeniu; wcześniej biegł za grupą zawodników technikum kolejowego. Drużynowo zwyciężyła szkoła nr 12. Nauczyciel wychowania fizycznego Jan Król zapowiedział udział jej reprezentacji w zawodach międzyszkolnych poza miastem.",
          "byline": "Jan Rudzki - Sport"
        },
        "boxing-score": {
          "title": "Punkty dla juniorów",
          "body": "Juniorzy klubu kolejowego zremisowali 6:6 z budowlanymi w towarzyskim spotkaniu bokserskim przy Sportowej. Dwie ostatnie walki wygrali gospodarze, odrabiając stratę z początku zawodów. Trener Leon Wójcik pochwalił debiut Marka Borka, który utrzymał tempo przez wszystkie rundy. Zastrzeżenia miał do obrony pozostałych zawodników. Widownię wypełnili głównie rodzice i koledzy z warsztatów. Dochód z biletów klub przeznaczy na wymianę zużytych rękawic treningowych.",
          "byline": "Jan Rudzki - Sport"
        },
        "handball-goalkeeper": {
          "title": "Bramkarz z rezerwy",
          "body": "Spółdzielcy wygrali z pocztowcami 20:18 w miejskiej lidze piłki ręcznej. Po przerwie do bramki gospodarzy wszedł rezerwowy Jerzy Lis i obronił dwa rzuty karne. Dotąd występował głównie w spotkaniach towarzyskich. Trener Henryk Nowicki podkreślił także pracę obrońców, którzy w końcówce nie pozwalali rywalom rzucać z bliska. Mecz rozegrano w hali przy Sportowej. Zwycięstwo pozwoliło spółdzielcom zrównać się punktami z drużyną drukarzy.",
          "byline": "Jan Rudzki - Sport"
        },
        "relay-baton": {
          "title": "Pałeczka bez pośpiechu",
          "body": "Sztafeta chłopców ze szkoły nr 12 zajęła drugie miejsce w miejskich zawodach 4 x 100 metrów przy Sportowej. Od zwycięzców z technikum kolejowego dzieliła ją sekunda. Nauczyciel Jan Król uznał wynik za postęp: na poprzednim starcie zespół stracił pałeczkę przy zmianie. Tym razem wszystkie przekazania odbyły się płynnie. Drużyna trenuje na szkolnym boisku, którego krótka bieżnia pozwala ćwiczyć przede wszystkim starty i zmiany, a nie całe okrążenie.",
          "byline": "Jan Rudzki - Sport"
        },
        "chess-clock": {
          "title": "Partia do odtworzenia",
          "body": "Emerytowany kolejarz Antoni Witek wygrał turniej szachowy w domu kultury przy Szkolnej. W finale pokonał ucznia technikum Pawła Mroza po długiej końcówce wieżowej. Młodszy zawodnik miał mniej czasu na zegarze i oddał pionka przy wymianie. Do turnieju zgłosiły się 24 osoby, w tym sześciu juniorów. Sędzia Stefan Duda zapowiedział osobne zajęcia z końcówek. Zapis finału jest dostępny w klubie dla uczestników, którzy chcą przeanalizować partię.",
          "byline": "Jan Rudzki - Sport"
        },
        "model-railway": {
          "title": "Rozkład na małym torze",
          "body": "Makieta kolejowa w domu kultury przy Szkolnej zajmuje dwa połączone stoły. Budują ją uczniowie pod opieką emerytowanego dyżurnego ruchu Stanisława Raka. Torowisko jest gotowe, lecz stacja wciąż otrzymuje nowe szczegóły: ławki, tablice i magazyn bagażu. Materiały przynoszą członkowie koła; cienki karton pochodzi od introligatora. Przy obsłudze makiety obowiązuje kolejność przejazdów. Na jednotorowym odcinku dwaj młodzi maszyniści muszą uzgodnić, kto poczeka na mijance.",
          "byline": "Ewa Lis - Zainteresowania"
        },
        "coin-cabinet": {
          "title": "Moneta z historią",
          "body": "Numizmatycy z domu kultury przy Szkolnej spotykają się nad monetami przynoszonymi z rodzinnych zbiorów. Opiekun koła, emerytowany kasjer kolejowy Leon Warda, pomaga odczytać daty i oznaczenia mennic. Prosi, by przed spotkaniem nie polerować monet. Zatarte ślady utrudniają rozpoznanie, a dla kolekcjonera wygląd powierzchni bywa równie ważny jak nominał. Początkujący mogą korzystać z klubowego katalogu. Wymiany ustalają sami właściciele; koło nie prowadzi skupu ani wyceny do sprzedaży.",
          "byline": "Ewa Lis - Zainteresowania"
        },
        "postcard-box": {
          "title": "Widokówki w pudełku",
          "body": "Zofia Rataj, nauczycielka z Kolejowej, zbiera widokówki miasta. Układa je według ulic, aby porównywać zabudowę z różnych lat. Na jednej karcie przy bramie warsztatu widać szyld, którego nie pamiętają już starsi sąsiedzi. Datę przybliża stempel pocztowy i wiadomość o przeprowadzce zapisana na odwrocie. Kolekcjonerka wypożycza karty na szkolne wystawy. Prosi tylko o pozostawienie ich w ochronnych koszulkach: kilka odbitek nosi już ślady pinezek.",
          "byline": "Ewa Lis - Zainteresowania"
        },
        "amateur-radio": {
          "title": "Głos zapisany w dzienniku",
          "body": "Klub krótkofalowców przy domu kultury na Szkolnej ma jeden nadajnik, więc operatorzy umawiają się na dyżury. Po każdej rozmowie zapisują znak drugiej stacji, godzinę i warunki odbioru. Potwierdzenia przychodzą pocztą w postaci kart. Instruktor Jerzy Kaleta pokazuje nowym członkom, jak prowadzić dziennik, zanim dopuści ich do pracy przy aparacie. Dużo czasu zajmuje samo słuchanie. Cichy sygnał trzeba rozpoznać w szumie, a znak stacji odebrać bez zgadywania.",
          "byline": "Ewa Lis - Zainteresowania"
        },
        "model-boat": {
          "title": "Próba na małej wodzie",
          "body": "Modelarze z domu kultury przy Szkolnej przetestowali sześć łódek na pływalni przy Sportowej, przed rozpoczęciem zajęć dla publiczności. Najszybszy model zbudował uczeń technikum Rafał Brzoza. Łódka nieznacznie skręcała, lecz po poprawieniu ustawienia steru pokonała wyznaczony odcinek bez dotykania brzegu. Opiekun koła Ryszard Żak zwracał uwagę także na szczelność kadłubów. Dwa modele wróciły do pracowni do uszczelnienia, zanim będzie można pokazać je na zawodach.",
          "byline": "Ewa Lis - Zainteresowania"
        },
        "philately-swap": {
          "title": "Znaczek za kopertę",
          "body": "Na spotkaniu filatelistów przy Szkolnej Antoni Witek pokazał kopertę ze stemplem dawnego urzędu w Brzezinach. Przesyłka pochodzi z czasu, gdy wieś miała jeszcze osobną placówkę pocztową. Członkowie koła porównali odbicie z innymi listami i ustalili brakującą cyfrę daty. Witek wymienił kopertę na dwa znaczki do swojej serii kolejowej. Nowy właściciel, nauczyciel Stefan Duda, zbiera dokumenty dotyczące Brzezin i przygotowuje ich pokaz w miejscowej świetlicy.",
          "byline": "Ewa Lis - Zainteresowania"
        },
        "fish-show": {
          "title": "Akwarium z podpisem",
          "body": "Miejskie koło akwarystów urządziło pokaz w świetlicy Północy przy Lipowej 6. Wyróżnienie otrzymała Anna Mróz ze szkoły nr 12 za niewielkie akwarium z gupikami i gęsto posadzonymi roślinami. Zbiornik wykonał jej ojciec, codzienną opieką zajmuje się sama. Oceniający pytali o karmienie, podmiany wody i zastępstwo podczas wyjazdów. Większe akwaria starszych członków przyciągały widzów, ale wymagały wyposażenia, na które początkujących zwykle jeszcze nie stać.",
          "byline": "Ewa Lis - Zainteresowania"
        },
        "photo-darkroom": {
          "title": "Odbitka z jednego filmu",
          "body": "Kursanci fotografii przy domu kultury na Szkolnej wykonali odbitki z jednego negatywu Witolda Lenarta. Zdjęcie przedstawia podwórze przy Ogrodowej: na środku stoi ławka, przy bramie przechodzi kobieta z torbą. Przez zmianę kadru każdy wybrał inny temat. Instruktor zestawił odbitki, pokazując, czego zabrakło po odcięciu brzegów. Zajęcia odbywały się w klubowej ciemni. Papieru starczyło na dwie próby dla każdego, dlatego kadry ustalano przed wywołaniem.",
          "byline": "Ewa Lis - Zainteresowania"
        },
        "boardgame-evening": {
          "title": "Pionki do policzenia",
          "body": "W świetlicy Północy przy Lipowej 6 rozegrano sąsiedzki turniej warcabowy. Zgłosiło się osiem par, od uczniów po emerytów. W finale mechanik Stanisław Lis pokonał ucznia technikum Jerzego Mazura. Organizatorzy pożyczyli dodatkowe komplety ze szkoły nr 12, bo klub miał tylko trzy plansze z pełnym zestawem pionków. Udział był bezpłatny. Na kolejne spotkanie gospodarze zapraszają także osoby, które wolą grać bez zapisywania wyniku do tabeli.",
          "byline": "Ewa Lis - Zainteresowania"
        },
        "mineral-display": {
          "title": "Kamienie z podpisami",
          "body": "Koło krajoznawcze szkoły nr 7 przy Kolejowej wystawiło kamienie zebrane podczas wycieczek do żwirowni pod Brzezinami. Nauczycielka Zofia Rataj pomogła rozpoznać granity i krzemienie. Przy kilku okazach pozostawiono znak zapytania; szkoła zwróci się o pomoc do Muzeum Miejskiego. Uczniowie dołączyli mapę miejsc znalezienia. Zbiór nie ma rzadkich minerałów, ale pozwala obejrzeć z bliska materiał, który na co dzień widuje się w podsypce dróg i na polach.",
          "byline": "Ewa Lis - Zainteresowania"
        },
        "radio-aerial": {
          "title": "Antena przy oknie",
          "body": "W pracowni technicznej domu kultury przy Szkolnej Jerzy Kaleta pomaga mieszkańcom ustawić domowe radia. Najczęściej skarżą się lokatorzy nowych bloków na Północy. Przynoszą aparat i opis miejsca, w którym zwykle stoi. W pracowni odbiór bywa dobry, dlatego instruktor nie obiecuje naprawy po samym wysłuchaniu skargi. Sprawdza gniazda i antenę, a potem radzi porównać kilka ustawień w mieszkaniu. Do starszych odbiorników często brakuje przewodu, który zaginął przy przeprowadzce.",
          "byline": "Dział techniczny"
        },
        "typewriter-ribbon": {
          "title": "Oryginał i dwie kopie",
          "body": "Maszynistka biura projektów przy Ogrodowej, Teresa Wrona, pisze większość zestawień w trzech egzemplarzach. Taśma zostawia tekst na pierwszej kartce, a kalka przenosi uderzenia na następne. Gdy ostatnia kopia blednie, trzeba sprawdzić kalkę i siłę pisania, nie tylko wymieniać taśmę. Najwięcej czasu zabierają poprawki cyfr: każdą należy nanieść osobno na wszystkich arkuszach. Dlatego pani Teresa przed rozpoczęciem dużej tabeli prosi autora o sprawdzenie sum na brudnopisie.",
          "byline": "Dział techniczny"
        },
        "tape-index": {
          "title": "Co jest na stronie B",
          "body": "W klubie muzycznym domu kultury przy Szkolnej słuchacze wymieniają spisy audycji nagrywanych z radia. Kaset jest mało, więc jeden koncert potrafi ustąpić miejsca drugiemu, zanim doczeka się odsłuchania. Instruktor proponuje opisywanie obu stron i podawanie wykonawców. Sam tytuł utworu nie wystarcza do rozróżnienia nagrań. Klubowicz Leon Sowa przechowuje rodzinne taśmy osobno. Głosów dzieci nie chce przypadkiem skasować przy nagrywaniu kolejnego wieczornego programu.",
          "byline": "Dział techniczny"
        },
        "bicycle-dynamo": {
          "title": "Światło od koła",
          "body": "Mechanik przy Kolejowej 20 sprawdza oświetlenie rowerów przynoszonych po pracy. Właściciele najczęściej podejrzewają żarówkę, lecz przyczyną bywa luźny przewód albo źle ustawione dynamo. Na stojaku można obejrzeć całą instalację przy obracającym się kole. Części do starszych lamp nie zawsze są dostępne. Mechanik zachowuje sprawne oprawki z rozebranych zestawów i pyta klienta o zgodę na ich użycie. Sama podobna obudowa nie gwarantuje, że wszystko będzie pasować.",
          "byline": "Dział techniczny"
        },
        "slide-projector": {
          "title": "Obraz na jasnej ścianie",
          "body": "Koło krajoznawcze domu kultury przy Szkolnej pokazało przeźrocza z wycieczki do Brzezin. Autorem zdjęć był nauczyciel Stefan Duda. Najwięcej pytań wywołały fotografie młyna i dawnych zabudowań przy poczcie. Na pierwszej próbie tylne rzędy nie widziały szczegółów; po zmniejszeniu obrazu i zasłonięciu bocznych okien pokaz stał się czytelniejszy. Organizatorzy zaprosili mieszkańca Brzezin, który uzupełnił opowieść o nazwiska dawnych właścicieli budynków.",
          "byline": "Dział techniczny"
        },
        "workshop-meter": {
          "title": "Wskazówka na próbę",
          "body": "Drugoklasiści technikum kolejowego przy Kolejowej porównali wskazania mierników używanych podczas ćwiczeń. Każda grupa mierzyła ten sam obwód, lecz odczyty różniły się. Nauczyciel Piotr Jurek poprosił uczniów o zmianę miejsca przy stole. Część rozbieżności zniknęła, gdy wszyscy spojrzeli na skalę na wprost. Pozostałe mierniki sprawdzi pracownia. Ćwiczenie poprzedza praktyki, podczas których uczniowie będą posługiwać się także starszymi przyrządami zakładowymi.",
          "byline": "Dział techniczny"
        },
        "sewing-maintenance": {
          "title": "Maszyna po przeglądzie",
          "body": "Na kurs szycia w domu kultury przy Szkolnej przyjechał mechanik z punktu usługowego na Ogrodowej. Uczestniczki przyniosły osiem domowych maszyn. W kilku wystarczyło poprawić nawleczenie i oczyścić okolice chwytacza, dwie wymagały naprawy w warsztacie. Instruktorka Celina Borek poprosiła o pozostawienie próbnych szwów razem z opisem usterki. Dzięki temu właścicielki będą mogły pokazać problem przy oddawaniu sprzętu, nawet jeśli maszyna akurat zacznie szyć poprawnie.",
          "byline": "Dział techniczny"
        },
        "telephone-display": {
          "title": "Słuchawki z różnych lat",
          "body": "Technikum kolejowe przy Kolejowej wystawiło aparaty telefoniczne wypożyczone przez pracowników łączności. Obok modeli z tarczą znalazł się starszy aparat z korbką, używany dawniej w zakładowej sieci. Monter Józef Król objaśniał, jak zgłaszało się rozmowę telefonistce. Uczniowie oglądali otwarte obudowy i porównywali mechanizmy dzwonków. Wystawę przygotowano dla klas wybierających specjalność. Sprzęt pozostaje odłączony od sieci, więc pokazy nie zakłócają pracy centrali.",
          "byline": "Dział techniczny"
        },
        "record-speed": {
          "title": "Płyta we właściwym tempie",
          "body": "W pracowni domu kultury przy Szkolnej porównano dwa gramofony przyniesione przez członków klubu muzycznego. Ten sam walc na jednym brzmiał wyraźnie wolniej. Instruktor Jerzy Kaleta sprawdził prędkość talerza i skierował aparat do regulacji. Właściciel przez kilka miesięcy przypisywał różnicę zużytej płycie. Klub zamierza urządzić podobny przegląd magnetofonów. Zgłoszenia zbiera portier; przed wizytą trzeba podać model, aby instruktor mógł przygotować odpowiednią dokumentację.",
          "byline": "Dział techniczny"
        },
        "drafting-tools": {
          "title": "Krzywa według wzoru",
          "body": "Uczniowie technikum kolejowego odwiedzili biuro projektów przy Ogrodowej. Kreślarka Irena Walczak pokazała im przygotowanie rysunku części na kalce. Najpierw wyznaczyła punkty ołówkiem, a dopiero potem dobrała krzywik do fragmentów obrysu. Uczniowie znali przyrząd z lekcji, lecz nie widzieli dotąd pracy przeznaczonej do powielenia. Na gotowym arkuszu poprawka była znacznie trudniejsza niż w zeszycie. Wizyta obejmowała także składanie i opisywanie rysunków oddawanych do archiwum.",
          "byline": "Dział techniczny"
        },
        "button-tin": {
          "title": "Pudełko po herbacie",
          "body": "W pasmanterii przy Ogrodowej klientki często szukają jednego guzika do starego płaszcza. Sprzedawczyni Maria Górecka porównuje przyniesiony wzór z zapasem w szufladach. Identyczny odcień bywa nieosiągalny, zwłaszcza gdy pozostałe guziki wyblakły. Wtedy proponuje wymianę całego rzędu albo pary przy mankietach. Przy ladzie stoi pudełko po herbacie z resztkami guzików oddanych przez klientki. Można w nim poszukać brakującej sztuki bez kupowania pełnego kompletu.",
          "byline": "Anna Wrona - Dom i rodzina"
        },
        "sheet-hems": {
          "title": "Pościel na mniejsze łóżko",
          "body": "W punkcie krawieckim przy Ogrodowej 6 przerabia się pościel do dziecięcych łóżek i wąskich tapczanów. Stanisław Bury prosi o zmierzenie materaca razem z bokami; sama szerokość nie wystarczy na podwinięcie prześcieradła. Klienci przynoszą często duże, dobrze zachowane sztuki po starszych krewnych. Z odciętej tkaniny można uszyć poszewkę, jeśli nie jest przetarta. Krawiec pokazuje zużyte miejsca przed krojeniem, żeby nowy szew nie wypadał na osłabionym materiale.",
          "byline": "Anna Wrona - Dom i rodzina"
        },
        "shopping-bag": {
          "title": "Torba z poszewki",
          "body": "Jadwiga Mól z Ogrodowej chodzi na targ przy Kolejowej z torbami uszytymi ze starych poszewek. Pieczywo wkłada osobno od warzyw, a lżejsze zakupy niesie w worku na ramieniu. Szycie takich toreb pokazała sąsiadkom w świetlicy na Północy. Najwięcej poprawek wymagały uchwyty: za wąskie wpijały się w dłoń. Materiał nic nie kosztował, lecz nici i czas trzeba było doliczyć. Pani Jadwiga używa tych samych worków od dwóch lat, piorąc je po powrocie z targu.",
          "byline": "Anna Wrona - Dom i rodzina"
        },
        "leftover-yarn": {
          "title": "Resztki dla początkujących",
          "body": "Koło robótek w domu kultury przy Szkolnej zbiera resztki włóczki na zajęcia dla początkujących. Uczestniczki przynoszą motki, które zostały po swetrach, wraz z próbką gotowej dzianiny. Instruktorka Olga Kania oddziela nitki o różnej grubości. Nie wszystkie nadają się do wspólnej pracy: cienki fragment między grubymi pasami może zmienić kształt całości. Z małych zapasów powstają przede wszystkim czapki i dziecięce kamizelki. Większe rzeczy wymagają dokupienia podobnej włóczki.",
          "byline": "Anna Wrona - Dom i rodzina"
        },
        "repair-evening": {
          "title": "Wieczór z igłą",
          "body": "W świetlicy Północy przy Lipowej 6 odbył się wieczór drobnych napraw odzieży. Krawcowe Helena Mazur i Wanda Górska pomagały mieszkańcom wymieniać zamki oraz skracać rękawy. Przyszło siedemnaście osób, w większości z ubraniami dziecięcymi. Każdy pracował przy własnej rzeczy; nie był to punkt przyjęć zleceń. Dwie maszyny pożyczyły uczestniczki. Gospodarze szukają trzeciej, ponieważ przy wszywaniu zamków powstała kolejka dłuższa niż przy ręcznym cerowaniu.",
          "byline": "Anna Wrona - Dom i rodzina"
        },
        "linen-swap": {
          "title": "Obrus na inny stół",
          "body": "Na wymianie tkanin w świetlicy Północy przy Lipowej 6 znalazły nowych właścicieli obrusy, zasłony i poszewki. Organizatorka Jadwiga Mól poprosiła o wypranie rzeczy i podanie wymiarów. Nie przyjmowano materiałów z przetartym środkiem, których nie dałoby się sensownie przerobić. Długi obrus pani Rybickiej trafił do rodziny z rozkładanym stołem; w zamian dostała dwie zasłony do kuchni. Niewymienione rzeczy właściciele zabrali, więc świetlica nie musiała urządzać magazynu.",
          "byline": "Anna Wrona - Dom i rodzina"
        },
        "recipe-index": {
          "title": "Zeszyt odzyskał spis",
          "body": "Koło gospodarstwa domowego przy Szkolnej uporządkowało przepisy zbierane przez dziesięć lat. Prowadząca Anna Sarna wykreśliła powtórzenia i poprosiła autorki o uzupełnienie brakujących ilości. Najwięcej kłopotu sprawiały miary zapisane jako szklanka lub garść. Przy wspólnym gotowaniu porównano używane naczynia. Powstał zeszyt trzydziestu sprawdzonych dań dla czterech osób. Uczestniczki mogą przepisywać przepisy na miejscu; papieru wystarczyło dotąd tylko na jeden wspólny egzemplarz.",
          "byline": "Anna Wrona - Dom i rodzina"
        },
        "curtain-measure": {
          "title": "Firanka na właściwe okno",
          "body": "Kursantki szycia w domu kultury przy Szkolnej uszyły firanki do sali prób chóru. Tkaninę przekazali rodzice jednej z uczestniczek po zmianie mieszkania. Była za krótka na pełne okna, więc instruktorka zaproponowała zazdrostki mocowane poniżej klamek. Pozostały zapas wykorzystano przy drzwiach z oszkloną górą. Chórzyści pomagali wieszać gotowe części. Sala zachowała dzienne światło, a przechodnie nie zaglądają już wprost na osoby ćwiczące przy oknie.",
          "byline": "Anna Wrona - Dom i rodzina"
        },
        "patchwork-cover": {
          "title": "Narzuta ze skrawków",
          "body": "Koło robótek świetlicy Północ przy Lipowej 6 uszyło narzutę na wysłużoną kanapę. Mieszkańcy przynieśli skrawki grubych tkanin po skracaniu zasłon i szyciu spódnic. Cienkie podszewki odłożono, bo nie wytrzymałyby takiego użytkowania. Nad układem i zszywaniem pracowało sześć kobiet przez trzy spotkania. Narzuta daje się zdejmować do prania i kosztowała jedynie nici. Spółdzielnia nie przewiduje w tym roku wymiany kanapy, której drewniany szkielet jest jeszcze dobry.",
          "byline": "Anna Wrona - Dom i rodzina"
        },
        "shopping-notes": {
          "title": "Lista z dwóch stron",
          "body": "Na spotkanie o wydatkach w świetlicy Północy przy Lipowej 6 uczestniczki przyniosły rachunki z jednego tygodnia. Prowadząca Anna Sarna oddzieliła zakupy codzienne od zapasów, które wystarczą na miesiąc. Bez tego zestawienia rodziny o podobnych dochodach wyglądały na zupełnie różnie gospodarujące. Najwięcej rozmów dotyczyło dojazdów po tańszy towar. Cena zakupu nie obejmowała biletu ani czasu spędzonego w kolejce. Uczestniczki uwzględnią oba wydatki przy następnym porównaniu.",
          "byline": "Anna Wrona - Dom i rodzina"
        },
        "shared-landing": {
          "title": "Półka na półpiętrze",
          "body": "Na półpiętrze domu przy Stolarskiej 8 stoi półka z roślinami należącymi do trzech rodzin. Największy fikus nie mieścił się w mieszkaniu pani Wandy Lis. Przy oknie klatki znalazł więcej miejsca, ale opiekę trzeba było uzgodnić z sąsiadami. Pani Wanda podlewa, lokator z piętra obraca donice przy myciu okna. W czasie urlopów zastępuje ich gospodarz domu. Na podłodze nie stawia się niczego: po tych schodach codziennie znosi się dziecięcy wózek.",
          "byline": "Anna Wrona - Dom i rodzina"
        },
        "folding-table": {
          "title": "Stół na większą rodzinę",
          "body": "Państwo Rybiccy z osiedla Północ mają rozkładany stół, choć na co dzień jedzą przy nim tylko we dwoje. Na imieniny przyjeżdżają dzieci z rodzinami. Dodatkowy blat trzymają za szafą, krzesła pożyczają z sąsiedniego mieszkania. Gospodyni przygotowuje część potraw dzień wcześniej, bo po rozłożeniu stołu trudno przejść z kuchni. Meble kupiono jeszcze do poprzedniego, większego pokoju. Zmiana mieszkania zmniejszyła miejsce przy stole, ale nie liczbę zapraszanych gości.",
          "byline": "Anna Wrona - Dom i rodzina"
        },
        "window-sill": {
          "title": "Parapet ma swoje strony",
          "body": "Zofia Kurek z kwiaciarni na Północy pyta klientów, na którą stronę wychodzą ich okna. Roślina wybrana wyłącznie z wystawy może źle znosić ciemny pokój albo suche miejsce nad kaloryferem. Do małych mieszkań sprzedaje się przede wszystkim niewielkie sadzonki. Florystka uprzedza jednak, ile miejsca zajmie dorosły okaz. Klienci przynoszą liście do rozpoznania i pytają o ziemię. Część roślin krąży między sąsiadami od lat, bez etykiet i zapamiętanych nazw.",
          "byline": "Anna Wrona - Dom i rodzina"
        },
        "family-bookshelf": {
          "title": "Książki na dwa rzędy",
          "body": "Bielscy z Kolejowej zbierają książki od czasów studenckich. Regał w przedpokoju mieści je w dwóch rzędach, dlatego rzadziej używane tomy trudno wydobyć bez zdejmowania pozostałych. Gospodarz wpisał zawartość tylnych rzędów na kartkach przy półkach. Podręczniki dzieci stoją osobno, bliżej biurka. Część księgozbioru rodzina oddaje bibliotece przy Kolejowej. Zostawia książki, do których wraca, a nie wszystkie kupione kiedyś tomy jednej serii.",
          "byline": "Anna Wrona - Dom i rodzina"
        },
        "room-divider": {
          "title": "Regał podzielił pokój",
          "body": "Państwo Bielscy z Kolejowej wydzielili córce miejsce do nauki w jedynym dużym pokoju. Regał odsunęli od ściany, ustawiając za nim biurko. Wieczorem jedna osoba może czytać przy lampce, gdy pozostali słuchają radia. Nie udało się odgrodzić hałasu, więc rodzina uzgodniła godziny ciszy przed sprawdzianami. Stolarz przymocował regał, aby nie przewrócił się przy wysuwaniu książek. Młodszy syn nadal odrabia lekcje przy kuchennym stole.",
          "byline": "Anna Wrona - Dom i rodzina"
        },
        "stairwell-curtains": {
          "title": "Okno wspólnej klatki",
          "body": "Mieszkańcy Ogrodowej 9 usunęli donice stojące przy zakręcie schodów. O przestawienie prosił lokator, który wnosi wózek z zakupami dla chorej żony. Rośliny rozdzielono między mieszkania, dwie mniejsze pozostały na szerokim parapecie. Gospodarz domu Jan Rybak przypomniał, że trzeba zostawić dostęp do okna na czas mycia. Sprawę załatwiono podczas spotkania lokatorów, bez zamawiania nowych półek. Donice na podłogę już nie wróciły.",
          "byline": "Anna Wrona - Dom i rodzina"
        },
        "furniture-plan": {
          "title": "Miara przed zakupem",
          "body": "Stolarz przy Stolarskiej 5 pomógł rodzinie Mólów dopasować szafę do wnęki w nowym mieszkaniu na Północy. Wymiary korpusu się zgadzały, lecz drzwi zatrzymywały się na ścianie i blokowały dolną szufladę. Zamiast przerabiać cały mebel, stolarz zmienił kierunek otwierania jednego skrzydła. Trzeba było też skrócić listwę przy podłodze. Mólowie uniknęli zakupu nowej szafy. Przed przewiezieniem pozostałych mebli sprawdzili już nie tylko ich szerokość, lecz także miejsce na otwieranie.",
          "byline": "Anna Wrona - Dom i rodzina"
        },
        "plant-cuttings": {
          "title": "Sadzonka z nazwiskiem",
          "body": "W świetlicy Północ przy Lipowej 6 wymieniano sadzonki zielistek, pelargonii i trzykrotek. Zofia Kurek z osiedlowej kwiaciarni pomagała rozpoznać rośliny i dobrać wielkość doniczek. Przyszło ponad dwadzieścia osób; większość przyniosła po kilka ukorzenionych sadzonek. Przy doniczkach zostawiano nazwisko dawnego właściciela, żeby można było później zapytać go o podlewanie. Pozostałe po wymianie okazy ozdobią salę świetlicy. Opiekę nad nimi przejęły dwie stałe uczestniczki zajęć.",
          "byline": "Anna Wrona - Dom i rodzina"
        },
        "child-desk": {
          "title": "Biurko po starszej siostrze",
          "body": "Stolarnia przy Stolarskiej 5 przerobiła biurko odziedziczone przez Pawła Mazura po starszej siostrze. Chłopiec, uczeń szkoły nr 7, nie sięgał stopami podłogi i pisał z wysoko uniesionymi ramionami. Obniżono nogi mebla, pozostawiając szuflady i blat. Siostra korzysta już z większego stołu w internacie technikum. Rodzice zapłacili za przeróbkę znacznie mniej niż za nowe biurko. Przed wykończeniem rodzice przyprowadzili syna na przymiarkę. Sprawdzono także, czy pod szufladami zostaje dość miejsca na kolana.",
          "byline": "Anna Wrona - Dom i rodzina"
        },
        "coat-hooks": {
          "title": "Wieszak na dobrej wysokości",
          "body": "Świetlica Północ przy Lipowej 6 ma nowe wieszaki dla dzieci. Dotychczas najmłodsi uczestnicy zajęć kładli płaszcze na krzesłach, bo nie sięgali do wspólnej listwy. Niższą wykonano z drewna pozostałego po naprawie półek; haczyki przekazał lokator z osiedla. Obok zawieszono kieszeń na zgubione rękawiczki. Gospodyni Celina Lis prosi rodziców o ich przejrzenie przy odbiorze dzieci. Do dorosłych wieszaków można teraz dojść bez przekładania sterty kurtek.",
          "byline": "Anna Wrona - Dom i rodzina"
        },
        "soup-ladle": {
          "title": "Obiad na dwie zmiany",
          "body": "Stołówka warsztatów kolejowych przy Kolejowej wydaje obiad podczas dwóch przerw w pracy. Kucharka Helena Bury przygotowuje porcje tak, by druga zmiana dostała ten sam zestaw co pierwsza. Zupa pozostaje w kuchni, a do okienka trafiają mniejsze naczynia uzupełniane w miarę kolejki. Najtrudniej przewidzieć liczbę gości przy zamianach służb. Kierowniczka prosi brygadzistów o wcześniejsze zgłoszenia, bo nadmiaru ugotowanych porcji nie da się po prostu odłożyć na następny dzień.",
          "byline": "Anna Wrona - Handel"
        },
        "market-scales": {
          "title": "Jabłka z rodzinnego sadu",
          "body": "Na targowisku przy Kolejowej Maria Kurek z Brzezin sprzedaje jabłka z rodzinnego sadu. Osobno układa owoce deserowe i te przeznaczone na szarlotkę. Kupujący pytają najczęściej o cenę, dopiero później o odmianę. Sprzedawczyni pokazuje przekrojone jabłko, żeby można było ocenić miąższ. Drobniejsze owoce są tańsze, lecz przy obieraniu zostaje z nich więcej odpadków. Stali klienci zamawiają większe ilości przed przyjazdem na targ, aby nie przewozić skrzynek bez potrzeby.",
          "byline": "Anna Wrona - Handel"
        },
        "canteen-tray": {
          "title": "Taca wraca do okienka",
          "body": "W barze mlecznym przy dworcu na Kolejowej taca wraca do okienka szybciej niż sam klient wychodzi z lokalu. Podróżni zostają przy herbacie, czekając na połączenie. Kierowniczka Anna Bąk nie pogania ich, dopóki nie zaczyna brakować miejsc. Największy ruch przypada między pociągami podmiejskimi. Naczynia zbiera wtedy dodatkowa pracownica, która zwykle pomaga w kuchni. Bar ma mały zapas szklanek; sprawne mycie decyduje, czy kolejni goście dostaną napój od razu.",
          "byline": "Anna Wrona - Handel"
        },
        "family-dumplings": {
          "title": "Pierogi w kilka par rąk",
          "body": "Helena Bury z Kolejowej lepi pierogi dla dużej rodziny, choć na co dzień gotuje w stołówce. W domu korzysta ze starego zeszytu, do którego córka dopisuje dokładne ilości składników. Podane przez matkę trzy szklanki mąki okazały się inną miarą niż w nowym naczyniu córki. Podczas wspólnego gotowania porównały porcje i poprawiły zapis. Farsz z ziemniaków i twarogu przygotowują wcześniej; przy stole zostaje samo wałkowanie, nakładanie i lepienie w kilka par rąk.",
          "byline": "Anna Wrona - Handel"
        },
        "bakery-visitors": {
          "title": "Chleb przed świtem",
          "body": "Klasa ósma szkoły nr 7 przy Kolejowej odwiedziła piekarnię przy Ogrodowej. Była to część zajęć pomagających wybrać zawód. Mistrz Jan Wrona pokazał piec, stoły i pomieszczenie, w którym ciasto czeka przed wypiekiem. Uczniowie przyszli po nocnej produkcji, gdy chleby ładowano do samochodów. Pytali o godziny pracy i długość nauki. Piekarz mówił także o sprzątaniu oraz noszeniu worków, których nie widać klientowi odbierającemu gotowy bochenek w sklepie.",
          "byline": "Anna Wrona - Handel"
        },
        "recipe-contest": {
          "title": "Przepis z dopiskiem",
          "body": "Helena Bury z Kolejowej wygrała konkurs potraw ziemniaczanych w świetlicy Północ przy Lipowej 6. Przygotowała zapiekankę z cebulą i twarogiem. Osiem uczestniczek oceniało nawzajem smak, koszt oraz czas potrzebny na danie. Porcje podano w jednakowych naczyniach bez nazwisk autorek. Zwyciężczyni zgodziła się udostępnić przepis wraz z ilościami na cztery osoby. Można go przepisać u gospodyni świetlicy; pozostałe receptury zostaną uzupełnione po przeliczeniu składników.",
          "byline": "Anna Wrona - Handel"
        },
        "school-sandwiches": {
          "title": "Śniadanie z własnej torby",
          "body": "Czwartoklasiści szkoły nr 12 uszyli na zajęciach praktycznych woreczki na drugie śniadanie. Materiał przynieśli rodzice: głównie kawałki płótna po szyciu pościeli. Nauczycielka Celina Borek pomogła dobrać rozmiar do pudełek i zawiniętych kanapek. Woreczki mają zastąpić luźne pakunki mieszające się w tornistrach z zeszytami. Po tygodniu dzieci wróciły z poprawkami. W kilku sztukach trzeba było wzmocnić szwy i poszerzyć otwór, aby łatwiej wkładało się śniadanie.",
          "byline": "Anna Wrona - Handel"
        },
        "market-baskets": {
          "title": "Zakupy czekają przy ladzie",
          "body": "Na targu przy Kolejowej sprzedawcy coraz częściej odkładają zakupy do odbioru przed wyjściem klienta. Starsi kupujący nie muszą dzięki temu nosić ciężkiego kosza między stoiskami. Maria Kurek przyjmuje tak jabłka, sąsiedni sprzedawca ziemniaki. Pakunki oznaczają nazwiskiem i już zapłaconą kwotą. Zdarzają się jednak pomyłki przy odbiorze podobnych toreb. Gospodarz placu przypomina, by sprawdzić zawartość na miejscu; targowisko nie ma wspólnej przechowalni zakupów.",
          "byline": "Anna Wrona - Handel"
        },
        "tea-service": {
          "title": "Filiżanki nie do pary",
          "body": "Świetlica Północ przy Lipowej 6 otrzymała od mieszkańców siedemnaście filiżanek ze spodkami. Zestawów nie da się ułożyć według wzoru, ale starczą na herbatę podczas spotkań seniorów. Dotychczas goście przynosili własne kubki albo czekali na umycie kilku wspólnych. Gospodyni Celina Lis przyjęła tylko naczynia bez pęknięć i wyszczerbień. Filiżanki stoją w zamykanej szafce obok czajnika. Po spotkaniu każdy myje swoją, a ostatnia para dyżurnych sprawdza, czy komplet wrócił na półkę.",
          "byline": "Anna Wrona - Handel"
        },
        "potato-varieties": {
          "title": "Ziemniak ma swoją nazwę",
          "body": "Działkowcy ogrodu Zacisze przy Ogrodowej porównali ziemniaki od trzech gospodarzy z Brzezin. Próbki ugotowano osobno i podano bez dodatków. Jedne rozpadały się łatwo, inne zachowywały kształt po pokrojeniu. Spotkanie miało pomóc przy wspólnym zamówieniu większego zapasu. Nie wybrano jednej odmiany dla wszystkich: część rodzin chce ziemniaki na kluski, część do zup i sałatek. Listę zamówień zbiera gospodarz ogrodu, który uzgodni z rolnikami termin dostawy.",
          "byline": "Anna Wrona - Handel"
        },
        "tram-terminus": {
          "title": "Kilka minut na pętli",
          "body": "Na pętli Północ motorniczowie linii 4 mają kilka minut przed powrotem do centrum. W tym czasie pasażerowie kupują bilety w kiosku i zajmują miejsca. Helena Lis, kioskarka, odkłada gazety dla kierowców autobusów dowożących ludzi z obrzeży. Nie zawsze zdążą po nie przyjść: późny przyjazd oznacza odjazd niemal bez postoju. Największy ruch zaczyna się przed poranną zmianą. Po dziewiątej ławki zajmują głównie emeryci jadący na zakupy przy Kolejowej.",
          "byline": "Ewa Lis - Miasto i region"
        },
        "luggage-label": {
          "title": "Walizka z karteczką",
          "body": "Przechowalnia na dworcu przy Kolejowej obsługuje przede wszystkim podróżnych przyjeżdżających załatwić sprawy w mieście. Zostawiają walizki, worki i paczki, których nie chcą nosić po urzędach. Bagażowy Henryk Socha przypina numer do każdego przyjętego pakunku, drugi odcinek wydaje właścicielowi. Wieczorem najwięcej pracy przypada przed pociągami podmiejskimi. Klienci przychodzą po rzeczy w ostatniej chwili, a kolejka do wydawania potrafi zająć kilka cennych minut.",
          "byline": "Ewa Lis - Miasto i region"
        },
        "railway-porter": {
          "title": "Wózek zna każdy próg",
          "body": "Henryk Socha przewozi bagaże na dworcu przy Kolejowej od dwudziestu lat. Zna drogę na perony bez schodów, choć prowadzi dalej niż zwykłe przejście dla podróżnych. Na wózku najpierw układa ciężkie kufry, potem torby. Zanim ruszy, prosi właściciela o policzenie pakunków i wskazanie wagonu. Najwięcej pomocy potrzebują rodziny z dziećmi i osoby przywożące towar na targ. Bagażowy nie zawsze zdąży wrócić do hali przed nadejściem następnego pociągu.",
          "byline": "Ewa Lis - Miasto i region"
        },
        "bus-ticket-book": {
          "title": "Bilet w małym okienku",
          "body": "W kasie autobusów podmiejskich przy dworcu na Kolejowej Maria Lesiak pyta pasażera także o godzinę powrotu. Bilet do Brzezin nie zawsze oznacza ten sam przystanek: część osób jedzie pod pocztę, inni do gospodarstw za młynem. Starsi mieszkańcy używają nazw, których nie ma w drukowanym rozkładzie. Kasjerka trzyma za szybą własną listę takich określeń. Najdłuższe rozmowy prowadzi z przyjezdnymi szukającymi krewnych na podstawie starego adresu.",
          "byline": "Ewa Lis - Miasto i region"
        },
        "route-map": {
          "title": "Mapa dla przyjezdnych",
          "body": "Uczniowie szkoły nr 7 przy Kolejowej przygotowali dla rodziców plan dojścia z dworca do szkoły. Powstał przed spotkaniem rodzin dzieci dojeżdżających spoza miasta. Zaznaczono dwa przejścia dla pieszych i wejście od podwórza, niewidoczne z głównej ulicy. Woźny sprawdził trasę z rodzicem, który był w szkole pierwszy raz. Po tej próbie dopisano numer bramy. Odbitki planu dołączono do zaproszeń, aby goście nie musieli szukać sekretariatu w sąsiednim budynku.",
          "byline": "Ewa Lis - Miasto i region"
        },
        "commuter-survey": {
          "title": "Przesiadka w zeszycie",
          "body": "Pasażerowie pociągu z Brzezin piszą o przesiadce na tramwaj linii 4 przy dworcu na Kolejowej. Rozkład pozostawia cztery minuty, a przejście z dalszego peronu zajmuje im co najmniej sześć. Szczególnie trudno zdążyć osobom z zakupami i dziecięcymi wózkami. Redakcja przekazała list do przedsiębiorstwa komunikacji. W odpowiedzi zapowiedziano pomiar drogi w godzinach porannych. Do czasu uzgodnienia rozkładów pasażerowie muszą liczyć się z oczekiwaniem na następny tramwaj.",
          "byline": "Ewa Lis - Miasto i region"
        },
        "bicycle-rack": {
          "title": "Miejsce przy bramie",
          "body": "Przy warsztatach kolejowych na Kolejowej przestawiono stojak rowerowy bliżej portierni. Pracownicy prosili o zmianę, ponieważ poprzednio rowery zastawiały wejście do magazynu. Nowe miejsce osłania daszek, ale mieści tyle samo pojazdów. Podczas porannej zmiany nadal brakuje stanowisk dla kilku osób. Rada zakładowa zbiera liczbę dojeżdżających rowerem przed zamówieniem drugiego stojaka. Do tego czasu kierownictwo udostępniło fragment ogrodzenia od strony podwórza.",
          "byline": "Ewa Lis - Miasto i region"
        },
        "station-signs": {
          "title": "Strzałka z drugiej strony",
          "body": "Na dworcu przy Kolejowej przeniesiono tablicę wskazującą poczekalnię. Podróżni wychodzący z tunelu widzieli dawniej jej tył i kierowali się do kas, gdzie musieli pytać o drogę. Nowy uchwyt pozwala odczytać napis z obu stron korytarza. Zmianę potwierdził nasz czytelnik Edward Mól, który zgłosił problem w liście do redakcji. Zawiadowca zapowiedział przegląd pozostałych oznaczeń. Dotyczy to także dojścia do przechowalni, częściowo zasłoniętego przez kiosk.",
          "byline": "Ewa Lis - Miasto i region"
        },
        "walking-club": {
          "title": "Trasa według kroków",
          "body": "Koło krajoznawcze przy Szkolnej przeszło trasę z pętli Północ do przystanku w Brzezinach. Prowadzący Stefan Duda sprawdzał opis używany podczas rodzinnych wycieczek. Brakowało w nim rozwidlenia przy młynie, gdzie łatwo zejść w stronę pól. Nowy opis podaje charakterystyczne budynki i orientacyjne czasy dla spokojnego marszu. Uczestnicy zmierzyli też drogę powrotną do autobusu. Kartki z trasą można otrzymać w sekretariacie domu kultury przy Szkolnej.",
          "byline": "Ewa Lis - Miasto i region"
        },
        "tram-model": {
          "title": "Wagon na szkolnym stole",
          "body": "Uczniowie technikum kolejowego przy Kolejowej zbudowali model wagonu tramwajowego dla szkolnej pracowni. Wymiary zbierali na pętli Północ za zgodą obsługi. Zdjęty dach pozwala zobaczyć rozmieszczenie siedzeń, drzwi i stanowisko motorniczego. Model nie ma silnika; służy do omawiania budowy pojazdu. Opiekun Piotr Jurek chce wykorzystać go również podczas dni otwartych dla kandydatów. Wykonawcy dołączyli rysunki, aby następny rocznik mógł dorobić wagon doczepny.",
          "byline": "Ewa Lis - Miasto i region"
        },
        "cloakroom-tokens": {
          "title": "Numerek do kieszeni",
          "body": "Szatnię kina Świt prowadzi od lat Maria Bury. Przed wieczornym seansem obsługuje gości z kilku zakładów, często przychodzących niemal jednocześnie. Płaszcze wiesza według numerków, a nakrycia głowy kładzie nad odpowiednim haczykiem. Najwięcej czasu zabierają zgubione żetony. Właściciel musi opisać okrycie i poczekać, aż pozostali odbiorą swoje rzeczy. Pani Maria prosi, by numerka nie wkładać do kieszeni oddawanego płaszcza; takie pomyłki zdarzają się nawet stałym widzom.",
          "byline": "Ewa Lis - Dział miejski"
        },
        "letter-carrier": {
          "title": "Adres znany od lat",
          "body": "Listonosz Roman Lis obsługuje kamienice przy Kolejowej, w których część mieszkań ma kilku najemców. Na skrzynkach bywa tylko nazwisko głównego lokatora. Przesyłki do pozostałych wracają do urzędu, jeśli nie da się ustalić odbiorcy. Lis prosi o dopisywanie nazwisk, również przy wejściach do oficyn. Sama znajomość mieszkańców nie wystarcza podczas zastępstwa. Nowy doręczyciel ma ten sam adres na kopercie, lecz nie zna wszystkich rodzinnych i sąsiedzkich powiązań.",
          "byline": "Ewa Lis - Dział miejski"
        },
        "barber-mirror": {
          "title": "Rozmowa przed lustrem",
          "body": "U fryzjera Pawła Jury przy Kolejowej 24 najdłuższa kolejka jest przed wolną niedzielą. Klienci z warsztatów przychodzą po zmianie, odkładają czapki i czytają gazetę przy wieszaku. Mistrz obsługuje sam, więc nie przyjmuje zapisów na dokładną godzinę. Strzyżenie dzieci zostawia zwykle na spokojniejsze przedpołudnia. Stałych gości pyta o poprawki do poprzedniej fryzury. Rozmowy o piłce urywają się przy goleniu, kiedy klient musi przez chwilę siedzieć bez ruchu.",
          "byline": "Ewa Lis - Dział miejski"
        },
        "porter-ledger": {
          "title": "Wiadomość u portiera",
          "body": "Portier domu kultury przy Szkolnej, Józef Leśniak, przyjmuje wiadomości dla instruktorów i uczestników zajęć. Niewielu ma telefon w domu, więc zmiana godziny próby oznacza zostawienie kartki albo osobistą wizytę. Leśniak wpisuje nazwisko odbiorcy oraz grupę. Samo imię często nie wystarcza: na zajęciach muzycznych są trzy Anny. Nie przekazuje wiadomości przez przypadkowych gości. Przy wejściu leży zeszyt, do którego stali bywalcy zaglądają przed pójściem do sali.",
          "byline": "Ewa Lis - Dział miejski"
        },
        "lost-glasses": {
          "title": "Okulary znalazły drogę",
          "body": "Okulary zostawione w czytelni filii nr 6 przy Kolejowej odebrał emerytowany stolarz Wacław Duda. O ogłoszeniu dowiedział się od sąsiada, który rozpoznał opis etui. Bibliotekarka Janina Wolska poprosiła o dodatkowy szczegół; właściciel wskazał łatkę przyszytą od środka. W czytelni pozostają jeszcze dwie pary rękawiczek i parasol. Można pytać o nie przy ladzie. Pracownicy proszą o podawanie dnia wizyty, co ułatwia ustalenie, która rzecz należy do zgłaszającego.",
          "byline": "Ewa Lis - Dział miejski"
        },
        "queue-seats": {
          "title": "Krzesła przy okienku",
          "body": "Punkt napraw sprzętu domowego przy Ogrodowej 14 zmienił układ poczekalni po liście naszej czytelniczki. Krzesła stały naprzeciw lady, zostawiając za mało miejsca na odbiór większych aparatów. Teraz część siedzeń znajduje się przy bocznej ścianie, a pakunki można odłożyć na niskim stole. Miejsc do siedzenia jest tyle samo, a dojście do zaplecza pozostaje wolne. Klienci z maszynami do szycia nie muszą już przeciskać się między kolanami oczekujących.",
          "byline": "Ewa Lis - Dział miejski"
        },
        "family-photo-names": {
          "title": "Kto stoi obok ciotki",
          "body": "Seniorzy świetlicy Północ przy Lipowej 6 opisali fotografie z dawnych wycieczek warsztatów kolejowych. Odbitki przyniosła Celina Rak, córka zakładowego fotografa. Na zdjęciach rozpoznano kilkunastu pracowników i autokar należący niegdyś do zakładu. Nie ustalono miejsca jednego postoju nad rzeką. Kopia tej fotografii wisi w świetlicy z prośbą o pomoc. Oryginał wrócił do rodziny wraz z nazwiskami i uwagami uczestników spotkania, spisanymi na osobnych kartach.",
          "byline": "Ewa Lis - Dział miejski"
        },
        "returning-umbrella": {
          "title": "Parasol wrócił do kina",
          "body": "Do szatni kina Świt wrócił parasol omyłkowo zabrany po wieczornym seansie. Właściciel podobnego, stolarz Wacław Duda, zauważył różnicę dopiero w domu: jego rączka była naprawiana. Szatniarka odnalazła drugi parasol wśród pozostawionych rzeczy. Obaj widzowie odzyskali swoją własność po porównaniu opisów. Kierownik kina prosi o oddawanie parasoli razem z płaszczem pod jednym numerkiem. Dotychczas część gości zostawiała je bez oznaczenia przy drzwiach sali.",
          "byline": "Ewa Lis - Dział miejski"
        },
        "market-bench": {
          "title": "Ławka przesunięta o krok",
          "body": "Ławkę przy wyjściu z targowiska na Kolejowej przeniesiono pod ścianę pawilonu. Prosili o to starsi klienci, którym przejeżdżające wózki utrudniały odpoczynek i ustawianie toreb. Gospodarz placu uzgodnił miejsce ze sprzedawcami, zostawiając wolne przejście do stoisk. Daszek pawilonu osłania teraz siedzących przed deszczem. Czytelniczka Jadwiga Mól zwraca uwagę na brak drugiej ławki od strony przystanku. Administracja targu odpowiada, że szuka dla niej miejsca poza drogą dostaw.",
          "byline": "Ewa Lis - Dział miejski"
        },
        "address-correction": {
          "title": "Dwa wejścia, jeden list",
          "body": "Listy do Wandy Lis ze Stolarskiej 8 trafiały do lokatora frontowego budynku zamiast do oficyny. Oba wejścia miały mieszkanie nr 4, a na kopertach brakowało dodatkowego oznaczenia. Po interwencji czytelniczki administracja ujednoliciła tablice: front oznaczono literą A, oficynę B. Pani Lis zawiadomiła nadawców o pełnym adresie. Listonosz potwierdza, że samo nowe oznaczenie na drzwiach nie poprawiłoby korespondencji wysyłanej według dawnych danych.",
          "byline": "Ewa Lis - Dział miejski"
        },
        "chalk-board": {
          "title": "Tablica przed lekcją",
          "body": "W szkole nr 12 przy Szkolnej nauczycielka Jadwiga Sikora zostawia na tablicy wzór pisania daty i tematu. Pierwszoklasiści przepisują go przed rozpoczęciem ćwiczeń. Część dzieci potrzebuje więcej czasu, więc kolejnego zadania nie zapisuje się od razu w tym samym miejscu. W klasie stoją ławki o różnej wysokości; najmniejsi uczniowie siedzą bliżej tablicy. Sikora podkreśla, że pośpiech przy przepisywaniu utrudnia potem sprawdzenie, czy dziecko rozumie polecenie.",
          "byline": "Marek Boruta - Oświata"
        },
        "exercise-book": {
          "title": "Margines na poprawkę",
          "body": "Maria Bielecka ze szkoły nr 12 prosi starszych uczniów o oddawanie wypracowań razem z brudnopisem. W ostatecznej wersji widzi poprawne zdanie, ale nie wie, ile razy trzeba było je zmienić. Podczas rozmowy uczeń wyjaśnia, dlaczego skrócił opis albo przestawił kolejność wydarzeń. Nie każdy chętnie pokazuje skreślenia. Nauczycielka nie ocenia wyglądu brudnopisu; zależy jej na samodzielnej pracy, której nie widać w zeszycie przepisanym przez kogoś z rodziny.",
          "byline": "Marek Boruta - Oświata"
        },
        "school-map": {
          "title": "Mapa wraca do tuby",
          "body": "W szkole nr 7 przy Kolejowej jedna mapa regionu służy czterem klasom. Nauczycielka Zofia Rataj przenosi ją między salami, ponieważ tylko pracownia geograficzna ma stały uchwyt. Zwijane płótno przeciera się przy krawędziach, a drobne oznaczenia są słabo widoczne z tyłu. Na ćwiczenia uczniowie dostają więc ręcznie powielone fragmenty. Szkoła zamówiła nową mapę, lecz czeka na dostawę. Stara pozostaje potrzebna do lekcji o dojazdach i gospodarce okolic miasta.",
          "byline": "Marek Boruta - Oświata"
        },
        "evening-students": {
          "title": "Zeszyt po pracy",
          "body": "Wieczorowe technikum przy Kolejowej przyjmuje pracowników warsztatów, magazynów i zakładów z przedmieść. Na pierwszą lekcję część słuchaczy dociera prosto ze zmiany. Nauczyciel matematyki Adam Ruta prowadzi raz w tygodniu konsultacje dla tych, którzy opuścili zajęcia z powodu służby. Trudno dobrać jedną godzinę dla wszystkich. Ostatni autobus do Brzezin odjeżdża przed końcem konsultacji, więc dojeżdżający wymieniają rozwiązania z kolegami podczas następnego spotkania.",
          "byline": "Marek Boruta - Oświata"
        },
        "spelling-contest": {
          "title": "Dyktando z komentarzem",
          "body": "Konkurs ortograficzny szkoły nr 12 wygrała siódmoklasistka Joanna Mazur. W dyktandzie dla 28 uczestników nie popełniła błędu; następne dwie osoby miały po jednej pomyłce. Polonistka Maria Bielecka omówiła najtrudniejsze słowa na wspólnych zajęciach po konkursie. Nagrodą dla zwyciężczyni był słownik przekazany przez komitet rodzicielski. Szkoła chce wysłać reprezentację na przegląd miejski, ale najpierw musi uzgodnić termin z zajęciami uczniów dojeżdżających.",
          "byline": "Marek Boruta - Oświata"
        },
        "school-garden-plan": {
          "title": "Grządka na papierze",
          "body": "Uczniowie klasy szóstej szkoły nr 7 przy Kolejowej zmierzyli ogródek za salą gimnastyczną. Plan posłuży do podziału grządek między klasy. Jedna grupa doliczyła szerokość ścieżki do obu sąsiednich działek, przez co przy składaniu pomiarów zabrakło miejsca przy płocie. Nauczycielka Zofia Rataj powtórzyła z nimi ten odcinek. Po poprawce wyznaczono sześć równych grządek i wspólny pas na narzędzia. Młodsze klasy będą korzystać z ogródka razem ze starszymi opiekunami.",
          "byline": "Marek Boruta - Oświata"
        },
        "reading-pairs": {
          "title": "Starszy czyta młodszemu",
          "body": "Biblioteka szkoły nr 12 podsumowała miesiąc wspólnego czytania pierwszo- i siódmoklasistów. Dwanaście starszych dzieci spotykało się z młodszymi po lekcjach, gdy ci czekali w świetlicy na rodziców. Książki wybierała bibliotekarka, a pary uzgadniały fragment do przeczytania. Największe zainteresowanie wzbudziły opowiadania o zwierzętach. Starsi uczniowie przygotowują teraz prostsze teksty dla dzieci, które chcą czytać samodzielnie, lecz gubią się na gęsto zadrukowanej stronie.",
          "byline": "Marek Boruta - Oświata"
        },
        "geometry-models": {
          "title": "Bryła z rozłożonej kartki",
          "body": "Piątoklasiści szkoły nr 7 przy Kolejowej wykonali na lekcje geometrii modele sześcianów i ostrosłupów. Karton po opakowaniach przynieśli rodzice pracujący w sklepach. Nauczyciel Adam Ruta poprosił o pozostawienie jednej ściany otwieranej, aby można było obejrzeć wnętrze bryły. Część modeli nie zamknęła się równo: zakładki do klejenia odjęto omyłkowo od wymiarów ścian. Po poprawieniu wykrojów powstał komplet, z którego będą korzystać również równoległe klasy.",
          "byline": "Marek Boruta - Oświata"
        },
        "school-newspaper": {
          "title": "Szkolne koła w gazetce",
          "body": "Szkoła nr 12 wydała czterostronicową gazetkę o zajęciach pozalekcyjnych. Siódmoklasiści przeprowadzili rozmowy z trenerem tenisa stołowego, bibliotekarką i woźnym opiekującym się salą po lekcjach. Teksty przepisano w sekretariacie i powielono w trzydziestu egzemplarzach. Redakcja musiała skrócić relację sportową, żeby zmieścić godziny spotkań wszystkich kół. Gazetkę można czytać w bibliotece szkolnej. Następny numer ma przedstawić zawody wykonywane przez rodziców uczniów.",
          "byline": "Marek Boruta - Oświata"
        },
        "workshop-aprons": {
          "title": "Fartuch z własną kieszenią",
          "body": "Klasa szósta szkoły nr 12 uszyła fartuchy do zajęć praktycznych. Celina Borek przygotowała trzy rozmiary wykroju, a uczniowie dopasowali długość i położenie kieszeni. Materiał kupił komitet rodzicielski z pieniędzy pozostałych po szkolnym kiermaszu. Fartuchy mają chronić ubrania podczas klejenia i malowania. Będą przechowywane w pracowni na podpisanych wieszakach. Szycie zajęło więcej lekcji, niż planowano, bo przy dwóch maszynach większość klasy musiała czekać na swoją kolej.",
          "byline": "Marek Boruta - Oświata"
        },
        "weather-notebook": {
          "title": "Pogoda z tego podwórza",
          "body": "Emerytowany nauczyciel Józef Maj z Ogrodowej od piętnastu lat notuje pogodę. Termometr ma za oknem od podwórza; odczyty robi rano i wieczorem o stałych porach. Obok temperatury zapisuje opady oraz zachmurzenie. Sąsiedzi pytają go o dawne zimy, zwłaszcza gdy wspomnienia uczestników rozmowy się różnią. Maj pokazuje wtedy zeszyty, ale zaznacza, że podwórze między kamienicami nie jest stacją meteorologiczną. Jego zapiski opisują warunki w jednym, stale tym samym miejscu.",
          "byline": "Dział naukowy"
        },
        "shadow-dial": {
          "title": "Cień zmienia miejsce",
          "body": "Koło przyrodnicze szkoły nr 7 przy Kolejowej obserwuje cień słupka w ogródku za salą gimnastyczną. Uczniowie mierzą jego długość zawsze w południe i zaznaczają kierunek. Zofia Rataj porównuje z nimi wyniki z różnych miesięcy. Słupek zostaje na miejscu także wtedy, gdy nikt nie prowadzi zajęć, więc następna klasa może powtórzyć pomiar. Przy pochmurnym niebie rubryka pozostaje pusta. Nie zastępuje się jej wynikiem z poprzedniego słonecznego dnia.",
          "byline": "Dział naukowy"
        },
        "leaf-collection": {
          "title": "Liść i miejsce znalezienia",
          "body": "Zielnik szkoły nr 7 przy Kolejowej powstaje z liści zbieranych w parku na Lipowej i pod Brzezinami. Zofia Rataj wymaga opisania miejsca znalezienia oraz drzewa, z którego pochodzi okaz. Same podobne liście mogą wprowadzić początkującego w błąd. Uczniowie dokładają rysunki owoców i kory, jeśli udało się je obejrzeć. Starsze karty są naprawiane, zamiast wyrzucane po zakończeniu roku. Dzięki temu klasy mogą porównywać okazy z tych samych drzew w różnych porach.",
          "byline": "Dział naukowy"
        },
        "magnifier-table": {
          "title": "Zwykła nitka pod lupą",
          "body": "Pracownia przyrodnicza szkoły nr 12 ma cztery lupy dla całej klasy. Dzieci oglądają kolejno nitki, pióra i liście, a pozostałe w tym czasie przygotowują rysunki. Nauczycielka Irena Wolska prosi, aby najpierw opisać widoczne szczegóły, dopiero potem szukać nazwy w podręczniku. Własne obserwacje bywają mniej efektowne od ilustracji, lecz pokazują również uszkodzenia próbki. Do zajęć nie trzeba kupować okazów: większość przynoszą uczniowie z domu i drogi do szkoły.",
          "byline": "Dział naukowy"
        },
        "star-chart": {
          "title": "Niebo na szkolnej mapie",
          "body": "Koło astronomiczne przy domu kultury na Szkolnej przeprowadziło wieczorne obserwacje z dziedzińca szkoły nr 12. Instruktor Kazimierz Orzeł zaczął od rozpoznania Wielkiego Wozu i kierunku północnego. Część uczestników po raz pierwszy porównywała mapę z prawdziwym niebem. Lampy przy oknach ograniczały widok słabszych gwiazd, więc teleskop pozostał w pracowni. Na następną pogodną noc koło planuje wyjazd za Brzeziny, gdzie zabudowania nie zasłaniają tak dużej części widoku.",
          "byline": "Dział naukowy"
        },
        "water-level": {
          "title": "Ten sam poziom",
          "body": "Na pokazie fizycznym w szkole nr 12 szóstoklasiści napełnili wodą połączone naczynia o różnych kształtach. Poziom w każdym ustalił się na tej samej wysokości. Zaproszony stolarz Wacław Duda pokazał podobną zasadę przy użyciu przezroczystego węża do wyznaczania poziomu. Uczniowie sprawdzili nim dwa odległe punkty na ścianie pracowni. Pokaz przygotowano przed zajęciami technicznymi, na których klasy będą planować rozmieszczenie nowych półek.",
          "byline": "Dział naukowy"
        },
        "seed-observation": {
          "title": "Kiełek w dwóch zeszytach",
          "body": "Piąte klasy A i B szkoły nr 12 porównały wzrost fasoli wysianej na lekcjach przyrody. W obu salach użyto tych samych nasion, lecz klasa B rozpoczęła doświadczenie trzy dni później. Dopiero przy zestawieniu pomiarów zauważono, że rośliny opisane tą samą datą były w różnym wieku. Nauczycielka Irena Wolska przeliczyła z uczniami dni od wysiewu. Po poprawce różnice wzrostu okazały się mniejsze. Klasy będą teraz notować również temperaturę przy obu parapetach.",
          "byline": "Dział naukowy"
        },
        "sound-string": {
          "title": "Dźwięk według długości",
          "body": "Szóstoklasiści szkoły nr 12 zbudowali na fizyce przyrząd z napiętą struną i przesuwanym podparciem. Skracając drgającą część, uzyskiwali coraz wyższy dźwięk. Nauczyciel zaprosił Mariana Nowaka z kolejowego zespołu muzycznego, który przyniósł gitarę. Uczniowie porównali działanie podparcia z dociskaniem struny do progów. Nie wszyscy od razu słyszeli różnicę, dlatego próby powtórzono pojedynczo. W klasie grającej naraz na kilku strunach trudno było cokolwiek porównać.",
          "byline": "Dział naukowy"
        },
        "soil-jars": {
          "title": "Ziemia z kilku miejsc",
          "body": "Uczniowie szkoły nr 7 przy Kolejowej przynieśli na przyrodę ziemię z ogródka szkolnego i pola pod Brzezinami. Po wymieszaniu próbek z wodą w słoikach obserwowali osiadanie cząstek. Warstwy różniły się grubością i barwą. Zofia Rataj zwróciła uwagę, że próbki pobrano z innej głębokości, co utrudnia porównanie. Następne zbiorą razem według jednego sposobu. Dotychczasowe słoiki pozostają opisane, aby nie pomylić ich podczas kolejnych zajęć.",
          "byline": "Dział naukowy"
        },
        "bridge-paper": {
          "title": "Most z jednej kartki",
          "body": "Konkurs papierowych mostów w szkole nr 12 wygrała para z klasy szóstej B. Z jednej kartki uczniowie złożyli harmonijkę opartą na podstawach oddalonych o dwadzieścia centymetrów. Konstrukcja utrzymała sześć jednakowych odważników. Pozostałe zespoły otrzymały taki sam papier i czas pracy; nie wolno było używać kleju. Nauczyciel wykorzystał wyniki do porównania sposobów składania. Płaska kartka uginała się wcześniej niż ta sama ilość papieru ułożona w usztywniające zagięcia.",
          "byline": "Dział naukowy"
        },
        "common-key": {
          "title": "Klucz z dużą zawieszką",
          "body": "Klucz do świetlicy Północ przy Lipowej 6 przechowuje gospodyni Celina Lis. Prowadzący odbierają go przed zajęciami i zwracają po zamknięciu sali. Wieczorem, gdy pani Lis już wyszła, klucz trafia do oznaczonej skrzynki przy portierni administracji. Wcześniej zostawiano go u sąsiadów i następna grupa musiała szukać właściwego mieszkania. Duża drewniana zawieszka odróżnia go od kluczy domowych. Przy odbiorze sprawdza się także, czy poprzednicy oddali również klucz do szafki z grami.",
          "byline": "Dział miejski"
        },
        "allotment-path": {
          "title": "Ścieżka między płotami",
          "body": "W ogrodzie działkowym Zacisze przy Ogrodowej numery parceli nie odpowiadają kolejności od głównej bramy. Starszą część ogrodu powiększano etapami, zostawiając dawne oznaczenia. Gospodarz Jan Ryś trzyma przy wejściu plan dla dostawców i gości. Najczęściej potrzebują go osoby przywożące sadzonki lub materiały do altan. Właściciele działek nadal umawiają się przy dużej gruszy i studni. Oba punkty zaznaczono na planie, aby takie wskazówki były zrozumiałe również dla przyjezdnych.",
          "byline": "Dział miejski"
        },
        "neighbour-tools": {
          "title": "Wiertarka w zeszycie",
          "body": "Mieszkańcy bloku przy Lipowej 12 na Północy wspólnie korzystają z wiertarki, piły i długiej drabiny. Narzędzia należą do kilku rodzin i są przechowywane w różnych mieszkaniach. Gospodarz prowadzi listę właścicieli, ale nie wydaje sprzętu w ich imieniu. Pożyczający uzgadnia termin zwrotu bezpośrednio z sąsiadem. Dzięki temu wiadomo, kogo szukać, gdy drabina jest potrzebna do malowania. Wiertła i inne drobne części trzeba policzyć przy przekazywaniu pudełka.",
          "byline": "Dział miejski"
        },
        "noticeboard-space": {
          "title": "Kartka ma swój termin",
          "body": "Celina Lis, gospodyni świetlicy Północ przy Lipowej 6, przegląda tablicę ogłoszeń po cotygodniowym sprzątaniu. Zdejmuje zaproszenia na zakończone spotkania i kartki wycofane przez autorów. Ogłoszenia bez daty muszą być ponownie potwierdzone po miesiącu. Mieszkańcy szukają na tablicy głównie usług, zamiany dziecięcych ubrań i zgubionych przedmiotów. Stare kartki pani Lis przechowuje krótko w kopercie, bo ktoś czasem wraca po adres, którego nie zdążył przepisać.",
          "byline": "Dział miejski"
        },
        "laundry-roster": {
          "title": "Pralnia z wolnym okienkiem",
          "body": "Lokatorzy Lipowej 12 na Północy zmienili sposób rezerwowania wspólnej pralni. Przy nazwisku dopisuje się teraz godzinę początku i końca, a rezygnację zgłasza gospodarzowi. Dawniej przekazywano sobie klucz bez wpisu i wolny termin wyglądał na zajęty. Pierwszą zwolnioną zmianę wykorzystała Wanda Mól, która czekała z praniem od kilku dni. Spółdzielnia nie zwiększyła liczby godzin pracy pralni. Nowy zapis pozwala lepiej wykorzystać te, za które lokatorzy już płacą.",
          "byline": "Dział miejski"
        },
        "club-bookcase": {
          "title": "Regał dla świetlicy",
          "body": "Bielscy z Kolejowej przekazali świetlicy Północ przy Lipowej 6 regał po zmniejszeniu domowego księgozbioru. Mebel przewieźli dwaj sąsiedzi po pracy. Półki przestawiono tak, aby zmieścić pudła z grami i duże albumy plastyczne. Gospodyni Celina Lis wydzieliła dolną część na rzeczy używane przez dzieci. Dotąd materiały stały w kartonach na podłodze i trzeba je było wynosić przy każdym myciu sali. Regał przytwierdzono do ściany przed oddaniem do użytku.",
          "byline": "Dział miejski"
        },
        "bench-painting": {
          "title": "Ławka z odnowionym oparciem",
          "body": "Mieszkańcy Kolejowej 14 odnowili ławkę między bramą a oficyną. Stolarz Wacław Duda wymienił dwie deski siedziska, pozostałe oczyszczono i pomalowano. Farbę kupiono ze wspólnej składki, narzędzia pożyczyli lokatorzy. Ławka służy przede wszystkim starszym osobom, które czekają na podwórzu na rodzinę lub powrót sąsiada z zakupami. Gospodarz przypomniał o pozostawieniu przejazdu do warsztatu w oficynie. Po remoncie mebel wrócił pod tę samą ścianę.",
          "byline": "Dział miejski"
        },
        "allotment-library": {
          "title": "Poradniki pod wspólnym kluczem",
          "body": "Działkowcy Zacisza przy Ogrodowej zebrali poradniki do wspólnego wypożyczania. W szafce gospodarza Jana Rysia znalazło się dziewiętnaście książek o sadownictwie, uprawie warzyw i budowie altan. Właściciele przekazali je na użytek ogrodu, zachowując nazwiska wpisane na wyklejkach. Najczęściej pytano o przycinanie drzew, lecz właśnie tego podręcznika brakuje. Zarząd szuka egzemplarza w antykwariatach. Książki wydaje gospodarz podczas sobotnich dyżurów przy głównej bramie.",
          "byline": "Dział miejski"
        },
        "shared-room-hours": {
          "title": "Godziny na jednej kartce",
          "body": "Koła działające w świetlicy Północ przy Lipowej 6 uzgodniły kwadrans przerwy między kolejnymi zajęciami. Grupa plastyczna potrzebuje czasu na umycie stołów, zanim usiądą przy nich szachiści. Dotąd oba spotkania stykały się w rozkładzie i spór powtarzał się co tydzień. Gospodyni Celina Lis przesunęła początek gry za zgodą uczestników. Poprawiony wykaz wisi przy wejściu i w administracji osiedla. Prowadzący koła przepisali nowe godziny do zaproszeń, ponieważ część uczestników przychodzi prosto z pracy.",
          "byline": "Dział miejski"
        },
        "courtyard-chronicle": {
          "title": "Kronika jednego podwórza",
          "body": "Lokatorzy Stolarskiej 8 przygotowali album podwórza, na którym od lat działają małe warsztaty. Zdjęcia przyniosły rodziny Lisów i Dudów, a dawny szewc opisał zakłady widoczne na najstarszej odbitce. Przy kilku datach pozostawiono pytajniki. Album przechowuje gospodarz domu; kopie wybranych fotografii dostała biblioteka przy Kolejowej. Nowi mieszkańcy dopisali nazwiska obecnych lokatorów, aby za kilkanaście lat nie trzeba było odgadywać wszystkich twarzy od początku.",
          "byline": "Dział miejski"
        }
      }
    },
    mobile: {
      title: 'Next, Please!', reception: 'Telefon do przychodni',
      languagePolish: 'PL', languageEnglish: 'EN',
      phoneLabel: 'Słuchawka telefonu — dalej',
      phoneDescription: 'Duża oliwkowa słuchawka starego telefonu z kręconym przewodem.',
      tone: 'Sygnał centrali', dialing: 'Wybieranie numeru…',
      greeting: 'Przychodnia słucham!',
      reply: 'Praca zdalna? Doktor raczy żartować. Czekamy w placówce',
      note: 'Do gry potrzebny jest komputer, taki prawdziwy,',
      noteHelp: 'z klawiaturą i myszą lub gładzikiem.',
      noteLines: ['Do gry potrzebny', 'jest komputer,', 'taki prawdziwy,', 'z klawiaturą', 'i myszą', 'lub gładzikiem.'],
      noteLabel: 'Odręczna notatka z przychodni',
    },
    takeCertificate: 'Weź formularz orzeczenia ze stojaka', reservedForm: 'Miejsce na przyszły formularz — nieaktywne', rackBlank: 'Kartki', rackCertificate: 'Orzeczenia',
    phone: 'Telefon — posłuchaj sygnału centrali', measurements: 'Waga ze wzrostomierzem — zmierz wagę i wzrost',
    takePaper: 'Weź czystą kartkę ze stojaka', takeClip: 'Weź spinacz z pojemnika',
    drawer: 'Szuflada', drawerNames: { drawer: 'Lewa szuflada', 'drawer-2': 'Prawa szuflada' }, trash: 'Kosz na papier',
    drawerEmpty: 'Szuflada jest pusta. Przenieś tu przedmiot, aby go zachować.',
    drawerHelp: 'Odłóż trzymaną kartkę, gazetę, regulamin, spinacz lub banknot do szuflady. Z pustą dłonią otworzysz jej zawartość.',
    drawerViewHelp: 'Dokumenty od najnowszych do najstarszych według daty; przy tej samej dacie najpierw ostatnio odłożone. Spięty komplet zajmuje jedną pozycję. Najedź kursorem lub wybierz klawiszem Tab, aby odczytać nazwisko. Kliknij lub naciśnij Enter, aby wyjąć akta. Kolejne partie mieszczą dalsze akta i gazety. Gazety leżą w stosie od najstarszego do najnowszego numeru. Najedź na odsłoniętą krawędź lub wybierz ją klawiszem Tab, aby zobaczyć datę; kliknij lub naciśnij Enter, aby wyjąć ten numer. Dolna krawędź lub Escape zamyka szufladę.',
    drawerDocuments: 'Akta', drawerCash: 'Gotówka', drawerObjects: 'Inne przedmioty', drawerBatch: 'Część archiwum',
    drawerRetrieve: 'Wyjmij', drawerClose: 'Zamknij szufladę', drawerPrevious: 'Poprzednie', drawerNext: 'Następne',
    trashHelp: 'Przenieś dokument lub gazetę nad kosz i kliknij, aby go wyrzucić.',
    clipTaken: 'Spinacz w dłoni. Przyłóż go do kartki, aby ją spiąć.',
    clipNoTarget: 'Przyłóż spinacz do dokumentacji, skierowania, orzeczenia lub listu.',
    paperHelp: 'Kliknij, aby podnieść kartkę. Wyniki i wywiad z badania ogólnego pojawiają się automatycznie. Upuść kartkę przy spinaczu innej, aby je spiąć. Kliknij spinacz, aby rozpiąć.',
    letterHelp: 'Otwórz kopertę zagiętym rogiem lub klawiszem Enter. Przeczytany list można wyrzucić do kosza.',
    calendar: {
      label: 'Datownik na biurku', date: 'Data',
      months: ['stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca', 'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'],
      monthsShort: ['STY', 'LUT', 'MAR', 'KWI', 'MAJ', 'CZE', 'LIP', 'SIE', 'WRZ', 'PAŹ', 'LIS', 'GRU'],
      weekdays: ['niedziela', 'poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota'],
      weekdaysShort: ['NDZ', 'PON', 'WT', 'ŚR', 'CZW', 'PT', 'SOB'],
    },
    documentDesign: {
      referral: 'SKIEROWANIE', certificate: 'ORZECZENIE', report: 'WYNIK BADANIA', specialist: 'ZAŚWIADCZENIE', certificateStatement: 'Orzeka się o zdolności do pracy:', medicalOffice: 'PRZYCHODNIA',
      letter: 'ZAWIADOMIENIE', directive: 'PISMO OKÓLNE', subject: 'Dotyczy', reference: 'Znak sprawy',
      recipient: 'Do lekarza orzecznika', personal: 'DO RĄK WŁASNYCH',
      institutions: { militia: 'KOMENDA MILICJI', lot: 'LOT', zus: 'ZUS', chamber: 'IZBA LEKARSKA', clinic: 'MEDYCYNA PRACY' },
      departments: { employer: 'DZIAŁ KADR', militia: 'WYDZIAŁ KADR', lot: 'PERSONEL LATAJĄCY', zus: 'REFERAT ORZECZEŃ', chamber: 'SEKRETARIAT', clinic: 'GABINET 04' },
      referralInstruction: { initial: 'Kieruje się na badanie wstępne:', periodic: 'Kieruje się na badanie okresowe:', control: 'Kieruje się na badanie kontrolne:' },
      fields: { identity: 'Osoba kierowana', position: 'Stanowisko', work: 'Praca', hazards: 'Narażenia' },
      seal: { employer: ['DZIAŁ KADR', 'EWIDENCJA'], militia: ['MILICJA', 'KADRY'], lot: ['LOT', 'KADRY'], zus: ['ZUS', 'REFERAT ORZECZEŃ'], chamber: ['IZBA', 'LEKARSKA'], clinic: ['LEKARZ', 'MED. PR.'] },
    },
    paperwork: {
      date: 'Data', issued: 'Wystawiono', employerSeal: 'Fioletowa pieczęć działu kadr',
      clinicSeal: 'Pieczęć gabinetu', zusSeal: 'Podłużna niebieska pieczęć ZUS', signed: 'Podpisano odręcznie',
      referral: 'Skierowanie na badania', occupational: 'Medycyna pracy', note: 'Dokumentacja lekarska', blank: 'Czysta kartka',
      employer: 'Pracodawca', name: 'Imię i nazwisko', birthDate: 'Data urodzenia', birthShort: 'Ur.', age: 'Wiek', sex: 'Płeć',
      female: 'K', male: 'M', femaleFull: 'Kobieta', maleFull: 'Mężczyzna', examination: 'Badanie',
      initial: 'wstępne', periodic: 'okresowe', control: 'kontrolne', position: 'Stanowisko', managerial: 'Kierownicze', yes: 'tak', no: 'nie',
      requirements: 'Wymogi', requirementCodes: { full: 'WC', vision: 'W', pressure: 'C' }, work: 'Rodzaj pracy', hazards: 'Narażenia', weight: 'Waga', height: 'Wzrost', kg: 'kg', cm: 'cm',
      write: 'Dopisz wywiad do dokumentacji', read: 'Przeczytaj dokument', open: 'Otwórz kopertę',
      envelope: 'Zamknięta koperta', letter: 'Pismo w sprawie orzeczenia', sender: 'Nadawca', recipient: 'Do lekarza orzecznika',
      zus: 'ZUS', employerSender: 'Pracodawca', paperclip: 'Spinacz', clipped: 'Spięte spinaczem', stored: 'W szufladzie',
      unclip: 'Odepnij spinacz i rozdziel dokumenty', writeCertificate: 'Wpisz nazwisko pacjenta i stanowisko pracy na orzeczeniu',
      nameMissing: 'Nazwisko nie jest wpisane', nameWritten: 'Nazwisko wpisane ręcznie', positionMissing: 'Stanowisko pracy nie jest wpisane',
      resultsHeading: 'Wyniki badań', additionalHeading: 'Dodatkowe informacje',
      certificatePurpose: 'Zdolność do pracy na stanowisku', decisionHeading: 'Orzeczenie lekarza', reference: 'Nr akt',
      missingResultSenders: { militia: 'Komenda milicji', lot: 'Biuro LOT-u' },
      stationery: { militia: 'Milicja', lot: 'LOT' },
      letterConcerns: {
        "expired-referral": "Datę skierowania zestawiono z dniem dopuszczenia. Odstęp wymaga wyjaśnienia.",
        "invalid-referral": "Dopuszczenie oparto na skierowaniu, którego pochodzenia pieczęć nie potwierdza.",
        "identity-mismatch": "Dane osoby dopuszczonej nie odpowiadają osobie wymienionej w wynikach badań.",
        "general": "Dopuszczenie zestawiono z zastrzeżeniami co do ogólnego stanu zdrowia.",
        "additional-test": "Dopuszczenie zestawiono z ustaleniami właściwego badania dodatkowego.",
        "vision": "Dopuszczenie zestawiono z wadą wzroku i wymogami stanowiska.",
        "pressure": "Przy dopuszczeniu odnotowano wartości ciśnienia wymagające wyjaśnienia.",
        "authentic-referral": "Odmowę zestawiono z ewidencją wystawcy. Nieczytelny odcisk uzyskał potwierdzenie.",
        "unjustified-refusal": "W ustaleniach badania nie odnaleziono przeciwwskazań uzasadniających odmowę.",
        "wrong-test": "Zakres zleconego badania dodatkowego nie odpowiada stanowisku ze skierowania.",
      },
      letters: {
        missingResult: [
          { subject: 'W sprawie załączników', body: "Orzeczenie przyjęto do akt. Pozycja przewidziana dla wyniku badania dodatkowego pozostaje otwarta. Prosimy uzgodnić wykaz załączników.", role: 'Kierownik kadr', signature: 'Witold Krawiec' },
          { subject: 'Doręczenie dokumentacji', body: "Wpływ orzeczenia odnotowano. W rubryce odbioru wyniku badania dodatkowego nie odnaleziono wpisu. Akta przekazano do uzgodnienia.", role: 'Referent osobowy', signature: 'Irena Brzozowska' },
          { subject: 'Niekompletna teczka', body: "Teczka pracownika zawiera orzeczenie. Ciągłość dokumentacji badania dodatkowego wymaga wyjaśnienia na etapie przekazania załączników.", role: 'Kierownik organizacji pracy', signature: 'Jerzy Łukaszewski' },
          { subject: 'Zastrzeżenia do akt', body: "Wykaz załączników do orzeczenia zestawiono z odebranymi aktami. Pozycja dotycząca wyniku badania dodatkowego pozostaje bez potwierdzenia.", role: 'Pełnomocnik zakładu', signature: 'Barbara Wierzbicka' },
          { subject: 'Uzupełnienie dokumentacji', body: "Orzeczenie zarejestrowano osobno. Los wymaganego wyniku badania dodatkowego nie wynika z dokumentów przekazanych jednostce.", role: 'St. inspektor kadr', signature: 'Stefan Płatek' },
          { subject: 'Protokół braków', body: "Protokół odbioru obejmuje orzeczenie. Odbioru towarzyszącego mu wyniku badania dodatkowego dotychczas nie potwierdzono.", role: 'Kierownik administracji', signature: 'Halina Orłowska' },
        ],
        zus: [
          { subject: 'Weryfikacja dokumentacji', body: "Sprawę objęto przeglądem. Prosimy zachować dokumentację.", role: 'St. referent rozliczeń', signature: 'Maria Jarosz' },
          { subject: 'Uzupełnienie akt świadczenia', body: "Dokumenty włączono do akt świadczenia. Prosimy zachować załączniki.", role: 'Inspektor świadczeń', signature: 'Roman Głowacki' },
          { subject: 'Zawiadomienie o przeglądzie', body: "Sprawę przekazano do rozpatrzenia. Oryginały pozostają w gabinecie.", role: 'Referent księgowości', signature: 'Teresa Biel' },
          { subject: 'Nota w sprawie dokumentacji', body: "Komisja bada dokumentację. Potwierdzenie odbioru jest zbędne.", role: 'Sekretarz komisji', signature: 'Henryk Kulesza' },
          { subject: 'Zestawienie akt', body: "Akta wymagają wyjaśnienia. Prosimy podawać numer sprawy.", role: 'Inspektor rozliczeń', signature: 'Zofia Rudzka' },
          { subject: 'Przekazanie sprawy', body: "Akta przekazano do referatu. Odpis pisma należy zachować.", role: 'Kierownik referatu', signature: 'Adam Wilczyński' },
        ],
        employer: [
          { subject: 'Wszczęcie postępowania', body: "Po odmowie stanowisko pozostaje nieobsadzone. Prosimy zachować akta.", role: 'Kierownik kadr', signature: 'Witold Krawiec' },
          { subject: 'Zawiadomienie kadrowe', body: "Odmowę wpisano do ewidencji kadr. Prosimy o wyjaśnienie jej podstaw.", role: 'Referent osobowy', signature: 'Irena Brzozowska' },
          { subject: 'Wyciąg z ewidencji', body: "Po odmowie odnotowano lukę w grafiku. Akta oczekują na wyjaśnienie.", role: 'Kierownik organizacji pracy', signature: 'Jerzy Łukaszewski' },
          { subject: 'Przekazanie dokumentów', body: "Dokumenty odmowy przekazano do rozpatrzenia. Prosimy zachować komplet akt.", role: 'Pełnomocnik zakładu', signature: 'Barbara Wierzbicka' },
          { subject: 'Ustalenia kadrowe', body: "Odmowa przerwała ciągłość zatrudnienia. Kadry oczekują wyjaśnienia.", role: 'St. inspektor kadr', signature: 'Stefan Płatek' },
          { subject: 'Aktualizacja ewidencji', body: "Po odmowie sporządzono wykaz zastępstw. Prosimy podawać numer sprawy.", role: 'Kierownik administracji', signature: 'Halina Orłowska' },
        ],
      },
    },
    patientReferrals: [
      { employer: 'Archiwum Zakładów Brzask', work: 'biurowa, ewidencja akt', hazards: 'pył papierowy, pozycja siedząca' },
      { employer: 'Zakłady Mechaniczne Ogniwo', work: 'obsługa suwnicy, hala', hazards: 'hałas, praca na wysokości' },
      { employer: 'Przewozy Pracownicze Szlak', work: 'przewóz osób, zmiany', hazards: 'ruch drogowy, długie siedzenie' },
      ...PATIENTS.slice(3).map(patient => ({ employer: patientCopy.pl.employers[patient.employerId]!, work: patient.id < LEGACY_CASE_COUNT ? patientCopy.pl.work[patient.jobId]! : `${patientCopy.pl.work[patient.jobId]} / ${patientCopy.pl.patterns[patient.workPatternId]}`, hazards: patientCopy.pl.hazards[patient.jobId]! })),
    ],
    patientNotes: [['Praca z aktami.', 'Pozycja siedząca.'], ['Praca na wysokości.', 'Stanowisko kierownicze.'], ['Przewóz osób.', 'Praca zmianowa.'], ...PATIENTS.slice(3).map(patient => patientCopy.pl.conditions[patient.conditionId])],
    dragHelp: 'Kliknij lub naciśnij spację, aby podnieść. Przedmiot podąża za kursorem; kolejne kliknięcie odkłada lub używa. Enter wykonuje działanie.',
    carryingHelp: 'Kliknij, aby odłożyć lub użyć. Pieczątki odkładaj na podstawki. Orzeczenie oddaj pacjentowi. Strzałki przesuwają, Shift przyspiesza, Enter lub spacja używa lub odkłada, Escape cofa.',
    itemPickedUp: 'Przedmiot w dłoni. Kliknij ponownie, aby odłożyć lub użyć. Strzałki przesuwają, Enter używa lub odkłada, Escape cofa.',
    toolNoTarget: 'Tu nie ma dokumentu do podbicia. Odłóż pieczątkę na jej podstawkę.',
    toolPutAway: 'Przedmiot odłożony na swoje miejsce.',
    putAwayFit: 'Odłóż pieczątkę ZDOLNY na podstawkę',
    putAwayUnfit: 'Odłóż pieczątkę ODMOWA na podstawkę',
    manualHelp: 'Przenieś regulamin na prawy blat i kliknij zagięty róg okładki. Kartkuj rogami stron; cofnięcie pierwszej strony zamyka okładkę. Enter otwiera lub zamyka, spacja podnosi.',
    manualOpened: 'Regulamin otwarty na biurku.', manualClosed: 'Regulamin zamknięty.',
    manualPrevious: 'Poprzednia strona regulaminu', manualNext: 'Następna strona regulaminu',
    notePagination: { previous: 'Poprzednia strona notatek', next: 'Następna strona notatek', page: 'Strona notatek', help: 'Dalsze wpisy znajdują się na kolejnych stronach. Kartkuj zagiętymi rogami.' },
    manualClose: 'Zamknij regulamin', manualOpenCover: 'Otwórz okładkę regulaminu', manualPageLabel: 'Strona',
    itemDropped: 'Przedmiot odłożony.', moveCancelled: 'Przedmiot wrócił na poprzednie miejsce.',
    // Fixed optotypes embedded in the generated chart, shared by both locales.
    clock: 'Zegar', eyeChart: ['E', 'F P', 'T O Z', 'L P E D', 'P E C F D', 'E D F C Z P'],
    resume: 'WRÓĆ DO DYŻURU', menu: 'MENU', archive: 'ZAPISY',
    breakRoomTitle: 'Next, Please!', gameTitleLines: ['NEXT,', 'PLEASE!'],
    breakRoomDescription: 'Lekarze i pielęgniarki rozmawiają przy kawie w pokoju socjalnym. Dyżur jest wstrzymany; po powrocie zastaniesz swoje biurko.',
    restart: 'ZACZNIJ OD NOWA', restartTitle: 'NOWY POCZĄTEK',
    restartBody: ['Zaczniesz od pierwszego dnia.', 'Bieżący postęp zostanie zastąpiony.', 'Możesz zapisać kopię w teczce.'],
    restartConfirm: 'ROZPOCZNIJ NOWĄ GRĘ', restartCancel: 'ZOSTAJĘ NA DYŻURZE',
    introTitle: 'INSTRUKTAŻ STANOWISKOWY', next: 'DALEJ', enterCabinet: 'DO GABINETU',
    utilityControls: 'Ustawienia gry', languagePolish: 'Polski', languageEnglish: 'English',
    bellLabel: 'Następny', trayLabel: 'Dokumenty', rulebookLabel: 'Regulamin',
    documentVision: 'Wzrok', documentPressure: 'Ciśnienie', documentTitleLabel: 'Orzeczenie',
    documentPending: '—', roomNumberLabel: '04',
    intro: [
      { body: 'Jedni używają\nskalpela.' },
      { body: 'Inni — cewnika.' },
      { body: 'Albo długopisu.' },
      { body: 'Ty masz\npieczątkę.' },
    ],
    cabinetTitle: 'GABINET NR 04', chair: 'FOTEL PACJENTA', emptyChair: 'NA RAZIE CISZA.',
    examinations: 'STANOWISKO BADAŃ', exchange: 'OBIEG DOKUMENTÓW',
    callPatient: 'NASTĘPNY, PROSZĘ!', takeDocument: 'WEŹ SKIEROWANIE',
    returnDocument: 'ODDAJ ORZECZENIE PACJENTOWI', document: 'SKIEROWANIE', certificate: 'ORZECZENIE',
    returnIdentityCard: 'Zwróć legitymację właścicielowi',
    documentEmpty: 'MIEJSCE NA AKTA', awaitingDocument: 'SKIEROWANIE W PODAJNIKU',
    general: 'Badanie ogólne — zbadaj pacjenta', generalResult: 'Badanie ogólne', generalClear: 'bez uwag', generalConcern: 'stwierdzono nieprawidłowości', leftEye: 'OL', rightEye: 'OP', pressureUnit: 'mmHg', veryHigh: 'bardzo wysokie',
    generalFindings: [
      'szmer nad sercem', 'nierówne tętno', 'świsty nad płucami', 'trzeszczenia u podstaw płuc',
      'obrzęki podudzi', 'drżenie rąk', 'zaburzenia równowagi', 'osłabiony chwyt dłoni',
      'ograniczony ruch barku', 'osłabiona siła lewej nogi', 'zaburzone czucie palców',
      'bolesność prawego podżebrza', 'powiększona wątroba', 'powiększone węzły szyi',
      'duszność przy małym wysiłku', 'sinica warg', 'wyraźna chrypka', 'obrzęk stawu kolanowego', 'nawracające zawroty głowy',
    ],
    vision: 'TABLICA WZROKU', pressure: 'CIŚNIENIOMIERZ',
    visionResult: 'WZROK', pressureResult: 'CIŚNIENIE', untested: 'BRAK',
    pass: 'NORMA', refer: 'KONTROLA', fit: 'ZDOLNY', unfit: 'ODMOWA',
    stampFit: 'Wybierz pieczątkę: zdolny', stampUnfit: 'Wybierz pieczątkę: odmowa',
    applyStamp: 'Przyłóż wybraną pieczątkę do orzeczenia', stampHere: 'PODBIJ TUTAJ',
    selectedStamp: 'Wybrana pieczątka', manual: 'REGULAMIN', manualTitle: 'PRZEPISY PORZĄDKOWE PRZYCHODNI',
    additionalTests: {
      title: 'SKIEROWANIE NA BADANIE', resultTitle: 'WYNIK BADANIA',
      take: 'Weź skierowanie na badanie dodatkowe z trzeciej szuflady',
      hand: 'Wręcz skierowanie pacjentowi i odrocz wizytę',
      choose: 'Zakreśl jedno badanie', selected: 'Zakreślono', empty: 'Nie wybrano badania',
      selectionHelp: 'Na prawym blacie zakreśl jedno badanie. Podnieś skierowanie i oddaj je pacjentowi.',
      tests: { audiometry: 'Audiometria tonalna', vestibular: 'Badanie błędnika', psychiatry: 'Konsultacja psychiatryczna', 'chest-xray': 'RTG klatki piersiowej' },
      concerns: { psychiatry: 'Wątpliwości co do stanu psychicznego.', 'chest-xray': 'Zmiany sugerujące pylicę płuc.' },
      notes: {
        audiometry: { fit: 'słuch w normie.', unfit: 'ubytek słuchu.', discretionary: 'graniczny próg słuchu; do oceny lekarza.' },
        vestibular: { fit: 'równowaga prawidłowa.', unfit: 'zaburzenia równowagi.', discretionary: 'niewielka chwiejność; do oceny lekarza.' },
        psychiatry: { fit: 'bez zaburzeń.', unfit: 'zaburzenia psychiczne.', discretionary: 'reakcje niejednoznaczne; do oceny lekarza.' },
        'chest-xray': { fit: 'bez cech pylicy.', unfit: 'pylica potwierdzona.', discretionary: 'drobne zmiany; charakter niejednoznaczny.' },
      },
      report: {
        audiometry: { fit: 'Słuch w normie. Brak przeciwwskazań do pracy hutnika.', unfit: 'Ubytek słuchu uniemożliwia pracę hutnika. Wymagana odmowa.', discretionary: 'Próg słuchu graniczny. Znaczenie dla pracy hutnika należy ocenić w świetle wywiadu i warunków pracy.' },
        vestibular: { fit: 'Układ równowagi sprawny. Brak przeciwwskazań do pracy pilota.', unfit: 'Zaburzenia równowagi wykluczają pracę pilota. Wymagana odmowa.', discretionary: 'Niewielka chwiejność w próbach. Znaczenie dla pracy pilota pozostawia się ocenie lekarza orzecznika.' },
        psychiatry: { fit: 'Bez zaburzeń psychicznych. Zdolność psychiczna do służby w milicji potwierdzona.', unfit: 'Zaburzenia psychiczne wykluczają służbę w milicji. Wymagana odmowa.', discretionary: 'Obserwowane reakcje nie dają jednoznacznej oceny zdolności do służby. Wskazane uwzględnienie wywiadu i ogólnego stanu zdrowia.' },
        'chest-xray': { fit: 'Bez zmian wskazujących na pylicę. Brak przeciwwskazań do pracy górnika.', unfit: 'Obraz radiologiczny potwierdza pylicę płuc. Praca górnika wykluczona. Wymagana odmowa.', discretionary: 'Drobne zmiany o niejednoznacznym charakterze. Zdolność do pracy górnika należy ocenić z uwzględnieniem wywiadu i stanu ogólnego.' },
      },
      otherChecks: 'Pozostałe badania i dokumenty wymagają osobnej oceny lekarza orzecznika.',
    },
    progression: {
      "chamber": "Izba Lekarska",
      "specialistTitle": "ZAŚWIADCZENIE SPECJALISTY",
      "specialist": "Lekarz specjalista",
      "specialistNames": ["dr Roman Żuławski", "dr Jerzy Łoziński", "dr Stefan Brzeziński", "dr Tadeusz Gajewski", "dr Władysław Domański", "dr Kazimierz Różycki", "dr Henryk Sadowski", "dr Zbigniew Zieliński"],
      "hr": "Dział kadr",
      "phone": "Tel.",
      "takeSpecialist": "Weź zaświadczenie od specjalisty",
      "callSpecialist": "Zadzwoń do specjalisty",
      "callEmployer": "Zadzwoń do działu kadr",
      "bribeNotes": {
        "pressure": [
          "Ciśnienie nieco ponad progiem.",
          "Pacjent prosi o dopuszczenie."
        ],
        "vision": [
          "Wada wzroku nieco ponad progiem.",
          "Pacjent prosi o dopuszczenie."
        ]
      },
      "treatment": "Pacjent jest w trakcie leczenia nadciśnienia.",
      "clearance": "Nie stwierdzam przeciwwskazań do pracy na stanowisku wskazanym poniżej.",
      "banknote": "Banknot 100 zł z Waryńskim",
      "bribeHelp": "Zostaw banknot na biurku lub w szufladzie albo oddaj pacjentowi. Zatrzymana gotówka staje się dochodem na koniec dnia.",
      "acceptBribe": "Schowaj 100 zł w lewej szufladzie",
      "returnBribe": "Oddaj pacjentowi 100 zł",
      "offer": "Stówka za pieczątkę?",
      "seal": {
        "clear": "Czytelna pieczęć pracodawcy",
        "missing": "Brak pieczęci pracodawcy",
        "unclear": "Niewyraźna pieczęć pracodawcy"
      },
      "notes": {
        "specialistValid": "Specjalista: leczenie, praca bez zastrzeżeń.",
        "specialistInvalid": "Specjalista: inne stanowisko. Nieważne.",
        "employerValid": "Kadry: skierowanie autentyczne.",
        "employerInvalid": "Kadry: skierowanie nieautentyczne."
      },
      "dialogue": {
        "dialing": "Trrr… cyk-cyk-cyk…",
        "specialistQuestion": "Czy kolega potwierdza to zaświadczenie?",
        "employerQuestion": "Czy wystawili państwo skierowanie?",
        "specialistValid": "Tak. Leczenie trwa. Ta praca bez przeszkód.",
        "specialistInvalid": "To zaświadczenie dotyczy innej pracy.",
        "employerValid": "Tak, potwierdzam. To nasze skierowanie.",
        "employerInvalid": "Nie. Nie wystawiliśmy tego skierowania."
      },
      "bankruptcyTitle": "OSTATNI NUMEREK",
      "bankruptcyBody": "Po opłaceniu rachunków saldo spada poniżej zera. Bankructwo. Przychodnia ma dla ciebie wolny etat w szatni. Fartuch wieszasz na ostatnim haczyku. Teraz wydajesz numerki zamiast orzeczeń. Płaszcze nie odwołują się od decyzji. Następny, proszę!",
      "bankruptcyDescription": "Szatnia przychodni. Były lekarz podaje mosiężny numerek przez drewniane okienko. Za nim wiszą płaszcze i biały fartuch.",
      "restartGame": "ZACZNIJ OD NOWA",
      "hospitalTitle": "NIESPODZIEWANY URLOP",
      "hospitalDescription": "Przygaszona sala szpitalna. Lekarz z opatrunkiem na głowie leży pod kocem w metalowym łóżku. Obok stoi szafka z termosem.",
      "hospitalBody": "Stówka została w kieszeni, odmowa u pacjenta. W drodze do domu zostajesz pobity. Budzisz się w szpitalu. Po leczeniu czekają cię badania medycyny pracy. Tym razem po drugiej stronie biurka.",
      "gameOver": "KONIEC GRY",
      "backToMenu": "DO MENU",
      "directives": {
        "additional-tests": {
          "subject": "Badania dodatkowe",
          "body": "Z dniem wydania niniejszego pisma wprowadza się obowiązek badań dodatkowych dla wskazanych grup zawodowych. Szczegółowe wskazania i tryb postępowania określa Załącznik 3 do podręcznika.",
          "role": "Sekretarz Izby Lekarskiej",
          "signature": "dr Adam Pieczęć"
        },
        "dates": {
          "subject": "W sprawie ważności skierowań",
          "body": "Nakazuje się kontrolę dat skierowań. Dokument starszy niż 3 dni wymaga odmowy; mający dokładnie 3 dni zachowuje ważność. Przepis obowiązuje od daty niniejszego pisma.",
          "role": "Referat kontroli ZUS",
          "signature": "Irena Stempel"
        },
        "specialist": {
          "subject": "Nadciśnienie pod opieką",
          "body": "Dopuszcza się pracę przy leczonym nadciśnieniu na podstawie zaświadczenia specjalisty o braku przeciwwskazań dla danego stanowiska. Inny zawód unieważnia dokument. Wątpliwości wyjaśnia się telefonicznie.",
          "role": "Sekretarz Izby Lekarskiej",
          "signature": "dr Adam Pieczęć"
        },
        "authenticity": {
          "subject": "O autentyczności skierowań",
          "body": "Od daty pisma wymaga się pieczęci pracodawcy na skierowaniu. Jej brak stanowi podstawę odmowy. Niewyraźny odcisk wymaga potwierdzenia w kadrach pod numerem podanym na druku.",
          "role": "Referat kontroli ZUS",
          "signature": "Irena Stempel"
        }
      }
    },
    inspection: {
      title: 'KONTROLA ZUS', inspector: 'Kontroler ZUS', identity: 'LEGITYMACJA SŁUŻBOWA',
      names: ['Marian Zawadzki', 'Irena Borucka', 'Tadeusz Radecki'],
      number: 'Nr służbowy', role: 'Kontrola dokumentacji', validity: 'Po sprawdzeniu zwrócić.',
      authority: 'Upoważnienie do kontroli akt', takeId: 'Obejrzyj legitymację kontrolera', returnId: 'Zwróć legitymację kontrolerowi',
      hand: 'Przekaż dokumentację kontrolerowi', talk: 'Porozmawiaj z kontrolerem', confirm: 'Potwierdź brak dokumentacji i zakończ kontrolę',
      greeting: 'Kontrola ZUS. Proszę sprawdzić legitymację.', idReminder: 'Proszę zwrócić legitymację.',
      farewell: 'Dziękuję za współpracę. Do widzenia.',
      request: 'Proszę o skierowanie i notatkę:', visit: 'Wizyta', received: 'Okazano',
      missing: 'Czy doktor potwierdza zaginięcie obu dokumentów? Mandat: 200 zł.',
      partial: 'Czy doktor potwierdza brak drugiego dokumentu? Mandat: 50 zł.',
      continueSearch: 'Można nadal szukać. Ponowne kliknięcie kontrolera potwierdza brak.',
      fineTitle: 'MANDAT KARNY', fineSubtitle: 'Kontrola dokumentacji medycznej',
      amount: 'Do zapłaty', reason: 'Uchybienie', absentReason: 'Brak skierowania i notatki z wizyty.', partialReason: 'Niekompletna dokumentacja wizyty.',
      addressee: 'Lekarz przyjmujący', inspectorSignature: 'Podpis kontrolera',
      settlement: 'Należność ujęta w bilansie dnia.', copy: 'Egzemplarz dla lekarza',
    },
    manualBase: "Tekst podstawowy",
    manualPages: [
      { title: '1. Przyjmowanie', lines: ['Pacjentów wzywa się', 'pojedynczo, dzwonkiem', 'na lewym blacie.', 'Skierowanie należy', 'odebrać z podajnika.', 'Przed orzeczeniem ustala', 'się tożsamość, stanowisko', 'oraz warunki pracy.'],
        facingTitle: '2. Obieg druków', facingLines: ['Prawy blat przeznacza się', 'do odczytywania akt.', 'Druki pobiera się', 'ze stojaka, pojedynczo.', 'Orzeczenie sporządza się', 'na osobnym formularzu.', 'Skierowanie pracodawcy', 'nie zastępuje orzeczenia.'] },
      { title: '3. Badanie ogólne', lines: ['Każdą osobę poddaje się', 'oględzinom i wywiadowi.', 'Badanie rozpoczyna się', 'z wolnymi rękami.', 'Nieprawidłowe ustalenia', 'stanowią podstawę odmowy.'],
        facingTitle: '4. Dokumentacja', facingLines: ['Wyniki i wywiad wpisuje', 'się na kartę notatek,', 'w kolejności uzyskania.', 'Późniejsze wpisy dopisuje', 'się pod wcześniejszymi.', 'Wcześniejsze pobranie', 'kartki nie jest warunkiem', 'przeprowadzenia badania.'] },
      { title: '5. Zakres badań', lines: ['Zakres określa kod', 'na skierowaniu:', 'WC — wzrok i ciśnienie;', 'W — wzrok; C — ciśnienie.', 'Oględziny, masę i wzrost', 'ustala się u wszystkich.', 'Stanowisko kierownicze', 'nie zwalnia z ważenia.'],
        facingTitle: '6. Ocena wzroku', facingLines: ['OL i OP podaje się osobno', 'w dioptriach.', 'Przy kodzie W lub WC', 'wada ponad 6 dioptrii', 'w oku uzasadnia odmowę', 'bez względu na znak.', 'Przy dokładnie 6 dioptriach', 'lekarz uwzględnia wywiad', 'i ogólny stan zdrowia.'] },
      { title: '7. Ocena ciśnienia', lines: ['Dla C i WC progi wynoszą', '160 mmHg skurczowego', 'lub 100 rozkurczowego.', 'Przy odchyleniu do 5 mmHg', 'w obie strony lekarz', 'uwzględnia wywiad i ogólny', 'stan zdrowia. Przekroczenie', 'tej strefy choćby w jednej', 'wartości uzasadnia odmowę.'],
        facingTitle: '8. Zapis pomiarów', facingLines: ['Zachowuje się dwa', 'pierwsze pomiary.', 'Od 180 skurczowego lub', '110 rozkurczowego stosuje', 'się czerwony atrament.', 'Brak czerwonego wpisu', 'nie stanowi potwierdzenia', 'zdolności do pracy.'] },
      { title: '9. Użycie pieczęci', lines: ['Decyzję nanosi się', 'pieczęcią na orzeczenie.', 'Po odbiciu pieczęć nadal', 'pozostaje w ręku lekarza.', 'Odkłada się ją wyłącznie', 'na właściwą podstawkę.', 'Do chwili wydania druku', 'dopuszcza się korektę.'],
        facingTitle: '10. Doręczenie', facingLines: ['Piórem na formularzu', 'uzupełnia się nazwisko', 'i stanowisko. Podbity druk', 'doręcza się pacjentowi.', 'Doręczenie kończy wizytę.', 'Odłożenie orzeczenia', 'na tackę nie stanowi', 'jego doręczenia.'] },
      { title: '11. Łączenie akt', lines: ['Spinacz umieszcza się', 'na pierwszej kartce.', 'Kolejną kartkę przykłada', 'się do tego spinacza.', 'Wyjęcie spinacza', 'rozdziela akta.', 'Skierowanie oraz notatkę', 'z każdej wizyty składa się', 'w dowolnej szufladzie.'],
        facingTitle: '12. Korespondencja', facingLines: ['Pisma ZUS i pracodawców', 'otwiera się od rogu koperty.', 'Treść należy odczytać', 'przed złożeniem do akt', 'lub usunięciem do kosza.', 'Brak pisma po wizycie', 'nie jest potwierdzeniem', 'prawidłowości orzeczenia.'] },
      { title: '13. Czas przyjęć', lines: ['Przyjęcia prowadzi się', 'od 07:55 do 14:00.', 'Po tej godzinie kończy się', 'wizytę już rozpoczętą.', 'Lekturę przepisów oraz', 'porządkowanie biurka', 'wlicza się do czasu pracy.', 'Zegar nie wymaga obsługi.'],
        facingTitle: '14. Zamknięcie', facingLines: ['O 17:00 personel sprzątający', 'wzywa do zakończenia pracy.', 'O 17:15 gabinet zamyka się', 'także przy obecności', 'pacjenta. Wizyta przerwana', 'nie podlega premiowaniu.', 'Sporządzoną dokumentację', 'pozostawia się w aktach.'] },
      { title: '15. Wynagrodzenie', lines: ['Za dzień pracy przysługuje', '1000 zł oraz po 50 zł', 'za zakończoną wizytę.', 'Rozliczenie następuje', 'po powrocie do domu.', 'Koszty utrzymania, składkę', 'i należności odlicza się', 'od dostępnych środków.'],
        facingTitle: '16. Należności ZUS', facingLines: ['Za pierwsze ujawnione', 'uchybienie w danym dniu', 'nalicza się 100 zł kary.', 'Za każde następne — 400 zł.', 'Przy dopuszczeniu do pracy', 'należy uwzględnić stan', 'zdrowia i obowiązujące', 'przepisy przychodni.'] },
      { title: '17. Ubezpieczenie', lines: ['Ujawniona błędna odmowa', 'zwiększa składkę o 50 zł', 'przy stawce 300 zł,', 'a przy wyższej — o 100 zł.', 'Wyższa stawka pozostaje.', 'Dzień bez nowej podwyżki', 'obniża ją o 50 zł,', 'do minimum 300 zł.'],
        facingTitle: '18. Dni wolne', facingLines: ['Piątek, sobotę i niedzielę', 'rozlicza się łącznie.', 'Składkę pobiera się raz;', 'dni wolne są bez pensji.', 'Skromne utrzymanie kosztuje', '800 zł za te trzy dni.', 'Składka i kary są osobno.', 'Brak środków na te koszty', 'oznacza bankructwo.'] },
    ],
    manualSupplements: {
      inspection: { label: 'Kontrola akt', pages: [
        { title: '1. Legitymowanie', lines: ['Kontroler ZUS okazuje', 'legitymację służbową.', 'Dokument przyjmuje się', 'do wglądu i zwraca.', 'Na żądanie udostępnia się', 'skierowanie oraz notatkę', 'ze wskazanej wizyty.', 'Starsze akta zachowuje się', 'także po zakończeniu dnia.'],
          facingTitle: '2. Braki w aktach', facingLines: ['Komplet obejmuje oba druki.', 'Można okazać je osobno', 'lub połączyć spinaczem.', 'Zaginięcie potwierdza', 'lekarz na pytanie kontrolera.', 'Brak obu druków: 200 zł.', 'Brak jednego druku: 50 zł.', 'Kontroler wydaje mandat.', 'Należność obciąża bilans.'] },
      ] },
      dates: { label: "Załącznik 1", pages: [
        { title: "1. Data skierowania", lines: ["Zgodnie z pismem ZUS", "sprawdza się datę", "wystawienia skierowania.", "Wiek druku ustala się", "w dniach kalendarzowych,", "względem dnia wizyty."],
          facingTitle: "2. Ważność druku", facingLines: ["Skierowanie starsze", "niż trzy dni stanowi", "podstawę odmowy.", "Dokładnie trzy dni", "nie przekraczają terminu.", "Dobry stan zdrowia nie", "przedłuża ważności."] },
      ] },
      specialist: { label: "Errata 1 — do pkt 7", pages: [
        { title: "1. Nadciśnienie", lines: ["Izba Lekarska dopuszcza", "wyjątek od pkt 7.", "Specjalista musi potwierdzić", "leczenie nadciśnienia", "i brak przeciwwskazań", "do pracy na stanowisku", "wskazanym w skierowaniu."],
          facingTitle: "2. Zakres wyjątku", facingLines: ["Zaświadczenie na inne", "stanowisko jest nieważne.", "Treść wyjaśnia wystawca", "pod numerem na druku.", "Wniosek wpisuje się", "do notatek lekarskich.", "Inne przeciwwskazania", "i braki formalne nadal", "stanowią podstawę odmowy."] },
      ] },
      authenticity: { label: "Załącznik 2", pages: [
        { title: "1. Pieczęć pracodawcy", lines: ["Zgodnie z pismem ZUS", "wymaga się pieczęci", "pracodawcy. Jej brak", "stanowi podstawę odmowy.", "Czytelny odcisk potwierdza", "autentyczność skierowania."],
          facingTitle: "2. Nieczytelny odcisk", facingLines: ["Nieczytelną pieczęć", "potwierdza się w kadrach", "pod numerem na druku.", "Ustalenia wpisuje się", "do notatek lekarskich.", "Nieautentyczny dokument", "stanowi podstawę odmowy."] },
      ] },
      payments: { label: "Uzupełnienie 1", pages: [
        { title: "1. Wpłaty osobiste", lines: ["Gotówka od pacjenta", "nie zastępuje zaświadczeń", "ani nie zmienia norm badań."],
          facingTitle: "2. Zwrot gotówki", facingLines: ["Przed wydaniem odmowy", "należy zwrócić całą kwotę.", "Placówka nie zapewnia", "ochrony osobistej lekarza", "w drodze powrotnej do domu."] },
      ] },
      additionalTests: { label: "Załącznik 3", pages: [
        { title: '1. Badania dodatkowe', lines: ['Zgodnie z pismem Izby:', 'hutnik: audiometria tonalna;', 'pilot: badanie błędnika;', 'milicjant: psychiatra przy', 'zaburzeniach lub wątpliwej', 'zdolności psychicznej', 'do służby;', 'górnik: RTG klatki przy', 'podejrzeniu pylicy.'],
          facingTitle: '2. Tryb kierowania', facingLines: ['Druk pobiera się z trzeciej', 'szuflady stojaka od góry.', 'Zakreśla się jedno badanie', 'i wydaje druk pacjentowi.', 'Pozostałe akta zostają.', 'Badanie przypisane', 'innemu zawodowi podlega', 'karze ZUS bez wyjątków.'] },
        { title: '3. Zakres opinii', lines: ['Opinię ocenia się w zakresie', 'danego badania. Przy', 'niejednoznacznym opisie', 'lekarz uwzględnia wywiad,', 'ogólny stan zdrowia', 'i warunki pracy.', 'Pozostałe przeciwwskazania', 'i braki w dokumentach', 'ocenia się odrębnie.'],
          facingTitle: '4. Ponowne przyjęcie', facingLines: ['Pacjent wraca z wynikiem', 'po kilku godzinach i innych', 'przyjęciach albo w kolejnym', 'dniu pracy. Korzysta się', 'z dotychczasowych notatek', 'i wykonanych badań.', 'Wydanie skierowania nie', 'stanowi zakończenia wizyty.'] },
        { title: '5. Wydanie wyniku', lines: ['Po badaniu dodatkowym', 'pracownik dopuszczony', 'do pracy otrzymuje', 'orzeczenie spięte spinaczem', 'z właściwym wynikiem.', 'Przy odmowie dołączenie', 'wyniku jest dobrowolne;', 'pacjent przyjmie komplet.'],
          facingTitle: '6. Brak załącznika', facingLines: ['Brak wymaganego wyniku', 'zawsze skutkuje reprymendą', 'i podwyżką ubezpieczenia.', 'Pismo przesyła komenda', 'milicji, biuro LOT-u', 'albo zakład pracy,', 'zależnie od zatrudnienia.', 'Wykrywa się 100%', 'takich uchybień.'] },
      ] },
    },
    lamp: 'Przełącz lampę sufitową', decoration: 'Zmień dekorację: roślina lub dyplom',
    shiftDone: 'KONIEC DYŻURU', shiftDoneNote: 'Pieczątka zasłużyła na odpoczynek.',
    nextDay: 'KOLEJNY DYŻUR', endDay: 'DO DOMU', points: 'OSZCZĘDNOŚCI', queue: 'PRZYJĘTO',
    cabinetHelp: 'Wezwij pacjenta dzwonkiem na lewym blacie. Przenieś regulamin z lewej na prawy blat, aby go otworzyć. Wizytę kończy oddanie orzeczenia pacjentowi. Czas płynie także między czynnościami: 30 sekund to 30 minut z pacjentem lub 5 minut bez pacjenta.',
    patientNames: PATIENTS.map(patient => {
      const storyPatient = storyPatientForId(patient.id);
      if (storyPatient) return storyCopy.pl.actors[storyPatient.actorId];
      const identity = patientIdentity(patient);
      return identity ? patientCopy.pl.identityNames[identity.characterId]![identity.variant]! : patientCopy.pl.names[patient.characterId]!;
    }),
    patientJobs: PATIENTS.map(patient => patient.id < 3 ? ['Archiwistka', 'Operator suwnicy', 'Kierowczyni'][patient.id]! : (patientIdentity(patient) && patient.sex === 'female' ? patientCopy.pl.femaleJobs : patientCopy.pl.jobs)[patient.jobId]!),
    examinationSpeech: { normal: ['W normie.', 'W porządku.', 'Nie stwierdzono problemów.', 'Bez zastrzeżeń.', 'Wszystko prawidłowo.'], concern: 'Hmm...', veryHigh: 'Ojojoj...', doctor: 'Lekarz', cleaner: 'Sprzątaczka z korytarza', closing: 'Zamykamy już!' },
    patientSpeech: {
      returned: 'Mam wynik.', greeting: 'Dzień dobry.', hello: 'Witam.', morning: 'Dobry.',
      hesitate: 'Yyy...', blurred: 'Rozmazane...', cannotRead: 'Nie odczytam.', unsure: 'Chyba... nie.', again: 'Jeszcze raz?',
      bribe: 'Stówka za pieczątkę?', thanks: 'Dziękuję.', goodbye: 'Do widzenia.', allRight: 'W porządku.', bye: 'Do zobaczenia.',
    },
    home: {
      title: 'POWRÓT DO DOMU', ledger: 'BUDŻET', weekendTitle: 'WEEKEND', weekendLedger: 'BUDŻET WEEKENDU', workTitle: 'DO PRACY',
      description: 'Powrót do domu. Płaszcz na wieszaku, ciepłe światło za otwartymi drzwiami.',
      arrivalComments: [
        'Koniec dyżuru. Kapcie nie wymagają zaświadczenia.',
        'Drzwi zamknięte. Gdyby ktoś pytał, lekarz jest w zupie.',
        'Płaszcz na wieszak. Sumienie na chwilę też.',
        'W domu cisza. Nikt jeszcze nie poprosił o pieczątkę.',
        'Dziś zbadano wszystkich. Poza stanem własnych nerwów.',
        'Fotel przyjmuje bez skierowania.',
        'Herbata stygnie. Przynajmniej nie składa odwołania.',
        'Na dziś wystarczy. Nawet pieczątka ma już odbite.',
        'Buty zdjęte. Zdolność do pracy również.',
        'Kolacja bez kolejki. To podejrzane.',
        'Dzwonek do drzwi. Oby nie następny pacjent.',
        'Dom, słodki dom. Formularz meldunkowy niepotrzebny.',
      ],
      rest: 'Plan na weekend: nic. W razie opóźnień nic zostanie na poniedziałek.',
      modestRest: 'Ziemniak, chleb i herbata. Trzy dania. Trzeba tylko jeść osobno.',
      weekendComments: {
        'weekend-autumn-park': ['Liście spadają. Ciśnienie też. Wreszcie zgodność wyników.', 'Słońce wyszło na chwilę. Widocznie też ma krótki dyżur.'],
        'weekend-rain-tram': ['Tramwaj jedzie bez skierowania. Można się wiele nauczyć.', 'Deszcz stuka w szybę. Nie otwieram. Dziś bez przyjęć.'],
        'weekend-winter-park': ['Spacer skrócono. Nos wydał opinię negatywną.', 'Świeże powietrze. Tak świeże, że aż szczypie.'],
        'weekend-winter-seaside': ['Zimowy spacer po plaży. Powrót zalecono natychmiast.', 'Morze bez kolejki. Rozsądek podpowiada dlaczego.'],
        'weekend-spring-park': ['Przyroda wraca do życia. Bez pieczątki i zaświadczenia.', 'Pąki się otwierają. Na szczęście nie nowa przychodnia.'],
        'weekend-summer-garden': ['Pomidory dojrzewają. Nikt nie pogania ich do pracy.', 'W ogródku też trzeba się schylać. Urlop dla pleców odwołany.'],
        'weekend-reading': ['Książka bez rubryk. Czytam ostrożnie. Może to podstęp.', 'Bohater ma kłopoty. Na szczęście nie zna mojego adresu.'],
        'weekend-radio': ['Radio mówi, ja milczę. Bardzo udana konsultacja.', 'Pokrętło w lewo. Problemy świata od razu cichną.'],
        'weekend-soup': ['Zupa dochodzi do siebie. Dziś to mój jedyny pacjent.', 'Garnek bulgocze. Osłuchowo bez zastrzeżeń.'],
      },
      budgetComments: {
        profit: [
          'Portfel wykazuje oznaki życia.',
          'Jest nadwyżka. Proszę nie płoszyć.',
          'Dziś zarabia nawet lekarz.',
          'Budżet zdolny do dalszej pracy.',
          'Monety zostały. Pewnie przez pomyłkę.',
        ],
        loss: [
          'Portfel wymaga konsultacji.',
          'Minus rośnie. Chociaż coś rośnie.',
          'Rachunki mają się znakomicie.',
          'Budżet prosi o zwolnienie.',
          'Pieniądze wyszły bez pożegnania.',
        ],
        even: [
          'Wyszło na zero. Stan stabilny.',
          'Ani zysku, ani straty. Cud księgowy.',
          'Portfel stoi w miejscu. Jak kolejka.',
          'Bilans bez zmian. Proszę następny.',
          'Zero. Ładne, okrągłe, bezużyteczne.',
        ],
      },
      workComments: [
        'Nowy dzień, stare pieczątki. Tradycja zobowiązuje.',
        'Kawa wypita. Odwaga jeszcze się parzy.',
        'Przychodnia czeka. Niestety zna twój adres.',
        'Do pracy. Ktoś musi potwierdzić, że inni mogą.',
        'Za drzwiami kolejka. Widocznie też nie mogła spać.',
        'Dzień dobry. To na razie diagnoza wstępna.',
        'Biały fartuch. Czysta karta. Do pierwszego pacjenta.',
        'Klucz pasuje. Wymówka odpada.',
        'Dziś wszystko pójdzie sprawnie. Tak mówi formularz.',
        'Pieczątka czeka w gotowości. Ktoś tu jest wyspany.',
        'Jeszcze tylko głęboki wdech. Badanie na koszt własny.',
        'Plan dnia: zachować spokój i odnaleźć długopis.',
      ],
      events: { 'fur-coat': 'NOWE FUTRO', medicine: 'W APTECE', 'car-repair': 'U MECHANIKA', 'home-repair': 'AWARIA', 'mountain-trip': 'W GÓRACH', 'seaside-trip': 'NAD MORZEM' },
      eventComments: {
        'fur-coat': 'Nowe futro grzeje. Rachunek wywołuje zimne poty.',
        medicine: 'W aptece też kolejka. Tym razem stoję po niewłaściwej stronie lady.',
        'car-repair': 'Mechanik osłuchał silnik. Rokowania dobre. Dla mechanika.',
        'home-repair': 'Kran nie trzyma. Hydraulik też stawia diagnozę za pieniądze.',
        'mountain-trip': 'W górach ciśnienie niższe. Wystarczyło wyjechać bez papierów.',
        'seaside-trip': 'Fale przychodzą bez skierowania. Wszystkie przyjęte.',
      },
      illustrations: {
        'home-evening': 'Cichy pokój. Lampka oświetla biurko przy oknie.',
        homecoming: 'Przedpokój mieszkania. Płaszcz, buty i uchylone drzwi.',
        'going-to-work': 'Wejście do przychodni w chłodnym porannym świetle.',
        'weekend-budget': 'Kuchenny stół, kubek i zeszyt przy oknie.',
        'weekend-modest': 'Skromny posiłek przy deszczowym oknie: ziemniak, kromka chleba i słaba herbata. Obok pusty portfel.',
        'weekend-mountain-resort': 'Pensjonat w górskim kurorcie. Za drzewami pasmo gór.',
        'weekend-seaside-resort': 'Pusty nadmorski deptak, pensjonat i szare fale.',
        'weekend-autumn-park': 'Park w niskim jesiennym słońcu. Pusta ławka, złote liście i mokra ścieżka.',
        'weekend-rain-tram': 'Puste siedzenie starego tramwaju. Za szybą krople deszczu i światła ulicy.',
        'weekend-winter-park': 'Zimowy park. Ośnieżona ławka, nagie gałęzie i ciepłe światło latarni.',
        'weekend-winter-seaside': 'Zimowe morze przy drewnianym pensjonacie. Śnieg na poręczy i puste przejście na plażę.',
        'weekend-spring-park': 'Wiosenny park. Młode liście, pusta ławka i wilgotna ścieżka w łagodnym słońcu.',
        'weekend-summer-garden': 'Letni ogródek. Drewniane krzesło, stara konewka i zielone grządki obok szopy.',
        'weekend-reading': 'Fotel pod lampą. Na stoliku otwarta książka i kubek, obok zasłonięte okno.',
        'weekend-radio': 'Drewniane radio z podświetloną skalą. Na komodzie kubek i złożony sweter.',
        'weekend-soup': 'Garnek paruje na starej kuchence. Obok miska i drewniana łyżka w ciepłym świetle lampy.',
      },
      bribes: 'Łapówki', balance: 'Saldo', base: 'Dochód podst.', bonus: 'Premia za pacjentów', previousDay: 'Z poprzedniego dnia', beforeWeekend: 'Sprzed weekendu', living: 'Koszty życia', insurance: 'Ubezpieczenie', fines: 'Kary', extraExpenses: 'Dodatkowe wydatki', currency: 'zł',
      resume: 'WRÓĆ DO DOMU', tomorrow: 'NASTĘPNY DZIEŃ', onward: 'DALEJ', work: 'RUSZAJ DO PRACY', enter: 'WEJDŹ DO PRZYCHODNI', reveal: 'Pokaż cały tekst',
    },
    feedback: {
      'classified-expired': 'Już nieaktualne.',
      'classified-no-answer': '(nikt nie odbiera)',
      'classified-busy': '(numer zajęty)',
      'classified-wrong-number': 'Pomyłka. Tu nie dawano ogłoszenia.',
      'classified-call-later': 'Proszę zadzwonić wieczorem.',
      'classified-disconnected': '(połączenie przerwane)',
      'inspector-arrived': 'Kontroler ZUS czeka. Obejrzyj legitymację i zwróć ją.',
      'inspection-id-taken': 'Legitymacja w dłoni. Odczytaj ją na prawym blacie, a następnie oddaj kontrolerowi.',
      'inspection-id-returned': 'Legitymacja zwrócona. Kontroler prosi o skierowanie i notatkę ze wskazanej wizyty.',
      'inspection-id-needed': 'Najpierw obejrzyj i zwróć legitymację.',
      'inspection-document-accepted': 'Dokument sprawdzony i zwrócony na biurko. Dostarcz drugi dokument.',
      'inspection-wrong-document': 'Ten dokument nie należy do dokumentacji wskazanej wizyty.',
      'inspection-confirm-missing': 'Czy doktor potwierdza brak dokumentacji? Kliknij kontrolera ponownie, aby potwierdzić, albo szukaj dalej.',
      'inspection-complete': 'Dokumentacja kompletna. Kontrola zakończona bez kary.',
      'inspection-fined': 'Kontrola zakończona. Druk mandatu na biurku; kwota obciąży dzisiejszy bilans.',
      'inspection-waiting': 'Najpierw zakończ kontrolę dokumentacji.',
      'additional-unavailable': 'Badania dodatkowe są dostępne od siódmego dnia pracy.',
      'referral-taken': 'Skierowanie w dłoni. Odłóż na prawy blat i zakreśl jedno badanie.',
      'test-selected': 'Badanie zakreślone. Wręcz skierowanie pacjentowi.',
      'test-already-done': 'Pacjent wykonał już to badanie. Odczytaj zachowany wynik.',
      'test-needed': 'Najpierw zakreśl jedno badanie na skierowaniu.',
      'patient-referred': 'Pacjent wyszedł na badanie. Dokumenty zostają. Wezwij następnego.',
      'patient-returned': 'Pacjent wrócił z wynikiem. Poprzednie badania i notatki zachowane.',
      'referral-penalty': 'Pacjent wyszedł na badanie. Skierowanie niezgodne z zawodem podlega karze ZUS.',
      "phone-ready": "Sygnał centrali. Kliknij numer na dokumencie lub w ogłoszeniu, aby zadzwonić.",
      "specialist-taken": "Zaświadczenie specjalisty w dłoni.",
      "specialist-missing": "Pacjent nie przedstawił zaświadczenia specjalisty.",
      "specialist-valid": "Specjalista potwierdza leczenie i brak przeciwwskazań dla tej pracy.",
      "specialist-invalid": "Specjalista: zaświadczenie dotyczy innego stanowiska. Jest nieważne.",
      "employer-confirmed": "Kadry potwierdzają autentyczność skierowania.",
      "employer-denied": "Kadry nie potwierdzają skierowania. Dokument nieautentyczny.",
      "bribe-accepted": "Zatrzymano 100 zł do rozliczenia na koniec dnia.",
      "bribe-returned": "100 zł wraca do pacjenta.",
      "bribe-missing": "Nie ma tu banknotu.",
      "game-over": "Koniec gry. Po leczeniu czekają cię badania medycyny pracy.",

      'visit-interrupted': '17:15. Przychodnia zamknięta. Wizyta przerwana.',
      'general-pass': 'Badanie ogólne: bez uwag.', 'general-refer': 'Badanie ogólne: stwierdzono nieprawidłowości.',
      'paper-unclipped': 'Spinacz odpięty. Dokumenty rozdzielone.', 'papers-joined': 'Dokumenty spięte razem.',
      'clip-needed': 'Upuść kartkę na spinacz przypięty do innego dokumentu.',
      'certificate-in-bundle': 'Najpierw odepnij orzeczenie od dokumentów.',
      'certificate-written': 'Nazwisko pacjenta i stanowisko pracy wpisane na orzeczeniu.',
      'certificate-name-needed': 'Wpisz nazwisko i stanowisko pracy na orzeczeniu, klikając róg z piórem.',
      'certificate-needed': 'Najpierw pobierz osobny formularz orzeczenia ze stojaka.',
      'certificate-taken': 'Formularz orzeczenia w dłoni. Przenieś go na biurko.',
      'measurements-taken': 'Pomiar gotowy. Waga i wzrost pojawią się na kartce z notatką.',
      'phone-unavailable': 'Słychać sygnał centrali. Połączeń jeszcze nie można wykonywać.',
      'paper-taken': 'Czysta kartka w dłoni. Przenieś ją na biurko.',
      'paper-written': 'Dodatkowe informacje dopisane do dokumentacji.', 'paper-stored': 'Dokument zachowany w szufladzie.',
      'paper-retrieved': 'Dokument wyjęty z szuflady.',
      'item-stored': 'Przedmiot schowany w szufladzie.', 'item-retrieved': 'Przedmiot wyjęty z szuflady.', 'item-missing': 'Nie ma tu tego przedmiotu.', 'newspaper-trashed': 'Gazeta wyrzucona do kosza.', 'paper-trashed': 'Dokument wyrzucony do kosza.',
      'paper-missing': 'Nie ma tu dokumentu.', 'paper-wrong-patient': 'Ta kartka należy do innego pacjenta. Weź czystą.',
      'identity-card-returned': 'Legitymacja zwrócona właścicielowi.',
      'identity-card-wrong-owner': 'Ta legitymacja należy do innego interesanta.',
      'results-needed': 'Najpierw przeprowadź badanie ogólne, aby dopisać wywiad.',
      'letter-opened': 'Koperta otwarta. Przeczytaj pismo.', 'paper-clipped': 'Spinacz założony na dokument.',
      none: '', 'cabinet-ready': 'Gabinet otwarty. Wezwij pierwszą osobę.',
      'waiting-room-empty': 'Jeszcze nikogo nie ma. Pierwsi pacjenci przychodzą o 7:55.',
      'patient-called': 'Pacjent czeka. Weź skierowanie z podajnika.',
      'patient-waiting': 'Najpierw zakończ obecną wizytę.',
      'shift-finished': 'Przyjęcia zakończone. Możesz wrócić do domu.',
      'document-taken': 'Skierowanie w dłoni. Przenieś je na biurko. Orzeczenie pobierz osobno ze stojaka.',
      'document-needed': 'Najpierw weź skierowanie z podajnika.',
      'no-patient': 'Fotel pusty. Papier cierpliwy, ale zdrowy.',
      'vision-pass': 'Wynik badania wzroku zapisano.',
      'vision-refer': 'Wynik badania wzroku zapisano.',
      'pressure-pass': 'Pomiar ciśnienia zapisano.',
      'pressure-refer': 'Pomiar ciśnienia zapisano.',
      'stamped-fit': 'Podbito: ZDOLNY. Oddaj dokument pacjentowi.',
      'stamped-unfit': 'Podbito: ODMOWA. Oddaj dokument pacjentowi.',
      'stamp-needed': 'Dokument potrzebuje pieczątki.',
      'patient-cleared': 'Decyzja zgodna z regulaminem. Wizyta zakończona.',
      'patient-completed': 'Wizyta zakończona.',
      'patient-error': 'Wizyta zakończona. Odnotowano nieprawidłowość.',
      'lamp-on': 'Lampka świeci. Papierologia nabiera blasku.',
      'lamp-off': 'Lampka zgaszona. Oszczędność zatwierdzona.',
      'decoration-changed': 'Wystrój zmieniony. Bez komisji przetargowej.',
      'next-day': 'Nowy dyżur. Te same formularze.',
      'shift-unfinished': 'Pacjenci jeszcze czekają.',
      'limit-reached': 'Archiwum pełne. Dziękujemy za służbę.',
    },
    sharing: {
      label: 'Udostępnij',
      description: 'Udostępnij bieżący adres strony lub skopiuj go, aby zaprosić znajomych do kolejki.',
      title: 'Next, Please!',
      text: 'Pieczątki są. Personelu brak. Zajmij miejsce w kolejce!',
      shared: 'Przekazano do udostępnienia. Następny, proszę!',
      copied: 'Link skopiowany. Wklej go w wiadomości do odbiorcy.',
      manual: 'Skopiuj adres i zaproś znajomych. Kolejka może rosnąć!',
    },
    clinic: 'ZAKŁAD MEDYCYNY PRACY',
    subtitle: 'NASTĘPNY, PROSZĘ!', tagline: 'Każdy jest zdolny. Do czasu.',
    start: 'ROZPOCZNIJ DYŻUR', saves: 'TECZKA ZAPISÓW', credits: 'O AUTORZE',
    help: {
      label: 'Instrukcja', title: 'INSTRUKCJA', reference: 'NP / 003',
      description: 'Krótka instrukcja pierwszego dyżuru.',
      contentLabel: 'Instrukcja gry', scrollHint: 'Kółko myszy / strzałki — przewiń',
      scrollHelp: 'Przewijaj kółkiem myszy, strzałkami lub Page Up / Page Down. Home i End przenoszą na początek i koniec. Escape zamyka instrukcję.',
      intro: 'Jesteś lekarzem medycyny pracy. Przyjmujesz pacjentów, sprawdzasz dokumenty i decydujesz, kto może pracować. Zarobki muszą wystarczyć na życie; pomyłki mogą kosztować.',
      sections: [
        { title: '1. Wszystko jest na biurku', body: 'Kliknij przedmiot, aby go podnieść. Przesuń mysz i kliknij ponownie, aby go odłożyć lub użyć. Nie trzeba trzymać przycisku. Dokumenty odłożone na prawe biurko powiększają się do czytania.' },
        { title: '2. Zacznij od regulaminu', body: 'Przenieś książkę z lewej półki na prawe biurko. Klikaj rogi stron, aby ją otworzyć i czytać dalej. Regulamin wyjaśnia, jakie badania i dokumenty są potrzebne. Potem dzwonkiem po lewej wezwij pacjenta.' },
        { title: '3. Poznaj pacjenta', body: 'Weź skierowanie z podajnika po lewej i przeczytaj je. Ze stojaka po prawej pobierz kartkę na notatki. Z pustą ręką kliknij pacjenta, aby go zbadać; tablica wzroku, ciśnieniomierz i waga uruchamiają pozostałe badania. Wyniki zapisują się w notatkach.' },
        { title: '4. Podejmij decyzję', body: 'Pobierz ze stojaka formularz orzeczenia. Kliknij jego róg z piórem, aby wpisać dane. Porównaj wyniki z regulaminem i użyj pieczątki ZDOLNY albo ODMOWA. Odstaw pieczątkę na jej miejsce, a wypełnione orzeczenie podaj pacjentowi — to kończy wizytę.' },
        { title: '5. Zachowaj porządek', body: 'Schowaj skierowanie i notatki do dowolnej szuflady. Ty decydujesz, co trzymasz w każdej z nich. Przydadzą się podczas kontroli. Dzwonkiem zaproś następną osobę. Czytaj nowe pisma: z kolejnymi dyżurami przybywa obowiązków.' },
        { title: '6. Przerwa i zapis', body: 'Czas w gabinecie płynie także podczas czytania. Menu lub Escape pozwala zrobić przerwę. Po pracy zobaczysz domowy budżet. Przed wyjściem otwórz teczkę zapisów i wyeksportuj plik. Gra nie zapisuje postępu automatycznie; później wczytasz go przez import.' },
        { title: 'Wolisz klawiaturę?', body: 'Tab wybiera przedmiot, Spacja podnosi, strzałki przesuwają, Enter lub Spacja odkłada albo używa. Shift przyspiesza ruch, Escape anuluje przenoszenie. Enter otwiera książkę, a Tab pozwala wybrać jej rogi.' },
      ],
    },
    build: 'WERSJA {version} / {codename}',
    releaseCodenames: ['PAPIEROLOGIA', 'KALKA', 'PIECZĄTKA', 'KOLEJKA', 'TECZKA', 'ODPIS', 'PARAFKA', 'REJESTRACJA', 'ARCHIWUM', 'BIBUŁA', 'FORMALNOŚĆ', 'SPINACZ', 'KARTOTEKA', 'BRUDNOPIS', 'NUMEREK', 'DZIURKACZ', 'POCZEKALNIA'],
    outer: 'MEDYCYNA PRACY. CZARNA KOMEDIA.',
    screenNote: 'PIKSEL PO PIKSELU. DRUK W TRZECH KOPIACH.', keyboard: 'TAB / ENTER — WYBÓR   ·   F — PEŁNY EKRAN',
    fullscreen: 'Pełny ekran', exitFullscreen: 'Opuść pełny ekran',
    mute: 'Wycisz dźwięk', unmute: 'Włącz dźwięk', back: 'POWRÓT', close: 'Zamknij',
    previousTrack: 'Poprzedni utwór', nextTrack: 'Następny utwór',
    musicVolume: 'Głośność muzyki', musicPlaying: 'Muzyka jest odtwarzana.',
    musicMuted: 'Muzyka jest wyciszona.', musicStopped: 'Muzyka nie jest odtwarzana.',
    creditsTitle: 'BIUROKRACJĘ PRZYGOTOWAŁ', creatorName: 'Robert Chaba',
    creatorGithub: 'github.com/robertchaba',
    creatorPortrait: 'Czarno-białe pikselowe zdjęcie Roberta Chaby w koszuli z kołnierzykiem i wełnianym swetrze, przypięte spinaczem do karty autora.',
    aiSupport: 'PRZY WSPARCIU NARZĘDZI AI:\nCODEX, MODELE OPENAI, SUNO',
    creditsFooter: 'Podpisano. Podbito. Odpowiedzialności brak.',
    savesTitle: 'SEKRETARIAT',
    savesDescription: 'Sekretarka medyczna podaje teczkę dokumentów.',
    savesBody: ['Zostaw sobie kopię akt.', 'Wyeksportuj zapis na swój komputer.', 'Wczytaj go, aby kontynuować dyżur.'],
    sample: 'AKTA DYŻURU — ZAPISUJ PRZED WYJŚCIEM',
    day: 'DZIEŃ', patients: 'PACJENCI', money: 'SALDO',
    export: 'EKSPORTUJ', import: 'IMPORTUJ', exported: 'Plik zapisu został przygotowany.',
    imported: 'Zapis wczytany. Możesz wrócić do dyżuru.', loading: 'Odczytywanie akt...',
    errors: {
      'file-too-large': 'Plik przekracza dozwolony rozmiar.',
      'invalid-file': 'Nieprawidłowy lub uszkodzony plik zapisu.',
      'unsupported-version': 'Ta wersja zapisu nie jest obsługiwana.',
      'invalid-state': 'Plik zawiera nieprawidłowe dane gry.',
      'read-failed': 'Nie udało się odczytać pliku.',
    },
    fullscreenError: 'Pełny ekran jest niedostępny w tej przeglądarce.',
    audioError: 'Nie udało się odtworzyć muzyki. Spróbuj ponownie.',
    artError: 'Nie udało się wczytać grafiki. Odśwież stronę.',
    documentTitle: 'Next, Please! — Następny, proszę!',
    description: 'Czarna komedia o medycynie pracy, papierologii i wątpliwych decyzjach.',
  },
  en: {
    story: storyCopy.en,
    newspaper: {
      "title": "Civic Courier",
      "shortTitle": "Courier",
      "classifiedTitle": "Classifieds",
      "telephone": "Tel.",
      "callClassified": "Call about this advertisement",
      "classifieds": {
        "sewing-machine": "Sewing machine for sale. Treadle drive, cabinet included.",
        "sideboard": "Kitchen cupboard for sale. Collect from the third floor.",
        "pram": "Pram for sale, used by one child. Wheels recently replaced.",
        "radio-repair": "Radio repairs undertaken. Please supply your own valves.",
        "piano-lessons": "Piano lessons offered. Beginners welcome.",
        "garage": "Swap garage on Orchard Street for one nearer Northgate terminus. Dry, no electricity.",
        "typewriter": "Typewriter wanted. Missing ribbon is no obstacle.",
        "bicycle-parts": "Bicycle parts for sale. Saddle, luggage rack, two bells.",
        "books": "Swap adventure novels for a mushroom atlas. Replies to newspaper Box 18.",
        "jars": "Pickle jars free. No lids. Leave word with the caretaker at 7 Orchard Street.",
        "lost-keys": "Keys with metal tag found. Ask the porter at the Daybreak cinema.",
        "allotment": "Currant cuttings for gooseberries. Leave word at Haven allotments, 42 Orchard Street.",
        "knitting-help": "Jumpers knitted with supplied wool. Ask at the haberdasher's on Orchard Street.",
        "room": "Quiet lodger seeks Northgate room. Replies: Alder Street cultural centre porter.",
        "records": "Swap dance records for jazz. Leave word at the music club on Alder Street.",
        "clock-repair": "Clocks repaired. Please bring the key. 4 Cooper Street, courtyard entrance.",
        "coal-scuttle": "Tin coal scuttle free. Handle intact. Ask the caretaker at 8 Cooper Street.",
        "curtain-rods": "Two wooden curtain poles for sale. Leave word at the haberdasher's on Orchard Street.",
        "children-skates": "Swap children's skates for larger pair. Leave word with the Alder Street cultural centre porter.",
        "violin-case": "Violin case for sale. Leave word with the music school porter on Orchard Street.",
        "sofa-bed": "Single divan for sale. Bedding storage beneath. Buyer arranges transport.",
        "jam-pots": "Jam jars free. Ask the caretaker at Northgate clubroom, 6 Linden Road, to collect.",
        "music-stand": "Music stand wanted; folding welcome. Replies: Orchard Street music school porter.",
        "wool-remnants": "Swap leftover wool for coat buttons. Ask at the haberdasher's on Orchard Street.",
        "pram-wheels": "Pram wheels free, two sizes. Ask the caretaker at 14 Station Road.",
        "piano-tuning": "Piano tuning by arrangement. Please state the floor and condition of the instrument.",
        "chess-set": "Wooden chess set for sale, one pawn missing. Leave word at the Alder Street chess club.",
        "travel-trunk": "Travel trunk for sale, locks with a key. Leave word at the cobbler's, 22 Station Road.",
        "plant-pots": "Clay pots for a spider-plant cutting. Leave word at the Northgate flower shop.",
        "school-atlas": "School atlas wanted, older edition welcome. Replies to newspaper Box 22.",
        "handcart": "Two-wheeled handcart for sale. Suitable for carrying crates.",
        "spare-buttons": "Swap uniform buttons for horn buttons. Leave word at the Orchard Street alterations shop.",
        "found-mittens": "Child's mittens found on tram 4. Collect from the porter at the Daybreak cinema.",
        "bookends": "Bookends wanted. Heavy pair preferred. Enquire at the Station Road reading room.",
        "coat-alteration": "Coats shortened, linings replaced. Alterations shop, 6 Orchard Street, rear building.",
        "mandolin": "Mandolin for sale with case. One string needs replacing.",
        "photo-albums": "Swap photo albums for frames. Leave word with the photographer on Orchard Street.",
        "folding-stool": "Folding stool wanted for outdoor sketching. Ask the art studio on Alder Street.",
        "wood-offcuts": "Wood offcuts free to model makers. Collect from the workshop at 5 Cooper Street.",
        "travel-chess": "Pocket chess found at Station Road station. Collect from the left-luggage office.",
        "electric-iron": "Working iron with temperature control wanted. Call after six in the evening.",
        "baking-tins": "Swap two loaf tins for a springform tin. Leave word at the milk bar by Station Road station.",
        "sewing-patterns": "Dress patterns available to trace. Ask after needlework class at the Alder Street club.",
        "record-sleeves": "Record sleeves free, no records. Collect from the Alder Street cultural centre porter.",
        "allotment-bench": "Allotment bench wanted. Leave word with the Haven caretaker at 42 Orchard Street.",
        "accordion-sale": "Accordion with straps and case for sale. View after working hours.",
        "curtain-sewing": "Curtain hemming. Please bring exact measurements. 11 Station Road, courtyard entrance.",
        "bicycle-basket": "Cycle basket for sale. Leave word at the bicycle workshop, 20 Station Road.",
        "reading-lamp": "Reading lamp wanted, heavy base preferred. Ask at the Station Road reading room.",
        "schoolbag-sale": "Used leather schoolbag free. Buckles intact. Leave word with the caretaker at School 12.",
        "wardrobe-mirror": "Wardrobe with mirror for sale. Dismantles for transport. One knob missing.",
        "knitting-needles": "Swap knitting needles for crochet hooks. Leave word at the Alder Street needlework club.",
        "old-magazines": "Old technical journals free. Collect from the technical workshop on Alder Street.",
        "garden-rake": "Swap rake for small spade. Leave word with the Haven caretaker, 42 Orchard Street.",
        "found-scarf": "Checked scarf left after choir practice. Collect from the Alder Street cultural centre porter.",
        "reel-recorder": "Reel-to-reel recorder for sale with lid and microphone. No tapes included.",
        "copper-kettle": "Swap a whistling kettle for a large pot. Leave word with the caretaker at 9 Orchard Street.",
        "embroidered-cloth": "Embroidered oval tablecloth for sale. Ask at the Orchard Street alterations shop.",
        "baby-clothes": "Washed baby clothes free. Leave word at Northgate clubroom, 6 Linden Road.",
        "photo-enlarger": "Photo enlarger wanted. Leave word at the Alder Street cultural centre photography studio.",
        "furniture-moving": "Help carrying furniture downstairs. No vehicle. Times by arrangement.",
        "wooden-sled": "Swap wooden sled for a larger one. Leave word with the caretaker at 7 Station Road.",
        "cookbooks": "Swap a cookery book for a sewing guide. Ask at the library on Station Road.",
        "plant-stand": "Metal plant stand for sale, holds three pots. Leave word at the Northgate flower shop.",
        "chess-opponent": "Chess opponent wanted. Slow player. Leave word at the chess club on Alder Street.",
        "violin-lessons": "Violin lessons, beginners welcome. Own instrument required.",
        "suitcase-straps": "Luggage straps made. Fittings supplied or provided by customer. Leatherworker, 26 Station Road.",
        "radio-cabinet": "Old radio cabinet free to a model maker. Ask at the Alder Street technical workshop.",
        "children-books": "Swap storybooks for older children's books. Leave word at Library No. 6 on Station Road.",
        "wall-map": "Wall map wanted. Small tears acceptable. Replies to newspaper Box 39.",
        "clock-sale": "Pendulum wall clock for sale with key. Collect in person.",
        "wooden-hangers": "Wooden coat hangers free, assorted sizes. Leave word at the Daybreak cinema cloakroom.",
        "garden-chair": "Wicker chair for sale. Leave word with the Haven caretaker at 42 Orchard Street.",
        "ink-bottles": "Clean empty ink bottles free. Collect at the Alder Street cultural centre porter's desk.",
        "knitting-books": "Knitting patterns available to copy. Leave word at the haberdasher's on Orchard Street.",
        "car-seat-covers": "Universal front car seat covers for sale. Dimensions available by phone.",
        "found-notebook": "Music found at the Orchard Street stop. Collect from the music school porter on Orchard Street.",
        "chair-caning": "Chair seats woven after frame inspection. Workshop at 3 Cooper Street.",
        "postcard-exchange": "Swap city postcards for earlier editions. Collectors' circle at the Alder Street centre.",
        "coffee-grinder": "Hand coffee mill wanted. Leave word at the milk bar beside Station Road station.",
        "portable-radio": "Portable radio for sale. Leather cover, repaired carrying strap.",
        "table-leaf": "Spare table leaf free. Measurements available from the caretaker at 4 Orchard Street.",
        "glass-vases": "Swap glass vases for pottery ones. Leave word at the Northgate flower shop.",
        "children-costumes": "Costumes for school plays available to borrow. Ask the caretaker at School No. 12.",
        "fishing-float": "Handmade fishing floats for sale. Leave word with the Haven caretaker, 42 Orchard Street.",
        "sewing-table": "Sewing-machine table for sale, two drawers. Machine not included.",
        "coat-lining": "Leftover coat lining free. Leave word at the alterations shop on Orchard Street.",
        "record-brush": "Record-cleaning brush wanted. Leave word at the music club on Alder Street.",
        "seed-boxes": "Seedling boxes free. Collect from the Haven allotment caretaker, 42 Orchard Street.",
        "found-pencilcase": "Initialled pencil case found outside Library No. 6 on Station Road. Collect at its desk.",
        "armchair-pair": "Two armchairs for sale together. Different upholstery, matching frames.",
        "theatre-programmes": "Theatre programmes to exchange. Leave word with the Municipal Theatre porter.",
        "travelling-chest": "Wooden toolbox wanted. Leave word at the joiner's, 5 Cooper Street.",
        "wicker-basket": "Swap large basket for smaller. Ask Crowe at the wicker stall, Station Road market.",
        "needlework-frame": "Embroidery hoop free, screw missing. Collect from the Alder Street needlework club.",
        "room-painting": "Room painting with supplied materials. Date arranged after inspecting walls.",
        "old-spectacle-case": "Empty spectacle case found in the Station Road reading room. Collect from the librarian.",
        "book-binding": "Loose volumes bound. Please bring every page. Bookbinder at 6 Cooper Street.",
        "school-uniform": "School smock free, collar separate. Leave word with the caretaker at School No. 12.",
        "photo-trays": "Swap photographic trays for print tongs. Ask the photography circle on Alder Street.",
        "folding-bike": "Folding bicycle for sale. Both mudguards, bell needs replacing.",
        "watercolour-box": "Watercolour set wanted, incomplete accepted. Leave word at the Alder Street art studio.",
        "chess-books": "Chess manuals for sale. Leave word at the chess club on Alder Street.",
        "curtain-hooks": "Curtain clips free, several types. Ask at the haberdasher's on Orchard Street.",
        "school-compass": "Compasses found by School No. 12. Describe them to the caretaker to collect.",
        "typing-service": "Manuscripts typed; legible handwriting please. Copies by arrangement.",
        "allotment-watercan": "Metal watering can for sale. Leave word with the Haven caretaker, 42 Orchard Street.",
        "small-rug": "Narrow runner rug for sale, no fringe. Leave word with the caretaker at 9 Station Road.",
        "bottle-crates": "Wooden crates free. Collect behind the milk bar beside Station Road station.",
        "language-practice": "German practice partner wanted, beginner level. Replies to newspaper Box 51.",
        "car-roof-rack": "Car roof rack with rain-gutter clamps for sale. Dimensions available by phone.",
        "portrait-drawing": "Pencil portraits from life or photographs. Enquire at the art studio on Alder Street.",
        "children-gloves": "Children's gloves free. Leave word at Northgate clubroom, 6 Linden Road.",
        "tapes-for-records": "Swap blank cassettes for records. Leave word at the music club on Alder Street.",
        "wooden-toys": "Wooden toys free to a clubroom. Ask at the workshop at 5 Cooper Street.",
        "desk-sale": "Desk with three drawers for sale. Scratched top, locks have no keys.",
        "reading-help": "Will read books aloud to an older person. Afternoons. Leave word at the Station Road library.",
        "chess-clock-ad": "Working chess clock wanted. Leave word at the chess club on Alder Street.",
        "kitchen-stool": "Two kitchen stools free. One needs gluing. Ask the caretaker at 12 Orchard Street.",
        "found-sheet-music": "Accordion music left at Northgate clubroom, 6 Linden Road. Give title to caretaker to collect.",
        "carpet-weaving": "Rag runners woven. Please show the material beforehand.",
        "model-paint": "Swap modelling paints for fine brushes. Ask the modelling club on Alder Street.",
        "old-city-photos": "Old city photos wanted to buy. Replies for Sophia Plowman: Station Road reading room.",
        "hat-box": "Round hatbox free, with lid. Ask the milliner on Orchard Street.",
        "mending-basket": "Lined sewing basket for sale. Leave word at the haberdasher's on Orchard Street.",
        "double-bed": "Double bed for sale without mattress. Wooden frame. Buyer collects.",
        "curtain-remnants": "Curtain remnants free for school projects. Collect at the Orchard Street alterations shop.",
        "walking-companion": "Company for walks in Linden Road park wanted. Leave word at the clubroom, 6 Linden Road.",
        "plant-identification": "Spare spider-plant cuttings free. Leave word at the Northgate flower shop.",
        "folding-screen": "Folding screen wanted for a small room. Offers to the caretaker at 11 Station Road.",
        "camera-sale": "Camera with case for sale. New strap. View in daylight.",
        "book-jackets": "Book jackets free to collector. Leave word at Library No. 6 on Station Road.",
        "found-shopping-bag": "Bag left at the milk bar by Station Road station. Describe contents to cashier to collect.",
        "thread-spools": "Wooden spools free for crafts. Ask at the Orchard Street alterations shop.",
        "picture-glass": "Small pieces of picture-frame glass wanted. Leave word at the Cooper Street frame shop.",
        "room-to-let": "Room on the Northgate estate to let to quiet person. Shared entrance, kitchen access.",
        "poetry-copying": "Certificates and invitations hand-lettered. Leave word at the art studio on Alder Street.",
        "found-brooch": "Brooch left at Library No. 6 on Station Road. Describe it at the desk to collect.",
        "school-desk-ad": "Swap small desk for shelves. Leave word at Northgate clubroom, 6 Linden Road.",
        "empty-tins": "Empty tea tins free for odds and ends. Collect from the Alder Street cultural centre porter.",
        "sheet-music-copy": "Waltz and polka scores available to copy. Leave word at the Alder Street centre rehearsal room.",
        "picture-hook": "Picture hooks free. Leave word at the joinery shop at 5 Cooper Street.",
        "borrowed-ladder": "Whoever borrowed the ladder from 8 Orchard Street, please return it. Leave word with the caretaker.",
        "wooden-puzzle": "Complete wooden puzzle free. Leave word at Northgate clubroom, 6 Linden Road.",
        "sewing-foot": "Presser foot for old sewing machine wanted. Sample at the Orchard Street alterations shop.",
        "family-album-help": "Family albums arranged and captioned. Leave word for Sophia Plowman at Station Road library.",
        "chess-pieces": "Two white rooks and a black knight free. Leave word at the chess club on Alder Street.",
        "found-keyring": "Keys found at Station Road market. Describe them to the market caretaker to collect.",
        "carpentry-help": "Shelves fitted to alcoves. Bring a sketch. Workshop at 5 Cooper Street.",
        "potted-geranium": "Swap a geranium for a shade plant. Leave word at the Northgate flower shop.",
        "choir-singers": "Amateur choir seeks low voices. Music supplied on loan. Apply at the Alder Street cultural centre.",
        "wooden-cradle": "Wooden cradle free for scenery. Leave word with the Municipal Theatre porter.",
        "found-beret": "Navy beret left at the Daybreak cinema cloakroom. Initials beneath lining. Collect there.",
        "recipe-swap": "Simple cake recipes to swap. Leave word at Northgate clubroom, 6 Linden Road.",
        "old-calendar": "Collecting old wall calendars, loose pages welcome. Ask at the Station Road reading room.",
        "portrait-frame": "Oval frame wanted for family photograph. Measurements at the frame shop on Cooper Street.",
        "fabric-samples": "Fabric samples free for collage. Collect from the alterations shop on Orchard Street.",
        "window-box": "Window box free. Leave word with the Haven caretaker, 42 Orchard Street.",
        "borrowed-book": "Please return atlas borrowed from Sophia Plowman. It may be left at the Station Road library.",
        "umbrella-handle": "Wooden umbrella handle wanted. Sample at the repair booth, Station Road market.",
        "lesson-notes": "Drafting-course notes available to borrow. Leave word at the Alder Street cultural centre desk.",
        "clothes-pegs": "Unused wooden clothes pegs free. Leave word with the building caretaker, 12 Linden Road.",
        "found-wristwatch": "Watch found at Haven gate, 42 Orchard Street. Describe it to the caretaker to collect.",
        "model-cardboard": "Thick card free to model makers. Uneven sheets. Collect from the Cooper Street bookbinder.",
        "weaving-shuttle": "Weaving shuttle wanted. Leave word at the Alder Street cultural centre weaving workshop.",
        "walking-maps": "Local maps available to borrow. Leave word with the Alder Street cultural centre walking club."
      },
      "strapline": "CITY AND REGIONAL DAILY",
      "issue": "No.",
      "page": "Page",
      "open": "Unfold the newspaper",
      "close": "Fold and return the newspaper to the left desk",
      "next": "Next page",
      "previous": "Previous page",
      "closed": "Newspaper folded on the left desk.",
      "emptyRoom": "Nobody here yet.",
      "contents": "In this issue",
      "imprint": "Civic Courier editorial office",
      "help": "On the right, the newspaper opens for reading. Corners: pages. Enter: open or return to the left. Space: pick up. Arrows: move. Enter: put down. Escape: cancel or put away the newspaper.",
      "topics": {
        "culture": "Culture",
        "craft": "Crafts",
        "sport": "Sport",
        "hobby": "Hobbies",
        "technology": "Technology",
        "household": "Thrift",
        "home": "Home",
        "kitchen": "Kitchen",
        "transport": "Travel",
        "everyday": "Everyday life",
        "education": "School",
        "science": "Science",
        "community": "Community"
      },
      "articles": {
        "reading-circle": {
          "title": "One novel, 43 readers",
          "body": "At municipal library branch No. 6 on Station Road, 43 readers are waiting for its most popular novel. There is one copy; a second came back with several pages missing. Librarian Jean Wells shows us her reservations book. Those who can only visit after the late shift wait longest. The branch exchanges books with libraries on the outskirts, but the same titles are wanted there too. Each loan will count towards the annual circulation figure. Mrs Wells’s notebook records the other side of that statistic.",
          "byline": "Eve Fox - City desk"
        },
        "choir": {
          "title": "Rehearsal after the shift",
          "body": "The choir of the railway workshops on Station Road rehearses above the staff canteen. Its forty singers work different rosters, so the conductor never hears the whole ensemble at a rehearsal. He practises the bass parts separately with men coming off night duty. A clerk copies the scores using carbon paper; two folders hold the shared songbook. Folk songs and pre-war pieces make up the repertoire. The choir performs throughout the province. Its leader says gathering everyone at the station takes more arranging than learning a new song.",
          "byline": "Mark Barrett - Culture"
        },
        "film-club": {
          "title": "Beyond the cinema bill",
          "body": "At the Daybreak cinema’s film society, discussions usually outlast the screening. Students, teachers and regulars known by name to the usher fill the seats. The society books older films absent from the ordinary programme. A single print travels between several cities, so bookings take months to arrange. The host invites written questions. Most concern the characters’ manners and everyday lives. By the time discussion reaches the director’s technique, the subject listed in the lecture notes, rather fewer viewers remain.",
          "byline": "Mark Barrett - Culture"
        },
        "theatre": {
          "title": "A costume’s second life",
          "body": "In the municipal theatre’s workshop, dresses hang by historical period, not by production. A costume from ten seasons ago returns to the stage with new sleeves and collar. Seamstress Helena Mason keeps labelled boxes of fabric scraps, matching patches that will disappear from the audience’s view. New cloth goes chiefly to the leading roles; the rest of the cast draws on the store. Before a premiere, the most work goes into ordinary frock coats rather than splendid gowns. Each must fit its next actor as convincingly as the last.",
          "byline": "Eve Fox - Backstage"
        },
        "chess": {
          "title": "Railway juniors deliver",
          "body": "The railway chess team beat the builders 5:3 in the latest city league round. Junior players on the lower boards settled the match. The winning captain credits the section at School No. 12: younger players have regular lessons, while the adults fit practice around shift rosters. Matches take place in workplace recreation rooms, with free admission. Spectators follow the moves on a display board. The league has no hall of its own, but hosts in several districts keep the fixtures running regularly. Its youngest players are now earning places in the senior teams.",
          "byline": "John Reed - Sport"
        },
        "table-tennis": {
          "title": "Tables after lessons",
          "body": "The cooperative team beat the postal workers 6:4 in the city table tennis league. They played in the gym of School No. 12, lent to clubs after lessons. Players set out the tables and bench barriers themselves, then cleared the floor for morning exercises. The winning coach singled out his younger doubles pair. The section accepts school pupils but has only two practice evenings a week, shared between juniors and adults. For some players coming from the outskirts, the journey takes longer than the session. Keeping a regular team requires more than a good forehand.",
          "byline": "John Reed - Sport"
        },
        "stamps": {
          "title": "A city on an envelope",
          "body": "At the Alder Street cultural centre’s stamp circle, collectors increasingly examine whole envelopes rather than loose stamps. Postmarks from former postal branches trace the growth of the suburbs. Anthony Wicks collects letters addressed to streets that have changed names. Most came from family papers; others were exchanged with fellow members. He asks residents to look through old correspondence before sending paper for recycling. A stamp cut from its envelope loses part of the story preserved by the address, date and marks on the back.",
          "byline": "Eve Fox - Hobbies"
        },
        "cassette": {
          "title": "A concert from the radio",
          "body": "Letters to our technical desk keep asking how to record a broadcast without the family’s conversation. In many flats, a microphone beside the radio picks up both. An instructor at the Alder Street cultural centre demonstrates a connection through the sockets on the two machines. Not every receiver has them, and the right lead may take visits to several shops to find. Participants bring their own equipment and manuals. They also exchange broadcast lists: with only a few cassettes available, it pays to know what is already recorded on side two.",
          "byline": "Technical desk"
        },
        "knitting": {
          "title": "Wool for another winter",
          "body": "At a haberdashery on Orchard Street, customers compare wool samples brought from home. Often they need just one ball, but in exactly the same shade. The assistant suggests replacing the whole collar or both cuffs instead. At Northgate clubroom, 6 Linden Road, women unravel old jumpers and combine the recovered wool in stripes. Patterns circulate in notebooks, copied from borrowed magazines. Not everything can be saved: the most worn sections are discarded. A sound adult jumper can nevertheless provide enough wool for a child’s waistcoat.",
          "byline": "Anna Rook - Home and family"
        },
        "darning": {
          "title": "The everyday tailor",
          "body": "The tailoring counter in the Orchard Street shopping arcade has two machines and a book full of orders. It makes no bespoke suits: trousers are shortened, linings replaced and oversized coats fitted. Master tailor Stanley Grey spends longest on clothes handed down within families. Each must be unpicked to see how much spare cloth remains. The price list reduces this work to a few entries, although two similar coats can require quite different alterations. Customers chiefly ask when the work will be ready. They often need the garment they have just left behind.",
          "byline": "Eve Fox - Local services"
        },
        "plants": {
          "title": "A garden on the sill",
          "body": "At a flower shop on the Northgate housing estate, most questions concern flats rather than gardens. Customers describe narrow sills, dry rooms and windows facing the next block. Florist Sophia Crowe suggests first measuring how much space can really be spared for pots. A fine specimen from the window display may not fit. Spider plant and geranium cuttings circulate among neighbours; the shop supplies soil and saucers. The longest consultations concern plants received as gifts. Their owners can describe every leaf, but nobody remembers the name.",
          "byline": "Anna Rook - Home and family"
        },
        "bread": {
          "title": "Lunch from the chalkboard",
          "body": "The milk bar by Station Road station writes its menu in chalk. Before the first travellers arrive, the kitchen is serving breakfast to staff from nearby shops. The manager says regulars chiefly want a known price and a meal without a long wait. Alongside dumplings and noodles, there is a simple soup each day. Yesterday’s bread becomes croutons, and delivery orders follow the week’s takings. Market days are hardest to predict. Then the tables bring together shop workers, commuters and people arriving from the surrounding villages.",
          "byline": "Anna Rook - Trade"
        },
        "station-clock": {
          "title": "A city on two tickets",
          "body": "Before seven, the waiting room at Station Road station fills with commuters from across the province. Many still face a tram journey after leaving the train. Beside their packed breakfast they carry two monthly season tickets. Teresa, a bookkeeper, knows the timetable by heart, but plans her return around collecting her child from nursery. Moving an office meeting by half an hour can mean an hour waiting on the platform. The city’s statistics count her as an office worker. A considerable part of her working day is nevertheless governed by the railway clock.",
          "byline": "Eve Fox - City and region"
        },
        "lost-scarf": {
          "title": "The unclaimed storeroom",
          "body": "Staff at the city lost property office are sorting items delivered by tram depots. Umbrellas, gloves and bags of small purchases form the largest piles. Owners come promptly for documents; clothing can wait for months. Each object receives a number and a record of where it was found. A clerk explains that a scarf’s colour rarely settles a claim: several similar ones usually share the shelf. Giving the route and approximate journey time helps locate the right entry in the ledger. The office’s busiest shelves hold the least distinctive possessions.",
          "byline": "City desk"
        },
        "handwriting": {
          "title": "Inside the exercise book",
          "body": "At School No. 12 in the city centre, teachers compared first-year pupils’ books from the start of term with work written several weeks later. They considered speed as well as letter shapes. The class teacher explains that a careful child can fall far behind a dictated sentence. Parents ask for extra practice sheets, which the school duplicates for several classes together. Some children use fountain pens passed down by older siblings. A suitable nib and a steady hand prove more useful than the decorated covers sold for exercise books.",
          "byline": "Anna Rook - Education"
        },
        "aquarium": {
          "title": "An aquarium for the club",
          "body": "The aquarium circle met at Northgate clubroom, 6 Linden Road, with jars of plant cuttings and observation books. They compared small tanks suited to cramped flats. The recreation room’s display tank came from donations: a craftsman supplied the glass, one member the lamp, and others the plants. Pupils and pensioners share its care. The instructor says learning that regular duty comes first. Bringing home a striking fish from a collectors’ fair is easy; arranging someone to care for the tank during a holiday takes more thought.",
          "byline": "Mark Barrett - Hobbies"
        },
        "bookbinding": {
          "title": "A year between boards",
          "body": "A bookbinder on Cooper Street binds annual volumes for reading rooms and private collectors. Technical magazines, newspapers and sewing journals cover his bench. Before making a cover, he checks issue numbers and supplements. Clipped advice columns cause most trouble: an owner remembers a complete year, but half a page is missing inside. The binder keeps the original covers and indexes. A good binding, he explains, should help its reader find a needed article, as well as make the volumes stand neatly on a shelf.",
          "byline": "Eve Fox - Crafts"
        },
        "starlight": {
          "title": "Stars above the rooftops",
          "body": "At the Alder Street cultural centre’s astronomy circle, the first instrument is a sky chart rather than a telescope. The instructor teaches members to find a few bright stars before setting up the larger instrument. Lights and narrow courtyards restrict the view in the centre; for clearer skies, the group travels beyond the last buildings. Pupils attend alongside adults bringing binoculars long unused at home. Waiting together for a break in the clouds takes the most patience. The circle’s notebook records the weather beside its drawings of the sky.",
          "byline": "Mark Barrett - Science"
        },
        "noticeboard": {
          "title": "Whose turn to dry?",
          "body": "A resident of 12 Linden Road on the Northgate estate writes about the communal drying room. Its rules are on the noticeboard, but nothing says who keeps the key or records bookings. The housing cooperative’s reply refers her to the caretaker. He has a reservations book that some new tenants never knew existed. The block committee says the details will be posted beside the rules. Our reader was not asking for new equipment, only access to a room included in her rent. A clear notice was enough to resolve a surprisingly lengthy correspondence.",
          "byline": "Letters to the editor"
        },
        "bicycle": {
          "title": "Room for a bicycle",
          "body": "In a sports shop, a bicycle can be admired from every side. At home, it still needs somewhere to stand. Readers on new estates describe narrow cellars and stairs without ramps. The caretaker at 12 Linden Road on the Northgate estate shows us a shared cycle room also holding prams, sledges and camping gear. Tenants have marked out spaces themselves so the back wall remains accessible. For many residents, a bicycle is transport to an allotment or a workplace on the outskirts. Its usefulness depends first on being able to get it out of the building each morning.",
          "byline": "City desk"
        },
        "prompter": {
          "title": "A voice below the stage",
          "body": "Irene Cowley, prompter at the Municipal Theatre, knows several productions at once. Her script marks pauses and changes made in rehearsal. She supplies the start of a sentence before the silence reaches the audience. A replacement actor means an extra rehearsal even for an established production. Crowd scenes are hardest: she must tell who has forgotten a line and who is waiting to speak. Her script stays beside the stage until the curtain falls.",
          "byline": "Mark Barrett - Culture"
        },
        "cinema-booth": {
          "title": "The window above",
          "body": "Raymond Gale, projectionist at the Daybreak cinema, checks every print before its first screening, inspecting splices and reel markings. Notes from other cinemas remain on the tins, sometimes warning of a damaged ending. During projection he watches through a window above the back row. The machines dominate the sound in his booth. He knows the films discussed by departing viewers well, but rarely gets to sit down and watch one from beginning to end.",
          "byline": "Mark Barrett - Culture"
        },
        "score-library": {
          "title": "Music on loan",
          "body": "The brass band of the railway workshops on Station Road keeps its music in two cupboards above the canteen. Librarian Henry Routledge distributes parts before rehearsals and collects them after performances. Marches played outdoors wear fastest, with rain marks and creases from clips. A missing part cannot be replaced by a neighbour's music for a different instrument. Henry therefore makes a copy of new parts before handing out the originals.",
          "byline": "Mark Barrett - Culture"
        },
        "poster-lettering": {
          "title": "Letters by brush",
          "body": "Sigmund Hutton paints posters for the cultural centre on Alder Street. He spreads paper across two tables beside the approved programme. Title and starting time get most space so they can be read across the street. Long performers' names need separate planning. A pasted strip does not always solve a changed date: the old lettering can show through in a window. Then he repaints the whole poster, even though the other copies are already on display.",
          "byline": "Mark Barrett - Culture"
        },
        "puppet-tour": {
          "title": "A stage in two cases",
          "body": "The Alder Street cultural centre's puppet company has returned from three village clubrooms. Four instructors performed a tale about a lost dog, carrying puppets and scenery in two cases. At Birchwood they gave a second performance for children arriving on a later bus from the far end of the village. The company has no vehicle. Director Anna King arranges routes with clubroom caretakers, who transport the screen and meet the actors at the bus stop.",
          "byline": "Mark Barrett - Culture"
        },
        "accordion-duet": {
          "title": "Two accordions",
          "body": "Maurice Newman and Leon Owlett of the railway workshops received a commendation at the Alder Street cultural centre's amateur music review. Their accordion duo played three dance tunes. Both learned by ear; a teacher from the music school on Orchard Street wrote out the arrangements. They rehearsed at the Newmans' flat between work and the children's bedtime. The judges praised their steady ensemble playing and recommended a broader repertoire for their next appearance.",
          "byline": "Mark Barrett - Culture"
        },
        "matinee-survey": {
          "title": "Who comes to matinees",
          "body": "The Daybreak cinema collected 58 replies from adults attending children's matinees. Suburban parents requested later starts to connect with buses; central residents preferred finishing before lunch. Manager George Patch is considering separate hours for school groups and families. No programme change has been announced. Ushers also raised the cloakroom problem: two groups arriving together block the entrance to the auditorium.",
          "byline": "Mark Barrett - Culture"
        },
        "dance-shoes": {
          "title": "Room for a waltz",
          "body": "The dance course at the cultural centre on Alder Street ended with a family demonstration. Twelve couples performed a waltz and polka. Instructor Helen Booth mainly teaches adults preparing for weddings and workplace dances. Some had practised by moving their kitchen tables aside. At the demonstration they completed the sequence without stopping the music. Afterwards the participants' parents took the floor while the pupils watched from the wall.",
          "byline": "Mark Barrett - Culture"
        },
        "recitation-finals": {
          "title": "A poem without a mike",
          "body": "Eve Hawke of School No. 12 won the city recitation contest at the Alder Street cultural centre. Eleven pupils reached the final. Judges praised her clear speech and restrained reading, without gestures overwhelming the verse. She prepared with language teacher Mary Beckett and practised by reading to her grandmother. The prize included poetry and theatre workshops. Teachers will be able to borrow a recording made by the amateur radio club.",
          "byline": "Mark Barrett - Culture"
        },
        "folk-recording": {
          "title": "Voices from nearby",
          "body": "The Municipal Museum on Market Square received wedding songs recorded in Birchwood. John Still brought the tape of his grandmother and three other singers, recorded unaccompanied in her kitchen. They paused to settle forgotten words; one remembered a different ending. Ethnographer Teresa May will retain both versions. Before cataloguing the recording, she will visit Birchwood to establish who taught the women each song.",
          "byline": "Mark Barrett - Culture"
        },
        "reading-room": {
          "title": "Papers on wooden rods",
          "body": "Newspapers at library Branch No. 6 on Station Road are mounted on wooden rods. Pensioners and passengers waiting for trains share its long table. The daily carrying radio listings is most popular; librarian Jean Wells reserves a second copy for people noting broadcast times. Older issues remain in the back room for a month. Readers return for advertisements and results, so she asks them to copy useful items rather than cut them out.",
          "byline": "Mark Barrett - Culture"
        },
        "portrait-studio": {
          "title": "Before the lens",
          "body": "Photographer Walter Lennox on Orchard Street takes most family portraits on Sundays, when relatives working different shifts can gather. Arranging a large family takes longer than the exposure. Children sit on a stool with adults behind them. Customers order prints for themselves and relatives outside the city. Lennox files negatives by order number so further copies can be made years later without assembling everyone again.",
          "byline": "Mark Barrett - Culture"
        },
        "museum-labels": {
          "title": "The label in the case",
          "body": "Teresa May at the Municipal Museum on Market Square describes objects donated by residents. For a wooden tool she needs more than its donor's name: who used it, and for what work? She compares family terms with old catalogues. When no single name can be established, both recorded terms appear in the display case. The full interview remains available to researchers studying local crafts.",
          "byline": "Mark Barrett - Culture"
        },
        "book-cart": {
          "title": "A library on wheels",
          "body": "Every Tuesday the railway technical school's librarian visits its boarding house on Station Road with a trolley of books. Supervisors collect requests beforehand. Set texts travel alongside adventure novels and textbooks needed for resits. Evening loans help pupils whose workshop sessions finish after the library closes. Demand peaks before home visits: pupils take books for the journey and receive return dates after they come back.",
          "byline": "Mark Barrett - Culture"
        },
        "photo-exhibition": {
          "title": "Courtyards on display",
          "body": "The Alder Street cultural centre's photography club exhibited thirty courtyards from Station Road and Cooper Street, showing workshops, shared wells and staircases instead of grand streets. Residents of the buildings attended the opening and supplied craftsmen's names and former uses of the rear wings for the captions. After the exhibition, the prints will go to library Branch No. 6, which collects material about both streets.",
          "byline": "Mark Barrett - Culture"
        },
        "poetry-evening": {
          "title": "The poet's small table",
          "body": "Poet Victor Lesley met readers at Branch No. 6 on Station Road, reading work about commuting and courtyards remembered from his youth. Discussion turned to revision. He showed two versions of a poem, explaining why he replaced an entire street with one gateway. Readers also asked where to buy his collection. The library has two copies for loan; nearby bookshops have sold out.",
          "byline": "Mark Barrett - Culture"
        },
        "museum-donation": {
          "title": "An album without names",
          "body": "The Municipal Museum on Market Square received an album by Anthony Rake, former photographer at the railway workshops. His daughter donated pictures of staff excursions, anniversaries and sports. Some are undated. Six retired railway workers identified colleagues at a museum meeting, though not every location. The curator invites other former employees to help. Visits to the city-history department can be arranged through the museum office.",
          "byline": "Mark Barrett - Culture"
        },
        "radio-play": {
          "title": "Footsteps from a box",
          "body": "Children from School No. 12 recorded a short station scene at the Alder Street cultural centre. The radio-club instructor demonstrated footsteps in a gravel box and wheels rattling on a wooden board. Pupils divided dialogue and effects between them. Laughter from those waiting spoiled the first attempt; the second was complete. The tape will accompany a school play whose small stage cannot accommodate station scenery.",
          "byline": "Mark Barrett - Culture"
        },
        "poster-collection": {
          "title": "Old cinema programmes",
          "body": "Leon Ward, a retired railway cashier, donated eighteen years of Daybreak cinema programmes to the Municipal Museum. Pencil marks identify films seen and actors who prompted a visit. The collection records programmes and prices for matinees and evening shows. One year's programmes remain missing after a loan to a neighbour. Ward is seeking them through this newspaper. The museum on Market Square also welcomes individual programmes to fill the gap.",
          "byline": "Mark Barrett - Culture"
        },
        "book-display": {
          "title": "Books from the back shelf",
          "body": "Librarians at Branch No. 6 on Station Road displayed novels unborrowed for a year, adding short plot descriptions without revealing endings. Nine of fifteen were taken within a week. Jean Wells does not yet see this as a change in taste: a volume by the counter is easier to notice than a spine in a shelf's back row. The next display will feature reportage, another seldom-requested section.",
          "byline": "Mark Barrett - Culture"
        },
        "umbrella-ribs": {
          "title": "Under one canopy",
          "body": "Wallace Fox repairs umbrellas in a booth beside the Station Road market. Spare ribs collected over years occupy more room than finished items. Parts for older models need hand fitting; broken tips and handle fittings are common jobs. Before accepting an umbrella, he checks its fabric. Repairing the frame offers little if seams are worn through. Customers hear the price before leaving their umbrella and decide whether the work is worthwhile.",
          "byline": "Eve Fox - Crafts"
        },
        "shoe-lasts": {
          "title": "A shoe on its last",
          "body": "Cobbler Joseph Legg on Station Road begins by inspecting both shoes. Customers often bring only the one with a loose sole, though its partner may be equally worn. He mostly repairs heels and patches uppers where they bend. Leather scraps are sorted by thickness, saving new material on small jobs. Regular customers leave work boots after a shift and arrange collection before their next duty.",
          "byline": "Eve Fox - Crafts"
        },
        "brush-maker": {
          "title": "Bristles in a row",
          "body": "The brush workshop at 14 Cooper Street supplies bakeries, workshops and household customers. Master Edward Hart selects bristle stiffness for each job. A neighbouring joiner makes wooden stocks, while old ones are inspected before refilling. Cracks around their holes can make reuse impractical. Bakers bring old brushes as patterns because handle length must suit their benches and working methods.",
          "byline": "Eve Fox - Crafts"
        },
        "frame-shop": {
          "title": "A frame for a memory",
          "body": "The frame shop at 9 Cooper Street handles mostly certificates and family photographs. Customers choose moulding, but the photograph's condition often determines border width. A faded edge cannot always be hidden without covering a face. The framer shows the arrangement before cutting. Glass for small frames comes from larger jobs' offcuts, making a school certificate cheaper to frame than buying a ready-made display frame.",
          "byline": "Eve Fox - Crafts"
        },
        "upholstery-course": {
          "title": "A chair on the bench",
          "body": "Pupils at Vocational School No. 3 on Cooper Street restored six chairs for the Northgate clubroom. Frames were sound, but seats had sagged. Under upholsterer Raymond Briggs they replaced webbing and padding. The housing cooperative supplied limited fabric, so the original covering remained on the backs. The chairs have returned to use. The school counted the work as practical training and charged no labour fee.",
          "byline": "Eve Fox - Crafts"
        },
        "engraver-cup": {
          "title": "Room for a surname",
          "body": "The engraver at 16 Orchard Street completed the city table-tennis league trophy for the postal team. Its base names six players. Shortly before collection, organisers added a reserve who had played in early rounds, requiring the inscription to be rearranged. The cup will stand in the main post office's clubroom. Individual certificates include one for the reserve, who could not attend the closing ceremony.",
          "byline": "Eve Fox - Crafts"
        },
        "ceramic-glaze": {
          "title": "Colour after firing",
          "body": "The cultural centre on Alder Street displayed vessels from its pottery course's first firing. Three of twenty mugs cracked; several needed glaze cleaned from their bases. Instructor Barbara Mercer discussed these faults with their makers before the display. Pupils learn hand-building without a wheel. They can take finished work home; fees cover clay and shared firing. The next group will make bowls with thicker bases.",
          "byline": "Eve Fox - Crafts"
        },
        "joinery-drawer": {
          "title": "A drawer made to fit",
          "body": "The joinery shop at 5 Cooper Street replaced a drawer in the Station Road library catalogue. The old one had cracked under its cards and stood in the back room for months. Apprentice Mark Wolfe found neighbouring drawers slightly unequal: the old cabinet had been fitted by hand. The replacement was tried at the library before finishing. Readers can now consult the cards without asking the librarian to fetch a box.",
          "byline": "Eve Fox - Crafts"
        },
        "weaving-sample": {
          "title": "A pattern in thread",
          "body": "Eight newcomers joined the weaving circle at the Alder Street cultural centre. Instructor Olga Kite prepared basic weave samples. Rather than begin with wall hangings, beginners make narrow strips from leftover yarn, adjusting tension without unpicking a large piece. Two looms are shared in shifts with an experienced group. Demand still exceeds the available places at the looms.",
          "byline": "Eve Fox - Crafts"
        },
        "locksmith-apprentice": {
          "title": "A key without a pattern",
          "body": "Peter Hare of Vocational School No. 3 on Cooper Street passed a practical locksmithing test. He made a key for an old workshop cabinet from its mechanism rather than an existing key. Master Anthony Carter assessed fit and edge finishing. The key operated smoothly, though its bow still needed smoothing. It was Hare's first independent piece intended for use in the school workshop.",
          "byline": "Eve Fox - Crafts"
        },
        "book-gilding": {
          "title": "Letters on the spine",
          "body": "The bookbinder at 6 Cooper Street stamps titles on bound annual volumes, selecting metal type for each inscription. A narrow spine holds less than a cover, so abbreviations are agreed with the owner. Libraries chiefly want journal and year; private collectors often add decorative rules. Incomplete years need particular care: the numbers present must be identified before the new binding disguises the gaps.",
          "byline": "Eve Fox - Crafts"
        },
        "scissors-grinder": {
          "title": "Blade and hinge",
          "body": "The grinder beside the Station Road market serves tailors and home dressmakers. Scissors that snag cloth may have a loose joint rather than blunt edges. He tests each pair on fabrics from thin lining to felt. Customers also bring scraps of delicate materials they use. Large workshop shears remain overnight; minor adjustments to the joint are usually done while the owner waits.",
          "byline": "Eve Fox - Crafts"
        },
        "basket-work": {
          "title": "Baskets for the market",
          "body": "Stanley Crowe of Birchwood sells baskets at the Station Road market. Some are bakery orders; others go to shoppers and allotment holders. Potato baskets use thicker rods than bread baskets. Handles suffer most when wet baskets are lifted full. Crowe accepts repairs but checks the base first. If the weave is brittle throughout, replacing the handle alone will not make it usable.",
          "byline": "Eve Fox - Crafts"
        },
        "watch-parts": {
          "title": "Parts under a job number",
          "body": "The watchmaker at 4 Cooper Street keeps each movement's parts in a box bearing its job number. Older watches may need salvaged components, so he quotes a date only after opening the case. Customers also bring heirlooms unworn for years. Restoring motion and regulating accuracy are separate tasks. He observes a repaired watch for several days before returning it and asks the owner to check it during everyday wear too.",
          "byline": "Eve Fox - Crafts"
        },
        "leather-satchel": {
          "title": "A schoolbag handed down",
          "body": "The leatherwork class at Vocational School No. 3 on Cooper Street repaired twelve schoolbags supplied by parents. Most leather remained sound; stitching, buckles and straps needed replacement. Winifred Hill supervised the pupils. Parents paid for fittings, with labour counted as training. The bags will go to younger siblings. Two were declined because cracked leather would not support new stitching.",
          "byline": "Eve Fox - Crafts"
        },
        "plaster-mould": {
          "title": "A copy of a small leaf",
          "body": "Plaster workers from Cooper Street reproduced a missing leaf in the staircase decoration at 9 Orchard Street, taking a pattern from the second floor. Paint concealed fine cuts invisible from below. The new cast had to fit the existing plaster as well as repeat its shape. The building administration commissioned the work during stair repairs. The remaining ornaments will be cleaned in place without removal.",
          "byline": "Eve Fox - Crafts"
        },
        "hat-block": {
          "title": "Hats in shape again",
          "body": "A milliner on Orchard Street prepared three hats for the Alder Street cultural centre's theatre group. Old store costumes needed fitting to new performers. Two hats had lost their shape under heavy boxes. Fittings adjusted their size and ribbons while retaining the period style. The director also ordered transport boxes: carrying hats together with coats had been undoing much of the milliner's work.",
          "byline": "Eve Fox - Crafts"
        },
        "metal-signs": {
          "title": "A number from the gate",
          "body": "8 Cooper Street now has entrance signs: A for the front building and B for the rear wing. Postmen and delivery staff had relied on door colours, changed during repainting. A locksmith's workshop on the same street made the metal signs. They are visible from the gate, with names added beside bells. The administration plans to inspect neighbouring houses too. Residents ask that courtyard workshop entrances also be included.",
          "byline": "Eve Fox - Crafts"
        },
        "pottery-jug": {
          "title": "A jug from a drawing",
          "body": "Mary Ball of Vocational School No. 3 made a jug for the student craft contest at the Alder Street cultural centre. Pottery instructor Barbara Mercer advised her. The first model had an awkwardly broad handle and dripped when pouring. A revised spout made the second usable. Judges commended its comfortable grip despite uneven glaze. Mary will make a further set during her pottery-workshop placement.",
          "byline": "Eve Fox - Crafts"
        },
        "carving-letters": {
          "title": "A cover for the chronicle",
          "body": "The carving circle on Alder Street made a cover for its cultural centre's chronicle. A joiner supplied limewood boards and a nearby workshop the hinges. Members shared the ornament while retired joiner Wilfred Piper carved the inscription. Gluing and levelling the boards extended the work to six meetings. The volume is available in the centre office, recording events and the people who have long taught classes and prepared rooms.",
          "byline": "Eve Fox - Crafts"
        },
        "club-kit": {
          "title": "Shirts by number",
          "body": "Francis Palmer issues football kit at the railway club on Station Road. Seniors and juniors share two sets of shirts, making laundry depend on both fixture lists. A player's wife mends small tears. Missing sizes are hardest to replace: identical shirts do not fit every player. For away matches Francis packs a spare outfit, laces and dressings.",
          "byline": "John Reed - Sport"
        },
        "referee-notebook": {
          "title": "Whistle and notebook",
          "body": "Clarence Grey referees football in the city's works league. He checks team lists and the pitch before play and completes a report afterwards. Players often know opponents from other teams, which does not make disputes easier. Late arrivals and absent reserves cause most administrative problems. He asks captains to report substitutions before players enter, especially when someone arrives directly from a work shift.",
          "byline": "John Reed - Sport"
        },
        "pool-lanes": {
          "title": "A lane for everyone",
          "body": "Teresa Lynne teaches adults at the Recreation Road pool in the evenings. Learners have a separate lane instead of practising breathing among fast club swimmers. Some have not visited since school and feel embarrassed holding the edge. Lessons begin in shallow water. The pool desk handles enrolment; groups stay small enough for supervision. Sessions after the second work shift attract most requests.",
          "byline": "John Reed - Sport"
        },
        "running-log": {
          "title": "Miles in a notebook",
          "body": "Northgate estate's recreational runners meet at the Linden Road park gate. Beginners take a short loop while others continue to the allotments. Leader Andrew Small stresses that the sessions are not race training. Many members are returning after years of desk work. They record distances and breaks so enthusiasm for keeping up with faster companions does not lead to abrupt increases.",
          "byline": "John Reed - Sport"
        },
        "volleyball-shift": {
          "title": "Volleyball after work",
          "body": "The postal team beat the printers 3–2 in the city works volleyball league at School No. 12. Play began half an hour late because two visitors were finishing a shift. The printers took the first two sets, then increasingly lost points receiving serve. Postal captain Paul Adley praised the reserve setter. Both teams asked organisers for later starting times on working days.",
          "byline": "John Reed - Sport"
        },
        "cross-country": {
          "title": "The finish by the gate",
          "body": "Thomas Yew of School No. 12 won the city pupils' two-kilometre cross-country race through Linden Road park. Forty-six runners from nine schools entered; the finish was by the main gate. Yew took the lead on the final lap after following runners from the railway technical school. School No. 12 also won the team event. PE teacher John King plans to enter its team in an inter-school meeting outside the city.",
          "byline": "John Reed - Sport"
        },
        "boxing-score": {
          "title": "Points for the juniors",
          "body": "The railway club's juniors drew 6–6 with the builders in a friendly boxing meeting on Recreation Road. The hosts won the last two bouts to recover an early deficit. Coach Leon Cook praised debutant Mark Burke for maintaining his pace, but criticised the others' defence. Parents and workshop colleagues made up most of the audience. Ticket proceeds will replace worn training gloves.",
          "byline": "John Reed - Sport"
        },
        "handball-goalkeeper": {
          "title": "The reserve goalkeeper",
          "body": "The cooperative team beat the postal team 20–18 in the city handball league at the Recreation Road hall. Reserve goalkeeper George Fox came on after half-time and saved two penalties, having previously played mostly friendlies. Coach Henry Newell also praised defenders for preventing close shots late in the game. The win brings the cooperative side level on points with the printers.",
          "byline": "John Reed - Sport"
        },
        "relay-baton": {
          "title": "A steady baton change",
          "body": "School No. 12's boys finished second in the city 4 x 100 metre relay on Recreation Road, one second behind the railway technical school. Teacher John King welcomed the improvement after a dropped baton at the previous meeting. All exchanges went smoothly this time. The school track is too short for full laps, so training chiefly concentrates on starts and changes.",
          "byline": "John Reed - Sport"
        },
        "chess-clock": {
          "title": "A game reconstructed",
          "body": "Retired railway worker Anthony Wicks won the chess tournament at the Alder Street cultural centre, defeating technical-school pupil Paul Frost in a long rook ending. Under time pressure, Frost lost a pawn during an exchange. Twenty-four players entered, including six juniors. Referee Stephen Piper plans separate endgame sessions. The club has the final's score available for participants to analyse.",
          "byline": "John Reed - Sport"
        },
        "model-railway": {
          "title": "A timetable in miniature",
          "body": "Two joined tables hold the model railway at the Alder Street cultural centre. Pupils build it under retired signalman Stanley Rake. Track is complete, while station benches, signs and a luggage shed are still being added. Members supply materials, including thin card from a bookbinder. Trains follow an agreed sequence: on the single-track stretch, young drivers must decide who waits at the passing loop.",
          "byline": "Eve Fox - Hobbies"
        },
        "coin-cabinet": {
          "title": "A coin with a history",
          "body": "Coin collectors at the Alder Street cultural centre examine family collections with retired railway cashier Leon Ward, who helps identify dates and mint marks. He asks visitors not to polish coins beforehand: lost detail hinders identification, and surface condition matters to collectors. Beginners can consult the club catalogue. Owners arrange exchanges themselves; the club neither buys coins nor provides sale valuations.",
          "byline": "Eve Fox - Hobbies"
        },
        "postcard-box": {
          "title": "Postcards in a box",
          "body": "Sophia Plowman, a teacher on Station Road, collects city postcards by street to compare buildings across years. One shows a workshop sign older neighbours no longer remember. Its postmark and a message about moving house help date it. She lends cards for school displays, asking that they remain in protective sleeves: several prints already bear drawing-pin holes.",
          "byline": "Eve Fox - Hobbies"
        },
        "amateur-radio": {
          "title": "A voice in the logbook",
          "body": "The amateur radio club at the Alder Street cultural centre shares one transmitter through agreed sessions. Operators log the other station's call sign, time and reception, later receiving confirmation cards by post. Instructor George Collett teaches newcomers to keep the log before they operate the set. Much training is listening: weak signals must be recognised in noise and call signs received without guessing.",
          "byline": "Eve Fox - Hobbies"
        },
        "model-boat": {
          "title": "A trial on quiet water",
          "body": "Six boats from the Alder Street cultural centre's modelling club were tested at the Recreation Road pool before public sessions. Technical-school pupil Ralph Birch built the fastest. After a rudder adjustment it completed the course without touching the edge. Club leader Richard Scholar checked hull sealing as well. Two boats returned to the workshop for leaks to be sealed before competition.",
          "byline": "Eve Fox - Hobbies"
        },
        "philately-swap": {
          "title": "A stamp for an envelope",
          "body": "At the Alder Street stamp circle, Anthony Wicks showed an envelope marked by the former Birchwood post office. Members compared it with other letters to identify an unclear date digit. Wicks exchanged it for two stamps completing part of his railway collection. Its new owner, teacher Stephen Piper, is collecting Birchwood postal material for a display at the village clubroom.",
          "byline": "Eve Fox - Hobbies"
        },
        "fish-show": {
          "title": "An aquarium with notes",
          "body": "The city aquarium circle held a display at the Northgate clubroom, 6 Linden Road. Anna Frost of School No. 12 received a commendation for a small planted guppy tank. Her father made the tank; she provides daily care. Assessors asked about feeding, water changes and care during absences. Older members' larger displays attracted visitors but needed equipment beginners often cannot yet afford.",
          "byline": "Eve Fox - Hobbies"
        },
        "photo-darkroom": {
          "title": "Prints from one negative",
          "body": "Photography pupils at the Alder Street cultural centre made prints from Walter Lennox's negative of an Orchard Street courtyard. A bench stands centrally while a woman carrying a bag passes the gate. Different crops chose different subjects. The instructor compared what each excluded. Work took place in the club darkroom, with enough paper for two attempts each, so crops were decided before processing.",
          "byline": "Eve Fox - Hobbies"
        },
        "boardgame-evening": {
          "title": "Counting the counters",
          "body": "The Northgate clubroom at 6 Linden Road hosted a neighbourhood draughts tournament with eight pairs ranging from pupils to pensioners. Mechanic Stanley Fox beat technical-school pupil George Mason in the final. School No. 12 lent extra sets because the club owned only three complete ones. Entry was free. Future meetings will also welcome people who prefer games without league tables.",
          "byline": "Eve Fox - Hobbies"
        },
        "mineral-display": {
          "title": "Stones with labels",
          "body": "The walking club of School No. 7 on Station Road displayed stones gathered near the Birchwood gravel pit. Teacher Sophia Plowman helped identify granite and flint. Several specimens remain uncertain; the school will ask the Municipal Museum for help. A map marks where the stones were found. There are no rare minerals, but visitors can examine material commonly seen in road gravel and fields.",
          "byline": "Eve Fox - Hobbies"
        },
        "radio-aerial": {
          "title": "The aerial by the window",
          "body": "George Collett helps residents with radios at the Alder Street cultural centre's technical workshop. Most complaints come from new Northgate flats. Owners bring the set and describe its usual position. Reception may be good in the workshop, so he cannot diagnose a fault from the complaint alone. He checks sockets and aerials, then suggests comparing positions at home. Older sets often lack a lead lost during a move.",
          "byline": "Technology desk"
        },
        "typewriter-ribbon": {
          "title": "An original and two copies",
          "body": "Teresa Rook types most schedules in triplicate at the design office on Orchard Street. The ribbon prints the top sheet; carbon paper transfers keystrokes to the others. A faint last copy calls for checking carbon paper and typing pressure as well as the ribbon. Correcting figures takes longest because every sheet needs attention. Before typing a large table, she asks its author to check the draft totals.",
          "byline": "Technology desk"
        },
        "tape-index": {
          "title": "What is on side B",
          "body": "Listeners at the Alder Street cultural centre's music club exchange lists of recorded broadcasts. Scarce cassettes mean one concert can be replaced before it is heard. The instructor recommends labelling both sides and naming performers: a work's title alone cannot distinguish recordings. Member Leon Owlett stores family tapes separately so the children's voices are not erased while recording another evening programme.",
          "byline": "Technology desk"
        },
        "bicycle-dynamo": {
          "title": "Light from a wheel",
          "body": "The bicycle mechanic at 20 Station Road checks lighting on bikes brought after work. Owners usually suspect the bulb, but a loose wire or misaligned dynamo may be responsible. A stand allows inspection while the wheel turns. Parts for old lamps are not always available. The mechanic keeps sound holders from dismantled sets and asks permission before reusing them. A similar housing alone does not guarantee a fit.",
          "byline": "Technology desk"
        },
        "slide-projector": {
          "title": "Pictures on a pale wall",
          "body": "The Alder Street cultural centre's walking club showed teacher Stephen Piper's slides from Birchwood. The mill and old buildings by the post office prompted most questions. At rehearsal, details were unclear from the back rows; a smaller image and covered side windows improved the view. A Birchwood resident added the names of former building owners to the commentary.",
          "byline": "Technology desk"
        },
        "workshop-meter": {
          "title": "Reading the pointer",
          "body": "Second-year pupils at the railway technical school on Station Road compared workshop meters on the same circuit. Readings differed. Teacher Peter Judd asked them to change positions; some discrepancies vanished when everyone viewed the scale straight on. The workshop will inspect the remaining instruments. The exercise precedes placements where pupils will also encounter older workplace equipment.",
          "byline": "Technology desk"
        },
        "sewing-maintenance": {
          "title": "Machines after inspection",
          "body": "A mechanic from the Orchard Street service shop visited the sewing course at the Alder Street cultural centre. Participants brought eight household machines. Several needed rethreading and cleaning around the shuttle; two required workshop repairs. Instructor Celia Burke asked owners to keep sample seams with fault descriptions, making intermittent problems easier to explain when taking a machine in.",
          "byline": "Technology desk"
        },
        "telephone-display": {
          "title": "Receivers through the years",
          "body": "The railway technical school on Station Road displayed telephones lent by communications staff. Alongside dial sets stood an older crank telephone from a workplace network. Fitter Joseph King explained requesting a call through an operator. Pupils inspected open cases and bell mechanisms before choosing their specialisation. The exhibits remain disconnected, so demonstrations do not interfere with the exchange.",
          "byline": "Technology desk"
        },
        "record-speed": {
          "title": "A record at its own pace",
          "body": "Two music-club turntables were compared at the Alder Street cultural centre. The same waltz sounded noticeably slower on one. Instructor George Collett checked platter speed and recommended adjustment. Its owner had blamed a worn record for months. The club plans a similar recorder session. The porter collects registrations, including model details so the instructor can obtain suitable documentation beforehand.",
          "byline": "Technology desk"
        },
        "drafting-tools": {
          "title": "A curve from a template",
          "body": "Railway technical-school pupils visited the design office on Orchard Street. Draughtswoman Irene Walker demonstrated a part drawing on tracing paper, plotting pencil points before selecting sections of a French curve. Pupils knew the tool but had not seen a drawing prepared for reproduction, where corrections were harder than in a notebook. The visit also covered folding and labelling drawings for the archive.",
          "byline": "Technology desk"
        },
        "button-tin": {
          "title": "The old tea tin",
          "body": "Customers at the Orchard Street haberdasher often seek one button for an old coat. Mary Harris compares their sample with drawer stock. Exact shades can be impossible, especially when the remaining buttons have faded. She may suggest replacing a row or both cuffs. A tea tin of customers' donated buttons stands by the counter, allowing a missing button to be found without buying a full set.",
          "byline": "Anna Rook - Home and family"
        },
        "sheet-hems": {
          "title": "Bedding for a smaller bed",
          "body": "The alterations shop at 6 Orchard Street adapts bedding for children's beds and narrow divans. Stanley Grey asks for mattress depth as well as width, allowing enough sheet to tuck under. Customers often bring large sheets inherited from relatives. Sound offcuts can become pillowcases. He identifies worn areas before cutting so new seams do not fall on weakened fabric.",
          "byline": "Anna Rook - Home and family"
        },
        "shopping-bag": {
          "title": "A bag from a pillowcase",
          "body": "Edith Page of Orchard Street visits the Station Road market with bags made from old pillowcases. Bread travels separately from vegetables, lighter purchases over her shoulder. She demonstrated the sewing at the Northgate clubroom. Handles needed most adjustment because narrow ones cut into hands. Fabric cost nothing, though thread and time still counted. She has used the same bags for two years, washing them after market trips.",
          "byline": "Anna Rook - Home and family"
        },
        "leftover-yarn": {
          "title": "Remnants for beginners",
          "body": "The needlework circle at the Alder Street cultural centre gathers leftover yarn for beginners. Members bring remnants with samples of the finished knitting. Instructor Olga Kite separates thicknesses: combining fine yarn with thick bands can distort a garment. Small supplies chiefly become hats and children's waistcoats. Larger projects require additional matching yarn.",
          "byline": "Anna Rook - Home and family"
        },
        "repair-evening": {
          "title": "An evening with needles",
          "body": "Helena Mason and Winifred Hill helped seventeen residents mend clothes at the Northgate clubroom, 6 Linden Road. Most brought children's garments needing new zips or shorter sleeves. Everyone worked on their own item rather than leaving repair orders. Participants lent two machines. Organisers are seeking a third because the queue for zip fitting outlasted that for hand darning.",
          "byline": "Anna Rook - Home and family"
        },
        "linen-swap": {
          "title": "A cloth for another table",
          "body": "Tablecloths, curtains and pillowcases changed hands at the Northgate clubroom, 6 Linden Road. Organiser Edith Page requested washed items with measurements and declined badly worn material unsuitable for alteration. Mrs Brookfield exchanged a long cloth for two kitchen curtains; its new family has an extending table. Owners took unexchanged items home, leaving no storage problem for the clubroom.",
          "byline": "Anna Rook - Home and family"
        },
        "recipe-index": {
          "title": "An index for the notebook",
          "body": "The Alder Street household circle organised ten years of recipes. Leader Anna Roe removed duplicates and asked contributors to supply missing quantities. Measures such as a glass or handful caused most difficulty, so cooking sessions compared the actual utensils. The result contains thirty tried dishes for four people. Members can copy recipes at meetings; paper has so far allowed only one shared volume.",
          "byline": "Anna Rook - Home and family"
        },
        "curtain-measure": {
          "title": "A curtain for its window",
          "body": "Sewing pupils at the Alder Street cultural centre made curtains for the choir room from fabric donated after a family's move. Too short for full windows, it became café curtains below the handles. The remainder covered the glazed upper door. Choir members helped hang them. Daylight still enters, while passers-by no longer look directly at singers rehearsing beside the windows.",
          "byline": "Anna Rook - Home and family"
        },
        "patchwork-cover": {
          "title": "A cover made of scraps",
          "body": "Six women at the Northgate clubroom, 6 Linden Road, spent three meetings making a cover for its worn sofa. Residents supplied heavy remnants from curtains and skirts; thin linings were rejected as unsuitable for the wear. The removable, washable cover cost only thread. The cooperative has no sofa replacement planned this year because its wooden frame remains sound.",
          "byline": "Anna Rook - Home and family"
        },
        "shopping-notes": {
          "title": "Both sides of the list",
          "body": "Participants brought a week's receipts to a household spending meeting at Northgate clubroom, 6 Linden Road. Anna Roe separated daily purchases from month-long supplies, which had made similar-income households seem very different. Discussion centred on travelling for cheaper goods. Purchase prices excluded fares and time in queues. The next comparison will record both alongside the shopping.",
          "byline": "Anna Rook - Home and family"
        },
        "shared-landing": {
          "title": "A shelf on the landing",
          "body": "Three families share the plant shelf on a half-landing at 8 Cooper Street. Winifred Fox's large ficus had outgrown her flat. The stair window offered space, but care needed agreement with neighbours. She waters it; an upstairs tenant turns the pots when cleaning the window. The caretaker covers holidays. Nothing stands on the floor because a child's pram is carried down those stairs daily.",
          "byline": "Anna Rook - Home and family"
        },
        "folding-table": {
          "title": "A table for more people",
          "body": "The Brookfields of Northgate own an extending table although normally only two eat there. Children and their families visit for name-day gatherings. A leaf waits behind the wardrobe and chairs come from next door. Some dishes are prepared a day early because the extended table restricts the kitchen passage. The furniture came from their larger former room; moving reduced space without reducing the guest list.",
          "byline": "Anna Rook - Home and family"
        },
        "window-sill": {
          "title": "Every sill has its aspect",
          "body": "Sophia Crowe at the Northgate flower shop asks which way customers' windows face. Plants chosen by appearance may struggle in dark rooms or dry positions above radiators. Small cuttings sell best for compact flats, but she explains their eventual size. Customers bring leaves for identification and ask about soil. Some plants have circulated among neighbours for years without labels or remembered names.",
          "byline": "Anna Rook - Home and family"
        },
        "family-bookshelf": {
          "title": "Books in two rows",
          "body": "The Blakes of Station Road have collected books since their student days. Hallway shelves hold two rows, making rear volumes awkward to retrieve. Lists at the shelf edges identify them. Children's textbooks stand separately near the desk. The family is donating some books to the Station Road library, retaining volumes they reread rather than every title once bought in a series.",
          "byline": "Anna Rook - Home and family"
        },
        "room-divider": {
          "title": "A room divided by shelves",
          "body": "The Blakes of Station Road created a study corner for their daughter in their only large room. Shelving moved away from the wall with a desk behind it, allowing lamplit reading while others listen to the radio. Noise still travels, so the family agreed quiet hours before tests. A joiner secured the shelves against tipping when books are pulled out. Their younger son still does homework at the kitchen table.",
          "byline": "Anna Rook - Home and family"
        },
        "stairwell-curtains": {
          "title": "The shared stair window",
          "body": "Residents of 9 Orchard Street removed pots from the stair bend at a tenant's request. He carries a shopping trolley upstairs for his ill wife. Plants went into flats, with two small ones remaining on a broad sill. Caretaker John Fisher reminded residents to keep access for window cleaning. The tenants settled it at a meeting without ordering new shelves. The floor has remained clear.",
          "byline": "Anna Rook - Home and family"
        },
        "furniture-plan": {
          "title": "Measuring before buying",
          "body": "A joiner at 5 Cooper Street helped the Page family fit a wardrobe into their new Northgate flat. The body fitted, but a door struck the wall and blocked the bottom drawer. Reversing one door avoided rebuilding the cabinet, while a skirting section also needed shortening. The family kept its wardrobe. Before moving other furniture, they checked opening clearance as well as width.",
          "byline": "Anna Rook - Home and family"
        },
        "plant-cuttings": {
          "title": "A cutting with a name",
          "body": "Over twenty people exchanged spider plants, geraniums and tradescantia cuttings at Northgate clubroom, 6 Linden Road. Sophia Crowe from the estate flower shop helped identify plants and choose pots. Most brought rooted cuttings. Pots carried their former owners' names so new owners could ask about watering later. Leftovers will furnish the clubroom, cared for by two regular participants.",
          "byline": "Anna Rook - Home and family"
        },
        "child-desk": {
          "title": "Their sister's old desk",
          "body": "Paul Mason of School No. 7 inherited his older sister's desk, but his feet did not reach the floor and he wrote with raised shoulders. The shop at 5 Cooper Street shortened its legs, retaining drawers and top. His sister now uses a larger table at technical-school boarding accommodation. Adaptation cost less than replacement. Before finishing, the joiner asked Paul to try the desk, checking knee room below the drawers too.",
          "byline": "Anna Rook - Home and family"
        },
        "coat-hooks": {
          "title": "Hooks at the right height",
          "body": "The Northgate clubroom at 6 Linden Road now has children's coat hooks. Young participants had left coats on chairs because they could not reach the shared rack. Leftover shelf-repair wood and donated hooks supplied the lower one. A pocket holds lost gloves; caretaker Celia Fox asks parents to check it at collection time. The adult rack is now accessible without moving a heap of jackets.",
          "byline": "Anna Rook - Home and family"
        },
        "soup-ladle": {
          "title": "Lunch for two shifts",
          "body": "The railway workshops' canteen on Station Road serves lunch during two work breaks. Cook Helena Grey plans portions so the second shift receives the same menu as the first. Smaller serving vessels are replenished from the kitchen as queues advance. Shift swaps make attendance hardest to predict. The manager asks foremen for advance numbers because surplus cooked portions cannot simply be set aside for tomorrow.",
          "byline": "Anna Rook - Trade"
        },
        "market-scales": {
          "title": "Apples from the family orchard",
          "body": "Mary Crowe of Birchwood sells apples from the family orchard at the Station Road market, separating dessert fruit from baking apples. Buyers usually ask price before variety. A cut apple lets them inspect the flesh. Smaller fruit costs less but produces more peeling waste. Regulars order larger quantities before market visits so crates are not transported unnecessarily.",
          "byline": "Anna Rook - Trade"
        },
        "canteen-tray": {
          "title": "The tray returns",
          "body": "At the milk bar by the Station Road station, trays return before customers leave. Travellers linger over tea between connections. Manager Anna Booth lets them stay until seats become scarce. Suburban trains bring the heaviest rush, when an extra kitchen worker collects dishes. The bar owns few spare glasses, making prompt washing essential if new customers are to receive drinks immediately.",
          "byline": "Anna Rook - Trade"
        },
        "family-dumplings": {
          "title": "Dumplings made together",
          "body": "Helena Grey of Station Road cooks in a canteen but makes dumplings for a large family at home. Her daughter adds exact quantities to Helena's old notebook. Three glasses of flour differed when measured in the daughter's newer glass, so they compared portions and corrected the recipe together. Potato-and-curd filling is prepared beforehand, leaving rolling, filling and sealing to several pairs of hands at the table.",
          "byline": "Anna Rook - Trade"
        },
        "bakery-visitors": {
          "title": "Bread before dawn",
          "body": "School No. 7's final-year class visited the Orchard Street bakery as part of careers education. Master John Rook showed ovens, benches and the proving room. Pupils arrived after night production while bread was loaded for delivery. Questions covered hours and training. He also described cleaning and carrying sacks, tasks invisible to customers collecting finished loaves.",
          "byline": "Anna Rook - Trade"
        },
        "recipe-contest": {
          "title": "A recipe with a note",
          "body": "Helena Grey of Station Road won the potato-dish contest at Northgate clubroom, 6 Linden Road, with an onion-and-curd casserole. Eight participants judged each other's dishes for taste, cost and preparation time, served anonymously in matching vessels. The winner supplied quantities for four people. Her recipe can be copied from the caretaker; the others will follow after quantities are checked.",
          "byline": "Anna Rook - Trade"
        },
        "school-sandwiches": {
          "title": "Lunch in a bag of one's own",
          "body": "Fourth-year pupils at School No. 12 sewed lunch bags from linen remnants supplied by parents. Teacher Celia Burke helped fit them to boxes and wrapped sandwiches. Bags replace loose parcels mixing with exercise books inside satchels. After a week's use, several needed stronger seams and wider openings for easier packing.",
          "byline": "Anna Rook - Trade"
        },
        "market-baskets": {
          "title": "Purchases left at the stall",
          "body": "Stallholders at the Station Road market increasingly keep paid purchases until customers leave, sparing older shoppers a heavy basket between stalls. Mary Crowe holds apples; her neighbour holds potatoes. Names and paid amounts mark the bags. Similar bags still cause collection mistakes. The market caretaker asks customers to check contents before leaving because there is no shared storage service.",
          "byline": "Anna Rook - Trade"
        },
        "tea-service": {
          "title": "Cups that do not match",
          "body": "Residents donated seventeen cups and saucers to the Northgate clubroom at 6 Linden Road. Patterns do not match, but the set serves tea at senior meetings. Previously guests brought mugs or waited for shared ones to be washed. Caretaker Celia Fox accepted only uncracked, unchipped crockery. The cups stand in a locked cupboard beside the kettle. Guests wash their own, and the last pair on duty checks the set is back on its shelf.",
          "byline": "Anna Rook - Trade"
        },
        "potato-varieties": {
          "title": "A potato has a name",
          "body": "Haven allotment holders on Orchard Street compared potatoes from three Birchwood growers, cooked separately and served plain. Some broke apart easily; others held their shape when sliced. The meeting prepared a shared bulk order. Families chose different varieties for dumplings, soups and salads. The allotment caretaker is collecting orders and will arrange delivery with the growers.",
          "byline": "Anna Rook - Trade"
        },
        "tram-terminus": {
          "title": "A few minutes at the loop",
          "body": "Drivers on tram route 4 have a few minutes at the Northgate terminus before returning to the centre. Passengers buy kiosk tickets and take seats. Kiosk seller Helena Fox keeps newspapers for bus drivers bringing people from the outskirts. Late arrivals may leave no time to collect them. The rush peaks before morning shifts; after nine, the benches mainly hold pensioners travelling to Station Road shops.",
          "byline": "Eve Fox - City and region"
        },
        "luggage-label": {
          "title": "A suitcase with a ticket",
          "body": "The luggage office at the Station Road station mainly serves visitors attending to business in town. They leave cases, sacks and parcels rather than carry them between offices. Henry Plowright numbers each package and gives its owner a matching receipt. Evenings peak before suburban trains. Last-minute collections can mean several precious minutes waiting in the queue.",
          "byline": "Eve Fox - City and region"
        },
        "railway-porter": {
          "title": "The trolley knows the steps",
          "body": "Henry Plowright has moved luggage at the Station Road station for twenty years. He knows a step-free platform route, though it is longer than the ordinary passage. Heavy trunks go on the trolley before bags. He asks owners to count packages and identify their carriage before setting off. Families and people bringing market goods need most help. He cannot always return to the hall before the next train arrives.",
          "byline": "Eve Fox - City and region"
        },
        "bus-ticket-book": {
          "title": "A ticket through the hatch",
          "body": "At the suburban bus ticket office beside Station Road station, Mary Lester asks about return times too. Birchwood passengers may want the post office stop or farms beyond the mill. Older residents use names absent from printed timetables. She keeps a list behind the glass. The longest conversations involve visitors seeking relatives from old addresses.",
          "byline": "Eve Fox - City and region"
        },
        "route-map": {
          "title": "A map for visitors",
          "body": "Pupils at School No. 7 on Station Road drew a route from the station before a meeting for families commuting from outside the city. It marks two crossings and the courtyard entrance hidden from the main street. The caretaker checked it with a first-time visitor, prompting the addition of the gate number. Copies accompanied invitations so guests would not search for the office in the neighbouring building.",
          "byline": "Eve Fox - City and region"
        },
        "commuter-survey": {
          "title": "Connections in a notebook",
          "body": "Birchwood rail passengers wrote about connecting to route 4 at Station Road station. The timetable allows four minutes; walking from the far platform takes at least six, particularly with shopping or prams. We forwarded their letter to the transport company, which has promised to time the morning walk. Until schedules are coordinated, passengers must allow for waiting for the next tram.",
          "byline": "Eve Fox - City and region"
        },
        "bicycle-rack": {
          "title": "Space beside the gate",
          "body": "The railway workshops on Station Road moved their cycle rack nearer the porter's lodge after employees reported bicycles blocking the store entrance. The new position has a canopy but no extra capacity. Morning arrivals still exceed spaces. The works council is counting cycle commuters before ordering another rack. Meanwhile management has allocated part of the courtyard fence.",
          "byline": "Eve Fox - City and region"
        },
        "station-signs": {
          "title": "The arrow's other side",
          "body": "At Station Road station, the waiting-room sign has been moved so people leaving the tunnel can read it. Previously they saw its back and went to the ticket desks for directions. Reader Edward Page confirmed the change after reporting the problem. The stationmaster will inspect other signs, including the route to left luggage partly hidden by a kiosk.",
          "byline": "Eve Fox - City and region"
        },
        "walking-club": {
          "title": "A route measured in steps",
          "body": "The Alder Street walking club checked its family route from the Northgate terminus to the Birchwood bus stop. Leader Stephen Piper found a missing fork near the mill where walkers could head towards fields. The revised account gives landmarks and approximate times at a gentle pace. Members also timed the return to the bus. Copies are available from the Alder Street cultural centre office.",
          "byline": "Eve Fox - City and region"
        },
        "tram-model": {
          "title": "A tram on a school table",
          "body": "Railway technical-school pupils on Station Road built a tram model for their classroom, measuring a vehicle at the Northgate terminus with staff permission. Its removable roof shows seats, doors and cab. Without a motor, it serves construction lessons. Teacher Peter Judd also plans to use it at open days. The builders supplied drawings so a later class can add a trailer car.",
          "byline": "Eve Fox - City and region"
        },
        "cloakroom-tokens": {
          "title": "A token in the pocket",
          "body": "Mary Grey has run the Daybreak cinema cloakroom for years. Workers from several workplaces often arrive together for evening screenings. Coats hang by token number, hats above the matching hook. Lost tokens take longest: owners must describe their coat and wait for others to collect theirs. She asks viewers not to put tokens in the coat they are handing over, a mistake even regulars make.",
          "byline": "Eve Fox - City desk"
        },
        "letter-carrier": {
          "title": "An address known for years",
          "body": "Postman Raymond Fox serves shared flats on Station Road where letterboxes may name only the principal tenant. Mail to others returns to the office if recipients cannot be identified. He asks residents to add names, including at rear entrances. Personal familiarity cannot help a substitute carrier, who has the same envelope address but lacks years of neighbourhood knowledge.",
          "byline": "Eve Fox - City desk"
        },
        "barber-mirror": {
          "title": "Conversation at the mirror",
          "body": "Paul Howard's barber shop at 24 Station Road is busiest before a free Sunday. Workshop employees arrive after shifts and read the paper while waiting. Working alone, he offers no exact appointment times. Children usually come during quieter mornings. Regulars are asked what to change from their previous haircut. Football conversation pauses during shaving, when the customer must sit still.",
          "byline": "Eve Fox - City desk"
        },
        "porter-ledger": {
          "title": "A message with the porter",
          "body": "Joseph Forster, porter at the Alder Street cultural centre, takes messages for instructors and participants. Few have home telephones, so changed rehearsal times mean notes or visits. He records surnames and groups: three music pupils are named Anna. Messages are not entrusted to passing visitors. Regulars check the notebook by the entrance before heading to their rooms.",
          "byline": "Eve Fox - City desk"
        },
        "lost-glasses": {
          "title": "The spectacles return",
          "body": "Retired joiner Wilfred Piper collected spectacles left at Branch No. 6 on Station Road after a neighbour recognised the case description. Librarian Jean Wells requested another detail; he identified a patch sewn inside. Two pairs of gloves and an umbrella remain at the desk. Staff ask claimants for their visit date to help match belongings.",
          "byline": "Eve Fox - City desk"
        },
        "queue-seats": {
          "title": "Chairs beside the counter",
          "body": "After a reader's letter, the household repair shop at 14 Orchard Street rearranged its waiting area. Chairs opposite the counter left too little room to collect large appliances. Some now stand along a side wall, with a low table for packages. The same number of seats remains, with clear access to the back room. Customers carrying sewing machines no longer squeeze between waiting people's knees.",
          "byline": "Eve Fox - City desk"
        },
        "family-photo-names": {
          "title": "Who is beside the aunt",
          "body": "Seniors at Northgate clubroom, 6 Linden Road, identified photographs from railway-workshop excursions. Celia Rake brought her father's photographs. Participants named several employees and recognised a former works coach, but not one riverside stop. A copy is displayed seeking help. The original went back to the family with names and comments on separate cards.",
          "byline": "Eve Fox - City desk"
        },
        "returning-umbrella": {
          "title": "An umbrella returns",
          "body": "An umbrella taken by mistake after an evening screening returned to the Daybreak cloakroom. Joiner Wilfred Piper noticed at home that its handle lacked his repair. The attendant found his own umbrella among unclaimed items. Both viewers recovered theirs after descriptions were checked. The manager asks guests to check umbrellas with coats under one token rather than leave them unmarked by the auditorium door.",
          "byline": "Eve Fox - City desk"
        },
        "market-bench": {
          "title": "A bench moved one pace",
          "body": "The bench at Station Road market's exit was moved against a pavilion wall after older shoppers reported passing barrows made resting and arranging bags difficult. The caretaker agreed the position with traders, keeping stalls accessible. The canopy now shelters users from rain. Reader Edith Page also requested a bench by the bus stop. Market management is seeking a position clear of deliveries.",
          "byline": "Eve Fox - City desk"
        },
        "address-correction": {
          "title": "Two entrances, one letter",
          "body": "Winifred Fox's letters at 8 Cooper Street went to the front building rather than the rear: both had a Flat 4 and envelopes lacked an entrance designation. After her complaint, the administration marked the front A and rear B. She notified correspondents of her full address. The postman confirms that new door signs alone would not correct mail sent using the old details.",
          "byline": "Eve Fox - City desk"
        },
        "chalk-board": {
          "title": "The board before class",
          "body": "At School No. 12 on Alder Street, Edith Finch leaves a model date and heading on the board for first-year pupils. Some copy slowly, so the next task is not immediately written over it. Desks differ in height and the smallest children sit nearer the board. Rushing the copying, she explains, makes it harder to tell later whether a child understood the instruction.",
          "byline": "Mark Barrett - Education"
        },
        "exercise-book": {
          "title": "A margin for revision",
          "body": "Mary Beckett of School No. 12 asks older pupils to submit rough drafts with essays. A finished sentence does not reveal how often it changed. Pupils explain cuts and changes in sequence. Some dislike showing crossings-out. She does not grade the draft's appearance: she wants evidence of independent work, which can disappear when a family member copies everything neatly.",
          "byline": "Mark Barrett - Education"
        },
        "school-map": {
          "title": "The map returns to its tube",
          "body": "One regional map serves four classes at School No. 7 on Station Road. Sophia Plowman carries it between rooms because only the geography classroom has a permanent mount. Repeated rolling wears its edges and small symbols are hard to see from the back. Pupils use hand-copied sections for exercises. A replacement is ordered but still awaited; the old map remains in use for lessons on local transport and livelihoods.",
          "byline": "Mark Barrett - Education"
        },
        "evening-students": {
          "title": "A notebook after work",
          "body": "The evening technical school on Station Road teaches workshop, warehouse and suburban factory employees. Some arrive directly from shifts. Mathematics teacher Adam Routledge holds weekly catch-up sessions, but one time cannot suit everyone. The last bus to Birchwood leaves before consultations finish, so commuters compare solutions with classmates at the following lesson.",
          "byline": "Mark Barrett - Education"
        },
        "spelling-contest": {
          "title": "A dictation explained",
          "body": "Seventh-year pupil Joan Mason won School No. 12's spelling contest without an error among 28 entrants. The next two each made one mistake. Language teacher Mary Beckett discussed difficult words in a follow-up session. The parents' committee donated a dictionary as the prize. A city contest entry is planned once a date can be coordinated for commuting pupils.",
          "byline": "Mark Barrett - Education"
        },
        "school-garden-plan": {
          "title": "A garden on paper",
          "body": "Sixth-year pupils at School No. 7 on Station Road measured the garden behind the gym for class plots. One group counted a path in both adjoining beds, leaving the combined plan short of space at the fence. Sophia Plowman remeasured that section with them. The corrected layout provides six equal beds and a shared tool strip. Younger classes will work there with older helpers.",
          "byline": "Mark Barrett - Education"
        },
        "reading-pairs": {
          "title": "Older pupils read aloud",
          "body": "School No. 12's library reviewed a month pairing first- and seventh-year readers. Twelve older children met younger pupils waiting after lessons for parents. The librarian selected books and pairs chose passages. Animal stories proved most popular. Older pupils are now preparing simpler texts for children keen to read alone but struggling with densely printed pages.",
          "byline": "Mark Barrett - Education"
        },
        "geometry-models": {
          "title": "A solid from a flat sheet",
          "body": "Fifth-year pupils at School No. 7 on Station Road made cubes and pyramids from packaging card supplied by parents working in shops. Adam Routledge requested one opening face so interiors remain visible. Some models fitted badly because gluing tabs had been subtracted from face dimensions. Corrected patterns produced a set for the parallel classes as well.",
          "byline": "Mark Barrett - Education"
        },
        "school-newspaper": {
          "title": "School clubs in print",
          "body": "School No. 12 produced a four-page paper on after-school activities. Seventh-year pupils interviewed the table-tennis coach, librarian and caretaker who oversees rooms after lessons. The office typed the text and duplicated thirty copies. A sports report was shortened to include every club's meeting times. Copies are in the school library. The next issue will cover parents' occupations.",
          "byline": "Mark Barrett - Education"
        },
        "workshop-aprons": {
          "title": "An apron with its own pocket",
          "body": "School No. 12's sixth-year class sewed aprons for practical work. Celia Burke supplied three pattern sizes; pupils adjusted lengths and pockets. The parents' committee bought fabric with fair proceeds. Aprons will protect clothes during painting and gluing and remain on named classroom hooks. Sewing exceeded the planned lessons because two machines meant considerable waiting.",
          "byline": "Mark Barrett - Education"
        },
        "weather-notebook": {
          "title": "Weather from this courtyard",
          "body": "Retired teacher Joseph May of Orchard Street has recorded weather for fifteen years. A courtyard-facing thermometer is read at fixed morning and evening times, alongside rain and cloud notes. Neighbours consult him when memories of past winters differ. He shows the notebooks but points out that a courtyard is no weather station. They record conditions at one consistent location.",
          "byline": "Science desk"
        },
        "shadow-dial": {
          "title": "A shadow changes place",
          "body": "School No. 7's nature club on Station Road measures a fixed garden post's shadow at noon, recording length and direction. Sophia Plowman compares results across months. The post remains between lessons so later classes can repeat measurements. Overcast days leave blank entries rather than reusing the last sunny reading.",
          "byline": "Science desk"
        },
        "leaf-collection": {
          "title": "A leaf and its finding place",
          "body": "School No. 7 on Station Road builds its leaf collection from Linden Road park and Birchwood visits. Sophia Plowman asks pupils to record where each leaf was found and describe its tree. Similar leaves can mislead beginners, so pupils add fruit and bark drawings when available. Older cards are repaired rather than discarded, allowing classes to compare the same trees at different seasons.",
          "byline": "Science desk"
        },
        "magnifier-table": {
          "title": "An ordinary thread enlarged",
          "body": "School No. 12's nature room has four magnifiers for a class. Children take turns inspecting threads, feathers and leaves while others prepare drawings. Irene Wells asks them to describe visible details before consulting the textbook. Their observations include damage absent from ideal illustrations. Most samples come from homes and walks to school, needing no purchases.",
          "byline": "Science desk"
        },
        "star-chart": {
          "title": "The sky on a school chart",
          "body": "The Alder Street cultural centre's astronomy circle observed from School No. 12's courtyard. Clarence Eagle began with the Plough and north. Some participants were comparing a chart with the real sky for the first time. Window lighting obscured faint stars, so the telescope remained indoors. The club plans a clear-night trip beyond Birchwood for a less obstructed view.",
          "byline": "Science desk"
        },
        "water-level": {
          "title": "The same level",
          "body": "Sixth-year pupils at School No. 12 filled connected vessels of different shapes and watched water settle at equal heights. Visiting joiner Wilfred Piper demonstrated the same principle with a transparent hose used for levelling. Pupils checked two distant wall points. The demonstration precedes practical lessons planning new classroom shelves.",
          "byline": "Science desk"
        },
        "seed-observation": {
          "title": "A sprout in two notebooks",
          "body": "Classes 5A and 5B at School No. 12 compared beans grown in nature lessons. They used the same seed supply, but 5B began three days later. Comparing measurements revealed that plants recorded on the same date were different ages. Teacher Irene Wells helped count days from sowing. The corrected comparison showed smaller growth differences. Both classes will now also record temperatures beside their windowsills.",
          "byline": "Science desk"
        },
        "sound-string": {
          "title": "Pitch and length",
          "body": "Sixth-year pupils at School No. 12 built a device with a taut string and movable support. Shortening its vibrating length raised the pitch. Railway musician Maurice Newman brought a guitar to compare the support with pressing a string at a fret. Not everyone heard the change immediately, so trials were repeated individually: several strings played together had made comparison difficult.",
          "byline": "Science desk"
        },
        "soil-jars": {
          "title": "Soil from several places",
          "body": "Pupils at School No. 7 on Station Road brought soil from the school garden and a field near Birchwood. Mixed with water in jars, particles settled into layers of different thickness and colour. Sophia Plowman noted that collection depths differed, complicating comparison. The next samples will follow one method. Existing jars remain labelled to avoid confusion during later lessons.",
          "byline": "Science desk"
        },
        "bridge-paper": {
          "title": "A bridge from one sheet",
          "body": "A pair from Class 6B won School No. 12's paper-bridge contest. Their concertina sheet spanned supports twenty centimetres apart and held six equal weights. Every team had identical paper and time, with glue forbidden. The teacher compared folds afterwards: a flat sheet bent sooner than the same quantity arranged into stiffening folds.",
          "byline": "Science desk"
        },
        "common-key": {
          "title": "A key with a large tag",
          "body": "Celia Fox keeps the Northgate clubroom key at 6 Linden Road. Leaders collect it before sessions and return it after locking up. After her departure it goes into a marked box at the administration's porter's desk. Previously it was left with neighbours, forcing the next group to find the right flat. A large wooden tag distinguishes it from home keys. Collection also includes checking the games-cupboard key has returned.",
          "byline": "City desk"
        },
        "allotment-path": {
          "title": "A path between fences",
          "body": "Plot numbers at Haven allotments on Orchard Street do not run in order from the main gate. Extensions retained older numbering. Caretaker John Lynne keeps a plan for visitors and suppliers, especially those bringing plants or hut materials. Plot holders still give directions by the large pear tree and well. Both landmarks appear on the map so newcomers can follow those instructions.",
          "byline": "City desk"
        },
        "neighbour-tools": {
          "title": "A drill in the ledger",
          "body": "Families at 12 Linden Road on the Northgate estate share a drill, saw and long ladder stored in different flats. The caretaker lists owners but does not lend on their behalf. Borrowers agree return dates directly with neighbours, making it clear whom to contact when equipment is needed. Drill bits and other small parts are counted whenever the box changes hands.",
          "byline": "City desk"
        },
        "noticeboard-space": {
          "title": "A notice has a date",
          "body": "Celia Fox reviews the noticeboard at Northgate clubroom, 6 Linden Road, after weekly cleaning. Past invitations and withdrawn offers come down; undated notices need confirmation after a month. Residents chiefly seek services, children's clothing exchanges and lost belongings. Removed slips stay briefly in an envelope for anyone returning to copy an address.",
          "byline": "City desk"
        },
        "laundry-roster": {
          "title": "A free laundry slot",
          "body": "Tenants at 12 Linden Road on the Northgate estate changed shared-laundry bookings to include start and finish times, reporting cancellations to the caretaker. Unrecorded key handovers had made vacant periods appear occupied. Winifred Page used the first released slot after waiting several days. Opening hours are unchanged; clearer records make better use of hours tenants already fund.",
          "byline": "City desk"
        },
        "club-bookcase": {
          "title": "Shelves for the clubroom",
          "body": "The Blakes of Station Road donated shelves to Northgate clubroom, 6 Linden Road, after reducing their book collection. Two neighbours transported them after work. Adjustable shelves now fit games and art albums, with lower sections reserved for children. Previously boxes stood on the floor and had to be removed for every cleaning. The unit was fixed to the wall before use.",
          "byline": "City desk"
        },
        "bench-painting": {
          "title": "The bench's restored back",
          "body": "Residents of 14 Station Road restored the bench between gate and rear building. Joiner Wilfred Piper replaced two seat boards; neighbours cleaned and painted the rest using borrowed tools and paint bought from a collection. Older residents mainly use it while waiting for relatives or neighbours returning with shopping. The caretaker kept the rear workshop access clear. The bench returned to its former wall.",
          "byline": "City desk"
        },
        "allotment-library": {
          "title": "Gardening books under one key",
          "body": "Haven allotment holders on Orchard Street pooled nineteen books on fruit growing, vegetables and huts in caretaker John Lynne's cupboard. The contributors' names remain inside the donated books. The most requested subject, pruning, lacks a manual; the committee is searching second-hand shops. Books can be borrowed during Saturday duties by the main gate.",
          "byline": "City desk"
        },
        "shared-room-hours": {
          "title": "Hours on a single sheet",
          "body": "Groups using Northgate clubroom, 6 Linden Road, agreed a fifteen-minute interval between sessions. The art class needs to wash tables before chess players arrive. Back-to-back bookings had caused weekly disputes. Caretaker Celia Fox moved the chess start with members' agreement. Revised schedules appear at the entrance and estate office. Group leaders updated invitations too, since some members come straight from work.",
          "byline": "City desk"
        },
        "courtyard-chronicle": {
          "title": "A courtyard chronicle",
          "body": "Residents of 8 Cooper Street assembled an album of their workshop courtyard. The Fox and Piper families supplied photographs; a former cobbler identified businesses in the oldest print. Several dates remain uncertain. The caretaker keeps the album, with selected copies at the Station Road library. Recent arrivals added current tenants' names so future readers will not need to identify every face again.",
          "byline": "City desk"
        }
      }
    },
    mobile: {
      title: 'Next, Please!', reception: 'Calling the clinic',
      languagePolish: 'PL', languageEnglish: 'EN',
      phoneLabel: 'Telephone receiver — next',
      phoneDescription: 'A large olive receiver from an old telephone, with a coiled cord.',
      tone: 'Dial tone', dialing: 'Dialing…',
      greeting: 'Clinic speaking!',
      reply: 'Remote work? You must be joking, Doctor. We expect you at the clinic.',
      note: 'To play, you need a computer, a proper one,',
      noteHelp: 'with a keyboard and a mouse or trackpad.',
      noteLines: ['To play, you need', 'a computer,', 'a proper one,', 'with a keyboard', 'and a mouse', 'or trackpad.'],
      noteLabel: 'A handwritten note from the clinic',
    },
    takeCertificate: 'Take a certificate form from the document rack', reservedForm: 'Reserved form slot — inactive', rackBlank: 'Paper', rackCertificate: 'Certificates',
    phone: 'Telephone — listen to the exchange tone', measurements: 'Scale and stadiometer — measure weight and height',
    takePaper: 'Take a blank sheet from the document rack', takeClip: 'Take a paperclip from the holder',
    drawer: 'Drawer', drawerNames: { drawer: 'Left drawer', 'drawer-2': 'Right drawer' }, trash: 'Wastepaper basket',
    drawerEmpty: 'The drawer is empty. Move an item here to keep it.',
    drawerHelp: 'Put a held sheet, newspaper, rulebook, paperclip or banknote in the drawer. With empty hands, open its contents.',
    drawerViewHelp: 'Documents run from newest to oldest by date; ties show the most recently filed first. Clipped records occupy one position. Hover or focus with Tab to read the name. Click or press Enter to retrieve it. Browse further batches for more records and newspapers. Newspapers form a stack from oldest to newest. Hover over an exposed edge or focus it with Tab to see the issue date; click or press Enter to retrieve that issue. The bottom edge or Escape closes the drawer.',
    drawerDocuments: 'Files', drawerCash: 'Cash', drawerObjects: 'Other objects', drawerBatch: 'Archive section',
    drawerRetrieve: 'Take out', drawerClose: 'Close drawer', drawerPrevious: 'Previous', drawerNext: 'Next',
    trashHelp: 'Move a document or newspaper over the basket and click to discard it.',
    clipTaken: 'Paperclip in hand. Apply it to a sheet to attach it.',
    clipNoTarget: 'Apply the paperclip to a note, referral, certificate or letter.',
    paperHelp: 'Click to pick up the sheet. Test results and history from the general examination appear automatically. Drop a sheet near another sheet’s clip to join them. Click the clip to separate them.',
    letterHelp: 'Open the envelope at its folded corner or press Enter. After reading, discard the letter in the basket.',
    calendar: {
      label: 'Desk calendar', date: 'Date',
      months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      monthsShort: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'],
      weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      weekdaysShort: ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
    },
    documentDesign: {
      referral: 'REFERRAL', certificate: 'CERTIFICATE', report: 'EXAMINATION REPORT', specialist: 'SPECIALIST OPINION', certificateStatement: 'Fitness for the stated work is certified:', medicalOffice: 'CLINIC',
      letter: 'NOTICE', directive: 'CIRCULAR', subject: 'Concerning', reference: 'Case reference',
      recipient: 'To the examining doctor', personal: 'FOR THE ADDRESSEE',
      institutions: { militia: 'MILITIA COMMAND', lot: 'NAL', zus: 'SIO', chamber: 'MEDICAL CHAMBER', clinic: 'OCCUPATIONAL HEALTH' },
      departments: { employer: 'PERSONNEL OFFICE', militia: 'PERSONNEL DIVISION', lot: 'FLIGHT PERSONNEL', zus: 'CERTIFICATION OFFICE', chamber: 'SECRETARIAT', clinic: 'CONSULTING ROOM 04' },
      referralInstruction: { initial: 'Referred for initial examination:', periodic: 'Referred for periodic examination:', control: 'Referred for follow-up examination:' },
      fields: { identity: 'Referred person', position: 'Position', work: 'Work', hazards: 'Exposures' },
      seal: { employer: ['PERSONNEL', 'RECORDS'], militia: ['MILITIA', 'STAFF'], lot: ['NAL', 'AIRCREW'], zus: ['SIO', 'CERTIFICATION'], chamber: ['MEDICAL', 'CHAMBER'], clinic: ['CLINIC', 'DOCTOR'] },
    },
    paperwork: {
      date: 'Date', issued: 'Issued', employerSeal: 'Violet personnel-office stamp',
      clinicSeal: 'Clinic seal', zusSeal: 'Rectangular blue SIO seal', signed: 'Signed by hand',
      referral: 'Referral for examination', occupational: 'Occupational medicine', note: 'Medical notes', blank: 'Blank sheet',
      employer: 'Employer', name: 'Full name', birthDate: 'Date of birth', birthShort: 'Born', age: 'Age', sex: 'Sex',
      female: 'F', male: 'M', femaleFull: 'Female', maleFull: 'Male', examination: 'Examination',
      initial: 'initial', periodic: 'periodic', control: 'follow-up', position: 'Position', managerial: 'Managerial', yes: 'yes', no: 'no',
      requirements: 'Tests', requirementCodes: { full: 'V+BP', vision: 'V', pressure: 'BP' }, work: 'Work type', hazards: 'Exposures', weight: 'Weight', height: 'Height', kg: 'kg', cm: 'cm',
      write: 'Add patient history to the notes', read: 'Read the document', open: 'Open the envelope',
      envelope: 'Sealed envelope', letter: 'Letter about a certificate', sender: 'Sender', recipient: 'To the examining doctor',
      zus: 'SIO', employerSender: 'Employer', paperclip: 'Paperclip', clipped: 'Paperclip attached', stored: 'In the drawer',
      unclip: 'Remove the paperclip and separate the documents', writeCertificate: 'Write the patient’s name and job position on the certificate',
      nameMissing: 'Patient name has not been written', nameWritten: 'Patient name written by hand', positionMissing: 'Job position has not been written',
      resultsHeading: 'Examination results', additionalHeading: 'Supplementary information',
      certificatePurpose: 'Fitness for the stated position', decisionHeading: 'Doctor’s decision', reference: 'File no.',
      missingResultSenders: { militia: 'Militia headquarters', lot: 'NAL office' },
      stationery: { militia: 'Militia', lot: 'NAL' },
      letterConcerns: {
        "expired-referral": "The referral date was compared with the clearance date. The interval requires clarification.",
        "invalid-referral": "Clearance relied on a referral whose origin the seal does not substantiate.",
        "identity-mismatch": "The cleared person’s details do not match the person named in the test results.",
        "general": "Clearance was compared with concerns about the general state of health.",
        "additional-test": "Clearance was compared with the findings of the relevant additional examination.",
        "vision": "Clearance was compared with the eyesight defect and the job requirements.",
        "pressure": "Blood pressure values requiring clarification were noted at clearance.",
        "authentic-referral": "The refusal was checked against the issuer’s register. The unclear seal was confirmed.",
        "unjustified-refusal": "No contraindications supporting the refusal were found in the examination findings.",
        "wrong-test": "The additional examination ordered does not correspond to the referred position.",
      },
      letters: {
        missingResult: [
          { subject: 'Concerning enclosures', body: "The certificate has been filed. The entry reserved for the additional examination report remains open. Please reconcile the enclosure list.", role: 'Personnel manager', signature: 'Walter Taylor' },
          { subject: 'Delivery of records', body: "Receipt of the certificate is recorded. No receipt entry was found for the additional examination report. The file awaits reconciliation.", role: 'Personnel officer', signature: 'Irene Birchall' },
          { subject: 'Incomplete employee file', body: "The employee file contains the certificate. The trail of the additional examination report requires clarification at the enclosure handover.", role: 'Work organisation manager', signature: 'George Langley' },
          { subject: 'Objections to the records', body: "The enclosure list was compared with the papers received. The entry for the additional examination report remains unconfirmed.", role: 'Company representative', signature: 'Barbara Willow' },
          { subject: 'Records supplement', body: "The certificate was registered separately. The papers supplied do not establish the whereabouts of the required additional examination report.", role: 'Senior personnel officer', signature: 'Stephen Bloom' },
          { subject: 'Record of omissions', body: "The receipt log covers the certificate. Receipt of its accompanying additional examination report has yet to be confirmed.", role: 'Administration manager', signature: 'Helen Eagles' },
        ],
        zus: [
          { subject: 'Review of documentation', body: "The case is under review. Please retain the records.", role: 'Senior accounts clerk', signature: 'Mary Jarvis' },
          { subject: 'Benefit file supplement', body: "The papers have joined the benefit file. Please retain the enclosures.", role: 'Benefits inspector', signature: 'Raymond Hawkins' },
          { subject: 'Notice of file review', body: "The case was referred for review. Originals remain at the clinic.", role: 'Accounts clerk', signature: 'Teresa White' },
          { subject: 'Note concerning the records', body: "The committee is reviewing the records. No acknowledgment is required.", role: 'Committee secretary', signature: 'Henry Kelsey' },
          { subject: 'Document schedule', body: "The file requires clarification. Please quote the reference.", role: 'Accounts inspector', signature: 'Sophia Reed' },
          { subject: 'Matter referred onward', body: "The file was referred onward. Please retain this notice.", role: 'Section head', signature: 'Adam Woolley' },
        ],
        employer: [
          { subject: 'Procedure initiated', body: "The refusal left the position vacant. Please retain the file.", role: 'Personnel manager', signature: 'Walter Taylor' },
          { subject: 'Personnel notification', body: "The refusal was entered in personnel records. Its grounds await clarification.", role: 'Personnel clerk', signature: 'Irene Birchall' },
          { subject: 'Extract from the rota', body: "A gap in the rota followed the refusal. The file awaits clarification.", role: 'Work planning manager', signature: 'George Langley' },
          { subject: 'Documents referred onward', body: "The refusal papers were referred for review. Please retain the complete file.", role: 'Company representative', signature: 'Barbara Willow' },
          { subject: 'Personnel findings', body: "The refusal interrupted employment. Personnel awaits clarification.", role: 'Senior personnel officer', signature: 'Stephen Bloom' },
          { subject: 'Register update', body: "A replacement rota followed the refusal. Please quote the case reference.", role: 'Administration manager', signature: 'Helen Eagles' },
        ],
      },
    },
    patientReferrals: [
      { employer: 'Dawn Works Archives', work: 'office work, filing', hazards: 'paper dust, sitting' },
      { employer: 'Link Engineering Works', work: 'overhead crane, shop floor', hazards: 'noise, working at height' },
      { employer: 'Wayfarer Staff Transport', work: 'passenger transport, shifts', hazards: 'traffic, prolonged sitting' },
      ...PATIENTS.slice(3).map(patient => ({ employer: patientCopy.en.employers[patient.employerId]!, work: patient.id < LEGACY_CASE_COUNT ? patientCopy.en.work[patient.jobId]! : `${patientCopy.en.work[patient.jobId]} / ${patientCopy.en.patterns[patient.workPatternId]}`, hazards: patientCopy.en.hazards[patient.jobId]! })),
    ],
    patientNotes: [['Work with records.', 'Seated work.'], ['Working at height.', 'Managerial position.'], ['Passenger transport.', 'Shift work.'], ...PATIENTS.slice(3).map(patient => patientCopy.en.conditions[patient.conditionId])],
    dragHelp: 'Click or press Space to pick up. The item follows the cursor; click again to put it down or use it. Enter performs its action.',
    carryingHelp: 'Click to put down or use. Stamps go back on their rests. Give the certificate to the patient. Arrows move, Shift moves faster, Enter or Space uses or puts down, Escape cancels.',
    itemPickedUp: 'Item in hand. Click again to put down or use. Arrows move, Enter uses or puts down, Escape cancels.',
    toolNoTarget: 'No document to stamp here. Put the stamp back on its rest.',
    toolPutAway: 'Item returned to its own place.',
    putAwayFit: 'Put the FIT stamp back on its rest',
    putAwayUnfit: 'Put the REFUSAL stamp back on its rest',
    manualHelp: 'Move the rulebook to the right desk and click its folded cover corner. Turn pages by their corners; turning back the first page closes the cover. Enter opens or closes it; Space picks it up.',
    manualOpened: 'Rulebook open on the desk.', manualClosed: 'Rulebook closed.',
    manualPrevious: 'Previous rulebook page', manualNext: 'Next rulebook page',
    notePagination: { previous: 'Previous notes page', next: 'Next notes page', page: 'Notes page', help: 'Further entries continue on the following pages. Turn the folded corners to read them.' },
    manualClose: 'Close the rulebook', manualOpenCover: 'Open the rulebook cover', manualPageLabel: 'Page',
    itemDropped: 'Item put down.', moveCancelled: 'Item returned to its previous position.',
    // Fixed optotypes embedded in the generated chart, shared by both locales.
    clock: 'Clock', eyeChart: ['E', 'F P', 'T O Z', 'L P E D', 'P E C F D', 'E D F C Z P'],
    resume: 'RESUME YOUR SHIFT', menu: 'MENU', archive: 'SAVES',
    breakRoomTitle: 'Next, Please!', gameTitleLines: ['NEXT,', 'PLEASE!'],
    breakRoomDescription: 'Doctors and nurses talk over coffee in the staff room. Your shift is paused; your desk will be here when you return.',
    restart: 'START OVER', restartTitle: 'A FRESH START',
    restartBody: ['You will begin again on day one.', 'Your current progress will be lost.', 'Save a copy in your files first.'],
    restartConfirm: 'BEGIN A NEW GAME', restartCancel: 'KEEP MY SHIFT',
    introTitle: 'STAFF INDUCTION', next: 'NEXT', enterCabinet: 'ENTER THE OFFICE',
    utilityControls: 'Game settings', languagePolish: 'Polski', languageEnglish: 'English',
    bellLabel: 'Next', trayLabel: 'Documents', rulebookLabel: 'Rules',
    documentVision: 'Vision', documentPressure: 'Pressure', documentTitleLabel: 'Certificate',
    documentPending: '—', roomNumberLabel: '04',
    intro: [
      { body: 'Some use\na scalpel.' },
      { body: 'Others, a catheter.' },
      { body: 'Or a pen.' },
      { body: 'You have\na rubber stamp.' },
    ],
    cabinetTitle: 'CONSULTING ROOM 04', chair: 'PATIENT CHAIR', emptyChair: 'QUIET. FOR NOW.',
    examinations: 'EXAMINATION STATION', exchange: 'DOCUMENT EXCHANGE',
    callPatient: 'NEXT, PLEASE!', takeDocument: 'TAKE REFERRAL',
    returnDocument: 'GIVE CERTIFICATE TO PATIENT', document: 'REFERRAL', certificate: 'CERTIFICATE',
    returnIdentityCard: 'Return the identity card to its owner',
    documentEmpty: 'RECORDS GO HERE', awaitingDocument: 'REFERRAL IN THE TRAY',
    general: 'General examination — examine the patient', generalResult: 'General examination', generalClear: 'no concerns', generalConcern: 'abnormal findings', leftEye: 'LE', rightEye: 'RE', pressureUnit: 'mmHg', veryHigh: 'very high',
    generalFindings: [
      'heart murmur', 'irregular pulse', 'wheezing', 'crackles at lung bases',
      'lower-leg swelling', 'hand tremor', 'impaired balance', 'weak hand grip',
      'limited shoulder movement', 'weakness in left leg', 'reduced finger sensation',
      'tenderness under right ribs', 'enlarged liver', 'enlarged neck lymph nodes',
      'breathless on light exertion', 'bluish lips', 'marked hoarseness', 'swollen knee joint',
      'recurrent dizziness',
    ],
    vision: 'EYE CHART', pressure: 'PRESSURE CUFF',
    visionResult: 'VISION', pressureResult: 'PRESSURE', untested: 'PENDING',
    pass: 'NORMAL', refer: 'REVIEW', fit: 'FIT', unfit: 'REFUSAL',
    stampFit: 'Select the fit stamp', stampUnfit: 'Select the refusal stamp',
    applyStamp: 'Apply the selected stamp to the certificate', stampHere: 'STAMP HERE',
    selectedStamp: 'Selected stamp', manual: 'RULEBOOK', manualTitle: 'CLINIC ADMINISTRATIVE REGULATIONS',
    additionalTests: {
      title: 'ADDITIONAL TEST REFERRAL', resultTitle: 'EXAMINATION RESULT',
      take: 'Take an additional examination referral from the third drawer',
      hand: 'Give the referral to the patient and defer the visit',
      choose: 'Circle one examination', selected: 'Circled', empty: 'No examination selected',
      selectionHelp: 'Circle one examination on the right desk. Pick up the referral and give it to the patient.',
      tests: { audiometry: 'Pure-tone audiometry', vestibular: 'Vestibular examination', psychiatry: 'Psychiatric consultation', 'chest-xray': 'Chest X-ray' },
      concerns: { psychiatry: 'Doubts about mental fitness.', 'chest-xray': 'Findings suggest pneumoconiosis.' },
      notes: {
        audiometry: { fit: 'normal hearing.', unfit: 'hearing loss.', discretionary: 'borderline hearing; clinical judgement required.' },
        vestibular: { fit: 'normal balance.', unfit: 'balance disorder.', discretionary: 'slight instability; clinical judgement required.' },
        psychiatry: { fit: 'no disorder found.', unfit: 'mental disorder.', discretionary: 'equivocal responses; clinical judgement required.' },
        'chest-xray': { fit: 'no pneumoconiosis.', unfit: 'pneumoconiosis confirmed.', discretionary: 'minor changes of uncertain significance.' },
      },
      report: {
        audiometry: { fit: 'Hearing is normal. No contraindications to furnace work.', unfit: 'Hearing loss rules out furnace work. Refusal required.', discretionary: 'Hearing threshold is borderline. Its relevance to furnace work should be assessed with the history and working conditions.' },
        vestibular: { fit: 'Balance function is normal. No contraindications to work as a pilot.', unfit: 'Balance disorder rules out work as a pilot. Refusal required.', discretionary: 'Slight instability during testing. Its relevance to pilot duties is left to the examining doctor’s judgement.' },
        psychiatry: { fit: 'No mental disorder found. Mentally fit for militia service.', unfit: 'Mental disorder rules out militia service. Refusal required.', discretionary: 'Observed responses do not establish fitness for service conclusively. Consider the history and general state of health.' },
        'chest-xray': { fit: 'No signs of pneumoconiosis. No contraindications to mining work.', unfit: 'X-ray confirms pneumoconiosis. Mining work is ruled out. Refusal required.', discretionary: 'Minor changes of uncertain significance. Assess fitness for mining work in light of the history and general health.' },
      },
      otherChecks: 'The examining doctor must also assess the remaining tests and documents.',
    },
    progression: {
      "chamber": "Medical Chamber",
      "specialistTitle": "SPECIALIST CERTIFICATE",
      "specialist": "Specialist",
      "specialistNames": ["Dr Raymond Fenwick", "Dr George Elwood", "Dr Stephen Birchall", "Dr Theodore Grove", "Dr Wallace Homerton", "Dr Clarence Prentice", "Dr Henry Orchard", "Dr Neville Greenfield"],
      "hr": "Human resources",
      "phone": "Tel.",
      "takeSpecialist": "Take the specialist certificate",
      "callSpecialist": "Call the specialist",
      "callEmployer": "Call human resources",
      "bribeNotes": {
        "pressure": [
          "Pressure just above the limit.",
          "Patient requests clearance."
        ],
        "vision": [
          "Vision defect just above the limit.",
          "Patient requests clearance."
        ]
      },
      "treatment": "The patient is receiving treatment for hypertension.",
      "clearance": "I find no contraindications to work in the position specified below.",
      "banknote": "100 zł banknote depicting Waryński",
      "bribeHelp": "Keep the banknote on the desk or in the drawer, or give it back to the patient. Kept cash becomes income at the end of the day.",
      "acceptBribe": "Keep 100 zł in the left drawer",
      "returnBribe": "Return 100 zł to the patient",
      "offer": "A hundred for a stamp?",
      "seal": {
        "clear": "Clear employer seal",
        "missing": "Employer seal missing",
        "unclear": "Illegible employer seal"
      },
      "notes": {
        "specialistValid": "Specialist: treatment, cleared for this job.",
        "specialistInvalid": "Specialist: different job. Invalid.",
        "employerValid": "HR: referral is authentic.",
        "employerInvalid": "HR: referral is not authentic."
      },
      "dialogue": {
        "dialing": "Whirr… click-click…",
        "specialistQuestion": "Doctor, can you confirm this certificate?",
        "employerQuestion": "Did you issue this referral?",
        "specialistValid": "Yes. Treatment ongoing. This job is fine.",
        "specialistInvalid": "That certificate covers a different job.",
        "employerValid": "Yes, confirmed. We issued that referral.",
        "employerInvalid": "No. We did not issue that referral."
      },
      "bankruptcyTitle": "THE LAST TOKEN",
      "bankruptcyBody": "The bills are paid. Your balance is below zero. Bankrupt. The clinic offers you a job in the cloakroom. You hang your white coat on the last hook. Now you issue tokens instead of certificates. Coats never appeal your decisions. Next, please!",
      "bankruptcyDescription": "The clinic cloakroom. The former doctor hands a brass token through a wooden hatch. Coats and an unused white coat hang behind him.",
      "restartGame": "START AGAIN",
      "hospitalTitle": "UNEXPECTED LEAVE",
      "hospitalDescription": "A dim hospital ward. The doctor rests under a blanket in a metal bed, his head bandaged. A flask stands on the bedside cabinet.",
      "hospitalBody": "The hundred stayed in your pocket, the refusal with the patient. You are beaten up on the way home. You wake up in hospital. After treatment, you will need an occupational health exam. This time across the desk.",
      "gameOver": "GAME OVER",
      "backToMenu": "MAIN MENU",
      "directives": {
        "additional-tests": {
          "subject": "Additional examinations",
          "body": "With effect from the date of this circular, additional examinations are required for designated occupational groups. Detailed indications and procedures are set out in Annex 3 to the rulebook.",
          "role": "Medical Chamber secretary",
          "signature": "Dr Adam Seale"
        },
        "dates": {
          "subject": "Validity of referrals",
          "body": "Referral dates shall be verified. Documents older than 3 days require refusal; those exactly 3 days old remain valid. This provision takes effect on the date of this notice.",
          "role": "SIO inspection office",
          "signature": "Irene Markham"
        },
        "specialist": {
          "subject": "Hypertension under supervision",
          "body": "Treated hypertension may be cleared upon a specialist certificate stating no contraindications for the specific job. A different occupation invalidates it. Any doubts shall be clarified by telephone.",
          "role": "Medical Chamber secretary",
          "signature": "Dr Adam Seale"
        },
        "authenticity": {
          "subject": "On authentic referrals",
          "body": "From the date of this notice, referrals require the employer’s seal. Its absence requires refusal. An illegible impression shall be confirmed by personnel using the number on the form.",
          "role": "SIO inspection office",
          "signature": "Irene Markham"
        }
      }
    },
    inspection: {
      title: 'SIO INSPECTION', inspector: 'SIO inspector', identity: 'OFFICIAL IDENTITY CARD',
      names: ['Maurice Shaw', 'Irene Barratt', 'Theodore Radley'],
      number: 'Service no.', role: 'Records inspection', validity: 'Return after inspection.',
      authority: 'Authorized to inspect records', takeId: 'Examine the inspector’s identity card', returnId: 'Return the inspector’s identity card',
      hand: 'Present records to the inspector', talk: 'Speak to the inspector', confirm: 'Confirm missing records and end the inspection',
      greeting: 'SIO inspection. Please check my identity card.', idReminder: 'Please return my identity card.',
      farewell: 'Thank you for your cooperation. Goodbye.',
      request: 'Please present the referral and visit note:', visit: 'Visit', received: 'Presented',
      missing: 'Do you confirm both documents are missing? Fine: 200 zł.',
      partial: 'Do you confirm the other document is missing? Fine: 50 zł.',
      continueSearch: 'You may keep searching. Click the inspector again to confirm the loss.',
      fineTitle: 'PENALTY NOTICE', fineSubtitle: 'Medical records inspection',
      amount: 'Amount due', reason: 'Breach', absentReason: 'Referral and visit note missing.', partialReason: 'Incomplete visit documentation.',
      addressee: 'Attending doctor', inspectorSignature: 'Inspector’s signature',
      settlement: 'Included in the daily settlement.', copy: 'Doctor’s copy',
    },
    manualBase: "Base regulations",
    manualPages: [
      { title: '1. Admissions', lines: ['Patients shall be called', 'one at a time, using', 'the bell on the left desk.', 'The referral shall be', 'collected from the tray.', 'Identity, occupation and', 'working conditions shall', 'be established before ruling.'],
        facingTitle: '2. Use of forms', facingLines: ['The right desk is reserved', 'for the reading of records.', 'Forms shall be taken', 'from the rack singly.', 'The certificate requires', 'a separate form.', 'An employer referral does', 'not replace a certificate.'] },
      { title: '3. General examination', lines: ['Every person is subject', 'to examination and history.', 'The examination shall begin', 'with empty hands.', 'Abnormal findings constitute', 'grounds for refusal.'],
        facingTitle: '4. Medical records', facingLines: ['Findings and history shall', 'be entered on a note sheet', 'in the order obtained.', 'Later entries shall follow', 'the existing entries.', 'Prior collection of a sheet', 'is not a prerequisite', 'for examination.'] },
      { title: '5. Required tests', lines: ['The referral code specifies', 'the required tests:', 'V — vision;', 'BP — blood pressure;', 'V+BP — both.', 'General examination, weight', 'and height apply to all.', 'Managerial rank grants', 'no exemption from weighing.'],
        facingTitle: '6. Vision assessment', facingLines: ['LE and RE shall be recorded', 'separately, in diopters.', 'For codes V and V+BP,', 'a defect over 6 diopters', 'in either eye warrants', 'refusal, regardless of sign.', 'At exactly 6, the doctor', 'shall consider the history', 'and general state of health.'] },
      { title: '7. Blood pressure', lines: ['For BP and V+BP, limits are', '160 mmHg systolic', 'or 100 diastolic. Within', '5 mmHg on either side,', 'the doctor shall consider', 'history and general health.', 'Exceeding this range', 'in either value warrants', 'refusal.'],
        facingTitle: '8. Recording readings', facingLines: ['The first two readings', 'shall be retained.', 'At 180 systolic or', '110 diastolic, red ink', 'shall be used.', 'The absence of red ink', 'does not constitute', 'clearance for work.'] },
      { title: '9. Use of stamps', lines: ['The decision shall be', 'stamped on the certificate.', 'After use, the stamp', 'remains in the doctor’s hand.', 'It shall be returned only', 'to its designated holder.', 'Amendments are permitted', 'until the form is delivered.'],
        facingTitle: '10. Delivery', facingLines: ['The pen on the form shall', 'enter the name and job.', 'The stamped certificate', 'shall be given to the patient.', 'This concludes the visit.', 'Placing the certificate', 'in the tray does not', 'constitute delivery.'] },
      { title: '11. Joining records', lines: ['A clip shall be attached', 'to the first sheet.', 'Add sheets against that clip.', 'Removing the clip', 'separates the records.', 'The referral and visit note', 'from every appointment', 'shall both be archived', 'in either desk drawer.'],
        facingTitle: '12. Correspondence', facingLines: ['Letters from SIO and', 'employers shall be opened', 'at the envelope corner', 'and read before filing', 'or disposal in the basket.', 'The absence of a letter', 'does not certify that', 'a ruling was correct.'] },
      { title: '13. Admission hours', lines: ['Admissions shall run', 'from 07:55 to 14:00.', 'After that hour, only', 'the current visit continues.', 'Reading these regulations', 'and arranging the desk', 'count towards working time.', 'The clock requires no action.'],
        facingTitle: '14. Closing procedure', facingLines: ['At 17:00 the cleaning staff', 'shall request work to end.', 'At 17:15 the office closes,', 'including when occupied', 'by a patient. Interrupted', 'visits earn no bonus.', 'Records already prepared', 'shall remain on file.'] },
      { title: '15. Remuneration', lines: ['Each working day earns', '1000 zł, plus 50 zł for', 'each completed visit.', 'Settlement takes place', 'on returning home.', 'Living costs, insurance', 'and amounts due shall be', 'deducted from available funds.'],
        facingTitle: '16. SIO charges', facingLines: ['The first detected breach', 'of the day incurs a fine', 'of 100 zł. Each further', 'breach incurs 400 zł.', 'Approval requires regard', 'to health and the current', 'clinic regulations.'] },
      { title: '17. Insurance', lines: ['A detected wrongful refusal', 'raises the premium by 50 zł', 'at 300 zł, or by 100 zł', 'at higher rates. This rate', 'applies on later days too.', 'Each day without a new rise', 'reduces it by 50 zł,', 'to a minimum of 300 zł.'],
        facingTitle: '18. Days off', facingLines: ['Friday, Saturday and Sunday', 'share a single settlement.', 'Insurance is charged once;', 'days off carry no wages.', 'Modest living costs 800 zł', 'for all three days.', 'Insurance and fines are extra.', 'Failure to cover these costs', 'results in bankruptcy.'] },
    ],
    manualSupplements: {
      inspection: { label: 'Records audit', pages: [
        { title: '1. Identification', lines: ['A SIO inspector presents', 'an official identity card.', 'The card shall be examined', 'and returned to its holder.', 'On request, present both', 'the referral and visit note', 'for the specified visit.', 'Earlier records remain', 'on file across working days.'],
          facingTitle: '2. Missing records', facingLines: ['Both documents are required.', 'They may be presented singly', 'or clipped together.', 'The doctor confirms loss', 'when asked by the inspector.', 'Both missing: 200 zł.', 'One missing: 50 zł.', 'The inspector issues a notice.', 'The fine enters the budget.'] },
      ] },
      dates: { label: "Annex 1", pages: [
        { title: "1. Referral date", lines: ["Under the SIO directive,", "the referral’s issue date", "shall be checked.", "Its age is calculated", "in calendar days relative", "to the date of the visit."],
          facingTitle: "2. Period of validity", facingLines: ["A referral more than", "three days old requires", "refusal. Exactly three days", "remains within the limit.", "Good health does not", "extend this period."] },
      ] },
      specialist: { label: "Erratum 1 — provision 7", pages: [
        { title: "1. Hypertension", lines: ["The Medical Chamber permits", "an exception to provision 7.", "A specialist must certify", "treatment for hypertension", "and no contraindications", "for the particular job", "named in the referral."],
          facingTitle: "2. Scope of exception", facingLines: ["A certificate for another", "job is invalid.", "Clarification is available", "from its issuer at the", "number on the form.", "Record the call in the notes.", "Other contraindications", "and defects in paperwork", "still require refusal."] },
      ] },
      authenticity: { label: "Annex 2", pages: [
        { title: "1. Employer seal", lines: ["Under the SIO directive,", "the employer’s seal", "shall be required.", "Its absence requires refusal.", "A clear seal confirms", "the referral’s authenticity."],
          facingTitle: "2. Unclear impression", facingLines: ["An unclear seal shall be", "confirmed with HR using", "the number on the form.", "Conclusions shall be entered", "in the medical notes.", "An inauthentic document", "requires refusal."] },
      ] },
      payments: { label: "Supplement 1", pages: [
        { title: "1. Personal payments", lines: ["Cash from a patient", "does not replace certificates", "or amend examination limits."],
          facingTitle: "2. Returning cash", facingLines: ["Before issuing a refusal,", "the full sum shall be returned.", "The clinic does not provide", "personal protection", "for the journey home."] },
      ] },
      additionalTests: { label: "Annex 3", pages: [
        { title: '1. Additional tests', lines: ['Under the Chamber directive:', 'furnace work — pure-tone', 'audiometry; pilots —', 'vestibular examination;', 'militia — psychiatry for', 'mental disturbance or doubts', 'about fitness for service;', 'miners — chest X-ray for', 'suspected pneumoconiosis.'],
          facingTitle: '2. Referral procedure', facingLines: ['Forms shall be taken from', 'the third rack slot from', 'the top. One test shall be', 'circled and the form', 'handed to the patient.', 'Other records are retained.', 'A test for another occupation', 'always incurs a SIO fine.'] },
        { title: '3. Scope of opinion', lines: ['Assess the opinion within', 'the scope of its examination.', 'Where findings are equivocal,', 'the doctor shall rule using', 'the history, general health', 'and working conditions.', 'Other contraindications', 'and defects in paperwork', 'require separate assessment.'],
          facingTitle: '4. Return visits', facingLines: ['Patients return with results', 'after several hours and', 'intervening admissions,', 'or on the next working day.', 'Existing notes and completed', 'examinations remain in use.', 'Issuing a referral does not', 'constitute a completed visit.'] },
        { title: '5. Delivering results', lines: ['After an additional test,', 'an employee cleared for work', 'shall receive the certificate', 'paperclipped to the relevant', 'examination report.', 'With a refusal, the report', 'is optional; the employee', 'will accept the bundle.'],
          facingTitle: '6. Missing enclosure', facingLines: ['Omitting the required report', 'always brings a reprimand', 'and an insurance increase.', 'The letter comes from', 'militia headquarters, the NAL', 'office or the workplace,', 'according to employment.', 'Detection applies in 100%', 'of these cases.'] },
      ] },
    },
    lamp: 'Toggle the ceiling lamp', decoration: 'Change decoration: plant or certificate',
    shiftDone: 'SHIFT COMPLETE', shiftDoneNote: 'Even a stamp deserves a rest.',
    nextDay: 'NEXT SHIFT', endDay: 'GO HOME', points: 'SAVINGS', queue: 'SEEN',
    cabinetHelp: 'Call a patient with the bell on the left desk. Move the rulebook from the left to the right desk to open it. Giving the certificate to the patient ends the visit. Time also passes between actions: 30 seconds equal 30 minutes with a patient or 5 minutes without one.',
    patientNames: PATIENTS.map(patient => {
      const storyPatient = storyPatientForId(patient.id);
      if (storyPatient) return storyCopy.en.actors[storyPatient.actorId];
      const identity = patientIdentity(patient);
      return identity ? patientCopy.en.identityNames[identity.characterId]![identity.variant]! : patientCopy.en.names[patient.characterId]!;
    }),
    patientJobs: PATIENTS.map(patient => patient.id < 3 ? ['Archivist', 'Crane operator', 'Driver'][patient.id]! : (patientIdentity(patient) && patient.sex === 'female' ? patientCopy.en.femaleJobs : patientCopy.en.jobs)[patient.jobId]!),
    examinationSpeech: { normal: ['Normal.', 'All in order.', 'No problems found.', 'No concerns.', 'Everything looks fine.'], concern: 'Hmm...', veryHigh: 'Oh dear...', doctor: 'Doctor', cleaner: 'Cleaner in the corridor', closing: 'We are closing now!' },
    patientSpeech: {
      returned: 'My test result.', greeting: 'Good morning.', hello: 'Hello.', morning: 'Morning.',
      hesitate: 'Uhh...', blurred: 'It is blurry...', cannotRead: 'Cannot read it.', unsure: 'Maybe... no.', again: 'Once more?',
      bribe: 'A hundred for a yes?', thanks: 'Thank you.', goodbye: 'Goodbye.', allRight: 'All right.', bye: 'See you.',
    },
    home: {
      title: 'HOME AT LAST', ledger: 'BUDGET', weekendTitle: 'WEEKEND', weekendLedger: 'WEEKEND BUDGET', workTitle: 'OFF TO WORK',
      description: 'Returning home. A coat on a hook and warm light beyond the open door.',
      arrivalComments: [
        'Shift over. Slippers need no certificate.',
        'Door closed. If anyone asks, the doctor is in the soup.',
        'Coat on the hook. Conscience can hang there too.',
        'Quiet at home. Nobody has asked for a stamp. Yet.',
        'Everyone examined. Except your own nerves.',
        'The armchair accepts patients without a referral.',
        'The tea is getting cold. At least it cannot appeal.',
        'Enough for today. Even the stamp looks impressed.',
        'Shoes off. Fitness for work revoked.',
        'Dinner without a queue. Suspicious.',
        'The doorbell. Please let it be anyone but a patient.',
        'Home, sweet home. No registration form required.',
      ],
      rest: 'Weekend plan: nothing. Any unfinished nothing can wait until Monday.',
      modestRest: 'Potato, bread and tea. Three courses. Just eat them separately.',
      weekendComments: {
        'weekend-autumn-park': ['Leaves falling. Blood pressure too. At last, the results agree.', 'The sun came out briefly. Another short shift, apparently.'],
        'weekend-rain-tram': ['The tram runs without a referral. There is much to learn.', 'Rain knocks on the window. Not answering. No admissions today.'],
        'weekend-winter-park': ['Walk cut short. The nose issued a negative opinion.', 'Fresh air. So fresh it stings.'],
        'weekend-winter-seaside': ['A winter beach walk. Immediate return recommended.', 'No queue for the sea. Common sense suggests why.'],
        'weekend-spring-park': ['Nature returns to life. No stamp or certificate required.', 'Buds are opening. Thankfully, no new clinic is.'],
        'weekend-summer-garden': ['Tomatoes ripen. Nobody hurries them back to work.', 'Gardening means bending too. The back has cancelled its holiday.'],
        'weekend-reading': ['A book with no forms. Reading carefully. Could be a trap.', 'The hero has problems. Luckily, he does not know my address.'],
        'weekend-radio': ['The radio talks. I stay quiet. An excellent consultation.', 'Turn the knob left. The world’s problems get quieter.'],
        'weekend-soup': ['The soup is recovering. My only patient today.', 'The pot bubbles. Chest sounds satisfactory.'],
      },
      budgetComments: {
        profit: [
          'The wallet shows signs of life.',
          'A surplus. Try not to scare it.',
          'Even the doctor earned money today.',
          'Budget declared fit for work.',
          'Some coins survived. Surely an error.',
        ],
        loss: [
          'The wallet needs a specialist.',
          'The deficit grew. At least something did.',
          'The bills are in excellent health.',
          'The budget requests sick leave.',
          'The money left without saying goodbye.',
        ],
        even: [
          'Broke even. Condition stable.',
          'No gain, no loss. An accounting miracle.',
          'The wallet stands still. Like the queue.',
          'Balance unchanged. Next, please.',
          'Zero. Nice, round and quite useless.',
        ],
      },
      workComments: [
        'New day, old stamps. Tradition must be respected.',
        'Coffee finished. Courage is still brewing.',
        'The clinic waits. Sadly, it knows your address.',
        'Off to work. Someone must certify everyone else.',
        'A queue at the door. It could not sleep either.',
        'Good morning. A provisional diagnosis.',
        'White coat. Clean slate. Until the first patient.',
        'The key fits. There goes that excuse.',
        'Today will run smoothly. It says so on the form.',
        'The stamp stands ready. Someone slept well.',
        'One deep breath. This examination is on you.',
        'Today’s plan: keep calm and locate the pen.',
      ],
      events: { 'fur-coat': 'A NEW FUR COAT', medicine: 'AT THE PHARMACY', 'car-repair': 'AT THE GARAGE', 'home-repair': 'A LEAK', 'mountain-trip': 'IN THE MOUNTAINS', 'seaside-trip': 'BY THE SEA' },
      eventComments: {
        'fur-coat': 'The new fur coat is warm. The bill brings cold sweats.',
        medicine: 'A queue at the pharmacy too. This time, the wrong side of the counter.',
        'car-repair': 'The mechanic listened to the engine. Good prognosis. For the mechanic.',
        'home-repair': 'The tap leaks. Plumbers charge for a diagnosis too.',
        'mountain-trip': 'Lower pressure in the mountains. All it took was leaving the paperwork.',
        'seaside-trip': 'Waves arrive without referrals. All admitted.',
      },
      illustrations: {
        'home-evening': 'A quiet room. A lamp lights the desk beside the window.',
        homecoming: 'An apartment hallway. A coat, boots and a partly open door.',
        'going-to-work': 'The clinic entrance in the cold morning light.',
        'weekend-budget': 'A kitchen table, cup and notebook beside the window.',
        'weekend-modest': 'A modest meal by a rainy window: a potato, a slice of bread and weak tea. An empty wallet lies beside it.',
        'weekend-mountain-resort': 'A lodge in a mountain resort. Mountains beyond the trees.',
        'weekend-seaside-resort': 'An empty seaside promenade, a guesthouse and gray waves.',
        'weekend-autumn-park': 'A park in low autumn sunlight. An empty bench, golden leaves and a wet path.',
        'weekend-rain-tram': 'An empty seat in an old tram. Raindrops and street lights beyond the window.',
        'weekend-winter-park': 'A winter park. A snowy bench, bare branches and a warm street lamp.',
        'weekend-winter-seaside': 'A winter sea beside a wooden guesthouse. Snow on the railing and an empty path to the beach.',
        'weekend-spring-park': 'A spring park. Young leaves, an empty bench and a damp path in gentle sunlight.',
        'weekend-summer-garden': 'A summer garden. A wooden chair, an old watering can and green vegetable beds by a shed.',
        'weekend-reading': 'An armchair by a lamp. An open book and a cup on the table, a curtained window nearby.',
        'weekend-radio': 'A wooden radio with a lit tuning scale. A mug and folded cardigan on the sideboard.',
        'weekend-soup': 'A pot steams on an old stove. A bowl and wooden spoon nearby in warm lamplight.',
      },
      bribes: 'Bribes', balance: 'Balance', base: 'Base income', bonus: 'Patient bonus', previousDay: 'From the previous day', beforeWeekend: 'Before the weekend', living: 'Living costs', insurance: 'Insurance', fines: 'Fines', extraExpenses: 'Extra expenses', currency: 'zł',
      resume: 'RETURN HOME', tomorrow: 'NEXT DAY', onward: 'CONTINUE', work: 'HEAD TO WORK', enter: 'ENTER THE CLINIC', reveal: 'Reveal the complete text',
    },
    feedback: {
      'classified-expired': 'No longer available.',
      'classified-no-answer': '(no answer)',
      'classified-busy': '(line busy)',
      'classified-wrong-number': 'Wrong number. Nobody placed an ad here.',
      'classified-call-later': 'Please call back this evening.',
      'classified-disconnected': '(call disconnected)',
      'inspector-arrived': 'A SIO inspector is waiting. Examine and return the identity card.',
      'inspection-id-taken': 'Identity card in hand. Read it on the right desk, then return it to the inspector.',
      'inspection-id-returned': 'Identity card returned. The inspector requests the referral and note for the specified visit.',
      'inspection-id-needed': 'First examine and return the identity card.',
      'inspection-document-accepted': 'Document checked and returned to the desk. Present the other document.',
      'inspection-wrong-document': 'This document does not belong to the requested visit records.',
      'inspection-confirm-missing': 'Do you confirm the missing records? Click the inspector again to confirm, or keep searching.',
      'inspection-complete': 'Records complete. Inspection concluded without a fine.',
      'inspection-fined': 'Inspection complete. The penalty notice is on the desk; today’s budget includes the fine.',
      'inspection-waiting': 'Finish the records inspection first.',
      'additional-unavailable': 'Additional examinations become available on working day seven.',
      'referral-taken': 'Referral in hand. Put it on the right desk and circle one examination.',
      'test-selected': 'Examination circled. Give the referral to the patient.',
      'test-already-done': 'The patient has already completed this examination. Read the retained result.',
      'test-needed': 'First circle one examination on the referral.',
      'patient-referred': 'The patient has left for a test. Records stay here. Call the next patient.',
      'patient-returned': 'The patient has returned with a result. Previous examinations and notes retained.',
      'referral-penalty': 'The patient has left for a test. A referral unrelated to the occupation incurs a SIO fine.',
      "phone-ready": "Exchange tone. Click a number on a document or in an advertisement to call.",
      "specialist-taken": "Specialist certificate in hand.",
      "specialist-missing": "The patient has no specialist certificate.",
      "specialist-valid": "Specialist confirms treatment and clearance for this job.",
      "specialist-invalid": "Specialist: this certificate covers a different job. It is invalid.",
      "employer-confirmed": "HR confirms the referral is authentic.",
      "employer-denied": "HR denies issuing the referral. The document is not authentic.",
      "bribe-accepted": "100 zł kept for settlement at the end of the day.",
      "bribe-returned": "100 zł returned to the patient.",
      "bribe-missing": "There is no banknote here.",
      "game-over": "Game over. After treatment, you will need an occupational health exam.",

      'visit-interrupted': '17:15. The clinic is closed. Appointment interrupted.',
      'general-pass': 'General examination: no concerns.', 'general-refer': 'General examination: abnormal findings.',
      'paper-unclipped': 'Paperclip removed. Documents separated.', 'papers-joined': 'Documents clipped together.',
      'clip-needed': 'Drop the sheet onto a clip attached to another document.',
      'certificate-in-bundle': 'Unclip the certificate from the documents first.',
      'certificate-written': 'Patient’s name and job position written on the certificate.',
      'certificate-name-needed': 'Write the name and job position on the certificate using its pen corner.',
      'certificate-needed': 'First take a separate certificate form from the rack.',
      'certificate-taken': 'Certificate form in hand. Move it onto the desk.',
      'measurements-taken': 'Measurements ready. Weight and height appear on the note sheet.',
      'phone-unavailable': 'The exchange tone is audible. Calls are not available yet.',
      'paper-taken': 'A blank sheet in hand. Move it onto the desk.',
      'paper-written': 'Supplementary information added to the medical notes.', 'paper-stored': 'Document kept in the drawer.',
      'paper-retrieved': 'Document retrieved from the drawer.',
      'item-stored': 'Item kept in the drawer.', 'item-retrieved': 'Item retrieved from the drawer.', 'item-missing': 'This item is not here.', 'newspaper-trashed': 'Newspaper discarded in the basket.', 'paper-trashed': 'Document discarded in the basket.',
      'paper-missing': 'There is no document here.', 'paper-wrong-patient': 'This sheet belongs to another patient. Take a blank one.',
      'identity-card-returned': 'Identity card returned to its owner.',
      'identity-card-wrong-owner': 'This identity card belongs to another visitor.',
      'results-needed': 'Perform the general examination before adding patient history.',
      'letter-opened': 'Envelope opened. Read the letter.', 'paper-clipped': 'Paperclip attached to the document.',
      none: '', 'cabinet-ready': 'Office open. Call your first patient.',
      'waiting-room-empty': 'Nobody is here yet. The first patients arrive at 7:55.',
      'patient-called': 'Patient waiting. Take the referral from the tray.',
      'patient-waiting': 'Finish this appointment first.',
      'shift-finished': 'Admissions closed. You can go home.',
      'document-taken': 'Referral in hand. Move it to the desk. Take the certificate separately from the rack.',
      'document-needed': 'Take the referral from the tray first.',
      'no-patient': 'An empty chair. The paperwork is in good health.',
      'vision-pass': 'Vision measurements recorded.',
      'vision-refer': 'Vision measurements recorded.',
      'pressure-pass': 'Blood pressure measurement recorded.',
      'pressure-refer': 'Blood pressure measurement recorded.',
      'stamped-fit': 'Stamped FIT. Return the document to the patient.',
      'stamped-unfit': 'Stamped REFUSAL. Return the document to the patient.',
      'stamp-needed': 'This document needs a stamp.',
      'patient-cleared': 'Decision follows the rules. Visit completed.',
      'patient-completed': 'Visit completed.',
      'patient-error': 'Visit completed. An irregularity was recorded.',
      'lamp-on': 'Lamp on. The paperwork looks brighter already.',
      'lamp-off': 'Lamp off. Saving approved.',
      'decoration-changed': 'Decor updated. No committee required.',
      'next-day': 'New shift. Same forms.',
      'shift-unfinished': 'There are still patients waiting.',
      'limit-reached': 'The archive is full. Thank you for your service.',
    },
    sharing: {
      label: 'Share',
      description: 'Share the current page address or copy it to invite friends into the queue.',
      title: 'Next, Please!',
      text: 'Stamps ready. Staff missing. Take your place in the queue!',
      shared: 'Passed on for sharing. Next, please!',
      copied: 'Link copied. Paste it into a message to the recipient.',
      manual: 'Copy this address and invite friends. The queue can keep growing!',
    },
    clinic: 'OCCUPATIONAL HEALTH CLINIC',
    subtitle: 'OCCUPATIONAL HAZARD: BUREAUCRACY.', tagline: 'Everyone is fit. Until they aren’t.',
    start: 'BEGIN YOUR SHIFT', saves: 'SAVE FILES', credits: 'CREDITS',
    help: {
      label: 'Instructions', title: 'INSTRUCTIONS', reference: 'NP / 003',
      description: 'A short guide to your first shift.',
      contentLabel: 'Playing instructions', scrollHint: 'Mouse wheel / arrow keys — scroll',
      scrollHelp: 'Scroll with the mouse wheel, arrow keys or Page Up / Page Down. Home and End move to the beginning and end. Escape closes this guide.',
      intro: 'You are an occupational health doctor. See patients, check their paperwork and decide who is fit for work. Your earnings must cover living costs; mistakes can be expensive.',
      sections: [
        { title: '1. Your desk is the interface', body: 'Click an item to pick it up. Move the mouse and click again to put it down or use it. You do not need to hold the button. Documents grow large enough to read when placed on the right desk.' },
        { title: '2. Start with the rulebook', body: 'Move the book from the left shelf onto the right desk. Click its page corners to open it and keep reading. It explains which examinations and documents are required. Then ring the bell on the left to call a patient.' },
        { title: '3. Get to know your patient', body: 'Take the referral from the tray on the left and read it. Fetch a blank sheet for notes from the rack on the right. With empty hands, click the patient for a general examination; the eye chart, pressure instrument and scale perform the other tests. Findings appear in your notes.' },
        { title: '4. Make your decision', body: 'Fetch a certificate form from the rack. Click its pen corner to fill in the details. Compare the findings with the rulebook and apply the FIT or REFUSAL stamp. Return the stamp to its holder, then hand the completed certificate to the patient to finish the visit.' },
        { title: '5. Keep your records', body: 'File the referral and notes in either drawer. You choose what goes in each one. You may need them during an inspection. Ring the bell for the next person. Read new letters: later shifts bring additional duties.' },
        { title: '6. Take breaks and save', body: 'Time keeps passing in the clinic, even while you read. Menu or Escape lets you take a break. After work, review your household budget. Before leaving, open Save files and export a file. Progress is not saved automatically; import your file later to resume.' },
        { title: 'Prefer the keyboard?', body: 'Tab selects an item, Space picks it up, arrow keys move it, and Enter or Space puts it down or uses it. Hold Shift to move faster; Escape cancels carrying. Enter opens the book, and Tab lets you select its page corners.' },
      ],
    },
    build: 'VERSION {version} / {codename}',
    releaseCodenames: ['PAPERWORK', 'CARBON COPY', 'STAMP', 'QUEUE', 'FOLDER', 'DUPLICATE', 'INITIALS', 'RECEPTION', 'ARCHIVE', 'BLOTTER', 'FORMALITY', 'PAPERCLIP', 'CARD INDEX', 'ROUGH DRAFT', 'QUEUE TICKET', 'HOLE PUNCH', 'WAITING ROOM'],
    outer: 'OCCUPATIONAL HEALTH. DARK COMEDY.',
    screenNote: 'PIXEL BY PIXEL. FILED IN TRIPLICATE.', keyboard: 'TAB / ENTER — SELECT   ·   F — FULLSCREEN',
    fullscreen: 'Enter fullscreen', exitFullscreen: 'Exit fullscreen',
    mute: 'Mute audio', unmute: 'Enable audio', back: 'BACK', close: 'Close',
    previousTrack: 'Previous track', nextTrack: 'Next track',
    musicVolume: 'Music volume', musicPlaying: 'Music is playing.',
    musicMuted: 'Music is muted.', musicStopped: 'Music is not playing.',
    creditsTitle: 'BUREAUCRACY PREPARED BY', creatorName: 'Robert Chaba',
    creatorGithub: 'github.com/robertchaba',
    creatorPortrait: 'A black-and-white pixel portrait of Robert Chaba wearing a collared shirt and wool sweater, attached to the credits sheet with a paperclip.',
    aiSupport: 'WITH SUPPORT FROM AI TOOLS:\nCODEX, OPENAI MODELS, SUNO',
    creditsFooter: 'Signed. Stamped. Responsibility declined.',
    savesTitle: 'MEDICAL RECORDS',
    savesDescription: 'A medical secretary hands over a folder of documents.',
    savesBody: ['Keep a copy of your records.', 'Export your save to your computer.', 'Import it to resume your shift.'],
    sample: 'SHIFT RECORD — SAVE BEFORE LEAVING',
    day: 'DAY', patients: 'PATIENTS', money: 'BALANCE',
    export: 'EXPORT', import: 'IMPORT', exported: 'Your save file is ready to download.',
    imported: 'Save loaded. Your shift is ready to resume.', loading: 'Retrieving records...',
    errors: {
      'file-too-large': 'The file exceeds the allowed size.',
      'invalid-file': 'Invalid or damaged save file.',
      'unsupported-version': 'This save version is not supported.',
      'invalid-state': 'This file contains invalid game data.',
      'read-failed': 'The file could not be read.',
    },
    fullscreenError: 'Fullscreen is unavailable in this browser.',
    audioError: 'Music could not play. Please try again.',
    artError: 'The artwork could not load. Please refresh.',
    documentTitle: 'Next, Please! — Occupational health, questionable decisions.',
    description: 'A dark comedy about occupational health, bureaucracy, and questionable decisions.',
  },
} as const;

export type Locale = keyof typeof translations;

export function readPreferences(): { locale: Locale; muted: boolean; musicVolume: number } {
  try {
    const preferences = JSON.parse(localStorage.getItem('next-please.preferences') ?? '{}');
    const volume = preferences?.musicVolume;
    return {
      locale: preferences?.locale === 'en' ? 'en' : 'pl', muted: preferences?.muted !== false,
      musicVolume: typeof volume === 'number' && Number.isFinite(volume) && volume >= 0 && volume <= 1 ? volume : 0.4,
    };
  } catch { return { locale: 'pl', muted: true, musicVolume: 0.4 }; }
}

export function savePreferences(locale: Locale, muted: boolean, musicVolume: number): void {
  try { localStorage.setItem('next-please.preferences', JSON.stringify({ locale, muted, musicVolume })); }
  catch { /* Preferences are optional when storage is blocked. */ }
}
