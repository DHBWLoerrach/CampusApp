const URL_REGEX_GLOBAL = /(https?:\/\/[^\s]+)/gi;
const ONLINE_WORD_REGEX = /\bonline\b/i;

const ROOM_CODE_REGEX = /^[A-ZÄÖÜ]{1,3}\s*\d{1,4}[A-Z]?$/i;
const ROOM_KEYWORDS_REGEX =
  /(?:\braum\b|\bhörsaal\b|\bhs\b|\bsr\b|\bauditorium\b|\baudimax\b|bibliothek|\bcampus\b|\bgebäude\b|\blabor\b|\bseminar(?:raum)?\b)/i;

const LOCATION_PART_SPLIT =
  /\s*(?:\r?\n+|\||,\s+|\s[–—-]\s|\s[\\/]\s)\s*/g;
const TRAILING_PARENS_REGEX = /^(.*?)\s*\(([^()]*)\)\s*$/;
const TRIM_SEPARATORS = /^[\s,;:|/\\·–—-]+|[\s,;:|/\\·–—-]+$/g;

const PURE_ONLINE_MARKER_REGEX = /^online\b[\s:!.,;·–—-]*$/i;

function normalizeWhitespace(text: string) {
  return text.replace(/\s+/g, ' ').trim();
}

function normalizePart(text: string) {
  return normalizeWhitespace(text).replace(TRIM_SEPARATORS, '').trim();
}

function cleanUrl(rawUrl: string) {
  // Remove trailing punctuation that often sticks to URLs in plain text
  return rawUrl.replace(/[\.,;:!?\)\]\}>"']+$/g, '');
}

function extractUrls(text: string) {
  const urls: string[] = [];
  const seen = new Set<string>();

  for (const raw of text.match(URL_REGEX_GLOBAL) || []) {
    const cleaned = cleanUrl(raw);
    if (cleaned.length === 0) continue;
    if (seen.has(cleaned)) continue;
    seen.add(cleaned);
    urls.push(cleaned);
  }

  const textWithoutUrls = text.replace(URL_REGEX_GLOBAL, ' ');
  return { urls, textWithoutUrls } as const;
}

function isRoomLike(text: string) {
  const t = normalizePart(text);
  if (t.length === 0) return false;
  if (PURE_ONLINE_MARKER_REGEX.test(t)) return false;
  return ROOM_CODE_REGEX.test(t) || ROOM_KEYWORDS_REGEX.test(t);
}

function isRoomToken(text: string) {
  const t = normalizePart(text);
  if (t.length === 0) return false;
  if (PURE_ONLINE_MARKER_REGEX.test(t)) return false;
  if (ROOM_CODE_REGEX.test(t)) return true;
  if (ROOM_KEYWORDS_REGEX.test(t)) return true;
  // Heuristic for short tokens like "D234" / "S041"
  return (
    t.length <= 8 &&
    /\d/.test(t) &&
    /^[A-Za-zÄÖÜäöüß0-9\s.-]+$/.test(t)
  );
}

function scoreRoomCandidate(text: string) {
  const t = normalizePart(text);
  if (t.length === 0) return -1;
  if (PURE_ONLINE_MARKER_REGEX.test(t)) return -1;

  let score = 0;
  if (ROOM_CODE_REGEX.test(t)) score += 4;
  if (ROOM_KEYWORDS_REGEX.test(t)) score += 3;
  if (/\d/.test(t)) score += 1;
  return score;
}

