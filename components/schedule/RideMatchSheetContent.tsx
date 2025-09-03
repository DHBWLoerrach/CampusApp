import { useMemo, useState } from 'react';
import {
  Pressable,
  View,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { ThemedText } from '@/components/ui/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/hooks/useThemeColor';

// ---- Match JSON  ----
type MatchIndex = {
  version: number;
  generatedAt: string;
  timezone: string;
  days: {
    date: string;
    courses: {
      course: string;
      program: string | null;
      firstStartMin: number;
      lastEndMin: number;
    }[];
  }[];
};

let MATCH_JSON: MatchIndex = {
  version: 1,
  generatedAt: '',
  timezone: 'Europe/Berlin',
  days: [],
};

try {
  // Using require keeps things simple and works in Metro for JSON files.
  MATCH_JSON =
    require('../../scripts/match-index.json') as MatchIndex;
} catch {
  // File not present in repo or not generated yet; keep empty fallback.
}

// ---- Helpers ----

function getTodayKey(): string {
  const f = new Intl.DateTimeFormat('en-CA', {
    timeZone: MATCH_JSON.timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return f.format(new Date());
}

const TOLERANCE_MIN = 15;
const ARRIVAL_OFFSET_MIN = -5; // show arrival 5 minutes before first lecture
const DEPARTURE_OFFSET_MIN = 5; // show departure 5 minutes after last lecture
const MAX_VISIBLE_CHIPS = 5; // show + weitere X beyond this

type MatchMode = 'exact' | 'tolerance';

// Format minutes (since midnight) to "HH:MM"
function mmToHHMM(mm: number | null | undefined): string {
  if (mm == null || mm < 0) return '—';
  const h = Math.floor(mm / 60);
  const m = mm % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(
    2,
    '0'
  )}`;
}

// Convert a hex color like #RRGGBB to an rgba() string with alpha
function hexToRgba(hex: string, alpha: number): string {
  const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex);
  if (!m) return hex;
  const r = parseInt(m[1], 16);
  const g = parseInt(m[2], 16);
  const b = parseInt(m[3], 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
// Clamp minutes to a 0..1439 range for safe display
function clampDayMinutes(
  mm: number | null | undefined
): number | null {
  if (mm == null || !Number.isFinite(mm)) return null;
  if (mm < 0) return 0;
  if (mm > 1439) return 1439;
  return mm;
}

// Localized short date like "Di, 02.09."
function formatDateShort(ymd: string): string {
  const [y, m, d] = ymd.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  const weekdayShort = new Intl.DateTimeFormat('de-DE', {
    weekday: 'short',
    timeZone: MATCH_JSON.timezone,
  })
    .format(dt)
    .replace(/\.$/, ''); // drop trailing dot ("Mo." -> "Mo")
  const dd = String(d).padStart(2, '0');
  const mm = String(m).padStart(2, '0');
  return `${weekdayShort}, ${dd}.${mm}.`;
}

type DayRow = {
  date: string;
  myFirst?: number;
  myLast?: number;
  toMatches: string[]; // exact: same firstStartMin
  backMatches: string[]; // exact: same lastEndMin
};

// Compute day rows for a given course code
function computeRows(myCourse: string, mode: MatchMode): DayRow[] {
  const todayKey = getTodayKey();
  return MATCH_JSON.days
    .filter((day) => day.date >= todayKey) // ignore past days
    .map((day) => {
    const valid = day.courses.filter(
      (c) => !(c.firstStartMin === 0 && c.lastEndMin === 0)
    );

    const me = valid.find((c) => c.course === myCourse);
    const myFirst = me?.firstStartMin;
    const myLast = me?.lastEndMin;

    const toMatches =
      myFirst == null || myFirst === 0
        ? []
        : valid
            .filter((c) => {
              if (c.course === myCourse) return false;
              if (
                !Number.isFinite(c.firstStartMin) ||
                c.firstStartMin === 0
              )
                return false;
              return mode === 'exact'
                ? c.firstStartMin === myFirst
                : Math.abs(c.firstStartMin - myFirst) <=
                    TOLERANCE_MIN;
            })
            .map((c) => c.course);

    const backMatches =
      myLast == null || myLast === 0
        ? []
        : valid
            .filter((c) => {
              if (c.course === myCourse) return false;
              if (
                !Number.isFinite(c.lastEndMin) ||
                c.lastEndMin === 0
              )
                return false;
              return mode === 'exact'
                ? c.lastEndMin === myLast
                : Math.abs(c.lastEndMin - myLast) <= TOLERANCE_MIN;
            })
            .map((c) => c.course);

    return {
      date: day.date,
      myFirst,
      myLast,
      toMatches,
      backMatches,
    };
    });
}

export default function RideMatchSheetContent({
  myCourse = '',
}: {
  myCourse?: string;
}) {
  const [copied, setCopied] = useState<string | null>(null);
  const [mode, setMode] = useState<MatchMode>('exact');
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Precompute day rows once
  const rows = useMemo(
    () => computeRows(myCourse, mode),
    [myCourse, mode]
  );

  // Dynamic labels based on current offsets
  const arrAbs = Math.abs(ARRIVAL_OFFSET_MIN);
  const depAbs = Math.abs(DEPARTURE_OFFSET_MIN);
  // Card outline color (theme-aware, slightly stronger in dark mode)
  const borderBase = useThemeColor({}, 'border') as string;
  const cardBorderColor = hexToRgba(borderBase, isDark ? 0.42 : 0.32);
  const cardBorderWidth = isDark ? StyleSheet.hairlineWidth : 1;
  // Today key in the calendar timezone
  const todayKey = useMemo(() => getTodayKey(), []);
  // Tomorrow key in the same timezone
  const tomorrowKey = useMemo(() => {
    const [y, m, d] = todayKey.split('-').map(Number);
    const t = new Date(Date.UTC(y, (m ?? 1) - 1, (d ?? 1) + 1));
    const yy = t.getUTCFullYear();
    const mm = String(t.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(t.getUTCDate()).padStart(2, '0');
    return `${yy}-${mm}-${dd}`;
  }, [todayKey]);
  const tintColor = useThemeColor({}, 'tint') as string;
  const todayAlpha = isDark ? 0.36 : 0.14;
  const tomorrowAlpha = isDark ? 0.28 : 0.1;
  const badgeTodayBg = hexToRgba(tintColor, todayAlpha);
  const badgeTomorrowBg = hexToRgba(tintColor, tomorrowAlpha);

  // Build compact strings for copy/share actions
  const buildCopyText = (
    date: string,
    dir: 'hin' | 'zurueck',
    list: string[],
    myMin?: number
  ) => {
    const dateLabel = formatDateShort(date);
    const raw =
      dir === 'hin'
        ? (myMin ?? 0) + ARRIVAL_OFFSET_MIN
        : (myMin ?? 0) + DEPARTURE_OFFSET_MIN;
    const adj = clampDayMinutes(raw);
    const time = mmToHHMM(adj ?? -1);
    const label = dir === 'hin' ? 'Ankunft' : 'Abfahrt';
    const courses = list.length ? list.join(', ') : '—';
    return `(${dateLabel}) ${label} ${time} · Kurse: ${courses}`;
  };

  // Best-effort copy: works on web; on native we just set state to show feedback
  const tryCopy = async (text: string) => {
    try {
      // @ts-ignore
      if (globalThis?.navigator?.clipboard?.writeText) {
        // @ts-ignore
        await globalThis.navigator.clipboard.writeText(text);
      }
      setCopied('Text kopiert');
      setTimeout(() => setCopied(null), 1500);
    } catch {
      setCopied('Bereit zum Einfügen');
      setTimeout(() => setCopied(null), 1500);
    }
  };

  return (
    <View style={styles.container}>
      <ThemedText style={styles.info}>
        Kurse mit gleichen Ankunfts-/Abfahrtszeiten wie{' '}
        <ThemedText style={styles.bold}>{myCourse}</ThemedText>{' '}
      </ThemedText>
      <View style={styles.subInfoWrap}>
        <ThemedText style={styles.subInfo}>
          {`Ankunft = VL-Start - ${arrAbs} Min`}
        </ThemedText>
        <ThemedText style={styles.subInfo}>
          {`Abfahrt = VL-Ende + ${depAbs} Min`}
        </ThemedText>
      </View>

      <View style={styles.segmentedWrap}>
        <View
          style={[
            styles.segmented,
            isDark ? styles.segmentedDark : styles.segmentedLight,
          ]}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Exakt anzeigen"
            onPress={() => setMode('exact')}
            style={({ pressed }) => [
              styles.segItem,
              mode === 'exact' &&
                (isDark
                  ? styles.segItemActiveDark
                  : styles.segItemActiveLight),
              pressed && { opacity: 0.9 },
            ]}
          >
            <ThemedText
              style={[
                styles.segText,
                mode === 'exact' && styles.segTextActive,
                mode === 'exact' &&
                  isDark &&
                  styles.segTextActiveDark,
                mode === 'exact' &&
                  !isDark &&
                  styles.segTextActiveLight,
              ]}
            >
              Exakte Zeiten
            </ThemedText>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Mit ±${TOLERANCE_MIN} Minuten Toleranz anzeigen`}
            onPress={() => setMode('tolerance')}
            style={({ pressed }) => [
              styles.segItem,
              mode === 'tolerance' &&
                (isDark
                  ? styles.segItemActiveDark
                  : styles.segItemActiveLight),
              pressed && { opacity: 0.9 },
            ]}
          >
            <ThemedText
              style={[
                styles.segText,
                mode === 'tolerance' && styles.segTextActive,
                mode === 'tolerance' &&
                  isDark &&
                  styles.segTextActiveDark,
                mode === 'tolerance' &&
                  !isDark &&
                  styles.segTextActiveLight,
              ]}
            >
              ±{TOLERANCE_MIN} Min Toleranz
            </ThemedText>
          </Pressable>
        </View>
      </View>

      {rows.map((row) => {
          const hasToTime = Number.isFinite(row.myFirst);
          const hasBackTime = Number.isFinite(row.myLast);
          const hasMyTimes = hasToTime || hasBackTime;
          return (
            <View
              key={row.date}
              style={[
                styles.card,
                {
                  borderColor: cardBorderColor,
                  borderWidth: cardBorderWidth,
                },
              ]}
            >
              {(() => {
                const dateLabel = formatDateShort(row.date);
                const parts: string[] = [];
                if (hasToTime) {
                  const adj = clampDayMinutes(
                    row.myFirst! + ARRIVAL_OFFSET_MIN
                  );
                  parts.push(`Ankunft ${mmToHHMM(adj ?? -1)}`);
                }
                if (hasBackTime) {
                  const adj = clampDayMinutes(
                    row.myLast! + DEPARTURE_OFFSET_MIN
                  );
                  parts.push(`Abfahrt ${mmToHHMM(adj ?? -1)}`);
                }
                const rightText =
                  parts.length === 0
                    ? 'Keine Vorlesung'
                    : parts.join(' · ');
                const isToday = row.date === todayKey;
                const isTomorrow = row.date === tomorrowKey;
                const badgeLabel = isToday
                  ? 'Heute'
                  : isTomorrow
                  ? 'Morgen'
                  : null;
                return (
                  <View style={styles.dayHeaderRow}>
                    <View style={styles.dayHeaderLeft}>
                      <ThemedText style={styles.dayHeaderDate}>
                        {dateLabel}
                      </ThemedText>
                      {badgeLabel && (
                        <View
                          style={[
                            styles.badgeToday,
                            {
                              backgroundColor: isTomorrow
                                ? badgeTomorrowBg
                                : badgeTodayBg,
                            },
                          ]}
                        >
                          <ThemedText style={styles.badgeTodayText}>
                            {badgeLabel}
                          </ThemedText>
                        </View>
                      )}
                    </View>
                    <ThemedText style={styles.dayHeaderTimes}>
                      {rightText}
                    </ThemedText>
                  </View>
                );
              })()}
              {/* Remark on card level if there are no matches */}
              {(() => {
                const dayHasAnyMatches =
                  (hasToTime && row.toMatches.length > 0) ||
                  (hasBackTime && row.backMatches.length > 0);
                return hasMyTimes && !dayHasAnyMatches ? (
                  <ThemedText
                    style={[
                      styles.muted,
                      styles.info,
                      { marginBottom: 6 },
                    ]}
                  >
                    Keine Mitfahr-Matches für diesen Tag.
                  </ThemedText>
                ) : null;
              })()}

              {(() => {
                const dayHasAnyMatches =
                  (hasToTime && row.toMatches.length > 0) ||
                  (hasBackTime && row.backMatches.length > 0);
                if (!hasMyTimes || !dayHasAnyMatches) return null;
                return (
                  <>
                    {hasToTime && (
                      <Section
                        title={
                          mode === 'exact'
                            ? 'Ankunft (Exakt)'
                            : `Ankunft (±${TOLERANCE_MIN} Min)`
                        }
                        chips={row.toMatches}
                        emptyHint="Keine passenden Ankünfte"
                        onCopy={() =>
                          tryCopy(
                            buildCopyText(
                              row.date,
                              'hin',
                              row.toMatches,
                              row.myFirst
                            )
                          )
                        }
                      />
                    )}
                    {hasBackTime && (
                      <Section
                        title={
                          mode === 'exact'
                            ? 'Abfahrt (Exakt)'
                            : `Abfahrt (±${TOLERANCE_MIN} Min)`
                        }
                        chips={row.backMatches}
                        emptyHint="Keine passenden Abfahrten"
                        onCopy={() =>
                          tryCopy(
                            buildCopyText(
                              row.date,
                              'zurueck',
                              row.backMatches,
                              row.myLast
                            )
                          )
                        }
                      />
                    )}
                  </>
                );
              })()}
            </View>
          );
        })}

      {copied && (
        <ThemedText style={styles.toast}>{copied}</ThemedText>
      )}
    </View>
  );
}

