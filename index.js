import 'react-native-gesture-handler';
import { AppRegistry, Platform } from 'react-native';
import BackgroundFetch from 'react-native-background-fetch';
import CampusApp from './js/CampusApp';
import NotificationTask from './js/util/notifications/NotificationTask';

AppRegistry.registerComponent('CampusApp', () => CampusApp);

/// BackgroundFetch Android Headless Event Receiver.
/// Called when the Android app is terminated.
if (Platform.OS === 'android') {
  const backgroundFetchHeadlessTask = async (event) => {
    if (event.timeout) {
      BackgroundFetch.finish(event.taskId);
      return;
    }

    await NotificationTask();

    // Required:  Signal to native code that your task is complete.
    // If you don't do this, your app could be terminated and/or assigned
    // battery-blame for consuming too much time in background.
    BackgroundFetch.finish(event.taskId);
  };

  /// Register headless BackgroundFetch handler.
  BackgroundFetch.registerHeadlessTask(backgroundFetchHeadlessTask);
}
