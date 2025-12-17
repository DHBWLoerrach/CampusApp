import { addDays, format } from 'date-fns';
import { XMLParser } from 'fast-xml-parser';
import type { Role } from '@/constants/Roles';

const API_KEY = process.env.EXPO_PUBLIC_SWFR_API_KEY as string;
// 677 = Lörrach, for tests use 610 = Mensa Rempartstraße Freiburg
const SWFR_LOCATION = 677;

const SWFR_API_URL = `https://www.swfr.de/apispeiseplan?type=98&tx_speiseplan_pi1[apiKey]=${API_KEY}&tx_speiseplan_pi1[ort]=${SWFR_LOCATION}`;

export type CanteenMeal = {
  title: string;
  category?: string;
  // Separated additional info for clearer UI rendering
  additionalInfo?: string; // from "zusatz"
  labels?: string; // from "kennzeichnungen"
  allergens?: string; // from "allergene"
  prices?: Record<string, string | number>;
};

export type CanteenDay = {
  date: string; // YYYY-MM-DD
  meals: CanteenMeal[];
};

// Fetch raw XML from SWFR API
export async function fetchCanteenRaw(): Promise<string> {
  if (!API_KEY) {
    throw new Error('Fehlender EXPO_PUBLIC_SWFR_API_KEY in .env');
  }
  const res = await fetch(SWFR_API_URL);
  if (!res.ok) {
    throw new Error(
      `SWFR API Fehler: ${res.status} ${res.statusText}`
    );
  }
  return res.text();
}

// Parse XML and normalize into list of days + meals
export function normalizeCanteenData(
  raw: string | any
): CanteenDay[] {
  try {
    let data: any = raw;
    if (typeof raw === 'string') {
      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '',
        trimValues: true,
      });
      data = parser.parse(raw);
    }

    // Expected structure: plan -> ort -> tagesplan[] -> menue[]
    const ortList = toArray<any>(data?.plan?.ort);
    const ortNode =
      ortList.find((o) => String(o?.id) === String(SWFR_LOCATION)) ||
      ortList[0];
    const tagesplaene = toArray<any>(ortNode?.tagesplan);

    const days: CanteenDay[] = [];
    for (const tp of tagesplaene) {
      const dateRaw = tp?.datum ?? tp?.date ?? tp?.tag;
      const date = normalizeDateString(dateRaw) ?? '';
      const menues = toArray<any>(tp?.menue);

      const meals: CanteenMeal[] = menues
        .map((m) => xmlMenueToMeal(m))
        .filter((m): m is CanteenMeal => !!m && !!m.title);

      days.push({ date, meals });
    }
    return days;
  } catch (e) {
    return [];
  }
}

export function mealsForDate(
  days: CanteenDay[],
  date: Date
): CanteenMeal[] {
  const key = format(date, 'yyyy-MM-dd');
  // First try exact match
  const exact = days.find(
    (d) => d.date && normalizeDateString(d.date) === key
  );
  if (exact) return exact.meals;

  // Fallback: sometimes date is in dd.MM.yyyy or similar
  const alt1 = format(date, 'dd.MM.yyyy');
  const alt2 = format(date, 'dd.MM.yy');
  const best = days.find(
    (d) =>
      [d.date, normalizeDateString(d.date)].includes(alt1) ||
      d.date === alt2
  );
  return best?.meals ?? [];
}

function xmlMenueToMeal(m: any): CanteenMeal | null {
  if (!m || typeof m !== 'object') return null;
  // Prefer nameMitUmbruch (often with <br>), fallback to name
  const rawTitle: string | undefined = cleanup(
    pickFirst<string>(m, ['nameMitUmbruch', 'name'])
  );
  const title = rawTitle
    ?.replace(/<br\s*\/?\s*>/gi, ' · ')
    ?.replace(/-{2,}/g, ' ')
    ?.replace(/\s+/g, ' ')
    ?.trim();
  if (!title) return null;

  const category = cleanup(m?.art);
  const zusatz = cleanup(m?.zusatz);
  const kennz = cleanup(pickFirst<string>(m, ['kennzeichnungen']));
  const allergene = cleanup(pickFirst<string>(m, ['allergene']));

  const p = m?.preis || {};
  const prices: Record<string, string> = {};
  if (p?.studierende) prices['Studierende'] = String(p.studierende);
  if (p?.angestellte) prices['Angestellte'] = String(p.angestellte);
  if (p?.gaeste) prices['Gäste'] = String(p.gaeste);
  if (p?.schueler) prices['Schüler'] = String(p.schueler);

  return {
    title,
    category,
    additionalInfo: zusatz,
    labels: kennz,
    allergens: allergene,
    prices: Object.keys(prices).length ? prices : undefined,
  };
}

// Map an app Role to the corresponding price label(s) used by SWFR
// Falls back by priority if the preferred label is not present
const ROLE_TO_PRICE_LABELS: Record<Role, string[]> = {
  Studierende: ['Studierende'],
  Mitarbeitende: ['Angestellte'],
  Lehrbeauftragte: ['Gäste'],
  Gast: ['Gäste'],
};

