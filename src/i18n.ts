import { LEGACY_CASE_COUNT, PATIENTS, patientIdentity } from './core/patients';

// Localized copy is indexed by stable case IDs. Authored name corrections also apply to archived paperwork.
const patientCopy = {
  pl: {
    names: ["Irena Wolska", "Leon Burek", "Marta Lis", "Anna Łuczak", "Roman Gajda", "Ewa Król", "Paweł Wrona", "Zofia Maj", "Stefan Dudek", "Lidia Żak", "Edward Kłos", "Halina Wójcik", "Adam Wilk", "David Mensah", "Jan Sokół", "Barbara Cicha", "Marek Łoś", "Olga Bąk", "Wiktor Sowa", "Alicja Mróz", "Piotr Górka", "Jadwiga Polna", "Henryk Las", "Danuta Wąs", "Jerzy Lisek", "Amina Diallo-Mazur", "Karim Haddad", "Maria Sęk", "Samuel Okoro", "Helena Kość", "Franciszek Jarząb", "Nadia Diop-Biela", "Bogdan Krawiec", "Łucja Leśna", "Emil Różycki", "Krystyna Wydra", "Joseph Kamara", "Iwona Głaz", "Zbigniew Turek", "Renata Witek", "Elias Hariri", "Grażyna Brzoza", "Daniel Dlamini", "Urszula Wichura", "Dariusz Kłosik", "Celina Jastrząb", "Andrzej Piątek", "Monika Sitko", "Kazimierz Rożek", "Leila Rahman-Wrona", "Leszek Kędra", "Bożena Szczygieł", "Ryszard Zając", "Wanda Czapla", "Sylwester Dąb", "Regina Kurek", "Artur Jeż", "Joanna Kalina", "Marian Głóg", "Alina Rosa", "Rafał Sitar", "Lucyna Wrzos", "Hubert Cichy", "Kinga Rój", "Tadeusz Kania", "Genowefa Biel", "Łukasz Bór", "Janina Cedro", "Michael Abebe", "Sabina Ruda", "Bartosz Kret", "Aniela Drozd", "Józef Czerwiak", "Dorota Gaj", "Ignacy Duda", "Agata Sikora", "Daniel Rzepka", "Gabriela Żyto", "Wiesław Żmuda", "Bogusław Cisek", "Czesław Pawlik", "Mieczysław Zięba", "Władysław Kocioł", "Grzegorz Jastrząb", "Sławomir Klimek", "Zdzisław Gąsior", "Mirosław Janik", "Bronisław Wójcik", "Michał Wysocki", "Robert Cieślik", "Wojciech Balicki", "Stanisław Żarski", "Kazimierz Bystroń", "Wacław Żelazny", "Natalia Błach", "Brunon Węglarz", "Elżbieta Wąsik", "Alojzy Szlaka", "Bogumiła Bednarz", "Maksymilian Rąb", "Stanisława Janik", "Bolesław Płomień", "Renata Łoza"],
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
      ["David Mensah", "Peter Owusu", "Joseph Asante", "Samuel Osei", "Daniel Boateng"],
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
      ["Amina Diallo-Mazur", "Mariam Diop-Kłos", "Fatou Keita-Rój", "Adama Sow-Brzeg", "Hawa Ba-Łan"],
      ["Karim Haddad", "Samir Mansour", "Nabil Nasser", "Rami Khalil", "Adil Farah"],
      ["Maria Jaśko", "Halina Śliwa", "Barbara Mrozek", "Irena Biela", "Zofia Pióro"],
      ["Samuel Okoro", "James Obi", "Peter Eze", "Daniel Okafor", "Michael Nwosu"],
      ["Helena Sowa", "Maria Rybak", "Irena Żyto", "Ewa Róża", "Teresa Czapla"],
      ["Franciszek Gaj", "Edward Leśny", "Wiktor Rybak", "Jerzy Górski", "Henryk Ptak"],
      ["Nadia Diop-Biela", "Awa Sow-Śliwa", "Aminata Ba-Bork", "Mariama Diallo-Sitko", "Fatou Sarr-Wrona"],
      ["Bogdan Rój", "Marek Wolski", "Paweł Staw", "Adam Mrozek", "Tomasz Ruda"],
      ["Łucja Dąbek", "Halina Wicher", "Maria Sitar", "Barbara Żak", "Irena Wilga"],
      ["Emil Ruda", "Paweł Czajka", "Marek Młyn", "Piotr Klon", "Adam Łęcki"],
      ["Krystyna Las", "Zofia Kret", "Jadwiga Łan", "Halina Duda", "Maria Głaz"],
      ["Joseph Kamara", "David Sesay", "Peter Conteh", "Samuel Koroma", "Daniel Bangura"],
      ["Iwona Żyto", "Anna Cicha", "Ewa Górka", "Lidia Rzepka", "Teresa Biela"],
      ["Zbigniew Klon", "Wiktor Mazur", "Edward Wolski", "Jerzy Chmiel", "Henryk Lisek"],
      ["Renata Kłos", "Anna Gacek", "Olga Jodła", "Ewa Kurek", "Lidia Szpak"],
      ["Elias Hariri", "Nabil Saad", "Samir Salim", "Karim Barakat", "Rami Aziz"],
      ["Grażyna Witek", "Maria Łan", "Irena Duda", "Halina Jaskier", "Barbara Śliwa"],
      ["Daniel Dlamini", "Samuel Mokoena", "Joseph Molefe", "Peter Ndlovu", "David Khumalo"],
      ["Urszula Kłos", "Teresa Jodła", "Maria Bork", "Ewa Sitar", "Irena Rzepka"],
      ["Dariusz Biela", "Marek Wydra", "Paweł Gaj", "Adam Żur", "Tomasz Rosa"],
      ["Celina Wilk", "Jadwiga Gaj", "Zofia Sitar", "Halina Kępa", "Maria Gacek"],
      ["Andrzej Buk", "Roman Rzepka", "Henryk Sitko", "Jan Dąbek", "Stefan Głaz"],
      ["Monika Gaj", "Anna Kret", "Ewa Czajka", "Iwona Struga", "Lidia Malina"],
      ["Kazimierz Łan", "Edward Bork", "Wiktor Kłos", "Jerzy Wydra", "Henryk Brzeg"],
      ["Leila Rahman-Wrona", "Nadia Karim-Łącka", "Salma Malik-Chmiel", "Amina Khan-Rosa", "Yasmin Ali-Kret"],
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
      ["Michael Abebe", "Daniel Tesfaye", "Peter Bekele", "Joseph Girma", "Samuel Tadesse"],
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
      ["Isaac Adu", "Daniel Kofi", "Samuel Annan", "Peter Appiah", "Joseph Ampofo"],
      ["Karolina Dęba", "Sylwia Foryś", "Joanna Graba", "Beata Hada", "Dorota Jaśmin"],
      ["Edmund Baran", "Feliks Czarnek", "Antoni Drab", "Władysław Gont", "Mieczysław Huta"],
      ["Awa Diop-Buk", "Lea Sow-Róg", "Mina Ba-Żak", "Nora Keita-Lis", "Sara Sarr-Gaj"],
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
      ["Michael Banda", "James Chanda", "David Phiri", "Joseph Tembo", "Samuel Zulu"],
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
      ["Kwame Antwi", "Kofi Asare", "Kojo Danso", "Yaw Opoku", "Kweku Sarpong"],
      ["Alicja Borucka", "Ewa Ćwik", "Danuta Drabik", "Iwona Fota", "Renata Gajdos"],
      ["Antoni Bystrek", "Franciszek Czop", "Ignacy Dęba", "Feliks Fara", "Władysław Gruszka"],
      ["Iga Bzowa", "Maja Cichoń", "Lena Durna", "Nina Fajka", "Ada Głowacka"],
      ["Kenji Sato", "Hiroshi Mori", "Akio Kato", "Jun Seki", "Isao Hara"],
      ["Ama Adu-Las", "Esi Osei-Buk", "Adwoa Ba-Rój", "Akua Sow-Gaj", "Abena Diop-Żak"],
      ["Kazimierz Borek", "Leszek Cholewa", "Bogdan Dobrzań", "Zygmunt Frączek", "Czesław Gubała"],
      ["Mina Ali-Róg", "Leila Noor-Buk", "Nadia Azad-Las", "Sara Amir-Żak", "Rima Khan-Gaj"],
      ["Kamil Brzozowy", "Filip Chudek", "Szymon Dera", "Marcin Fojcik", "Maciej Gębala"],
      ["Krystyna Brzeska", "Bożena Cuber", "Teresa Dorosz", "Maria Fudala", "Zofia Grabska"],
      ["Jacek Barcz", "Mariusz Cebula", "Grzegorz Długosz", "Robert Fita", "Dariusz Gondek"],
      ["Aya Mori-Buk", "Yuki Sato-Rój", "Emi Kato-Lis", "Aki Seki-Gaj", "Mari Hara-Żak"],
      ["Bolesław Bruk", "Wacław Cieśla", "Mieczysław Dera", "Stanisław Furgol", "Józef Gruba"],
      ["Dorota Błysk", "Urszula Chaberska", "Małgorzata Dera", "Lidia Fila", "Celina Gorczyca"],
      ["Paweł Bednarek", "Tomasz Chojka", "Rafał Dudka", "Artur Fronczek", "Michał Gręda"],
      ["Helena Bzowska", "Janina Ćwikła", "Łucja Dryga", "Aniela Fila", "Genowefa Gruda"],
      ["Emmanuel Dube", "Paul Sibanda", "Simon Ncube", "Thomas Moyo", "Patrick Zondo"],
      ["Joanna Banasik", "Monika Chmurka", "Beata Dębiec", "Agata Folta", "Katarzyna Grys"],
      ["Piotr Bęben", "Adam Chowaniec", "Bartosz Dziuba", "Łukasz Fojut", "Marek Grześ"],
      ["Anna Bereza", "Irena Chrobak", "Renata Domagała", "Grażyna Fita", "Halina Gudej"],
      ["Marcin Blicharz", "Mariusz Chrzan", "Jacek Dobosz", "Robert Filar", "Dariusz Gruszka"],
    ],
    employers: ['Archiwum Zakładów Brzask', 'Zakłady Mechaniczne Ogniwo', 'Przewozy Pracownicze Szlak', 'Tkalnia Osnowa', 'Warsztat Nit', 'Szkoła Zawodowa', 'Skład Towarowy', 'Biuro Zaopatrzenia', "Drukarnia Margines", "Spółdzielnia Trybik", "Pracownia Ścieg", "Piekarnia Kłos", "Stołówka zakładowa", "Zakład Zieleni", "Urząd Pocztowy", "Służba Techniczna", "Laboratorium Próba", "Pralnia Fala", "Zarząd Kolei", "Dom Wypoczynkowy", "Uniwersytet", "Biblioteka Czytelnia", "Biuro Projektowe", "Stolarnia Słój", "Komenda milicji", "Zespół lotniczy", "Kopalnia Głębia"],
    jobs: ['Archiwista', 'Operator suwnicy', 'Kierowca', 'Tkacz', 'Mechanik', 'Woźny', 'Magazynier', 'Kierownik', "Zecer", "Zegarmistrz", "Krawiec", "Piekarz", "Kucharz", "Sprzątacz", "Ogrodnik", "Listonosz", "Elektryk", "Spawacz", "Hutnik", "Tokarz", "Laborant", "Korektor", "Introligator", "Pracz", "Palacz", "Torowy", "Nastawniczy", "Wózkowy", "Tragarz", "Kontroler jakości", "Brygadzista", "Pomoc geodety", "Nauczyciel", "Profesor", "Bibliotekarz", "Księgowy", "Referent", "Inżynier", "Architekt", "Redaktor", "Kreślarz", "Recepcjonista", "Chemik", "Technik", "Stolarz", "Milicjant", "Pilot", "Górnik"],
    femaleJobs: ["Archiwistka", "Operatorka suwnicy", "Kierowczyni", "Tkaczka", "Mechanik", "Woźna", "Magazynierka", "Kierowniczka", "Zecerka", "Zegarmistrzyni", "Krawcowa", "Piekarka", "Kucharka", "Sprzątaczka", "Ogrodniczka", "Listonoszka", "Elektryk", "Spawaczka", "Hutnik", "Tokarka", "Laborantka", "Korektorka", "Introligatorka", "Praczka", "Palacz", "Torowa", "Nastawnicza", "Wózkowa", "Tragarz", "Kontrolerka jakości", "Brygadzistka", "Pomoc geodety", "Nauczycielka", "Profesorka", "Bibliotekarka", "Księgowa", "Referentka", "Inżynier", "Architektka", "Redaktorka", "Kreślarka", "Recepcjonistka", "Chemiczka", "Technik", "Stolarka", "Milicjantka", "Pilotka", "Górniczka"],
    work: ['ewidencja akt', 'obsługa suwnicy', 'przewóz osób', 'maszyny tkackie', 'naprawa maszyn', 'obsługa budynku', 'przeładunek', 'nadzór zespołu', "skład drukarski", "naprawa zegarków", "szycie odzieży", "wypiek pieczywa", "przygotowanie potraw", "sprzątanie sal", "pielęgnacja zieleni", "roznoszenie listów", "naprawa instalacji", "łączenie metali", "obsługa pieca", "obróbka metalu", "odczyty próbek", "korekta druku", "oprawa książek", "pranie przemysłowe", "obsługa kotłów", "naprawa torów", "obsługa zwrotnic", "przewóz palet", "noszenie bagażu", "kontrola wyrobów", "nadzór zmiany", "pomiary terenowe", "prowadzenie lekcji", "wykłady i badania", "katalogowanie książek", "rachunki i rozliczenia", "obsługa dokumentów", "nadzór techniczny", "projekty budynków", "redakcja tekstów", "rysunek techniczny", "obsługa gości", "analizy chemiczne", "pomiary i naprawy", "wykonywanie mebli", "służba patrolowa", "pilotowanie samolotów", "wydobycie węgla"],
    hazards: ['pył papierowy', 'hałas, wysokość', 'ruch drogowy', 'pył, hałas', 'smary, hałas', 'praca fizyczna', 'ciężkie ładunki', 'stres, siedzenie', "drobny druk, pył", "drobne części", "pył tkanin, igły", "gorąco, ciężary", "gorąco, długie stanie", "detergenty, wysiłek", "chłód, wysiłek", "marsz, ciężka torba", "napięcie, wysokość", "gorąco, odpryski", "gorąco, hałas", "wirujące części", "odczynniki, odczyty", "drobny druk", "kleje, ostrza", "para, detergenty", "gorąco, ciężary", "ruch pociągów, chłód", "sygnały, nocne zmiany", "ruch w hali", "ciężary, schody", "drobne detale", "stres, hałas", "teren, podziałki", "głos, długie stanie", "drobny druk", "pył papierowy", "drobny druk, stres", "drobny druk", "hałas, pomiary", "drobne podziałki", "drobny druk", "drobne podziałki", "stres, długie stanie", "odczynniki", "hałas, pomiary", "hałas, ostrza", "stres, nocne dyżury", "hałas, wysokość", "pył mineralny, hałas"],
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
    names: ["Irena Wolska", "Leon Burek", "Marta Lis", "Anna Łuczak", "Roman Gajda", "Ewa Król", "Paweł Wrona", "Zofia Maj", "Stefan Dudek", "Lidia Żak", "Edward Kłos", "Halina Wójcik", "Adam Wilk", "David Mensah", "Jan Sokół", "Barbara Cicha", "Marek Łoś", "Olga Bąk", "Wiktor Sowa", "Alicja Mróz", "Piotr Górka", "Jadwiga Polna", "Henryk Las", "Danuta Wąs", "Jerzy Lisek", "Amina Diallo-Mazur", "Karim Haddad", "Maria Sęk", "Samuel Okoro", "Helena Kość", "Franciszek Jarząb", "Nadia Diop-Biela", "Bogdan Krawiec", "Łucja Leśna", "Emil Różycki", "Krystyna Wydra", "Joseph Kamara", "Iwona Głaz", "Zbigniew Turek", "Renata Witek", "Elias Hariri", "Grażyna Brzoza", "Daniel Dlamini", "Urszula Wichura", "Dariusz Kłosik", "Celina Jastrząb", "Andrzej Piątek", "Monika Sitko", "Kazimierz Rożek", "Leila Rahman-Wrona", "Leszek Kędra", "Bożena Szczygieł", "Ryszard Zając", "Wanda Czapla", "Sylwester Dąb", "Regina Kurek", "Artur Jeż", "Joanna Kalina", "Marian Głóg", "Alina Rosa", "Rafał Sitar", "Lucyna Wrzos", "Hubert Cichy", "Kinga Rój", "Tadeusz Kania", "Genowefa Biel", "Łukasz Bór", "Janina Cedro", "Michael Abebe", "Sabina Ruda", "Bartosz Kret", "Aniela Drozd", "Józef Czerwiak", "Dorota Gaj", "Ignacy Duda", "Agata Sikora", "Daniel Rzepka", "Gabriela Żyto", "Wiesław Żmuda", "Bogusław Cisek", "Czesław Pawlik", "Mieczysław Zięba", "Władysław Kocioł", "Grzegorz Jastrząb", "Sławomir Klimek", "Zdzisław Gąsior", "Mirosław Janik", "Bronisław Wójcik", "Michał Wysocki", "Robert Cieślik", "Wojciech Balicki", "Stanisław Żarski", "Kazimierz Bystroń", "Wacław Żelazny", "Natalia Błach", "Brunon Węglarz", "Elżbieta Wąsik", "Alojzy Szlaka", "Bogumiła Bednarz", "Maksymilian Rąb", "Stanisława Janik", "Bolesław Płomień", "Renata Łoza"],
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
      ["David Mensah", "Peter Owusu", "Joseph Asante", "Samuel Osei", "Daniel Boateng"],
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
      ["Amina Diallo-Mazur", "Mariam Diop-Kłos", "Fatou Keita-Rój", "Adama Sow-Brzeg", "Hawa Ba-Łan"],
      ["Karim Haddad", "Samir Mansour", "Nabil Nasser", "Rami Khalil", "Adil Farah"],
      ["Maria Jaśko", "Halina Śliwa", "Barbara Mrozek", "Irena Biela", "Zofia Pióro"],
      ["Samuel Okoro", "James Obi", "Peter Eze", "Daniel Okafor", "Michael Nwosu"],
      ["Helena Sowa", "Maria Rybak", "Irena Żyto", "Ewa Róża", "Teresa Czapla"],
      ["Franciszek Gaj", "Edward Leśny", "Wiktor Rybak", "Jerzy Górski", "Henryk Ptak"],
      ["Nadia Diop-Biela", "Awa Sow-Śliwa", "Aminata Ba-Bork", "Mariama Diallo-Sitko", "Fatou Sarr-Wrona"],
      ["Bogdan Rój", "Marek Wolski", "Paweł Staw", "Adam Mrozek", "Tomasz Ruda"],
      ["Łucja Dąbek", "Halina Wicher", "Maria Sitar", "Barbara Żak", "Irena Wilga"],
      ["Emil Ruda", "Paweł Czajka", "Marek Młyn", "Piotr Klon", "Adam Łęcki"],
      ["Krystyna Las", "Zofia Kret", "Jadwiga Łan", "Halina Duda", "Maria Głaz"],
      ["Joseph Kamara", "David Sesay", "Peter Conteh", "Samuel Koroma", "Daniel Bangura"],
      ["Iwona Żyto", "Anna Cicha", "Ewa Górka", "Lidia Rzepka", "Teresa Biela"],
      ["Zbigniew Klon", "Wiktor Mazur", "Edward Wolski", "Jerzy Chmiel", "Henryk Lisek"],
      ["Renata Kłos", "Anna Gacek", "Olga Jodła", "Ewa Kurek", "Lidia Szpak"],
      ["Elias Hariri", "Nabil Saad", "Samir Salim", "Karim Barakat", "Rami Aziz"],
      ["Grażyna Witek", "Maria Łan", "Irena Duda", "Halina Jaskier", "Barbara Śliwa"],
      ["Daniel Dlamini", "Samuel Mokoena", "Joseph Molefe", "Peter Ndlovu", "David Khumalo"],
      ["Urszula Kłos", "Teresa Jodła", "Maria Bork", "Ewa Sitar", "Irena Rzepka"],
      ["Dariusz Biela", "Marek Wydra", "Paweł Gaj", "Adam Żur", "Tomasz Rosa"],
      ["Celina Wilk", "Jadwiga Gaj", "Zofia Sitar", "Halina Kępa", "Maria Gacek"],
      ["Andrzej Buk", "Roman Rzepka", "Henryk Sitko", "Jan Dąbek", "Stefan Głaz"],
      ["Monika Gaj", "Anna Kret", "Ewa Czajka", "Iwona Struga", "Lidia Malina"],
      ["Kazimierz Łan", "Edward Bork", "Wiktor Kłos", "Jerzy Wydra", "Henryk Brzeg"],
      ["Leila Rahman-Wrona", "Nadia Karim-Łącka", "Salma Malik-Chmiel", "Amina Khan-Rosa", "Yasmin Ali-Kret"],
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
      ["Michael Abebe", "Daniel Tesfaye", "Peter Bekele", "Joseph Girma", "Samuel Tadesse"],
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
      ["Isaac Adu", "Daniel Kofi", "Samuel Annan", "Peter Appiah", "Joseph Ampofo"],
      ["Karolina Dęba", "Sylwia Foryś", "Joanna Graba", "Beata Hada", "Dorota Jaśmin"],
      ["Edmund Baran", "Feliks Czarnek", "Antoni Drab", "Władysław Gont", "Mieczysław Huta"],
      ["Awa Diop-Buk", "Lea Sow-Róg", "Mina Ba-Żak", "Nora Keita-Lis", "Sara Sarr-Gaj"],
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
      ["Michael Banda", "James Chanda", "David Phiri", "Joseph Tembo", "Samuel Zulu"],
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
      ["Kwame Antwi", "Kofi Asare", "Kojo Danso", "Yaw Opoku", "Kweku Sarpong"],
      ["Alicja Borucka", "Ewa Ćwik", "Danuta Drabik", "Iwona Fota", "Renata Gajdos"],
      ["Antoni Bystrek", "Franciszek Czop", "Ignacy Dęba", "Feliks Fara", "Władysław Gruszka"],
      ["Iga Bzowa", "Maja Cichoń", "Lena Durna", "Nina Fajka", "Ada Głowacka"],
      ["Kenji Sato", "Hiroshi Mori", "Akio Kato", "Jun Seki", "Isao Hara"],
      ["Ama Adu-Las", "Esi Osei-Buk", "Adwoa Ba-Rój", "Akua Sow-Gaj", "Abena Diop-Żak"],
      ["Kazimierz Borek", "Leszek Cholewa", "Bogdan Dobrzań", "Zygmunt Frączek", "Czesław Gubała"],
      ["Mina Ali-Róg", "Leila Noor-Buk", "Nadia Azad-Las", "Sara Amir-Żak", "Rima Khan-Gaj"],
      ["Kamil Brzozowy", "Filip Chudek", "Szymon Dera", "Marcin Fojcik", "Maciej Gębala"],
      ["Krystyna Brzeska", "Bożena Cuber", "Teresa Dorosz", "Maria Fudala", "Zofia Grabska"],
      ["Jacek Barcz", "Mariusz Cebula", "Grzegorz Długosz", "Robert Fita", "Dariusz Gondek"],
      ["Aya Mori-Buk", "Yuki Sato-Rój", "Emi Kato-Lis", "Aki Seki-Gaj", "Mari Hara-Żak"],
      ["Bolesław Bruk", "Wacław Cieśla", "Mieczysław Dera", "Stanisław Furgol", "Józef Gruba"],
      ["Dorota Błysk", "Urszula Chaberska", "Małgorzata Dera", "Lidia Fila", "Celina Gorczyca"],
      ["Paweł Bednarek", "Tomasz Chojka", "Rafał Dudka", "Artur Fronczek", "Michał Gręda"],
      ["Helena Bzowska", "Janina Ćwikła", "Łucja Dryga", "Aniela Fila", "Genowefa Gruda"],
      ["Emmanuel Dube", "Paul Sibanda", "Simon Ncube", "Thomas Moyo", "Patrick Zondo"],
      ["Joanna Banasik", "Monika Chmurka", "Beata Dębiec", "Agata Folta", "Katarzyna Grys"],
      ["Piotr Bęben", "Adam Chowaniec", "Bartosz Dziuba", "Łukasz Fojut", "Marek Grześ"],
      ["Anna Bereza", "Irena Chrobak", "Renata Domagała", "Grażyna Fita", "Halina Gudej"],
      ["Marcin Blicharz", "Mariusz Chrzan", "Jacek Dobosz", "Robert Filar", "Dariusz Gruszka"],
    ],
    employers: ['Brzask Works Archives', 'Ogniwo Engineering Works', 'Szlak Staff Transport', 'Osnowa Textile Mill', 'Nit Workshop', 'Vocational School', 'Goods Depot', 'Supply Office', "Margines Printworks", "Trybik Co-operative", "Ścieg Workshop", "Kłos Bakery", "Works Canteen", "Parks Service", "Post Office", "Technical Service", "Próba Laboratory", "Fala Laundry", "Railway Office", "Holiday Lodge", "University", "Reading Room Library", "Design Office", "Słój Joinery", "Militia station", "Flight unit", "Głębia Mine"],
    jobs: ['Archivist', 'Crane operator', 'Driver', 'Weaver', 'Mechanic', 'Caretaker', 'Storekeeper', 'Manager', "Typesetter", "Watchmaker", "Tailor", "Baker", "Cook", "Cleaner", "Gardener", "Post carrier", "Electrician", "Welder", "Furnace operator", "Lathe operator", "Lab assistant", "Proofreader", "Bookbinder", "Laundry worker", "Boiler attendant", "Track worker", "Signal operator", "Forklift operator", "Porter", "Quality inspector", "Shift supervisor", "Survey assistant", "Teacher", "Professor", "Librarian", "Accountant", "Clerk", "Engineer", "Architect", "Editor", "Drafter", "Receptionist", "Chemist", "Technician", "Carpenter", "Militia officer", "Pilot", "Miner"],
    femaleJobs: ['Archivist', 'Crane operator', 'Driver', 'Weaver', 'Mechanic', 'Caretaker', 'Storekeeper', 'Manager', "Typesetter", "Watchmaker", "Tailor", "Baker", "Cook", "Cleaner", "Gardener", "Post carrier", "Electrician", "Welder", "Furnace operator", "Lathe operator", "Lab assistant", "Proofreader", "Bookbinder", "Laundry worker", "Boiler attendant", "Track worker", "Signal operator", "Forklift operator", "Porter", "Quality inspector", "Shift supervisor", "Survey assistant", "Teacher", "Professor", "Librarian", "Accountant", "Clerk", "Engineer", "Architect", "Editor", "Drafter", "Receptionist", "Chemist", "Technician", "Carpenter", "Militia officer", "Pilot", "Miner"],
    work: ['records filing', 'crane operation', 'passenger transport', 'weaving machines', 'machine repairs', 'building upkeep', 'loading goods', 'team supervision', "setting type", "watch repairs", "sewing clothes", "baking bread", "preparing food", "cleaning rooms", "tending grounds", "delivering mail", "wiring repairs", "joining metals", "tending furnace", "turning metal", "reading samples", "checking proofs", "binding books", "industrial washing", "tending boilers", "track repairs", "setting points", "moving pallets", "carrying luggage", "checking products", "leading a shift", "land measurements", "teaching classes", "teaching and research", "cataloguing books", "keeping accounts", "handling records", "technical oversight", "building design", "editing texts", "technical drawing", "receiving guests", "chemical analyses", "checks and repairs", "making furniture", "patrol duty", "flying aircraft", "coal extraction"],
    hazards: ['paper dust', 'noise, heights', 'road traffic', 'dust, noise', 'oil, noise', 'physical work', 'heavy loads', 'stress, sitting', "small type, dust", "small components", "cloth dust, needles", "heat, lifting", "heat, standing", "detergents, exertion", "cold, exertion", "walking, heavy bag", "voltage, heights", "heat, sparks", "heat, noise", "rotating parts", "reagents, readings", "small type", "glue, blades", "steam, detergents", "heat, lifting", "trains, cold", "signals, night work", "shop floor traffic", "loads, stairs", "fine detail", "stress, noise", "terrain, scales", "voice, standing", "small type", "paper dust", "small type, stress", "small type", "noise, readings", "fine scales", "small type", "fine scales", "stress, standing", "reagents", "noise, readings", "noise, blades", "stress, night shifts", "noise, altitude", "mineral dust, noise"],
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

