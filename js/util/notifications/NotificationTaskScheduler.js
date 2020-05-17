import BackgroundFetch from "react-native-background-fetch";
import NotificationTask from "./NotificationTask";
import * as PushNotification from "react-native-push-notification";

export default function () {
    BackgroundFetch.configure({
        minimumFetchInterval: 15,
        stopOnTerminate: false,
        startOnBoot: true,
        requiredNetworkType: BackgroundFetch.NETWORK_TYPE_UNMETERED,
        enableHeadless: true
    }, async (taskId) => {
        await NotificationTask();
        BackgroundFetch.finish(taskId);
    });
    PushNotification.localNotification({title: "Foreground Task", message: "This is foreground"});
}
