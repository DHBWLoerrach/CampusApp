import FetchManager, {DHBW_COURSE, DHBW_EVENTS, DHBW_NEWS} from "../fetcher/FetchManager";
import {dhbwRed} from "../Colors";

const PushNotification = require("react-native-push-notification");

async function NotificationTask() {
    const news = await FetchManager.getNewData(DHBW_NEWS);
    news.newItems.forEach(newItem => PushNotification.localNotification({title: "Neue DHBW News!", message: newItem.heading, smallIcon: "ic_launcher_foreground", color: dhbwRed}));
    const events = await FetchManager.getNewData(DHBW_EVENTS);
    events.newItems.forEach(newItem => PushNotification.localNotification({title: "Neuer DHBW Termin!", message: newItem.heading, smallIcon: "ic_launcher_foreground", color: dhbwRed}));
    console.log(news, events);
}
export default NotificationTask;
