import { useCallback, useMemo, useRef } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  SectionList,
  StyleSheet,
  type SectionListData,
  View,
} from 'react-native';
import { useScrollToTop } from 'expo-router/react-navigation';
import { useTimetable } from '@/hooks/useTimetable';
import LectureCard from '@/components/schedule/LectureCard';
import { useCourseContext } from '@/context/CourseContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import ErrorWithReloadButton from '@/components/ui/ErrorWithReloadButton';
import OfflineBanner from '@/components/ui/OfflineBanner';
import OfflineEmptyState from '@/components/ui/OfflineEmptyState';
import {
  getTimetableErrorMessage,
  SCHEDULE_OFFLINE_MESSAGE,
  SCHEDULE_STALE_ERROR_MESSAGE,
  SCHEDULE_STALE_OFFLINE_MESSAGE,
} from '@/components/schedule/timetableErrorMessage';
import type { TimetableEvent } from '@/lib/icalService';

type ScheduleSection = {
  title: string;
  data: TimetableEvent[];
};

// Helper function to format the date header (e.g., "Tuesday, November 21")
const formatDateHeader = (dateString: string): string => {
  const date = new Date(dateString);
  // Add time to avoid timezone issues when creating the date object
  const adjustedDate = new Date(
    date.valueOf() + date.getTimezoneOffset() * 60 * 1000
  );

  return adjustedDate.toLocaleDateString('de-DE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

function LectureSeparator() {
  return <View style={styles.lectureSeparator} />;
}

function ScheduleEmptyState() {
  return (
    <ThemedView style={styles.center}>
      <ThemedText>
        Keine anstehenden Termine gefunden. Vielleicht Ferien? 🏖️
      </ThemedText>
    </ThemedView>
  );
}

function renderLecture({ item }: { item: TimetableEvent }) {
  return <LectureCard event={item} />;
}

/**
 * Main schedule component - now uses shared QueryClient from layout
 */
export default function ScheduleList() {
  const ref = useRef<SectionList<TimetableEvent, ScheduleSection>>(null);
  useScrollToTop(ref);
  const { selectedCourse } = useCourseContext();
  const { data, isLoading, isError, error, refetch, isFetching } = useTimetable(
    selectedCourse || undefined
  );
  const { isOffline, isReady } = useOnlineStatus();

  // Theme-aware colors
  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');
  const scheme = useColorScheme();
  const sectionHeaderText = Colors[scheme].dayTextColor;
  const sectionHeaderDivider = Colors[scheme].border;

  // useMemo will re-calculate the sections only when the timetable data changes.
  // This is a performance optimization.
  const sections = useMemo<ScheduleSection[]>(() => {
    if (!data) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to midnight to compare dates correctly

    // 1. Filter out past days and transform into SectionList format
    const futureSections = Object.keys(data)
      .filter((dateKey) => new Date(dateKey) >= today) // Keep today and future days
      .sort() // Sort keys chronologically (YYYY-MM-DD string format allows this)
      .map((dateKey) => ({
        title: dateKey, // We use the raw date key as the title for now
        data: data[dateKey], // The events for that day
      }));

    return futureSections;
  }, [data]);

  const renderSectionHeader = useCallback(
    ({
      section,
    }: {
      section: SectionListData<TimetableEvent, ScheduleSection>;
    }) => (
      <ThemedText
        style={[
          styles.sectionHeader,
          {
            borderBottomColor: sectionHeaderDivider,
            color: sectionHeaderText,
          },
        ]}
      >
        {formatDateHeader(section.title)}
      </ThemedText>
    ),
    [sectionHeaderDivider, sectionHeaderText]
  );

  const showOffline = isReady && isOffline;
  const hasData = data !== undefined;

  if (showOffline && !hasData) {
    return (
      <OfflineEmptyState
        message={SCHEDULE_OFFLINE_MESSAGE}
        onRetry={() => void refetch()}
      />
    );
  }

  if (isLoading) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator size="large" color={tintColor} />
        <ThemedText>Vorlesungsplan wird geladen...</ThemedText>
      </ThemedView>
    );
  }

  if (isError && !hasData) {
    return (
      <ErrorWithReloadButton
        error={error}
        message={getTimetableErrorMessage(error)}
        isFetching={isFetching}
        refetch={refetch}
      />
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      {showOffline && hasData ? (
        <OfflineBanner
          message={SCHEDULE_STALE_OFFLINE_MESSAGE}
          style={styles.banner}
        />
      ) : isError && hasData ? (
        <OfflineBanner
          title="Nicht aktualisiert"
          message={SCHEDULE_STALE_ERROR_MESSAGE}
          style={styles.banner}
        />
      ) : null}
      <SectionList
        ref={ref}
        contentInsetAdjustmentBehavior="automatic"
        sections={sections}
        stickySectionHeadersEnabled={false}
        keyExtractor={(item) => item.uid}
        renderItem={renderLecture}
        renderSectionHeader={renderSectionHeader}
        ListEmptyComponent={ScheduleEmptyState}
        ItemSeparatorComponent={LectureSeparator}
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
  banner: {
    marginTop: 12,
    marginBottom: 4,
  },
  sectionHeader: {
    minHeight: 34,
    paddingHorizontal: 4,
    paddingVertical: 4,
    marginTop: 16,
    marginBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    fontSize: 15,
    fontWeight: '600',
  },
  lectureSeparator: {
    height: 8,
  },
});
