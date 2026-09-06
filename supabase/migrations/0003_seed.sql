-- ZCKOiZ Zabrze - seed data (based on existing site content)
-- Programs, news, staff, contact settings, hero slides

-- =====================================================================
-- PROGRAMS (Technikum)
-- =====================================================================
insert into public.programs (title, slug, description, what_you_learn, career_prospects, school_type, display_order, is_active) values
('Technik informatyk', 'technik-informatyk',
 'Kierunek łączący wiedzę z zakresu programowania, sieci komputerowych i administrowania systemami. Uczniowie zdobywają praktyczne umiejętności tworzenia aplikacji, konfigurowania sieci oraz zarządzania bazami danych.',
 'Podstaw programowania w językach Python, C++ i JavaScript, projektowania i administrowania bazami danych, konfigurowania sieci komputerowych, montażu i diagnozowania sprzętu komputerowego, tworzenia stron i aplikacji webowych, administrowania systemami operacyjnymi.',
 'Technik informatyk znajduje zatrudnienie jako administrator sieci, programista, specjalista ds. baz danych, tester oprogramowania czy administrator systemów IT. Absolwenci mogą pracować w firmach IT, bankach, instytucjach publicznych i przedsiębiorstwach każdej branży.',
 'technikum', 1, true),

('Technik logistyk', 'technik-logistyk',
 'Kierunek przygotowujący do planowania, organizowania i nadzorowania procesów logistycznych w przedsiębiorstwach. Uczniowie poznają obsługę magazynów, transportu i łańcuchów dostaw.',
 'Planowania i organizowania transportu oraz łańcuchów dostaw, obsługi magazynów i gospodarki zapasami, prowadzenia dokumentacji magazynowej i transportowej, obsługi systemów informatycznych wspomagających logistykę, negocjacji i obsługi klienta.',
 'Technik logistyk jest poszukiwany w firmach transportowych, magazynach, centrach dystrybucyjnych, firmach produkcyjnych i handlowych. Możliwa praca jako specjalista ds. logistyki, spedytor, magazynier, specjalista ds. zaopatrzenia.',
 'technikum', 2, true),

('Technik mechanik', 'technik-mechanik',
 'Kierunek dla uczniów zainteresowanych budową i eksploatacją maszyn i urządzeń. Uczniowie uczą się obsługi obrabiarek, wytwarzania części i montażu mechanizmów.',
 'Czytania rysunku technicznego, obsługi obrabiarek konwencjonalnych i CNC, wytwarzania części maszyn, montażu i demontażu urządzeń, diagnostyki i naprawy maszyn, technik obróbki metali i spawania.',
 'Technik mechanik może pracować w zakładach produkcyjnych i przemysłowych jako operator obrabiarek, mechanik, technolog czy kontroler jakości. Absolwenci znajdują zatrudnienie w przemyśle maszynowym, motoryzacyjnym i metalowym.',
 'technikum', 3, true),

('Technik elektryk', 'technik-elektryk',
 'Kierunek kształcący w zakresie instalacji elektrycznych, maszyn i urządzeń elektrycznych oraz automatyki przemysłowej.',
 'Montażu i konserwacji instalacji elektrycznych, pomiarów parametrów obwodów elektrycznych, naprawy maszyn i urządzeń elektrycznych, projektowania prostych instalacji, obsługi układów automatyki i sterowania.',
 'Technik elektryk pracuje przy instalacjach elektrycznych, w zakładach energetycznych, firmach instalacyjno-elektrycznych oraz przemyśle. Możliwa praca jako elektryk, monter, automatyk lub technik utrzymania ruchu.',
 'technikum', 4, true),

('Technik grafiki i poligrafii cyfrowej', 'technik-grafiki-i-poligrafii-cyfrowej',
 'Kierunek dla kreatywnych uczniów zainteresowanych grafiką komputerową, projektowaniem i przygotowaniem materiałów do druku.',
 'Projektowania grafik komputerowych, obróbki zdjęć i materiałów graficznych, przygotowania plików do druku, obsługi programów graficznych (Photoshop, Illustrator, InDesign), projektowania stron i materiałów reklamowych.',
 'Absolwenci pracują jako graficy komputerowi, projektanci DTP, specjaliści ds. poligrafii, projektanci stron internetowych i materiałów reklamowych w agencjach reklamowych, drukarniach i działach marketingu.',
 'technikum', 5, true);

