import { useMemo } from 'react';
import {
  ActivityIndicator,
  SectionList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { useTimetable } from '@/hooks/useTimetable';
import LectureCard from '@/components/LectureCard';

// Create a query client instance for React Query
const queryClient = new QueryClient();

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

const AgendaScreen = () => {
  const { data, isLoading, isError, error } = useTimetable();

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
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Stundenplan wird geladen...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Ein Fehler ist aufgetreten:</Text>
        <Text style={styles.errorText}>{error.message}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.uid}
        renderItem={({ item }) => <LectureCard event={item} />}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionHeader}>
            {formatDateHeader(title)}
          </Text>
        )}
        ListEmptyComponent={() => (
          <View style={styles.center}>
            <Text>Keine anstehenden Termine gefunden. Vielleicht Ferien? 🏖️</Text>
          </View>
        )}
        // Add some spacing between items
        contentContainerStyle={{ paddingHorizontal: 16 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />
    </View>
  );
};

/**
 * Main schedule component that provides React Query context
 * Wraps the ScheduleDisplay component with QueryClientProvider
 */
export default function ScheduleList() {
  return (
    <QueryClientProvider client={queryClient}>
      <View style={styles.container}>
        <AgendaScreen />
      </View>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 50,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    backgroundColor: '#F5F5F5', // Match the container background
    paddingTop: 20,
    paddingBottom: 10,
    paddingHorizontal: 16,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
});
