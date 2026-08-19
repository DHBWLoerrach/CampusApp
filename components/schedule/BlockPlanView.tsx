import { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  RefreshControl,
  SectionList,
  StyleSheet,
  View,
} from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  FadeOutUp,
  ReduceMotion,
  useAnimatedStyle,
  useReducedMotion,
  withTiming,
} from 'react-native-reanimated';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import ErrorWithReloadButton from '@/components/ui/ErrorWithReloadButton';
import OfflineBanner from '@/components/ui/OfflineBanner';
import OfflineEmptyState from '@/components/ui/OfflineEmptyState';
import BlockPlanArchivedPhaseRow from '@/components/schedule/BlockPlanArchivedPhaseRow';
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
  type BlockPlanSemester,
} from '@/lib/blockPlanDomain';

const ARCHIVE_ENTERING = FadeInDown.duration(200).reduceMotion(
  ReduceMotion.System
);
const ARCHIVE_EXITING = FadeOutUp.duration(150).reduceMotion(
  ReduceMotion.System
);
const SUMMARY_BOX_SHADOW = '0 1px 2px rgba(0, 0, 0, 0.15)';
const ARCHIVE_REVEAL_DISTANCE = 160;

function NoItemSeparator() {
  return null;
}

function PhaseCardSeparator() {
  return <View style={styles.phaseCardSeparator} />;
}

function ArchiveChevron({
  isExpanded,
  color,
}: {
  isExpanded: boolean;
  color: string;
}) {
  const animatedStyle = useAnimatedStyle(
    () => ({
      transform: [
        {
          rotate: withTiming(isExpanded ? '180deg' : '0deg', {
            duration: 200,
            easing: Easing.out(Easing.cubic),
            reduceMotion: ReduceMotion.System,
          }),
        },
      ],
    }),
    [isExpanded]
  );

  return (
    <Animated.View style={animatedStyle}>
      <IconSymbol name="chevron.down" size={22} color={color} />
    </Animated.View>
  );
}

function isPastSemester(semester: BlockPlanSemester, today: YmdDate): boolean {
  return semester.phases.every((phase) => phase.endDate < today);
}

function PhaseProgressBar({
  ratio,
  trackColor,
  fillColor,
}: {
  ratio: number;
  trackColor: string;
  fillColor: string;
}) {
  const normalizedRatio = Math.min(1, Math.max(0, ratio));
  const percentage = Math.round(normalizedRatio * 100);

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel="Fortschritt der aktuellen Phase"
      accessibilityValue={{
        min: 0,
        max: 100,
        now: percentage,
        text: `${percentage} Prozent`,
      }}
      style={[styles.phaseProgressTrack, { backgroundColor: trackColor }]}
    >
      <View
        testID="block-plan-progress-fill"
        style={[
          styles.phaseProgressFill,
          {
            backgroundColor: fillColor,
            width: `${normalizedRatio * 100}%`,
          },
        ]}
      />
    </View>
  );
}