-- =====================================================================
-- PROGRAMS (Branżowa)
-- =====================================================================
insert into public.programs (title, slug, description, what_you_learn, career_prospects, school_type, display_order, is_active) values
('Mechanik monter maszyn i urządzeń', 'mechanik-monter-maszyn',
 'Kierunek branżowy dla uczniów ceniących praktyczną naukę zawodu. Kształcenie odbywa się we współpracy z pracodawcami, z dużą ilością zajęć praktycznych.',
 'Montażu i demontażu maszyn i urządzeń, obsługi narzędzi i przyrządów pomiarowych, diagnostyki uszkodzeń, konserwacji i naprawy maszyn, czytania dokumentacji technicznej.',
 'Absolwenci mogą pracować jako monterzy maszyn w zakładach produkcyjnych, warsztatach i firmach serwisowych. Kierunek umożliwia dalszą naukę w technikum lub szkole policealnej.',
 'branzowa', 1, true),

('Elektromechanik', 'elektromechanik',
 'Kierunek branżowy kształcący w zakresie montażu, obsługi i naprawy urządzeń elektrycznych i elektromechanicznych.',
 'Montażu i konserwacji urządzeń elektromechanicznych, naprawy silników i urządzeń elektrycznych, obsługi narzędzi pomiarowych, diagnozowania i usuwania usterek.',
 'Elektromechanicy znajdują zatrudnienie w zakładach przemysłowych, firmach elektrycznych, serwisach AGD i RTV oraz przy instalacjach elektroenergetycznych.',
 'branzowa', 2, true),

('Kucharz', 'kucharz',
 'Kierunek branżowy dla uczniów, którzy chcą związać swoją przyszłość z gastronomią. Nauka obejmuje zarówno teorię, jak i praktykę w szkolnej pracowni gastronomicznej.',
 'Przygotowywania potraw kuchni polskiej i światowej, obsługi urządzeń gastronomicznych, sporządzania menu i kalkulacji kosztów, zasad bezpieczeństwa i higieny pracy, dekorowania i podawania potraw.',
 'Kucharze znajdują zatrudnienie w restauracjach, hotelach, stołówkach, firmach cateringowych. Kierunek umożliwia dalsze kształcenie w technikum gastronomicznym.',
 'branzowa', 3, true);

-- =====================================================================
-- NEWS
-- =====================================================================
insert into public.news (title, slug, content, excerpt, status, published_at) values
('Rozpoczęcie rekrutacji na rok szkolny 2025/2026',
 'rozpoczecie-rekrutacji-2025-2026',
 'Informujemy, że rekrutacja do klas pierwszych Technikum i Branżowej Szkoły I Stopnia na rok szkolny 2025/2026 została rozpoczęta.\n\nZapraszamy wszystkich zainteresowanych ósmoklasistów oraz ich rodziców do zapoznania się z naszą ofertą edukacyjną dostępną w zakładce "Oferta".\n\nDokumenty rekrutacyjne można pobrać z zakładki "Dokumenty". W razie pytań serdecznie zapraszamy do kontaktu z sekretariatem szkoły.',
 'Trwa rekrutacja do klas pierwszych Technikum i Branżowej Szkoły I Stopnia na rok szkolny 2025/2026. Zapraszamy do zapoznania się z ofertą!',
 'published', now() - interval '7 days'),

('Dzień otwarty w ZCKOiZ',
 'dzien-otwarty-zckoiz',
 'Serdecznie zapraszamy wszystkich zainteresowanych na Dzień Otwarty naszej szkoły!\n\nPodczas wydarzenia będzie można:\n- zwiedzić pracownie zawodowe,\n- porozmawiać z nauczycielami i uczniami,\n- poznać szczegóły oferty edukacyjnej,\n- zobaczyć szkołę od kuchni.\n\nZapraszamy w godzinach 9:00 - 14:00.',
 'Zapraszamy na Dzień Otwarty. Poznaj naszą szkołę, pracownie i ofertę edukacyjną!',
 'published', now() - interval '3 days'),