function parseLocationForRoomAndExtra(locationTextNoUrls: string) {
  const raw = normalizeWhitespace(locationTextNoUrls);
  if (raw.length === 0) {
    return { roomText: null, locationExtra: null } as const;
  }

  if (PURE_ONLINE_MARKER_REGEX.test(raw)) {
    return { roomText: null, locationExtra: null } as const;
  }

  const parenMatch = TRAILING_PARENS_REGEX.exec(raw);
  const base = normalizeWhitespace(parenMatch ? parenMatch[1] : raw);
  const parenExtra = normalizePart(parenMatch ? parenMatch[2] : '');

  // Semicolon-separated room lists are common in DHBW calendars.
  if (base.includes(';')) {
    const tokens = base
      .split(';')
      .map((t) => normalizePart(t))
      .filter((t) => t.length > 0);

    if (tokens.length >= 2 && tokens.every(isRoomToken)) {
      const roomText = tokens.join('; ');
      const locationExtra = parenExtra.length > 0 ? parenExtra : null;
      return { roomText, locationExtra } as const;
    }
  }

  // Room code prefix with appended free text (e.g., "K326 bitte Notebooks mitbringen")
  const prefixMatch = base.match(
    /^([A-ZÄÖÜ]{1,3}\s*\d{1,4}[A-Z]?)(?=\b|[\s,;:|/\\·–—-])/i
  );
  if (prefixMatch) {
    const roomText = normalizePart(prefixMatch[1]);
    const rest = normalizePart(base.slice(prefixMatch[0].length));
    const extraParts: string[] = [];

    if (rest.length > 0 && !PURE_ONLINE_MARKER_REGEX.test(rest)) {
      extraParts.push(rest);
    }
    if (parenExtra.length > 0) extraParts.push(parenExtra);

    const locationExtra =
      extraParts.length > 0 ? extraParts.join(' · ') : null;
    return { roomText, locationExtra } as const;
  }

  // Split into parts and pick the best room candidate (ignoring pure online markers).
  const parts = base
    .split(LOCATION_PART_SPLIT)
    .map((p) => normalizePart(p))
    .filter((p) => p.length > 0);

  if (parts.length > 1) {
    let bestIndex = -1;
    let bestScore = -1;
    for (let i = 0; i < parts.length; i += 1) {
      const s = scoreRoomCandidate(parts[i]);
      if (s > bestScore) {
        bestScore = s;
        bestIndex = i;
      }
    }

    if (bestIndex >= 0 && isRoomLike(parts[bestIndex])) {
      const roomText = parts[bestIndex];
      const extraParts = parts
        .filter((_p, i) => i !== bestIndex)
        .filter((p) => !PURE_ONLINE_MARKER_REGEX.test(p));

      if (parenExtra.length > 0) extraParts.push(parenExtra);

      const locationExtra =
        extraParts.length > 0 ? extraParts.join(' · ') : null;
      return { roomText, locationExtra } as const;
    }

    // Online marker with additional info (e.g., "online - Link …") → keep only the extra info.
    const nonOnlineParts = parts.filter(
      (p) => !PURE_ONLINE_MARKER_REGEX.test(p)
    );
    if (nonOnlineParts.length > 0 && nonOnlineParts.length < parts.length) {
      const extraParts = [...nonOnlineParts];
      if (parenExtra.length > 0) extraParts.push(parenExtra);
      return {
        roomText: null,
        locationExtra: extraParts.join(' · '),
      } as const;
    }
  }

  // Single part: treat as room only when we are confident; otherwise keep as extra.
  if (isRoomLike(base)) {
    const locationExtra = parenExtra.length > 0 ? parenExtra : null;
    return { roomText: base, locationExtra } as const;
  }

  return { roomText: null, locationExtra: raw } as const;
}

function addUniqueTextPart(
  parts: string[],
  rawPart: string | null | undefined
) {
  const part = normalizePart(rawPart || '');
  if (part.length === 0) return;

  const key = part.toLowerCase();
  const existingKeys = new Set(parts.map((p) => p.toLowerCase()));
  if (existingKeys.has(key)) return;
  parts.push(part);
}

export function getScheduleCardLocationDisplay(args: {
  location?: string | null;
  description?: string | null;
}) {
  const locationRaw = args.location || '';
  const descriptionRaw = args.description || '';

  const { urls: locationUrls, textWithoutUrls: locationTextNoUrls } =
    extractUrls(locationRaw);
  const {
    urls: descriptionUrls,
    textWithoutUrls: descriptionTextNoUrls,
  } = extractUrls(descriptionRaw);

  const urls = [...locationUrls, ...descriptionUrls].filter((u, idx, a) => {
    return a.indexOf(u) === idx;
  });

  const { roomText, locationExtra } =
    parseLocationForRoomAndExtra(locationTextNoUrls);

  const descriptionExtra = normalizeWhitespace(descriptionTextNoUrls);
  const hasDescriptionExtra =
    descriptionExtra.length > 0 && descriptionExtra !== '\\n';

  const isOnline =
    urls.length > 0 ||
    ONLINE_WORD_REGEX.test(locationRaw) ||
    ONLINE_WORD_REGEX.test(descriptionRaw);

  const textParts: string[] = [];
  addUniqueTextPart(textParts, locationExtra);
  if (hasDescriptionExtra) addUniqueTextPart(textParts, descriptionExtra);

  const expandedParts = [...textParts, ...urls];
  const extraTextExpanded =
    expandedParts.length > 0 ? expandedParts.join(' · ') : null;

  const collapsedUrls = urls.slice(0, 1);
  const collapsedParts = [...textParts, ...collapsedUrls];
  const extraTextCollapsed =
    collapsedParts.length > 0 ? collapsedParts.join(' · ') : null;

  return {
    roomText,
    isOnline,
    extraTextCollapsed,
    extraTextExpanded,
    hasHiddenUrls: urls.length > 1,
  } as const;
}
