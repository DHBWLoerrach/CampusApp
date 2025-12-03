# Implementierungsplan: Unit-Tests für CampusApp

## Übersicht

Dieser Plan beschreibt die Einführung von Unit-Tests für bestehende pure Funktionen im CampusApp-Projekt. Der Fokus liegt auf Funktionen mit klaren Ein-/Ausgaben und minimalen Abhängigkeiten.

---

## Phase 1: Test-Framework einrichten

### 1.1 Jest installieren und konfigurieren

```bash
npm install --save-dev jest @types/jest ts-jest
```

### 1.2 Jest-Konfiguration erstellen

Neue Datei `jest.config.js` im Root-Verzeichnis:

```js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/lib', '<rootDir>/constants'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
};
```

### 1.3 NPM-Script hinzufügen

In `package.json` ergänzen:

```json
"scripts": {
  "test": "jest",
  "test:watch": "jest --watch"
}
```

### 1.4 Bestehenden Test migrieren

- `lib/__tests__/nfcHelper.test.js` → `lib/__tests__/nfcHelper.test.ts` umwandeln
- Von `node:assert` auf Jest-Syntax (`expect()`) umstellen

---

## Phase 2: Einfache Utility-Funktionen testen (Low Effort)

### 2.1 `lib/__tests__/utils.test.ts` — 3 Funktionen

| Funktion           | Testfälle                                                                    |
| ------------------ | ---------------------------------------------------------------------------- |
| `toLocalISOString` | Formatierung mit verschiedenen Zeitzonen-Offsets, Mitternacht, Jahreswechsel |
| `splitLocation`    | URL extrahieren, nur Text, leerer String, `null`/`undefined`                 |
| `isOnlineEvent`    | URL vorhanden, "online" im Text, Groß-/Kleinschreibung, kein Match           |

### 2.2 `lib/__tests__/canteenService.test.ts` — Datums-Helfer (6 Funktionen)

| Funktion            | Testfälle                                                                                        |
| ------------------- | ------------------------------------------------------------------------------------------------ |
| `isWeekend`         | Samstag, Sonntag, Montag–Freitag                                                                 |
| `isSameCalendarDay` | Gleicher Tag verschiedene Uhrzeiten, verschiedene Tage                                           |
| `dateFromOffset`    | Positive/negative Offsets, 0                                                                     |
| `nextWeekdayStart`  | Freitag→Freitag, Samstag→Montag, Sonntag→Montag                                                  |
| `weekdayDates`      | Array-Länge, nur Wochentage enthalten                                                            |
| `priceForRole`      | Alle Rollen (`Studierende`, `Mitarbeitende`, `Lehrbeauftragte`, `Gast`), fehlende Preise, `null` |

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

| Funktion               | Zusätzliche Testfälle                                                |
| ---------------------- | -------------------------------------------------------------------- |
| `convertBytesToDouble` | Null-Balance, Maximum-Werte, ungültige Array-Längen (Error-Handling) |

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

## Zusammenfassung

| Phase | Dateien           | Funktionen    | Aufwand  |
| ----- | ----------------- | ------------- | -------- |
| 1     | Setup             | —             | ~30 Min  |
| 2     | 5 Test-Dateien    | 12 Funktionen | ~2–3 Std |
| 3     | 4 Test-Dateien    | 6 Funktionen  | ~3–4 Std |
| 4     | 2 Code-Änderungen | —             | ~15 Min  |

**Empfohlene Reihenfolge:** Phase 1 → Phase 2 → Phase 4 → Phase 3

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
```
