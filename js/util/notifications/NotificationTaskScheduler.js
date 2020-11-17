import BackgroundFetch from 'react-native-background-fetch';
import NotificationTask from './NotificationTask';

export default function () {
  BackgroundFetch.configure(
    {
      minimumFetchInterval: 24 * 60, // once a day = 24 * 60 minutes
      stopOnTerminate: false,
      startOnBoot: true,
      requiredNetworkType: BackgroundFetch.NETWORK_TYPE_UNMETERED,
      enableHeadless: true,
    },
    async (taskId) => {
      await NotificationTask();
      BackgroundFetch.finish(taskId);
    }
  );
}
