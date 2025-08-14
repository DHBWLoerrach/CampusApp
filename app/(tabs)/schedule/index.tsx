import { useMemo } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  SectionList,
  StyleSheet,
  View,
} from 'react-native';
import { useTimetable } from '@/hooks/useTimetable';
import LectureCard from '@/components/schedule/LectureCard';
import { useCourseContext } from '@/context/CourseContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';

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

/**
 * Main schedule component - now uses shared QueryClient from layout
 */
export default function ScheduleList() {
  const { selectedCourse } = useCourseContext();
  const { data, isLoading, isError, error, refetch, isFetching } =
    useTimetable(selectedCourse || undefined);

  // Theme-aware colors
  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');
  const scheme = useColorScheme() ?? 'light';
  const sectionHeaderBg = Colors[scheme].dayNumberContainer;
  const sectionHeaderText = Colors[scheme].dayTextColor;

  // useMemo will re-calculate the sections only when the timetable data changes.
  // This is a performance optimization.
  const sections = useMemo(() => {
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

  if (isLoading) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator size="large" color={tintColor} />
        <ThemedText>Vorlesungsplan wird geladen...</ThemedText>
      </ThemedView>
    );
  }

  if (isError) {
    return (
      <ThemedView style={styles.center}>
        <ThemedText style={[styles.errorText, { color: tintColor }]}>
          Ein Fehler ist aufgetreten:
        </ThemedText>
        <ThemedText style={[styles.errorText, { color: tintColor }]}>
          {error.message}
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.uid}
        renderItem={({ item }) => <LectureCard event={item} />}
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
            {formatDateHeader(title)}
          </ThemedText>
        )}
        ListEmptyComponent={() => (
          <ThemedView style={styles.center}>
            <ThemedText>
              Keine anstehenden Termine gefunden. Vielleicht Ferien?
              🏖️
            </ThemedText>
          </ThemedView>
        )}
        // Add some spacing between items
        ItemSeparatorComponent={() => <View style={{ height: 6 }} />}
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
  errorText: {
    textAlign: 'center',
    margin: 10,
  },
  sectionHeader: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
});
