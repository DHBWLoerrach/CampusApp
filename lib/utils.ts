import { Linking, Platform } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { dhbwRed } from "@/constants/Colors";

export const openLink = async (url: string) => {
  if (!url) return;

  if (Platform.OS === "web") {
    window.open(url, "_blank");
    return;
  }

  if (url.startsWith("http")) {
    await WebBrowser.openBrowserAsync(url, {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET, //iOS
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
  const pad = (n: number) => String(n).padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  // Timezone offset in minutes west of UTC; invert to get the sign for ISO string
  const offsetMinutes = -date.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? "+" : "-";
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
const LOCATION_PART_SPLIT = /\s*(?:\r?\n+|\||;|,\s+|\s[–—-]\s|\s[\\/]\s)\s*/g;
const ROOM_KEYWORDS_REGEX =
  /\b(raum|hörsaal|hs|sr|audimax|labor|gebäude|seminar(?:raum)?)\b/i;

export function splitLocation(location?: string | null) {
  const text = (location || "").trim();
  const m = text.match(URL_REGEX_SINGLE);
  const url = m ? m[0] : null;
  const room = url ? text.replace(url, "").trim() : text;
  return { url, room } as const;
}

function scoreRoomCandidate(text: string): number {
  const t = text.trim();
  if (t.length === 0) return -1;
  let score = 0;
  if (/\d/.test(t)) score += 2;
  if (ROOM_KEYWORDS_REGEX.test(t)) score += 3;
  if (/[A-ZÄÖÜ]\s*[-]?\s*\d/.test(t)) score += 1;
  return score;
}

function splitRoomAndHint(text: string) {
  const raw = text.trim();
  if (raw.length === 0) return { room: "", hint: null } as const;

  const parts = raw
    .split(LOCATION_PART_SPLIT)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  if (parts.length <= 1) {
    // If the location ends with parentheses, treat them as hint (e.g., "Raum 1.01 (Klausur)")
    const m = raw.match(/^(.*?)\s*\(([^()]*)\)\s*$/);
    if (m) {
      const room = (m[1] || "").trim();
      const hint = (m[2] || "").trim();
      return {
        room,
        hint: hint.length > 0 ? hint : null,
      } as const;
    }
    return { room: raw, hint: null } as const;
  }

  let bestIndex = 0;
  let bestScore = scoreRoomCandidate(parts[0]);
  for (let i = 1; i < parts.length; i += 1) {
    const s = scoreRoomCandidate(parts[i]);
    if (s > bestScore) {
      bestScore = s;
      bestIndex = i;
    }
  }

  // If nothing looks like a room, keep the original order: first = room, rest = hint.
  if (bestScore <= 0) bestIndex = 0;

  const room = parts[bestIndex];
  const hintText = parts
    .filter((_p, i) => i !== bestIndex)
    .join(", ")
    .trim();
  const hint = hintText.length > 0 ? hintText : null;

  return { room, hint } as const;
}

function extractOnlineHint(text: string): string | null {
  // Remove the "online" marker and clean up leftover separators (e.g., ", online")
  const withoutOnline = text
    .replace(ONLINE_WORD_REGEX_GLOBAL, " ")
    .replace(/\(\s*\)/g, " ")
    .trim();
  const cleaned = withoutOnline.replace(LOCATION_HINT_TRIM, "").trim();
  return cleaned.length > 0 ? cleaned : null;
}

export function getLocationMeta(location?: string | null) {
  const raw = (location || "").trim();
  const { url, room: textWithoutUrl } = splitLocation(raw);
  const isOnline = isOnlineEvent(raw, url);

  if (isOnline) {
    const hint = extractOnlineHint(textWithoutUrl);
    return { url, room: textWithoutUrl, hint, isOnline } as const;
  }

  const { room, hint } = splitRoomAndHint(textWithoutUrl);
  return { url, room, hint, isOnline } as const;
}

export function isOnlineEvent(location?: string | null, url?: string | null) {
  if (url) return true;
  const haystack = `${location || ""}`;
  return ONLINE_WORD_REGEX.test(haystack);
}
