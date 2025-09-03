import fs from 'node:fs/promises';
import path from 'node:path';
import ICAL from 'ical.js';

// --- Config ---
const TZ = process.env.TZ_NAME || 'Europe/Berlin';
const DAYS = parseInt(process.env.DAYS || '5', 10);
const COURSES_PATH = process.env.COURSES_PATH || './courses.txt';
const OUT_DIR = process.env.OUT_DIR || '.';
const OUT_FILE = process.env.OUT_FILE || 'courses-rides.json';
const START_DATE_RAW = process.env.START_DATE; // optional; parsed in resolveStartKey

// --- CLI helpers ---
const argv = process.argv.slice(2);
function getArg(name) {
  const flag = `--${name}`;
  const withEq = new RegExp(`^--${name}=`);
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === flag)
      return argv[i + 1] && !argv[i + 1].startsWith('--')
        ? argv[i + 1]
        : '';
    if (withEq.test(a)) return a.split('=')[1] ?? '';
  }
  return undefined;
}
function showHelpAndExit() {
  const msg = `\nUsage: node scripts/generate-carpool-matches.js [options]\n\nOptions:\n  --start-date YYYY-MM-DD   Start date for the generated window (local to TZ)\n  --start YYYY-MM-DD        Same as --start-date\n  --help, -h                Show this help\n\nEnv vars (still supported):\n  TZ_NAME                   IANA time zone (default: Europe/Berlin)\n  DAYS                      Number of days to generate (default: 5)\n  COURSES_PATH              Path to courses list (default: ./courses.txt)\n  OUT_DIR                   Output directory (default: .)\n  OUT_FILE                  Output file name (default: match-index.json)\n  START_DATE                Alternative to --start-date (YYYY-MM-DD)\n`;
  console.log(msg);
  process.exit(0);
}
if (argv.includes('--help') || argv.includes('-h')) showHelpAndExit();

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

const within = (a, b, tol = 10) => Math.abs(a - b) <= tol;

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
function nextDayKeys(days, startKeyOverride) {
  const keys = [];
  const baseKey = startKeyOverride || dateKeyTZ(new Date());
  const [y0, m0, d0] = baseKey.split('-').map(Number);
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

// Parse start date CLI/env -> YYYY-MM-DD (in TZ)
function resolveStartKey() {
  const raw =
    getArg('start-date') ?? getArg('start') ?? START_DATE_RAW;
  if (!raw) return dateKeyTZ(new Date());

  const s = String(raw).trim();
  if (!s) return dateKeyTZ(new Date());

  // Support simple shorthands
  const todayKey = dateKeyTZ(new Date());
  if (/^today$/i.test(s)) return todayKey;
  if (/^tomorrow$/i.test(s)) {
    const [y, m, d] = todayKey.split('-').map(Number);
    const t = new Date(Date.UTC(y, m - 1, d + 1));
    return `${t.getUTCFullYear()}-${String(
      t.getUTCMonth() + 1
    ).padStart(2, '0')}-${String(t.getUTCDate()).padStart(2, '0')}`;
  }

  // Expect YYYY-MM-DD; ignore any time-of-day portion if passed
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) {
    const y = Number(m[1]);
    const mo = Number(m[2]);
    const da = Number(m[3]);
    // Normalize via UTC to ensure a valid calendar date
    const t = new Date(Date.UTC(y, mo - 1, da));
    const norm = `${t.getUTCFullYear()}-${String(
      t.getUTCMonth() + 1
    ).padStart(2, '0')}-${String(t.getUTCDate()).padStart(2, '0')}`;
    return norm;
  }

  console.warn(
    `Unrecognized start date: "${s}". Falling back to today.`
  );
  return todayKey;
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
  const startKey = resolveStartKey();
  const dayKeys = nextDayKeys(DAYS, startKey);
  const byDay = new Map(dayKeys.map((k) => [k, new Map()])); // dateKey -> Map(course -> agg)

  // Expansion window (safe around DST): yesterday .. +DAYS+1
  // Anchor on the chosen start date's midnight (UTC) to cover the local TZ range
  const [sy, sm, sd] = startKey.split('-').map(Number);
  const startAnchorUtc = new Date(Date.UTC(sy, sm - 1, sd));
  const windowStartUtc = new Date(
    startAnchorUtc.getTime() - 24 * 60 * 60 * 1000
  );
  const windowEndUtc = new Date(
    startAnchorUtc.getTime() + (DAYS + 1) * 24 * 60 * 60 * 1000
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

  // Final sanity check
  for (const day of out.days) {
    for (const c of day.courses) {
      if (
        (c.firstStartMin === 0 && c.lastEndMin === 0) ||
        c.lastEndMin < c.firstStartMin
      ) {
        throw new Error(
          `Invalid slice for ${c.course} on ${day.date}: ${c.firstStartMin}→${c.lastEndMin}`
        );
      }
    }
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

function debugPrint(outJson, coursesToCheck = [], nearTolMin = 10) {
  if (!coursesToCheck.length) return;
  const set = new Set(
    coursesToCheck.map((s) => s.trim().toUpperCase())
  );
  console.log(
    '\n[DEBUG] Per-day first/last (mins since midnight) + near (±' +
      nearTolMin +
      'm):'
  );
  for (const day of outJson.days) {
    const me = day.courses.filter((c) =>
      set.has(c.course.toUpperCase())
    );
    if (!me.length) continue;
    const label = new Intl.DateTimeFormat('de-DE', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
    }).format(new Date(day.date + 'T00:00:00Z'));
    const lines = me.map((r) => {
      const hhmm = (m) =>
        `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(
          m % 60
        ).padStart(2, '0')}`;
      const nearHin = day.courses
        .filter(
          (x) =>
            x.course !== r.course &&
            within(x.firstStartMin, r.firstStartMin, nearTolMin)
        )
        .map((x) => x.course);
      const nearRue = day.courses
        .filter(
          (x) =>
            x.course !== r.course &&
            within(x.lastEndMin, r.lastEndMin, nearTolMin)
        )
        .map((x) => x.course);
      return (
        `${r.course}: ${r.firstStartMin}→${r.lastEndMin} (${hhmm(
          r.firstStartMin
        )}–${hhmm(r.lastEndMin)})  ` +
        `| Hin≈: [${nearHin.join(', ')}]  | Zurück≈: [${nearRue.join(
          ', '
        )}]`
      );
    });
    console.log(`  ${label}  ` + lines.join('  ||  '));
  }
  console.log();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
