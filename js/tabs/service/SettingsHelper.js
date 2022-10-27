import AsyncStorage from '@react-native-async-storage/async-storage';

export async function loadNotificationSettings() {
  const settings = await AsyncStorage.getItem('notificationSettings');
  if (settings != null) {
    return JSON.parse(settings);
  }
  return null;
}

export function saveNotificationSettings(settingsObject) {
  AsyncStorage.setItem(
    'notificationSettings',
    JSON.stringify(settingsObject)
  );
}