('Udział uczniów w konkursie zawodowym',
 'udzial-w-konkursie-zawodowym',
 'Nasi uczniowie reprezentowali szkołę w wojewódzkim konkursie zawodowym, uzyskując bardzo dobre wyniki.\n\nGratulujemy wszystkim uczestnikom i życzymy dalszych sukcesów!\n\nWięcej informacji o osiągnięciach naszych uczniów znajdziecie w zakładce Aktualności i Galeria.',
 'Nasi uczniowie z sukcesami reprezentowali szkołę w konkursie zawodowym. Gratulacje!',
 'published', now() - interval '1 day'),

('Wyniki egzaminów zawodowych',
 'wyniki-egzaminow-zawodowych',
 'Informujemy, że wyniki egzaminów zawodowych zostały opublikowane.\n\nGratulujemy wszystkim zdającym, którzy uzyskali tytuł zawodowy. Życzymy dalszych sukcesów w karierze zawodowej!\n\nWyniki dostępne są w systemie informatycznym oraz u wychowawców.',
 'Opublikowano wyniki egzaminów zawodowych. Gratulujemy zdającym!',
 'draft', null);

-- =====================================================================
-- STAFF
-- =====================================================================
insert into public.staff (full_name, position, department, email, is_management, display_order) values
('mgr Anna Nowak', 'Dyrektor szkoły', 'Dyrekcja', 'dyrektor@zckoiz.zabrze.pl', true, 1),
('mgr Piotr Kowalski', 'Zastępca dyrektora ds. dydaktycznych', 'Dyrekcja', 'wicedyrektor@zckoiz.zabrze.pl', true, 2),
('mgr Małgorzata Wiśniewska', 'Zastępca dyrektora ds. wychowawczych', 'Dyrekcja', 'wicedyrektor.wych@zckoiz.zabrze.pl', true, 3),
('mgr Tomasz Zieliński', 'Nauczyciel przedmiotów informatycznych', 'Informatyka', 't.zielinski@zckoiz.zabrze.pl', false, 1),
('mgr Katarzyna Lewandowska', 'Nauczyciel przedmiotów ekonomicznych', 'Ekonomia', 'k.lewandowska@zckoiz.zabrze.pl', false, 2),
('mgr Michał Wójcik', 'Nauczyciel przedmiotów mechanicznych', 'Mechanika', 'm.wojcik@zckoiz.zabrze.pl', false, 3),
('mgr Agnieszka Kamińska', 'Nauczyciel przedmiotów elektrycznych', 'Elektrotechnika', 'a.kaminska@zckoiz.zabrze.pl', false, 4),
('mgr Rafał Mazur', 'Nauczyciel wychowania fizycznego', 'Wychowanie fizyczne', 'r.mazur@zckoiz.zabrze.pl', false, 5),
('mgr Ewa Szymańska', 'Pedagog szkolny', 'Pedagogika', 'e.szymanska@zckoiz.zabrze.pl', false, 6);

-- =====================================================================
-- SITE SETTINGS
-- =====================================================================
insert into public.site_settings (key, value) values
('contact_address', 'Marszałka J. Piłsudskiego 58, Zabrze 41-800'),
('contact_email', 'sekretariat@zckoiz.zabrze.pl'),
('contact_phone', '+48 32 271 27 67'),
('hero_slides', jsonb_build_array(
  jsonb_build_object('id', '1', 'title', 'Kształcimy profesjonalistów', 'subtitle', 'Technikum i Branżowa Szkoła I Stopnia. Wybierz kierunek i rozpocznij karierę zawodową.', 'link_url', '/oferta', 'link_label', 'Poznaj ofertę', 'image_url', null, 'display_order', 1, 'is_active', true),
  jsonb_build_object('id', '2', 'title', 'Trwa rekrutacja 2025/2026', 'subtitle', 'Zapisz się już dziś! Sprawdź naszą ofertę i dołącz do grona naszych uczniów.', 'link_url', '/kontakt', 'link_label', 'Skontaktuj się', 'image_url', null, 'display_order', 2, 'is_active', true)
)::text),
('site_name', 'ZCKOiZ Zabrze');