function Section({
  title,
  chips,
  emptyHint = '—',
  onCopy,
}: {
  title: string;
  chips: string[];
  emptyHint?: string;
  onCopy?: () => void;
}) {
  const list = chips.length ? chips : [];
  const [expanded, setExpanded] = useState(false);
  const visibleCount = expanded
    ? list.length
    : Math.min(list.length, MAX_VISIBLE_CHIPS);
  const hiddenCount = Math.max(0, list.length - visibleCount);
  const textColor = useThemeColor({}, 'text');
  const suffix = (() => {
    const m = title.match(/\(([^)]+)\)$/);
    return m ? ` (${m[1]})` : '';
  })();
  const headerText =
    list.length === 0 ? `${emptyHint}${suffix}` : title;
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <ThemedText style={styles.sectionTitle}>
          {headerText}
        </ThemedText>
        {list.length > 0 && onCopy && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${title} kopieren`}
            hitSlop={8}
            onPress={onCopy}
            style={({ pressed }) => [
              styles.copyBtn,
              pressed && { opacity: 0.6 },
            ]}
          >
            <IconSymbol
              name="doc.on.doc"
              size={16}
              color={textColor}
            />
          </Pressable>
        )}
      </View>
      {list.length > 0 && (
        <View style={styles.chipsWrap}>
          <>
            {list.slice(0, visibleCount).map((c) => (
              <View key={c} style={styles.chip}>
                <ThemedText style={styles.chipText}>{c}</ThemedText>
              </View>
            ))}
            {!expanded && hiddenCount > 0 && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Weitere ${hiddenCount} Kurse anzeigen`}
                onPress={() => setExpanded(true)}
                style={({ pressed }) => [
                  styles.chip,
                  pressed && { opacity: 0.7 },
                ]}
              >
                <View style={styles.chipContentRow}>
                  <ThemedText style={styles.chipText}>
                    {hiddenCount} weitere anzeigen
                  </ThemedText>
                  <IconSymbol
                    name="chevron.down"
                    size={12}
                    color={textColor}
                    style={styles.chipIcon}
                  />
                </View>
              </Pressable>
            )}
            {expanded && list.length > MAX_VISIBLE_CHIPS && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Weniger anzeigen"
                onPress={() => setExpanded(false)}
                style={({ pressed }) => [
                  styles.chip,
                  pressed && { opacity: 0.7 },
                ]}
              >
                <View style={styles.chipContentRow}>
                  <ThemedText style={styles.chipText}>
                    Weniger anzeigen
                  </ThemedText>
                  <IconSymbol
                    name="chevron.up"
                    size={12}
                    color={textColor}
                    style={styles.chipIcon}
                  />
                </View>
              </Pressable>
            )}
          </>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  info: { fontSize: 14, opacity: 0.8, textAlign: 'center' },
  bold: { fontSize: 14, fontWeight: '700' },
  card: {
    borderRadius: 12,
    padding: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(125,125,125,0.25)',
    marginBottom: 8,
  },
  dayHeader: { fontSize: 15, fontWeight: '700', marginBottom: 8 },
  dayHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  dayHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dayHeaderDate: { fontSize: 15, fontWeight: '700' },
  dayHeaderTimes: { fontSize: 12, fontWeight: '600', opacity: 0.9 },
  badgeToday: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeTodayText: { fontSize: 9, fontWeight: '700' },
  section: { marginBottom: 6 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: { fontSize: 13, fontWeight: '600' },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  chip: {
    backgroundColor: 'rgba(125,125,125,0.12)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chipContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  chipIcon: { marginLeft: 2 },
  chipText: { fontSize: 10, fontWeight: '600' },
  muted: { opacity: 0.6 },
  copyBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },
  toast: {
    alignSelf: 'center',
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(40,180,99,0.15)',
    fontWeight: '700',
  },
  toggleWrap: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 6,
  },
  toggleBtn: {
    backgroundColor: 'rgba(125,125,125,0.12)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'transparent',
  },
  toggleBtnActive: {
    borderColor: 'rgba(125,125,125,0.35)',
    backgroundColor: 'rgba(125,125,125,0.18)',
  },
  toggleText: { fontSize: 12, fontWeight: '700' },
  toggleTextActive: {},
  segmentedWrap: { alignItems: 'center', marginBottom: 6 },
  segmented: {
    flexDirection: 'row',
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  segmentedDark: {
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  segmentedLight: {
    borderColor: 'rgba(125,125,125,0.35)',
    backgroundColor: 'rgba(125,125,125,0.12)',
  },
  segItem: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segItemActiveDark: { backgroundColor: 'rgba(255,255,255,0.85)' },
  segItemActiveLight: { backgroundColor: 'rgba(0,0,0,0.06)' },
  segText: { fontSize: 12, fontWeight: '700', opacity: 0.85 },
  segTextActive: { opacity: 1 },
  segTextActiveDark: { color: '#111' },
  segTextActiveLight: { color: '#111' },
  subInfoWrap: { alignItems: 'center', gap: 0, marginTop: -6 },
  subInfo: {
    fontSize: 12,
    lineHeight: 13,
    opacity: 0.7,
    textAlign: 'center',
  },
});
