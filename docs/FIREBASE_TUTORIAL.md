# Firebase — pełny tutorial konfiguracji bazy dla ZCKOiZ Zabrze

Ta instrukcja prowadzi krok po kroku od zera do działającej bazy **Firebase Firestore** + **Authentication** + **Storage** dla tej strony.

**Ważne:** aplikacja ma teraz **jednego administratora i żadnych ról/rany** — każdy zalogowany użytkownik jest z automatu administratorem (`FirebaseService.isAdmin === isLoggedIn`). Nie ma kolekcji `user_roles`, logowanie = pełny dostęp do panelu `/admin`.

Kod jest już w pełni przygotowany pod Firebase (`core/services/firebase.service.ts`) — wystarczy uzupełnić klucze i utworzyć strukturę w konsoli.

---

## 1. Utwórz projekt Firebase

1. Wejdź na https://console.firebase.google.com i zaloguj się kontem Google.
2. Kliknij **„Dodaj projekt" (Add project)**.
3. Nazwa projektu — cokolwiek, np. `zckoiz-zabrze`. (Identyfikator projektu użyjesz w kodzie.)
4. Google Analytics możesz **wyłączyć** (niepotrzebne).
5. Kliknij **Utwórz projekt** i poczekaj.

---

## 2. Zarejestruj aplikację (Web) i wyciągnij klucze konfiguracyjne

1. W konsoli: **Projekt Settings → General** (ikona ⚙ w lewym dolnym rogu).
2. W sekcji *Your apps* kliknij **Web (</>)**.
3. Nazwa aplikacji (np. `zckoiz-web`) → **Register app**.
4. Skopiuj blok konfiguracji SDK:

```js
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "zckoiz-zabrze.firebaseapp.com",
  projectId: "zckoiz-zabrze",
  storageBucket: "zckoiz-zabrze.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:123...:web:abc..."
};
```

5. **Skopiuj te 6 wartości** do obu plików:
   - `src/environments/environment.ts`
   - `src/environments/environment.prod.ts`

```ts
export const environment = {
  production: false,      // w environment.prod.ts: true
  firebase: {
    apiKey: 'AIza...',
    authDomain: 'zckoiz-zabrze.firebaseapp.com',
    projectId: 'zckoiz-zabrze',
    storageBucket: 'zckoiz-zabrze.appspot.com',
    messagingSenderId: '1234567890',
    appId: '1:123...:web:abc...',
  },
};
```

> `apiKey` NIE jest tajny (po to jest publiczny). Zabezpieczenie danych zapewniają **reguły Firestore** (krok 8).

---

## 3. Włącz Firestore

1. Menu po lewej: **Firestore Database**.
2. **Create database**.
3. **Location**: `eur3 (europe-west)` — najbliżej Polski.
4. Tryb reguł: **production mode**.
5. **Enable**.

---

## 4. Włącz Authentication (logowanie admina)

1. Menu: **Authentication → Get started**.
2. **Sign-in method** → **Email/Password** → włącz → **Save**.

---

## 5. Włącz Storage (obrazki i pliki)

1. Menu: **Storage → Get started**.
2. Ta sama lokalizacja co Firestore → **Done**.

---

## 6. Utwórz konto administratora

1. **Authentication → Users** → **Add user**.
2. Podaj email + hasło — to jedyne konto dostępu do panelu `/admin`.
3. Po zalogowaniu w aplikacji jest ono automatycznie **administratorem** (nie trzeba konfigurować ról).

---

## 7. Utwórz strukturę Firestore (kolekcje)

W **Firestore Database → Data** utwórz kolekcje (przycisk **Start collection**). Firestore tworzy kolekcję automatycznie przy pierwszym dokumencie — po dodaniu jednego dokumentu w kolekcji, możesz zostawić resztę pól do uzupełnienia w panelu admina.

| Kolekcja | Uwagi |
|---|---|
| `news` | aktualności |
| `programs` | kierunki kształcenia |
| `gallery_albums` | albumy galerii |
| `gallery_images` | zdjęcia w albumach |
| `documents` | dokumenty do pobrania |
| `staff` | kadra |
| `site_settings` | ustawienia strony (np. slajdy hero) |

> **Nie ma kolekcji `user_roles`** — jest tylko jeden administrator, bez ról.

---

## 8. Kształt dokumentów (schemat pól)

Serwis `FirebaseService` mapuje każde pole 1:1 (jak w `database.types.ts`):

**`news`** — `title`, `slug`, `content`, `excerpt`, `cover_image_url`, `status` (`published`/`draft`), `published_at`, `created_at`, `updated_at`

