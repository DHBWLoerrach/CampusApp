# TODOS

Check logs:

```
 WARN  [Reanimated] Reading from `value` during component render. Please ensure that you don't access the `value` property nor use `get` method of a shared value while React is rendering a component.
```

- Design Review (siehe GPT-5) für alle Screens?
- Welcome screen nicht in Webversion zeigen und Zustimmung/Rolle ignorieren
- Update App Store screenshots and description?
- Webapp immer wieder checken, ob sie noch funktioniert
- iPad?
- EAS updates:
  - https://expo.dev/blog/6-reasons-to-use-eas-update
  - https://expo.dev/blog/eas-update-best-practices

## Chores

- GPT5 im Webbrowser als Design-Experte nutzen
- GPT5 im Beast Mode in VS Code den Code konsistent machen lassen, best practices beachten, usw.
- Gelegentlich `npm run lint` ausführen
- allgemeine UI-Komponenten extrahieren

## DHBW screen

- Testen: neue News/Termin - refresh bei App-Neustart?
- mit ITS (A.R.) sprechen, um ggf. RSS zu vereinfachen

## Schedule screen

- vor Release --> Test: Vergleich Campus App mit online Kalender (mehrere Kurse!)
  - IDEE: ics-Daten aus OWA mit JS-Daten in App von KI vergleichen lassen… (oder Screenshots von OWA-Web)
  - Achtung: Bug bei Serienterminen beachten!
- Online-Termine farblich markieren?
- BBB-Links u.a. (Zoom?) klickbar machen?
- "Ganzer Tag" z.B. bei 3. Oktober in TIF-Kalendern
- verberge Sa/So in Kurskalender (außer bei Sa-Termine)
- Web: webmail-Kalender als iframe einbetten?
- Kursvalidierung: Unterschied zwischen Netzwerkfehler und Kurs nicht gefunden

## Canteen screen

- Speiseplan aus SWFR-API
- rechtzeitig am 10.09.25 Update mit Speiseplan

## Services screen

- Webversion: Modal für "Gebäude Hangstraße" oder andere Lösung?

## Automatisierte Tests

- https://expo.dev/blog/how-to-build-a-solid-test-harness-for-expo-apps
- https://expo.dev/blog/create-and-run-fast-end-to-end-tests-using-moropo-and-expo
- https://docs.expo.dev/eas/workflows/examples/e2e-tests/

## Stuff to check

- Export Router UI (anstelle react navigation?) https://docs.expo.dev/versions/latest/sdk/router-ui/
- Expo UI (native components) https://docs.expo.dev/versions/latest/sdk/ui/
- check common navigation patterns: https://docs.expo.dev/router/basics/common-navigation-patterns/
- Check unistyles?

- https://expo.dev/blog/unistyles-3-0-beyond-react-native-stylesheet
- https://www.unistyl.es/v3/tutorial/intro
