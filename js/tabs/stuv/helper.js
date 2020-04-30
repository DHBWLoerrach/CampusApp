import moment from "moment";

export async function loadEvents() {
    const body = await load("https://storage.googleapis.com/stuv-data/serverResponseEvents.json");
    return body.response;
}

export async function loadNews() {
    const body = await load("https://storage.googleapis.com/stuv-data/serverResponseNews.json");
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
        return text.substr(0, maxLength-3) + "...";
    }
}

export function unixTimeToDateText(time) {
    const date = moment(time*1000);
    return date.format('DD.MM.Y');
}

export function unixTimeToTimeText(time) {
    const date = moment(time*1000);
    return date.format('HH:mm');
}