**`programs`** — `title`, `slug`, `description`, `what_you_learn`, `career_prospects`, `school_type` (`technikum`/`branzowa`), `icon_url`, `cover_image_url`, `display_order` (number), `is_active` (bool)

**`gallery_albums`** — `title`, `slug`, `description`, `cover_image_url`, `display_order`

**`gallery_images`** — `album_id`, `image_url`, `caption`, `display_order`

**`documents`** — `title`, `file_url`, `category`, `description`, `file_size` (number)

**`staff`** — `full_name`, `position`, `department`, `email`, `phone`, `photo_url`, `display_order` (number), `is_management` (bool)

**`site_settings`** — `key`, `value`

> `created_at`/`updated_at` serwis zapisuje sam jako stringi ISO. Pola `display_order`/`is_active` muszą być typu **number/bool** (nie string).

---

## 9. Reguły bezpieczeństwa (Security Rules)

Bez reguł Firestore **blokuje** wszystko. Ponieważ jest **jeden administrator** (każdy zalogowany), reguły są proste: odczyt publiczny, zapis tylko dla zalogowanych.

**Firestore → Rules**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Odczyt publiczny treści strony, zapis dla zalogowanych (admin)
    match /news/{id}            { allow read: if true; allow write: if request.auth != null; }
    match /programs/{id}        { allow read: if true; allow write: if request.auth != null; }
    match /gallery_albums/{id}  { allow read: if true; allow write: if request.auth != null; }
    match /gallery_images/{id}  { allow read: if true; allow write: if request.auth != null; }
    match /documents/{id}       { allow read: if true; allow write: if request.auth != null; }
    match /staff/{id}           { allow read: if true; allow write: if request.auth != null; }
    match /site_settings/{id}   { allow read: if true; allow write: if request.auth != null; }
  }
}
```

Kliknij **Publish**.

### Reguły Storage (obrazki/pliki)

**Storage → Rules**:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

---

## 10. Uruchom aplikację

1. Zapisz klucze w `environment.ts` / `environment.prod.ts` (krok 2).
2. Uruchom:
   ```bash
   ng serve
   # build produkcyjny:
   ng build
   ```
3. Wejdź na `/admin` → zaloguj się kontem z kroku 6.
4. Panel działa (odczyt/zapis pod regułami z kroku 9).

> **Uwaga o SSR:** `firebase` to biblioteka kliencka. W `FirebaseService` inicjalizacja Auth jest chroniona przez `isPlatformBrowser` (SSR/prerender), więc po stronie serwera nie wywołujemy Auth — strona się prerenderuje. Jeśli `ng build` zgłosi błąd o `global`/`document` w kontekście serwera, daj znać — dorzucę `provideServerRendering` + obejście (Firestore i tak działa po stronie klienta).

---

## 11. Panel admina — pierwszy raz

Aplikacja ma gotowy panel CRUD (Aktualności, Oferta, Galeria, Dokumenty, Kadra, Ustawienia) w `admin/`. Wszystkie zapisy/odczyty idą przez `FirebaseService`. Po zalogowaniu się administratora wszystko zapisuje się w kolekcjach z kroku 7.

---

## 12. Twardnienie zabezpieczeń (później, zalecane)

- Ogranicz zapis Storage do jednego, konkretnego UID (zamiast „każdego zalogowanego"). Reguły Storage nie widzą Firestore; możesz twardo wpisać UID danego użytkownika w regule:
  ```
  allow write: if request.auth != null && request.auth.uid == 'TU_WPISZ_UID_ADMINA';
  ```
- Jeśli zdecydujesz się kiedyś na więcej kont, wprowadź wtedy **Custom Claims** (`admin.setCustomUserClaims(...)` przez Admin SDK) i podepnij reguły pod `request.auth.token`.
- Włącz **Email enumeration protection** w Authentication → Settings.

---

## Podsumowanie kroków (checklista)

- [ ] 1. Projekt w konsoli Firebase
- [ ] 2. Zarejestrowana aplikacja Web + klucze w `environment*.ts`
- [ ] 3. Firestore włączony (region `eur3`)
- [ ] 4. Authentication: Email/Password włączony
- [ ] 5. Storage włączony
- [ ] 6. Konto administratora dodane w Auth (jedno, bez ról)
- [ ] 7. Kolekcje utworzone (bez `user_roles`)
- [ ] 8. Schemat pól zgodny z tabelą (krok 8)
- [ ] 9. Reguły Firestore + Storage opublikowane
- [ ] 10. `ng serve` → zalogowanie na `/admin` działa
- [ ] 12. Twardnienie zabezpieczeń przed publikacją
