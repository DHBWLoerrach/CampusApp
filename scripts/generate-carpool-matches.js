import fs from 'node:fs/promises';
import path from 'node:path';
import ical from 'node-ical';
import { DateTime, Interval } from 'luxon';

// --- Config ---
const TZ = process.env.TZ_NAME || 'Europe/Berlin';
const DAYS = parseInt(process.env.DAYS || '5', 10);
const COURSES_PATH = process.env.COURSES_PATH || './courses.txt';
const OUT_DIR = process.env.OUT_DIR || './public';
const OUT_FILE = process.env.OUT_FILE || 'match-index.json';

// Optional: Studiengang-Ableitung aus Kurspräfix (bei Bedarf erweitern)
const PROGRAM_RULES = [
  { re: /^WWI/i, program: 'WI' }, // Wirtschaftsinformatik
  { re: /^TIF/i, program: 'INF' }, // (Beispiel) Informatik
];
const programFor = (course) =>
  PROGRAM_RULES.find((r) => r.re.test(course))?.program ?? null;

// ICS-URL nach gegebenem Muster bauen
const icsUrlFor = (course) =>
  `https://webmail.dhbw-loerrach.de/owa/calendar/kal-${course}@dhbw-loerrach.de/Kalender/calendar.ics`;

// --- Helpers ---
const sod = (dt) =>
  dt.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
const eod = (dt) =>
  dt.set({ hour: 23, minute: 59, second: 59, millisecond: 999 });
const minSinceMidnight = (dt) =>
  dt.setZone(TZ).hour * 60 + dt.setZone(TZ).minute;

function expandInstances(ev, from, to) {
  const out = [];
  const dtStart = DateTime.fromJSDate(ev.start, { zone: TZ });
  const dtEnd = DateTime.fromJSDate(ev.end, { zone: TZ });
  const baseDur = dtEnd.diff(dtStart).as('minutes');
  const win = Interval.fromDateTimes(from, to);

  if (!ev.rrule) {
    const evInt = Interval.fromDateTimes(dtStart, dtEnd);
    if (evInt.overlaps(win)) out.push({ start: dtStart, end: dtEnd });
    return out;
  }
  const exdates = new Set(
    Object.values(ev.exdate || {}).map((d) =>
      DateTime.fromJSDate(d, { zone: TZ }).toISO()
    )
  );
  const between = ev.rrule.between(
    from.toJSDate(),
    to.toJSDate(),
    true
  );
  for (const d of between) {
    const start = DateTime.fromJSDate(d, { zone: TZ });
    if (exdates.has(start.toISO())) continue;
    out.push({ start, end: start.plus({ minutes: baseDur }) });
  }
  return out;
}

async function loadICS(url) {
  try {
    return await ical.async.fromURL(url, {});
  } catch (e) {
    console.error(`! failed ${url}: ${e.message}`);
    return null;
  }
}

async function main() {
  const now = DateTime.now().setZone(TZ);
  const winStart = sod(now);
  const winEnd = eod(now.plus({ days: DAYS - 1 }));

  const courses = (await fs.readFile(COURSES_PATH, 'utf8'))
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  // date -> course -> record
  const byDay = new Map();
  for (let i = 0; i < DAYS; i++)
    byDay.set(winStart.plus({ days: i }).toISODate(), new Map());

  for (const course of courses) {
    const cal = await loadICS(icsUrlFor(course));
    if (!cal) continue;

    for (const ev of Object.values(cal)) {
      if (!ev || ev.type !== 'VEVENT' || !ev.start || !ev.end)
        continue;
      for (const inst of expandInstances(ev, winStart, winEnd)) {
        const dKey = inst.start.toISODate();
        if (!byDay.has(dKey)) continue;
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
          minSinceMidnight(inst.start)
        );
        rec.lastEndMin = Math.max(
          rec.lastEndMin,
          minSinceMidnight(inst.end)
        );
      }
    }
  }

  const out = {
    version: 1,
    generatedAt: now.toUTC().toISO(),
    timezone: TZ,
    days: [],
  };

  for (let i = 0; i < DAYS; i++) {
    const dateKey = winStart.plus({ days: i }).toISODate();
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
    out.days.push({
      date: dateKey,
      courses: items.sort((a, b) => a.course.localeCompare(b.course)),
    });
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
