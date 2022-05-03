import PushNotification from 'react-native-push-notification';
import FetchManager, {
  DHBW_EVENTS,
  DHBW_NEWS,
} from '../fetcher/FetchManager';
import { dhbwRed } from '../Colors';
import { getDay } from '../../tabs/schedule/store';
import { loadNotificationSettings } from '../../tabs/service/SettingsHelper';

function localPush(title, message) {
  PushNotification.localNotification({
    title: title, // required on Android,iOS
    message: message, // optional on Android,iOS
    channelId: 'dhbw-channel', // required on Android
    smallIcon: 'ic_launcher_foreground', // optional on Android
    color: dhbwRed, // optional on Android (earlier Versions)
  });
}

async function NotificationTask() {
  const settings = await loadNotificationSettings();
  if (settings == null) return;

  const newsNotifications = [];
  const eventsNotifications = [];

  if (settings.notificationdhbwNews) {
    const newItems = await FetchManager.getNewData(DHBW_NEWS);
    newItems.forEach((newItem) =>
      newsNotifications.push({
        title: 'Neue DHBW News',
        message: newItem.heading,
      })
    );
  }

  if (settings.notificationdhbwEvents) {
    const newItems = await FetchManager.getNewData(DHBW_EVENTS);
    newItems.forEach((newItem) =>
      eventsNotifications.push({
        title: 'Neue DHBW Termin',
        message:
          newItem.heading + ' am ' + getDay(Date.parse(newItem.time)),
      })
    );
  }

  if (
    newsNotifications.length > 0 &&
    eventsNotifications.length > 0
  ) {
    localPush(
      'DHBW Lörrach Campus App',
      'Es gibt News und neue Termine'
    );
  } else if (newsNotifications.length > 1) {
    localPush('DHBW Lörrach Campus App', 'Es gibt neue DHBW News');
  } else if (newsNotifications.length === 1) {
    localPush(
      newsNotifications[0].title,
      newsNotifications[0].message
    );
  } else if (eventsNotifications.length > 1) {
    localPush('DHBW Lörrach Campus App', 'Es gibt neue DHBW Termine');
  } else if (eventsNotifications.length === 1) {
    localPush(
      eventsNotifications[0].title,
      eventsNotifications[0].message
    );
  }
}
export default NotificationTask;
