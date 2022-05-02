import BackgroundFetch from 'react-native-background-fetch';
import NotificationTask from './NotificationTask';

export default function () {
  // BackgroundFetch event handler.
  const onEvent = async (taskId) => {
    await NotificationTask();
    BackgroundFetch.finish(taskId);
  };

  // Timeout callback is executed when your Task has exceeded its allowed running-time.
  // You must stop what you're doing immediately BackgroundFetch.finish(taskId)
  const onTimeout = async (taskId) => {
    console.warn('[BackgroundFetch] TIMEOUT task: ', taskId);
    BackgroundFetch.finish(taskId);
  };

  BackgroundFetch.configure(
    {
      minimumFetchInterval: 24 * 60, // once a day = 24 * 60 minutes
      requiredNetworkType: BackgroundFetch.NETWORK_TYPE_UNMETERED,
      // Android options
      startOnBoot: true,
      stopOnTerminate: false,
      enableHeadless: true, // handling fetch events after app termination.
    },
    onEvent,
    onTimeout
  );
}
