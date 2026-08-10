import { useMemo } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  SectionList,
  StyleSheet,
  View,
} from 'react-native';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import ErrorWithReloadButton from '@/components/ui/ErrorWithReloadButton';
import OfflineBanner from '@/components/ui/OfflineBanner';
import OfflineEmptyState from '@/components/ui/OfflineEmptyState';
import BlockPlanPhaseCard from '@/components/schedule/BlockPlanPhaseCard';
import {
  formatDay,
  formatRemaining,
  getPhaseDisplay,
} from '@/components/schedule/blockPlanPhaseDisplay';
import {
  BLOCK_PLAN_OFFLINE_MESSAGE,
  BLOCK_PLAN_PARTIAL_MESSAGE,
  BLOCK_PLAN_STALE_ERROR_MESSAGE,
  BLOCK_PLAN_STALE_OFFLINE_MESSAGE,
  getBlockPlanErrorMessage,
} from '@/components/schedule/blockPlanErrorMessage';
import { useBlockPlan } from '@/hooks/useBlockPlan';
import { useTodayInBerlin } from '@/hooks/useTodayInBerlin';
import { useCourseContext } from '@/context/CourseContext';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import type { YmdDate } from '@/lib/berlinDate';
import {
  findCurrentPhase,
  findNextPhase,
  getPhaseProgress,
  isBeforeFirstPhase,
  type BlockPlan,
  type BlockPlanPhaseRef,
} from '@/lib/blockPlanDomain';

/**
 * Compact summary above the list: where the student stands today and what
 * comes next. Rendered as the list header so it scrolls away with the content.
 */
function BlockPlanSummary({
  plan,
  today,
}: {
  plan: BlockPlan;
  today: YmdDate;
}) {
  const borderColor = useThemeColor({}, 'border');
  const bgColor = useThemeColor({}, 'dayNumberContainer');
  const tintColor = useThemeColor({}, 'tint');
  const secondaryText = useThemeColor({}, 'icon');

  const current = findCurrentPhase(plan, today);
  const next = findNextPhase(plan, today);
  const beforeStart = isBeforeFirstPhase(plan, today);

  // Without a running phase, "not started yet" only holds before the very first
  // one. In a gap between two phases it would be plainly wrong.
  const headline = current
    ? `${current.semesterNumber}. Semester · ${getPhaseDisplay(current.phase.type).label}`
    : next
      ? beforeStart
        ? 'Das Studium hat noch nicht begonnen'
        : 'Zurzeit läuft keine Phase'
      : 'Der Blockplan ist abgeschlossen';

  const progress = current ? getPhaseProgress(current.phase, today) : null;

  let detail: string | null = null;
  if (current && progress) {
    detail = `${formatRemaining(progress.daysRemaining)} · bis ${formatDay(current.phase.endDate)}`;
  } else if (next) {
    detail = beforeStart
      ? `Start: ${formatDay(next.phase.startDate)}`
      : `Weiter ab ${formatDay(next.phase.startDate)} (${next.semesterNumber}. Semester)`;
  }

  const upcoming = current && next ? next : null;

  return (
    <View style={[styles.summary, { backgroundColor: bgColor, borderColor }]}>
      <View style={styles.summaryHeaderRow}>
        <IconSymbol
          name="calendar.badge.clock"
          size={18}
          color={tintColor}
          style={styles.summaryIcon}
        />
        <ThemedText type="defaultSemiBold" style={styles.summaryHeadline}>
          {headline}
        </ThemedText>
      </View>

      {detail && (
        <ThemedText style={[styles.summaryDetail, { color: secondaryText }]}>
          {detail}
        </ThemedText>
      )}

      {upcoming && (
        <ThemedText style={[styles.summaryDetail, { color: secondaryText }]}>
          {`Danach: ${getPhaseDisplay(upcoming.phase.type).label} (${upcoming.semesterNumber}. Semester)`}
        </ThemedText>
      )}
    </View>
  );
}

