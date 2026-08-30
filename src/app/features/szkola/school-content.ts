export interface SchoolLink {
  label: string;
  url: string;
  external?: boolean;
}

export interface SchoolSection {
  heading: string;
  body?: string[];
  links?: SchoolLink[];
}

export interface SchoolPage {
  slug: string;
  title: string;
  subtitle?: string;
  sections: SchoolSection[];
}

export const SCHOOL_PAGES: Record<string, SchoolPage> = {
  partnerzy: {
    slug: 'partnerzy',
    title: 'Partnerzy szkoły',
    subtitle: 'Patronaty i współpraca ZCKOiZ z firmami oraz uczelniami',
    sections: [
      {
        heading: 'Klasa patronacka KAEFER',
        body: [
          'Zabrzańskie Centrum Kształcenia Ogólnego i Zawodowego w Zabrzu, wychodząc naprzeciw potrzebom rynku pracy, po raz kolejny tworzy klasę patronacką. Tym razem młodzież kształci się w zawodzie monter izolacji przemysłowych.',
          'Klasę swoim patronatem objęła firma KAEFER SA, działająca w wielu branżach przemysłowych — od przemysłu naftowego, gazowego, energetycznego i farmaceutycznego, po górnictwo, przemysł stoczniowy i budownictwo.',
        ],
        links: [
          { label: 'KAEFER SA — oficjalna strona', url: 'https://www.kaefer.pl/Home.html', external: true },
        ],
      },
      {
        heading: 'Patronat naukowy Politechniki Śląskiej',
        body: [
          'Wydział Mechaniczny Technologiczny Politechniki Śląskiej w Gliwicach objął patronatem naukowym uczniów i nauczycieli ZCKOiZ w Zabrzu.',
          'Celem porozumienia jest rozwój kontaktów w sferze działań dydaktycznych, stworzenie możliwości rozwoju indywidualnych zainteresowań i umiejętności uczniów oraz prowadzenie wymiany doświadczeń.',
        ],
        links: [
          { label: 'Wydział Mechaniczny Technologiczny', url: 'https://www.polsl.pl/rmt/', external: true },
        ],
      },
    ],
  },
  dyrekcja: {
    slug: 'dyrekcja',
    title: 'Dyrekcja',
    subtitle: 'Władze Zabrzańskiego Centrum Kształcenia Ogólnego i Zawodowego',
    sections: [
      {
        heading: 'Dyrektor szkoły',
        body: [
          'Na czele szkoły stoi Dyrektor, który odpowiada za całokształt działań dydaktycznych, wychowawczych i opiekuńczych placówki.',
          'Dyrekcję wspomagają wicedyrektorzy oraz grono pedagogiczne szkoły.',
        ],
      },
      {
        heading: 'Godziny przyjęć',
        body: [
          'Szczegółowe informacje dotyczące godzin przyjęć interesantów znajdują się w sekretariacie szkoły oraz w zakładce Kontakt.',
        ],
      },
    ],
  },
  sekretariat: {
    slug: 'sekretariat',
    title: 'Sekretariat',
    subtitle: 'Obsługa uczniów, rodziców i interesantów',
    sections: [
      {
        heading: 'Informacje',
        body: [
          'Sekretariat szkoły obsługuje uczniów, rodziców oraz osoby z zewnątrz w godzinach pracy szkoły.',
          'Kontakt telefoniczny i e-mailowy znajduje się w zakładce Kontakt.',
        ],
      },
    ],
  },
  specjalisci: {
    slug: 'specjalisci',
    title: 'Specjaliści',
    subtitle: 'Pedagog, psycholog i doradca zawodowy',
    sections: [
      {
        heading: 'Zespół specjalistów',
        body: [
          'W szkole dostępni są specjaliści wspierający uczniów: pedagog szkolny, psycholog oraz doradca zawodowy.',
          'Godziny pracy specjalistów dostępne są u wychowawców oraz w sekretariacie szkoły.',
        ],
      },
    ],
  },
  biblioteka: {
    slug: 'biblioteka',
    title: 'Biblioteka',
    subtitle: 'Biblioteka szkolna ZCKOiZ',
    sections: [
      {
        heading: 'Godziny otwarcia i zbiory',
        body: [
          'Biblioteka szkolna udostępnia zbiory książkowe, lektury oraz pomoc w nauce.',
          'Zapraszamy uczniów do korzystania z zasobów biblioteki w godzinach jej otwarcia.',
        ],
      },
    ],
  },
  'rajd-po-zabrzu': {
    slug: 'rajd-po-zabrzu',
    title: 'Rajd po Zabrzu',
    subtitle: 'Integracyjny rajd uczniów ZCKOiZ',
    sections: [
      {
        heading: 'O rajdzie',
        body: [
          'Rajd po Zabrzu to cykliczne wydarzenie integracyjne organizowane dla uczniów szkoły, mające na celu poznanie historii i atrakcji miasta.',
        ],
      },
    ],
  },
  historia: {
    slug: 'historia',
    title: 'Historia',
    subtitle: 'Historia ZCKOiZ w Zabrzu',
    sections: [
      {
        heading: 'Tradycja kształcenia zawodowego',
        body: [
          'Zabrzańskie Centrum Kształcenia Ogólnego i Zawodowego to szkoła techniczna z długą tradycją kształcenia zawodowego w wielu branżach.',
          'Przez ponad czterdziestoletni okres funkcjonowania na lokalnym rynku edukacyjnym szkoła wykształciła wielu fachowców z różnych branż i dziedzin zawodowych — specjalistów, managerów, kadrę zarządzającą, artystów, naukowców i polityków.',
        ],
      },
    ],
  },
  statut: {
    slug: 'statut',
    title: 'Statut ZCKOiZ',
    subtitle: 'Statut Zabrzańskiego Centrum Kształcenia Ogólnego i Zawodowego',
    sections: [
      {
        heading: 'Statut szkoły',
        body: [
          'Pełny tekst statutu szkoły dostępny jest w zakładce Dokumenty.',
        ],
        links: [
          { label: 'Przejdź do dokumentów', url: '/dokumenty' },
        ],
      },
    ],
  },
  rodo: {
    slug: 'rodo',
    title: 'RODO ZCKOiZ',
    subtitle: 'Ochrona danych osobowych',
    sections: [
      {
        heading: 'Informacja o przetwarzaniu danych',
        body: [
          'Administratorem danych osobowych jest Zabrzańskie Centrum Kształcenia Ogólnego i Zawodowego w Zabrzu.',
          'Szczegółowe informacje dotyczące ochrony danych osobowych dostępne są w sekretariacie szkoły.',
        ],
      },
    ],
  },
  'rada-rodzicow': {
    slug: 'rada-rodzicow',
    title: 'Rada Rodziców',
    subtitle: 'Współpraca rodziców ze szkołą',
    sections: [
      {
        heading: 'Rada Rodziców',
        body: [
          'Rada Rodziców reprezentuje ogół rodziców uczniów oraz współpracuje z dyrekcją i gronem pedagogicznym na rzecz rozwoju szkoły.',
        ],
      },
    ],
  },
  'dla-rodzica': {
    slug: 'dla-rodzica',
    title: 'Dla rodzica',
    subtitle: 'Informacje przydatne rodzicom',
    sections: [
      {
        heading: 'Materiały dla rodziców',
        body: [
          'W zakładce Dokumenty oraz Dla rodzica znajdą Państwo przydatne informacje dotyczące życia szkoły.',
        ],
        links: [
          { label: 'Przejdź do dokumentów', url: '/dokumenty' },
        ],
      },
    ],
  },
  'zestaw-podrecznikow': {
    slug: 'zestaw-podrecznikow',
    title: 'Zestaw podręczników',
    subtitle: 'Szkolny zestaw podręczników',
    sections: [
      {
        heading: 'Podręczniki',
        body: [
          'Szkolny zestaw podręczników ogłaszany jest przez dyrektora szkoły przed rozpoczęciem roku szkolnego.',
        ],
      },
    ],
  },
  'wychowawcy-klas': {
    slug: 'wychowawcy-klas',
    title: 'Wychowawcy klas',
    subtitle: 'Wychowawcy poszczególnych klas',
    sections: [
      {
        heading: 'Wychowawcy',
        body: [
          'Lista wychowawców klas dostępna jest u koordynatorów oraz w sekretariacie szkoły.',
        ],
      },
    ],
  },
  samorzad: {
    slug: 'samorzad',
    title: 'Samorząd uczniowski',
    subtitle: 'Samorząd Uczniowski ZCKOiZ',
    sections: [
      {
        heading: 'Działalność samorządu',
        body: [
          'Samorząd uczniowski reprezentuje uczniów, organizuje życie szkolne i podejmuje działania na rzecz społeczności szkolnej.',
        ],
      },
    ],
  },
  'organizacja-roku': {
    slug: 'organizacja-roku',
    title: 'Organizacja roku szkolnego',
    subtitle: 'Kalendarz i organizacja roku szkolnego',
    sections: [
      {
        heading: 'Organizacja roku',
        body: [
          'Informacje o organizacji roku szkolnego, terminach przerw świątecznych i egzaminów dostępne są w sekretariacie szkoły.',
        ],
      },
    ],
  },
  'dni-wolne': {
    slug: 'dni-wolne',
    title: 'Dni wolne od zajęć lekcyjnych',
    subtitle: 'Dni wolne w roku szkolnym',
    sections: [
      {
        heading: 'Dni wolne',
        body: [
          'Harmonogram dni wolnych od zajęć lekcyjnych dostępny jest w sekretariacie szkoły.',
        ],
      },
    ],
  },
  regulamin: {
    slug: 'regulamin',
    title: 'Wewnątrzszkolny regulamin oceniania',
    subtitle: 'Regulamin zachowania i oceniania',
    sections: [
      {
        heading: 'Regulamin',
        body: [
          'Pełna treść regulaminu dostępna jest w zakładce Dokumenty.',
        ],
        links: [
          { label: 'Przejdź do dokumentów', url: '/dokumenty' },
        ],
      },
    ],
  },
  wymagania: {
    slug: 'wymagania',
    title: 'Wymagania edukacyjne',
    subtitle: 'Wymagania edukacyjne z przedmiotów',
    sections: [
      {
        heading: 'Wymagania edukacyjne',
        body: [
          'Wymagania edukacyjne z poszczególnych przedmiotów udostępniane są przez nauczycieli na początku roku szkolnego.',
        ],
      },
    ],
  },
};
