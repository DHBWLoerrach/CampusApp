import PushNotification from 'react-native-push-notification';
import FetchManager, {
  DHBW_COURSE,
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

  if (settings.notificationdhbwNews) {
    const news = await FetchManager.getNewData(DHBW_NEWS);
    news.newItems.forEach((newItem) =>
      localPush('Neue DHBW News', newItem.heading)
    );
  }

  if (settings.notificationdhbwEvents) {
    const events = await FetchManager.getNewData(DHBW_EVENTS);
    events.newItems.forEach((newItem) =>
      localPush(
        'Neuer DHBW Termin',
        newItem.heading + ' am ' + getDay(Date.parse(newItem.time))
      )
    );
  }

  // TODO
  // if (settings.notificationschedule) {
  //   const lectures = await FetchManager.getNewData(DHBW_COURSE);
  //   lectures.newItems.forEach((newItem) => {
  //     const parsedStartDate = Date.parse(newItem.startDate);
  //     //Do not notify of modifications in the past
  //     if (new Date(parsedStartDate) < new Date()) {
  //       return;
  //     }
  //     PushNotification.localNotification({
  //       title: 'Vorlesung hinzugefügt:',
  //       message: newItem.title + ' am ' + getDay(parsedStartDate),
  //       smallIcon: 'ic_launcher_foreground',
  //       color: dhbwRed,
  //     });
  //   });
  //   lectures.removedItems.forEach((removedItem) => {
  //     const parsedStartDate = Date.parse(removedItem.startDate);
  //     //Do not notify of modifications in the past
  //     if (new Date(parsedStartDate) < new Date()) {
  //       return;
  //     }
  //     PushNotification.localNotification({
  //       title: 'Vorlesung entfernt:',
  //       message: removedItem.title + ' am ' + getDay(parsedStartDate),
  //       smallIcon: 'ic_launcher_foreground',
  //       color: dhbwRed,
  //     });
  //   });
  // }
}
export default NotificationTask;
