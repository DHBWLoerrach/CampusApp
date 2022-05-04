import notifee, { AndroidImportance } from '@notifee/react-native';
import FetchManager, {
  DHBW_EVENTS,
  DHBW_NEWS,
} from '../fetcher/FetchManager';
import { dhbwRed } from '../Colors';
import { getDay } from '../../tabs/schedule/store';
import { loadNotificationSettings } from '../../tabs/service/SettingsHelper';

async function localPush(title, body) {
  // Create a channel --> required on Android
  // (ignored on iOS and gracefully ignored on Android if channel already exists)
  const channelId = await notifee.createChannel({
    id: 'dhbw-channel',
    name: 'DHBW Channel',
    importance: AndroidImportance.LOW,
  });

  // Display the notification
  notifee.displayNotification({
    title,
    body,
    android: {
      channelId,
      smallIcon: 'ic_launcher_foreground',
      color: dhbwRed,
      importance: AndroidImportance.LOW,
    },
    ios: {
      badgeCount: 1, // iOS: badge count always shows as 1
    },
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
