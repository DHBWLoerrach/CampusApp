import { StyleSheet, Text, View } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/hooks/useThemeColor';
import {
  getPhaseDurationDays,
  type BlockPlanPhase,
} from '@/lib/blockPlanDomain';
import {
  formatPhaseDuration,
  formatPhaseRange,
  getPhaseDisplay,
} from '@/components/schedule/blockPlanPhaseDisplay';

interface BlockPlanArchivedPhaseRowProps {
  phase: BlockPlanPhase;
  showDivider: boolean;
}

export default function BlockPlanArchivedPhaseRow({
  phase,
  showDivider,
}: BlockPlanArchivedPhaseRowProps) {
  const textColor = useThemeColor({}, 'text');
  const secondaryText = useThemeColor({}, 'icon');
  const borderColor = useThemeColor({}, 'border');

  const { label, icon } = getPhaseDisplay(phase.type);
  const rangeText = formatPhaseRange(phase);
  const durationText = formatPhaseDuration(getPhaseDurationDays(phase));

  return (
    <View
      accessible
      accessibilityRole="text"
      accessibilityLabel={`${label}, ${rangeText}, ${durationText}, Abgeschlossen`}
      style={[
        styles.row,
        showDivider
          ? {
              borderBottomColor: borderColor,
              borderBottomWidth: StyleSheet.hairlineWidth,
            }
          : null,
      ]}
    >
      <IconSymbol
        name={icon}
        size={16}
        color={secondaryText}
        style={styles.icon}
      />
      <View style={styles.textContainer}>
        <Text style={[styles.primaryLine, { color: textColor }]}>
          <Text style={[styles.phaseLabel, { color: secondaryText }]}>
            {label}
          </Text>
          {` · ${rangeText}`}
        </Text>
        <Text style={[styles.duration, { color: secondaryText }]}>
          {durationText}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minWidth: 0,
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  icon: {
    marginTop: 2,
    marginRight: 8,
    opacity: 0.7,
  },
  textContainer: {
    flex: 1,
    minWidth: 0,
  },
  primaryLine: {
    fontSize: 14,
    lineHeight: 19,
  },
  phaseLabel: {
    fontWeight: '500',
  },
  duration: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 1,
  },
});
