import { format } from 'date-fns';
import fromUnixTime from 'date-fns/fromUnixTime';

const stuvServer = 'https://admin.stuv-loerrach.de:3131';
const stuvEvents = `${stuvServer}/events`;
const stuvNews = `${stuvServer}/news`;

async function load(url) {
  const response = await fetch(url);
  if (!response.ok) {
    return null;
  }
  return await response.json();
}

export async function loadEvents() {
  const data = await load(stuvEvents);
  return data.events;
}

export async function loadNews() {
  const data = await load(stuvNews);
  return data.news;
}

export async function inviteUserEvent(
  email,
  firstName,
  lastName,
  event
) {
  const body = await fetch(`${stuvEvents}/invite`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: email,
      first_name: firstName,
      last_name: lastName,
      title: event.title,
      event_id: event_id,
    }),
  });
  return body.response.ok;
}

export async function unregisterUserEvent(email, event) {
  const body = await fetch(`${stuvServer}/event/confirm-unregister`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        event_id: event.event_id,
        title: event.title,
      }),
    }
  );
  return body.response.ok;
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