export function priceForRole(
  prices: Record<string, string | number> | undefined,
  role: Role | null
): { label: string; value: string | number } | null {
  if (!prices || !role) return null;
  const labels = ROLE_TO_PRICE_LABELS[role] || [];
  for (const lbl of labels) {
    if (Object.prototype.hasOwnProperty.call(prices, lbl)) {
      return { label: lbl, value: prices[lbl]! };
    }
  }
  return null;
}

// Build a short, single-line summary of key allergens and essential labels
// Example output: "Gluten, Milch, Ei · Alkohol"
export function summarizeAllergensAndLabels(
  labels?: string,
  allergens?: string
): string | undefined {
  const src = `${labels ?? ''} ${allergens ?? ''}`
    .toLowerCase()
    .trim();
  if (!src) return undefined;

  // Helper to test presence while avoiding "-frei" false positives
  const has = (re: RegExp) =>
    re.test(src) &&
    !/(gluten\s*frei|laktose\s*frei|milch\s*frei)/i.test(src);

  const foundAllergens: string[] = [];
  // Group gluten-related cereals under "Gluten"
  if (
    has(/gluten|weizen|roggen|gerste|dinkel|hafer/) &&
    !/gluten\s*frei/i.test(src)
  )
    foundAllergens.push('Gluten');
  if (has(/milch|laktose/)) foundAllergens.push('Milch');
  if (has(/ei(er)?\b/)) foundAllergens.push('Ei');
  if (has(/soja/)) foundAllergens.push('Soja');
  if (has(/erdnuss/)) foundAllergens.push('Erdnuss');
  if (has(/nuss|haselnuss|walnuss|cashew|mandel|pistazie/))
    foundAllergens.push('Schalenfrüchte');
  if (has(/fisch\b/)) foundAllergens.push('Fisch');
  if (has(/krebstier|garnelen|krabben|hummer/))
    foundAllergens.push('Krebstiere');
  if (has(/sellerie/)) foundAllergens.push('Sellerie');
  if (has(/senf\b/)) foundAllergens.push('Senf');
  if (has(/sesam/)) foundAllergens.push('Sesam');
  if (has(/lupine/)) foundAllergens.push('Lupine');
  if (has(/sulf(it|id)|schwefeldioxid/))
    foundAllergens.push('Sulfite');
  if (has(/weichtier|muschel|tintenfisch/))
    foundAllergens.push('Weichtiere');

  // Essential non-allergen notices to surface briefly
  const extras: string[] = [];
  if (/alkohol/.test(src)) extras.push('Alkohol');

  // De-duplicate while preserving order
  const uniq = (arr: string[]) => Array.from(new Set(arr));
  const allergensShort = uniq(foundAllergens).join(', ');
  const extrasShort = uniq(extras).join(', ');
  const parts = [allergensShort, extrasShort].filter(Boolean);
  return parts.length ? parts.join(' · ') : undefined;
}

function cleanup(v?: string): string | undefined {
  if (!v) return v;
  return String(v).replace(/\s+/g, ' ').trim();
}

function normalizeDateString(v: any): string | undefined {
  if (!v) return undefined;
  const s = String(v).trim();
  // Try to parse formats like yyyy-mm-dd, dd.mm.yyyy
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const de = s.match(/^(\d{2})\.(\d{2})\.(\d{2,4})$/);
  if (de) {
    const year = de[3].length === 2 ? `20${de[3]}` : de[3];
    return `${year}-${de[2]}-${de[1]}`;
  }
  return s;
}

function pickFirst<T = any>(obj: any, keys: string[]): T | undefined {
  for (const k of keys)
    if (obj && Object.prototype.hasOwnProperty.call(obj, k))
      return obj[k] as T;
  return undefined;
}

// Generic helper
function toArray<T = any>(v: any): T[] {
  if (v == null) return [];
  return Array.isArray(v) ? (v as T[]) : [v as T];
}

export function dateFromOffset(offset: number): Date {
  return addDays(new Date(), offset);
}

export function isWeekend(d: Date): boolean {
  const day = d.getDay(); // 0=Sun, 6=Sat
  return day === 0 || day === 6;
}

export function nextWeekdayStart(from: Date = new Date()): Date {
  const day = from.getDay();
  if (day === 6) return addDays(from, 2); // Saturday -> Monday
  if (day === 0) return addDays(from, 1); // Sunday -> Monday
  return from; // Weekday: today
}

export function weekdayDates(
  count = 5,
  from: Date = new Date()
): Date[] {
  const dates: Date[] = [];
  let d = nextWeekdayStart(from);
  while (dates.length < count) {
    dates.push(d);
    let next = addDays(d, 1);
    while (isWeekend(next)) next = addDays(next, 1);
    d = next;
  }
  return dates;
}

export function isSameCalendarDay(a: Date, b: Date): boolean {
  return format(a, 'yyyy-MM-dd') === format(b, 'yyyy-MM-dd');
}
