import { StyleSheet, Text, View } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/hooks/useThemeColor';
import type { YmdDate } from '@/lib/berlinDate';
import {
  getPhaseDurationDays,
  isPhaseActiveOn,
  type BlockPlanPhase,
} from '@/lib/blockPlanDomain';
import {
  formatPhaseDuration,
  formatPhaseRange,
  getPhaseDisplay,
} from '@/components/schedule/blockPlanPhaseDisplay';

interface BlockPlanPhaseCardProps {
  phase: BlockPlanPhase;
  /** Reference day used to decide past/current/upcoming. */
  today: YmdDate;
}

export default function BlockPlanPhaseCard({
  phase,
  today,
}: BlockPlanPhaseCardProps) {
  const cardBg = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const secondaryText = useThemeColor({}, 'icon');
  const borderColor = useThemeColor({}, 'border');
  const tintColor = useThemeColor({}, 'tint');

  const { label, icon } = getPhaseDisplay(phase.type);
  const isCurrent = isPhaseActiveOn(phase, today);
  const isPast = phase.endDate < today;

  // Derived once and reused by visible text and the accessibility label. The
  // summary owns progress details, keeping this list row deliberately compact.
  const rangeText = formatPhaseRange(phase);
  const durationText = formatPhaseDuration(getPhaseDurationDays(phase));

  return (
    <View
      accessible
      accessibilityRole="text"
      accessibilityLabel={[
        label,
        rangeText,
        durationText,
        isCurrent ? 'Aktuell' : null,
        isPast ? 'Abgeschlossen' : null,
      ]
        .filter(Boolean)
        .join(', ')}
      style={[
        styles.card,
        {
          backgroundColor: cardBg,
          borderColor,
          borderLeftColor: isCurrent ? tintColor : borderColor,
          borderLeftWidth: isCurrent ? 4 : 1,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <IconSymbol
          name={icon}
          size={16}
          color={secondaryText}
          style={[styles.headerIcon, isPast ? styles.pastIcon : null]}
        />
        <Text
          style={[
            styles.title,
            isCurrent ? styles.currentTitle : null,
            { color: isPast ? secondaryText : textColor },
          ]}
        >
          {label}
        </Text>
        {isCurrent ? (
          <View style={[styles.badge, { backgroundColor: tintColor }]}>
            <Text style={styles.badgeText}>Aktuell</Text>
          </View>
        ) : null}
      </View>

      <Text style={[styles.range, { color: textColor }]}>{rangeText}</Text>

      <Text style={[styles.meta, { color: secondaryText }]}>
        {durationText}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    borderCurve: 'continuous',
    padding: 12,
    borderWidth: 1,
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
  pastIcon: {
    opacity: 0.7,
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    flexShrink: 1,
  },
  currentTitle: {
    marginRight: 12,
  },
  badge: {
    marginLeft: 'auto',
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
});
