import { readFileSync } from 'node:fs';
import { __parseIcalForTest } from '../lib/icalService';

const ics = readFileSync(
  new URL('./sample-recurring.ics', import.meta.url)
).toString();
const events = __parseIcalForTest(ics);

// Filter occurrences for the first two months to keep output small
const sorted = events
  .filter((e) => e.title.includes('Online Sprechstunde'))
  .sort((a, b) => a.start.getTime() - b.start.getTime())
  .slice(0, 4);

for (const e of sorted) {
  const start = new Date(e.start);
  const end = new Date(e.end);
  const date = start.toLocaleDateString('de-DE');
  const s = start.toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const t = end.toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
  });
  console.log(`${date}: ${s} - ${t}`);
}
