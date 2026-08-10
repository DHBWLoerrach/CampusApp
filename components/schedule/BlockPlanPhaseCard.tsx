import { StyleSheet, Text, View } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useColorScheme } from '@/hooks/useColorScheme';
import { dhbwRed } from '@/constants/Colors';
import { hexToRgba } from '@/lib/utils';
import type { YmdDate } from '@/lib/berlinDate';
import {
  getPhaseDurationDays,
  getPhaseProgress,
  type BlockPlanPhase,
} from '@/lib/blockPlanDomain';
import {
  formatPhaseDuration,
  formatPhaseRange,
  formatRemaining,
  getPhaseDisplay,
} from '@/components/schedule/blockPlanPhaseDisplay';

const CARD_BOX_SHADOW = '0 1px 2px rgba(0, 0, 0, 0.15)';

// Tint wash behind the running phase. Derived from the brand color so it stays
// in sync with `tint` instead of repeating the literal.
const HIGHLIGHT_BG_DARK = hexToRgba(dhbwRed, 0.12);
const HIGHLIGHT_BG_LIGHT = hexToRgba(dhbwRed, 0.06);

interface BlockPlanPhaseCardProps {
  phase: BlockPlanPhase;
  /** Reference day used to decide past/current/upcoming. */
  today: YmdDate;
}

export default function BlockPlanPhaseCard({
  phase,
  today,
}: BlockPlanPhaseCardProps) {
  const scheme = useColorScheme() ?? 'light';
  const cardBg = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const secondaryText = useThemeColor({}, 'icon');
  const borderColor = useThemeColor({}, 'border');
  const tintColor = useThemeColor({}, 'tint');

  const { label, icon } = getPhaseDisplay(phase.type);
  const progress = getPhaseProgress(phase, today);
  const isCurrent = progress !== null;
  const isPast = phase.endDate < today;

  // Derived once and reused by both the visible text and the accessibility
  // label — these run for every row of a virtualized list.
  const rangeText = formatPhaseRange(phase);
  const durationText = formatPhaseDuration(getPhaseDurationDays(phase));
  const remainingText = progress
    ? formatRemaining(progress.daysRemaining)
    : null;

  const accentColor = isCurrent ? tintColor : secondaryText;
  const highlightBg =
    scheme === 'dark' ? HIGHLIGHT_BG_DARK : HIGHLIGHT_BG_LIGHT;

  return (
    <View
      accessible
      accessibilityRole="text"
      accessibilityLabel={[
        label,
        rangeText,
        durationText,
        remainingText ? `Aktuell, ${remainingText}` : null,
      ]
        .filter(Boolean)
        .join(', ')}
      style={[
        styles.card,
        {
          backgroundColor: isCurrent ? highlightBg : cardBg,
          borderColor: isCurrent ? tintColor : borderColor,
          borderLeftColor: accentColor,
          boxShadow: scheme === 'dark' ? 'none' : CARD_BOX_SHADOW,
        },
        isPast && styles.pastCard,
      ]}
    >
      <View style={styles.headerRow}>
        <IconSymbol
          name={icon}
          size={16}
          color={accentColor}
          style={styles.headerIcon}
        />
        <Text style={[styles.title, { color: textColor }]}>{label}</Text>
        {isCurrent && (
          <View style={[styles.badge, { backgroundColor: tintColor }]}>
            <Text style={styles.badgeText}>Aktuell</Text>
          </View>
        )}
      </View>

      <Text style={[styles.range, { color: secondaryText }]}>{rangeText}</Text>

      <Text style={[styles.meta, { color: secondaryText }]}>
        {durationText}
        {remainingText ? ` · ${remainingText}` : ''}
      </Text>

      {isCurrent && (
        <View style={[styles.progressTrack, { borderColor }]}>
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: tintColor,
                width: `${Math.min(100, Math.max(2, progress.ratio * 100))}%`,
              },
            ]}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    borderCurve: 'continuous',
    padding: 12,
    borderWidth: 1,
    borderLeftWidth: 4,
  },
  pastCard: {
    opacity: 0.55,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    minWidth: 0,
  },
  headerIcon: {
    marginRight: 6,
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    flexShrink: 1,
  },
  badge: {
    marginLeft: 8,
    borderRadius: 999,
    borderCurve: 'continuous',
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  range: {
    fontSize: 14,
  },
  meta: {
    fontSize: 13,
    marginTop: 2,
    opacity: 0.9,
  },
  progressTrack: {
    height: 4,
    borderRadius: 999,
    borderCurve: 'continuous',
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    borderCurve: 'continuous',
  },
});
