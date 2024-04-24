# CampusApp

Offizielle Campus App der [Dualen Hochschule Baden-Württemberg Lörrach](https://www.dhbw-loerrach.de) (DHBW Lörrach).

Die App wird plattformübergreifend mit [React Native](https://www.reactnative.dev) entwickelt und ist für Android-Geräte und das iPhone im PlayStore bzw. AppStore erhältlich.

Android:
https://play.google.com/store/apps/details?id=de.dhbwloe.loerrach.campusapp

iPhone/iOS:
https://itunes.apple.com/de/app/dhbw-lorrach-campus-app/id1106917276

## Setup des Projekts für Entwickler

Es wird vorausgesetzt, dass eine vollständige Entwicklungsumgebung für React Native environment installiert wurde (die Campus App basiert nicht auf Expo). Weitere Informationen dazu finden sich im Abschnitt _React Native CLI Quickstart_ in der [React Native Dokumentation](https://reactnative.dev/docs/environment-setup).

Danach sind folgende Schritte durchzuführen:

1. Das Projekt mit git klonen:

   `git clone git@github.com:DHBWLoerrach/CampusApp.git`

2. In der Kommandozeilenumgebung in das Projektverzeichnis `CampusApp` wechseln:

   `cd CampusApp`

3. Die Abhängigkeiten bzw. npm-Pakete in NodeJS installieren, idealerweise mit `yarn`:

   `npm install`

4. Kopiere `env.example.js` als neue Datei `env.js`:

   `cp env.example.js env.js`

5. Die Datei `env.js` muss mit zusätzlichen Infos wie API-Keys befüllt werden &mdash; diese sind vom _Project Owner_ erhältlich.

## Projekt starten

Mit dem Befehl

`npm start`

wird der Entwicklungsserver (Metro-Bundler) für das Projekt gestartet mit dem sich die App vom Emulator/Simulator oder von einem Smartphone verbindet (siehe folgende Abschnitte).

## App im Android-Emulator ausführen

Dies wird beschrieben im Abschnitt _React Native CLI Quickstart_ in der [React Native Dokumentation](https://reactnative.dev/docs/environment-setup). Unter anderem muss hierzu Android Studio installiert werden.

Campus App auf dem Android-Emulator starten:

`react-native run-android`

Falls `react-native` nicht als Befehl im System bekannt ist,
sollte folgender Aufruf mit `npx` funktionieren:

`npx react-native start`

## App mit Android-Geräten nutzen

Siehe dazu die [React Native Dokumentation](https://reactnative.dev/docs/running-on-device).

Terminal öffnen und in das Projektverzeichnis `CampusApp` wechseln. Dort müssen weitere Abhängigkeiten installiert werden:

1. Ins Unterverzeichnis `android` wechseln:

   `cd ios`

2. Ein Textfile mit dem Namen `local.properties` erstellen

   `nano local.properties`

3. Dort je nach Betriebsystem einfügen:

   Windows: `sdk.dir = C:\\Users\\USERNAME\\AppData\\Local\\Android\\sdk`
   Mac: `sdk.dir = /Users/USERNAME/Library/Android/sdk`
   Linux: `sdk.dir = /home/USERNAME/Android/Sdk`

   (USERNAME mit PC Username austauschen)

Campus App auf dem Android-Gerät starten:

`react-native run-android`

(oder `npx react-native run-android`)

## App im iOS-Simulator starten (funktioniert nur auf macOS)

XCode muss installiert werden (z.B. aus dem AppStore). Zusätzlich wird [CocoaPods](https://cocoapods.org/) benötigt.

Terminal öffnen und in das Projektverzeichnis `CampusApp` wechseln. Dort müssen weitere Abhängigkeiten installiert werden:

1. Ins Unterverzeichnis `ios` wechseln:

   `cd ios`

2. Abhängigkeiten via CocoaPods installieren:

   `pod install`

Campus App im iOS simulator starten:

`react-native run-ios`

(oder `npx react-native run-ios`)

## Lizenz

[BSD 3-clause](./LICENSE)
