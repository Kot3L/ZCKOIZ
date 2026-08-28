# ZCKOiZ Zabrze — strona + panel administracyjny

Nowoczesna strona internetowa Zespołu Centrów Kształcenia Zawodowego w Zabrzu wraz z panelem administracyjnym.

## Technologie

- **Angular 22** (standalone components, SSR/prerendering, control flow)
- **Tailwind CSS v4** (motyw wizualny w `src/styles.scss`)
- **Supabase** (baza danych + auth + storage)
- Wspólna nawigacja, stopka, SEO (title/description/OG) dla każdej podstrony

## Struktura

```
src/app/
  core/            # serwisy (Supabase, SEO), modele, guardy
  shared/          # komponenty współdzielone (navbar, footer, karty, lightbox...)
  features/        # podstrony publiczne (home, oferta, aktualnosci, galeria, ...)
  admin/           # panel administracyjny (logowanie + CRUD + użytkownicy)
supabase/migrations/   # migracje bazy (schema, RLS, seed, storage)
```

## Uruchomienie

1. Zainstaluj zależności:
   ```bash
   npm install
   ```

2. Skonfiguruj Supabase:
   - Skopiuj `src/environments/.env.example` → `src/environments/environment.ts`
   - Wklej swój `SUPABASE_URL` i `SUPABASE_ANON_KEY`

3. Wdróż migracje bazy do projektu Supabase (np. przez `supabase db push` lub konsolę SQL), w kolejności:
   - `0001_schema.sql` — tabele i funkcje
   - `0002_rls.sql` — polityki bezpieczeństwa (Row Level Security)
   - `0003_seed.sql` — treści startowe
   - `0004_storage.sql` — bucket i polityki storage

4. Uruchom dev server:
   ```bash
   npm start
   ```

5. Zbuduj produkcyjnie:
   ```bash
   npm run build
   ```

## Panel administracyjny

- Dostęp: `/admin`
- Logowanie e-mail + hasło (Supabase Auth)
- Dwie role:
  - **admin** — wszystko + zarządzanie użytkownikami i rolami
  - **redaktor** — edycja treści (aktualności, oferta, galeria, dokumenty, kadra/kontakt)

Pierwszego administratora utwórz przez konsolę Supabase (Auth → dodaj użytkownika),
następnie ręcznie dodaj rekord w tabeli `user_roles` (rola `admin`) albo w konsoli SQL.

## Baza danych

Tabele: `profiles`, `user_roles` (enum `app_role`), `news`, `programs`, `gallery_albums`,
`gallery_images`, `documents`, `staff`, `site_settings`.

Bezpieczeństwo:
- Publiczny odczyt tylko opublikowanych treści (`anon` SELECT)
- Zapis tylko dla ról admin/editor — sprawdzane funkcją `has_role` (security definer)
- GRANT-y dla `anon`/`authenticated`/`service_role`
- Storage: publiczny bucket `media` (zdjęcia i dokumenty), upload tylko dla zalogowanych z rolą

## Motyw wizualny

Komiksowy charakter — kolory z logo:
- pomarańcz/ceglany (akcent główny), turkus/petrol (drugorzędny), żółty (badge),
  głęboka czerń konturu + kremowe tło
- nieregularne obramowania i cienie offsetowe na kartach i przyciskach
- halftone (kropki) w tle hero
- typografia: Oswald (nagłówki) + Inter (treść)
- oszczędne animacje (podniesienie karty, wejścia sekcji)

Tokeny kolorów, tekstury i komponenty CSS zdefiniowane w `src/styles.scss`.
