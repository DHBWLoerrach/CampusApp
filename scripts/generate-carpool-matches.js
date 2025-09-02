// generate-match-index.mjs
import fs from 'node:fs/promises';
import path from 'node:path';
import ICAL from 'ical.js';

// --- Config ---
const TZ = process.env.TZ_NAME || 'Europe/Berlin';
const DAYS = parseInt(process.env.DAYS || '5', 10);
const COURSES_PATH = process.env.COURSES_PATH || './courses.txt';
const OUT_DIR = process.env.OUT_DIR || '.';
const OUT_FILE = process.env.OUT_FILE || 'match-index.json';

// Optional mapping: derive program code from course prefix
const PROGRAM_RULES = [
  { re: /^WWI/i, program: 'WI' },
  { re: /^TIF/i, program: 'INF' },
];
const programFor = (course) =>
  PROGRAM_RULES.find((r) => r.re.test(course))?.program ?? null;

// Alias hook (replace with your resolveCourseAlias if you have one)
function resolveCourseAliasLocal(course) {
  return course.trim();
}
function icsUrlFor(course) {
  const canonical = resolveCourseAliasLocal(course);
  return `https://webmail.dhbw-loerrach.de/owa/calendar/kal-${canonical.toLowerCase()}@dhbw-loerrach.de/Kalender/calendar.ics`;
}

// --- TZ helpers (Intl) ---
const fmtDateYMD = new Intl.DateTimeFormat('en-CA', {
  timeZone: TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
}); // "YYYY-MM-DD"
const fmtHM = new Intl.DateTimeFormat('en-GB', {
  timeZone: TZ,
  hour12: false,
  hour: '2-digit',
  minute: '2-digit',
});

function dateKeyTZ(d) {
  return fmtDateYMD.format(d);
}
function minutesSinceMidnightTZ(d) {
  const parts = fmtHM.formatToParts(d);
  const h = +parts.find((p) => p.type === 'hour').value;
  const m = +parts.find((p) => p.type === 'minute').value;
  return h * 60 + m;
}
function isMidnightTZ(d) {
  const parts = fmtHM.formatToParts(d);
  return (
    parts.find((p) => p.type === 'hour').value === '00' &&
    parts.find((p) => p.type === 'minute').value === '00'
  );
}
function nextDayKeys(days) {
  const keys = [];
  const todayKey = dateKeyTZ(new Date());
  const [y0, m0, d0] = todayKey.split('-').map(Number);
  for (let i = 0; i < days; i++) {
    const t = new Date(Date.UTC(y0, m0 - 1, d0 + i));
    keys.push(
      `${t.getUTCFullYear()}-${String(t.getUTCMonth() + 1).padStart(
        2,
        '0'
      )}-${String(t.getUTCDate()).padStart(2, '0')}`
    );
  }
  return keys;
}

// --- Windows TZID normalization + Berlin VTIMEZONE injection (Exchange quirk) ---
const WINDOWS_TO_IANA_TZID = {
  'W. Europe Standard Time': 'Europe/Berlin',
  'Central European Standard Time': 'Europe/Warsaw',
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
  let s = icalText;
  for (const [win, iana] of Object.entries(WINDOWS_TO_IANA_TZID)) {
    const esc = win.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    s = s.replace(
      new RegExp(`(TZID=)${esc}(?=[;:])`, 'g'),
      `$1${iana}`
    );
    s = s.replace(
      new RegExp(`(TZID:)${esc}(?=\\r?\\n)`, 'g'),
      `$1${iana}`
    );
  }
  const refsBerlin = /TZID=Europe\/Berlin|TZID:Europe\/Berlin/.test(
    s
  );
  const hasBerlinVTZ =
    /BEGIN:VTIMEZONE[\s\S]*?TZID:Europe\/Berlin[\s\S]*?END:VTIMEZONE/.test(
      s
    );
  if (refsBerlin && !hasBerlinVTZ) {
    s = s.replace(
      /BEGIN:VCALENDAR\r?\n/,
      (m) => `${m}${EUROPE_BERLIN_VTIMEZONE}\n`
    );
  }
  return s;
}
function registerTimezones(vcal) {
  const tzs = vcal.getAllSubcomponents('vtimezone') || [];
  for (const tz of tzs) {
    const tzid = tz.getFirstPropertyValue('tzid');
    if (!tzid) continue;
    try {
      const timezone = new ICAL.Timezone({ component: tz, tzid });
      ICAL.TimezoneService.register(tzid, timezone);
    } catch (e) {
      console.warn('Timezone register failed:', tzid, e?.message);
    }
  }
}

