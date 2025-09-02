// generate-match-index.mjs
// Minimal deps: only "ical.js" for ICS parsing. Node 18+ (global fetch).

import fs from 'node:fs/promises';
import path from 'node:path';
import * as ICAL from 'ical.js';

// --- Config ---
const TZ = process.env.TZ_NAME || 'Europe/Berlin';
const DAYS = parseInt(process.env.DAYS || '5', 10);
const COURSES_PATH = process.env.COURSES_PATH || './courses.txt';
const OUT_DIR = process.env.OUT_DIR || './public';
const OUT_FILE = process.env.OUT_FILE || 'match-index.json';

// Optional: derive program from course code prefix (extend as needed)
const PROGRAM_RULES = [
  { re: /^WWI/i, program: 'WI' }, // Business Informatics
  { re: /^TIF/i, program: 'INF' }, // Computer Science (example)
];
const programFor = (course) =>
  PROGRAM_RULES.find((r) => r.re.test(course))?.program ?? null;

// Build ICS URL from your pattern
const icsUrlFor = (course) =>
  `https://webmail.dhbw-loerrach.de/owa/calendar/kal-${course}@dhbw-loerrach.de/Kalender/calendar.ics`;

// --- Intl formatters for Berlin TZ ---
const fmtDateYMD = new Intl.DateTimeFormat('en-CA', {
  timeZone: TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
}); // -> "YYYY-MM-DD"

const fmtHM = new Intl.DateTimeFormat('en-GB', {
  timeZone: TZ,
  hour12: false,
  hour: '2-digit',
  minute: '2-digit',
});

// Minutes since local midnight in Europe/Berlin
function minutesSinceMidnightBerlin(dateUtc) {
  const parts = fmtHM.formatToParts(dateUtc);
  const h = parseInt(parts.find((p) => p.type === 'hour').value, 10);
  const m = parseInt(
    parts.find((p) => p.type === 'minute').value,
    10
  );
  return h * 60 + m;
}

// Local (Berlin) date key "YYYY-MM-DD" for a UTC Date
function dateKeyBerlin(dateUtc) {
  return fmtDateYMD.format(dateUtc);
}

// Generate a list of Berlin local date keys for today + next N-1 days
function nextDayKeys(days) {
  const keys = [];
  const todayKey = dateKeyBerlin(new Date());
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

// Expand occurrences for a VEVENT within [fromUtc, toUtc] using ical.js iterator.
// Returns array of { start: Date, end: Date } in UTC.
function expandEventOccurrences(event, fromUtc, toUtc) {
  const out = [];

  // Ignore all-day events (DATE values) – not relevant for lecture start/end windows
  if (event.startDate.isDate || event.endDate.isDate) return out;

  // Non-recurring: include if it overlaps
  if (!event.isRecurring()) {
    const start = event.startDate.toJSDate();
    const end = event.endDate.toJSDate();
    if (start < toUtc && end > fromUtc) out.push({ start, end });
    return out;
  }

  // Recurring: iterate occurrences using event.iterator()
  const iterStart = ICAL.Time.fromJSDate(fromUtc);
  const iter = event.iterator(iterStart);
  let next;
  while ((next = iter.next())) {
    const occStart = next.toJSDate();
    if (occStart >= toUtc) break; // beyond window

    // Pull full details (handles EXDATE and RECURRENCE-ID overrides)
    const { startDate, endDate } = event.getOccurrenceDetails(next);
    if (startDate.isDate || endDate.isDate) continue; // skip all-day
    const s = startDate.toJSDate();
    const e = endDate.toJSDate();

    // Overlap guard (usually true for recurrences within iterator window)
    if (s < toUtc && e > fromUtc) out.push({ start: s, end: e });
  }
  return out;
}

// Load ICS text via fetch and parse with ical.js
async function loadCalendar(url) {
  try {
    const res = await fetch(url, { redirect: 'follow' });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const icsText = await res.text();
    const jcal = ICAL.parse(icsText);
    return new ICAL.Component(jcal);
  } catch (e) {
    console.error(`! failed ${url}: ${e.message}`);
    return null;
  }
}

async function main() {
  // Wide expansion window to safely include today's earlier events and edge DST cases
  const now = new Date();
  const windowStartUtc = new Date(
    now.getTime() - 24 * 60 * 60 * 1000
  ); // now - 1 day
  const windowEndUtc = new Date(
    now.getTime() + (DAYS + 1) * 24 * 60 * 60 * 1000
  ); // now + (DAYS+1) days

  // Prepare Berlin-local target day keys
  const dayKeys = nextDayKeys(DAYS);

  // Map: dateKey -> Map(course -> record)
  const byDay = new Map(dayKeys.map((k) => [k, new Map()]));

  // Read course codes (one per line)
  const courses = (await fs.readFile(COURSES_PATH, 'utf8'))
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  for (const course of courses) {
    const comp = await loadCalendar(icsUrlFor(course));
    if (!comp) continue;

    const vevents = comp.getAllSubcomponents('vevent') || [];
    for (const ve of vevents) {
      const ev = new ICAL.Event(ve);
      if (!ev.startDate || !ev.endDate) continue;

      const occs = expandEventOccurrences(
        ev,
        windowStartUtc,
        windowEndUtc
      );
      for (const { start, end } of occs) {
        const dKey = dateKeyBerlin(start);
        if (!byDay.has(dKey)) continue; // outside selected DAYS

        const bucket = byDay.get(dKey);
        if (!bucket.has(course)) {
          bucket.set(course, {
            course,
            program: programFor(course),
            firstStartMin: Number.POSITIVE_INFINITY,
            lastEndMin: Number.NEGATIVE_INFINITY,
          });
        }
        const rec = bucket.get(course);
        rec.firstStartMin = Math.min(
          rec.firstStartMin,
          minutesSinceMidnightBerlin(start)
        );
        rec.lastEndMin = Math.max(
          rec.lastEndMin,
          minutesSinceMidnightBerlin(end)
        );
      }
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
    const items = [];
    for (const rec of bucket.values()) {
      if (
        !Number.isFinite(rec.firstStartMin) ||
        !Number.isFinite(rec.lastEndMin)
      )
        continue;
      items.push({
        course: rec.course,
        program: rec.program,
        firstStartMin: Math.round(rec.firstStartMin),
        lastEndMin: Math.round(rec.lastEndMin),
      });
    }
    items.sort((a, b) => a.course.localeCompare(b.course));
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
