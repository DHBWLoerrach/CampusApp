import FetchManager, {DHBW_COURSE, DHBW_EVENTS, DHBW_NEWS} from "../fetcher/FetchManager";
import AsyncStorage from '@react-native-community/async-storage';

async function NotificationTask() {
    const news = await FetchManager.fetch(DHBW_NEWS, true);
    const events = await FetchManager.fetch(DHBW_EVENTS, true);
    const course = await FetchManager.fetch(DHBW_COURSE);
    saveFetchedData([news, events, course]);
}

function saveFetchedData(items) {
    AsyncStorage.setItem("notificationTaskCache", items);
}

export default NotificationTask;
