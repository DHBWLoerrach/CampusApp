import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { __parseIcalForTest } from '../lib/icalService';

// Resolve sample file path in a Node-compatible way (avoids DOM URL type)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const samplePath = resolve(__dirname, './sample-recurring.ics');
const ics = readFileSync(samplePath).toString();
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
