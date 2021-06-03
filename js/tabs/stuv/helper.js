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

export async function inviteUserEvent(email,firstName,lastName,event){
  const body = await fetch("http://localhost:8080/events/invite", {
    method: 'GET',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    },
    body:JSON.stringify({
      email:user.email,
      first_name:firstName,
      last_name:lastName,
      title:event.title,
      event_id:event_id
    })
});
  return body.response.ok;
}

export async function unregisterUserEvent(email,event_id){
  const body = await fetch("http://localhost:8080/events/confirm-unregister",
  {
    method: 'GET',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    },
    body:JSON.stringify({
      email:email,
      event_id:event_id
    })
});
  return body.response.ok;
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
