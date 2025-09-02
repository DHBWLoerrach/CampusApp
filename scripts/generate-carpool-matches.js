import fs from 'node:fs/promises';
import path from 'node:path';
import ICAL from 'ical.js';

// ------------------------------
// Config
// ------------------------------
const TZ = process.env.TZ_NAME || 'Europe/Berlin';
const DAYS = parseInt(process.env.DAYS || '5', 10);
const COURSES_PATH = process.env.COURSES_PATH || './courses.txt';
const OUT_DIR = process.env.OUT_DIR || '.';
const OUT_FILE = process.env.OUT_FILE || 'match-index.json';

// Optional: derive study program from course code (extend as needed)
const PROGRAM_RULES = [
  { re: /^WWI/i, program: 'WI' }, // Business Informatics
  { re: /^TIF/i, program: 'INF' }, // Computer Science (example)
];
const programFor = (course) =>
  PROGRAM_RULES.find((r) => r.re.test(course))?.program ?? null;

// --- Course alias resolution hook (adjust to your alias list) ---
// If you have a separate alias registry, wire it here; fallback = identity.
function resolveCourseAliasLocal(course) {
  // Example: const ALIASES = { "tif-24a": "TIF24A" };
  // const key = course.trim().toLowerCase();
  // return ALIASES[key] ?? course.trim();
  return course.trim();
}

// Build ICS URL from your OWA pattern, using alias and lowercasing the mailbox name
function icsUrlFor(course) {
  const canonical = resolveCourseAliasLocal(course);
  const mailbox = canonical.toLowerCase();
  return `https://webmail.dhbw-loerrach.de/owa/calendar/kal-${mailbox}@dhbw-loerrach.de/Kalender/calendar.ics`;
}

// ------------------------------
// Timezone helpers and Intl formatters
// ------------------------------
const fmtDateYMD = new Intl.DateTimeFormat('en-CA', {
  timeZone: TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
}); // → "YYYY-MM-DD"

const fmtHM = new Intl.DateTimeFormat('en-GB', {
  timeZone: TZ,
  hour12: false,
  hour: '2-digit',
  minute: '2-digit',
});

function minutesSinceMidnightTZ(dateUtc) {
  const parts = fmtHM.formatToParts(dateUtc);
  const h = parseInt(parts.find((p) => p.type === 'hour').value, 10);
  const m = parseInt(
    parts.find((p) => p.type === 'minute').value,
    10
  );
  return h * 60 + m;
}
function dateKeyTZ(dateUtc) {
  return fmtDateYMD.format(dateUtc);
}
function nextDayKeys(days) {
  // Build a stable list of TZ-local date keys for "today + i"
  const keys = [];
  const todayKey = dateKeyTZ(new Date());
  const [y0, m0, d0] = todayKey.split('-').map(Number);
  for (let i = 0; i < days; i++) {
    const t = new Date(Date.UTC(y0, m0 - 1, d0 + i));
    const key = `${t.getUTCFullYear()}-${String(
      t.getUTCMonth() + 1
    ).padStart(2, '0')}-${String(t.getUTCDate()).padStart(2, '0')}`;
    keys.push(key);
  }
  return keys;
}

// ------------------------------
// Exchange quirks + timezone normalization (mirrors your Campus-App logic)
// ------------------------------
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

