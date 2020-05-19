import FetchManager, {DHBW_COURSE, DHBW_EVENTS, DHBW_NEWS} from "../fetcher/FetchManager";
import {dhbwRed} from "../Colors";
import {getDay} from "../../tabs/schedule/store";

const PushNotification = require("react-native-push-notification");

async function NotificationTask() {
    const news = await FetchManager.getNewData(DHBW_NEWS);
    news.newItems.forEach(newItem =>
        PushNotification.localNotification({
            title: "Neue DHBW News!",
            message: newItem.heading,
            smallIcon: "ic_launcher_foreground",
            color: dhbwRed
        })
    );
    const events = await FetchManager.getNewData(DHBW_EVENTS);
    events.newItems.forEach(newItem => PushNotification.localNotification({
        title: "Neuer DHBW Termin!",
        message: newItem.heading,
        smallIcon: "ic_launcher_foreground",
        color: dhbwRed})
    );
    const lectures = await FetchManager.getNewData(DHBW_COURSE);
    lectures.newItems.forEach(newItem =>
        PushNotification.localNotification({
            title: "Vorlesung hinzugefügt!",
            message: newItem.title + " am " + getDay(Date.parse(newItem.startDate)),
            smallIcon: "ic_launcher_foreground",
            color: dhbwRed
        })
    );
    lectures.removedItems.forEach(removedItem =>
        PushNotification.localNotification({
            title: "Vorlesung entfernt!",
            message: removedItem.title + " am " + getDay(Date.parse(removedItem.startDate)),
            smallIcon: "ic_launcher_foreground",
            color: dhbwRed
        })
    );
    console.log(news, events, lectures);
}
export default NotificationTask;