// --- Recurrence exception cache (Exchange sometimes omits time in RECURRENCE-ID) ---
function getRecurrenceExceptions(vevents) {
  const map = Object.create(null);
  for (const ve of vevents) {
    const ev = new ICAL.Event(ve);
    if (ev.isRecurrenceException()) {
      (map[ev.uid] ||= new Set()).add(
        ev.recurrenceId.toJSDate().toDateString()
      );
    }
  }
  return map;
}

// --- All-day detection for buggy "timed" all-day events (00:00→next 00:00 local) ---
function isFullDayLikeTimed(s, e) {
  if (!isMidnightTZ(s) || !isMidnightTZ(e)) return false;
  // If local start date differs from local end date, and both times are 00:00,
  // this is effectively an all-day (or multi-day) block expressed as DATE-TIME.
  return dateKeyTZ(s) !== dateKeyTZ(e);
}

// --- ICS I/O ---
async function fetchIcs(url) {
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return await res.text();
}

// --- Occurrence expansion ---
function expandOccurrences(event, fromUtc, toUtc, recExSet) {
  const out = [];

  // Skip explicit all-day (DATE) events
  if (event.startDate?.isDate || event.endDate?.isDate) return out;

  if (!event.isRecurring()) {
    const s = event.startDate.toJSDate();
    const e = event.endDate.toJSDate();
    if (e <= s) return out; // guard against zero/negative duration
    if (isFullDayLikeTimed(s, e)) return out; // treat midnight→midnight as all-day (skip)
    if (s < toUtc && e > fromUtc) out.push({ start: s, end: e });
    return out;
  }

  // Recurring master
  const iter = event.iterator();
  let next;
  while ((next = iter.next())) {
    const occStartJs = next.toJSDate();
    if (occStartJs >= toUtc) break;
    if (occStartJs < fromUtc) continue;
    if (recExSet?.has(occStartJs.toDateString())) continue;

    const { startDate, endDate } = event.getOccurrenceDetails(next);
    if (startDate.isDate || endDate.isDate) continue;
    const s = startDate.toJSDate();
    const e = endDate.toJSDate();
    if (e <= s) continue;
    if (isFullDayLikeTimed(s, e)) continue;
    if (s < toUtc && e > fromUtc) out.push({ start: s, end: e });
  }
  return out;
}

// Split a timed event crossing midnight into per-day slices (ignore zero-length)
function sliceTimedEventPerDay(startJs, endJs) {
  const out = [];
  const toMidnight = (d) => {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
  };

  let cursorStart = new Date(startJs);
  while (cursorStart < endJs) {
    const dayStart = toMidnight(cursorStart);
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
    const sliceStart = cursorStart;
    const sliceEnd = endJs < dayEnd ? endJs : dayEnd;
    if (sliceEnd > sliceStart)
      out.push({ start: sliceStart, end: sliceEnd }); // ignore zero-length
    cursorStart = sliceEnd;
  }
  return out;
}

