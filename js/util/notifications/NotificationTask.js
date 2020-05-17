import FetchManager, {DHBW_COURSE, DHBW_EVENTS, DHBW_NEWS} from "../fetcher/FetchManager";
import AsyncStorage from '@react-native-community/async-storage';

const PushNotification = require("react-native-push-notification");

async function NotificationTask() {
    PushNotification.localNotification({title: "Background Task", message: "Fetching News"});
    const news = await FetchManager.getNewData(DHBW_NEWS);
    news.newItems.forEach(newItem => PushNotification.localNotification({title: "Neue News", message: newItem.title}));
    const events = await FetchManager.getNewData(DHBW_EVENTS);
    events.newItems.forEach(newItem => PushNotification.localNotification({title: "Neues DHBW Event", message: newItem.title}));
    console.log(news, events);
}
export default NotificationTask;
