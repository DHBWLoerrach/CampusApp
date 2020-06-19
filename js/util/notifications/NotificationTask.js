import FetchManager, {
  DHBW_COURSE,
  DHBW_EVENTS,
  DHBW_NEWS,
} from '../fetcher/FetchManager';
import { dhbwRed } from '../Colors';
import { getDay } from '../../tabs/schedule/store';
import { loadNotificationSettings } from '../../tabs/service/SettingsHelper';

const PushNotification = require('react-native-push-notification');

async function NotificationTask() {
  console.log('Running Notification Task!');
  const settings = await loadNotificationSettings();
  console.log(settings);
  if (settings == null) {
    return;
  }
  if (!settings['notificationsEnabled']) {
    return;
  }

  if (settings['notificationdhbwNews']) {
    const news = await FetchManager.getNewData(DHBW_NEWS);
    news.newItems.forEach((newItem) =>
      PushNotification.localNotification({
        title: 'Neue DHBW News:',
        message: newItem.heading,
        smallIcon: 'ic_launcher_foreground',
        color: dhbwRed,
      })
    );
    console.log('news', news);
  }

  if (settings['notificationdhbwEvents']) {
    const events = await FetchManager.getNewData(DHBW_EVENTS);
    events.newItems.forEach((newItem) =>
      PushNotification.localNotification({
        title: 'Neuer DHBW Termin:',
        message:
          newItem.heading + ' am ' + getDay(Date.parse(newItem.time)),
        smallIcon: 'ic_launcher_foreground',
        color: dhbwRed,
      })
    );
    console.log('events', events);
  }

  if (settings['notificationschedule']) {
    const lectures = await FetchManager.getNewData(DHBW_COURSE);
    lectures.newItems.forEach((newItem) => {
      const parsedStartDate = Date.parse(newItem.startDate);
      //Do not notify of modifications in the past
      if (new Date(parsedStartDate) < new Date()) {
        return;
      }
      PushNotification.localNotification({
        title: 'Vorlesung hinzugefügt:',
        message: newItem.title + ' am ' + getDay(parsedStartDate),
        smallIcon: 'ic_launcher_foreground',
        color: dhbwRed,
      });
    });
    lectures.removedItems.forEach((removedItem) => {
      const parsedStartDate = Date.parse(removedItem.startDate);
      //Do not notify of modifications in the past
      if (new Date(parsedStartDate) < new Date()) {
        return;
      }
      PushNotification.localNotification({
        title: 'Vorlesung entfernt:',
        message: removedItem.title + ' am ' + getDay(parsedStartDate),
        smallIcon: 'ic_launcher_foreground',
        color: dhbwRed,
      });
    });
    console.log('lectures', lectures);
  }
}
export default NotificationTask;
