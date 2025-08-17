import { Linking, Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { dhbwRed } from '@/constants/Colors';

export const openLink = async (url: string) => {
  if (!url) return;

  if (Platform.OS === 'web') {
    window.open(url, '_blank');
    return;
  }

  if (url.startsWith('http')) {
    await WebBrowser.openBrowserAsync(url, {
      presentationStyle:
        WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET, //iOS
      controlsColor: dhbwRed, // iOS
      createTask: false, // Android
      showTitle: false, // Android
    });
  } else {
    await Linking.openURL(url);
  }
};

// Format a Date as an ISO 8601 string with the local timezone offset instead of Z (UTC).
// Example: 2025-08-18T00:00:00+02:00
export const toLocalISOString = (date: Date): string => {
  // Use local time components to avoid UTC shifting
  const pad = (n: number) => String(n).padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  // Timezone offset in minutes west of UTC; invert to get the sign for ISO string
  const offsetMinutes = -date.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const abs = Math.abs(offsetMinutes);
  const offsetH = pad(Math.floor(abs / 60));
  const offsetM = pad(abs % 60);

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${sign}${offsetH}:${offsetM}`;
};
