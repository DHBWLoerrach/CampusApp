import { useMemo } from 'react';
import {
  ActivityIndicator,
  SectionList,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useTimetable } from '@/hooks/useTimetable';
import LectureCard from '@/components/LectureCard';
import { useCourseContext } from './_layout';

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
  const { selectedCourse, setSelectedCourse } = useCourseContext();
  const { data, isLoading, isError, error } = useTimetable(
    selectedCourse || undefined
  );

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

  const handleChangeCourse = () => {
    Alert.alert(
      'Kurs ändern',
      `Möchten Sie den aktuellen Kurs "${selectedCourse}" verlassen und einen neuen Kurs auswählen?`,
      [
        {
          text: 'Abbrechen',
          style: 'cancel',
        },
        {
          text: 'Kurs ändern',
          style: 'destructive',
          onPress: () => setSelectedCourse(null),
        },
      ]
    );
  };

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
        <Text style={styles.errorText}>
          Ein Fehler ist aufgetreten:
        </Text>
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
            <Text>
              Keine anstehenden Termine gefunden. Vielleicht Ferien?
              🏖️
            </Text>
          </View>
        )}
        // Add some spacing between items
        ItemSeparatorComponent={() => <View style={{ height: 6 }} />}
      />

      {/* Floating Action Button for changing course */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={handleChangeCourse}
      >
        <Text style={styles.floatingButtonText}>Kurs ändern</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
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
    color: 'red',
    textAlign: 'center',
    margin: 10,
  },
  sectionHeader: {
    backgroundColor: '#E8E8E8',
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  floatingButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
