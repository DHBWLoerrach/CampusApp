# TODOS

- Im Auge behalten: https://github.com/revtel/react-native-nfc-manager/releases (v4)
- Dokumentieren: AppStore release und EAS update workflow
  - z.B. version bump in app.json erst bevor der nächste AppStore release kommt
    - sonst funktionieren updates nicht, denn diese werden passend zur Version/Runtime ausgeliefert
  - im Prinzip nutzen wir EAS updates nur für Hotfixes der aktuellen Version?
- dev setup in README dokumentieren (build, .env, etc.)
- Design Review (siehe GPT-5) für alle Screens?
- iPad?
- können/sollen wir das aktive Update in "About" anzeigen?

## Carpooling

- Online-Termine rausnehmen
- Zielort berücksichtigen (TAR in Weil, andere in KBC usw.)
  - in JSON gruppieren oder nach Raum-Name filtern?
- Onboarding-UI
- Liste aller Kurse für Skript erstellen

## Webapp

- Wo deployen? EAS? eigener Server?
  - der API-Key für das SWFR wird dann schneller leaken als in den Apps…
  - momentan liegt der Key als sensitive Info als env-Var im EAS-Projekt in der Cloud
  - wir könnten den Key mit EAS Hosting in API-Route als echtes Secret nutzen…
    - …aber dann müssten wir auch den Code in der mobilen App anpassen…
      - …dennoch könnte es mittelfristig serverseitige Aktionen ermöglichen…
  - https://expo.dev/blog/what-are-environment-variables
- Webapp immer wieder checken, ob sie noch funktioniert
- Welcome screen nicht in Webversion zeigen und Zustimmung/Rolle ignorieren

## Chores

- ab und zu `npx expo-doctor` ausführen (Abhängigkeiten usw.)
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
- Liste: komisches Scrollverhalten wenn man unten ankommt (nachladen?)
- ScheduleView: Blättern im Header (< >) wechselt Monat?
- Web: webmail-Kalender als iframe einbetten?
- Kursvalidierung: Unterschied zwischen Netzwerkfehler und Kurs nicht gefunden

## Canteen screen

- APPSTORE: encrypt env-key? geht nur mit Server-Proxy… vielleicht too much

## Services screen

- Webversion: Modal für "Gebäude Hangstraße" oder andere Lösung?

## Automatisierte Tests

- https://expo.dev/blog/how-to-build-a-solid-test-harness-for-expo-apps
- https://expo.dev/blog/create-and-run-fast-end-to-end-tests-using-moropo-and-expo
- https://docs.expo.dev/eas/workflows/examples/e2e-tests/

## Stuff to check

- Expo UI (native components) https://docs.expo.dev/versions/latest/sdk/ui/
- check common navigation patterns: https://docs.expo.dev/router/basics/common-navigation-patterns/
- Check unistyles?

Siehe auch https://github.com/expo/examples

- https://www.youtube.com/live/TtmWw0NfsQk (NativeWind in Expo)
- https://expo.dev/blog/unistyles-3-0-beyond-react-native-stylesheet
- https://www.unistyl.es/v3/tutorial/intro
