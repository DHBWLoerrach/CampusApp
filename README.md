# CampusApp
DHBW Lörrach Campus App

Android:
https://play.google.com/store/apps/details?id=de.dhbwloe.loerrach.campusapp

iOS:
https://itunes.apple.com/de/app/dhbw-lorrach-campus-app/id1106917276

## Setup

Assuming that React Native is already installed (see http://facebook.github.io/react-native/docs/getting-started.html), follow these steps:

1. clone project with git (`git clone git@github.com:DHBWLoerrach/CampusApp.git`)
2. in terminal, change to CampusApp directory (`cd CampusApp`)
3. install npm packages (`npm install`)
4. copy env.example.js to env.js (here you might need to fill in some data)

## Launch app in iOS simulator (Mac only)

XCode needs to be installed.

Open terminal, cd into CampusApp directory and open iOS project in XCode:

`open ios/CampusApp.xcodeproj`

In XCode, build the project (`Product > Build` oder `CMD-B`). Once finished, XCode can be quit. This has to be done only once.

Now switch back to the terminal and run

`react-native run-ios`

## Launch app in Android simulator

Please refer to http://facebook.github.io/react-native/docs/getting-started.html

## Launch app on Android device

See also http://facebook.github.io/react-native/docs/running-on-device-android.html

Make sure Android device is in debug mode (enable developer options) and connect device via USB.

To access the development server from the Android device you need to use 'adb reverse':

`adb -d reverse tcp:8081 tcp:8081`

Open terminal/console, cd into CampusApp directory and run

`react-native run-android`

## Live Reload and Debugging

Please refer to the React Native documentation to learn how about live/hot reloading
and debugging options (http://facebook.github.io/react-native/docs/debugging.html)

## License

BSD 3-clause
