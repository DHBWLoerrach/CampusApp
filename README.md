# CampusApp
DHBW Lörrach Campus App

Android:
https://play.google.com/store/apps/details?id=de.dhbwloe.loerrach.campusapp

iOS:
https://itunes.apple.com/de/app/dhbw-lorrach-campus-app/id1106917276

## Setup

Assuming that React Native is already installed (see [React Native Docs](https://reactnative.dev/docs/environment-setup)), follow these steps:

1. clone project with git (`git clone git@github.com:DHBWLoerrach/CampusApp.git`)
2. in terminal, change to CampusApp directory (`cd CampusApp`)
3. install npm packages (preferably by executing `yarn` &mdash; `npm install`
   might also work)
4. copy env.example.js to env.js (here you might need to fill in some data to
   get enable all features &mdash; get in contact with the maintainer of this
   repository)

## Launch app in iOS simulator (Mac only)

XCode needs to be installed.

Open terminal and cd into CampusApp directory. 

`cd ios` and install dependencies with `pod install` (for this you'll need
[CocoaPods](https://cocoapods.org/)) 

`podopen iOS project in XCode:

`open ios/CampusApp.xcodeproj`

In XCode, build the project (`Product > Build` oder `CMD-B`). Once finished, XCode can be quit. This has to be done only once.

Now switch back to the terminal and run

`react-native run-ios`

## Launch app in Android simulator

Please refer to https://facebook.github.io/react-native/docs/getting-started

## Launch app on Android device

See also https://facebook.github.io/react-native/docs/running-on-device

Make sure Android device is in debug mode (enable developer options) and connect device via USB.

To access the development server from the Android device you need to use 'adb reverse':

`adb -d reverse tcp:8081 tcp:8081`

Open terminal/console, cd into CampusApp directory and run

`react-native run-android`

## Live Reload and Debugging

Please refer to the React Native documentation to learn about live/hot reloading
and debugging options (http://facebook.github.io/react-native/docs/debugging.html)

## License

BSD 3-clause
