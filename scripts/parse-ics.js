// Quick smoke test for recurring event timezone handling using ical.js
// This script is for local verification only; it duplicates minimal logic to avoid TS runtime.

/* eslint-disable no-console */
const fs = require('node:fs');
const path = require('node:path');
const ICAL = require('ical.js');

const WINDOWS_TO_IANA_TZID = {
  'W. Europe Standard Time': 'Europe/Berlin',
};

const EUROPE_BERLIN_VTIMEZONE = [
  'BEGIN:VTIMEZONE',
  'TZID:Europe/Berlin',
  'X-LIC-LOCATION:Europe/Berlin',
  'BEGIN:DAYLIGHT',
  'TZOFFSETFROM:+0100',
  'TZOFFSETTO:+0200',
  'TZNAME:CEST',
  'DTSTART:19700329T020000',
  'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU',
  'END:DAYLIGHT',
  'BEGIN:STANDARD',
  'TZOFFSETFROM:+0200',
  'TZOFFSETTO:+0100',
  'TZNAME:CET',
  'DTSTART:19701025T030000',
  'RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU',
  'END:STANDARD',
  'END:VTIMEZONE',
].join('\n');

function normalizeTimezones(icalText) {
  let normalized = icalText;
  for (const [winTz, ianaTz] of Object.entries(
    WINDOWS_TO_IANA_TZID
  )) {
    const esc = winTz.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    normalized = normalized.replace(
      new RegExp(`(TZID=)${esc}(?=[;:])`, 'g'),
      `$1${ianaTz}`
    );
    normalized = normalized.replace(
      new RegExp(`(TZID:)${esc}(?=\r?\n)`, 'g'),
      `$1${ianaTz}`
    );
  }
  const referencesBerlin =
    /TZID=Europe\/Berlin|TZID:Europe\/Berlin/.test(normalized);
  const hasBerlinVTimezone =
    /BEGIN:VTIMEZONE[\s\S]*?TZID:Europe\/Berlin[\s\S]*?END:VTIMEZONE/.test(
      normalized
    );
  if (referencesBerlin && !hasBerlinVTimezone) {
    normalized = normalized.replace(
      /BEGIN:VCALENDAR\r?\n/,
      (m) => `${m}${EUROPE_BERLIN_VTIMEZONE}\n`
    );
  }
  return normalized;
}

function registerTimezones(vcalendar) {
  const tzComps = vcalendar.getAllSubcomponents('vtimezone');
  if (!tzComps) return;
  tzComps.forEach((timezoneComp) => {
    const tzid = timezoneComp.getFirstPropertyValue('tzid');
    if (!tzid) return;
    try {
      const timezone = new ICAL.Timezone({
        component: timezoneComp,
        tzid,
      });
      ICAL.TimezoneService.register(tzid, timezone);
    } catch (_) {}
  });
}

function main() {
  const file = path.join(__dirname, 'sample-recurring.ics');
  const raw = fs.readFileSync(file, 'utf8');
  const prepared = normalizeTimezones(raw);
  const jcal = ICAL.parse(prepared);
  const vcalendar = new ICAL.Component(jcal);
  registerTimezones(vcalendar);

  const vevents = vcalendar.getAllSubcomponents('vevent');
  const out = [];
  const now = new Date('2024-10-01T00:00:00Z');
  const rangeEnd = new Date('2025-01-31T23:59:59Z');

  for (const comp of vevents) {
    const ev = new ICAL.Event(comp);
    console.log(
      'Master DTSTART:',
      ev.startDate && ev.startDate.toString(),
      'tz:',
      ev.startDate && ev.startDate.zone && ev.startDate.zone.tzid
    );
    if (ev.isRecurring()) {
      const it = ev.iterator();
      let next;
      while ((next = it.next())) {
        const js = next.toJSDate();
        if (js > rangeEnd) break;
        if (js < now) continue;
        const occ = ev.getOccurrenceDetails(next);
        out.push({
          title: occ.item.summary,
          start: occ.startDate.toJSDate(),
          end: occ.endDate.toJSDate(),
          _rawStart: occ.startDate.toString(),
          _rawEnd: occ.endDate.toString(),
          _tz: occ.startDate.zone && occ.startDate.zone.tzid,
        });
      }
    } else {
      out.push({
        title: ev.summary,
        start: ev.startDate.toJSDate(),
        end: ev.endDate.toJSDate(),
      });
    }
  }

  out.sort((a, b) => a.start - b.start);
  const first = out.slice(0, 3);
  for (const e of first) {
    const date = new Intl.DateTimeFormat('de-DE', {
      timeZone: 'Europe/Berlin',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(e.start);
    const s = new Intl.DateTimeFormat('de-DE', {
      timeZone: 'Europe/Berlin',
      hour: '2-digit',
      minute: '2-digit',
    }).format(e.start);
    const t = new Intl.DateTimeFormat('de-DE', {
      timeZone: 'Europe/Berlin',
      hour: '2-digit',
      minute: '2-digit',
    }).format(e.end);
    console.log(
      `${date}: ${s} - ${t}`,
      '| raw:',
      e._rawStart,
      '->',
      e._rawEnd,
      '| tz:',
      e._tz
    );
  }
}

main();