function BlockPlanSectionHeader({
  title,
  isArchive,
  isFirstArchivedSemester,
  isExpanded,
  pressedBackgroundColor,
  dividerColor,
  textColor,
  testID,
  onToggle,
}: {
  title: string;
  isArchive: boolean;
  isFirstArchivedSemester: boolean;
  isExpanded: boolean;
  pressedBackgroundColor: string;
  dividerColor: string;
  textColor: string;
  testID: string;
  onToggle: () => void;
}) {
  const content = (
    <>
      <View style={styles.sectionHeaderTitleRow}>
        {isArchive ? (
          <IconSymbol
            name="archivebox"
            size={18}
            color={textColor}
            style={styles.sectionHeaderIcon}
          />
        ) : null}
        <ThemedText style={[styles.sectionHeaderText, { color: textColor }]}>
          {title}
        </ThemedText>
      </View>
      {isArchive ? (
        <ArchiveChevron isExpanded={isExpanded} color={textColor} />
      ) : null}
    </>
  );

  if (!isArchive) {
    return (
      <View
        testID={testID}
        style={[
          styles.sectionHeader,
          styles.semesterHeader,
          isFirstArchivedSemester ? styles.firstArchivedSemesterHeader : null,
          { borderBottomColor: dividerColor },
        ]}
      >
        {content}
      </View>
    );
  }

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={`${title} ${isExpanded ? 'einklappen' : 'aufklappen'}`}
      accessibilityState={{ expanded: isExpanded }}
      onPress={onToggle}
      style={({ pressed }) => [
        styles.sectionHeader,
        styles.archiveHeader,
        {
          backgroundColor: pressed ? pressedBackgroundColor : 'transparent',
          borderColor: dividerColor,
        },
      ]}
    >
      {content}
    </Pressable>
  );
}

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
  const bgColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');
  const secondaryText = useThemeColor({}, 'icon');
  const progressTrackColor = useThemeColor({}, 'dayNumberContainer');
  const scheme = useColorScheme() ?? 'light';

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
    <View
      testID="block-plan-summary"
      style={[
        styles.summary,
        {
          backgroundColor: bgColor,
          borderColor,
          borderLeftColor: tintColor,
          boxShadow: scheme === 'dark' ? 'none' : SUMMARY_BOX_SHADOW,
        },
      ]}
    >
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

      {detail ? (
        <ThemedText style={[styles.summaryDetail, { color: secondaryText }]}>
          {detail}
        </ThemedText>
      ) : null}

      {progress ? (
        <PhaseProgressBar
          ratio={progress.ratio}
          trackColor={progressTrackColor}
          fillColor={tintColor}
        />
      ) : null}

      {upcoming ? (
        <ThemedText
          style={[
            styles.summaryDetail,
            progress ? styles.summaryUpcomingAfterProgress : null,
            { color: secondaryText },
          ]}
        >
          {`Danach: ${getPhaseDisplay(upcoming.phase.type).label} (${upcoming.semesterNumber}. Semester)`}
        </ThemedText>
      ) : null}
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
  const sectionHeaderText = Colors[scheme].dayTextColor;
  const reduceMotion = useReducedMotion();

  // One reference day for the whole screen, so every card judges past/current
  // against the same date. Refreshes itself at midnight and on app resume.
  const today = useTodayInBerlin();
  const sectionListRef = useRef<SectionList<BlockPlanPhaseRef>>(null);
  const scrollOffset = useRef(0);
  const shouldRevealPastArchive = useRef(false);
  const [expandedPastArchives, setExpandedPastArchives] = useState<Set<string>>(
    () => new Set()
  );

  const plan = data?.plan;
  const archiveCourseCode = plan?.course.code;
  const isPastArchiveExpanded = archiveCourseCode
    ? expandedPastArchives.has(archiveCourseCode)
    : false;

  const togglePastArchive = useCallback(() => {
    if (!archiveCourseCode) return;

    shouldRevealPastArchive.current = !isPastArchiveExpanded;
    setExpandedPastArchives((expanded) => {
      const next = new Set(expanded);
      if (next.has(archiveCourseCode)) {
        next.delete(archiveCourseCode);
      } else {
        next.add(archiveCourseCode);
      }
      return next;
    });
  }, [archiveCourseCode, isPastArchiveExpanded]);

  const sections = useMemo(() => {
    if (!plan) return [];

    const toSemesterSection = (
      semester: BlockPlanSemester,
      isArchivedSemester: boolean,
      isFirstArchivedSemester = false
    ) => ({
      key: `${plan.course.code}-semester-${semester.number}`,
      title: `${semester.number}. Semester`,
      isArchive: false,
      isArchivedSemester,
      isFirstArchivedSemester,
      ItemSeparatorComponent: isArchivedSemester ? NoItemSeparator : undefined,
      data: semester.phases.map<BlockPlanPhaseRef>((phase) => ({
        semesterNumber: semester.number,
        phase,
      })),
    });
    const pastSemesters = plan.semesters.filter((semester) =>
      isPastSemester(semester, today)
    );
    const visibleSemesters = plan.semesters.filter(
      (semester) => !isPastSemester(semester, today)
    );
    const archiveSections =
      pastSemesters.length > 0
        ? [
            {
              key: `${plan.course.code}-past-archive`,
              title: `Vergangene Semester (${pastSemesters.length})`,
              isArchive: true,
              isArchivedSemester: false,
              isFirstArchivedSemester: false,
              data: [] as BlockPlanPhaseRef[],
            },
          ]
        : [];

    return [
      ...visibleSemesters.map((semester) => toSemesterSection(semester, false)),
      ...archiveSections,
      ...(isPastArchiveExpanded
        ? pastSemesters.map((semester, index) =>
            toSemesterSection(semester, true, index === 0)
          )
        : []),
    ];
  }, [isPastArchiveExpanded, plan, today]);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      scrollOffset.current = event.nativeEvent.contentOffset.y;
    },
    []
  );

  const revealPastArchive = useCallback(() => {
    if (!shouldRevealPastArchive.current) return;

    shouldRevealPastArchive.current = false;
    sectionListRef.current?.getScrollResponder()?.scrollTo({
      animated: !reduceMotion,
      y: scrollOffset.current + ARCHIVE_REVEAL_DISTANCE,
    });
  }, [reduceMotion]);

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
        ref={sectionListRef}
        contentInsetAdjustmentBehavior="automatic"
        sections={sections}
        onContentSizeChange={revealPastArchive}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        stickySectionHeadersEnabled={false}
        keyExtractor={(item, index) =>
          `${item.semesterNumber}-${item.phase.type}-${item.phase.startDate}-${index}`
        }
        ListHeaderComponent={
          plan ? <BlockPlanSummary plan={plan} today={today} /> : null
        }
        renderItem={({ item, index, section }) => {
          if (section.isArchivedSemester) {
            return (
              <Animated.View
                entering={ARCHIVE_ENTERING}
                exiting={ARCHIVE_EXITING}
              >
                <BlockPlanArchivedPhaseRow
                  phase={item.phase}
                  showDivider={index < section.data.length - 1}
                />
              </Animated.View>
            );
          }

          return <BlockPlanPhaseCard phase={item.phase} today={today} />;
        }}
        renderSectionHeader={({ section }) => {
          const header = (
            <BlockPlanSectionHeader
              title={section.title}
              isArchive={section.isArchive}
              isFirstArchivedSemester={section.isFirstArchivedSemester}
              isExpanded={isPastArchiveExpanded}
              pressedBackgroundColor={Colors[scheme].dayNumberContainer}
              dividerColor={Colors[scheme].border}
              textColor={sectionHeaderText}
              testID={`block-plan-section-${section.key}`}
              onToggle={togglePastArchive}
            />
          );
          return section.isArchivedSemester ? (
            <Animated.View
              entering={ARCHIVE_ENTERING}
              exiting={ARCHIVE_EXITING}
            >
              {header}
            </Animated.View>
          ) : (
            header
          );
        }}
        ListEmptyComponent={() => (
          <ThemedView style={styles.center}>
            <ThemedText>
              Für diesen Kurs ist kein Blockplan hinterlegt.
            </ThemedText>
          </ThemedView>
        )}
        ItemSeparatorComponent={PhaseCardSeparator}
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
  phaseCardSeparator: {
    height: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  archiveHeader: {
    minHeight: 48,
    borderRadius: 8,
    borderCurve: 'continuous',
    borderWidth: 1,
    paddingHorizontal: 12,
    marginTop: 24,
  },
  semesterHeader: {
    minHeight: 34,
    paddingHorizontal: 4,
    paddingVertical: 4,
    marginTop: 16,
    marginBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  firstArchivedSemesterHeader: {
    marginTop: 8,
  },
  sectionHeaderText: {
    fontSize: 15,
    fontWeight: '600',
    flexShrink: 1,
  },
  sectionHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
    flex: 1,
  },
  sectionHeaderIcon: {
    marginRight: 8,
  },
  summary: {
    borderRadius: 12,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderLeftWidth: 4,
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
  phaseProgressTrack: {
    height: 3,
    borderRadius: 999,
    borderCurve: 'continuous',
    overflow: 'hidden',
    marginTop: 8,
  },
  phaseProgressFill: {
    height: '100%',
    borderRadius: 999,
    borderCurve: 'continuous',
  },
  summaryUpcomingAfterProgress: {
    marginTop: 8,
  },
});