export const translations = {
  pl: {
    newspaper: {
      "title": "Kurier Obywatelski",
      "shortTitle": "Kurier",
      "classifiedTitle": "Ogłoszenia drobne",
      "telephone": "Tel.",
      "callClassified": "Zadzwoń w sprawie ogłoszenia",
      "classifieds": {
        "sewing-machine": "Sprzedam maszynę do szycia. Napęd nożny, szafka w komplecie.",
        "sideboard": "Kredens kuchenny sprzedam. Odbiór własny z trzeciego piętra.",
        "pram": "Wózek głęboki po jednym dziecku. Koła niedawno wymienione.",
        "radio-repair": "Naprawa odbiorników radiowych. Lampy proszę przynieść własne.",
        "piano-lessons": "Lekcje gry na pianinie. Początkujący mile widziani.",
        "garage": "Zamienię garaż na bliższy pętli tramwajowej. Suchy, bez prądu.",
        "typewriter": "Kupię maszynę do pisania. Brak taśmy nie stanowi przeszkody.",
        "bicycle-parts": "Części do roweru sprzedam. Siodełko, bagażnik, dwa dzwonki.",
        "books": "Książki przygodowe zamienię na atlas grzybów. Listy: skrytka 18.",
        "jars": "Oddam słoiki po ogórkach. Bez pokrywek. Wiadomość u dozorcy, Ogrodowa 7.",
        "lost-keys": "Znaleziono klucze z blaszką. Do odbioru u portiera kina Świt.",
        "allotment": "Sadzonki porzeczek zamienię na agrest. Wiadomość u gospodarza ogrodów.",
        "knitting-help": "Swetry na drutach wykonam. Wełna powierzona. Pytać w pasmanterii na Ogrodowej.",
        "room": "Spokojny lokator szuka pokoju. Bez instrumentów. Wiadomość u portiera domu kultury.",
        "records": "Płyty z muzyką taneczną zamienię na jazz. Wiadomość u instruktora na Szkolnej.",
        "clock-repair": "Zegary naprawiam. Przynosić z kluczem. Stolarska 4, wejście od podwórza.",
        "coal-scuttle": "Węglarkę blaszaną oddam. Uchwyt cały. Pytać u dozorcy przy Stolarskiej 8.",
        "curtain-rods": "Karnisze drewniane, dwie sztuki. Wiadomość w pasmanterii na Ogrodowej.",
        "children-skates": "Łyżwy dziecięce zamienię na większe. Zgłoszenia u portiera domu kultury.",
        "violin-case": "Futerał do skrzypiec sprzedam. Podszewka dobra. Pytać w szkole muzycznej.",
        "sofa-bed": "Tapczan jednoosobowy sprzedam. Skrzynia na pościel. Transport we własnym zakresie.",
        "jam-pots": "Małe słoiczki na konfitury oddam. Odbiór u gospodyni świetlicy na Północy.",
        "music-stand": "Pulpit do nut kupię. Może być składany. Wiadomość w domu kultury, sala prób.",
        "wool-remnants": "Resztki wełny zamienię na guziki płaszczowe. Pytać w pasmanterii na Ogrodowej.",
        "pram-wheels": "Koła do wózka dziecięcego oddam. Dwa różne rozmiary. Dozorca, Kolejowa 14.",
        "piano-tuning": "Pianina stroję. Dojazd po uzgodnieniu. Proszę podać piętro i stan instrumentu.",
        "chess-set": "Szachy drewniane, brak jednego pionka. Zamiana na warcaby. Klub na Szkolnej.",
        "travel-trunk": "Kufer podróżny sprzedam. Dwa zamki, jeden klucz. Pytać u szewca przy targu.",
        "plant-pots": "Doniczki gliniane oddam za sadzonkę zielistki. Wiadomość w kwiaciarni na Północy.",
        "school-atlas": "Atlas szkolny kupię. Wydanie z czytelnymi mapami. Listy: skrytka 22.",
        "handcart": "Wózek ręczny na dwóch kołach sprzedam. Dobry do przewozu skrzynek.",
        "spare-buttons": "Guziki mundurowe zamienię na rogowe. Wiadomość w punkcie krawieckim na Ogrodowej.",
        "found-mittens": "Rękawiczki dziecięce znaleziono w tramwaju. Odbiór u portiera kina Świt.",
        "bookends": "Podpórki do książek kupię. Ciężkie, para. Pytać w czytelni przy Kolejowej.",
        "coat-alteration": "Płaszcze skracam, rękawy poprawiam. Materiał własny. Ogrodowa 6, oficyna.",
        "mandolin": "Mandolinę sprzedam. Futerał w komplecie, jedna struna do wymiany.",
        "photo-albums": "Albumy na zdjęcia zamienię na ramki. Wiadomość u fotografa przy Ogrodowej.",
        "folding-stool": "Taboret składany kupię. Do rysowania w plenerze. Pracownia plastyczna, Szkolna.",
        "wood-offcuts": "Ścinki drewna dla modelarzy oddam. Odbiór w warsztacie przy Stolarskiej 5.",
        "travel-chess": "Szachy kieszonkowe znaleziono w poczekalni. Pytać w przechowalni bagażu.",
        "electric-iron": "Żelazko kupię. Najchętniej ciężkie, z całym uchwytem. Dzwonić wieczorem.",
        "baking-tins": "Dwie formy do ciasta zamienię na tortownicę. Wiadomość w barze przy dworcu.",
        "sewing-patterns": "Wykroje sukienek pożyczę do przerysowania. Klub robótek na Szkolnej, po zajęciach.",
        "record-sleeves": "Koperty do płyt oddam. Bez płyt. Wiadomość u portiera domu kultury.",
        "allotment-bench": "Ławkę na działkę kupię. Może wymagać malowania. Zgłoszenia u gospodarza ogrodów.",
        "accordion-sale": "Akordeon sprzedam wraz z pasami. Do obejrzenia po pracy, bez pośpiechu.",
        "curtain-sewing": "Firanki obszywam. Proszę przynieść dokładne wymiary. Kolejowa 11, od podwórza.",
        "bicycle-basket": "Koszyk rowerowy zamienię na bagażnik. Wiadomość u mechanika przy targowisku.",
        "reading-lamp": "Lampkę do czytania kupię. Z ciężką podstawą. Pytać w czytelni na Kolejowej.",
        "schoolbag-sale": "Tornister skórzany po uczniu oddam. Klamry całe. Woźny szkoły nr 12 przyjmie wiadomość.",
        "wardrobe-mirror": "Szafę z lustrem sprzedam. Rozkładana do przewozu. Brak jednej gałki.",
        "knitting-needles": "Druty do robótek zamienię na szydełka. Klub na Szkolnej, wiadomość na miejscu.",
        "old-magazines": "Roczniki czasopism technicznych oddam. Odbiór w pracowni domu kultury.",
        "garden-rake": "Grabie zamienię na małą łopatę. Pytać u gospodarza ogrodów przy bramie.",
        "found-scarf": "Szalik w kratę znaleziono po próbie chóru. Odbiór u portiera domu kultury.",
        "reel-recorder": "Magnetofon szpulowy sprzedam. Pokrywa i mikrofon w komplecie, taśm brak.",
        "copper-kettle": "Czajnik z gwizdkiem zamienię na duży garnek. Wiadomość u dozorcy, Ogrodowa 9.",
        "embroidered-cloth": "Obrus haftowany sprzedam. Owalny. Pytać w punkcie krawieckim przy Ogrodowej.",
        "baby-clothes": "Ubranka niemowlęce oddam. Wyprane, w dwóch paczkach. Wiadomość w świetlicy na Północy.",
        "photo-enlarger": "Powiększalnik fotograficzny kupię. Oferty u instruktora koła na Szkolnej.",
        "furniture-moving": "Pomogę przy znoszeniu mebli. Bez samochodu. Terminy po uzgodnieniu.",
        "wooden-sled": "Sanki drewniane zamienię na większe. Wiadomość u dozorcy przy Kolejowej 7.",
        "cookbooks": "Książkę kucharską zamienię na poradnik szycia. Pytać w bibliotece przy Kolejowej.",
        "plant-stand": "Kwietnik metalowy sprzedam. Na trzy doniczki. Wiadomość w kwiaciarni na Północy.",
        "chess-opponent": "Partnera do szachów szukam. Gram wolno. Wiadomość w świetlicy na Szkolnej.",
        "violin-lessons": "Lekcji skrzypiec udzielę. Własny instrument konieczny. Początkujący również.",
        "suitcase-straps": "Pasy do walizek wykonam z materiału klienta. Zakład kaletniczy przy targowisku.",
        "radio-cabinet": "Obudowę starego radia oddam modelarzowi. Pytać w pracowni technicznej na Szkolnej.",
        "children-books": "Bajki zamienię na książki dla starszego ucznia. Wiadomość w filii nr 6.",
        "wall-map": "Mapę ścienną kupię. Drobne rozdarcia dopuszczalne. Listy: skrytka 39.",
        "clock-sale": "Zegar ścienny z wahadłem sprzedam. Klucz w komplecie. Odbiór osobisty.",
        "wooden-hangers": "Wieszaki drewniane oddam. Różne rozmiary. Wiadomość w szatni kina Świt.",
        "garden-chair": "Krzesło wiklinowe zamienię na składane. Pytać u gospodarza ogrodów działkowych.",
        "ink-bottles": "Puste buteleczki po atramencie oddam. Odbiór u portiera domu kultury.",
        "knitting-books": "Wzory na druty pożyczę do przepisania. Wiadomość w pasmanterii na Ogrodowej.",
        "car-seat-covers": "Pokrowce samochodowe sprzedam. Przed zakupem proszę porównać wymiary siedzeń.",
        "found-notebook": "Zeszyt z nutami znaleziono na przystanku. Do odbioru u portiera szkoły muzycznej.",
        "chair-caning": "Siedziska krzeseł wyplatam. Przyjmuję po obejrzeniu ramy. Stolarska 3, warsztat.",
        "postcard-exchange": "Widokówki miasta zamienię na starsze wydania. Koło zbieraczy, dom kultury na Szkolnej.",
        "coffee-grinder": "Młynek ręczny kupię. Szufladka może być do naprawy. Wiadomość w barze przy dworcu.",
        "portable-radio": "Radio przenośne sprzedam. Pokrowiec skórzany, pasek naprawiany.",
        "table-leaf": "Dodatkowy blat do stołu oddam. Wymiary u dozorcy przy Ogrodowej 4.",
        "glass-vases": "Wazony szklane zamienię na gliniane. Wiadomość w kwiaciarni na Północy.",
        "children-costumes": "Stroje do szkolnego teatrzyku pożyczę. Pytać u woźnej szkoły nr 12.",
        "fishing-float": "Spławiki własnego wyrobu zamienię na żyłkę. Wiadomość u gospodarza ogrodów.",
        "sewing-table": "Stolik pod maszynę do szycia sprzedam. Dwie szuflady. Maszyny nie sprzedaję.",
        "coat-lining": "Podszewkę płaszczową oddam za nici. Wiadomość w punkcie krawieckim na Ogrodowej.",
        "record-brush": "Szczoteczkę do płyt kupię. Pytać w klubie muzycznym domu kultury.",
        "seed-boxes": "Skrzynki na sadzonki oddam. Odbiór przy altanie gospodarza ogrodów.",
        "found-pencilcase": "Piórnik z inicjałami znaleziono przy bibliotece. Odbiór w filii nr 6.",
        "armchair-pair": "Dwa fotele sprzedam razem. Obicia różne, konstrukcja jednakowa.",
        "theatre-programmes": "Programy teatralne wymienię z kolekcjonerem. Wiadomość w szatni teatru miejskiego.",
        "travelling-chest": "Skrzynkę na narzędzia kupię. Drewnianą, zamykaną. Pytać w warsztacie na Stolarskiej.",
        "wicker-basket": "Kosz wiklinowy zamienię na mniejszy. Wiadomość u sprzedawcy wikliny na targu.",
        "needlework-frame": "Tamborek do haftu oddam. Brak śrubki. Odbiór w klubie robótek na Szkolnej.",
        "room-painting": "Pokoje maluję. Materiały powierzone. Termin po obejrzeniu ścian.",
        "old-spectacle-case": "Etui do okularów znaleziono w czytelni. Puste. Do odebrania u bibliotekarki.",
        "book-binding": "Luźne tomy oprawiam. Proszę przynieść wszystkie kartki. Introligator, Stolarska 6.",
        "school-uniform": "Fartuszek szkolny oddam. Kołnierzyk osobno. Wiadomość u woźnej szkoły nr 12.",
        "photo-trays": "Kuwety fotograficzne zamienię na szczypce. Koło fotograficzne przy Szkolnej.",
        "folding-bike": "Rower składany sprzedam. Błotniki kompletne, dzwonek do wymiany.",
        "watercolour-box": "Pudełko akwareli kupię. Może być niepełne. Wiadomość w pracowni plastycznej na Szkolnej.",
        "chess-books": "Książki szachowe zamienię na zapisane partie. Klub szachowy w domu kultury.",
        "curtain-hooks": "Żabki do firanek oddam. Kilka rodzajów. Pytać w pasmanterii na Ogrodowej.",
        "school-compass": "Cyrkiel znaleziono na ławce przy szkole nr 12. Odbiór u woźnego po podaniu opisu.",
        "typing-service": "Teksty przepisuję na maszynie. Czytelne rękopisy. Kopie po uzgodnieniu.",
        "allotment-watercan": "Konewkę metalową zamienię na lżejszą. Wiadomość u gospodarza ogrodów.",
        "small-rug": "Dywanik chodnikowy sprzedam. Wąski, bez frędzli. Pytać u dozorcy, Kolejowa 9.",
        "bottle-crates": "Skrzynki drewniane oddam. Bez zawartości. Odbiór na zapleczu baru przy dworcu.",
        "language-practice": "Partnera do ćwiczeń językowych szukam. Listy: skrytka 51. Nauka z podręcznika.",
        "car-roof-rack": "Bagażnik dachowy sprzedam. Proszę wcześniej sprawdzić rozstaw uchwytów.",
        "portrait-drawing": "Portrety ołówkiem wykonam. Pozowanie na miejscu. Pracownia przy domu kultury.",
        "children-gloves": "Rękawiczki dziecięce zamienię na większe. Wiadomość w świetlicy na Północy.",
        "tapes-for-records": "Kasety czyste zamienię na płyty. Wiadomość u instruktora muzycznego na Szkolnej.",
        "wooden-toys": "Zabawki drewniane oddam do świetlicy. Pytać w warsztacie przy Stolarskiej 5.",
        "desk-sale": "Biurko z trzema szufladami sprzedam. Blat porysowany, zamki bez kluczy.",
        "reading-help": "Starszej osobie poczytam książki. Popołudniami. Wiadomość w bibliotece przy Kolejowej.",
        "chess-clock-ad": "Zegar szachowy kupię. Stan do omówienia. Pytać w sekcji szachowej na Szkolnej.",
        "kitchen-stool": "Dwa stołki kuchenne oddam. Jeden wymaga sklejenia. Dozorca, Ogrodowa 12.",
        "found-sheet-music": "Nuty na akordeon znaleziono w świetlicy. Odbiór u gospodarza po podaniu tytułu.",
        "carpet-weaving": "Chodniki ze skrawków wykonam. Materiał proszę wcześniej pokazać.",
        "model-paint": "Farby modelarskie zamienię na cienkie pędzle. Koło modelarskie na Szkolnej.",
        "old-city-photos": "Zdjęcia dawnych ulic miasta obejrzę i opiszę. Wiadomość w czytelni przy Kolejowej.",
        "hat-box": "Pudełko na kapelusz oddam. Okrągłe, z pokrywą. Pytać u modystki na Ogrodowej.",
        "mending-basket": "Koszyczek na robótki sprzedam. Wyścielony tkaniną. Wiadomość w pasmanterii.",
        "double-bed": "Łóżko podwójne sprzedam bez materaca. Rama drewniana, odbiór własny.",
        "curtain-remnants": "Resztki firanek oddam na szkolne prace. Punkt krawiecki przy Ogrodowej, odbiór na miejscu.",
        "walking-companion": "Towarzystwa do spokojnych spacerów szukam. Wiadomość w świetlicy na Północy.",
        "plant-identification": "Pomogę rozpoznać rośliny z domowych parapetów. Pytać w kwiaciarni na Północy.",
        "folding-screen": "Parawan kupię do małego pokoju. Oferty u dozorcy przy Kolejowej 11.",
        "camera-sale": "Aparat fotograficzny sprzedam z futerałem. Pasek nowy. Oględziny przy świetle dziennym.",
        "book-jackets": "Obwoluty do książek oddam zbieraczowi. Wiadomość w filii bibliotecznej nr 6.",
        "found-shopping-bag": "Torba płócienna została w barze przy dworcu. Właściciel proszony o opis zawartości.",
        "thread-spools": "Drewniane szpulki oddam do prac ręcznych. Pytać w punkcie krawieckim na Ogrodowej.",
        "picture-glass": "Szybki do ramek kupię. Niewielkie rozmiary. Wiadomość u ramiarza na Stolarskiej.",
        "room-to-let": "Pokój dla spokojnej osoby. Wejście wspólne, kuchnia do uzgodnienia.",
        "poetry-copying": "Wiersze do recytacji przepiszę czytelnie. Wiadomość w bibliotece na Kolejowej.",
        "found-brooch": "Broszkę znaleziono po spotkaniu czytelników. Pytać w filii nr 6, podać opis.",
        "school-desk-ad": "Małe biurko zamienię na regał. Wiadomość u gospodarza świetlicy na Północy.",
        "empty-tins": "Puszki po herbacie oddam. Na guziki lub drobiazgi. Odbiór w świetlicy na Szkolnej.",
        "sheet-music-copy": "Nuty pożyczę do przepisania. Walce i polki. Wiadomość u instruktora domu kultury.",
        "picture-hook": "Haczyki do obrazów zamienię na małe zawiasy. Pytać w warsztacie przy Stolarskiej.",
        "borrowed-ladder": "Osobę, która pożyczyła drabinę z Ogrodowej 8, proszę o zwrot. Wiadomość u dozorcy.",
        "wooden-puzzle": "Układankę drewnianą oddam. Wszystkie części policzone. Wiadomość w świetlicy na Północy.",
        "sewing-foot": "Stopkę do starej maszyny kupię. Wzór pokażę na miejscu. Zakład krawiecki, Ogrodowa.",
        "family-album-help": "Album rodzinny pomogę opisać. Podpisy ołówkiem. Wiadomość w czytelni na Kolejowej.",
        "chess-pieces": "Pojedyncze figury szachowe oddam. Dwie białe wieże, czarny koń. Klub na Szkolnej.",
        "found-keyring": "Kółko z kluczami znaleziono przy targowisku. Odbiór u gospodarza placu po podaniu opisu.",
        "carpentry-help": "Półki dopasuję do wnęki. Proszę przynieść szkic. Warsztat przy Stolarskiej 5.",
        "potted-geranium": "Pelargonię zamienię na roślinę do cienia. Wiadomość w kwiaciarni na Północy.",
        "choir-singers": "Chór szuka niskich głosów. Nuty pożyczamy. Zgłoszenia w domu kultury na Szkolnej.",
        "wooden-cradle": "Kołyskę drewnianą oddam do dekoracji teatralnej. Wiadomość u portiera teatru.",
        "found-beret": "Beret granatowy został w szatni kina Świt. Pod podszewką inicjały. Odbiór na miejscu.",
        "recipe-swap": "Przepisy na proste ciasta wymienię. Wiadomość u gospodyni świetlicy na Północy.",
        "old-calendar": "Stare kalendarze ścienne zbieram. Kartki również luzem. Pytać w czytelni na Kolejowej.",
        "portrait-frame": "Ramę owalną kupię do rodzinnego zdjęcia. Wymiary zostawiłem u ramiarza na Stolarskiej.",
        "fabric-samples": "Próbki tkanin oddam na kolaże. Odbiór w punkcie krawieckim przy Ogrodowej.",
        "window-box": "Skrzynkę kwiatową zamienię na dwie doniczki. Wiadomość u gospodarza ogrodów.",
        "borrowed-book": "Czytelnika z pożyczonym atlasem proszę o kontakt. Właściciel zostawił kartkę w filii nr 6.",
        "umbrella-handle": "Rączkę do parasola kupię. Wygięta drewniana. Pytać u naprawiacza przy targowisku.",
        "lesson-notes": "Notatki z kursu kreślarskiego pożyczę. Wiadomość u portiera domu kultury na Szkolnej.",
        "clothes-pegs": "Klamerki drewniane zamienię na wieszaki. Pytać u gospodyni pralni na Północy.",
        "found-wristwatch": "Zegarek znaleziono przy bramie ogrodów. Właściciel proszony do gospodarza z opisem.",
        "model-cardboard": "Karton gruby oddam modelarzom. Arkusze nierówne. Odbiór u introligatora na Stolarskiej.",
        "weaving-shuttle": "Czółenko tkackie kupię. Może być używane. Wiadomość w pracowni na Szkolnej.",
        "walking-maps": "Mapy okolic miasta pożyczę piechurom. Wiadomość w kole krajoznawczym domu kultury."
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
          "body": "Zakładowy chór kolejarzy ćwiczy w sali nad stołówką. Czterdziestu śpiewaków ma różne rozkłady służby, więc dyrygent nigdy nie słyszy na próbie całego zespołu. Partie basowe powtarza osobno z ludźmi schodzącymi z nocnej zmiany. Nuty przepisuje na kalce pracownica kancelarii; wspólny śpiewnik mieści się w dwóch teczkach. W repertuarze są pieśni ludowe i utwory przedwojenne. Na występy chór jeździ po całym województwie. Jak mówi jego kierownik, trudniej zebrać wszystkich na dworcu niż nauczyć ich nowej pieśni.",
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
          "body": "Szachiści kolejarzy pokonali drużynę budowlanych 5:3 w kolejnej rundzie ligi miejskiej. O wyniku przesądziły ostatnie szachownice, przy których grali juniorzy. Kapitan zwycięzców podkreśla pracę szkolnej sekcji: młodzi mają stałe zajęcia, podczas gdy starsi zawodnicy uzgadniają treningi z grafikiem zmian. Mecze odbywają się w świetlicach zakładowych, bez opłat za wstęp. Widzowie mogą śledzić zapis partii na tablicy. Liga nie ma własnej sali, ale dzięki gospodarzom z kilku dzielnic rozgrywki zachowują regularny rytm.",
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
          "body": "W listach do działu technicznego powraca pytanie, jak nagrać audycję bez głosów domowników. W wielu mieszkaniach magnetofon stoi przy radiu, a muzykę zbiera mikrofon. Instruktor pracowni przy domu kultury pokazuje inne połączenie, wykorzystujące gniazda obu aparatów. Nie każdy odbiornik je posiada, a odpowiedniego przewodu trzeba nieraz szukać w kilku sklepach. Na zajęcia przynosi się własny sprzęt i instrukcje. Uczestnicy wymieniają też spisy audycji: przy niewielu kasetach warto wiedzieć, co zajmuje drugą stronę.",
          "byline": "Dział techniczny"
        },
        "knitting": {
          "title": "Włóczka z odzysku",
          "body": "Przy ladzie pasmanterii na Ogrodowej klientki porównują próbki wełny przyniesione z domu. Potrzeba często jednego motka, lecz dokładnie w tym samym odcieniu. Sprzedawczyni radzi wtedy zmienić cały kołnierz albo oba mankiety. W osiedlowym klubie kobiety prują stare swetry i łączą odzyskaną włóczkę w pasy. Wzory krążą w zeszytach, przepisywane z pożyczonych czasopism. Nie wszystko da się wykorzystać: najbardziej wytarte fragmenty odpadają. Z dobrego swetra dla dorosłego zostaje jednak materiał na kamizelkę dla dziecka.",
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
          "body": "W barze mlecznym niedaleko dworca jadłospis zapisuje się kredą. Zanim przyjdą pierwsi podróżni, kuchnia wydaje już śniadania pracownikom okolicznych sklepów. Kierowniczka mówi, że stały gość chce przede wszystkim znać cenę i dostać posiłek bez długiego czekania. Dlatego obok potraw mącznych codziennie jest prosta zupa. Pieczywo z poprzedniego dnia przeznacza się na grzanki, a dostawy planuje według utargów z całego tygodnia. Najtrudniej przewidzieć ruch w dni targowe: wtedy przy stolikach spotyka się miasto i okoliczne wsie.",
          "byline": "Anna Wrona - Handel"
        },
        "station-clock": {
          "title": "Miasto na dwóch biletach",
          "body": "Przed siódmą w dworcowej poczekalni spotykają się ludzie dojeżdżający z całego województwa. Po zejściu z pociągu wielu czeka jeszcze przejazd tramwajem. W teczkach, obok śniadania, noszą dwa bilety miesięczne. Pani Teresa, księgowa, zna rozkład na pamięć, lecz do domu wraca według godzin odbioru dziecka z przedszkola. Zmiana służbowego zebrania o pół godziny oznacza dla niej godzinę na peronie. W miejskich statystykach jest pracownikiem biurowym. Sporą część jej dnia pracy wyznacza jednak kolejowy zegar.",
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
          "body": "Na spotkanie miejskiego koła akwarystów przyniesiono słoiki z sadzonkami i zeszyty obserwacji. Członkowie porównywali urządzenie małych zbiorników, takich, na jakie wystarcza miejsca w blokach. Pokazowy zbiornik w świetlicy skompletowano z darów: szkło dostarczył rzemieślnik, lampę jeden z klubowiczów, rośliny reszta koła. Dyżury przy nim dzielą uczniowie i emeryci. Instruktor podkreśla, że najpierw trzeba nauczyć się stałej opieki. Efektowną rybę łatwo przynieść z giełdy; trudniej zorganizować zastępstwo na czas urlopu.",
          "byline": "Marek Boruta - Zainteresowania"
        },
        "bookbinding": {
          "title": "Rocznik w twardej oprawie",
          "body": "Introligator przy ulicy Stolarskiej oprawia roczniki dla czytelni i domowych zbieraczy. Na stole leżą czasopisma techniczne, gazety oraz zeszyty z wykrojami. Zanim powstanie okładka, trzeba sprawdzić kolejność numerów i kompletność wkładek. Najwięcej kłopotu sprawiają wycięte porady: właściciel pamięta cały rocznik, lecz w środku brakuje połowy strony. Mistrz zachowuje dawne okładki i spisy treści. Jak wyjaśnia, dobra oprawa ma ułatwić znalezienie potrzebnego tekstu, a nie tylko wyrównać grzbiety na półce.",
          "byline": "Ewa Lis - Rzemiosło"
        },
        "starlight": {
          "title": "Niebo znad kamienic",
          "body": "W miejskim kole astronomicznym pierwszym przyrządem nie jest luneta, lecz mapa nieba. Instruktor uczy odnajdywać kilka jasnych gwiazd, zanim pozwoli ustawić teleskop. W śródmieściu obserwację utrudniają światła i ciasne podwórza; na lepszy widok uczestnicy wyjeżdżają za ostatnie zabudowania. Zajęcia przyciągają uczniów, ale także dorosłych przynoszących dawno nieużywane lornetki. Najwięcej cierpliwości wymaga wspólne czekanie na przejaśnienie. W zeszycie koła obok rysunków nieba zapisuje się więc również pogodę.",
          "byline": "Marek Boruta - Nauka"
        },
        "noticeboard": {
          "title": "Czyja kolej do suszarni?",
          "body": "Mieszkanka osiedla Północ pisze do redakcji w sprawie wspólnej suszarni. Na tablicy wisi regulamin, ale nie ma wykazu dyżurów ani informacji, kto przechowuje klucz. Spółdzielnia w odpowiedzi wskazuje gospodarza domu. Ten prowadzi zeszyt rezerwacji, o którym część nowych lokatorów nie wiedziała. Rada bloku zapowiada wywieszenie tej informacji obok regulaminu. Czytelniczka nie domagała się nowych urządzeń: chciała korzystać z pomieszczenia, za które płaci w czynszu. Do załatwienia sprawy wystarczyła czytelna kartka.",
          "byline": "Listy do redakcji"
        },
        "bicycle": {
          "title": "Rower szuka kąta",
          "body": "W sklepach sportowych rower ogląda się z każdej strony. W mieszkaniu trzeba jeszcze znaleźć dla niego miejsce. Czytelnicy z nowych osiedli piszą o wąskich piwnicach i schodach bez podjazdów. Jeden z gospodarzy domów pokazuje nam wspólną rowerownię: stoją w niej także wózki, sanki i sprzęt turystyczny. Lokatorzy sami oznaczyli miejsca, by można było dojść do dalszej ściany. Rower pozostaje dla wielu środkiem dojazdu na działkę albo do pracy na przedmieściu. Jego użyteczność zaczyna się od możliwości wyprowadzenia go z domu.",
          "byline": "Dział miejski"
        },
        "prompter": {
          "title": "Głos spod sceny",
          "body": "Suflerka miejskiego teatru mieści egzemplarz sztuki w teczce po nutach. Ołówkiem zaznacza miejsca, w których aktorzy najczęściej gubią słowa. Przy kolejnej obsadzie część znaków ściera, inne dopisuje na marginesie. Widz z pierwszego rzędu słyszy czasem cichy szept, lecz rzadko wie, skąd dochodzi. Po spektaklu aktorzy pytają ją również o tempo scen. Ze swojego ciasnego miejsca pani Irena widzi przedstawienie, którego publiczność nie ogląda.",
          "byline": "Marek Boruta - Kultura"
        },
        "cinema-booth": {
          "title": "Okno nad widownią",
          "body": "Do kabiny kina Świt prowadzą osobne schody. Operator sprawdza taśmę, zanim na sali zgasną światła. Na metalowych pudełkach zostają etykiety z poprzednich kin i uwagi o sklejeniach. Podczas seansu musi śledzić obraz przez małe okno, choć sam zna film głównie z kolejności szpul. Bileterka rozpoznaje zakończenie po muzyce i szykuje drzwi. Ostatni widz wychodzi, kiedy w kabinie zaczyna się zwijanie opowieści do pudełek.",
          "byline": "Marek Boruta - Kultura"
        },
        "score-library": {
          "title": "Nuty do zwrotu",
          "body": "Biblioteka orkiestry zajmuje szafy na końcu korytarza. Każdy pulpit otrzymuje osobną partię, a po koncercie bibliotekarz liczy nie utwory, lecz głosy. Na kartach widać dopiski muzyków sprzed wielu lat. Część pomaga następcom, część trzeba wyjaśniać na próbie. Najdłużej szuka się nut pożyczonych na zastępstwo. Instrumentalista wraca do swojego zespołu, natomiast cienka teczka potrafi odbyć znacznie dłuższą podróż.",
          "byline": "Marek Boruta - Kultura"
        },
        "poster-lettering": {
          "title": "Afisz spod pędzla",
          "body": "Plastyk domu kultury zaczyna afisz od zmierzenia nazwiska wykonawcy. Krótkie mieści się nad tytułem, długie wymaga innego podziału wierszy. Litery kreśli pędzlem na papierze rozłożonym na dwóch stołach. Słoiki z farbą mają wieczka z dawnych zaproszeń. Przechodnie oglądają gotowy plakat przez kilka sekund, ale pomyłkę w godzinie zauważają natychmiast. Dlatego ostatnie sprawdzenie należy do portiera, który będzie wpuszczał publiczność.",
          "byline": "Marek Boruta - Kultura"
        },
        "puppet-tour": {
          "title": "Scena w dwóch walizach",
          "body": "Zespół lalkowy wrócił z objazdu świetlic podmiejskich. Dekoracje i bohaterowie podróżowali w dwóch walizach, parawan osobno. W jednej sali scenę ustawiono między piecem a stołem do ping-ponga. Dzieci po przedstawieniu chciały zobaczyć ręce aktorów i zapytać, kto mówił za psa. Kierownik spisał uwagi gospodarzy na odwrocie trasy. Przed następnym wyjazdem trzeba skrócić nogi parawanu: najmniejsi widzowie oglądali głównie jego zasłonę.",
          "byline": "Marek Boruta - Kultura"
        },
        "accordion-duet": {
          "title": "Dwa akordeony",
          "body": "Na przeglądzie amatorskim duet z warsztatów kolejowych otrzymał wyróżnienie za opracowanie melodii tanecznych. Obaj muzycy uczyli się ze słuchu, a zapis przygotował im nauczyciel ze Szkolnej. Próby odbywały się w mieszkaniu jednego z wykonawców, za zgodą sąsiadów z dołu. Najwięcej trudności sprawiało wspólne zakończenie utworu. Na występie pomógł dyskretny ruch głową. Dyplom zawisł w świetlicy; akordeony wróciły do domów.",
          "byline": "Marek Boruta - Kultura"
        },
        "matinee-survey": {
          "title": "Kto chodzi na poranki",
          "body": "Kino Świt zebrało kartki z uwagami opiekunów przychodzących na poranki. Większość dotyczyła czasu rozpoczęcia, nie wyboru filmów. Rodzice z obrzeży prosili o uwzględnienie rozkładu autobusów, mieszkańcy centrum o wcześniejszy koniec. Kierownictwo porównuje odpowiedzi z frekwencją. Bileterka dopisała własną uwagę: dzieci przychodzące grupą potrzebują więcej czasu w szatni. W repertuarowej tabeli dotąd nie było na to rubryki.",
          "byline": "Marek Boruta - Kultura"
        },
        "dance-shoes": {
          "title": "Walce na zmianę",
          "body": "Uczestnicy kursu tańca na Szkolnej pokazali rodzinom swój program. W pierwszym rzędzie usiedli ci, którzy przez kilka tygodni pilnowali dzieci podczas lekcji. Instruktorka zestawiła walca z prostymi tańcami użytkowymi, przydatnymi na domowych uroczystościach. Jedna para ćwiczyła dotąd kroki w kuchni między stołem a piecem. Na dużej sali musiała nauczyć się poruszać dalej. Po pokazie krzesła odsunięto i zaproszono do tańca także widzów.",
          "byline": "Marek Boruta - Kultura"
        },
        "recitation-finals": {
          "title": "Wiersz bez mikrofonu",
          "body": "W finale konkursu recytatorskiego wystąpiło jedenastu uczniów. Jury poprosiło, aby ostatnią rundę przeprowadzić bez mikrofonu, w mniejszej sali. Nagle ważniejsze od głośnego początku okazały się wyraźne końcówki zdań. Nagrodzona uczennica ze szkoły nr 12 powiedziała, że ćwiczyła przed babcią siedzącą po drugiej stronie pokoju. W nagrodę dostała tom poezji i zaproszenie do studia teatralnego. Książkę od razu dała babci do potrzymania.",
          "byline": "Marek Boruta - Kultura"
        },
        "folk-recording": {
          "title": "Taśma z okolic miasta",
          "body": "Do działu regionalnego muzeum trafiło nagranie pieśni z podmiejskiej wsi. Magnetofon obsługiwał wnuk jednej ze śpiewaczek. Między zwrotkami słychać pytania o słowa i tykanie zegara. Pracownicy zachowają również te fragmenty, ponieważ pokazują sposób wspólnego przypominania melodii. Do taśmy dołączono zeszyt z nazwiskami uczestniczek. Brakuje jeszcze nazw kilku pieśni: w domu rozpoznawano je zawsze po pierwszym wersie.",
          "byline": "Marek Boruta - Kultura"
        },
        "reading-room": {
          "title": "Gazeta na drewnie",
          "body": "W czytelni przy Kolejowej bieżące gazety zakłada się na drewniane uchwyty. Czytelnik nie musi rozkładać całej płachty na sąsiednim krześle. Stały bywalec zaczyna od wiadomości sportowych, inny od ogłoszeń. Bibliotekarka prostuje zagięte narożniki, bo pod nimi najłatwiej przeoczyć dalszy ciąg tekstu. Wieczorem odkłada numery według dat. Kiedy po tygodniu ktoś szuka dawnej wiadomości, pamięta zwykle miejsce na stronie, rzadziej dzień wydania.",
          "byline": "Marek Boruta - Kultura"
        },
        "portrait-studio": {
          "title": "Przed obiektywem",
          "body": "Fotograf przy Ogrodowej przechowuje stołek dla najmłodszych klientów i poduszkę dla jeszcze mniejszych. Rodzinne zdjęcie zaczyna się od ustalenia, kto kogo zasłania. Marynarkę można poprawić, ale dziecka patrzącego w drzwi nie przekona samo polecenie. Pomaga asystentka z kolorową chustką. Gotowe odbitki trafiają do szuflad według numerów zleceń. Na odwrocie klienci dopisują nazwiska dopiero w domu, często po długiej naradzie o kolejności.",
          "byline": "Marek Boruta - Kultura"
        },
        "museum-labels": {
          "title": "Mała kartka w gablocie",
          "body": "Podpis pod eksponatem muzealnym powstaje z większej liczby notatek, niż mieści sama gablota. Kustosz wybiera nazwę, pochodzenie i jedno zdanie wyjaśnienia. Gdy właściciel przedmiotu zna tylko rodzinne określenie, trzeba zajrzeć do dawnych katalogów. Zwiedzający rzadko zatrzymuje się przy długim opisie. Pracownicy sprawdzają więc podpisy, czytając je na stojąco z drugiej strony szyby. Dopiero wtedy widać, ile drobnego druku znika za odbiciem okna.",
          "byline": "Marek Boruta - Kultura"
        },
        "book-cart": {
          "title": "Biblioteka na kółkach",
          "body": "Wózek biblioteczny jedzie korytarzem internatu w stałym dniu tygodnia. Mieści książki wybrane według kartek zostawionych u wychowawcy. Nie każda prośba daje się spełnić, więc bibliotekarka dokłada kilka własnych propozycji. Najczęściej wracają tomy z zakładkami z zeszytowego papieru. Uczniowie mają oddawać książki bez nich, lecz jedna kartka została: zawierała staranny spis tytułów, które jej właściciel chciał przeczytać przed końcem szkoły.",
          "byline": "Marek Boruta - Kultura"
        },
        "photo-exhibition": {
          "title": "Podwórka na wystawie",
          "body": "Osiedlowe koło fotograficzne pokazało zdjęcia podwórek. Autorzy zrezygnowali z głównych ulic, wybierając trzepaki, warsztatowe bramy i wspólne studnie. Najwięcej osób zebrało się przy fotografii klatki schodowej, którą rozpoznawano po poręczy. Podpis nie podawał numeru domu i widzowie wpisali trzy różne adresy do księgi uwag. Organizatorzy zamierzają przekazać odbitki bibliotece. Dołączą poprawione opisy, ustalone z mieszkańcami sfotografowanych kamienic.",
          "byline": "Marek Boruta - Kultura"
        },
        "poetry-evening": {
          "title": "Autor przy małym stole",
          "body": "Spotkanie z poetą w filii nr 6 zgromadziło mniej osób niż zapisano w zeszycie, ale trwało dłużej, niż przewidywano. Po czytaniu pytano przede wszystkim o pracę nad kolejnymi wersjami utworu. Autor pokazał kartkę z przekreśleniami. Jedna z czytelniczek zauważyła, że najlepszy wers był początkowo na marginesie. Bibliotekarka zachowała zgodę na wystawienie kopii tej kartki. Będzie to skromny dodatek do książek, które wyglądają już na zupełnie gotowe.",
          "byline": "Marek Boruta - Kultura"
        },
        "museum-donation": {
          "title": "Album bez podpisów",
          "body": "Muzeum otrzymało album po zakładowym fotografie. Na zdjęciach są wycieczki, jubileusze i drużyny ustawione pod tą samą ścianą. Daty zapisano tylko przy części odbitek. Byli pracownicy rozpoznali kilka twarzy podczas pierwszego spotkania, lecz spierali się o kolejność wyjazdów. Pomogły proporczyki widoczne w tle. Kustosz zapisuje również wątpliwości. Album pozostanie dostępny do dalszych opisów, zanim otrzyma ostateczną kartę katalogową.",
          "byline": "Marek Boruta - Kultura"
        },
        "radio-play": {
          "title": "Kroki z pudełka",
          "body": "W domu kultury odbył się pokaz przygotowania słuchowiska. Instruktor przyniósł pudełko żwiru, drzwi z klamką i zwój blachy. Uczniowie słuchali nagrania z zamkniętymi oczami, potem oglądali źródła odgłosów. Najtrudniej było odtworzyć kroki człowieka, który się waha. Samo zwolnienie tempa nie wystarczało. Na zakończenie nagrano krótką scenę dworcową. Głos zapowiadający pociąg należał do woźnej, której dykcję wszyscy zgodnie pochwalili.",
          "byline": "Marek Boruta - Kultura"
        },
        "poster-collection": {
          "title": "Repertuar sprzed lat",
          "body": "Czytelnik przekazał redakcji plik programów kina Świt z kilkunastu lat. Przechowywał je w pudełku po butach, zaznaczając obejrzane tytuły. Na odwrocie znalazły się rachunki i wyniki meczów. Pracownik muzeum wybrał część do działu dokumentacji życia miasta. Zestaw pokazuje również zmiany cen i godzin seansów. Właściciel poprosił o zwrot jednego programu: między tytułami zapisał miejsce pierwszego spotkania z przyszłą żoną.",
          "byline": "Marek Boruta - Kultura"
        },
        "book-display": {
          "title": "Książki z drugiej półki",
          "body": "Bibliotekarki przy Kolejowej wystawiły powieści, o które od dawna nikt nie pytał. Zamiast ocen krytyków dołożyły krótkie uwagi dawnych czytelników. Jedna mówiła o podróży pociągiem, podczas której właściciel zapomniał wysiąść. W ciągu tygodnia wypożyczono większość wystawionych tomów. Została książka bez żadnej uwagi. Bibliotekarka zabrała ją do domu, aby przygotować podpis równie uczciwy jak pozostałe.",
          "byline": "Marek Boruta - Kultura"
        },
        "umbrella-ribs": {
          "title": "Pod jedną czaszą",
          "body": "Naprawiacz parasoli przy targowisku przechowuje druty według długości, a rączki według sposobu mocowania. Kolor tkaniny ma znaczenie dopiero na końcu. Klient najczęściej przynosi parasol, który był już pożyczany kilku osobom. Nikt dokładnie nie pamięta, kiedy się skrzywił. Rzemieślnik rozkłada go powoli i zaznacza uszkodzenie kredą. Zdarza się, że nowa rączka zmienia wygląd tak bardzo, iż przy odbiorze trzeba pokazać numer z kwitu.",
          "byline": "Ewa Lis - Rzemiosło"
        },
        "shoe-lasts": {
          "title": "But na prawidle",
          "body": "W zakładzie szewskim kopyta stoją parami na półce nad oknem. Niektóre noszą nazwiska stałych klientów, zapisane ołówkiem na drewnie. Mistrz zaczyna od obejrzenia starej podeszwy, bo sposób jej starcia mówi wiele o chodzeniu. Prośba o szybką naprawę często kończy się rozmową o drugim bucie. Klienci przynoszą tylko uszkodzony, choć nowy obcas trzeba dopasować do obu. Wolne miejsce na półce nie zawsze oznacza mniej pracy.",
          "byline": "Ewa Lis - Rzemiosło"
        },
        "brush-maker": {
          "title": "Włosie w równym rzędzie",
          "body": "Szczotkarz dobiera włosie do pracy, jaką ma wykonywać gotowy wyrób. Innego potrzebuje malarz, innego pracownik piekarni. Drewniane oprawy przychodzą partiami, lecz każdą trzeba obejrzeć osobno. Przy stole leżą wzory zamawiane przez okoliczne zakłady. Najstarsza szczotka nie jest na sprzedaż: służy do porównywania gęstości. Jej zużycie mistrz zna tak dobrze, że uczeń musi nauczyć się odróżniać cechę wzoru od śladu wieloletniej pracy.",
          "byline": "Ewa Lis - Rzemiosło"
        },
        "frame-shop": {
          "title": "Rama do wspomnienia",
          "body": "Do oprawy trafiają dyplomy, fotografie i obrazki wycięte z czasopism. Ramiarz na Stolarskiej pokazuje próbki listew przy dziennym świetle. Pod żarówką ten sam odcień wygląda inaczej. Klienci przynoszą wymiary ściany, rzadziej samego obrazka. Przy starych zdjęciach najwięcej czasu zajmuje wybór marginesu, aby nie zasłonić czyjejś dłoni lub fragmentu munduru. Gotową ramę pakuje się w papier, na którym zostaje odrysowany jej narożnik.",
          "byline": "Ewa Lis - Rzemiosło"
        },
        "upholstery-course": {
          "title": "Krzesło na warsztacie",
          "body": "Uczniowie pracowni tapicerskiej odnowili komplet krzeseł ze świetlicy. Pod wierzchnią tkaniną znaleźli dwa wcześniejsze pokrycia i zeszytowy papier użyty do wyrównania siedziska. Instruktor kazał zapisać kolejność warstw przed rozebraniem mebli. Najlepiej zachowane krzesło posłużyło jako wzór. Po odbiorze gospodarz świetlicy usiadł kolejno na każdym. Dopiero wtedy zauważył różnicę, której nie pokazywała staranna dokumentacja fotograficzna.",
          "byline": "Ewa Lis - Rzemiosło"
        },
        "engraver-cup": {
          "title": "Miejsce na nazwisko",
          "body": "Grawer kończący puchar ligi zakładowej otrzymał poprawioną listę zwycięzców. Jedno nazwisko było dłuższe, niż przewidziano w projekcie. Trzeba było na nowo rozmieścić cały napis na papierowej opasce. Organizatorzy zdążyli z odbiorem, choć zostawili mniej czasu niż na wybór samego pucharu. Mistrz zachował oba projekty dla uczniów. Na gładkim metalu nie widać już mierzenia, które zajęło większą część pracy.",
          "byline": "Ewa Lis - Rzemiosło"
        },
        "ceramic-glaze": {
          "title": "Kolor po wypale",
          "body": "Pracownia ceramiczna domu kultury pokazała pierwszy komplet naczyń wykonanych przez kursantów. Kubki różnią się uchwytami, ale mają ten sam znak na spodzie. Największe zaskoczenie przyniosły kolory szkliwa, które po wypale nie przypominały barw nakładanych pędzlem. Instruktorka ułożyła obok próbki przed i po pracy pieca. Jeden uczestnik zatrzymał krzywy kubek zamiast równiejszego. Po uchwycie poznaje dokładnie miejsce, w którym poprawiał go trzy razy.",
          "byline": "Ewa Lis - Rzemiosło"
        },
        "joinery-drawer": {
          "title": "Szuflada według miary",
          "body": "Pracownia stolarska przyjęła do naprawy szafę biblioteczną z brakującą szufladą. Rysunek techniczny nie zachował się, więc uczeń mierzył sąsiednie elementy. Okazało się, że nie są jednakowe. Stary mebel dopasowywano niegdyś ręcznie, a numery widoczne z tyłu wskazują właściwe miejsca. Nowa szuflada otrzymała własny numer i datę pod spodem. Czytelnicy zobaczą tylko równy front, bibliotekarka znów będzie mogła oddzielić karty rezerwacji.",
          "byline": "Ewa Lis - Rzemiosło"
        },
        "weaving-sample": {
          "title": "Wzór zapisany nitką",
          "body": "Koło tkackie na Szkolnej przygotowało wzornik dla nowych uczestników. Każdy mały kawałek tkaniny opisano liczbą nici i sposobem przeplatania. Próbki powstały z resztek, dlatego te same układy występują w różnych kolorach. Podczas pokazu widzowie częściej dotykali materiałów, niż czytali objaśnienia. Instruktorka dołożyła więc osobny zestaw do brania w ręce. Starannie wykonany egzemplarz pozostanie przy warsztacie jako pomoc podczas kolejnych zajęć.",
          "byline": "Ewa Lis - Rzemiosło"
        },
        "locksmith-apprentice": {
          "title": "Klucz z podpisem",
          "body": "Uczeń ślusarski zdał próbę dorobienia klucza do zamka szafki. Najpierw dostał tylko mechanizm, bez gotowego klucza do skopiowania. Mistrz sprawdzał nie szybkość pracy, lecz to, czy uczeń umie wyjaśnić kolejne poprawki. Gotowy klucz poruszał się swobodnie, ale jego uchwyt pozostał nierówny. Zostanie w pracowni z datą i nazwiskiem wykonawcy. Następny rocznik będzie mógł zobaczyć, od czego zaczynał kolega pracujący już przy oknie.",
          "byline": "Ewa Lis - Rzemiosło"
        },
        "book-gilding": {
          "title": "Litery na grzbiecie",
          "body": "Introligator na Stolarskiej przechowuje czcionki do tłoczenia w płaskich szufladach. Najczęściej brakuje tej litery, która powtarza się w długim tytule. Zanim oprawi rocznik, układa napis na pasku papieru i sprawdza go z właścicielem. Skrót powinien być czytelny także po latach. Klient zgadzający się dziś na same inicjały autora może później nie pamiętać, co oznaczają. Na własnych książkach mistrz zostawia więc tytuły dłuższe niż na zamówieniach.",
          "byline": "Ewa Lis - Rzemiosło"
        },
        "scissors-grinder": {
          "title": "Ostrze i zawias",
          "body": "Do ostrzarza trafiają nożyczki krawieckie i małe nożyczki do domowych robótek. Właściciele proszą o ostre końce, ale przyczyną kłopotów bywa luźne połączenie obu części. Rzemieślnik próbuje każde narzędzie na pasku tkaniny. Papier nie pokaże wszystkich niedokładności. W szufladzie ma próbki od cienkiej podszewki po gruby filc. Krawcowe odbierające swoje nożyczki przynoszą czasem własny skrawek, dokładnie taki, z jakim pracują przy maszynie.",
          "byline": "Ewa Lis - Rzemiosło"
        },
        "basket-work": {
          "title": "Kosz przed targiem",
          "body": "Wikliniarz z okolic miasta rozróżnia kosze po przeznaczeniu, nie po wielkości. Kosz na ziemniaki musi wytrzymać inne traktowanie niż ten na pieczywo. Pałąk dopasowuje do dłoni zamawiającego. Stali klienci przywożą stare wyroby do wymiany dna i rozpoznają je po splotach na brzegu. Warsztat nie prowadzi zeszytu takich znaków. Właściciel mówi, że ręka z czasem zmienia sposób pracy, więc własny kosz potrafi datować bez rachunku.",
          "byline": "Ewa Lis - Rzemiosło"
        },
        "watch-parts": {
          "title": "Mała koperta części",
          "body": "Zegarmistrz odkłada części każdego zegarka do osobnej papierowej koperty. Na zewnątrz zapisuje nazwisko i wygląd tarczy. Klient pamięta zwykle kolor paska, który łatwo wymienić, a nie oznaczenie mechanizmu. Przy odbiorze pyta, czy zegarek będzie chodził jak dawniej. Mistrz prosi wtedy o porównywanie go przez kilka dni z tym samym zegarem. Różne zegary na trasie do pracy potrafią sprawić, że nawet poprawna naprawa wydaje się niedokładna.",
          "byline": "Ewa Lis - Rzemiosło"
        },
        "leather-satchel": {
          "title": "Tornister po starszym",
          "body": "Uczniowie pracowni kaletniczej odnowili tornistry przekazane przez rodziców. Wymieniono sprzączki, uchwyty i najbardziej przetarte paski. Pod klapą jednego znaleziono plan lekcji sprzed dziewięciu lat. Nauczyciel pozostawił go w środku za zgodą właścicielki. Jej młodszy syn będzie używał tej samej torby, choć ma inne podręczniki. Pracownia zapisała zużycie materiału; w rubryce uwag dopisano, że skóra po oczyszczeniu okazała się w lepszym stanie niż nici.",
          "byline": "Ewa Lis - Rzemiosło"
        },
        "plaster-mould": {
          "title": "Kopia małego liścia",
          "body": "W pracowni sztukatorskiej zakończono odtwarzanie brakującej ozdoby z klatki schodowej. Za wzór posłużył liść zachowany piętro wyżej. Uczeń wykonał kilka odlewów, zanim dobrał grubość pozwalającą bezpiecznie wyjąć je z formy. Mieszkańcy obejrzeli próbki podczas odbioru. Dopiero z bliska zobaczyli różnicę między dawnym ornamentem a warstwami farby, które go pokrywały. Jedną nieudaną próbę zostawiono w pracowni do nauki.",
          "byline": "Ewa Lis - Rzemiosło"
        },
        "hat-block": {
          "title": "Kapelusz odzyskał kształt",
          "body": "Modystka przy Ogrodowej przywróciła kształt kapeluszom amatorskiego zespołu teatralnego. Każdy miał inny obwód, chociaż w spisie kostiumów wszystkie figurowały jako jednakowe. Aktorzy przyszli na przymiarkę po próbie i podpisali papierowe opaski. Jeden kapelusz wymagał tylko nowej wstążki, dwa potrzebowały dłuższej pracy na formie. Kierownik zespołu poprawił spis. Dopisał także, że kostium należy wydawać razem z nazwiskiem wykonawcy.",
          "byline": "Ewa Lis - Rzemiosło"
        },
        "metal-signs": {
          "title": "Numer czytelny z bramy",
          "body": "Warsztat metalowy wykonał komplet numerów dla podwórza przy Stolarskiej. Mieszkańcy wcześniej posługiwali się opisami schodów i koloru drzwi. Litery wybrano po próbie odczytania z bramy, a nie z rysunku leżącego na stole. Listonosz poprosił o powtórzenie oznaczenia na oficynie. Po zamocowaniu tablic stary opis drogi pozostawiono jeszcze u dozorcy. Przyda się odwiedzającym, którzy znają podwórze od dawna i nigdy nie pytali o numer.",
          "byline": "Ewa Lis - Rzemiosło"
        },
        "pottery-jug": {
          "title": "Dzbanek według rysunku",
          "body": "Do szkolnej pracowni trafił dzbanek wykonany według projektu uczennicy. Na kartce miał bardzo szeroki uchwyt, który po pierwszej próbie zmniejszono. Oceniający sprawdzali nie tylko wygląd, lecz również nalewanie do małej filiżanki. Strużka na obrusie skłoniła autorkę do kolejnej poprawki dziobka. Obok gotowej pracy pokazano oba wcześniejsze modele. Publiczność najdłużej oglądała ten środkowy, na którym najlepiej było widać ślady szukania kształtu.",
          "byline": "Ewa Lis - Rzemiosło"
        },
        "carving-letters": {
          "title": "Deska dla kronikarza",
          "body": "Koło rzeźbiarskie przygotowało drewnianą okładkę kroniki domu kultury. Każdy uczestnik wyciął fragment obramowania, lecz napis powierzono jednej osobie, aby zachować równy charakter liter. Przy składaniu pojawiła się wąska szczelina. Zamiast ją zasłaniać, instruktor polecił dopasować sąsiednie części. Gotowa okładka jest cięższa od poprzedniej. Kronikarz przeniósł więc księgę na niższą półkę, z której łatwiej podać ją gościom.",
          "byline": "Ewa Lis - Rzemiosło"
        },
        "club-kit": {
          "title": "Koszulki według numerów",
          "body": "Magazynier klubu sportowego zna zawodników także po numerach koszulek. Po praniu układa stroje w paczki, których nie wolno rozdzielać przed wyjazdem. Młodsi gracze dziedziczą komplety po starszych, ale rękawy nie zawsze rosną razem z ambicjami. Poprawki wykonuje krawcowa ze spółdzielni. Do torby meczowej trafiają również igła i nici. W tabeli wyników nie ma rubryki dla kogoś, kto na ławce przyszył brakujący guzik od dresu.",
          "byline": "Jan Rudzki - Sport"
        },
        "referee-notebook": {
          "title": "Gwizdek i notes",
          "body": "Sędzia ligi zakładowej nosi w kieszeni dwa ołówki. Jeden oddaje kapitanowi do podpisania protokołu, drugi zostaje na boisku. Najwięcej objaśnień wymaga zapis nazwisk rezerwowych, których koledzy znają przede wszystkim po przezwiskach. Przed meczem arbiter sprawdza listę na głos. Po spotkaniu protokół musi być czytelny dla ludzi, którzy nie widzieli gry. Z tego powodu staranne litery bywają równie potrzebne jak szybkie rozpoznanie przewinienia.",
          "byline": "Jan Rudzki - Sport"
        },
        "pool-lanes": {
          "title": "Tor dla każdego",
          "body": "Na pływalni instruktor układa grupy według umiejętności, nie według wieku. Dorosły uczący się oddychać w wodzie bywa mniej pewny niż dziecko po kilku zajęciach. Zegar nad basenem pomaga odmierzać ćwiczenia, ale nie zastępuje obserwacji. Stali uczestnicy rozpoznają się po czepkach i godzinach wejścia. Rozmowy odbywają dopiero w szatni. W wodzie porozumiewają się krótkim gestem, zostawiając miejsce osobie płynącej z przeciwka.",
          "byline": "Jan Rudzki - Sport"
        },
        "running-log": {
          "title": "Kilometry w zeszycie",
          "body": "Biegacze z koła rekreacyjnego zapisują trasy w zwykłym zeszycie. Obok odległości pojawiają się uwagi o nawierzchni i czasie powrotu. Trener prosi, by nie porównywać samej liczby kilometrów: droga przez park różni się od okrążeń boiska. Najstarszy uczestnik zaznacza także dni odpoczynku. Młodsi początkowo zostawiali w tych miejscach puste kratki. Teraz wpisują je równie starannie, bo dopiero pełny tydzień pokazuje rzeczywisty rytm zajęć.",
          "byline": "Jan Rudzki - Sport"
        },
        "volleyball-shift": {
          "title": "Siatka po godzinach",
          "body": "Siatkarze pocztowców wygrali spotkanie z drużyną drukarni po pięciu setach. Mecz rozpoczął się później, ponieważ część gości kończyła zmianę. Gospodarze udostępnili im zapasowe koszulki i skrócili rozgrzewkę własnego zespołu. Ostatni set oglądali już tylko najwierniejsi kibice. Po meczu obie drużyny wspólnie zwinęły siatkę. Kapitan drukarzy wpisał do protokołu uwagę o godzinie, prosząc o uwzględnienie służb przy następnym terminarzu.",
          "byline": "Jan Rudzki - Sport"
        },
        "cross-country": {
          "title": "Meta przy starej bramie",
          "body": "W biegu przełajowym szkół wystartowały zespoły z dziewięciu placówek. Trasę wytyczono po alejkach parku, z metą przy starej bramie. Nauczyciele ustawili się na rozwidleniach, aby nikt nie pomylił drogi. Zwycięzca przyznał, że znał ostatni odcinek z codziennych spacerów. Drużynowo najlepiej wypadła szkoła nr 12, której wszyscy uczestnicy ukończyli bieg. Wyniki zapisano na tablicy przy szatni, obok pozostawionej przez kogoś czapki.",
          "byline": "Jan Rudzki - Sport"
        },
        "boxing-score": {
          "title": "Punkty dla juniorów",
          "body": "Młodzi pięściarze klubu kolejowego zakończyli spotkanie towarzyskie remisem. Trener pochwalił spokojną pracę nóg, mniej zadowolony był z pośpiechu pod koniec rund. Widzowie nagradzali oklaskami przede wszystkim wymiany, które sędziowie oceniali ostrożniej. Po zawodach objaśniono młodszym kibicom sposób punktowania. Zawodnicy słuchali razem z nimi. Dla dwóch był to pierwszy występ poza salą treningową i pierwsze spotkanie z własnym nazwiskiem na afiszu.",
          "byline": "Jan Rudzki - Sport"
        },
        "handball-goalkeeper": {
          "title": "Bramkarz z rezerwy",
          "body": "Drużyna spółdzielców wygrała mecz piłki ręcznej różnicą dwóch bramek. Rezerwowy bramkarz wszedł po przerwie i obronił kilka rzutów z bliska. Po spotkaniu opowiadał głównie o koledze, który z ławki przypominał mu ustawienie. Trener zauważył, że obaj od dawna ćwiczą razem, choć zwykle gra tylko jeden. Do kroniki klubowej trafi wspólne zdjęcie. Fotograf poprosił, aby piłkę i proporczyk trzymali na zmianę, nie zasłaniając numerów koszulek.",
          "byline": "Jan Rudzki - Sport"
        },
        "relay-baton": {
          "title": "Pałeczka bez pośpiechu",
          "body": "Szkolna sztafeta poprawiła swój wynik, choć żaden z biegaczy nie ustanowił rekordu indywidualnego. Nauczyciel poświęcił ostatnie zajęcia wyłącznie przekazywaniu pałeczki. Na boisku zaznaczono kredą miejsca rozpoczęcia biegu. Podczas zawodów wszystkie zmiany udały się bez zatrzymania. Uczniowie chcieli zabrać pałeczkę do klasy jako pamiątkę. Wróciła jednak do magazynku, bo następna grupa miała zacząć ćwiczenia od tej samej czynności.",
          "byline": "Jan Rudzki - Sport"
        },
        "chess-clock": {
          "title": "Partia do odtworzenia",
          "body": "Finał turnieju szachowego w domu kultury zakończył się po długiej końcówce wieżowej. Zwycięzca udostępnił zapis do klubowej gabloty. Przy przepisywaniu znaleziono niejasny ruch, którego obaj gracze nie potrafili od razu odtworzyć. Pomogła pamięć kibica siedzącego najbliżej okna. Instruktor wykorzysta partię na zajęciach z juniorami. Zamiast zaczynać od ostatniego błędu, chce pokazać wcześniejszą wymianę, po której pozycja stała się trudna.",
          "byline": "Jan Rudzki - Sport"
        },
        "model-railway": {
          "title": "Rozkład na małym torze",
          "body": "Modelarze kolejowi spotykają się przy makiecie zajmującej pół świetlicy. Pociągi mają własny rozkład, zapisany na kartkach mniejszych od biletów. Opóźnienie jednego wymaga odłożenia odjazdu następnego. Najmłodsi wolą prowadzić lokomotywy, starsi pilnują zwrotnic i kolejności. Jeden z uczestników pracuje na prawdziwej kolei. Tutaj wybiera jednak stację boczną, na której przez większość spotkania można spokojnie poprawiać drzewa z gąbki.",
          "byline": "Ewa Lis - Zainteresowania"
        },
        "coin-cabinet": {
          "title": "Moneta z historią",
          "body": "Numizmatycy na Szkolnej porównują nie tylko daty i nominały. Interesują ich także ślady obiegu i sposób wykonania napisu. Początkujący przynoszą monety wypolerowane domowymi środkami. Opiekun koła pokazuje wtedy dwie podobne sztuki, z których tylko jedna zachowała dawną powierzchnię. Do każdej wkładają kartkę z pochodzeniem. Najbardziej szczegółowy opis dotyczy zwykłej monety znalezionej w podszewce płaszcza po dziadku.",
          "byline": "Ewa Lis - Zainteresowania"
        },
        "postcard-box": {
          "title": "Widokówki w pudełku",
          "body": "Kolekcjonerka widokówek układa miasto według ulic, choć na poczcie kupowano karty zwykle według atrakcyjności widoku. Porównując kolejne wydania, odnajduje nowe szyldy i znikające ogrodzenia. Treści listów nie zasłania: czasem zapisano w nich więcej o dzielnicy niż w drukowanym podpisie. Sąsiedzi przynoszą jej pojedyncze kartki z rodzinnych szuflad. Przy każdej odnotowuje nazwisko darczyńcy, aby historia zbioru nie zniknęła za obrazkiem.",
          "byline": "Ewa Lis - Zainteresowania"
        },
        "amateur-radio": {
          "title": "Głos zapisany w dzienniku",
          "body": "Krótkofalowcy prowadzą dzienniki łączności równie starannie jak samą rozmowę. Zapisują godzinę, znak stacji i warunki odbioru. Potwierdzenia przychodzą pocztą, niekiedy po długim czasie. W klubowej szafie stoją pudełka z kartami uporządkowanymi według znaków. Dla gościa wyglądają jak zbiór pocztówek. Operator pamięta jednak, przy której rozmowie szum był tak silny, że nazwę miejscowości trzeba było powtarzać litera po literze.",
          "byline": "Ewa Lis - Zainteresowania"
        },
        "model-boat": {
          "title": "Próba na małej wodzie",
          "body": "Koło modelarskie sprawdziło łódki na basenie użyczonym po zajęciach. Konstruktorzy stanęli przy brzegu z notesami, a opiekun mierzył czas przepłynięcia wyznaczonego odcinka. Najładniej pomalowany model skręcał w lewo. Jego właściciel poprawił obciążenie i powtórzył próbę bez zmiany silnika. Wyniki zapisano razem z uwagami o kadłubach. Na wystawie w domu kultury obok modeli znajdą się również te notatki, zwykle pozostające w warsztacie.",
          "byline": "Ewa Lis - Zainteresowania"
        },
        "philately-swap": {
          "title": "Znaczek za kopertę",
          "body": "Na spotkaniu wymiennym filatelistów największym zainteresowaniem cieszyła się zwykła koperta z dawnym stemplem podmiejskiej poczty. Jej właściciel szukał w zamian znaczka do niepełnej serii. Uczestnicy pomogli ustalić datę odbicia, porównując ostatnią cyfrę z innymi przesyłkami. Transakcję zakończono dopiero po obejrzeniu adresu w lupie. Kronikarz koła zanotował wymianę. Cena nie padła, choć rozmowa przy stole trwała niemal pół spotkania.",
          "byline": "Ewa Lis - Zainteresowania"
        },
        "fish-show": {
          "title": "Akwarium z podpisem",
          "body": "Na pokazie akwarystycznym każde akwarium miało opis przygotowany przez właściciela. Jury pytało także o codzienną opiekę i prowadzony zeszyt obserwacji. Wyróżnienie dostał niewielki zbiornik uczennicy, która dokładnie notowała zmiany zachowania ryb. Jej dekoracja była skromniejsza od sąsiednich. Po pokazie najwięcej pytań dotyczyło właśnie zeszytu. Klub udostępni jego pusty wzór, aby początkujący wiedzieli, co warto obserwować.",
          "byline": "Ewa Lis - Zainteresowania"
        },
        "photo-darkroom": {
          "title": "Odbitka z jednego filmu",
          "body": "Uczestnicy kursu fotograficznego przygotowali różne odbitki z tego samego negatywu. Zmieniając kadrowanie, pokazali pustą ławkę, przechodnia albo całe podwórze. Prowadzący ułożył prace obok siebie bez nazwisk. Widzowie długo nie wierzyli, że wszystkie powstały z jednego zdjęcia. Autor negatywu wybrał na koniec najszerszy kadr. Powiedział, że dopiero przy nim pamięta, po co w ogóle wszedł z aparatem w tamtą bramę.",
          "byline": "Ewa Lis - Zainteresowania"
        },
        "boardgame-evening": {
          "title": "Pionki do policzenia",
          "body": "Wieczór gier w świetlicy zgromadził trzy pokolenia mieszkańców. Przed rozpoczęciem każda grupa sprawdzała zawartość pudełka. Brakujące pionki zastąpiono guzikami, zapisując przydział na kartce. Najdłużej trwała partia warcabów między emerytem a uczniem technikum. Obserwatorzy musieli powstrzymać się od podpowiadania. Po spotkaniu dzieci sporządziły wykaz kompletów. Guziki zostały w pudełkach, bo uczestnicy uznali je już za część klubowego wyposażenia.",
          "byline": "Ewa Lis - Zainteresowania"
        },
        "mineral-display": {
          "title": "Kamienie z podpisami",
          "body": "Szkolne koło krajoznawcze urządziło pokaz minerałów z prywatnych zbiorów. Obok efektownych okazów leżały niepozorne kamienie z pobliskiej żwirowni. Nauczyciel poprosił o dokładne miejsca znalezienia, a nie tylko nazwy. Kilka kartek pozostało z pytajnikami. Właściciele ustalą je podczas następnej wspólnej wycieczki. Najmłodszy wystawca miał tylko trzy okazy, ale każdy opisany na osobnej stronie; przy jego stoliku rozmowy trwały najdłużej.",
          "byline": "Ewa Lis - Zainteresowania"
        },
        "radio-aerial": {
          "title": "Antena przy oknie",
          "body": "Do poradni technicznej domu kultury trafiają pytania o odbiór radiowy w nowych blokach. Mieszkańcy przynoszą szkice pokoi i opisują, przy którym oknie słychać mniej szumu. Instruktor zaczyna od sprawdzenia samego aparatu. Czasem różnicę daje przesunięcie go o szerokość półki. Nie obiecuje jednak jednakowego rezultatu na każdym piętrze. Sąsiedzi z tego samego pionu potrafią słuchać tej samej audycji przy zupełnie innym ustawieniu odbiornika.",
          "byline": "Dział techniczny"
        },
        "typewriter-ribbon": {
          "title": "Dwie barwy na taśmie",
          "body": "Maszynistka z biura projektów rozpoznaje zużytą taśmę po kopii, nie po pierwszej stronie. Oryginał bywa jeszcze czytelny, gdy ostatnia odbitka wymaga domyślania się cyfr. Nową szpulę wpisuje do zeszytu zaopatrzenia. Czerwonej części używa rzadko, głównie do oznaczeń w zestawieniach. Goście pytają czasem, dlaczego nie pisze nią całego nagłówka. Odpowiada, że w teczce pełnej czerwonych nagłówków najważniejszy przestałby się wyróżniać.",
          "byline": "Dział techniczny"
        },
        "tape-index": {
          "title": "Co jest na stronie B",
          "body": "Właściciele magnetofonów przynoszą do klubu kasety opisane tylko po jednej stronie. Na drugiej może być koncert, lekcja języka albo rodzinne nagranie. Instruktor proponuje osobny spis z licznikiem początku każdego fragmentu. Liczniki różnych aparatów nie wskazują dokładnie tego samego, więc kartka zostaje przy konkretnym urządzeniu. Jeden uczestnik ma już trzy zeszyty. Najczęściej szuka w nich nie muzyki, lecz głosu córki sprzed pójścia do szkoły.",
          "byline": "Dział techniczny"
        },
        "bicycle-dynamo": {
          "title": "Światło od koła",
          "body": "Mechanik rowerowy słucha dynama, obracając koło na stojaku. Właściciel zwykle opisuje lampę, która raz świeci, a raz gaśnie. Przyczyn szuka się także w przewodzie i mocowaniu, nie tylko w żarówce. Na ławie leżą stare oprawki przynoszone jako wzory. Do podobnych modeli pasują różne części. Klient, który zabrał rower zamiast samej lampy, wychodzi zazwyczaj z pełniejszą odpowiedzią i nie musi wracać po brakujący wymiar.",
          "byline": "Dział techniczny"
        },
        "slide-projector": {
          "title": "Obraz na jasnej ścianie",
          "body": "Technicy domu kultury porównali ustawienia rzutnika przed pokazem przeźroczy. Największy obraz nie okazał się najczytelniejszy: z tylnych krzeseł lepiej było widać mniejszy, wyraźniejszy kadr. Prowadzący zaznaczył miejsce aparatu taśmą na podłodze. Uczestnicy przynieśli slajdy z wycieczek, w różnych ramkach. Ich uporządkowanie zajęło więcej czasu niż próba światła. Przy następnym spotkaniu zestawy będą przyjmowane wcześniej, razem ze spisem kolejności.",
          "byline": "Dział techniczny"
        },
        "workshop-meter": {
          "title": "Wskazówka na próbę",
          "body": "Uczniowie technikum porównali wskazania kilku mierników z warsztatu. Każdy odczytywał skalę samodzielnie, zanim wyniki zapisano na tablicy. Różnice wynikały częściowo z patrzenia pod innym kątem. Nauczyciel ustawił aparat na wysokości oczu i powtórzył pomiar. Ćwiczenie zakończyło się rozmową o dokładności zapisu. Większa liczba cyfr w zeszycie nie oznaczała, że ktoś naprawdę zmierzył więcej niż koledzy.",
          "byline": "Dział techniczny"
        },
        "sewing-maintenance": {
          "title": "Maszyna po przeglądzie",
          "body": "Kursantki na Szkolnej przyniosły domowe maszyny do pokazowego przeglądu. Instruktor rozłożył na stole instrukcje, z których część zachowała się tylko we fragmentach. Dwa niemal identyczne modele wymagały innego nawlekania. Właścicielki porównały swoje zapiski i uzupełniły brakujące rysunki. Na zakończenie każda przeszyła próbny kawałek tkaniny. Materiały zabrano do domów razem z maszynami, aby przy następnej wątpliwości było do czego wrócić.",
          "byline": "Dział techniczny"
        },
        "telephone-display": {
          "title": "Słuchawki z różnych lat",
          "body": "Szkolna pracownia pokazała kolekcję aparatów telefonicznych wypożyczonych przez pracowników łączności. Uczniowie porównywali ciężar słuchawek i powrót tarczy. Najstarszy aparat nie miał nadrukowanych cyfr, lecz osobne okienka z kartonikami. Obok leżała dawna instrukcja rozmowy zamiejscowej. Zwiedzający najczęściej pytali o drewnianą obudowę. Prowadzący pozwolił zajrzeć do środka, pod warunkiem że każdy odłoży pokrywę w oznaczone miejsce.",
          "byline": "Dział techniczny"
        },
        "record-speed": {
          "title": "Płyta we właściwym tempie",
          "body": "Na zajęciach technicznych porównano nagrania odtwarzane na dwóch gramofonach. Właściciele sądzili wcześniej, że różnica brzmienia wynika z głośników. Instruktor sprawdził również prędkość obrotów. Po regulacji znajoma melodia zabrzmiała inaczej, niż pamiętał jeden z uczestników. Przyznał, że od lat słuchał jej na tym samym aparacie. Klub zachowa krótki opis próby, bez ocen płyt, które tego wieczoru służyły wyłącznie jako materiał porównawczy.",
          "byline": "Dział techniczny"
        },
        "drafting-tools": {
          "title": "Krzywa według wzoru",
          "body": "Pracownia kreślarska udostępniła uczniom komplet dawnych przyrządów. Największą ciekawość budziły krzywiki, których kształty nie przypominały żadnego gotowego rysunku. Kreślarz pokazał, jak dobiera się tylko krótki fragment krawędzi. Uczniowie narysowali ten sam profil, zaznaczając miejsca połączeń. Na wystawie prac linie wyglądały jednakowo płynnie. Różnice pozostały na brudnopisach pełnych małych kresek, których nie przeniesiono na czysto.",
          "byline": "Dział techniczny"
        },
        "button-tin": {
          "title": "Pudełko po herbacie",
          "body": "Guziki w domowym pudełku rzadko tworzą pełne komplety. Zostają po płaszczach, których już nie ma, i bluzkach oddanych młodszym. Krawcowa radzi nawlekać jednakowe sztuki na wspólną nitkę. W pasmanterii klientki kładą na ladzie pojedynczy guzik, pytając o podobny. Czasem łatwiej wymienić cały rząd niż dobrać jeden. Stary komplet wraca wtedy do pudełka i czeka na ubranie, które będzie potrzebowało o jeden guzik mniej.",
          "byline": "Anna Wrona - Dom i rodzina"
        },
        "sheet-hems": {
          "title": "Brzeg dłużej wytrzyma",
          "body": "W osiedlowym punkcie usługowym skraca się prześcieradła do łóżek o nietypowych wymiarach. Klientki często przynoszą miarę materaca, zapominając o zapasie na podwinięcie. Pracownica rozkłada tkaninę na dużym stole i pokazuje różnicę. Odcinki pozostające po pracy służą na poszewki albo ścierki. Nie każdy chce je zabrać. Z tych pozostawionych powstają próbki szwów dla uczennic, które dopiero uczą się prowadzić prosty brzeg.",
          "byline": "Anna Wrona - Dom i rodzina"
        },
        "shopping-bag": {
          "title": "Torba składana w torbę",
          "body": "Przed targiem pani Jadwiga wkłada do dużej torby kilka mniejszych. Osobno niesie pieczywo, osobno warzywa z ziemią. Płócienne worki uszyła z poszewki, której środek był przetarty, lecz boki pozostały mocne. Sąsiadki przynoszą jej własne materiały do porównania. Najważniejsze okazują się uchwyty: łatwe do wykonania nie zawsze wygodnie leżą w dłoni. Gotowe torby zajmują jedną szufladę, dawniej wypełnioną papierem zbieranym do pakowania.",
          "byline": "Anna Wrona - Dom i rodzina"
        },
        "leftover-yarn": {
          "title": "Motek z małą etykietą",
          "body": "W klubie robótek każda resztka włóczki dostaje etykietę z nazwą dawnego swetra. Sam kolor nie wystarcza do rozpoznania grubości i zachowania nitki. Z małych ilości powstają próbki, kieszenie i paski do dziecięcych czapek. Prowadząca przechowuje także nieudane zestawienia. Na nich łatwiej pokazać, dlaczego równy wzór nagle się zwęża. Nowe uczestniczki oglądają te kawałki równie uważnie jak gotowe rzeczy wystawione w gablocie.",
          "byline": "Anna Wrona - Dom i rodzina"
        },
        "repair-evening": {
          "title": "Wieczór z igłą",
          "body": "Mieszkańcy Północy przynieśli do świetlicy ubrania wymagające drobnych poprawek. Dwie doświadczone krawcowe pomagały, lecz nie wykonywały całej pracy za właścicieli. Najwięcej osób uczyło się wszywać zamek. Na jednym stole zebrano guziki, nici i naparstki do wspólnego użytku. Po zajęciach zostały trzy samotne rękawiczki i nożyczki z czerwoną nitką. Gospodarz wpisał je do zeszytu, licząc, że następne spotkanie zacznie się od odnalezienia właścicieli.",
          "byline": "Anna Wrona - Dom i rodzina"
        },
        "linen-swap": {
          "title": "Obrus na inny stół",
          "body": "Podczas sąsiedzkiej wymiany tkanin najwięcej chętnych znalazły obrusy w nietypowych rozmiarach. Po zmianie stołu trudno było je wykorzystać, choć materiał nadal był dobry. Organizatorki poprosiły o przypięcie kartek z wymiarami. Dzięki temu kilka osób nie musiało rozwijać całych pakunków. Jeden długi obrus trafił do dwóch sióstr, które podzielą go między swoje kuchnie. Brzeg wykończą wspólnie, według wzoru zachowanego na krótszym boku.",
          "byline": "Anna Wrona - Dom i rodzina"
        },
        "recipe-index": {
          "title": "Zeszyt odzyskał spis",
          "body": "Uczestniczki koła gospodarstwa domowego uporządkowały zeszyt przepisów używany od lat na zajęciach. Kartki dopisywano w różnych miejscach i podział na potrawy dawno przestał działać. Powstał osobny spis, odsyłający także do uwag na marginesach. Nie poprawiano nazw nadanych przez autorki. Danie zapisane jako szybki obiad pozostało pod tym tytułem, choć wymaga najwięcej przygotowań. Prowadząca dopisała tylko, dla ilu osób przewidziano podane ilości.",
          "byline": "Anna Wrona - Dom i rodzina"
        },
        "curtain-measure": {
          "title": "Firanka na właściwe okno",
          "body": "Na kursie szycia przygotowano firanki do świetlicy. Pierwsze pomiary wykonano przy zamkniętych oknach, następne z otwartymi skrzydłami. Różnica zadecydowała o szerokości środkowych części. Uczestniczki rozrysowały podział tkaniny przed cięciem, wykorzystując resztę na małe okno przy wejściu. Gotowe firanki zawieszono podczas zwykłych zajęć. Osoby siedzące najbliżej parapetu od razu sprawdziły, czy nadal można swobodnie sięgnąć do klamki.",
          "byline": "Anna Wrona - Dom i rodzina"
        },
        "patchwork-cover": {
          "title": "Narzuta ze skrawków",
          "body": "Koło robótek przekazało świetlicy narzutę uszytą z resztek materiału. Kwadraty pochodzą z zasłon, spódnic i dziecięcych sukienek. Początkowo układano je według koloru, później trzeba było uwzględnić grubość tkaniny. Na odwrocie przyszyto małą kieszeń ze spisem uczestniczek. Nie wszystkie zmieściły się na wspólnym zdjęciu. Narzuta będzie używana na ławie przy oknie, gdzie zwykle siadają osoby czekające na rozpoczęcie zajęć.",
          "byline": "Anna Wrona - Dom i rodzina"
        },
        "shopping-notes": {
          "title": "Lista z dwóch stron",
          "body": "Na spotkaniu o domowych wydatkach porównano sposoby prowadzenia list zakupów. Jedna z uczestniczek zapisuje po drugiej stronie rzeczy, których ostatecznie nie kupiła. Dzięki temu odróżnia oszczędność od przełożenia zakupu na później. Inni zaznaczają, do którego sklepu trzeba wrócić z miarą albo próbką. Prowadząca zebrała przykłady bez nazwisk. W klubowej gablocie pokaże kilka prostych układów kartek, bez ogłaszania jednego wzoru dla wszystkich.",
          "byline": "Anna Wrona - Dom i rodzina"
        },
        "shared-landing": {
          "title": "Półka na półpiętrze",
          "body": "Na półpiętrze kamienicy przy Stolarskiej stoi wąska półka z kwiatami. Opiekują się nią trzy mieszkania, każde według innego rytmu dnia. Kartka wsunięta za doniczkę informuje, kiedy ostatnio podlewano. Zanim ją wprowadzono, najbardziej gorliwie pielęgnowane rośliny miały najwięcej kłopotów. Sąsiedzi przestawiają je także zależnie od światła. Półka nie należy do żadnego lokalu, ale przeprowadzka jednego mieszkańca wywołała długą rozmowę o jej dalszej opiece.",
          "byline": "Anna Wrona - Dom i rodzina"
        },
        "folding-table": {
          "title": "Stół na większą rodzinę",
          "body": "W mieszkaniu na Północy codzienny stół stoi przy ścianie. Na rodzinne spotkania odsuwa się go i dokłada płytę przechowywaną za szafą. Krzesła przychodzą od sąsiadów, każde z innym siedziskiem. Gospodyni ma zapisane, które trzeba oddać na jakie piętro. Najwięcej planowania wymaga przejście do kuchni. Meble mieszczą wszystkich dopiero wtedy, gdy uwzględni się także człowieka niosącego wazę, a nie tylko osoby siedzące przy talerzach.",
          "byline": "Anna Wrona - Dom i rodzina"
        },
        "window-sill": {
          "title": "Parapet ma swoje strony",
          "body": "Pani Zofia z kwiaciarni ogląda szkice mieszkań przynoszone przez klientów. Pytanie o dobrą roślinę zaczyna od ustalenia kierunku okna i miejsca kaloryfera. Dwa sąsiednie parapety mogą mieć inne warunki. W sklepie trzyma zeszyt z prostymi rysunkami liści, pomagający rozpoznać okazy bez nazw. Często dopisuje uwagę o rozmiarze po kilku latach. Mała doniczka mieści się wszędzie; trudniej znaleźć miejsce dla rośliny, która dobrze przyjęła się w domu.",
          "byline": "Anna Wrona - Dom i rodzina"
        },
        "family-bookshelf": {
          "title": "Książki na dwa rzędy",
          "body": "Domowy księgozbiór państwa Bielskich zajmuje regał ustawiony w przedpokoju. W drugim rzędzie stoją tomy rzadziej używane, opisane na kartkach przy krawędzi półki. Dzieci proponowały porządek według kolorów, rodzice według autorów. Ostatecznie podręczniki dostały osobne miejsce. Najtrudniej przypisać książki pożyczone na długo. Właściciele wsuwają do nich kartkę z nazwiskiem sąsiada, aby wizyta z filiżanką nie zamieniła się w spór o czyjś atlas.",
          "byline": "Anna Wrona - Dom i rodzina"
        },
        "room-divider": {
          "title": "Regał podzielił pokój",
          "body": "Czytelnicy z Północy pokazali nam pokój podzielony regałem na część do nauki i wspólnego wypoczynku. Nie zasłonili przejścia do okna, co wymagało przestawienia tapczanu. Zrobili najpierw papierowy plan z wyciętymi meblami. Dziecko samo wybrało położenie biurka, a po tygodniu poprosiło o małą zmianę. Rodzina przesunęła lampę i półkę. Plan zachowano w szufladzie, bo za rok w tym samym pokoju zacznie uczyć się młodszy brat.",
          "byline": "Anna Wrona - Dom i rodzina"
        },
        "stairwell-curtains": {
          "title": "Okno wspólnej klatki",
          "body": "Mieszkańcy przy Ogrodowej uzgodnili sposób urządzenia okna na klatce schodowej. Zamiast kilku donic na podłodze ustawiono dwie na istniejącej półce. Pozostałe znalazły miejsce w mieszkaniach. Gospodarz domu przypomniał o dostępie do skrzydła, które trzeba otwierać do mycia. Ustalenia zapisano w zeszycie dyżurów. Najbardziej zadowolony był lokator z dużym wózkiem zakupowym: po raz pierwszy od dawna nie musiał przestawiać niczego podczas wchodzenia.",
          "byline": "Anna Wrona - Dom i rodzina"
        },
        "furniture-plan": {
          "title": "Miara przed zakupem",
          "body": "Na poradę w klubie gospodarstwa domowego przyniesiono rysunek wnęki i wymiary upatrzonej szafy. Na papierze wszystko pasowało. Dopiero zaznaczenie otwieranych drzwi pokazało, że dolna szuflada nie wysunie się do końca. Prowadząca zaproponowała inny układ półek, bez przesuwania całej szafy. Właściciele zabrali poprawiony plan do stolarza. Poprosił ich jeszcze o zmierzenie listwy przy podłodze, pomijanej w obu wcześniejszych wersjach.",
          "byline": "Anna Wrona - Dom i rodzina"
        },
        "plant-cuttings": {
          "title": "Sadzonka z nazwiskiem",
          "body": "W osiedlowej świetlicy wymieniano sadzonki roślin pokojowych. Każda miała karteczkę z imieniem darczyńcy i krótką uwagą o dotychczasowym miejscu. Popularna zielistka występowała pod trzema domowymi nazwami. Dopiero wspólne oglądanie liści wyjaśniło, że chodzi o tę samą roślinę. Kilka sadzonek zostało na parapecie świetlicy. Dyżurni uzgodnili, kto je podlewa, aby pozostały w dobrym stanie do odbioru przez nieobecnych sąsiadów.",
          "byline": "Anna Wrona - Dom i rodzina"
        },
        "child-desk": {
          "title": "Biurko po starszej siostrze",
          "body": "Stolarz ze Stolarskiej przerobił biurko dla rodzeństwa korzystającego z niego na zmianę. Blat pozostał ten sam, zmieniono półkę i wysokość podnóżka. Dzieci przyniosły podręczniki, aby sprawdzić ich miejsce przy rozłożonym zeszycie. Ojciec chciał dodatkową szufladę, lecz córka poprosiła o wolną przestrzeń na kolana. Po przymiarce rodzina wybrała prostszą wersję. Na spodzie blatu zachowano stare naklejki, których żadne z dzieci nie chciało oddać.",
          "byline": "Anna Wrona - Dom i rodzina"
        },
        "coat-hooks": {
          "title": "Wieszak na dobrej wysokości",
          "body": "Lokatorzy małej kamienicy uporządkowali wspólną wnękę przy wejściu. Dawny wieszak przeniesiono wyżej, a dla dzieci przykręcono drugi, odzyskany z mieszkania na piętrze. Wcześniej najmłodsi zostawiali mokre płaszcze na poręczy. Sąsiadka przygotowała płócienną kieszeń na zapomniane rękawiczki. Ustalono, że wnęka ma służyć tylko podczas krótkich wizyt. Pierwszego dnia zniknęła z niej również walizka, której pochodzenia nikt od miesięcy nie umiał wyjaśnić.",
          "byline": "Anna Wrona - Dom i rodzina"
        },
        "soup-ladle": {
          "title": "Miara jednej chochli",
          "body": "W stołówce zakładowej chochle mają oznaczenia, choć wyglądają niemal tak samo. Kucharka dobiera je do rodzaju zupy i wielkości porcji. Nowa pracownica najpierw nalewa wodę do misek, aby nauczyć się ruchu. Przy pełnej kolejce nie ma czasu na poprawki. Jadłospis mówi o gramaturze, goście oceniają posiłek po talerzu. Kierowniczka sprawdza więc także naczynia: w szerszym ta sama porcja wygląda skromniej niż w głębokiej misce.",
          "byline": "Anna Wrona - Handel"
        },
        "market-scales": {
          "title": "Odważnik obok jabłek",
          "body": "Na targowisku sprzedawczyni układa jabłka w osobnych skrzynkach według przeznaczenia. Najrówniejsze wybierają kupujący na prezent, mniejsze trafiają do domowych wypieków. Klienci pytają o nazwę odmiany, czasem znają ją tylko z ogrodu rodziców. Rozmowa pomaga bardziej niż porównanie koloru. Przy wadze leży przekrojony owoc. Sprzedawczyni pokazuje miąższ, zanim sięgnie po odważnik, bo kilka podobnych jabłek może zachowywać się w kuchni zupełnie inaczej.",
          "byline": "Anna Wrona - Handel"
        },
        "canteen-tray": {
          "title": "Taca wraca do okienka",
          "body": "Pracownicy stołówki najłatwiej poznają koniec zmiany po stosie tac. Naczynia wracają nierównomiernie: jedni jedzą szybko, inni czekają na kolegów. Przy okienku ustawiono osobne miejsce na szklanki, aby nie ginęły między talerzami. Rozwiązanie podpowiedział stały gość, który sam kiedyś pracował w kuchni. W sprawozdaniu znalazła się liczba wydanych obiadów. Krótszą drogę między zlewem a półką zauważyły przede wszystkim osoby zbierające naczynia.",
          "byline": "Anna Wrona - Handel"
        },
        "family-dumplings": {
          "title": "Farsz według pamięci",
          "body": "W zeszycie pani Heleny przepis na pierogi zajmuje trzy linijki. Jej córka dopisała już całą stronę uwag o konsystencji i ilości farszu. Podczas wspólnego gotowania okazało się, że domowa szklanka używana jako miara jest mniejsza od zwykłej. Obie zostawiły ją przy mące. Goście rozpoznają pierogi po sposobie zlepiania brzegu. Każda z kobiet robi to inaczej, choć korzystają z tego samego ciasta i tego samego krótkiego przepisu.",
          "byline": "Anna Wrona - Handel"
        },
        "bakery-visitors": {
          "title": "Chleb przed świtem",
          "body": "Uczniowie odwiedzili piekarnię po zakończeniu nocnej produkcji. Mistrz pokazał formy i koszyki, a potem kazał porównać dwa bochenki o podobnym wyglądzie. Różniły się ciężarem i strukturą skórki. Najwięcej pytań dotyczyło rozkładu pracy, bo gotowy chleb uczniowie znali głównie ze sklepu. Do szkolnej gazetki przygotują opis drogi od stołu roboczego do skrzynki. Piekarze poprosili, aby nie pominąć osób, które liczą i rozwożą pieczywo.",
          "byline": "Anna Wrona - Handel"
        },
        "recipe-contest": {
          "title": "Przepis z dopiskiem",
          "body": "W klubowym konkursie potraw domowych wyróżniono zapiekankę przygotowaną z prostych składników. Autorka przyniosła przepis na odwrocie dawnego rachunku. Komisja poprosiła o uzupełnienie czasu pieczenia, zapisanego jako do skutku. Podczas wspólnej próby ustalono przybliżony zakres, ale dopisek pozostawiono jako rodzinną pamiątkę. Przepis trafi do gabloty wraz z uwagą o wielkości naczynia. Właśnie ona wyjaśniła, dlaczego u sąsiadki potrawa wychodziła inaczej.",
          "byline": "Anna Wrona - Handel"
        },
        "school-sandwiches": {
          "title": "Śniadanie z własnej torby",
          "body": "Na szkolnych zajęciach gospodarstwa uczniowie porównali sposoby pakowania drugiego śniadania. Nie oceniano zawartości, lecz to, czy pieczywo dociera całe i czy torba daje się ponownie wykorzystać. Najprostsze płócienne woreczki uszyto z resztek po lekcji krawiectwa. Dzieci oznaczyły je własnymi inicjałami. Po tygodniu przyniosły uwagi z domu. Jeden woreczek musiał zostać powiększony, ponieważ właściciel nosił śniadanie także dla młodszej siostry.",
          "byline": "Anna Wrona - Handel"
        },
        "market-baskets": {
          "title": "Koszyki do porównania",
          "body": "Na spotkaniu koła gospodarstwa domowego pokazano koszyki używane do zakupów. Uczestniczki przyniosły je napełnione tym samym zestawem pustych opakowań. W ten sposób porównano pojemność i wygodę noszenia, bez sporu o sam ciężar. Największy kosz nie wygrał próby przejścia między krzesłami. Jego właścicielka używa go jednak tylko na targu i nie zamierza zmieniać. Do klubu zostawiła mniejszy, który od dawna stał na szafie.",
          "byline": "Anna Wrona - Handel"
        },
        "tea-service": {
          "title": "Filiżanki nie do pary",
          "body": "Dom kultury otrzymał zestaw filiżanek od kilku mieszkańców. Żadna seria nie była kompletna, ale razem wystarczyły na spotkanie czytelników. Gospodyni dobrała spodki według średnicy, zamiast szukać jednakowych wzorów. Goście szybko zaczęli rozpoznawać własne naczynia. Jedna darczyńczyni opowiedziała historię pękniętego kompletu, z którego ocalały dwie sztuki. Po spotkaniu filiżanki ustawiono razem, z dala od ciężkich kubków używanych podczas zajęć plastycznych.",
          "byline": "Anna Wrona - Handel"
        },
        "potato-varieties": {
          "title": "Ziemniak ma swoją nazwę",
          "body": "Na pokazie koła działkowców porównano ziemniaki z kilku pobliskich gospodarstw. Obok koszy ustawiono talerze z ugotowanymi próbkami. Uczestnicy zauważyli różnice, których nie było widać po skórce. Prowadzący poprosił o zapisanie nazw odmian, aby kolejny zakup nie opierał się wyłącznie na pamięci sprzedawcy. Część kartek uzupełniono dopiero po telefonie do gospodarzy. Najdłużej rozmawiano o odmianie znanej wszystkim pod innym domowym określeniem.",
          "byline": "Anna Wrona - Handel"
        },
        "tram-terminus": {
          "title": "Kilka minut na pętli",
          "body": "Na pętli tramwajowej motorniczy odkłada torbę w kabinie i sprawdza godzinę odjazdu. Pasażerowie wsiadają wcześniej, wybierając miejsca na dłuższą drogę do centrum. Sprzedawczyni z kiosku zna przerwy między kursami lepiej niż drukowany rozkład. W tych kilku minutach kupuje się gazetę i kończy śniadanie. Gdy tramwaj rusza, ławka przy kiosku znowu jest pusta. Następna grupa pojawia się od strony osiedla, zanim z daleka słychać kolejny wagon.",
          "byline": "Ewa Lis - Miasto i region"
        },
        "luggage-label": {
          "title": "Walizka z karteczką",
          "body": "W przechowalni bagażu podróżni odbierają walizki po numerach, lecz opisują je najczęściej kolorem i rodzajem paska. Pracownik pokazuje rząd niemal jednakowych brązowych kufrów. Najłatwiej odróżnić ten z domową łatą przy uchwycie. Kwity trzyma się osobno od biletów, radzi stałym klientom. Niektórzy wracają po bagaż dopiero po załatwieniu spraw w kilku urzędach. Walizka czeka nieruchomo, podczas gdy jej właściciel przechodzi przez pół miasta.",
          "byline": "Ewa Lis - Miasto i region"
        },
        "railway-porter": {
          "title": "Wózek zna każdy próg",
          "body": "Bagażowy na dworcu wybiera drogę nieco dłuższą niż pasażerowie. Jego wózek musi ominąć progi i najciaśniejsze przejścia. Zna miejsca, w których dwie walizki ustawione obok siebie nie mieszczą się przy drzwiach. Klienci często pokazują peron, zanim powiedzą, ile mają pakunków. Dopiero liczenie ujawnia torbę zostawioną u krewnego. Bagażowy czeka, opierając rękę na uchwycie. Rozkład jazdy określa pośpiech, ale droga do wagonu ma własną kolejność.",
          "byline": "Ewa Lis - Miasto i region"
        },
        "bus-ticket-book": {
          "title": "Bilet w małym okienku",
          "body": "W podmiejskiej kasie najwięcej biletów sprzedaje się w krótkich odstępach między kursami. Kasjerka zna miejscowości po pytaniach o przesiadkę i porę powrotu. Stały pasażer podaje cel, nowy opowiada zwykle całą planowaną drogę. Za szybą leży mapa z zaznaczonymi punktami. Przydaje się wtedy, gdy nazwa przystanku różni się od tej używanej przez mieszkańców. Bilet zawiera jedną, ale kasjerka musi znać obie, by wskazać właściwy autobus.",
          "byline": "Ewa Lis - Miasto i region"
        },
        "route-map": {
          "title": "Mapa dla przyjezdnych",
          "body": "Uczniowie szkoły przy Kolejowej przygotowali plan dojścia z dworca do kilku miejskich instytucji. Najpierw przeszli wszystkie trasy z zegarkiem, potem poprosili przyjezdnego o próbę według rysunku. Zatrzymał się przy bramie, którą autorzy uznali za oczywistą. Dodano więc charakterystyczny szyld i zaznaczono przejście przez podwórze. Kopia planu trafiła do szkolnego sekretariatu. Oryginał zachowano z poprawkami, bo właśnie one okazały się najważniejszą częścią ćwiczenia.",
          "byline": "Ewa Lis - Miasto i region"
        },
        "commuter-survey": {
          "title": "Przesiadka w zeszycie",
          "body": "Czytelnicy dojeżdżający z okolic miasta przekazali redakcji notatki o codziennych przesiadkach. Nie dotyczą jednego opóźnienia, lecz czasu potrzebnego na przejście między przystankami. W rozkładzie połączenia wyglądają dogodnie, ale droga prowadzi przez dwa przejścia i długi peron. Zestawienie przesłaliśmy do biura komunikacji. Urzędnik poprosił o osobne oznaczenie dni targowych. Właśnie wtedy podróżni częściej niosą torby, które zmieniają tempo całego przejścia.",
          "byline": "Ewa Lis - Miasto i region"
        },
        "bicycle-rack": {
          "title": "Miejsce przy bramie",
          "body": "Pracownicy spółdzielni uporządkowali stojak rowerowy przy bramie. Wcześniej najbliższe miejsca zajmowano poprzecznie, zostawiając końce stojaka trudno dostępne. Podczas wspólnej próby ustawiono różne rowery, również z szerokimi bagażnikami. Kredowe oznaczenia zastąpiono trwałymi numerami. Dozorca przechowuje w portierni opis układu dla nowych użytkowników. Nie przybyło ani jedno stanowisko, ale teraz ostatnia osoba nie musi przesuwać dwóch cudzych kierownic.",
          "byline": "Ewa Lis - Miasto i region"
        },
        "station-signs": {
          "title": "Strzałka z drugiej strony",
          "body": "Po uwagach podróżnych poprawiono ustawienie tablicy kierującej do poczekalni. Była czytelna od głównego wejścia, lecz pasażerowie wychodzący z tunelu widzieli jej tył. Pracownicy dworca sprawdzili dojście z obu stron i przenieśli tablicę bliżej skrzyżowania korytarzy. Czytelnik, który napisał do redakcji, potwierdził zmianę. Dodał, że teraz sam widzi mniej osób zawracających z bagażami. Informacja pozostała ta sama; zmieniło się miejsce jej odczytania.",
          "byline": "Ewa Lis - Miasto i region"
        },
        "walking-club": {
          "title": "Trasa według kroków",
          "body": "Koło krajoznawcze sprawdziło pieszą trasę do podmiejskiego przystanku. Starszy opis podawał odległość w minutach, bez zaznaczenia odpoczynku przy wzgórzu. Uczestnicy szli w dwóch grupach o różnym tempie. Po porównaniu notatek dopisano punkty orientacyjne zamiast jednej obiecanej godziny przejścia. Przewodnik pozostawił nazwę drogi używaną przez okolicznych mieszkańców. Na drukowanej mapie jej nie ma, ale właśnie o nią pytają najczęściej przyjezdni.",
          "byline": "Ewa Lis - Miasto i region"
        },
        "tram-model": {
          "title": "Wagon na szkolnym stole",
          "body": "Uczniowie przygotowali model tramwaju do wystawy o codziennych dojazdach. Wymiary zbierali podczas postoju na pętli, za zgodą obsługi. Najtrudniejsze okazało się rozmieszczenie siedzeń i poręczy. Model nie ma napędu, można za to zdjąć dach. Na pokazie jeden z motorniczych wskazał brakujące lusterko. Autorzy dodali je przed końcem spotkania. Podpis pod modelem wymienia także pracowników, którzy cierpliwie odpowiadali na pytania podczas pomiarów.",
          "byline": "Ewa Lis - Miasto i region"
        },
        "cloakroom-tokens": {
          "title": "Numerek do kieszeni",
          "body": "Szatniarka kina Świt rozpoznaje stałych widzów, lecz płaszcze wydaje zawsze według numerków. Kilka czarnych okryć wygląda pod lampą niemal identycznie. Goście często chowają żeton w rękawiczce, a potem szukają obu rzeczy osobno. Na ladzie leży mała tacka na znalezione drobiazgi. Po ostatnim seansie szatniarka sprawdza kieszenie pozostawionych płaszczy tylko w poszukiwaniu kwitu lub nazwiska. Reszta czeka spokojnie na powrót właściciela.",
          "byline": "Ewa Lis - Dział miejski"
        },
        "letter-carrier": {
          "title": "Adres znany od lat",
          "body": "Listonosz przy Kolejowej pamięta dawnych lokatorów dłużej niż tabliczki na drzwiach. Czasem trafia do niego kartka z nieaktualnym nazwiskiem i dokładnym opisem balkonu. Nie zawsze wystarcza to do doręczenia. W swoim notesie ma poprawki zgłoszone przez mieszkańców. Najtrudniej uporządkować wspólne mieszkania, w których kilka osób odbiera korespondencję pod jednym numerem. Wyraźna karteczka przy skrzynce oszczędza więcej drogi niż dobra pamięć do twarzy.",
          "byline": "Ewa Lis - Dział miejski"
        },
        "barber-mirror": {
          "title": "Rozmowa przed lustrem",
          "body": "Fryzjer przy targowisku ustawia krzesło dla następnego klienta blisko wieszaka. Czekający czyta gazetę, ale pozostawia stronę sportową na wierzchu dla znajomego. Stałe godziny wizyt dzielą zakład na małe kręgi rozmów. Jedni pytają o ogród, inni o rozkład meczów. Mistrz pamięta przede wszystkim, kto prosi o krótszy tył, a kto o ostrożność przy grzywce. Gazeta zmienia się codziennie, te uwagi wracają przy każdym ustawieniu lustra.",
          "byline": "Ewa Lis - Dział miejski"
        },
        "porter-ledger": {
          "title": "Wiadomość u portiera",
          "body": "W portierni domu kultury wiadomości zapisuje się w zeszycie z grubymi liniami. Nazwisko odbiorcy podkreślono, treść mieści się zwykle w jednym zdaniu. Ktoś odda nuty, ktoś przyjdzie później po dziecko. Portier prosi o podpis, aby można było ustalić nadawcę. Najtrudniejsze są kartki zaczynające się od dobrze znanego przezwiska. Dla jednej grupy oznacza ono konkretną osobę, dla drugiej zupełnie kogoś innego, przychodzącego na inne zajęcia.",
          "byline": "Ewa Lis - Dział miejski"
        },
        "lost-glasses": {
          "title": "Okulary znalazły drogę",
          "body": "Do redakcji zgłosił się właściciel okularów zostawionych w czytelni. Rozpoznał etui po małej łatce przyszytej od środka. Wcześniejsze ogłoszenie opisywało tylko kolor oprawki, wspólny dla wielu modeli. Bibliotekarka poprosiła więc o dodatkowy szczegół. Czytelnik przyznał, że bez okularów nie mógł przeczytać kartki wiszącej przy wejściu. O znalezieniu dowiedział się od sąsiada, który przyszedł wypożyczyć zupełnie inną książkę.",
          "byline": "Ewa Lis - Dział miejski"
        },
        "queue-seats": {
          "title": "Krzesła przy okienku",
          "body": "W punkcie usługowym przy Ogrodowej przestawiono krzesła dla oczekujących. Ustawione dawniej pod ścianą zasłaniały dojście osobom z większymi pakunkami. Pracownica zaproponowała krótszy rząd i wolne miejsce na torby. Klienci sprawdzili układ podczas zwykłego dnia pracy. Jedno krzesło wróciło na zaplecze. Nie skróciło to terminów napraw, lecz odbierający rzeczy przestali prosić całą kolejkę o przesunięcie nóg przy każdym wyjściu.",
          "byline": "Ewa Lis - Dział miejski"
        },
        "family-photo-names": {
          "title": "Kto stoi obok ciotki",
          "body": "Podczas spotkania osiedlowych seniorów opisano kilkanaście fotografii rodzinnych. Właściciele znali główne postacie, gorzej pamiętali gości stojących przy brzegach. Jedno nazwisko ustalono dzięki przypomnieniu miejsca pracy. Organizatorzy poprosili o używanie ołówka na osobnych kartkach, bez pisania po zdjęciach. Kopie opisów zostaną u rodzin. Puste miejsca zachowano, aby ktoś na kolejnym spotkaniu mógł uzupełnić pamięć, zamiast przyjmować pierwszy domysł za pewnik.",
          "byline": "Ewa Lis - Dział miejski"
        },
        "returning-umbrella": {
          "title": "Parasol wrócił do kina",
          "body": "Bileterka kina Świt odebrała parasol zabrany omyłkowo po seansie. Właściciel podobnego przyniósł go, gdy zauważył inną rączkę. W szatni nadal czekał jego własny. Oba przedmioty różniła także starannie przyszyta pętelka, niewidoczna po złożeniu. W księdze rzeczy znalezionych skreślono dwie pozycje jednocześnie. Bileterka zaproponowała, by przy kolejnej wizycie każdy rozkładał parasol przed oddaniem do szatni. Pomysł wzbudził więcej śmiechu niż zainteresowania.",
          "byline": "Ewa Lis - Dział miejski"
        },
        "market-bench": {
          "title": "Ławka przesunięta o krok",
          "body": "Na prośbę starszych klientów przestawiono ławkę przy wyjściu z targowiska. Poprzednio siedzący mieli przed sobą ruchliwą drogę wózków. Teraz można odłożyć torbę z boku i spokojnie sprawdzić zakupy. Sprzedawcy uzgodnili zmianę z gospodarzem placu. Jeden obawiał się zasłonięcia swojego stoiska, lecz po próbie cofnął uwagę. Ławka nadal stoi blisko bramy, w miejscu znanym osobom umawiającym się tam przed wspólnym powrotem.",
          "byline": "Ewa Lis - Dział miejski"
        },
        "address-correction": {
          "title": "Dwa wejścia, jeden list",
          "body": "Czytelniczka wyjaśniła pomyłki w doręczaniu listów do oficyny przy Stolarskiej. Jej mieszkanie miało numer widoczny tylko od podwórza, a podobny wisiał przy głównej klatce. Po rozmowie z administracją dopisano oznaczenie wejścia na tabliczce przy bramie. Listonosz sprawdził je podczas obchodu. Pierwsza poprawnie doręczona kartka przyszła od siostry, która znała właściwą drogę od lat, ale nigdy nie umiała jej zmieścić w krótkim adresie.",
          "byline": "Ewa Lis - Dział miejski"
        },
        "chalk-board": {
          "title": "Tablica przed lekcją",
          "body": "Woźny szkoły przy Szkolnej rozpoznaje sale po sposobie zużycia kredy. W jednej zostają krótkie kawałki kolorowe, w drugiej niemal wyłącznie białe. Nauczyciele mają własne zwyczaje dzielenia tablicy. Uczniowie zapisujący dłuższe rozwiązanie uczą się zostawiać miejsce na wniosek. Starcie gąbką początku zadania bywa prostsze niż przepisanie całego rachunku. Dlatego na lekcjach dla młodszych klas ćwiczy się również samo rozmieszczenie pisma.",
          "byline": "Marek Boruta - Oświata"
        },
        "exercise-book": {
          "title": "Margines na poprawkę",
          "body": "Nauczycielka języka prosi uczniów, aby zostawiali szeroki margines w zeszytach. Mieszczą się na nim nie tylko poprawki, ale pytania o sens zdania. Najstaranniej przepisana praca nie zawsze jest najłatwiejsza do omówienia. Uczeń, który pokazuje wcześniejszą wersję, może wyjaśnić swój wybór. W klasowej szafie przechowuje się kilka takich przykładów bez nazwisk. Korzystają z nich kolejne roczniki, porównując drogę od pierwszego pomysłu do gotowego opisu.",
          "byline": "Marek Boruta - Oświata"
        },
        "school-map": {
          "title": "Mapa wraca do tuby",
          "body": "Szkolne mapy zwija się po każdej lekcji, choć część uczniów wolałaby oglądać je stale. W sali brakuje ścian wolnych od okien i szaf. Nauczyciel przechowuje więc zestaw w opisanych tubach. Najczęściej używana mapa ma wzmocnione narożniki, nieco zasłaniające legendę. Uczniowie przepisali ją na osobną kartkę. Dzięki temu można czytać objaśnienia również z ostatniej ławki, bez podchodzenia do tablicy podczas każdego ćwiczenia.",
          "byline": "Marek Boruta - Oświata"
        },
        "evening-students": {
          "title": "Zeszyt po pracy",
          "body": "Słuchacze szkoły wieczorowej przychodzą z torbami, w których obok zeszytów leżą robocze ubrania. Przed zajęciami wymieniają notatki z opuszczonych lekcji. Jeden z uczniów przepisuje wzory w większych odstępach, zostawiając miejsce na późniejsze objaśnienia. Nauczyciel zna godziny zmian w pobliskich zakładach. Sprawdzian musi zmieścić się między końcem pracy a ostatnim autobusem. Ta druga granica bywa dla klasy równie wyraźna jak dzwonek.",
          "byline": "Marek Boruta - Oświata"
        },
        "spelling-contest": {
          "title": "Dyktando z komentarzem",
          "body": "W szkolnym konkursie ortograficznym dwie osoby uzyskały ten sam wynik. Zamiast dodatkowego dyktanda nauczyciele poprosili o objaśnienie kilku zapisów. Uczniowie mogli korzystać ze słownika, lecz musieli wskazać odpowiednie hasło. Wygrała uczestniczka, która najsprawniej wyjaśniła własną poprawkę. W gazetce szkolnej znajdą się najciekawsze pytania, bez listy błędów poszczególnych osób. Organizatorzy chcą, by konkurs zostawił coś przydatnego także pozostałym klasom.",
          "byline": "Marek Boruta - Oświata"
        },
        "school-garden-plan": {
          "title": "Grządka na papierze",
          "body": "Uczniowie narysowali plan szkolnego ogródka na podstawie własnych pomiarów. Każda grupa zaczynała od innego narożnika. Po złożeniu arkuszy ścieżki nie spotkały się w jednym miejscu. Nauczyciel nie poprawił rysunku, lecz poprosił o powtórzenie wybranych odcinków. Błąd znaleziono przy szerokiej bramce. Gotowy plan zawisł w pracowni obok pierwszej próby. Oba pokazują ten sam ogródek, ale tylko jeden pozwala policzyć rzeczywistą powierzchnię grządek.",
          "byline": "Marek Boruta - Oświata"
        },
        "reading-pairs": {
          "title": "Starszy czyta młodszemu",
          "body": "Szkolna biblioteka podsumowała wspólne czytanie prowadzone przez starszych uczniów. Młodsi wybierali książkę, a partner pomagał z trudniejszymi słowami. Najczęściej pożyczano później te same tomy do domu. Opiekunka zauważyła, że starsi zaczęli wcześniej przygotowywać fragmenty, aby nie przerywać opowieści przy każdym zdaniu. Podczas ostatniego spotkania role na chwilę odwrócono. Młodsi przeczytali opiekunom krótkie listy z podziękowaniem, napisane własnymi słowami.",
          "byline": "Marek Boruta - Oświata"
        },
        "geometry-models": {
          "title": "Bryła z rozłożonej kartki",
          "body": "Na wystawie szkolnej pokazano modele brył wykonane z kartonu po opakowaniach. Uczniowie dołączyli płaskie siatki, z których je składali. Jeden ostrosłup miał inne proporcje, ponieważ autor odmierzał długości od brzegu uszkodzonej linijki. Zachowano go obok poprawnej wersji. Zwiedzający mogli rozłożyć osobny model i sprawdzić położenie ścian. Najwięcej czasu przy stoliku spędzili rodzice, którzy dawno nie mieli podobnego zadania przed sobą.",
          "byline": "Marek Boruta - Oświata"
        },
        "school-newspaper": {
          "title": "Redakcja z trzech ławek",
          "body": "Uczniowie szkoły nr 12 przygotowali numer gazetki o zajęciach poza lekcjami. Wywiady przepisywano na maszynie wypożyczonej z sekretariatu. Redakcja mieściła się przy trzech zsuniętych ławkach. Najwięcej sporów dotyczyło długości podpisów pod rysunkami. Po pierwszym czytaniu skrócono wstęp i dodano nazwisko woźnego, pominięte przy opisie pracowni. Gotowy numer powielono w niewielu egzemplarzach; każdy otrzymał kartkę z kolejnością przekazywania między klasami.",
          "byline": "Marek Boruta - Oświata"
        },
        "workshop-aprons": {
          "title": "Fartuch z własną kieszenią",
          "body": "Uczniowie na zajęciach praktycznych uszyli fartuchy do pracowni. Podstawowy krój był wspólny, ale rozmieszczenie kieszeni ustalano według wzrostu i sposobu pracy. Przy pierwszej przymiarce okazało się, że ołówek wypada podczas siadania. Kieszeń trzeba było przesunąć. Nauczyciel poprosił o opisanie tej poprawki obok wykroju. Gotowe fartuchy zostaną w szkole, oznaczone imionami, zamiast wracać co tydzień w torbach między podręcznikami.",
          "byline": "Marek Boruta - Oświata"
        },
        "weather-notebook": {
          "title": "Pogoda z tego podwórza",
          "body": "Emerytowany nauczyciel notuje pogodę z okna od kilkunastu lat. Pomiar wykonuje zawsze o tej samej porze, dopisując krótki opis nieba. Sąsiedzi pytają go najczęściej o wspomnienia wyjątkowo zimnych dni. Zeszyty pokazują także długie odcinki zwyczajnej pogody, które łatwo zapomnieć. Autor nie traktuje swoich notatek jak prognozy. To zapis jednego podwórza, przydatny przede wszystkim wtedy, gdy ktoś twierdzi, że o tej porze zawsze było inaczej.",
          "byline": "Dział naukowy"
        },
        "shadow-dial": {
          "title": "Cień zmienia miejsce",
          "body": "Na zajęciach koła przyrodniczego śledzi się cień zwykłego patyka ustawionego w stałym miejscu. Uczestnicy zaznaczają jego koniec na kartonie i dopisują godzinę. Po kilku obserwacjach widać, że obraz zmienia się także przy podobnej pogodzie. Prowadzący prosi o zachowanie wcześniejszych arkuszy. Jeden słoneczny dzień daje ciekawy rysunek, ale dopiero porównanie wielu pozwala stawiać pytania. Puste miejsca po dniach bez słońca również pozostają w zbiorze.",
          "byline": "Dział naukowy"
        },
        "leaf-collection": {
          "title": "Liść i miejsce znalezienia",
          "body": "W szkolnym zielniku przy każdym liściu zapisuje się miejsce i okoliczności znalezienia. Sam kształt nie zawsze wystarcza do rozpoznania drzewa. Uczniowie porównują także korę na rysunkach i układ gałęzi. Najstarsze kartki mają wyblakłe podpisy, które trzeba odczytywać przy oknie. Nauczyciel nie usuwa dawnych pomyłek, tylko dopina wyjaśnienie. W ten sposób zbiór przechowuje również historię uczenia się nazw, a nie wyłącznie gotowe odpowiedzi.",
          "byline": "Dział naukowy"
        },
        "magnifier-table": {
          "title": "Zwykła nitka pod lupą",
          "body": "Instruktor koła przyrodniczego zaczyna zajęcia od przedmiotów mieszczących się w kieszeni. Nitka, ziarenko i kawałek papieru pod lupą wyglądają inaczej niż w dłoni. Uczestnicy rysują to, co widzą, bez podpisywania nazwy z pamięci. Dopiero później porównują kartki. Najtrudniej oddzielić cechę samego przedmiotu od odbicia światła. Doświadczony uczestnik obraca więc próbkę, zanim uzna błyszczący punkt za coś, co należy nanieść na rysunek.",
          "byline": "Dział naukowy"
        },
        "star-chart": {
          "title": "Niebo na szkolnej mapie",
          "body": "Koło astronomiczne przygotowało pokaz czytania map nieba. Uczestnicy zaczęli w sali, dopasowując papierowe wskazówki do oznaczeń na planszy. Potem sprawdzili kilka łatwych punktów z dziedzińca. Światło pobliskich okien utrudniało obserwację, więc nie próbowano odnaleźć wszystkiego. Nauczyciel poprosił o zaznaczenie także miejsc, których nie udało się rozpoznać. Przy następnym spotkaniu porównają warunki, zamiast zakładać, że każdy brak wynikał z pomyłki obserwatora.",
          "byline": "Dział naukowy"
        },
        "water-level": {
          "title": "Ten sam poziom",
          "body": "Na pokazie szkolnym połączono przezroczyste naczynia o różnych kształtach. Woda ustawiła się na wspólnym poziomie, ku zaskoczeniu części młodszych widzów. Starsi uczniowie objaśniali doświadczenie, wskazując skalę na tablicy. Jeden z rodziców rozpoznał zasadę używaną w swoim warsztacie. Przyniósł później rysunek narzędzia, którym posługuje się przy pracy. Pokaz uzupełniono o ten przykład, obok schludnego schematu z podręcznika.",
          "byline": "Dział naukowy"
        },
        "seed-observation": {
          "title": "Kiełek w dwóch zeszytach",
          "body": "Dwie klasy porównały zapiski z obserwacji kiełkujących nasion. Używały tych samych naczyń, lecz notowały wyniki w inny sposób. Jedna zapisywała daty, druga liczbę dni od rozpoczęcia. Przy wspólnym zestawieniu trzeba było najpierw uzgodnić początek. Nauczycielka wykorzystała różnicę do rozmowy o opisie doświadczenia. Najładniejszy rysunek nie mógł zastąpić brakującej informacji, kiedy właściwie powstał. Uczniowie uzupełnili więc podpisy, zanim wystawili prace.",
          "byline": "Dział naukowy"
        },
        "sound-string": {
          "title": "Dźwięk według długości",
          "body": "Uczniowie koła fizycznego zbudowali prosty przyrząd ze struną i ruchomym podparciem. Przesuwając je, porównywali wysokość dźwięku. Wyniki zapisywali obok długości mierzonej linijką. Muzyk z domu kultury pokazał później podobną zależność na swoim instrumencie. Najbardziej uważnie słuchali ci, którzy wcześniej uważali pomiary za oderwane od praktyki. Przyrząd zostanie w pracowni razem z tabelą, w której pozostawiono miejsce na kolejne próby.",
          "byline": "Dział naukowy"
        },
        "soil-jars": {
          "title": "Ziemia z kilku miejsc",
          "body": "Na szkolny pokaz przyniesiono próbki ziemi z ogrodu, pola i skraju drogi. Każdy słoik miał kartkę z dokładnym miejscem pobrania. Po dodaniu wody uczniowie obserwowali rozdzielające się warstwy. Nie próbowano na tej podstawie oceniać całych gospodarstw. Prowadzący podkreślił, że jeden słoik opisuje mały fragment terenu. Próbki ustawiono obok mapy, na której zaznaczono również miejsca jeszcze nieobejrzane podczas wspólnej wycieczki.",
          "byline": "Dział naukowy"
        },
        "bridge-paper": {
          "title": "Most z jednej kartki",
          "body": "W konkursie szkolnym budowano papierowe mosty między dwiema ławkami. Każdy zespół dostał tyle samo materiału. Największe obciążenie utrzymała kartka złożona w równą harmonijkę. Uczniowie mierzyli ugięcie, zanim dołożyli kolejny ciężarek. Jury poprosiło zwycięzców o powtórzenie próby z nowym arkuszem. Wynik był podobny, choć nie identyczny. Oba zapisano na planszy, razem z uwagą o staranności zagięć wykonanych za drugim razem.",
          "byline": "Dział naukowy"
        },
        "common-key": {
          "title": "Klucz z dużą zawieszką",
          "body": "Klucz do świetlicy na Północy ma drewnianą zawieszkę większą od dłoni. Trudno schować go przypadkiem do własnej kieszeni. Przejmuje go prowadzący zajęcia, wpisując nazwisko i godzinę. Najwięcej nieporozumień powstaje przy spotkaniach kończących się wcześniej. Następna grupa szuka wtedy gospodarza, który zdążył wrócić do mieszkania. Kartka z miejscem zwrotu wisi teraz obok zeszytu. O jej skuteczności świadczy to, że przestano o niej rozmawiać.",
          "byline": "Dział miejski"
        },
        "allotment-path": {
          "title": "Ścieżka między płotami",
          "body": "Działkowcy z podmiejskiego ogrodu rozróżniają wspólne ścieżki po najbliższych drzewach. Dla nowych użytkowników przygotowano prosty plan. Numeracja parceli biegnie inaczej niż droga od bramy, co wcześniej prowadziło gości na drugi koniec terenu. Plan przechowuje gospodarz w altanie. Najczęściej korzystają z niego osoby przywożące narzędzia lub odwiedzające krewnych. Stali bywalcy nadal mówią o zakręcie przy gruszy, nawet gdy wskazują już numer na kartce.",
          "byline": "Dział miejski"
        },
        "neighbour-tools": {
          "title": "Wiertarka w zeszycie",
          "body": "Kilku mieszkańców jednej klatki pożycza sobie narzędzia, zapisując odbiór w zeszycie u gospodarza. Wiertarka wraca z pudełkiem końcówek, młotek zwykle bez żadnego opakowania. Najdłużej ginie miarka, bo łatwo zostawić ją na szafie. Właściciele ustalili, że oddaje się sprzęt bezpośrednio osobie wpisanej w zeszycie. Pozostawianie u kolejnego sąsiada skracało drogę, ale wydłużało poszukiwania. Teraz kartka pokazuje również to, co już wróciło.",
          "byline": "Dział miejski"
        },
        "noticeboard-space": {
          "title": "Kartka ma swój termin",
          "body": "Gospodarz świetlicy zdejmuje z tablicy ogłoszenia po terminie zaznaczonym przez autora. Bez daty kartka zostaje tylko do następnego przeglądu. Mieszkańcy początkowo uważali to za zbędną dokładność. Po kilku tygodniach zaczęli jednak czytać tablicę częściej, bo ubyło zaproszeń na minione spotkania. Osobna koperta przechowuje zdjęte wiadomości. Niekiedy ktoś wraca po adres zapisany na dawnej kartce, więc nie trafiają od razu do makulatury.",
          "byline": "Dział miejski"
        },
        "laundry-roster": {
          "title": "Pralnia z wolnym okienkiem",
          "body": "Po liście mieszkańców uzupełniono zeszyt rezerwacji wspólnej pralni. Obok nazwiska można teraz zaznaczyć, że godzina została zwolniona. Dawniej skreślenie wyglądało jak poprawka i sąsiedzi nie wiedzieli, czy wolno zająć miejsce. Gospodarz domu omówił zapis podczas krótkiego spotkania na klatce. Pierwszy wolny termin wykorzystała lokatorka, która wcześniej czekała cały tydzień. Redakcji przesłała podziękowanie oraz propozycję podobnego zeszytu dla suszarni.",
          "byline": "Dział miejski"
        },
        "club-bookcase": {
          "title": "Regał dla świetlicy",
          "body": "Mieszkańcy Północy przekazali świetlicy regał po przeniesieniu domowej biblioteki. Zanim ustawiono go przy ścianie, zmierzono pudła z grami i albumy używane na zajęciach. Jedną półkę zamocowano wyżej niż pozostałe. Dzieci przygotowały papierowe oznaczenia miejsc, dorośli zapisali zawartość szafki. Regał nie jest nowy, a na boku widać ślad po dawnym kalendarzu. Gospodarz pozostawił go bez zasłaniania; od tej strony mebel stoi przy stoliku kronikarza.",
          "byline": "Dział miejski"
        },
        "bench-painting": {
          "title": "Ławka z odnowionym oparciem",
          "body": "Mieszkańcy podwórza przy Kolejowej odnowili ławkę stojącą między bramą a oficyną. Najpierw rozebrano oparcie i oznaczono kolejność desek. Po ponownym złożeniu starszy lokator zauważył, że jedna została odwrócona. Znał jej lekkie wygięcie z codziennego siedzenia. Poprawiono ustawienie, zanim przykręcono ostatnią śrubę. Do wspólnego zdjęcia usiadły osoby, które zwykle korzystają z ławki, a wykonawcy stanęli z tyłu, z resztą narzędzi.",
          "byline": "Dział miejski"
        },
        "allotment-library": {
          "title": "Poradniki pod wspólnym kluczem",
          "body": "Koło działkowców zebrało poradniki przechowywane dotąd w prywatnych altanach. Spis wykazał kilka powtarzających się tytułów i brak tomu, o który pytano najczęściej. Dublety pozostaną u właścicieli, a pozostałe książki trafiły do wspólnej szafki. Wypożyczenia zapisuje gospodarz. Na pierwszym spotkaniu najwięcej czasu zajęło odczytywanie notatek na marginesach. Właściciele zgodzili się ich nie usuwać, pod warunkiem zachowania informacji, z czyjego egzemplarza korzysta czytelnik.",
          "byline": "Dział miejski"
        },
        "shared-room-hours": {
          "title": "Godziny na jednej kartce",
          "body": "Przedstawiciele osiedlowych kół porównali terminy korzystania ze świetlicy. Nie zmieniano liczby spotkań, lecz dopisano czas potrzebny na przygotowanie stołów i sprzątanie. Dzięki temu grupa plastyczna nie musi kończyć pracy w chwili wejścia szachistów. Nowy wykaz mieści się na jednej kartce. Wisi przy drzwiach i u portiera, w dwóch jednakowych kopiach. Poprzednie różniły się odręcznym dopiskiem, którego część prowadzących nigdy nie widziała.",
          "byline": "Dział miejski"
        },
        "courtyard-chronicle": {
          "title": "Kronika jednego podwórza",
          "body": "Mieszkańcy kamienicy na Stolarskiej przygotowali album swojego podwórza. Zebrali fotografie, wspomnienia o warsztatach i rysunek dawnego układu schodów. Nie udało się ustalić wszystkich dat, więc część opisów pozostawiono otwartą. Album obejrzeli również lokatorzy, którzy wprowadzili się niedawno. Dopisali własną stronę o pierwszym dniu w nowym mieszkaniu. Kronika będzie przechowywana u gospodarza, dostępna do uzupełniania podczas kolejnych sąsiedzkich spotkań.",
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
      note: 'Gra działa tylko na prawdziwym desktopie.',
      noteHelp: 'Wróć na komputerze z klawiaturą i myszą.',
      noteLines: ['Gra działa tylko', 'na prawdziwym', 'desktopie.', '', 'Wróć na komputerze', 'z klawiaturą', 'i myszą.'],
      noteLabel: 'Odręczna notatka z przychodni',
    },
    takeCertificate: 'Weź formularz orzeczenia ze stojaka', reservedForm: 'Miejsce na przyszły formularz — nieaktywne', rackBlank: 'Kartki', rackCertificate: 'Orzeczenia',
    phone: 'Telefon — posłuchaj sygnału centrali', measurements: 'Waga ze wzrostomierzem — zmierz wagę i wzrost',
    takePaper: 'Weź czystą kartkę ze stojaka', takeClip: 'Weź spinacz z pojemnika',
    drawer: 'Szuflada', drawerNames: { drawer: 'Lewa szuflada', 'drawer-2': 'Prawa szuflada' }, trash: 'Kosz na papier',
    drawerEmpty: 'Szuflada jest pusta. Przenieś tu przedmiot, aby go zachować.',
    drawerHelp: 'Odłóż trzymaną kartkę, gazetę, regulamin, spinacz lub banknot do szuflady. Z pustą dłonią otworzysz jej zawartość.',
    drawerViewHelp: 'Okładki dokumentów leżą w kolejności włożenia. Spięty komplet zajmuje jedną pozycję. Najedź kursorem lub wybierz klawiszem Tab, aby odczytać nazwisko. Kliknij lub naciśnij Enter, aby wyjąć akta. Kolejne partie mieszczą dalsze akta. Gazety leżą osobno; najedź lub wybierz, aby zobaczyć datę numeru. Dolna krawędź lub Escape zamyka szufladę.',
    drawerDocuments: 'Akta', drawerCash: 'Gotówka', drawerObjects: 'Inne przedmioty', drawerBatch: 'Część archiwum',
    drawerRetrieve: 'Wyjmij', drawerClose: 'Zamknij szufladę', drawerPrevious: 'Wcześniejsze', drawerNext: 'Późniejsze',
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
      referralInstruction: { initial: 'Kieruje się na badanie wstępne:', periodic: 'Kieruje się na badanie okresowe:' },
      fields: { identity: 'Osoba kierowana', position: 'Stanowisko', work: 'Praca', hazards: 'Narażenia' },
      seal: { employer: ['DZIAŁ KADR', 'EWIDENCJA'], militia: ['MILICJA', 'KADRY'], lot: ['LOT', 'KADRY'], zus: ['ZUS', 'REFERAT ORZECZEŃ'], chamber: ['IZBA', 'LEKARSKA'], clinic: ['LEKARZ', 'MED. PR.'] },
    },
    paperwork: {
      date: 'Data', issued: 'Wystawiono', employerSeal: 'Fioletowa pieczęć działu kadr',
      clinicSeal: 'Pieczęć gabinetu', zusSeal: 'Podłużna niebieska pieczęć ZUS', signed: 'Podpisano odręcznie',
      referral: 'Skierowanie na badania', occupational: 'Medycyna pracy', note: 'Dokumentacja lekarska', blank: 'Czysta kartka',
      employer: 'Pracodawca', name: 'Imię i nazwisko', birthDate: 'Data urodzenia', birthShort: 'Ur.', age: 'Wiek', sex: 'Płeć',
      female: 'K', male: 'M', femaleFull: 'Kobieta', maleFull: 'Mężczyzna', examination: 'Badanie',
      initial: 'wstępne', periodic: 'okresowe', position: 'Stanowisko', managerial: 'Kierownicze', yes: 'tak', no: 'nie',
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
      letters: {
        missingResult: [
          { subject: 'W sprawie załączników', body: 'Przy odbiorze orzeczenia stwierdzono brak wymaganego załącznika. Wzywa się do uzupełnienia akt pracownika o wynik badania dodatkowego.', role: 'Kierownik kadr', signature: 'Witold Krawiec' },
          { subject: 'Doręczenie dokumentacji', body: 'W aktach pracownika odnotowano brak wyniku badania dodatkowego. Prosimy przekazywać wynik razem z orzeczeniem o dopuszczeniu do pracy.', role: 'Referent osobowy', signature: 'Irena Brzozowska' },
          { subject: 'Niekompletna teczka', body: 'Teczka pracownika dopuszczonego do pracy pozostaje niekompletna. Do orzeczenia należy dołączyć wynik właściwego badania dodatkowego.', role: 'Kierownik organizacji pracy', signature: 'Jerzy Łukaszewski' },
          { subject: 'Zastrzeżenia do akt', body: 'Weryfikacja przekazanych dokumentów wykazała brak załącznika. Prosimy o sprawdzenie kompletu akt i doręczenie wyniku badania.', role: 'Pełnomocnik zakładu', signature: 'Barbara Wierzbicka' },
          { subject: 'Uzupełnienie dokumentacji', body: 'Do jednostki wpłynęło orzeczenie bez wymaganego wyniku badania dodatkowego. Prosimy o uzupełnienie dokumentacji pracownika.', role: 'St. inspektor kadr', signature: 'Stefan Płatek' },
          { subject: 'Protokół braków', body: 'Brak wyniku badania dodatkowego wpisano do protokołu odbioru akt. Przy dopuszczeniu do pracy wynik przekazuje się wraz z orzeczeniem.', role: 'Kierownik administracji', signature: 'Halina Orłowska' },
        ],
        zus: [
          { subject: 'Weryfikacja dokumentacji', body: 'Zarządzono ponowną weryfikację orzeczenia. Dokumentację badania należy zachować w aktach gabinetu do czasu zakończenia czynności.', role: 'St. referent rozliczeń', signature: 'Maria Jarosz' },
          { subject: 'Uzupełnienie akt świadczenia', body: 'W toku rozpatrywania wniosku o świadczenie dołączono odpis orzeczenia z gabinetu. Prosimy o potwierdzenie kompletności dokumentacji.', role: 'Inspektor świadczeń', signature: 'Roman Głowacki' },
          { subject: 'Zawiadomienie o przeglądzie', body: 'Postępowanie wymaga ponownego zestawienia dokumentacji medycznej. Odpis orzeczenia włączono do akt sprawy. Prosimy zachować oryginały.', role: 'Referent księgowości', signature: 'Teresa Biel' },
          { subject: 'Nota w sprawie dokumentacji', body: 'Komisja zapoznała się z przekazanymi załącznikami. Dokumentacja pozostaje w toku weryfikacji. Osobne potwierdzenie odbioru nie jest wymagane.', role: 'Sekretarz komisji', signature: 'Henryk Kulesza' },
          { subject: 'Zestawienie akt', body: 'Po przeglądzie akt sporządzono wykaz dokumentów wymagających wyjaśnienia. W dalszej korespondencji należy podawać numer niniejszej sprawy.', role: 'Inspektor rozliczeń', signature: 'Zofia Rudzka' },
          { subject: 'Przekazanie sprawy', body: 'Akta przekazano do właściwego referatu celem dalszego rozpatrzenia. Odpis niniejszego pisma należy zachować w dokumentacji gabinetu.', role: 'Kierownik referatu', signature: 'Adam Wilczyński' },
        ],
        employer: [
          { subject: 'Wszczęcie postępowania', body: 'W związku z przerwą w obsadzie stanowiska wszczęto postępowanie wyjaśniające. Odpis orzeczenia oraz dokumentację badania należy zachować.', role: 'Kierownik kadr', signature: 'Witold Krawiec' },
          { subject: 'Zawiadomienie kadrowe', body: 'Po wykreśleniu pracownika z grafiku przekazano sprawę do działu kadr. Prosimy o potwierdzenie daty i zakresu przeprowadzonego badania.', role: 'Referent osobowy', signature: 'Irena Brzozowska' },
          { subject: 'Wyciąg z ewidencji', body: 'W ewidencji odnotowano godziny nieobsadzonego stanowiska. Odpis skierowania dołączono do dokumentacji. Sprawa oczekuje na wyjaśnienie.', role: 'Kierownik organizacji pracy', signature: 'Jerzy Łukaszewski' },
          { subject: 'Przekazanie dokumentów', body: 'Po konsultacji z kadrami dokumenty przekazano do dalszego rozpatrzenia. Prosimy o zachowanie kompletu akt dotyczących orzeczenia.', role: 'Pełnomocnik zakładu', signature: 'Barbara Wierzbicka' },
          { subject: 'Ustalenia kadrowe', body: 'Zakończono wewnętrzne ustalenia dotyczące ciągłości zatrudnienia. Prosimy o sprawdzenie zgodności danych pracownika z wystawionym orzeczeniem.', role: 'St. inspektor kadr', signature: 'Stefan Płatek' },
          { subject: 'Aktualizacja ewidencji', body: 'Potwierdzamy przyjęcie sprawy do ewidencji. Zestawienie zastępstw dołączono do akt. W dalszej korespondencji prosimy podawać numer sprawy.', role: 'Kierownik administracji', signature: 'Halina Orłowska' },
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
    documentEmpty: 'MIEJSCE NA AKTA', awaitingDocument: 'SKIEROWANIE W PODAJNIKU',
    general: 'Badanie ogólne — zbadaj pacjenta', generalResult: 'Badanie ogólne', generalClear: 'bez uwag', generalConcern: 'stwierdzono nieprawidłowości', leftEye: 'OL', rightEye: 'OP', pressureUnit: 'mmHg', veryHigh: 'bardzo wysokie',
    generalFindings: [
      'szmer nad sercem', 'nierówne tętno', 'świsty nad płucami', 'trzeszczenia u podstaw płuc',
      'obrzęki podudzi', 'drżenie rąk', 'zaburzenia równowagi', 'osłabiony chwyt dłoni',
      'ograniczony ruch barku', 'osłabiona siła lewej nogi', 'zaburzone czucie palców',
      'bolesność prawego podżebrza', 'powiększona wątroba', 'powiększone węzły szyi',
      'duszność przy małym wysiłku', 'sinica warg', 'wyraźna chrypka', 'obrzęk stawu kolanowego',
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
      "hospitalBody": "Stówka została w kieszeni, odmowa u pacjenta. W drodze do domu zostajesz pobity. Budzisz się w szpitalu. Po leczeniu czekają cię badania medycyny pracy. Tym razem po drugiej stronie biurka.",
      "gameOver": "KONIEC GRY",
      "backToMenu": "DO MENU",
      "directives": {
        "additional-tests": {
          "subject": "Badania dodatkowe",
          "body": "Wprowadza się badania: hutnik — audiometria, pilot — błędnik, milicjant — psychiatra, górnik — RTG. Druki pobiera się z trzeciej przegródki. Zakreśla się jedno badanie. Akta zostają. Powrót dziś lub w następny dzień pracy. Wskazania: regulamin.",
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
    newspaper: {
      "title": "Civic Courier",
      "shortTitle": "Courier",
      "classifiedTitle": "Classifieds",
      "telephone": "Tel.",
      "callClassified": "Call about this advertisement",
      "classifieds": {
        "sewing-machine": "Sewing machine for sale. Treadle drive, cabinet included.",
        "sideboard": "Kitchen cupboard for sale. Collect from the third floor.",
        "pram": "Pram, used by one child. Wheels recently replaced.",
        "radio-repair": "Radio repairs undertaken. Please supply your own valves.",
        "piano-lessons": "Piano lessons offered. Beginners welcome.",
        "garage": "Swap garage for one near the tram terminus. Dry, no power.",
        "typewriter": "Typewriter wanted. Missing ribbon is no obstacle.",
        "bicycle-parts": "Bicycle parts for sale. Saddle, luggage rack, two bells.",
        "books": "Swap adventure books for a mushroom guide. Write: Box 18.",
        "jars": "Pickle jars free. No lids. Leave word with the caretaker at Ogrodowa 7.",
        "lost-keys": "Keys with metal tag found. Ask the porter at the Dawn cinema.",
        "allotment": "Swap currant cuttings for gooseberries. Leave word with the allotment caretaker.",
        "knitting-help": "Jumpers knitted with supplied wool. Ask at the haberdasher's on Ogrodowa.",
        "room": "Quiet lodger seeks a room. No instruments. Leave word at the cultural centre desk.",
        "records": "Swap dance records for jazz. Leave word with the instructor on Szkolna.",
        "clock-repair": "Clocks repaired. Please bring the key. Stolarska 4, courtyard entrance.",
        "coal-scuttle": "Tin coal scuttle free. Handle intact. Ask the caretaker at Stolarska 8.",
        "curtain-rods": "Two wooden curtain poles. Leave word at the haberdasher's on Ogrodowa.",
        "children-skates": "Swap children's skates for a larger pair. Leave word at the cultural centre desk.",
        "violin-case": "Violin case for sale. Good lining. Enquire at the music school.",
        "sofa-bed": "Single divan for sale. Bedding storage beneath. Buyer arranges transport.",
        "jam-pots": "Small jam jars free. Collect from the Północ clubroom caretaker.",
        "music-stand": "Music stand wanted, folding welcome. Leave word in the cultural centre rehearsal room.",
        "wool-remnants": "Swap leftover wool for coat buttons. Ask at the haberdasher's on Ogrodowa.",
        "pram-wheels": "Pram wheels free, two sizes. Ask the caretaker at Kolejowa 14.",
        "piano-tuning": "Piano tuning by arrangement. Please state the floor and condition of the instrument.",
        "chess-set": "Wooden chess set, one pawn missing. Swap for draughts. Ask at the Szkolna club.",
        "travel-trunk": "Travel trunk for sale. Two locks, one key. Ask the cobbler beside the market.",
        "plant-pots": "Clay pots for a spider-plant cutting. Leave word at the Północ flower shop.",
        "school-atlas": "School atlas wanted, maps must be legible. Write to Box 22.",
        "handcart": "Two-wheeled handcart for sale. Suitable for carrying crates.",
        "spare-buttons": "Swap uniform buttons for horn buttons. Leave word at the Ogrodowa alterations shop.",
        "found-mittens": "Child's mittens found on a tram. Collect from the porter at the Świt cinema.",
        "bookends": "Bookends wanted. Heavy pair preferred. Enquire at the Kolejowa reading room.",
        "coat-alteration": "Coats shortened, sleeves altered. Supply your own material. Ogrodowa 6, rear building.",
        "mandolin": "Mandolin for sale with case. One string needs replacing.",
        "photo-albums": "Swap photo albums for frames. Leave word with the photographer on Ogrodowa.",
        "folding-stool": "Folding stool wanted for outdoor sketching. Ask the art studio on Szkolna.",
        "wood-offcuts": "Wood offcuts free to model makers. Collect from the workshop at Stolarska 5.",
        "travel-chess": "Pocket chess set found in the waiting room. Ask at the left-luggage office.",
        "electric-iron": "Iron wanted. Heavy model with sound handle preferred. Call evenings.",
        "baking-tins": "Swap two cake tins for a springform tin. Leave word at the bar near the station.",
        "sewing-patterns": "Dress patterns available to trace. Ask after needlework class at the Szkolna club.",
        "record-sleeves": "Record sleeves free. No records. Leave word at the cultural centre porter's desk.",
        "allotment-bench": "Allotment bench wanted. May need painting. Leave word with the gardens' caretaker.",
        "accordion-sale": "Accordion for sale with straps. View after working hours; no hurry.",
        "curtain-sewing": "Curtain hemming. Please bring exact measurements. Kolejowa 11, courtyard entrance.",
        "bicycle-basket": "Swap a cycle basket for a rear carrier. Leave word at the market bicycle repairer.",
        "reading-lamp": "Reading lamp wanted, heavy base preferred. Ask at the Kolejowa reading room.",
        "schoolbag-sale": "Used leather schoolbag free. Buckles intact. Leave word with the caretaker at School 12.",
        "wardrobe-mirror": "Wardrobe with mirror for sale. Dismantles for transport. One knob missing.",
        "knitting-needles": "Swap knitting needles for crochet hooks. Leave a message at the Szkolna club.",
        "old-magazines": "Old technical magazines free. Collect from the cultural centre workshop.",
        "garden-rake": "Swap a rake for a small spade. Ask the allotment caretaker by the gate.",
        "found-scarf": "Checked scarf found after choir practice. Collect at the cultural centre desk.",
        "reel-recorder": "Reel-to-reel recorder for sale with lid and microphone. No tapes included.",
        "copper-kettle": "Swap a whistling kettle for a large pot. Leave word with the caretaker at Ogrodowa 9.",
        "embroidered-cloth": "Embroidered oval tablecloth for sale. Ask at the Ogrodowa alterations shop.",
        "baby-clothes": "Baby clothes free, washed, two bundles. Leave word at the Północ clubroom.",
        "photo-enlarger": "Photographic enlarger wanted. Offers to the photography instructor on Szkolna.",
        "furniture-moving": "Help carrying furniture downstairs. No vehicle. Times by arrangement.",
        "wooden-sled": "Swap wooden sled for a larger one. Leave word with the caretaker at Kolejowa 7.",
        "cookbooks": "Swap a cookery book for a sewing guide. Ask at the library on Kolejowa.",
        "plant-stand": "Metal plant stand for sale, holds three pots. Leave word at the Północ flower shop.",
        "chess-opponent": "Chess opponent wanted. Slow player. Leave word at the Szkolna clubroom.",
        "violin-lessons": "Violin lessons, beginners welcome. Own instrument required.",
        "suitcase-straps": "Luggage straps made from supplied material. Leather repair shop beside the market.",
        "radio-cabinet": "Old radio cabinet free to a model maker. Ask at the Szkolna technical workshop.",
        "children-books": "Swap storybooks for older children's books. Leave word at library Branch No. 6.",
        "wall-map": "Wall map wanted. Small tears acceptable. Write to Box 39.",
        "clock-sale": "Pendulum wall clock for sale with key. Collect in person.",
        "wooden-hangers": "Wooden coat hangers free, assorted sizes. Leave word at the Świt cinema cloakroom.",
        "garden-chair": "Swap wicker chair for a folding one. Ask the allotment caretaker.",
        "ink-bottles": "Empty ink bottles free. Collect from the cultural centre porter.",
        "knitting-books": "Knitting patterns available to copy. Leave word at the haberdasher's on Ogrodowa.",
        "car-seat-covers": "Car seat covers for sale. Please compare seat dimensions before buying.",
        "found-notebook": "Music notebook found at a stop. Collect from the music school porter.",
        "chair-caning": "Chair seats woven after frame inspection. Workshop at Stolarska 3.",
        "postcard-exchange": "Swap city postcards for earlier editions. Collectors' circle at the Szkolna centre.",
        "coffee-grinder": "Hand coffee mill wanted. Drawer may need repair. Leave word at the station bar.",
        "portable-radio": "Portable radio for sale. Leather cover, repaired carrying strap.",
        "table-leaf": "Spare table leaf free. Measurements available from the caretaker at Ogrodowa 4.",
        "glass-vases": "Swap glass vases for pottery ones. Leave word at the Północ flower shop.",
        "children-costumes": "Costumes for school plays available to borrow. Ask the caretaker at School No. 12.",
        "fishing-float": "Swap handmade fishing floats for line. Leave word with the allotment caretaker.",
        "sewing-table": "Sewing-machine table for sale, two drawers. Machine not included.",
        "coat-lining": "Coat lining in exchange for thread. Leave word at the Ogrodowa alterations shop.",
        "record-brush": "Record-cleaning brush wanted. Ask at the cultural centre music club.",
        "seed-boxes": "Seedling boxes free. Collect beside the allotment caretaker's hut.",
        "found-pencilcase": "Initialled pencil case found beside the library. Collect at Branch No. 6.",
        "armchair-pair": "Two armchairs for sale together. Different upholstery, matching frames.",
        "theatre-programmes": "Theatre programme swaps wanted. Leave word at the municipal theatre cloakroom.",
        "travelling-chest": "Wooden toolbox wanted, with fastening lid. Ask at the Stolarska workshop.",
        "wicker-basket": "Swap wicker basket for a smaller one. Leave word with the market basket seller.",
        "needlework-frame": "Embroidery hoop free, screw missing. Collect from the Szkolna needlework club.",
        "room-painting": "Room painting with supplied materials. Date arranged after inspecting walls.",
        "old-spectacle-case": "Spectacle case found in the reading room. Empty. Ask the librarian.",
        "book-binding": "Loose volumes bound. Please bring every page. Bookbinder at Stolarska 6.",
        "school-uniform": "School smock free, collar separate. Leave word with the caretaker at School No. 12.",
        "photo-trays": "Swap photographic trays for print tongs. Ask the photography circle on Szkolna.",
        "folding-bike": "Folding bicycle for sale. Both mudguards, bell needs replacing.",
        "watercolour-box": "Watercolour set wanted, incomplete accepted. Leave word at the Szkolna art studio.",
        "chess-books": "Swap chess books for recorded games. Ask the cultural centre chess club.",
        "curtain-hooks": "Curtain clips free, several types. Ask at the haberdasher's on Ogrodowa.",
        "school-compass": "Compasses found by School No. 12. Describe them to the caretaker to collect.",
        "typing-service": "Manuscripts typed; legible handwriting please. Copies by arrangement.",
        "allotment-watercan": "Swap metal watering can for a lighter one. Leave word with the allotment caretaker.",
        "small-rug": "Narrow runner rug for sale, no fringe. Ask the caretaker at Kolejowa 9.",
        "bottle-crates": "Wooden crates free, contents not included. Collect behind the bar near the station.",
        "language-practice": "Language practice partner wanted, using a textbook. Write to Box 51.",
        "car-roof-rack": "Car roof rack for sale. Please check mounting distances beforehand.",
        "portrait-drawing": "Pencil portraits drawn. Sit at the studio beside the cultural centre.",
        "children-gloves": "Swap children's gloves for a larger pair. Leave word at the Północ clubroom.",
        "tapes-for-records": "Swap blank cassettes for records. Leave word with the Szkolna music instructor.",
        "wooden-toys": "Wooden toys free to a clubroom. Ask at the workshop at Stolarska 5.",
        "desk-sale": "Desk with three drawers for sale. Scratched top, locks have no keys.",
        "reading-help": "Will read books aloud to an older person. Afternoons. Leave word at the Kolejowa library.",
        "chess-clock-ad": "Chess clock wanted, condition negotiable. Ask the Szkolna chess section.",
        "kitchen-stool": "Two kitchen stools free. One needs gluing. Ask the caretaker at Ogrodowa 12.",
        "found-sheet-music": "Accordion music found in the clubroom. Give the title to the caretaker to collect.",
        "carpet-weaving": "Rag runners woven. Please show the material beforehand.",
        "model-paint": "Swap modelling paints for fine brushes. Ask the modelling club on Szkolna.",
        "old-city-photos": "Will help identify old city street photographs. Leave word at the Kolejowa reading room.",
        "hat-box": "Round hatbox free, with lid. Ask the milliner on Ogrodowa.",
        "mending-basket": "Lined sewing basket for sale. Leave word at the haberdasher's.",
        "double-bed": "Double bed for sale without mattress. Wooden frame. Buyer collects.",
        "curtain-remnants": "Curtain remnants free for school projects. Collect at the Ogrodowa alterations shop.",
        "walking-companion": "Company wanted for gentle walks. Leave word at the Północ clubroom.",
        "plant-identification": "Help identifying houseplants. Enquire at the Północ flower shop.",
        "folding-screen": "Folding screen wanted for a small room. Offers to the caretaker at Kolejowa 11.",
        "camera-sale": "Camera with case for sale. New strap. View in daylight.",
        "book-jackets": "Book jackets free to a collector. Leave word at library Branch No. 6.",
        "found-shopping-bag": "Cloth bag left in the station bar. Owner please describe the contents.",
        "thread-spools": "Wooden spools free for crafts. Ask at the Ogrodowa alterations shop.",
        "picture-glass": "Small pieces of picture-frame glass wanted. Leave word at the Stolarska frame shop.",
        "room-to-let": "Room for a quiet person. Shared entrance; kitchen use by arrangement.",
        "poetry-copying": "Poems for recitation copied in clear handwriting. Leave word at the Kolejowa library.",
        "found-brooch": "Brooch found after a readers' meeting. Describe it at library Branch No. 6.",
        "school-desk-ad": "Swap a small desk for shelves. Leave word with the Północ clubroom caretaker.",
        "empty-tins": "Empty tea tins free for buttons or odds and ends. Collect at the Szkolna clubroom.",
        "sheet-music-copy": "Waltz and polka scores available to copy. Leave word with the cultural centre instructor.",
        "picture-hook": "Swap picture hooks for small hinges. Ask at the workshop on Stolarska.",
        "borrowed-ladder": "Whoever borrowed the ladder from Ogrodowa 8, please return it. Leave word with the caretaker.",
        "wooden-puzzle": "Wooden puzzle free, all pieces counted. Leave word at the Północ clubroom.",
        "sewing-foot": "Presser foot for old sewing machine wanted. Sample at the Ogrodowa alterations shop.",
        "family-album-help": "Help organising family albums, pencil captions. Leave word at the Kolejowa reading room.",
        "chess-pieces": "Odd chessmen free: two white rooks, one black knight. Ask at the Szkolna club.",
        "found-keyring": "Keys on a ring found beside the market. Describe them to the market caretaker to collect.",
        "carpentry-help": "Shelves fitted to alcoves. Bring a sketch. Workshop at Stolarska 5.",
        "potted-geranium": "Swap a geranium for a shade plant. Leave word at the Północ flower shop.",
        "choir-singers": "Amateur choir seeks low voices. Music supplied on loan. Apply at the Szkolna cultural centre.",
        "wooden-cradle": "Wooden cradle free for theatre scenery. Leave word with the theatre porter.",
        "found-beret": "Navy beret left at the Świt cinema cloakroom. Initials beneath lining. Collect there.",
        "recipe-swap": "Simple cake recipes to swap. Leave word with the Północ clubroom hostess.",
        "old-calendar": "Collecting old wall calendars, loose pages welcome. Ask at the Kolejowa reading room.",
        "portrait-frame": "Oval frame wanted for family photograph. Measurements at the frame shop on Stolarska.",
        "fabric-samples": "Fabric samples free for collage. Collect from the alterations shop on Ogrodowa.",
        "window-box": "Swap a window box for two plant pots. Leave word with the allotment caretaker.",
        "borrowed-book": "Borrower of an atlas, please get in touch. Owner's message at library Branch No. 6.",
        "umbrella-handle": "Curved wooden umbrella handle wanted. Ask the umbrella repairer beside the market.",
        "lesson-notes": "Drafting-course notes available to borrow. Leave word at the Szkolna cultural centre desk.",
        "clothes-pegs": "Swap wooden clothes pegs for hangers. Ask the attendant at the Północ laundry.",
        "found-wristwatch": "Watch found at the allotment gate. Owner please describe it to the caretaker.",
        "model-cardboard": "Thick card free to model makers. Uneven sheets. Collect from the Stolarska bookbinder.",
        "weaving-shuttle": "Weaving shuttle wanted, used welcome. Leave word at the workshop on Szkolna.",
        "walking-maps": "Local walking maps available to borrow. Leave word with the cultural centre walking club."
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
          "body": "At municipal library branch No. 6 on Kolejowa Street, 43 readers are waiting for its most popular novel. There is one copy; a second came back with several pages missing. Librarian Janina Wolska shows us her reservations book. Those who can only visit after the late shift wait longest. The branch exchanges books with libraries on the outskirts, but the same titles are wanted there too. Each loan will count towards the annual circulation figure. Mrs Wolska’s notebook records the other side of that statistic.",
          "byline": "Ewa Lis - City desk"
        },
        "choir": {
          "title": "Rehearsal after the shift",
          "body": "The railway workers’ choir rehearses above the canteen. Its forty singers work different rosters, so the conductor never hears the whole ensemble at a rehearsal. He practises the bass parts separately with men coming off night duty. A clerk copies the scores using carbon paper; two folders hold the shared songbook. Folk songs and pre-war pieces make up the repertoire. The choir performs throughout the province. Its leader says gathering everyone at the station takes more arranging than learning a new song.",
          "byline": "Marek Boruta - Culture"
        },
        "film-club": {
          "title": "Beyond the cinema bill",
          "body": "At the Świt cinema’s film society, discussions usually outlast the screening. Students, teachers and regulars known by name to the usher fill the seats. The society books older films absent from the ordinary programme. A single print travels between several cities, so bookings take months to arrange. The host invites written questions. Most concern the characters’ manners and everyday lives. By the time discussion reaches the director’s technique, the subject listed in the lecture notes, rather fewer viewers remain.",
          "byline": "Marek Boruta - Culture"
        },
        "theatre": {
          "title": "A costume’s second life",
          "body": "In the municipal theatre’s workshop, dresses hang by historical period, not by production. A costume from ten seasons ago returns to the stage with new sleeves and collar. Seamstress Helena Mazur keeps labelled boxes of fabric scraps, matching patches that will disappear from the audience’s view. New cloth goes chiefly to the leading roles; the rest of the cast draws on the store. Before a premiere, the most work goes into ordinary frock coats rather than splendid gowns. Each must fit its next actor as convincingly as the last.",
          "byline": "Ewa Lis - Backstage"
        },
        "chess": {
          "title": "Railway juniors deliver",
          "body": "The railway chess team beat the builders 5:3 in the latest city league round. Junior players on the lower boards settled the match. The winning captain credits the school section: younger players have regular lessons, while the adults fit practice around shift rosters. Matches take place in workplace recreation rooms, with free admission. Spectators follow the moves on a display board. The league has no hall of its own, but hosts in several districts keep the fixtures running regularly. Its youngest players are now earning places in the senior teams.",
          "byline": "Jan Rudzki - Sport"
        },
        "table-tennis": {
          "title": "Tables after lessons",
          "body": "The cooperative team beat the postal workers 6:4 in the city table tennis league. They played in the gym of School No. 12, lent to clubs after lessons. Players set out the tables and bench barriers themselves, then cleared the floor for morning exercises. The winning coach singled out his younger doubles pair. The section accepts school pupils but has only two practice evenings a week, shared between juniors and adults. For some players coming from the outskirts, the journey takes longer than the session. Keeping a regular team requires more than a good forehand.",
          "byline": "Jan Rudzki - Sport"
        },
        "stamps": {
          "title": "A city on an envelope",
          "body": "At the Szkolna Street cultural centre’s stamp circle, collectors increasingly examine whole envelopes rather than loose stamps. Postmarks from former postal branches trace the growth of the suburbs. Antoni Witek collects letters addressed to streets that have changed names. Most came from family papers; others were exchanged with fellow members. He asks residents to look through old correspondence before sending paper for recycling. A stamp cut from its envelope loses part of the story preserved by the address, date and marks on the back.",
          "byline": "Ewa Lis - Hobbies"
        },
        "cassette": {
          "title": "A concert from the radio",
          "body": "Letters to our technical desk keep asking how to record a broadcast without the family’s conversation. In many flats, a microphone beside the radio picks up both. An instructor at the cultural centre demonstrates a connection through the sockets on the two machines. Not every receiver has them, and the right lead may take visits to several shops to find. Participants bring their own equipment and manuals. They also exchange broadcast lists: with only a few cassettes available, it pays to know what is already recorded on side two.",
          "byline": "Technical desk"
        },
        "knitting": {
          "title": "Wool for another winter",
          "body": "At a haberdashery on Ogrodowa Street, customers compare wool samples brought from home. Often they need just one ball, but in exactly the same shade. The assistant suggests replacing the whole collar or both cuffs instead. At an estate club, women unravel old jumpers and combine the recovered wool in stripes. Patterns circulate in notebooks, copied from borrowed magazines. Not everything can be saved: the most worn sections are discarded. A sound adult jumper can nevertheless provide enough wool for a child’s waistcoat.",
          "byline": "Anna Wrona - Home and family"
        },
        "darning": {
          "title": "The everyday tailor",
          "body": "The tailoring counter in the Ogrodowa shopping arcade has two machines and a book full of orders. It makes no bespoke suits: trousers are shortened, linings replaced and oversized coats fitted. Master tailor Stanisław Bury spends longest on clothes handed down within families. Each must be unpicked to see how much spare cloth remains. The price list reduces this work to a few entries, although two similar coats can require quite different alterations. Customers chiefly ask when the work will be ready. They often need the garment they have just left behind.",
          "byline": "Ewa Lis - Local services"
        },
        "plants": {
          "title": "A garden on the sill",
          "body": "At a flower shop on the Północ housing estate, most questions concern flats rather than gardens. Customers describe narrow sills, dry rooms and windows facing the next block. Florist Zofia Kurek suggests first measuring how much space can really be spared for pots. A fine specimen from the window display may not fit. Spider plant and geranium cuttings circulate among neighbours; the shop supplies soil and saucers. The longest consultations concern plants received as gifts. Their owners can describe every leaf, but nobody remembers the name.",
          "byline": "Anna Wrona - Home and family"
        },
        "bread": {
          "title": "Lunch from the chalkboard",
          "body": "The milk bar near the station writes its menu in chalk. Before the first travellers arrive, the kitchen is serving breakfast to staff from nearby shops. The manager says regulars chiefly want a known price and a meal without a long wait. Alongside dumplings and noodles, there is a simple soup each day. Yesterday’s bread becomes croutons, and delivery orders follow the week’s takings. Market days are hardest to predict. Then the tables bring together shop workers, commuters and people arriving from the surrounding villages.",
          "byline": "Anna Wrona - Trade"
        },
        "station-clock": {
          "title": "A city on two tickets",
          "body": "Before seven, the station waiting room fills with commuters from across the province. Many still face a tram journey after leaving the train. Beside their packed breakfast they carry two monthly season tickets. Teresa, a bookkeeper, knows the timetable by heart, but plans her return around collecting her child from nursery. Moving an office meeting by half an hour can mean an hour waiting on the platform. The city’s statistics count her as an office worker. A considerable part of her working day is nevertheless governed by the railway clock.",
          "byline": "Ewa Lis - City and region"
        },
        "lost-scarf": {
          "title": "The unclaimed storeroom",
          "body": "Staff at the city lost property office are sorting items delivered by tram depots. Umbrellas, gloves and bags of small purchases form the largest piles. Owners come promptly for documents; clothing can wait for months. Each object receives a number and a record of where it was found. A clerk explains that a scarf’s colour rarely settles a claim: several similar ones usually share the shelf. Giving the route and approximate journey time helps locate the right entry in the ledger. The office’s busiest shelves hold the least distinctive possessions.",
          "byline": "City desk"
        },
        "handwriting": {
          "title": "Inside the exercise book",
          "body": "At School No. 12 in the city centre, teachers compared first-year pupils’ books from the start of term with work written several weeks later. They considered speed as well as letter shapes. The class teacher explains that a careful child can fall far behind a dictated sentence. Parents ask for extra practice sheets, which the school duplicates for several classes together. Some children use fountain pens passed down by older siblings. A suitable nib and a steady hand prove more useful than the decorated covers sold for exercise books.",
          "byline": "Anna Wrona - Education"
        },
        "aquarium": {
          "title": "An aquarium for the club",
          "body": "Members of the city aquarium circle brought jars of plant cuttings and observation books to their meeting. They compared small tanks suited to cramped flats. The recreation room’s display tank came from donations: a craftsman supplied the glass, one member the lamp, and others the plants. Pupils and pensioners share its care. The instructor says learning that regular duty comes first. Bringing home a striking fish from a collectors’ fair is easy; arranging someone to care for the tank during a holiday takes more thought.",
          "byline": "Marek Boruta - Hobbies"
        },
        "bookbinding": {
          "title": "A year between boards",
          "body": "A bookbinder on Stolarska Street binds annual volumes for reading rooms and private collectors. Technical magazines, newspapers and sewing journals cover his bench. Before making a cover, he checks issue numbers and supplements. Clipped advice columns cause most trouble: an owner remembers a complete year, but half a page is missing inside. The binder keeps the original covers and indexes. A good binding, he explains, should help its reader find a needed article, as well as make the volumes stand neatly on a shelf.",
          "byline": "Ewa Lis - Crafts"
        },
        "starlight": {
          "title": "Stars above the rooftops",
          "body": "At the city astronomy circle, the first instrument is a sky chart rather than a telescope. The instructor teaches members to find a few bright stars before setting up the larger instrument. Lights and narrow courtyards restrict the view in the centre; for clearer skies, the group travels beyond the last buildings. Pupils attend alongside adults bringing binoculars long unused at home. Waiting together for a break in the clouds takes the most patience. The circle’s notebook records the weather beside its drawings of the sky.",
          "byline": "Marek Boruta - Science"
        },
        "noticeboard": {
          "title": "Whose turn to dry?",
          "body": "A resident of the Północ housing estate writes about the communal drying room. Its rules are on the noticeboard, but nothing says who keeps the key or records bookings. The housing cooperative’s reply refers her to the caretaker. He has a reservations book that some new tenants never knew existed. The block committee says the details will be posted beside the rules. Our reader was not asking for new equipment, only access to a room included in her rent. A clear notice was enough to resolve a surprisingly lengthy correspondence.",
          "byline": "Letters to the editor"
        },
        "bicycle": {
          "title": "Room for a bicycle",
          "body": "In a sports shop, a bicycle can be admired from every side. At home, it still needs somewhere to stand. Readers on new estates describe narrow cellars and stairs without ramps. A caretaker shows us a shared cycle room also holding prams, sledges and camping gear. Tenants have marked out spaces themselves so the back wall remains accessible. For many residents, a bicycle is transport to an allotment or a workplace on the outskirts. Its usefulness depends first on being able to get it out of the building each morning.",
          "byline": "City desk"
        },
        "prompter": {
          "title": "A voice below the stage",
          "body": "The municipal theatre's prompter keeps her script in an old music folder. Pencil marks show where actors most often lose their lines. A new cast means rubbing out some marks and adding others. Someone in the front row may hear a whisper without knowing its source. After the performance, actors also ask Irena about the pace of their scenes. From her cramped position she watches a version of the play the audience never sees.",
          "byline": "Marek Boruta - Culture"
        },
        "cinema-booth": {
          "title": "The window above",
          "body": "Separate stairs lead to the projection booth at the Świt cinema. The operator checks the film before the house lights go down. Metal tins carry labels from previous cinemas and notes about splices. During the screening he watches through a small window, although he knows the story chiefly as a sequence of reels. The usher recognises the closing music and prepares the doors. As the last viewer leaves, upstairs the story is being wound back into its tins.",
          "byline": "Marek Boruta - Culture"
        },
        "score-library": {
          "title": "Music on loan",
          "body": "The orchestra's library occupies cupboards at the end of a corridor. Each music stand receives a separate part, so after a concert the librarian counts parts rather than works. Pages carry notes left by musicians years ago. Some help their successors; others need explaining at rehearsal. Music borrowed for a substitute takes longest to recover. The player returns to their own ensemble, while a thin folder may make a considerably longer journey.",
          "byline": "Marek Boruta - Culture"
        },
        "poster-lettering": {
          "title": "Letters by brush",
          "body": "The cultural centre's poster artist begins by measuring the performer's name. A short one fits above the title; a long one changes the arrangement of the lines. He paints on paper spread across two tables. Old invitations serve as lids for the paint jars. Passers-by study the finished poster for seconds, yet spot a wrong starting time immediately. The final check therefore belongs to the porter who will be admitting the audience.",
          "byline": "Marek Boruta - Culture"
        },
        "puppet-tour": {
          "title": "A stage in two cases",
          "body": "The puppet company has returned from a tour of suburban clubrooms. Scenery and characters travelled in two suitcases, the screen separately. In one hall the stage stood between a stove and a table-tennis table. Afterwards children wanted to see the actors' hands and know who had voiced the dog. The director wrote the hosts' comments on the back of the itinerary. Before another tour, the screen needs shorter legs: the smallest viewers mostly saw its curtain.",
          "byline": "Marek Boruta - Culture"
        },
        "accordion-duet": {
          "title": "Two accordions",
          "body": "An amateur music review has commended a duo from the railway workshops for their arrangements of dance tunes. Both players learned by ear; a teacher from Szkolna Street wrote out the music. They rehearsed in one performer's flat with permission from the neighbours below. Ending a piece together proved hardest. A discreet nod settled the matter on stage. Their certificate now hangs in the works clubroom, while the accordions have gone home.",
          "byline": "Marek Boruta - Culture"
        },
        "matinee-survey": {
          "title": "Who comes to matinees",
          "body": "The Świt cinema has collected comments from adults accompanying children to matinees. Most concerned starting times rather than films. Parents from the outskirts asked for bus connections to be considered; central residents wanted an earlier finish. Management is comparing the replies with attendance. The usher added a point of her own: groups of children need longer in the cloakroom. Until now the programme chart had no space for that.",
          "byline": "Marek Boruta - Culture"
        },
        "dance-shoes": {
          "title": "Room for a waltz",
          "body": "Dance pupils at Szkolna Street have performed for their families. The front row was occupied by those who had minded children during the lessons. Their instructor combined a waltz with simple dances useful at family gatherings. One couple had practised in a kitchen between the table and the stove. In the larger hall they had to learn to travel farther. After the demonstration, chairs were moved aside and the audience joined in.",
          "byline": "Marek Boruta - Culture"
        },
        "recitation-finals": {
          "title": "A poem without a mike",
          "body": "Eleven pupils reached the recitation final. The judges asked for the last round to take place without a microphone in a smaller room. Clear sentence endings suddenly mattered more than a loud opening. The winning pupil from School No. 12 said she had practised for her grandmother across their sitting room. Her prize was a poetry volume and an invitation to the theatre studio. She immediately handed the book to her grandmother to hold.",
          "byline": "Marek Boruta - Culture"
        },
        "folk-recording": {
          "title": "Voices from nearby",
          "body": "The museum's regional collection has received a recording of songs from a village outside the city. A singer's grandson operated the recorder. Between verses are questions about words and the ticking of a clock. Staff will keep these passages too, as they show how the women remembered tunes together. A notebook lists the participants. Several songs still lack titles: at home everyone recognised them by their opening line.",
          "byline": "Marek Boruta - Culture"
        },
        "reading-room": {
          "title": "Papers on wooden rods",
          "body": "The reading room on Kolejowa Street mounts current newspapers on wooden holders. Readers need not spread a whole sheet over the next chair. One regular begins with sport, another with advertisements. The librarian straightens folded corners that can hide the end of a report. In the evening she files issues by date. Someone seeking an old item a week later usually remembers its position on the page better than the publication day.",
          "byline": "Marek Boruta - Culture"
        },
        "portrait-studio": {
          "title": "Before the lens",
          "body": "The photographer on Ogrodowa Street keeps a stool for young customers and a cushion for smaller ones. A family portrait begins by deciding who is blocking whom. A jacket can be straightened, but a child staring at the door needs more than an instruction. The assistant helps with a coloured scarf. Finished prints go into drawers by order number. At home, customers add names to the back, often after lengthy discussion about their order.",
          "byline": "Marek Boruta - Culture"
        },
        "museum-labels": {
          "title": "The label in the case",
          "body": "A museum label starts with more notes than would fit in the display case itself. The curator chooses a name, an origin and one sentence of explanation. If the donor knows only a family nickname for an object, old catalogues must be consulted. Visitors rarely stop for a long description. Staff test labels by standing on the other side of the glass. Only then can they see how much small print disappears in the window's reflection.",
          "byline": "Marek Boruta - Culture"
        },
        "book-cart": {
          "title": "A library on wheels",
          "body": "A library trolley visits the boarding-school corridor on the same weekday. Its books are chosen from requests left with the supervisor. Not every request can be met, so the librarian adds suggestions of her own. Returned volumes often contain bookmarks made from exercise-book paper. Pupils are asked to remove them, but one slip was kept: a careful list of books its owner hoped to read before leaving school.",
          "byline": "Marek Boruta - Culture"
        },
        "photo-exhibition": {
          "title": "Courtyards on display",
          "body": "The estate photography club has exhibited pictures of courtyards. Its members passed over main streets for carpet-beating frames, workshop gates and shared wells. A staircase recognised by its handrail drew the largest crowd. The caption gave no house number, and visitors wrote three different addresses in the comments book. The club plans to give the prints to the library, with corrected descriptions agreed with residents of the buildings.",
          "byline": "Marek Boruta - Culture"
        },
        "poetry-evening": {
          "title": "The poet's small table",
          "body": "Fewer people attended the poetry evening at Branch No. 6 than had signed up, but they stayed longer than expected. Questions after the reading mostly concerned revisions. The poet showed a page covered in crossings-out. One reader noticed that the strongest line had begun in the margin. The librarian obtained permission to display a copy of the draft beside books that now look entirely finished.",
          "byline": "Marek Boruta - Culture"
        },
        "museum-donation": {
          "title": "An album without names",
          "body": "The museum has received a works photographer's album. Excursions, anniversaries and teams pose beneath the same wall. Only some prints have dates. Former employees identified several faces at a first meeting but disagreed over the order of the trips. Pennants in the background helped. The curator is recording uncertainties as well as names. The album will remain available for further comments before its final catalogue card is prepared.",
          "byline": "Marek Boruta - Culture"
        },
        "radio-play": {
          "title": "Footsteps from a box",
          "body": "A cultural-centre demonstration showed how radio plays are made. The instructor brought a box of gravel, a door with a handle and a sheet of metal. Pupils listened with closed eyes before inspecting the sources of the sounds. Hesitant footsteps proved hardest to reproduce: slowing down was not enough. A short station scene concluded the session. The train announcement was voiced by the caretaker, whose clear diction won general praise.",
          "byline": "Marek Boruta - Culture"
        },
        "poster-collection": {
          "title": "Old cinema programmes",
          "body": "A reader has brought the newspaper years of programmes from the Świt cinema. He kept them in a shoebox, marking the films he saw. Their backs contain sums and match results. A museum employee selected some for the city's everyday-life collection. They also record changing prices and screening times. The owner asked for one programme back: between the titles he had written where to meet the woman he later married.",
          "byline": "Marek Boruta - Culture"
        },
        "book-display": {
          "title": "Books from the back shelf",
          "body": "Librarians on Kolejowa Street have displayed novels nobody had requested for some time. Instead of critics' judgements they added brief comments from former readers. One recalled a train journey during which the reader forgot to get off. Most displayed volumes were borrowed within a week. The book without a comment remained. A librarian has taken it home to prepare a caption as honest as the others.",
          "byline": "Marek Boruta - Culture"
        },
        "umbrella-ribs": {
          "title": "Under one canopy",
          "body": "The umbrella repairer beside the market sorts ribs by length and handles by their fittings. Fabric colour comes last. Customers usually bring umbrellas lent to several people, none of whom recalls when the frame bent. The craftsman opens each one slowly and marks the damage with chalk. Sometimes a replacement handle changes its appearance so much that the collection ticket is needed to convince the owner it is theirs.",
          "byline": "Ewa Lis - Crafts"
        },
        "shoe-lasts": {
          "title": "A shoe on its last",
          "body": "At the cobbler's, wooden lasts stand in pairs above the window. Some bear regular customers' names in pencil. The cobbler begins with the old sole: its wear tells him much about the owner's walk. A request for a quick repair often becomes a discussion about the other shoe. Customers bring only the damaged one, though a new heel must match both. An empty space on the shelf does not always mean less work.",
          "byline": "Ewa Lis - Crafts"
        },
        "brush-maker": {
          "title": "Bristles in a row",
          "body": "The brush maker selects bristles for the work the finished article must do. Painters and bakery workers need different kinds. Wooden stocks arrive in batches, but each requires inspection. Samples ordered by nearby workplaces lie on the bench. The oldest brush is kept for comparing density. Its wear is so familiar to the master that an apprentice must learn which features belong to the design and which to years of use.",
          "byline": "Ewa Lis - Crafts"
        },
        "frame-shop": {
          "title": "A frame for a memory",
          "body": "Certificates, photographs and pictures cut from magazines arrive for framing. The craftsman on Stolarska Street shows moulding samples in daylight; a bulb changes their shade. Customers bring measurements of their walls more often than of their pictures. Old photographs require care with the border, lest a hand or a piece of uniform disappear beneath it. Finished frames are wrapped in paper bearing the outline of a corner.",
          "byline": "Ewa Lis - Crafts"
        },
        "upholstery-course": {
          "title": "A chair on the bench",
          "body": "Upholstery pupils have restored a set of clubroom chairs. Beneath the top fabric they found two older coverings and exercise-book paper used to level a seat. Their instructor required a record of the layers before dismantling. The best-preserved chair served as a model. On collection, the clubroom caretaker sat on every chair in turn. Only then did he notice a difference the careful photographs had failed to show.",
          "byline": "Ewa Lis - Crafts"
        },
        "engraver-cup": {
          "title": "Room for a surname",
          "body": "The engraver finishing the works league trophy received a corrected list of winners. One surname was longer than the design allowed. The whole inscription had to be rearranged on a paper band. Organisers collected it in time, although they had allowed less time for engraving than for choosing the cup. The craftsman kept both drafts for his apprentices. The polished metal shows none of the measuring that took most of the work.",
          "byline": "Ewa Lis - Crafts"
        },
        "ceramic-glaze": {
          "title": "Colour after firing",
          "body": "The cultural centre's pottery class has displayed its first set of vessels. The mugs have different handles but share a mark underneath. Glaze colours caused most surprise: after firing they looked unlike the colours brushed on. The instructor placed before-and-after samples alongside them. One pupil kept a crooked mug instead of a straighter one. Its handle tells him exactly where he tried three times to improve it.",
          "byline": "Ewa Lis - Crafts"
        },
        "joinery-drawer": {
          "title": "A drawer made to fit",
          "body": "A joinery workshop has repaired a library cabinet with a missing drawer. No drawing survived, so an apprentice measured the adjoining ones. They proved unequal. The old cabinet had been fitted by hand; numbers on the backs showed where each drawer belonged. The replacement now carries its own number and a date underneath. Readers will see only an even front, while the librarian can separate reservation cards again.",
          "byline": "Ewa Lis - Crafts"
        },
        "weaving-sample": {
          "title": "A pattern in thread",
          "body": "The weaving circle on Szkolna Street has made a sampler for beginners. Each small piece records thread counts and weave. Leftover yarn means identical patterns appear in different colours. At the demonstration, visitors touched the fabrics more often than they read the notes. The instructor therefore added a separate handling set. The carefully finished original will stay beside the loom for future lessons.",
          "byline": "Ewa Lis - Crafts"
        },
        "locksmith-apprentice": {
          "title": "A key with a name",
          "body": "A locksmith's apprentice has passed a test making a key for a cabinet lock. He received the mechanism without an existing key to copy. His master judged whether he could explain each adjustment rather than how quickly he worked. The finished key turned freely, though its bow remained uneven. It will stay in the workshop with its maker's name and date, showing the next intake where their colleague at the window began.",
          "byline": "Ewa Lis - Crafts"
        },
        "book-gilding": {
          "title": "Letters on the spine",
          "body": "The bookbinder on Stolarska Street keeps stamping type in shallow drawers. The letter most often missing is one repeated in a long title. Before binding a volume, he arranges its inscription on paper and checks it with the owner. An abbreviation should still make sense years later. Customers content with an author's initials today may forget their meaning. On his own books, the binder therefore keeps longer titles than his clients request.",
          "byline": "Ewa Lis - Crafts"
        },
        "scissors-grinder": {
          "title": "Blade and hinge",
          "body": "Dressmaking shears and small household scissors arrive at the grinder's. Owners ask for sharper points, though a loose joint may be the real trouble. The craftsman tests each tool on fabric; paper will not reveal every fault. His drawer holds samples from thin lining to heavy felt. Seamstresses collecting their scissors sometimes bring a scrap of their own, exactly like the material waiting beside their machine.",
          "byline": "Ewa Lis - Crafts"
        },
        "basket-work": {
          "title": "Baskets for the market",
          "body": "A basket maker outside the city sorts his work by use rather than size. Potato baskets face different treatment from bread baskets. Handles are fitted to the customer's hand. Regulars bring old baskets for new bases and recognise them by the weaving around the rim. There is no notebook of these marks. The maker says his hand changes with time, allowing him to date his own work without a receipt.",
          "byline": "Ewa Lis - Crafts"
        },
        "watch-parts": {
          "title": "A small paper envelope",
          "body": "A watchmaker puts each watch's parts in a separate paper envelope, marked with the owner's name and a description of the dial. Customers tend to remember the strap colour rather than the movement. On collection they ask whether it will run as before. He asks them to compare it with the same clock for several days. Different clocks along the route to work can make even a sound repair appear inaccurate.",
          "byline": "Ewa Lis - Crafts"
        },
        "leather-satchel": {
          "title": "A schoolbag handed down",
          "body": "Leatherwork pupils have restored schoolbags supplied by parents, replacing buckles, handles and worn straps. Beneath one flap they found a timetable from nine years ago. With the owner's permission, the teacher left it in place. Her younger son will use the bag with a different set of textbooks. The workshop recorded the materials used and noted that after cleaning, the leather proved in better condition than the stitching.",
          "byline": "Ewa Lis - Crafts"
        },
        "plaster-mould": {
          "title": "A copy of a small leaf",
          "body": "A plaster workshop has finished reproducing a missing stairwell ornament from a leaf preserved one floor above. An apprentice made several casts before finding a thickness that could be removed safely from the mould. Residents inspected the samples on collection. Up close, they could finally distinguish the original ornament from its accumulated paint. One unsuccessful cast remains in the workshop as a teaching aid.",
          "byline": "Ewa Lis - Crafts"
        },
        "hat-block": {
          "title": "Hats in shape again",
          "body": "A milliner on Ogrodowa Street has reshaped hats for an amateur theatre company. Their sizes differed, although the costume list described them as identical. Actors came after rehearsal to try them on and sign paper bands. One hat needed only a ribbon; two required longer on the block. The company manager corrected his list, adding that each costume should be issued together with its performer's name.",
          "byline": "Ewa Lis - Crafts"
        },
        "metal-signs": {
          "title": "A number from the gate",
          "body": "A metal workshop has made door numbers for a courtyard off Stolarska Street. Residents had relied on descriptions of stairs and door colours. The lettering was chosen by reading it from the gate rather than from a drawing on a table. The postman requested another sign on the rear building. The caretaker has kept the old directions for visitors who know the courtyard well and have never asked about a number.",
          "byline": "Ewa Lis - Crafts"
        },
        "pottery-jug": {
          "title": "A jug from a drawing",
          "body": "A school workshop has received a jug made to a pupil's design. Its broad handle was reduced after the first trial. Assessment included pouring into a small cup as well as appearance. A trickle on the cloth prompted another change to the spout. Both earlier models were displayed beside the finished jug. Visitors spent longest with the middle one, where the search for the final shape was most visible.",
          "byline": "Ewa Lis - Crafts"
        },
        "carving-letters": {
          "title": "A cover for the chronicle",
          "body": "The carving circle has made a wooden cover for the cultural centre's chronicle. Each member cut part of the border, but one person did the inscription to keep the lettering consistent. A narrow gap appeared during assembly. The instructor required the adjoining pieces to be fitted again rather than covered over. The finished cover is heavier, so the keeper has moved the volume to a lower shelf for easier handling.",
          "byline": "Ewa Lis - Crafts"
        },
        "club-kit": {
          "title": "Shirts by number",
          "body": "The sports club's kit keeper knows players by their shirt numbers too. After washing, he packs sets that must stay together until departure. Younger players inherit older teams' strips, though sleeves do not always match ambitions. A cooperative seamstress makes adjustments. Needle and thread also travel in the match bag. The results table has no entry for whoever sewed a missing tracksuit button back on while sitting on the bench.",
          "byline": "Jan Rudzki - Sport"
        },
        "referee-notebook": {
          "title": "Whistle and notebook",
          "body": "A works-league referee carries two pencils. One goes to the captain signing the report; the other stays with him on the pitch. Reserve players' surnames require most explanation, since teammates mostly know their nicknames. Before play, he reads the list aloud. Afterwards the report must make sense to people who never saw the match. Clear handwriting can therefore be as useful as recognising a foul quickly.",
          "byline": "Jan Rudzki - Sport"
        },
        "pool-lanes": {
          "title": "A lane for everyone",
          "body": "At the swimming pool, the instructor groups people by ability rather than age. An adult learning to breathe in water may be less confident than a child after a few lessons. The pool clock times exercises but cannot replace observation. Regular swimmers recognise one another by caps and session times. Conversation waits for the changing room. In the water, a brief gesture leaves space for someone coming the other way.",
          "byline": "Jan Rudzki - Sport"
        },
        "running-log": {
          "title": "Miles in a notebook",
          "body": "Members of a recreational running club record routes in an ordinary notebook, adding notes on surfaces and return times. Their coach asks them not to compare distance alone: a park route differs from laps of a pitch. The oldest member marks rest days too. Younger runners initially left those squares empty. Now they fill them just as carefully, since only a complete week shows the actual rhythm of their training.",
          "byline": "Jan Rudzki - Sport"
        },
        "volleyball-shift": {
          "title": "Volleyball after work",
          "body": "The postal team beat the printers in five sets after a late start: some visitors were finishing their shift. The hosts lent them spare shirts and shortened their own warm-up. Only the keenest spectators remained for the final set. Both teams then took down the net together. The printers' captain added a note to the report asking for work shifts to be considered when the next schedule is drawn up.",
          "byline": "Jan Rudzki - Sport"
        },
        "cross-country": {
          "title": "The finish by the gate",
          "body": "Teams from nine schools entered the cross-country race through the park, finishing beside the old gate. Teachers stood at junctions to prevent wrong turns. The winner admitted knowing the final stretch from daily walks. School No. 12 took the team honours, with every runner finishing. Results were posted beside the changing room, next to a cap somebody had left behind.",
          "byline": "Jan Rudzki - Sport"
        },
        "boxing-score": {
          "title": "Points for the juniors",
          "body": "The railway club's young boxers drew their friendly match. Their coach praised steady footwork but criticised hurried endings to rounds. Spectators applauded exchanges the judges assessed more cautiously. Afterwards the scoring was explained to younger supporters, with the boxers listening too. For two of them it was a first appearance outside the training room and their first sight of their own names on a poster.",
          "byline": "Jan Rudzki - Sport"
        },
        "handball-goalkeeper": {
          "title": "The reserve goalkeeper",
          "body": "The cooperative handball team won by two goals after its reserve goalkeeper came on at half-time and saved several close shots. Afterwards he spoke mostly about the teammate reminding him of his position from the bench. Their coach noted that they train together although only one usually plays. A joint photograph will enter the club chronicle. The photographer asked them to take turns holding the equipment without hiding their shirt numbers.",
          "byline": "Jan Rudzki - Sport"
        },
        "relay-baton": {
          "title": "A steady baton change",
          "body": "A school relay team improved its time although none of the runners set an individual best. Their teacher had devoted the last sessions entirely to baton changes, marking starting points in chalk. Every exchange in the race went smoothly. The pupils wanted to keep the baton in their classroom as a souvenir. It returned to the store cupboard instead: the next group was due to begin with the same exercise.",
          "byline": "Jan Rudzki - Sport"
        },
        "chess-clock": {
          "title": "A game reconstructed",
          "body": "The cultural centre's chess final ended after a lengthy rook endgame. The winner supplied his score for the club display. While copying it, members found an unclear move neither player could immediately reconstruct. A spectator by the window remembered it. The instructor will use the game with junior players, beginning with an earlier exchange that made the position difficult rather than simply pointing to the final mistake.",
          "byline": "Jan Rudzki - Sport"
        },
        "model-railway": {
          "title": "A timetable in miniature",
          "body": "Railway modellers gather around a layout taking up half a clubroom. Trains have a timetable written on slips smaller than tickets. A delay means holding the next departure. Younger members prefer driving locomotives; older ones mind points and sequence. One member works on the real railway. Here he chooses a branch station, where most of the session can be spent quietly adjusting trees made from sponge.",
          "byline": "Ewa Lis - Hobbies"
        },
        "coin-cabinet": {
          "title": "A coin with a history",
          "body": "Coin collectors on Szkolna Street compare more than dates and denominations. They study wear and the making of inscriptions. Beginners often bring coins polished with household products. The club leader shows them two similar examples, only one retaining its old surface. Each receives a note recording its origin. The most detailed account belongs to an ordinary coin found in the lining of a grandfather's coat.",
          "byline": "Ewa Lis - Hobbies"
        },
        "postcard-box": {
          "title": "Postcards in a box",
          "body": "A postcard collector arranges the city by street, though buyers usually chose the prettiest view. Comparing editions reveals new shop signs and vanished fences. She leaves messages visible: some tell more about a district than the printed caption. Neighbours bring single cards from family drawers. Each receives its donor's name so the collection's own history does not disappear behind the picture.",
          "byline": "Ewa Lis - Hobbies"
        },
        "amateur-radio": {
          "title": "A voice in the logbook",
          "body": "Amateur radio operators keep contact logs as carefully as they conduct conversations, recording time, call sign and reception. Confirmations arrive by post, sometimes much later. The club cupboard contains boxes of cards filed by call sign. To a visitor they resemble postcards. Their operator remembers which exchange was so noisy that a place name had to be repeated letter by letter.",
          "byline": "Ewa Lis - Hobbies"
        },
        "model-boat": {
          "title": "A trial on quiet water",
          "body": "The model-making club tested boats in a swimming pool lent after lessons. Builders stood along the edge with notebooks while the leader timed a set distance. The smartest painted model veered left. Its owner adjusted the ballast and tried again without changing the motor. Results were recorded with hull notes. At the cultural-centre exhibition, the models will be accompanied by observations usually left in the workshop.",
          "byline": "Ewa Lis - Hobbies"
        },
        "philately-swap": {
          "title": "A stamp for an envelope",
          "body": "At the collectors' exchange, an ordinary envelope with an old suburban postmark attracted most interest. Its owner wanted a stamp to complete a series. Members helped establish the postmark's date by comparing its last digit with other letters. The exchange was settled only after the address had been examined through a magnifier. The club chronicler recorded it. No price was mentioned, though discussion occupied almost half the meeting.",
          "byline": "Ewa Lis - Hobbies"
        },
        "fish-show": {
          "title": "An aquarium with notes",
          "body": "At the aquarium show, each tank carried its owner's description. Judges also asked about daily care and observation records. A schoolgirl's modest tank received a commendation for her careful notes on changing fish behaviour. Its decoration was simpler than neighbouring displays. Afterwards the notebook drew most questions. The club will provide a blank version so beginners can see which observations are worth recording.",
          "byline": "Ewa Lis - Hobbies"
        },
        "photo-darkroom": {
          "title": "Prints from one negative",
          "body": "Photography pupils made different prints from the same negative. Cropping revealed an empty bench, a passer-by or the entire courtyard. Their instructor displayed them anonymously side by side. Visitors found it hard to believe they came from one photograph. The negative's owner eventually chose the widest view. Only that version, he said, reminded him why he had entered the gateway with his camera in the first place.",
          "byline": "Ewa Lis - Hobbies"
        },
        "boardgame-evening": {
          "title": "Counting the counters",
          "body": "Three generations attended a games evening at the estate clubroom. Each group checked its box before play. Missing pieces were replaced with buttons, their roles noted on paper. A draughts game between a pensioner and a technical-school pupil lasted longest, with onlookers forbidden to advise. Afterwards children listed the complete sets. The buttons stayed in their boxes, having become accepted club equipment.",
          "byline": "Ewa Lis - Hobbies"
        },
        "mineral-display": {
          "title": "Stones with labels",
          "body": "A school walking club displayed minerals from private collections. Beside striking specimens lay plain stones from a nearby gravel pit. The teacher requested exact finding places as well as names. Several labels retained question marks, to be resolved on a later outing. The youngest exhibitor owned only three specimens, each described on a separate page. Conversations at his table lasted longest.",
          "byline": "Ewa Lis - Hobbies"
        },
        "radio-aerial": {
          "title": "The aerial by the window",
          "body": "The cultural centre's technical advice desk receives questions about radio reception in new blocks. Residents bring room sketches showing which window gives less hiss. The instructor begins by checking the set itself. Sometimes moving it by a shelf's width helps, though he promises no identical result on every floor. Neighbours directly above one another may listen to the same programme with their receivers in quite different positions.",
          "byline": "Technology desk"
        },
        "typewriter-ribbon": {
          "title": "Two colours on a ribbon",
          "body": "A typist at a design office judges a worn ribbon by the copies rather than the top sheet. The original may remain clear while figures on the last copy require guessing. New spools enter the supplies book. She seldom uses the red section, reserving it for selected entries. Visitors ask why she does not type whole headings in red. In a folder full of red headings, she explains, the important one would no longer stand out.",
          "byline": "Technology desk"
        },
        "tape-index": {
          "title": "What is on side B",
          "body": "Tape owners bring the club cassettes labelled on only one side. The other may hold a concert, a language lesson or a family recording. The instructor suggests an index with counter readings for each passage. Different machines' counters do not match exactly, so the list stays with its recorder. One member has filled three notebooks. What he seeks most often is not music but his daughter's voice before she started school.",
          "byline": "Technology desk"
        },
        "bicycle-dynamo": {
          "title": "Light from a wheel",
          "body": "A cycle mechanic listens to a dynamo while turning the wheel on a stand. Owners usually describe a lamp that lights intermittently. He checks wiring and fittings as well as the bulb. Old lamp holders lie on the bench as samples, since similar bicycles may use different parts. Customers who bring the whole bicycle instead of just the lamp generally leave with a fuller answer and need not return with a missing measurement.",
          "byline": "Technology desk"
        },
        "slide-projector": {
          "title": "Pictures on a pale wall",
          "body": "Cultural-centre technicians compared projector positions before a slide evening. The largest image was not the clearest: a smaller, sharper picture worked better from the back row. The presenter marked the position on the floor. Participants brought excursion slides in assorted mounts. Sorting them took longer than testing the light. Next time, sets will be accepted in advance with a running order.",
          "byline": "Technology desk"
        },
        "workshop-meter": {
          "title": "Reading the pointer",
          "body": "Technical-school pupils compared several workshop meters. Each read the scale independently before results went on the board. Some differences came from viewing the pointer at an angle. The teacher placed the instrument at eye level and repeated the measurement. Discussion then turned to written precision. Extra digits in a notebook did not necessarily mean their owner had measured more accurately than anyone else.",
          "byline": "Technology desk"
        },
        "sewing-maintenance": {
          "title": "Machines after inspection",
          "body": "Sewing pupils on Szkolna Street brought household machines to a maintenance demonstration. The instructor spread out manuals, some surviving only in fragments. Two nearly identical models required different threading. Their owners compared notes and completed missing diagrams. Each finished by sewing a sample. Notes went home with the machines, providing something to consult when the next question arose.",
          "byline": "Technology desk"
        },
        "telephone-display": {
          "title": "Receivers through the years",
          "body": "A school workshop displayed telephones lent by communications workers. Pupils compared receiver weights and dial return speeds. The oldest set had digits on cards behind little windows rather than printed directly on it. An old long-distance calling guide lay alongside. Visitors mostly asked about the wooden case. The demonstrator let them look inside, provided each returned the lid to its marked place.",
          "byline": "Technology desk"
        },
        "record-speed": {
          "title": "A record at its own pace",
          "body": "A technical class compared recordings played on two turntables. Their owners had attributed differences to the speakers. The instructor checked speed as well. After adjustment, a familiar tune sounded unlike one participant's memory: he admitted listening to it on the same machine for years. The club will retain a brief account of the comparison, without judging the records used as test material.",
          "byline": "Technology desk"
        },
        "drafting-tools": {
          "title": "A curve from a template",
          "body": "A drawing office lent pupils a set of older drafting tools. French curves attracted most curiosity, their shapes resembling no finished drawing. A draughtsman showed how only a short stretch of an edge is used. Pupils drew the same profile and marked its joins. Displayed finished lines looked equally smooth. Differences survived on rough sheets full of small marks never transferred to the clean copies.",
          "byline": "Technology desk"
        },
        "button-tin": {
          "title": "The old tea tin",
          "body": "Buttons in a household tin rarely form complete sets. They outlast coats and blouses handed down to younger relatives. A seamstress suggests threading matching ones together. Customers place single buttons on the haberdasher's counter and ask for something similar. Sometimes replacing the whole row is easier than finding one match. The old set goes back into the tin, waiting for a garment that needs one button fewer.",
          "byline": "Anna Wrona - Home and family"
        },
        "sheet-hems": {
          "title": "A longer-lasting hem",
          "body": "An estate sewing service cuts sheets for beds of unusual sizes. Customers often bring mattress measurements without allowing for a hem. An employee spreads the fabric on a large table to show the difference. Offcuts become pillowcases or cloths, though not everyone wants them back. Those left behind supply seam samples for pupils still learning to guide a straight edge.",
          "byline": "Anna Wrona - Home and family"
        },
        "shopping-bag": {
          "title": "Bags inside a bag",
          "body": "Before visiting the market, Jadwiga puts several small bags inside a larger one, keeping bread apart from earthy vegetables. She made the cloth sacks from a pillowcase with a worn centre but strong edges. Neighbours bring their own fabrics to compare. Handles matter most: the easiest to sew are not always comfortable to carry. The finished bags occupy a drawer once filled with paper saved for wrapping.",
          "byline": "Anna Wrona - Home and family"
        },
        "leftover-yarn": {
          "title": "A label on the yarn",
          "body": "At the needlework club, each yarn remnant receives a label naming its former jumper. Colour alone cannot identify thickness or behaviour. Small amounts become samples, pockets and bands for children's hats. The leader also keeps unsuccessful combinations, useful for showing why an even pattern suddenly narrows. New members examine these scraps as closely as the finished pieces in the display case.",
          "byline": "Anna Wrona - Home and family"
        },
        "repair-evening": {
          "title": "An evening with needles",
          "body": "Residents of Północ brought clothes needing small repairs to the clubroom. Two experienced seamstresses helped without doing everything for the owners. Most participants wanted to learn to replace a zip. A table held shared buttons, thread and thimbles. Afterwards three odd gloves and scissors tied with red thread remained. The caretaker entered them in his notebook, hoping the next meeting would begin by finding their owners.",
          "byline": "Anna Wrona - Home and family"
        },
        "linen-swap": {
          "title": "A cloth for another table",
          "body": "At a neighbourhood fabric exchange, unusually sized tablecloths drew most interest. New tables had left good cloths without a use. Organisers asked owners to attach measurements, saving several visitors from unrolling entire parcels. One long cloth went to two sisters who will divide it between their kitchens. They plan to finish the edges together, following the pattern preserved along the short side.",
          "byline": "Anna Wrona - Home and family"
        },
        "recipe-index": {
          "title": "An index for the notebook",
          "body": "A household club has organised the recipe notebook used in its classes for years. Added pages had defeated the original sections. A separate index now points to margin notes as well. The contributors' titles were left untouched. A dish called Quick Dinner keeps its name despite requiring the most preparation. The leader added only how many people the quantities were intended to feed.",
          "byline": "Anna Wrona - Home and family"
        },
        "curtain-measure": {
          "title": "A curtain for its window",
          "body": "Sewing pupils made curtains for their clubroom. First they measured closed windows, then repeated the task with the casements open. The difference determined the centre panels' width. They planned the cuts on paper and used the remainder for a small entrance window. The curtains went up during an ordinary class. Those seated nearest the sill immediately checked that the handles remained within easy reach.",
          "byline": "Anna Wrona - Home and family"
        },
        "patchwork-cover": {
          "title": "A cover made of scraps",
          "body": "The needlework circle has given its clubroom a patchwork cover made from curtains, skirts and children's dresses. Squares were first arranged by colour, then rearranged to account for fabric thickness. A small pocket on the back contains the makers' names; not all could attend the group photograph. The cover will be used on the window bench, where people usually wait for classes to begin.",
          "byline": "Anna Wrona - Home and family"
        },
        "shopping-notes": {
          "title": "Both sides of the list",
          "body": "A meeting on household spending compared shopping lists. One participant writes unbought items on the reverse, distinguishing a saving from a postponed purchase. Others mark shops they must revisit with a measurement or sample. The leader collected examples anonymously. Several simple layouts will appear in the club display, without declaring one pattern suitable for every household.",
          "byline": "Anna Wrona - Home and family"
        },
        "shared-landing": {
          "title": "A shelf on the landing",
          "body": "A narrow plant shelf stands on a half-landing in Stolarska Street. Three households care for it on different daily schedules. A slip behind a pot records the last watering. Before it appeared, the most enthusiastically tended plants struggled most. Neighbours also move them to follow the light. The shelf belongs to no flat, yet one resident's move prompted a long discussion about who would continue looking after it.",
          "byline": "Anna Wrona - Home and family"
        },
        "folding-table": {
          "title": "A table for more people",
          "body": "In a Północ flat, the everyday table stands against a wall. For family gatherings it moves out and gains a leaf stored behind a wardrobe. Chairs arrive from neighbours, each with a different seat. The hostess notes which floor each must return to. Planning centres on the kitchen passage. Furniture accommodates everyone only when room is left for the person carrying the tureen, as well as those already seated.",
          "byline": "Anna Wrona - Home and family"
        },
        "window-sill": {
          "title": "Every sill has its aspect",
          "body": "Zofia at the flower shop studies sketches customers bring of their flats. A request for a suitable plant begins with window direction and radiator position. Adjoining sills may offer different conditions. Her notebook contains leaf sketches for identifying unnamed specimens. She often adds their size after several years. A small pot fits almost anywhere; a plant that thrives can be harder to accommodate.",
          "byline": "Anna Wrona - Home and family"
        },
        "family-bookshelf": {
          "title": "Books in two rows",
          "body": "The Bielski family's books fill a hallway shelving unit. Less-used volumes stand behind the front row, listed on slips at the shelf edge. The children proposed sorting by colour, their parents by author. Textbooks eventually received their own section. Long-term loans are hardest to place. Slips bearing neighbours' names now sit inside them, preventing a visit over tea from becoming a dispute about an atlas.",
          "byline": "Anna Wrona - Home and family"
        },
        "room-divider": {
          "title": "A room divided by shelves",
          "body": "Readers from Północ showed us a room divided by shelving into study and sitting areas. Keeping the window accessible required moving the bed. They first used a paper plan with cut-out furniture. Their child chose the desk position, then requested a small change a week later. Lamp and shelf were moved. The plan remains in a drawer: next year a younger brother will start studying in the same room.",
          "byline": "Anna Wrona - Home and family"
        },
        "stairwell-curtains": {
          "title": "The shared stair window",
          "body": "Residents on Ogrodowa Street agreed how to arrange their stairwell window. Several floor pots gave way to two on an existing shelf, with the others taken into flats. The caretaker reminded everyone to leave access for cleaning the casement. Arrangements went into the duty notebook. A resident with a large shopping trolley was particularly pleased: for once, nothing needed moving aside on his way upstairs.",
          "byline": "Anna Wrona - Home and family"
        },
        "furniture-plan": {
          "title": "Measuring before buying",
          "body": "A household-club consultation began with an alcove sketch and the dimensions of a proposed wardrobe. Everything fitted on paper. Drawing the open doors revealed that a bottom drawer could not fully extend. The adviser suggested rearranging the shelves rather than moving the wardrobe. Its owners took the revised plan to a joiner, who asked for one more measurement: the skirting board, absent from both previous versions.",
          "byline": "Anna Wrona - Home and family"
        },
        "plant-cuttings": {
          "title": "A cutting with a name",
          "body": "Houseplants were exchanged at the estate clubroom, each cutting labelled with its donor's name and former position. The familiar spider plant appeared under three household names. Comparing leaves established that they were the same plant. Several cuttings remained on the clubroom sill. Those on duty agreed who would water them until neighbours unable to attend could collect theirs.",
          "byline": "Anna Wrona - Home and family"
        },
        "child-desk": {
          "title": "Their sister's old desk",
          "body": "A joiner on Stolarska Street adapted a desk for siblings taking turns. The top remained, while a shelf and footrest changed. The children brought textbooks to check their position beside an open exercise book. Their father wanted an extra drawer; his daughter preferred space for her knees. After a trial, the family chose the simpler arrangement. Old stickers remain beneath the top, since neither child wanted them removed.",
          "byline": "Anna Wrona - Home and family"
        },
        "coat-hooks": {
          "title": "Hooks at the right height",
          "body": "Tenants of a small building tidied the shared entrance recess. The old rack moved higher and a second, donated from upstairs, was fitted for children. Previously their damp coats had ended up on the banister. A neighbour sewed a cloth pocket for forgotten gloves. Everyone agreed the recess was for short visits only. On the first day a suitcase also vanished whose owner nobody had identified for months.",
          "byline": "Anna Wrona - Home and family"
        },
        "soup-ladle": {
          "title": "The measure of a ladle",
          "body": "The works canteen marks its ladles although they look almost alike. The cook chooses one for the soup and portion size. New staff first practise pouring water into bowls; a full queue leaves little time for corrections. The menu lists weights, but diners judge the plate. The manager therefore checks crockery too: the same serving looks smaller in a broad dish than in a deep bowl.",
          "byline": "Anna Wrona - Trade"
        },
        "market-scales": {
          "title": "Weights beside the apples",
          "body": "At the market, a seller sorts apples by likely use. The most even fruit goes into gifts, smaller apples into home baking. Customers ask about varieties sometimes known only from their parents' garden. Conversation helps more than colour comparisons. A cut apple lies beside the scales. The seller shows its flesh before reaching for a weight: similar-looking fruit may behave very differently in a kitchen.",
          "byline": "Anna Wrona - Trade"
        },
        "canteen-tray": {
          "title": "The tray returns",
          "body": "Canteen workers recognise the end of a shift by the stack of trays. Dishes return unevenly: some people eat quickly, others wait for colleagues. Glasses now have a separate place at the return hatch, suggested by a regular diner who once worked in a kitchen. The report records the number of meals served. The shorter journey between sink and shelf matters chiefly to those collecting the dishes.",
          "byline": "Anna Wrona - Trade"
        },
        "family-dumplings": {
          "title": "A filling from memory",
          "body": "Helena's dumpling recipe takes three notebook lines. Her daughter has added a page about texture and filling quantities. Cooking together revealed that the household glass used as a measure was smaller than usual. They kept it beside the flour. Guests recognise each woman's dumplings by the way the edges are sealed. Their hands work differently despite sharing the same dough and brief recipe.",
          "byline": "Anna Wrona - Trade"
        },
        "bakery-visitors": {
          "title": "Bread before dawn",
          "body": "Pupils visited a bakery after the night's production. The master showed tins and baskets before asking them to compare two similar-looking loaves. Their weights and crusts differed. Most questions concerned working hours, since pupils knew bread chiefly from the shop. Their school-paper account will follow it from bench to delivery crate. The bakers asked them to include the people who count and distribute the loaves.",
          "byline": "Anna Wrona - Trade"
        },
        "recipe-contest": {
          "title": "A recipe with a note",
          "body": "A club cooking contest commended a casserole made from simple ingredients. Its maker brought the recipe on an old bill. Judges requested a clearer baking time than until ready. A joint trial established an approximate range, though the original wording remains as a family keepsake. The display copy will include the dish size. That detail explained why a neighbour's version had turned out differently.",
          "byline": "Anna Wrona - Trade"
        },
        "school-sandwiches": {
          "title": "Lunch in a bag of one's own",
          "body": "A school household class compared ways of packing lunch, judging whether bread arrived intact and bags could be reused rather than what families supplied. Simple cloth sacks were sewn from sewing-class remnants and marked with initials. After a week, pupils brought comments from home. One sack needed enlarging because its owner also carried lunch for his younger sister.",
          "byline": "Anna Wrona - Trade"
        },
        "market-baskets": {
          "title": "Baskets compared",
          "body": "A household club compared shopping baskets, filling each with the same empty packages to test capacity and handling without debating weight. The largest failed a trial passage between chairs. Its owner uses it only at the open market and has no intention of replacing it. She donated a smaller basket to the club instead; it had spent years on top of her wardrobe.",
          "byline": "Anna Wrona - Trade"
        },
        "tea-service": {
          "title": "Cups that do not match",
          "body": "Residents donated cups to the cultural centre. No set was complete, but together they served a readers' meeting. The hostess matched saucers by diameter rather than pattern. Guests soon recognised their own contributions. One donor told the story of a broken service survived by two cups. Afterwards they were stored together, apart from the heavy mugs used during art classes.",
          "byline": "Anna Wrona - Trade"
        },
        "potato-varieties": {
          "title": "A potato has a name",
          "body": "An allotment club compared potatoes from several nearby farms, setting cooked samples beside the baskets. Participants noticed differences invisible in the skins. The organiser requested variety names so future purchases would not depend entirely on a seller's memory. Some labels were completed only after calls to the growers. Discussion lasted longest over a variety everyone knew by a different household name.",
          "byline": "Anna Wrona - Trade"
        },
        "tram-terminus": {
          "title": "A few minutes at the loop",
          "body": "At the tram terminus, the driver puts a bag in the cab and checks departure time. Passengers board early to choose seats for the journey into town. The kiosk seller knows the gaps between services better than the printed timetable. These minutes allow a newspaper purchase and the end of breakfast. Once the tram leaves, her bench empties. The next group arrives from the estate before another tram can be heard.",
          "byline": "Ewa Lis - City and region"
        },
        "luggage-label": {
          "title": "A suitcase with a ticket",
          "body": "Travellers collect left luggage by number but tend to describe cases by colour and straps. An attendant points to a row of almost identical brown trunks. The easiest to distinguish has a homemade repair beside its handle. He advises keeping luggage receipts apart from travel tickets. Some owners return only after visiting several offices. Their cases wait still while they cross half the city.",
          "byline": "Ewa Lis - City and region"
        },
        "railway-porter": {
          "title": "The trolley knows the steps",
          "body": "A station porter takes a slightly longer route than passengers, avoiding thresholds and narrow passages. He knows where two cases side by side will not clear a doorway. Customers often point to the platform before saying how many parcels they have. Counting reveals another bag left with a relative. The porter waits with a hand on the handle. The timetable creates urgency, but reaching the carriage has its own sequence.",
          "byline": "Ewa Lis - City and region"
        },
        "bus-ticket-book": {
          "title": "A ticket through the hatch",
          "body": "The suburban ticket office sells most fares in brief gaps between departures. Its cashier knows destinations through questions about connections and return times. Regulars name their stop; newcomers describe the whole journey. A marked map lies behind the glass for cases where the official stop name differs from local usage. The ticket carries one name, but the cashier needs both to direct people to the right bus.",
          "byline": "Ewa Lis - City and region"
        },
        "route-map": {
          "title": "A map for visitors",
          "body": "Pupils near Kolejowa Street mapped walks from the station to several city institutions. They timed the routes, then asked a visitor to follow the drawing. He stopped at a gateway the authors had considered obvious. They added a distinctive sign and marked the courtyard passage. A copy went to the school office. The original retains its corrections, which proved the most useful part of the exercise.",
          "byline": "Ewa Lis - City and region"
        },
        "commuter-survey": {
          "title": "Connections in a notebook",
          "body": "Commuters from outside the city sent the newspaper notes on daily connections. They describe walking time between stops rather than a single delay. Connections look convenient on paper, but involve two crossings and a long platform. We forwarded the list to the transport office. An official requested market days be marked separately, when travellers more often carry bags that slow the whole walk.",
          "byline": "Ewa Lis - City and region"
        },
        "bicycle-rack": {
          "title": "Space beside the gate",
          "body": "Cooperative workers reorganised the cycle rack by their gate. Bikes parked across the nearest spaces had made its ends difficult to reach. A trial used different bicycles, including broad carriers. Permanent numbers replaced chalk marks. The porter keeps a layout for newcomers. No extra space was added, yet the last arrival no longer has to move two other people's handlebars.",
          "byline": "Ewa Lis - City and region"
        },
        "station-signs": {
          "title": "The arrow's other side",
          "body": "Following passengers' comments, the waiting-room sign has been repositioned. It was clear from the main entrance, but people leaving the tunnel saw its back. Station staff checked both approaches and moved it nearer the corridor junction. The reader who wrote to us confirmed the change and reports fewer travellers turning back with luggage. The information is unchanged; what changed is where people can read it.",
          "byline": "Ewa Lis - City and region"
        },
        "walking-club": {
          "title": "A route measured in steps",
          "body": "A walking club checked the route to a suburban stop. Its old description gave a time without mentioning a rest near the hill. Members walked in two groups at different speeds. Comparing notes led them to add landmarks instead of promising one journey time. The guide retained the path's local name. It is absent from the printed map but is what visitors most often ask residents about.",
          "byline": "Ewa Lis - City and region"
        },
        "tram-model": {
          "title": "A tram on a school table",
          "body": "Pupils built a tram model for an exhibition about daily travel. With staff permission, they measured a vehicle at the terminus. Seats and handrails were hardest to position. The model has no motor, but its roof lifts off. At the display a driver noticed a missing mirror, which the pupils added before the meeting ended. The caption also names staff who patiently answered questions during measuring.",
          "byline": "Ewa Lis - City and region"
        },
        "cloakroom-tokens": {
          "title": "A token in the pocket",
          "body": "The Świt cinema's cloakroom attendant recognises regular viewers but returns coats strictly by token. Several black coats look identical under the lamp. Guests put tokens in gloves, then search for both separately. A small tray holds found objects. After the last screening, she checks unclaimed coats only for a ticket or name. Everything else waits quietly for its owner to return.",
          "byline": "Ewa Lis - City desk"
        },
        "letter-carrier": {
          "title": "An address known for years",
          "body": "The postman near Kolejowa Street remembers former tenants longer than doorplates do. A card may arrive with an outdated name and a precise balcony description, not always enough for delivery. His notebook contains residents' corrections. Shared flats with several recipients under one number are hardest to organise. A clear label by the letterbox saves more walking than a good memory for faces.",
          "byline": "Ewa Lis - City desk"
        },
        "barber-mirror": {
          "title": "Conversation at the mirror",
          "body": "A barber beside the market keeps a waiting chair near the coat rack. Its occupant reads the paper, leaving the sports page visible for an acquaintance. Regular appointments create small circles of conversation about gardens or fixtures. The barber chiefly remembers who wants a shorter back and who needs care around the fringe. The newspaper changes daily; these instructions return whenever he adjusts the mirror.",
          "byline": "Ewa Lis - City desk"
        },
        "porter-ledger": {
          "title": "A message with the porter",
          "body": "Messages at the cultural centre go into a notebook with broad lines. Recipients' surnames are underlined; most messages take one sentence. Someone will return music, someone collect a child later. The porter asks senders to sign. Nicknames cause most trouble. One class recognises a particular person, while another knows someone entirely different by the same name, attending different lessons.",
          "byline": "Ewa Lis - City desk"
        },
        "lost-glasses": {
          "title": "The spectacles return",
          "body": "The owner of spectacles left in a reading room contacted the newspaper, identifying the case by a small patch sewn inside. The first notice described only the frame colour, shared by many models. The librarian had requested another detail. The reader admitted that without his glasses he could not read the entrance notice. A neighbour borrowing an unrelated book had told him about the find.",
          "byline": "Ewa Lis - City desk"
        },
        "queue-seats": {
          "title": "Chairs beside the counter",
          "body": "A service shop on Ogrodowa Street rearranged its waiting chairs. Their former row blocked customers carrying larger parcels. An employee proposed a shorter row with space for bags, tested during an ordinary working day. One chair returned to the back room. Repair times did not improve, but people collecting items no longer needed the whole queue to move their feet whenever someone left.",
          "byline": "Ewa Lis - City desk"
        },
        "family-photo-names": {
          "title": "Who is beside the aunt",
          "body": "At a meeting of older estate residents, families annotated a dozen photographs. Owners knew the central figures but struggled with guests at the edges. Remembering a workplace supplied one surname. Organisers requested pencil notes on separate slips rather than on photographs. Families will keep copies. Gaps remain for later meetings, allowing another person's memory to help rather than turning the first guess into certainty.",
          "byline": "Ewa Lis - City desk"
        },
        "returning-umbrella": {
          "title": "An umbrella returns",
          "body": "An umbrella mistakenly taken after a screening has returned to the Świt cinema. A viewer noticed the different handle; his own umbrella was still in the cloakroom. A carefully sewn loop, hidden when folded, also distinguished them. Two entries were crossed out of the found-property book at once. The usher suggested everyone open umbrellas before checking them next time. The proposal met with more laughter than enthusiasm.",
          "byline": "Ewa Lis - City desk"
        },
        "market-bench": {
          "title": "A bench moved one pace",
          "body": "Older shoppers requested that the bench near the market exit be moved. Previously they faced a busy route used by barrows. Now bags can sit alongside while purchases are checked. Traders agreed the change with the market caretaker. One feared his stall would be hidden but withdrew the objection after a trial. The bench remains near the familiar gate where people meet before travelling home together.",
          "byline": "Ewa Lis - City desk"
        },
        "address-correction": {
          "title": "Two entrances, one letter",
          "body": "A reader resolved misdirected letters to a rear building on Stolarska Street. Her number was visible only from the courtyard, while a similar number marked the main stairs. After discussion with the administration, the gate sign gained an entrance designation. The postman checked it on his round. The first correctly delivered card came from a sister who had known the route for years but never fitted it into a short address.",
          "byline": "Ewa Lis - City desk"
        },
        "chalk-board": {
          "title": "The board before class",
          "body": "A caretaker on Szkolna Street recognises classrooms by their chalk remnants: coloured stubs in one, mostly white in another. Teachers divide boards in their own ways. Pupils writing long solutions learn to leave room for a conclusion. Wiping out the beginning may be easier than rewriting the whole calculation. Younger classes therefore practise arranging their writing as well as forming the letters.",
          "byline": "Marek Boruta - Education"
        },
        "exercise-book": {
          "title": "A margin for revision",
          "body": "A language teacher asks pupils to leave broad notebook margins. They hold questions about meaning as well as corrections. The neatest copied work is not always easiest to discuss. A pupil showing an earlier draft can explain a choice. Anonymous examples remain in the classroom cupboard for later years to compare the journey from first idea to finished description.",
          "byline": "Marek Boruta - Education"
        },
        "school-map": {
          "title": "The map returns to its tube",
          "body": "School maps are rolled after lessons, although some pupils would like them permanently visible. Few walls are free of windows or cupboards, so the teacher keeps labelled tubes. The most-used map has reinforced corners partly covering its key. Pupils copied the key onto a separate sheet. Now the back row can read explanations without approaching the board during every exercise.",
          "byline": "Marek Boruta - Education"
        },
        "evening-students": {
          "title": "A notebook after work",
          "body": "Evening pupils arrive with exercise books beside work clothes in their bags. Before class they exchange notes from missed lessons. One spaces formulas widely to leave room for later explanations. Their teacher knows shift times at nearby workplaces. A test must fit between work finishing and the last bus. That second boundary is often as distinct to the class as the school bell.",
          "byline": "Marek Boruta - Education"
        },
        "spelling-contest": {
          "title": "A dictation explained",
          "body": "Two pupils tied in a school spelling contest. Instead of another dictation, teachers asked them to explain several spellings. Dictionaries were allowed, but contestants had to locate the relevant entry. The winner explained her own correction most clearly. Interesting questions will appear in the school paper without individual error lists. Organisers want the competition to leave something useful for other classes too.",
          "byline": "Marek Boruta - Education"
        },
        "school-garden-plan": {
          "title": "A garden on paper",
          "body": "Pupils mapped their school garden from measurements, each group beginning at a different corner. When sheets were joined, paths failed to meet. Rather than correcting the drawing, their teacher asked them to remeasure selected stretches. The error lay beside the broad gate. The finished plan hangs next to the first attempt. Both show the garden, but only one gives a usable measure of the beds.",
          "byline": "Marek Boruta - Education"
        },
        "reading-pairs": {
          "title": "Older pupils read aloud",
          "body": "The school library reviewed reading sessions pairing older and younger pupils. Younger children chose a book; partners helped with difficult words. The same volumes were often borrowed afterwards. The supervisor noticed older readers preparing passages in advance so each sentence would not interrupt the story. At the final meeting, roles briefly reversed: younger pupils read their partners short thank-you letters in their own words.",
          "byline": "Marek Boruta - Education"
        },
        "geometry-models": {
          "title": "A solid from a flat sheet",
          "body": "A school display featured solid shapes made from packaging card alongside their flat nets. One pyramid had unusual proportions because its maker measured from the edge of a damaged ruler. It remains beside the corrected version. Visitors could unfold a separate model to inspect the faces. Parents, many years removed from such exercises, spent longest at the table.",
          "byline": "Marek Boruta - Education"
        },
        "school-newspaper": {
          "title": "An office of three desks",
          "body": "School No. 12 pupils produced a paper about activities outside lessons, typing interviews on a machine borrowed from the office. Three joined desks housed the editorial team. Captions caused most debate. A first reading shortened the introduction and restored the caretaker's missing name to a workshop report. Only a few copies were duplicated, each carrying a circulation slip for passing between classes.",
          "byline": "Marek Boruta - Education"
        },
        "workshop-aprons": {
          "title": "An apron with its own pocket",
          "body": "Practical-class pupils sewed workshop aprons from a shared pattern, placing pockets according to height and working habits. At the first fitting, a pencil fell out when its wearer sat down. The pocket moved. Their teacher requested a note about the adjustment beside the pattern. Finished aprons will stay at school marked with names rather than travel weekly among textbooks.",
          "byline": "Marek Boruta - Education"
        },
        "weather-notebook": {
          "title": "Weather from this courtyard",
          "body": "A retired teacher has recorded weather from his window for years, measuring at the same hour and adding a brief sky description. Neighbours mainly ask about unusually cold days. His notebooks also preserve long stretches of ordinary weather easily forgotten. He does not regard them as forecasts. They record one courtyard, particularly useful when somebody claims that this time of year always used to be different.",
          "byline": "Science desk"
        },
        "shadow-dial": {
          "title": "A shadow changes place",
          "body": "A nature club follows the shadow of a stick kept in one position. Members mark its tip on card and record the hour. Repeated observations show changes even in similar weather. Their leader asks them to keep earlier sheets. One sunny day produces an interesting drawing, but comparisons across many days invite questions. Blank spaces for sunless days remain in the collection too.",
          "byline": "Science desk"
        },
        "leaf-collection": {
          "title": "A leaf and its finding place",
          "body": "Each leaf in a school collection carries its finding place and circumstances. Shape alone may not identify the tree, so pupils compare bark drawings and branching too. Faded captions on older sheets require daylight to read. The teacher retains past mistakes with explanations attached. The collection therefore preserves how names were learned as well as the final answers.",
          "byline": "Science desk"
        },
        "magnifier-table": {
          "title": "An ordinary thread enlarged",
          "body": "A nature-club instructor begins with pocket-sized objects. Thread, a grain and paper look different through a magnifier. Members draw what they see without first supplying familiar names, then compare sheets. Distinguishing an object's feature from reflected light proves hardest. Experienced members rotate a sample before deciding whether a bright point belongs in the drawing.",
          "byline": "Science desk"
        },
        "star-chart": {
          "title": "The sky on a school chart",
          "body": "An astronomy club demonstrated sky charts indoors before identifying several easy points from the courtyard. Light from nearby windows restricted the view, so nobody attempted every object. The teacher asked members to mark things they could not identify as well. Next time they will compare conditions instead of assuming each missing observation was the observer's mistake.",
          "byline": "Science desk"
        },
        "water-level": {
          "title": "The same level",
          "body": "At a school demonstration, water in connected transparent vessels of different shapes settled at a common level, surprising younger viewers. Older pupils explained it using a scale on the board. A parent recognised the principle from his workshop and later supplied a drawing of a tool he uses. The display now includes this example beside the neat textbook diagram.",
          "byline": "Science desk"
        },
        "seed-observation": {
          "title": "A sprout in two notebooks",
          "body": "Two classes compared records of germinating seeds. Their vessels matched, but one class used dates and the other counted days from the start. Combining results first required agreeing the starting point. Their teacher used the difference to discuss experimental records. The prettiest drawing could not replace a missing observation date. Pupils therefore completed their captions before displaying the work.",
          "byline": "Science desk"
        },
        "sound-string": {
          "title": "Pitch and length",
          "body": "School physics-club members built a simple apparatus with a string and movable support. Moving it changed pitch, which they compared with measured length. A cultural-centre musician later demonstrated the relationship on his instrument. Those who had considered the measurements detached from practical life listened particularly closely. The apparatus stays in the classroom with its table of results and space for further trials.",
          "byline": "Science desk"
        },
        "soil-jars": {
          "title": "Soil from several places",
          "body": "A school display used soil from a garden, field and roadside, each jar labelled with its precise source. Pupils added water and watched layers separate. They did not attempt to judge whole farms from the results. The leader stressed that a jar represented a small patch of ground. Samples stood beside a map marking places not yet examined on the shared outing.",
          "byline": "Science desk"
        },
        "bridge-paper": {
          "title": "A bridge from one sheet",
          "body": "A school contest challenged teams to span two desks with equal amounts of paper. A neatly folded concertina supported most weight. Pupils measured bending before adding each weight. Judges asked the winning group to repeat the trial with a fresh sheet. Results were similar but not identical. Both appear on the display, with a note about how carefully the second sheet was folded.",
          "byline": "Science desk"
        },
        "common-key": {
          "title": "A key with a large tag",
          "body": "The Północ clubroom key has a wooden tag larger than a hand, making it difficult to pocket by accident. Session leaders sign it out with a time. Trouble usually follows meetings that end early: the next group searches for a host already home. A return-location notice now hangs beside the ledger. That people have stopped discussing it suggests the arrangement is working.",
          "byline": "City desk"
        },
        "allotment-path": {
          "title": "A path between fences",
          "body": "Allotment holders outside the city name shared paths after nearby trees. Newcomers receive a simple plan because plot numbers run differently from the route through the gate. Visitors used to end up at the far boundary. The caretaker keeps the map in the hut, chiefly for people bringing tools or visiting relatives. Regulars still say the turn by the pear tree, even while pointing to a number.",
          "byline": "City desk"
        },
        "neighbour-tools": {
          "title": "A drill in the ledger",
          "body": "Neighbours in one stairwell lend tools through a notebook kept by the caretaker. The drill returns with its box of bits; the hammer travels unwrapped. The tape measure disappears longest, easily left on a wardrobe. Owners agreed to return items directly to the person named in the ledger. Leaving them with another neighbour shortened the walk but lengthened the search. The record now also shows completed returns.",
          "byline": "City desk"
        },
        "noticeboard-space": {
          "title": "A notice has a date",
          "body": "The clubroom caretaker removes notices after the date their writers supply. Undated slips stay until the next review. Residents first considered this unnecessary fuss. Within weeks they were reading the board more often, now that past invitations no longer filled it. Removed notices go into an envelope. Someone occasionally needs an address from an old slip, so they do not become waste paper immediately.",
          "byline": "City desk"
        },
        "laundry-roster": {
          "title": "A free laundry slot",
          "body": "Following residents' letters, the shared laundry ledger now marks released bookings. Previously a crossed-out name resembled a correction, leaving neighbours unsure whether the slot was free. The caretaker explained the change at a short stairwell meeting. A tenant who had waited all week used the first opening. Her thank-you note to the newspaper proposed a similar ledger for the drying room.",
          "byline": "City desk"
        },
        "club-bookcase": {
          "title": "Shelves for the clubroom",
          "body": "Północ residents donated shelves after moving their home library. Before positioning them, members measured games boxes and albums used in classes. One shelf went higher than the rest. Children made location labels; adults listed cupboard contents. The furniture bears a mark where a calendar once hung. The caretaker left it visible on the side facing the chronicler's table.",
          "byline": "City desk"
        },
        "bench-painting": {
          "title": "The bench's restored back",
          "body": "Residents off Kolejowa Street restored the courtyard bench, numbering its back slats before dismantling. Once assembled, an older tenant noticed one reversed slat. He knew its slight curve from sitting there daily. It was corrected before the last screw went in. Regular users sat for the group photograph while those who did the work stood behind with the remaining tools.",
          "byline": "City desk"
        },
        "allotment-library": {
          "title": "Gardening books under one key",
          "body": "An allotment circle gathered manuals previously kept in private huts. Its list revealed duplicate titles and a missing volume requested most often. Duplicates stay with owners; the rest share a cupboard, with loans recorded by the caretaker. The first meeting spent longest deciphering margin notes. Owners agreed to retain them provided readers could see whose copy they were using.",
          "byline": "City desk"
        },
        "shared-room-hours": {
          "title": "Hours on a single sheet",
          "body": "Estate clubs compared their use of the meeting room. Session numbers stayed unchanged, but time for setting up and clearing tables was added. The art group no longer has to finish as chess players enter. A new schedule fits one sheet, with identical copies by the door and at the porter's desk. The previous versions differed by a handwritten note some leaders had never seen.",
          "byline": "City desk"
        },
        "courtyard-chronicle": {
          "title": "A courtyard chronicle",
          "body": "Residents on Stolarska Street assembled a courtyard album with photographs, workshop memories and a drawing of former stairs. Some dates remain uncertain and their captions open. Recent arrivals also examined it, adding a page about their first day in the building. The caretaker will keep the chronicle available for additions at later neighbourhood meetings.",
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
      note: 'The game only works on a real desktop.',
      noteHelp: 'Use a computer with a keyboard and mouse.',
      noteLines: ['The game only', 'works on a', 'real desktop.', '', 'Use a computer', 'with a keyboard', 'and mouse.'],
      noteLabel: 'A handwritten note from the clinic',
    },
    takeCertificate: 'Take a certificate form from the document rack', reservedForm: 'Reserved form slot — inactive', rackBlank: 'Paper', rackCertificate: 'Certificates',
    phone: 'Telephone — listen to the exchange tone', measurements: 'Scale and stadiometer — measure weight and height',
    takePaper: 'Take a blank sheet from the document rack', takeClip: 'Take a paperclip from the holder',
    drawer: 'Drawer', drawerNames: { drawer: 'Left drawer', 'drawer-2': 'Right drawer' }, trash: 'Wastepaper basket',
    drawerEmpty: 'The drawer is empty. Move an item here to keep it.',
    drawerHelp: 'Put a held sheet, newspaper, rulebook, paperclip or banknote in the drawer. With empty hands, open its contents.',
    drawerViewHelp: 'Document covers follow filing order. Clipped records occupy one position. Hover or focus with Tab to read the name. Click or press Enter to retrieve it. Browse further batches for more records. Newspapers lie separately; hover or focus to see the issue date. The bottom edge or Escape closes the drawer.',
    drawerDocuments: 'Files', drawerCash: 'Cash', drawerObjects: 'Other objects', drawerBatch: 'Archive section',
    drawerRetrieve: 'Take out', drawerClose: 'Close drawer', drawerPrevious: 'Earlier files', drawerNext: 'Later files',
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
      institutions: { militia: 'MILITIA COMMAND', lot: 'LOT', zus: 'ZUS', chamber: 'MEDICAL CHAMBER', clinic: 'OCCUPATIONAL HEALTH' },
      departments: { employer: 'PERSONNEL OFFICE', militia: 'PERSONNEL DIVISION', lot: 'FLIGHT PERSONNEL', zus: 'CERTIFICATION OFFICE', chamber: 'SECRETARIAT', clinic: 'CONSULTING ROOM 04' },
      referralInstruction: { initial: 'Referred for initial examination:', periodic: 'Referred for periodic examination:' },
      fields: { identity: 'Referred person', position: 'Position', work: 'Work', hazards: 'Exposures' },
      seal: { employer: ['PERSONNEL', 'RECORDS'], militia: ['MILITIA', 'STAFF'], lot: ['LOT', 'AIRCREW'], zus: ['ZUS', 'CERTIFICATION'], chamber: ['MEDICAL', 'CHAMBER'], clinic: ['CLINIC', 'DOCTOR'] },
    },
    paperwork: {
      date: 'Date', issued: 'Issued', employerSeal: 'Violet personnel-office stamp',
      clinicSeal: 'Clinic seal', zusSeal: 'Rectangular blue ZUS seal', signed: 'Signed by hand',
      referral: 'Referral for examination', occupational: 'Occupational medicine', note: 'Medical notes', blank: 'Blank sheet',
      employer: 'Employer', name: 'Full name', birthDate: 'Date of birth', birthShort: 'Born', age: 'Age', sex: 'Sex',
      female: 'F', male: 'M', femaleFull: 'Female', maleFull: 'Male', examination: 'Examination',
      initial: 'initial', periodic: 'periodic', position: 'Position', managerial: 'Managerial', yes: 'yes', no: 'no',
      requirements: 'Profile', requirementCodes: { full: 'WC', vision: 'W', pressure: 'C' }, work: 'Work type', hazards: 'Exposures', weight: 'Weight', height: 'Height', kg: 'kg', cm: 'cm',
      write: 'Add patient history to the notes', read: 'Read the document', open: 'Open the envelope',
      envelope: 'Sealed envelope', letter: 'Letter about a certificate', sender: 'Sender', recipient: 'To the examining doctor',
      zus: 'ZUS', employerSender: 'Employer', paperclip: 'Paperclip', clipped: 'Paperclip attached', stored: 'In the drawer',
      unclip: 'Remove the paperclip and separate the documents', writeCertificate: 'Write the patient’s name and job position on the certificate',
      nameMissing: 'Patient name has not been written', nameWritten: 'Patient name written by hand', positionMissing: 'Job position has not been written',
      resultsHeading: 'Examination results', additionalHeading: 'Supplementary information',
      certificatePurpose: 'Fitness for the stated position', decisionHeading: 'Doctor’s decision', reference: 'File no.',
      missingResultSenders: { militia: 'Militia headquarters', lot: 'LOT office' },
      stationery: { militia: 'Militia', lot: 'LOT' },
      letters: {
        missingResult: [
          { subject: 'Concerning enclosures', body: 'The required enclosure was absent on receipt of the certificate. The employee file shall be completed with the additional examination report.', role: 'Personnel manager', signature: 'Witold Krawiec' },
          { subject: 'Delivery of records', body: 'The employee file is missing an additional examination report. Please supply the report together with the work clearance certificate.', role: 'Personnel officer', signature: 'Irena Brzozowska' },
          { subject: 'Incomplete employee file', body: 'The cleared employee’s file remains incomplete. The relevant additional examination report must accompany the certificate.', role: 'Work organisation manager', signature: 'Jerzy Łukaszewski' },
          { subject: 'Objections to the records', body: 'Review of the supplied documents identified a missing enclosure. Please check the complete file and forward the examination report.', role: 'Company representative', signature: 'Barbara Wierzbicka' },
          { subject: 'Records supplement', body: 'The certificate arrived without the required additional examination report. Please complete the employee’s documentation.', role: 'Senior personnel officer', signature: 'Stefan Płatek' },
          { subject: 'Record of omissions', body: 'The absent examination report has been entered in the receipt log. Work clearance certificates shall be delivered with the report.', role: 'Administration manager', signature: 'Halina Orłowska' },
        ],
        zus: [
          { subject: 'Review of documentation', body: 'A further review of the certificate has been ordered. The examination records shall be retained in the clinic file until proceedings are complete.', role: 'Senior accounts clerk', signature: 'Maria Jarosz' },
          { subject: 'Benefit file supplement', body: 'A copy of the clinic certificate was added during the benefit review. Please confirm that the examination records are complete.', role: 'Benefits inspector', signature: 'Roman Głowacki' },
          { subject: 'Notice of file review', body: 'The proceedings require a fresh compilation of medical records. A certificate copy has joined the file. Please retain the originals.', role: 'Accounts clerk', signature: 'Teresa Biel' },
          { subject: 'Note concerning the records', body: 'The committee has reviewed the attachments. Verification of the records continues. A separate acknowledgment is not required.', role: 'Committee secretary', signature: 'Henryk Kulesza' },
          { subject: 'Document schedule', body: 'The file review produced a list of documents requiring clarification. Please quote this reference in any further correspondence.', role: 'Accounts inspector', signature: 'Zofia Rudzka' },
          { subject: 'Matter referred onward', body: 'The file has been passed to the appropriate office for further review. Please retain a copy of this notice in the clinic records.', role: 'Section head', signature: 'Adam Wilczyński' },
        ],
        employer: [
          { subject: 'Procedure initiated', body: 'Proceedings have been opened concerning the gap in staffing. A copy of the certificate and the employee’s examination records shall be retained.', role: 'Personnel manager', signature: 'Witold Krawiec' },
          { subject: 'Personnel notification', body: 'The matter was referred to personnel after the worker left the rota. Please confirm the date and scope of the examination.', role: 'Personnel clerk', signature: 'Irena Brzozowska' },
          { subject: 'Extract from the rota', body: 'Unstaffed hours for the referred position have been logged. A referral copy has joined the file. The matter awaits clarification.', role: 'Work planning manager', signature: 'Jerzy Łukaszewski' },
          { subject: 'Documents referred onward', body: 'Following consultation with personnel, the papers were passed for further review. Please retain all records relating to the certificate.', role: 'Company representative', signature: 'Barbara Wierzbicka' },
          { subject: 'Personnel findings', body: 'Internal findings on continuity of employment are complete. Please check the employee’s details against the issued certificate.', role: 'Senior personnel officer', signature: 'Stefan Płatek' },
          { subject: 'Register update', body: 'The matter has been entered in the register. A replacement rota has joined the file. Please quote the case reference in future letters.', role: 'Administration manager', signature: 'Halina Orłowska' },
        ],
      },
    },
    patientReferrals: [
      { employer: 'Brzask Works Archives', work: 'office work, filing', hazards: 'paper dust, sitting' },
      { employer: 'Ogniwo Engineering Works', work: 'overhead crane, shop floor', hazards: 'noise, working at height' },
      { employer: 'Szlak Staff Transport', work: 'passenger transport, shifts', hazards: 'traffic, prolonged sitting' },
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
    documentEmpty: 'RECORDS GO HERE', awaitingDocument: 'REFERRAL IN THE TRAY',
    general: 'General examination — examine the patient', generalResult: 'General examination', generalClear: 'no concerns', generalConcern: 'abnormal findings', leftEye: 'LE', rightEye: 'RE', pressureUnit: 'mmHg', veryHigh: 'very high',
    generalFindings: [
      'heart murmur', 'irregular pulse', 'wheezing', 'crackles at lung bases',
      'lower-leg swelling', 'hand tremor', 'impaired balance', 'weak hand grip',
      'limited shoulder movement', 'weakness in left leg', 'reduced finger sensation',
      'tenderness under right ribs', 'enlarged liver', 'enlarged neck lymph nodes',
      'breathless on light exertion', 'bluish lips', 'marked hoarseness', 'swollen knee joint',
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
      "hospitalBody": "The hundred stayed in your pocket, the refusal with the patient. You are beaten up on the way home. You wake up in hospital. After treatment, you will need an occupational health exam. This time across the desk.",
      "gameOver": "GAME OVER",
      "backToMenu": "MAIN MENU",
      "directives": {
        "additional-tests": {
          "subject": "Additional examinations",
          "body": "Tests are instituted: furnace work — hearing; pilots — balance; militia — psychiatry; miners — X-ray. Forms shall be drawn from the third rack slot. One test is circled; records retained. Return: today or next workday. Indications: rulebook.",
          "role": "Medical Chamber secretary",
          "signature": "dr Adam Pieczęć"
        },
        "dates": {
          "subject": "Validity of referrals",
          "body": "Referral dates shall be verified. Documents older than 3 days require refusal; those exactly 3 days old remain valid. This provision takes effect on the date of this notice.",
          "role": "ZUS inspection office",
          "signature": "Irena Stempel"
        },
        "specialist": {
          "subject": "Hypertension under supervision",
          "body": "Treated hypertension may be cleared upon a specialist certificate stating no contraindications for the specific job. A different occupation invalidates it. Any doubts shall be clarified by telephone.",
          "role": "Medical Chamber secretary",
          "signature": "dr Adam Pieczęć"
        },
        "authenticity": {
          "subject": "On authentic referrals",
          "body": "From the date of this notice, referrals require the employer’s seal. Its absence requires refusal. An illegible impression shall be confirmed by personnel using the number on the form.",
          "role": "ZUS inspection office",
          "signature": "Irena Stempel"
        }
      }
    },
    inspection: {
      title: 'ZUS INSPECTION', inspector: 'ZUS inspector', identity: 'OFFICIAL IDENTITY CARD',
      names: ['Marian Zawadzki', 'Irena Borucka', 'Tadeusz Radecki'],
      number: 'Service no.', role: 'Records inspection', validity: 'Return after inspection.',
      authority: 'Authorized to inspect records', takeId: 'Examine the inspector’s identity card', returnId: 'Return the inspector’s identity card',
      hand: 'Present records to the inspector', talk: 'Speak to the inspector', confirm: 'Confirm missing records and end the inspection',
      greeting: 'ZUS inspection. Please check my identity card.', idReminder: 'Please return my identity card.',
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
      { title: '5. Required scope', lines: ['The referral code defines', 'the required scope:', 'WC — vision and pressure;', 'W — vision; C — pressure.', 'General examination, weight', 'and height apply to all.', 'Managerial rank grants', 'no exemption from weighing.'],
        facingTitle: '6. Vision assessment', facingLines: ['LE and RE shall be recorded', 'separately, in diopters.', 'For codes W and WC,', 'a defect over 6 diopters', 'in either eye warrants', 'refusal, regardless of sign.', 'At exactly 6, the doctor', 'shall consider the history', 'and general state of health.'] },
      { title: '7. Blood pressure', lines: ['For C and WC, limits are', '160 mmHg systolic', 'or 100 diastolic. Within', '5 mmHg on either side,', 'the doctor shall consider', 'history and general health.', 'Exceeding this range', 'in either value warrants', 'refusal.'],
        facingTitle: '8. Recording readings', facingLines: ['The first two readings', 'shall be retained.', 'At 180 systolic or', '110 diastolic, red ink', 'shall be used.', 'The absence of red ink', 'does not constitute', 'clearance for work.'] },
      { title: '9. Use of stamps', lines: ['The decision shall be', 'stamped on the certificate.', 'After use, the stamp', 'remains in the doctor’s hand.', 'It shall be returned only', 'to its designated holder.', 'Amendments are permitted', 'until the form is delivered.'],
        facingTitle: '10. Delivery', facingLines: ['The pen on the form shall', 'enter the name and job.', 'The stamped certificate', 'shall be given to the patient.', 'This concludes the visit.', 'Placing the certificate', 'in the tray does not', 'constitute delivery.'] },
      { title: '11. Joining records', lines: ['A clip shall be attached', 'to the first sheet.', 'Add sheets against that clip.', 'Removing the clip', 'separates the records.', 'The referral and visit note', 'from every appointment', 'shall both be archived', 'in either desk drawer.'],
        facingTitle: '12. Correspondence', facingLines: ['Letters from ZUS and', 'employers shall be opened', 'at the envelope corner', 'and read before filing', 'or disposal in the basket.', 'The absence of a letter', 'does not certify that', 'a ruling was correct.'] },
      { title: '13. Admission hours', lines: ['Admissions shall run', 'from 07:55 to 14:00.', 'After that hour, only', 'the current visit continues.', 'Reading these regulations', 'and arranging the desk', 'count towards working time.', 'The clock requires no action.'],
        facingTitle: '14. Closing procedure', facingLines: ['At 17:00 the cleaning staff', 'shall request work to end.', 'At 17:15 the office closes,', 'including when occupied', 'by a patient. Interrupted', 'visits earn no bonus.', 'Records already prepared', 'shall remain on file.'] },
      { title: '15. Remuneration', lines: ['Each working day earns', '1000 zł, plus 50 zł for', 'each completed visit.', 'Settlement takes place', 'on returning home.', 'Living costs, insurance', 'and amounts due shall be', 'deducted from available funds.'],
        facingTitle: '16. ZUS charges', facingLines: ['The first detected breach', 'of the day incurs a fine', 'of 100 zł. Each further', 'breach incurs 400 zł.', 'Approval requires regard', 'to health and the current', 'clinic regulations.'] },
      { title: '17. Insurance', lines: ['A detected wrongful refusal', 'raises the premium by 50 zł', 'at 300 zł, or by 100 zł', 'at higher rates. This rate', 'applies on later days too.', 'Each day without a new rise', 'reduces it by 50 zł,', 'to a minimum of 300 zł.'],
        facingTitle: '18. Days off', facingLines: ['Friday, Saturday and Sunday', 'share a single settlement.', 'Insurance is charged once;', 'days off carry no wages.', 'Modest living costs 800 zł', 'for all three days.', 'Insurance and fines are extra.', 'Failure to cover these costs', 'results in bankruptcy.'] },
    ],
    manualSupplements: {
      inspection: { label: 'Records audit', pages: [
        { title: '1. Identification', lines: ['A ZUS inspector presents', 'an official identity card.', 'The card shall be examined', 'and returned to its holder.', 'On request, present both', 'the referral and visit note', 'for the specified visit.', 'Earlier records remain', 'on file across working days.'],
          facingTitle: '2. Missing records', facingLines: ['Both documents are required.', 'They may be presented singly', 'or clipped together.', 'The doctor confirms loss', 'when asked by the inspector.', 'Both missing: 200 zł.', 'One missing: 50 zł.', 'The inspector issues a notice.', 'The fine enters the budget.'] },
      ] },
      dates: { label: "Annex 1", pages: [
        { title: "1. Referral date", lines: ["Under the ZUS directive,", "the referral’s issue date", "shall be checked.", "Its age is calculated", "in calendar days relative", "to the date of the visit."],
          facingTitle: "2. Period of validity", facingLines: ["A referral more than", "three days old requires", "refusal. Exactly three days", "remains within the limit.", "Good health does not", "extend this period."] },
      ] },
      specialist: { label: "Erratum 1 — provision 7", pages: [
        { title: "1. Hypertension", lines: ["The Medical Chamber permits", "an exception to provision 7.", "A specialist must certify", "treatment for hypertension", "and no contraindications", "for the particular job", "named in the referral."],
          facingTitle: "2. Scope of exception", facingLines: ["A certificate for another", "job is invalid.", "Clarification is available", "from its issuer at the", "number on the form.", "Record the call in the notes.", "Other contraindications", "and defects in paperwork", "still require refusal."] },
      ] },
      authenticity: { label: "Annex 2", pages: [
        { title: "1. Employer seal", lines: ["Under the ZUS directive,", "the employer’s seal", "shall be required.", "Its absence requires refusal.", "A clear seal confirms", "the referral’s authenticity."],
          facingTitle: "2. Unclear impression", facingLines: ["An unclear seal shall be", "confirmed with HR using", "the number on the form.", "Conclusions shall be entered", "in the medical notes.", "An inauthentic document", "requires refusal."] },
      ] },
      payments: { label: "Supplement 1", pages: [
        { title: "1. Personal payments", lines: ["Cash from a patient", "does not replace certificates", "or amend examination limits."],
          facingTitle: "2. Returning cash", facingLines: ["Before issuing a refusal,", "the full sum shall be returned.", "The clinic does not provide", "personal protection", "for the journey home."] },
      ] },
      additionalTests: { label: "Annex 3", pages: [
        { title: '1. Additional tests', lines: ['Under the Chamber directive:', 'furnace work — pure-tone', 'audiometry; pilots —', 'vestibular examination;', 'militia — psychiatry for', 'mental disturbance or doubts', 'about fitness for service;', 'miners — chest X-ray for', 'suspected pneumoconiosis.'],
          facingTitle: '2. Referral procedure', facingLines: ['Forms shall be taken from', 'the third rack slot from', 'the top. One test shall be', 'circled and the form', 'handed to the patient.', 'Other records are retained.', 'A test for another occupation', 'always incurs a ZUS fine.'] },
        { title: '3. Scope of opinion', lines: ['Assess the opinion within', 'the scope of its examination.', 'Where findings are equivocal,', 'the doctor shall rule using', 'the history, general health', 'and working conditions.', 'Other contraindications', 'and defects in paperwork', 'require separate assessment.'],
          facingTitle: '4. Return visits', facingLines: ['Patients return with results', 'after several hours and', 'intervening admissions,', 'or on the next working day.', 'Existing notes and completed', 'examinations remain in use.', 'Issuing a referral does not', 'constitute a completed visit.'] },
        { title: '5. Delivering results', lines: ['After an additional test,', 'an employee cleared for work', 'shall receive the certificate', 'paperclipped to the relevant', 'examination report.', 'With a refusal, the report', 'is optional; the employee', 'will accept the bundle.'],
          facingTitle: '6. Missing enclosure', facingLines: ['Omitting the required report', 'always brings a reprimand', 'and an insurance increase.', 'The letter comes from', 'militia headquarters, the LOT', 'office or the workplace,', 'according to employment.', 'Detection applies in 100%', 'of these cases.'] },
      ] },
    },
    lamp: 'Toggle the ceiling lamp', decoration: 'Change decoration: plant or certificate',
    shiftDone: 'SHIFT COMPLETE', shiftDoneNote: 'Even a stamp deserves a rest.',
    nextDay: 'NEXT SHIFT', endDay: 'GO HOME', points: 'SAVINGS', queue: 'SEEN',
    cabinetHelp: 'Call a patient with the bell on the left desk. Move the rulebook from the left to the right desk to open it. Giving the certificate to the patient ends the visit. Time also passes between actions: 30 seconds equal 30 minutes with a patient or 5 minutes without one.',
    patientNames: PATIENTS.map(patient => {
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
      'inspector-arrived': 'A ZUS inspector is waiting. Examine and return the identity card.',
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
      'referral-penalty': 'The patient has left for a test. A referral unrelated to the occupation incurs a ZUS fine.',
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
