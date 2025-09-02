// generate-match-index.mjs
import fs from 'node:fs/promises';
import path from 'node:path';
import ical from 'node-ical';
import {
  addDays,
  differenceInMinutes,
  startOfDay,
  endOfDay,
} from 'date-fns';
import {
  utcToZonedTime,
  zonedTimeToUtc,
  formatInTimeZone,
} from 'date-fns-tz';

// --- Config ---
const TZ = process.env.TZ_NAME || 'Europe/Berlin';
const DAYS = parseInt(process.env.DAYS || '5', 10);
const COURSES_PATH = process.env.COURSES_PATH || './courses.txt';
const OUT_DIR = process.env.OUT_DIR || './public';
const OUT_FILE = process.env.OUT_FILE || 'match-index.json';

// Optional: derive study program from course code prefix (extend as needed)
const PROGRAM_RULES = [
  { re: /^WWI/i, program: 'WI' }, // Business Informatics
  { re: /^TIF/i, program: 'INF' }, // Computer Science (example)
];
const programFor = (course) =>
  PROGRAM_RULES.find((r) => r.re.test(course))?.program ?? null;

// Build the ICS URL from the given course code
const icsUrlFor = (course) =>
  `https://webmail.dhbw-loerrach.de/owa/calendar/kal-${course}@dhbw-loerrach.de/Kalender/calendar.ics`;

// --- Helpers ---

// Compute UTC bounds for a given Berlin calendar day (00:00..23:59:59.999)
function berlinDayBoundsUtc(refUtcDate, dayOffset) {
  const refBerlin = utcToZonedTime(refUtcDate, TZ);
  const dayBerlin = addDays(refBerlin, dayOffset);
  const sodBerlin = startOfDay(dayBerlin);
  const eodBerlin = endOfDay(dayBerlin);
  return {
    fromUtc: zonedTimeToUtc(sodBerlin, TZ),
    toUtc: zonedTimeToUtc(eodBerlin, TZ),
    dateKey: formatInTimeZone(sodBerlin, TZ, 'yyyy-MM-dd'),
  };
}

// Minutes since local midnight in Europe/Berlin
function minutesSinceMidnightBerlin(dateUtc) {
  const z = utcToZonedTime(dateUtc, TZ);
  return z.getHours() * 60 + z.getMinutes();
}

// Expand a VEVENT into concrete instances within [fromUtc, toUtc],
// honoring RRULE and EXDATE. Returns [{start:Date, end:Date}, ...] in UTC.
function expandInstances(ev, fromUtc, toUtc) {
  const out = [];
  const baseDurMin = differenceInMinutes(ev.end, ev.start);

  // Non-recurring event: add if it overlaps the window
  if (!ev.rrule) {
    if (ev.start < toUtc && ev.end > fromUtc) {
      out.push({ start: ev.start, end: ev.end });
    }
    return out;
  }

  // Recurring event: use rrule.between and filter EXDATEs
  const exdates = new Set(
    Object.values(ev.exdate || {}).map((d) => new Date(d).getTime())
  );

  const between = ev.rrule.between(fromUtc, toUtc, true);
  for (const occStart of between) {
    const t = new Date(occStart).getTime();
    if (exdates.has(t)) continue;
    const occEnd = new Date(
      new Date(occStart).getTime() + baseDurMin * 60000
    );
    out.push({ start: occStart, end: occEnd });
  }
  return out;
}

// Load and parse an ICS (URL). Returns node-ical calendar object or null.
async function loadICS(url) {
  try {
    return await ical.async.fromURL(url, {});
  } catch (e) {
    console.error(`! failed ${url}: ${e.message}`);
    return null;
  }
}

// --- Main ---
async function main() {
  const nowUtc = new Date();

  // Prepare day buckets for the next N days
  const daysMeta = Array.from({ length: DAYS }, (_, i) =>
    berlinDayBoundsUtc(nowUtc, i)
  );
  const byDay = new Map(daysMeta.map((d) => [d.dateKey, new Map()]));

  // Read course codes from text file (one per line)
  const courses = (await fs.readFile(COURSES_PATH, 'utf8'))
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  // Iterate all courses and aggregate earliest start / latest end per day
  for (const course of courses) {
    const cal = await loadICS(icsUrlFor(course));
    if (!cal) continue;

    for (const ev of Object.values(cal)) {
      // Only handle VEVENTs with start/end
      if (!ev || ev.type !== 'VEVENT' || !ev.start || !ev.end)
        continue;

      for (const { fromUtc, toUtc } of daysMeta) {
        const instances = expandInstances(ev, fromUtc, toUtc);
        for (const inst of instances) {
          // Bucket key = Berlin local date (of the instance start)
          const dateKey = formatInTimeZone(
            inst.start,
            TZ,
            'yyyy-MM-dd'
          );
          const bucket = byDay.get(dateKey);
          if (!bucket) continue;

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
            minutesSinceMidnightBerlin(inst.start)
          );
          rec.lastEndMin = Math.max(
            rec.lastEndMin,
            minutesSinceMidnightBerlin(inst.end)
          );
        }
      }
    }
  }

  // Build output JSON: for each day list courses with firstStart/lastEnd (minutes)
  const out = {
    version: 1,
    generatedAt: new Date().toISOString(),
    timezone: TZ,
    days: [],
  };

  for (const { dateKey } of daysMeta) {
    const bucket = byDay.get(dateKey);
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
    out.days.push({ date: dateKey, courses: items });
  }

  // Write file
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
