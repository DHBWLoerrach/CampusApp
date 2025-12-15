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

// --- Schedule/Event helpers ---
// Extract URL and room text from a location string (first URL is considered the online link)
const URL_REGEX_SINGLE = /(https?:\/\/[^\s]+)/i;
const ONLINE_WORD_REGEX = /\bonline\b/i;
const ONLINE_WORD_REGEX_GLOBAL = /\bonline\b/gi;
const LOCATION_HINT_TRIM = /^[\s,;:|/\\·–—-]+|[\s,;:|/\\·–—-]+$/g;

export function splitLocation(location?: string | null) {
  const text = (location || '').trim();
  const m = text.match(URL_REGEX_SINGLE);
  const url = m ? m[0] : null;
  const room = url ? text.replace(url, '').trim() : text;
  return { url, room } as const;
}

function extractOnlineHint(text: string): string | null {
  // Remove the "online" marker and clean up leftover separators (e.g., ", online")
  const withoutOnline = text
    .replace(ONLINE_WORD_REGEX_GLOBAL, ' ')
    .replace(/\(\s*\)/g, ' ')
    .trim();
  const cleaned = withoutOnline.replace(LOCATION_HINT_TRIM, '').trim();
  return cleaned.length > 0 ? cleaned : null;
}

export function getLocationMeta(location?: string | null) {
  const raw = (location || '').trim();
  const { url, room } = splitLocation(raw);
  const isOnline = isOnlineEvent(raw, url);
  const hint = isOnline ? extractOnlineHint(room) : null;
  return { url, room, hint, isOnline } as const;
}

export function isOnlineEvent(
  location?: string | null,
  url?: string | null
) {
  if (url) return true;
  const haystack = `${location || ''}`;
  return ONLINE_WORD_REGEX.test(haystack);
}
