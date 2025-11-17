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

5. Development prebuild erstellen (erzeugt `android`-Projektordner und auf macOS auch das iOS-Projekt im Ordner `ios`):

   `npx expo prebuild`

6. Development build bauen und ausführen:

Vorbedingungen:

- Android Studio bzw. das Android SDK muss für die Android-App installiert sein
- Nur für macOS relevant: XCode muss installiert sein

- Android `npx expo run:android` 
- iOS (nur auf macOS möglich): `npx expo run:ios`

7. Ein development build muss nur dann neu erstellt werden, wenn die (nativen) Abhängigkeiten sich geändert haben. Sobald auf dem Testgerät ein Dev-Build installiert ist, reicht 

  `npx expo`

womit der Entwicklungsserver (Metro-Bundler) für das Projekt gestartet wird (Ausgabe für Tipps zum Start der App beachten). 

## Lizenz

[MIT](./LICENSE)
