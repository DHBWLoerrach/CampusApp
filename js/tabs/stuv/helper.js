import { format } from 'date-fns';
import fromUnixTime from 'date-fns/fromUnixTime';

export async function loadEvents() {
  const body = await load(
    'https://storage.googleapis.com/stuv-data/serverResponseEvents.json'
  );
  return body.response;
}

export async function loadNews() {
  const body = await load(
    'https://storage.googleapis.com/stuv-data/serverResponseNews.json'
  );
  return body.response;
}

async function load(url) {
  const response = await fetch(url);
  if (!response.ok) {
    return null;
  }
  return await response.json();
}

export function shortString(text, maxLength) {
  if (text.length > maxLength) {
    return text.substr(0, maxLength - 3) + '...';
  } else {
    return text;
  }
}

export function unixTimeToDateText(time) {
  return format(fromUnixTime(time), 'dd.MM.Y');
}

export function unixTimeToTimeText(time) {
  return format(fromUnixTime(time), 'HH:mm');
}
