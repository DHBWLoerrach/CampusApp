# Implementierungsplan: Unit-Tests für CampusApp

## Übersicht

Dieser Plan beschreibt die schrittweise Einführung von Tests für das CampusApp-Projekt:

1. **Phase 1–4:** Unit-Tests für pure Funktionen (Utilities, Parser)
2. **Phase 5:** Component- und Hook-Tests (React Native Testing Library)
3. **Ausblick:** Integration- und E2E-Tests

---

## Phase 1: Test-Framework einrichten ✅ Erledigt

### 1.1 Jest installieren und konfigurieren

✅ Bereits konfiguriert in `package.json`:

- `jest-expo` Preset
- `@types/jest` für TypeScript
- `npm test` Script

### 1.2 Bestehenden Test migrieren

✅ `lib/__tests__/nfcHelper.test.ts` existiert bereits mit Jest-Syntax

---

## Phase 2: Einfache Utility-Funktionen testen (Low Effort)

### 2.1 `lib/__tests__/utils.test.ts` — 3 Funktionen

| Funktion           | Testfälle                                                                    |
| ------------------ | ---------------------------------------------------------------------------- |
| `toLocalISOString` | Formatierung mit verschiedenen Zeitzonen-Offsets, Mitternacht, Jahreswechsel |
| `splitLocation`    | URL extrahieren, nur Text, leerer String, `null`/`undefined`                 |
| `isOnlineEvent`    | URL vorhanden, "online" im Text, Groß-/Kleinschreibung, kein Match           |

### 2.2 `lib/__tests__/canteenService.test.ts` — Datums-Helfer (6 Funktionen)

| Funktion            | Testfälle                                                                                          |
| ------------------- | -------------------------------------------------------------------------------------------------- |
| `isWeekend`         | Samstag, Sonntag, Montag–Freitag                                                                   |
| `isSameCalendarDay` | Gleicher Tag verschiedene Uhrzeiten, verschiedene Tage                                             |
| `dateFromOffset`    | Positive/negative Offsets, 0                                                                       |
| `nextWeekdayStart`  | Wochentage unverändert, Samstag→Montag, Sonntag→Montag                                             |
| `weekdayDates`      | Array-Länge, nur Wochentage enthalten                                                              |
| `priceForRole`      | Alle Rollen (inkl. Mapping `Gast`→`Gäste`, `Mitarbeitende`→`Angestellte`), fehlende Preise, `null` |

### 2.3 `constants/__tests__/CourseAliases.test.ts`

| Funktion             | Testfälle                                                                                  |
| -------------------- | ------------------------------------------------------------------------------------------ |
| `resolveCourseAlias` | Bekannte Aliase auflösen, unbekannte Eingabe zurückgeben, Normalisierung (trim, lowercase) |

### 2.4 `constants/__tests__/FeatureFlags.test.ts`

| Funktion                      | Testfälle                                                                                         |
| ----------------------------- | ------------------------------------------------------------------------------------------------- |
| `parseBoolEnv` (exportieren!) | `'true'`, `'false'`, `'1'`, `'0'`, `'on'`, `'off'`, `'yes'`, `'no'`, `undefined`, ungültige Werte |

### 2.5 `lib/__tests__/canteenClosures.test.ts`

| Funktion            | Testfälle                                                                   |
| ------------------- | --------------------------------------------------------------------------- |
| `getCanteenClosure` | Datum innerhalb Schließzeit, davor, danach, Grenzfälle (erster/letzter Tag) |

---

## Phase 3: Komplexere Parser testen (Medium Effort)

### 3.1 `lib/__tests__/canteenService.parsing.test.ts`

| Funktion                      | Testfälle                                                                                  |
| ----------------------------- | ------------------------------------------------------------------------------------------ |
| `normalizeCanteenData`        | Gültiges XML, leere Antwort, fehlerhafte Struktur                                          |
| `mealsForDate`                | Exaktes Datum, verschiedene Datumsformate (`yyyy-MM-dd`, `dd.MM.yyyy`), kein Treffer       |
| `summarizeAllergensAndLabels` | Einzelne Allergene, Kombinationen, "glutenfrei" nicht als Gluten erkennen, Alkohol-Hinweis |

**Voraussetzung:** Sample-XML als Fixture-Datei in `lib/__tests__/fixtures/canteen-sample.xml`

### 3.2 `lib/__tests__/rssParser.test.ts`

| Funktion                      | Testfälle                                                |
| ----------------------------- | -------------------------------------------------------- |
| `parseRSSFeed` (exportieren!) | Standard-RSS, CDATA-Inhalte, fehlende Felder, Enclosures |

**Voraussetzung:**

- `parseRSSFeed` exportieren (aktuell nur intern)
- Sample-RSS als Fixture

### 3.3 `lib/__tests__/icalService.test.ts`

| Funktion             | Testfälle                                                                         |
| -------------------- | --------------------------------------------------------------------------------- |
| `__parseIcalForTest` | Einfache Events, wiederkehrende Events, Multi-Day-Events, Timezone-Normalisierung |

**Voraussetzung:** Sample-ICS als Fixture (kann aus `scripts/sample-recurring.ics` abgeleitet werden)

### 3.4 `lib/__tests__/nfcHelper.test.ts` erweitern

✅ Bereits implementiert mit umfassenden Tests:

- Gültige Eingaben (Balance + letzte Transaktion)
- Null-Balance, große Werte
- Fehlerbehandlung (ungültige Array-Längen)

**Hinweis:** Rückgabetyp ist `{ balance: number, lastTransaction: number }`, nicht `{ euro, cent }`.

