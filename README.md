# CampusApp

Offizielle Campus App der [Dualen Hochschule Baden-Württemberg Lörrach](https://www.dhbw-loerrach.de) (DHBW Lörrach).

Die App wird plattformübergreifend mit [React Native](https://www.reactnative.dev) und [Expo](https://expo.dev) entwickelt und ist für Android-Geräte und das iPhone im PlayStore bzw. AppStore erhältlich.

Android:
https://play.google.com/store/apps/details?id=de.dhbwloe.loerrach.campusapp

iPhone/iOS:
https://itunes.apple.com/de/app/dhbw-lorrach-campus-app/id1106917276

## Setup des Projekts für Entwickler

1. Das Projekt mit git klonen:

   `git clone git@github.com:DHBWLoerrach/CampusApp.git`

2. In der Kommandozeilenumgebung in das Projektverzeichnis `CampusApp` wechseln:

   `cd CampusApp`

3. Die Abhängigkeiten bzw. npm-Pakete in Node.js installieren:

   `npm install`

4. Benötigte API-Keys (z.B. für die Mensa des SWFR) vom Projektverantwortlichen anfordern und in eine Datei `.env` eintragen

## Projekt starten

Mit dem Befehl

`npx expo`

wird der Entwicklungsserver (Metro-Bundler) für das Projekt gestartet.

Nun kann die App getestet werden:

- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo
- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)

TODO: Infos zum development build usw.

## Lizenz

[MIT](./LICENSE)
