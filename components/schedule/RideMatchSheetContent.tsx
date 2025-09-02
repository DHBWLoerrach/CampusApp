// Dummy UI that renders "Mitfahr-Matches" from the provided JSON for a given course.
// - Exact matches only (Hin: same firstStartMin; Zurück: same lastEndMin)
// - Ignores bogus entries like first/last == 0

import React, { useMemo, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { ThemedText } from '@/components/ui/ThemedText';

// ---- Match JSON (loaded from scripts/match-index.json if available) ----
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

const TOLERANCE_MIN = 15;
const MAX_VISIBLE_CHIPS = 10; // show + weitere X beyond this

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

// Localized short date like "Di, 02.09."
function formatDateShort(ymd: string): string {
  const [y, m, d] = ymd.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return new Intl.DateTimeFormat('de-DE', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    timeZone: MATCH_JSON.timezone,
  }).format(dt);
}

type DayRow = {
  date: string;
  myFirst?: number;
  myLast?: number;
  hinMatches: string[]; // exact: same firstStartMin
  zurueckMatches: string[]; // exact: same lastEndMin
};

// Compute day rows for a given course code
function computeRows(myCourse: string, mode: MatchMode): DayRow[] {
  return MATCH_JSON.days.map((day) => {
    const valid = day.courses.filter(
      (c) => !(c.firstStartMin === 0 && c.lastEndMin === 0)
    );

    const me = valid.find((c) => c.course === myCourse);
    const myFirst = me?.firstStartMin;
    const myLast = me?.lastEndMin;

    const hinMatches =
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

    const zurueckMatches =
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
      hinMatches,
      zurueckMatches,
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

  // Precompute day rows once
  const rows = useMemo(
    () => computeRows(myCourse, mode),
    [myCourse, mode]
  );

  // Build compact strings for copy/share actions
  const buildCopyText = (
    date: string,
    dir: 'hin' | 'zurueck',
    list: string[],
    myMin?: number
  ) => {
    const dateLabel = formatDateShort(date);
    const time = mmToHHMM(myMin ?? -1);
    const label = dir === 'hin' ? 'Hin' : 'Zurück';
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
        Kurse mit gleichen Hin-/Rückfahrzeiten zu{' '}
        <ThemedText style={styles.bold}>{myCourse}</ThemedText>
      </ThemedText>

      <View style={styles.toggleWrap}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Exakt anzeigen"
          onPress={() => setMode('exact')}
          style={({ pressed }) => [
            styles.toggleBtn,
            mode === 'exact' && styles.toggleBtnActive,
            pressed && { opacity: 0.8 },
          ]}
        >
          <ThemedText
            style={[
              styles.toggleText,
              mode === 'exact' && styles.toggleTextActive,
            ]}
          >
            Exakt
          </ThemedText>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Mit ±${TOLERANCE_MIN} Minuten Toleranz anzeigen`}
          onPress={() => setMode('tolerance')}
          style={({ pressed }) => [
            styles.toggleBtn,
            mode === 'tolerance' && styles.toggleBtnActive,
            pressed && { opacity: 0.8 },
          ]}
        >
          <ThemedText
            style={[
              styles.toggleText,
              mode === 'tolerance' && styles.toggleTextActive,
            ]}
          >
            ±{TOLERANCE_MIN} Min
          </ThemedText>
        </Pressable>
      </View>

      {rows.map((row) => {
        const hasMyTimes =
          Number.isFinite(row.myFirst) || Number.isFinite(row.myLast);
        return (
          <View key={row.date} style={styles.card}>
            <ThemedText style={styles.dayHeader}>
              {formatDateShort(row.date)} ·{' '}
              {Number.isFinite(row.myFirst)
                ? `Hin ${mmToHHMM(row.myFirst!)}`
                : 'Keine Vorlesung'}
              {Number.isFinite(row.myLast)
                ? ` · Zurück ${mmToHHMM(row.myLast!)}`
                : ''}
            </ThemedText>

            {hasMyTimes ? (
              <>
                <Section
                  title={
                    mode === 'exact'
                      ? 'Hin (Exakt)'
                      : `Hin (±${TOLERANCE_MIN} Min)`
                  }
                  chips={row.hinMatches}
                  emptyHint="—"
                  onCopy={() =>
                    tryCopy(
                      buildCopyText(
                        row.date,
                        'hin',
                        row.hinMatches,
                        row.myFirst
                      )
                    )
                  }
                />
                <Section
                  title={
                    mode === 'exact'
                      ? 'Zurück (Exakt)'
                      : `Zurück (±${TOLERANCE_MIN} Min)`
                  }
                  chips={row.zurueckMatches}
                  emptyHint="—"
                  onCopy={() =>
                    tryCopy(
                      buildCopyText(
                        row.date,
                        'zurueck',
                        row.zurueckMatches,
                        row.myLast
                      )
                    )
                  }
                />
              </>
            ) : (
              <ThemedText style={styles.muted}>
                Für diesen Tag liegen für {myCourse} keine
                Vorlesungszeiten vor.
              </ThemedText>
            )}
          </View>
        );
      })}

      {copied && (
        <ThemedText style={styles.toast}>{copied}</ThemedText>
      )}
    </View>
  );
}

// Small presentational section with chips and a copy button
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
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${title} kopieren`}
          onPress={onCopy}
          style={({ pressed }) => [
            styles.copyBtn,
            pressed && { opacity: 0.7 },
          ]}
        >
          <ThemedText style={styles.copyBtnText}>Kopieren</ThemedText>
        </Pressable>
      </View>
      <View style={styles.chipsWrap}>
        {list.length === 0 ? (
          <ThemedText style={styles.muted}>{emptyHint}</ThemedText>
        ) : (
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
                <ThemedText style={styles.chipText}>
                  + weitere {hiddenCount}
                </ThemedText>
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
                <ThemedText style={styles.chipText}>
                  − weniger
                </ThemedText>
              </Pressable>
            )}
          </>
        )}
      </View>
    </View>
  );
}

// ---- Styles ----
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
  chipText: { fontSize: 10, fontWeight: '600' },
  muted: { opacity: 0.6 },
  copyBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(125,125,125,0.35)',
  },
  copyBtnText: { fontSize: 12, fontWeight: '700' },
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
});