// --- Main ---
async function main() {
  const dayKeys = nextDayKeys(DAYS);
  const byDay = new Map(dayKeys.map((k) => [k, new Map()])); // dateKey -> Map(course -> agg)

  // Expansion window (safe around DST): yesterday .. +DAYS+1
  const now = new Date();
  const windowStartUtc = new Date(
    now.getTime() - 24 * 60 * 60 * 1000
  );
  const windowEndUtc = new Date(
    now.getTime() + (DAYS + 1) * 24 * 60 * 60 * 1000
  );

  const courses = (await fs.readFile(COURSES_PATH, 'utf8'))
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  for (const course of courses) {
    let icsText;
    try {
      icsText = await fetchIcs(icsUrlFor(course));
    } catch (e) {
      console.warn('Fetch failed:', course, e.message);
      continue;
    }

    const prepared = normalizeTimezones(icsText);
    const vcal = new ICAL.Component(ICAL.parse(prepared));
    registerTimezones(vcal);

    const vevents = vcal.getAllSubcomponents('vevent') || [];
    const recEx = getRecurrenceExceptions(vevents);

    const slices = [];
    for (const ve of vevents) {
      const ev = new ICAL.Event(ve);
      if (!ev.startDate || !ev.endDate) continue;

      const occs = expandOccurrences(
        ev,
        windowStartUtc,
        windowEndUtc,
        recEx[ev.uid]
      );
      for (const { start, end } of occs) {
        // Additional guard: skip full-day-like slices (unlikely here, but cheap)
        if (isFullDayLikeTimed(start, end)) continue;
        slices.push(...sliceTimedEventPerDay(start, end));
      }
    }

    // Aggregate per TZ-local day
    const perDay = new Map(); // dateKey -> { firstStartMin, lastEndMin }
    for (const sl of slices) {
      const dKey = dateKeyTZ(sl.start);
      if (!dayKeys.includes(dKey)) continue;
      const startMin = minutesSinceMidnightTZ(sl.start);
      const endMin = minutesSinceMidnightTZ(sl.end);

      // Ignore zero-minute endpoints at midnight if they produce nonsense
      // (e.g., 00:00→00:00 or start>end after local mapping)
      if (endMin <= startMin) continue;

      const agg = perDay.get(dKey) || {
        firstStartMin: Infinity,
        lastEndMin: -Infinity,
      };
      agg.firstStartMin = Math.min(agg.firstStartMin, startMin);
      agg.lastEndMin = Math.max(agg.lastEndMin, endMin);
      perDay.set(dKey, agg);
    }

    // Write into global aggregation with sanity filters
    for (const [dKey, agg] of perDay.entries()) {
      const { firstStartMin, lastEndMin } = agg;
      if (
        !Number.isFinite(firstStartMin) ||
        !Number.isFinite(lastEndMin)
      )
        continue;
      if (lastEndMin < firstStartMin) continue;
      if (firstStartMin === 0 && lastEndMin === 0) continue; // defensive

      const bucket = byDay.get(dKey);
      if (!bucket) continue;
      bucket.set(course, {
        course,
        program: programFor(course),
        firstStartMin: Math.round(firstStartMin),
        lastEndMin: Math.round(lastEndMin),
      });
    }
  }

  // Build output
  const out = {
    version: 1,
    generatedAt: new Date().toISOString(),
    timezone: TZ,
    days: [],
  };
  for (const dKey of dayKeys) {
    const items = Array.from(
      (byDay.get(dKey) || new Map()).values()
    ).sort((a, b) => a.course.localeCompare(b.course));
    out.days.push({ date: dKey, courses: items });
  }

  debugPrint(
    out,
    (process.env.DEBUG_COURSES || '').split(',').filter(Boolean)
  );

  await fs.mkdir(OUT_DIR, { recursive: true });
  const outPath = path.join(OUT_DIR, OUT_FILE);
  await fs.writeFile(outPath, JSON.stringify(out), 'utf8');
  console.log(
    `OK ${outPath} -> ${out.days.length} days, ${out.days.reduce(
      (n, d) => n + d.courses.length,
      0
    )} courses`
  );
}

function debugPrint(outJson, coursesToCheck = []) {
  if (!coursesToCheck.length) return;
  const set = new Set(
    coursesToCheck.map((s) => s.trim().toUpperCase())
  );
  console.log(
    '\n[DEBUG] Per-day first/last (minutes since midnight):'
  );
  for (const day of outJson.days) {
    const rows = day.courses.filter((c) =>
      set.has(c.course.toUpperCase())
    );
    if (!rows.length) continue;
    const label = new Intl.DateTimeFormat('de-DE', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
    }).format(new Date(day.date + 'T00:00:00Z'));
    const line = rows
      .map(
        (r) =>
          `${r.course}: ${r.firstStartMin}→${r.lastEndMin} (${String(
            Math.floor(r.firstStartMin / 60)
          ).padStart(2, '0')}:${String(r.firstStartMin % 60).padStart(
            2,
            '0'
          )}–${String(Math.floor(r.lastEndMin / 60)).padStart(
            2,
            '0'
          )}:${String(r.lastEndMin % 60).padStart(2, '0')})`
      )
      .join('  |  ');
    console.log(`  ${label}  ${line}`);
  }
  console.log();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