// Replace Windows TZIDs with IANA and inject Berlin VTIMEZONE if referenced but missing
function normalizeTimezones(icalText) {
  let normalized = icalText;

  for (const [winTz, ianaTz] of Object.entries(
    WINDOWS_TO_IANA_TZID
  )) {
    const esc = winTz.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const paramRe = new RegExp(`(TZID=)${esc}(?=[;:])`, 'g');
    const propRe = new RegExp(`(TZID:)${esc}(?=\\r?\\n)`, 'g');
    normalized = normalized.replace(paramRe, `$1${ianaTz}`);
    normalized = normalized.replace(propRe, `$1${ianaTz}`);
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

// Register VTIMEZONEs with ical.js to ensure correct offset handling
function registerTimezones(vcalendar) {
  const tzComps = vcalendar.getAllSubcomponents('vtimezone') || [];
  tzComps.forEach((tz) => {
    const tzid = tz.getFirstPropertyValue('tzid');
    if (!tzid) return;
    try {
      const timezone = new ICAL.Timezone({ component: tz, tzid });
      ICAL.TimezoneService.register(tzid, timezone);
    } catch (e) {
      console.warn('Timezone register failed:', tzid, e);
    }
  });
}

// Cache recurrence exceptions (Exchange often omits time in RECURRENCE-ID)
function getRecurrenceExceptions(vevents) {
  const map = Object.create(null);
  vevents.forEach((ve) => {
    const ev = new ICAL.Event(ve);
    if (ev.isRecurrenceException()) {
      if (!map[ev.uid]) map[ev.uid] = new Set();
      map[ev.uid].add(ev.recurrenceId.toJSDate().toDateString());
    }
  });
  return map;
}

// ------------------------------
// ICS loading
// ------------------------------
async function fetchIcs(url) {
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return await res.text();
}

// ------------------------------
// Occurrence expansion (recurrence-aware) and event slicing
// ------------------------------

// Expand a VEVENT within [fromUtc, toUtc], honoring exceptions; ignore all-day (DATE).
function expandOccurrences(
  event,
  fromUtc,
  toUtc,
  recurrenceExceptionsForUid
) {
  const out = [];

  // Ignore all-day events
  if (event.startDate?.isDate || event.endDate?.isDate) return out;

  if (!event.isRecurring()) {
    const s = event.startDate.toJSDate();
    const e = event.endDate.toJSDate();
    if (s < toUtc && e > fromUtc) out.push({ start: s, end: e });
    return out;
  }

  // Recurring master: iterate occurrences
  const iter = event.iterator();
  let next;
  while ((next = iter.next())) {
    const occStartJs = next.toJSDate();
    if (occStartJs >= toUtc) break;

    // Skip far past window; small lookback isn’t needed for our per-day min/max
    if (occStartJs < fromUtc) continue;

    // Skip Exchange duplicate: an exception VEVENT will carry the real data
    if (recurrenceExceptionsForUid?.has(occStartJs.toDateString()))
      continue;

    const { startDate, endDate } = event.getOccurrenceDetails(next);
    if (startDate.isDate || endDate.isDate) continue; // still ignore all-day
    const s = startDate.toJSDate();
    const e = endDate.toJSDate();
    if (s < toUtc && e > fromUtc) out.push({ start: s, end: e });
  }
  return out;
}

// Split a single timed event crossing midnight into per-day slices.
// This keeps earliest start / latest end correct per calendar day.
function sliceTimedEventPerDay(startJs, endJs) {
  const out = [];
  // helper: midnight (local TZ of the runtime host; we will group by TZ via Intl later)
  const atMidnight = (d) => {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
  };

  let cursorStart = new Date(startJs);
  while (cursorStart < endJs) {
    const dayStart = atMidnight(cursorStart);
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
    const sliceStart = cursorStart;
    const sliceEnd = endJs < dayEnd ? endJs : dayEnd;
    out.push({ start: sliceStart, end: sliceEnd });
    cursorStart = sliceEnd;
  }
  return out;
}

// ------------------------------
// Main
// ------------------------------
async function main() {
  // Build TZ-local day keys for output (today + DAYS-1)
  const dayKeys = nextDayKeys(DAYS);
  const byDay = new Map(dayKeys.map((k) => [k, new Map()])); // dateKey -> Map(course -> record)

  // Use a generous expansion window: from yesterday to +DAYS+1 days
  // (safer around DST changes / late-night events)
  const now = new Date();
  const windowStartUtc = new Date(
    now.getTime() - 24 * 60 * 60 * 1000
  );
  const windowEndUtc = new Date(
    now.getTime() + (DAYS + 1) * 24 * 60 * 60 * 1000
  );

  // Read course list
  const courses = (await fs.readFile(COURSES_PATH, 'utf8'))
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  for (const course of courses) {
    const url = icsUrlFor(course);
    let icsText;
    try {
      icsText = await fetchIcs(url);
    } catch (e) {
      console.warn('Fetch failed:', course, e.message);
      continue;
    }

    // Normalize TZIDs and parse
    const prepared = normalizeTimezones(icsText);
    const jcal = ICAL.parse(prepared);
    const vcal = new ICAL.Component(jcal);
    registerTimezones(vcal);

    const vevents = vcal.getAllSubcomponents('vevent');
    const recEx = getRecurrenceExceptions(vevents);

    // Collect all timed occurrences for this course within window
    const occurrences = [];
    for (const ve of vevents) {
      const ev = new ICAL.Event(ve);
      if (!ev.startDate || !ev.endDate) continue;

      // Recurrence exceptions (standalone VEVENTs) come here as non-recurring
      const occs = expandOccurrences(
        ev,
        windowStartUtc,
        windowEndUtc,
        recEx[ev.uid]
      );
      for (const { start, end } of occs) {
        // Ignore all-day already handled; ensure timed slices per calendar day
        const slices = sliceTimedEventPerDay(start, end);
        occurrences.push(...slices);
      }
    }

    // Aggregate per TZ-local day: earliest start / latest end (in minutes since midnight)
    const perDay = new Map(); // dateKey -> { firstStartMin, lastEndMin }
    for (const occ of occurrences) {
      const dKey = dateKeyTZ(occ.start);
      if (!dayKeys.includes(dKey)) continue; // only keep configured horizon
      if (!perDay.has(dKey))
        perDay.set(dKey, {
          firstStartMin: Infinity,
          lastEndMin: -Infinity,
        });
      const agg = perDay.get(dKey);
      agg.firstStartMin = Math.min(
        agg.firstStartMin,
        minutesSinceMidnightTZ(occ.start)
      );
      agg.lastEndMin = Math.max(
        agg.lastEndMin,
        minutesSinceMidnightTZ(occ.end)
      );
    }

    // Write into global byDay map
    for (const dKey of perDay.keys()) {
      const bucket = byDay.get(dKey);
      if (!bucket) continue;
      bucket.set(course, {
        course,
        program: programFor(course),
        firstStartMin: Math.round(perDay.get(dKey).firstStartMin),
        lastEndMin: Math.round(perDay.get(dKey).lastEndMin),
      });
    }
  }

  // Build output JSON
  const out = {
    version: 1,
    generatedAt: new Date().toISOString(),
    timezone: TZ,
    days: [],
  };

  for (const dKey of dayKeys) {
    const bucket = byDay.get(dKey) || new Map();
    const items = Array.from(bucket.values()).sort((a, b) =>
      a.course.localeCompare(b.course)
    );
    out.days.push({ date: dKey, courses: items });
  }

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

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