---

## Phase 4: Code-Anpassungen für Testbarkeit

### 4.1 Funktionen exportieren

| Datei                       | Zu exportieren |
| --------------------------- | -------------- |
| `constants/FeatureFlags.ts` | `parseBoolEnv` |
| `lib/rssParser.ts`          | `parseRSSFeed` |

### 4.2 Interne Helfer optional exportieren

Falls tiefere Tests gewünscht:

- `lib/canteenService.ts`: `normalizeDateString`, `xmlMenueToMeal`
- `lib/icalService.ts`: `normalizeTimezones`, `structureEventsByDay`

---

## Phase 5: Component- und Hook-Tests

### 5.1 Setup

```bash
npm install --save-dev @testing-library/react-native
```

In `jest.config.js` oder `package.json` ggf. `transformIgnorePatterns` anpassen für React Native Module.

### 5.2 Hook-Tests — `hooks/__tests__/`

| Hook             | Testfälle                                                                |
| ---------------- | ------------------------------------------------------------------------ |
| `useTimetable`   | Initialer State, erfolgreicher Fetch (gemockt), Fehlerfall, Reload-Logik |
| `useRidesIndex`  | Daten laden, leere Antwort, Fehlerbehandlung                             |
| `useColorScheme` | System-Präferenz übernehmen, manuelles Umschalten                        |

**Hinweis:** `renderHook` aus `@testing-library/react-native` verwenden.

### 5.3 Component-Tests — `components/__tests__/`

| Komponente       | Testfälle                                               |
| ---------------- | ------------------------------------------------------- |
| `LectureCard`    | Rendering mit Props, Online-Event-Icon, Tap-Interaktion |
| `CanteenDayView` | Mahlzeiten anzeigen, Schließungshinweis, leerer Zustand |
| `RSSFeedList`    | Liste rendern, Pull-to-Refresh, Fehler-State            |
| `ThemedText`     | Dark/Light Mode Styling                                 |
| `CourseSetup`    | Eingabe validieren, Kurs speichern                      |

**Mocking-Strategie:**

- `AsyncStorage` → `@react-native-async-storage/async-storage/jest/async-storage-mock`
- Navigation → `jest.mock('@react-navigation/native')`
- Context-Provider wrappen für Theme/Role/Course

### 5.4 Beispiel-Teststruktur

```typescript
import { render, screen, fireEvent } from '@testing-library/react-native';
import { LectureCard } from '../schedule/LectureCard';

describe('LectureCard', () => {
  const mockLecture = {
    title: 'Mathematik I',
    startTime: new Date('2025-12-03T09:00:00'),
    endTime: new Date('2025-12-03T10:30:00'),
    location: 'Raum 101',
  };

  it('renders lecture title and time', () => {
    render(<LectureCard lecture={mockLecture} />);
    expect(screen.getByText('Mathematik I')).toBeTruthy();
    expect(screen.getByText(/09:00/)).toBeTruthy();
  });

  it('shows online icon for online events', () => {
    render(
      <LectureCard
        lecture={{ ...mockLecture, location: 'https://zoom.us/123' }}
      />
    );
    expect(screen.getByTestId('online-icon')).toBeTruthy();
  });
});
```

---

## Ausblick: Integration- und E2E-Tests

### Integration Tests

- Zusammenspiel von Fetch → Parse → Display
- Context-Provider mit echten Komponenten
- Mocking auf Netzwerkebene (`msw` oder `jest.mock('fetch')`)

### E2E Tests (optional)

| Tool    | Eignung                                                |
| ------- | ------------------------------------------------------ |
| Maestro | Einfaches YAML-basiertes Setup, gut für schnelle Flows |
| Detox   | Tiefere Integration, besser für komplexe Szenarien     |

**Mögliche E2E-Flows:**

- Kurs auswählen → Stundenplan laden → Vorlesung anzeigen
- Mensa-Tab öffnen → Tagesmenü anzeigen
- News laden → Artikel öffnen

---

## Zusammenfassung

| Phase | Dateien           | Funktionen/Komponenten | Aufwand     |
| ----- | ----------------- | ---------------------- | ----------- |
| 1     | Setup             | —                      | ✅ Erledigt |
| 2     | 5 Test-Dateien    | 12 Funktionen          | ~2–3 Std    |
| 3     | 3 Test-Dateien    | 5 Funktionen           | ~3–4 Std    |
| 4     | 2 Code-Änderungen | —                      | ~15 Min     |
| 5     | ~8 Test-Dateien   | 3 Hooks, 5 Komponenten | ~4–6 Std    |

**Empfohlene Reihenfolge:** Phase 1 → Phase 2 → Phase 4 → Phase 3 → Phase 5

---

## Test-Datei-Struktur nach Implementierung

```
lib/
  __tests__/
    fixtures/
      canteen-sample.xml
      rss-sample.xml
      schedule-sample.ics
    canteenClosures.test.ts
    canteenService.test.ts
    canteenService.parsing.test.ts
    icalService.test.ts
    nfcHelper.test.ts
    rssParser.test.ts
    utils.test.ts
constants/
  __tests__/
    CourseAliases.test.ts
    FeatureFlags.test.ts
hooks/
  __tests__/
    useTimetable.test.ts
    useRidesIndex.test.ts
    useColorScheme.test.ts
components/
  __tests__/
    LectureCard.test.tsx
    CanteenDayView.test.tsx
    RSSFeedList.test.tsx
    ThemedText.test.tsx
    CourseSetup.test.tsx
```
