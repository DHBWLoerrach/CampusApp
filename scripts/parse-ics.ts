import { readFileSync } from 'node:fs';
import { parseIcal } from '../lib/icalParser.ts';

const fixture = new URL('./sample-recurring.ics', import.meta.url);
const { events, incomplete } = parseIcal(
  readFileSync(fixture, 'utf8'),
  new Date('2024-10-01T00:00:00Z')
);
const officeHours = events
  .filter((event) => event.title.includes('Online Sprechstunde'))
  .sort((a, b) => a.start.getTime() - b.start.getTime());
if (incomplete || officeHours.length === 0)
  throw new Error('Incomplete sample calendar');

const format = new Intl.DateTimeFormat('de-DE', {
  timeZone: 'Europe/Berlin',
  dateStyle: 'short',
  timeStyle: 'short',
});
for (const event of officeHours.slice(0, 3)) {
  console.log(format.formatRange(event.start, event.end), event.title);
}