export default function BlockPlanView() {
  const { selectedCourse } = useCourseContext();
  const { data, isLoading, isError, error, refetch, isFetching } = useBlockPlan(
    selectedCourse || undefined
  );
  const { isOffline, isReady } = useOnlineStatus();

  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');
  const scheme = useColorScheme() ?? 'light';
  const sectionHeaderBg = Colors[scheme].dayNumberContainer;
  const sectionHeaderText = Colors[scheme].dayTextColor;

  // One reference day for the whole screen, so every card judges past/current
  // against the same date. Refreshes itself at midnight and on app resume.
  const today = useTodayInBerlin();

  const plan = data?.plan;

  const sections = useMemo(() => {
    if (!plan) return [];
    return plan.semesters.map((semester) => ({
      title: `${semester.number}. Semester`,
      // Each row carries its semester number so the list keys stay unique even
      // if the payload repeats the same phase across two semesters.
      data: semester.phases.map<BlockPlanPhaseRef>((phase) => ({
        semesterNumber: semester.number,
        phase,
      })),
    }));
  }, [plan]);

  const showOffline = isReady && isOffline;
  const hasResolvedResult = data !== undefined;

  if (!selectedCourse) {
    return (
      <ThemedView style={styles.center}>
        <ThemedText style={styles.centeredText}>
          Bitte wähle zuerst einen Kurs aus, um den Blockplan zu sehen.
        </ThemedText>
      </ThemedView>
    );
  }

  // Offline wins over the spinner: the request runs anyway (networkMode
  // 'always') and may hang until the OS times it out, so a known-offline device
  // must not stare at a spinner in the meantime.
  if (showOffline && !hasResolvedResult) {
    return (
      <OfflineEmptyState
        message={BLOCK_PLAN_OFFLINE_MESSAGE}
        onRetry={() => void refetch()}
      />
    );
  }

  if (isLoading) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator size="large" color={tintColor} />
        <ThemedText>Blockplan wird geladen...</ThemedText>
      </ThemedView>
    );
  }

  if (isError && error && !hasResolvedResult) {
    return (
      <ErrorWithReloadButton
        error={error}
        message={getBlockPlanErrorMessage(error)}
        isFetching={isFetching}
        refetch={refetch}
      />
    );
  }

  // `fromCache` only means no remote result has arrived yet, which is also true
  // while the first request is still in flight. Waiting for that request to
  // settle keeps the banner from flashing up during a normal cold start — but
  // when the device is known to be offline the request cannot succeed, so the
  // warning is shown right away instead of after the OS timeout.
  const isStale =
    (isError && hasResolvedResult) ||
    (data?.fromCache === true && (showOffline || !isFetching));

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      {isStale ? (
        showOffline ? (
          <OfflineBanner
            message={BLOCK_PLAN_STALE_OFFLINE_MESSAGE}
            style={styles.banner}
          />
        ) : (
          <OfflineBanner
            title="Nicht aktualisiert"
            message={BLOCK_PLAN_STALE_ERROR_MESSAGE}
            style={styles.banner}
          />
        )
      ) : null}

      {plan?.isPartial && (
        <OfflineBanner
          title="Unvollständig"
          message={BLOCK_PLAN_PARTIAL_MESSAGE}
          style={styles.banner}
        />
      )}

      <SectionList
        contentInsetAdjustmentBehavior="automatic"
        sections={sections}
        stickySectionHeadersEnabled={false}
        keyExtractor={(item, index) =>
          `${item.semesterNumber}-${item.phase.type}-${item.phase.startDate}-${index}`
        }
        ListHeaderComponent={
          plan ? <BlockPlanSummary plan={plan} today={today} /> : null
        }
        renderItem={({ item }) => (
          <BlockPlanPhaseCard phase={item.phase} today={today} />
        )}
        renderSectionHeader={({ section: { title } }) => (
          <ThemedText
            style={[
              styles.sectionHeader,
              {
                backgroundColor: sectionHeaderBg,
                color: sectionHeaderText,
              },
            ]}
          >
            {title}
          </ThemedText>
        )}
        ListEmptyComponent={() => (
          <ThemedView style={styles.center}>
            <ThemedText>
              Für diesen Kurs ist kein Blockplan hinterlegt.
            </ThemedText>
          </ThemedView>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        SectionSeparatorComponent={() => <View style={{ height: 4 }} />}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={refetch}
            tintColor={tintColor}
          />
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 50,
  },
  centeredText: {
    textAlign: 'center',
  },
  banner: {
    marginTop: 12,
    marginBottom: 4,
  },
  sectionHeader: {
    borderRadius: 8,
    borderCurve: 'continuous',
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  summary: {
    borderRadius: 12,
    borderCurve: 'continuous',
    borderWidth: 1,
    padding: 12,
    marginTop: 12,
  },
  summaryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
  },
  summaryIcon: {
    marginRight: 8,
  },
  summaryHeadline: {
    fontSize: 15,
    lineHeight: 20,
    flexShrink: 1,
  },
  summaryDetail: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
});
