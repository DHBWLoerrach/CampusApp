import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  SectionList,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useTimetable } from '@/hooks/useTimetable';
import { validateCourse } from '@/lib/icalService';
import LectureCard from '@/components/LectureCard';

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

const CourseInputSection = ({
  onCourseChange,
}: {
  onCourseChange: (course: string) => void;
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const handleValidateAndSetCourse = async () => {
    if (!inputValue.trim()) {
      Alert.alert('Fehler', 'Bitte geben Sie einen Kursnamen ein.');
      return;
    }

    setIsValidating(true);
    try {
      const isValid = await validateCourse(inputValue.trim());
      if (isValid) {
        onCourseChange(inputValue.trim());
        Alert.alert(
          'Erfolg',
          `Kurs "${inputValue.trim()}" wurde erfolgreich geladen.`
        );
      } else {
        Alert.alert(
          'Ungültiger Kurs',
          `Der Kurs "${inputValue.trim()}" konnte nicht gefunden werden. Bitte überprüfen Sie den Namen.`
        );
      }
    } catch (error) {
      Alert.alert(
        'Fehler',
        'Bei der Validierung des Kurses ist ein Fehler aufgetreten.'
      );
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <View style={styles.courseInputContainer}>
      <View style={styles.courseInputRow}>
        <TextInput
          style={styles.courseInput}
          value={inputValue}
          onChangeText={setInputValue}
          placeholder="Kursname eingeben"
          placeholderTextColor="#999"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity
          style={[
            styles.validateButton,
            isValidating && styles.validateButtonDisabled,
          ]}
          onPress={handleValidateAndSetCourse}
          disabled={isValidating}
        >
          {isValidating ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.validateButtonText}>Laden</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const AgendaScreen = () => {
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const { data, isLoading, isError, error } =
    useTimetable(selectedCourse);

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

  const handleCourseChange = (course: string) => {
    setSelectedCourse(course);
  };

  // Show course input if no course is selected
  if (!selectedCourse) {
    return (
      <View style={styles.container}>
        <CourseInputSection onCourseChange={handleCourseChange} />
        <View style={styles.center}>
          <Text style={styles.infoText}>
            Bitte geben Sie zunächst Ihren Kursnamen ein, um den
            Stundenplan zu laden.
          </Text>
        </View>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <CourseInputSection onCourseChange={handleCourseChange} />
        <View style={styles.center}>
          <ActivityIndicator size="large" />
          <Text>Stundenplan wird geladen...</Text>
        </View>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.container}>
        <CourseInputSection onCourseChange={handleCourseChange} />
        <View style={styles.center}>
          <Text style={styles.errorText}>
            Ein Fehler ist aufgetreten:
          </Text>
          <Text style={styles.errorText}>{error.message}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CourseInputSection onCourseChange={handleCourseChange} />
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
    </View>
  );
};

/**
 * Main schedule component - now uses shared QueryClient from layout
 */
export default function ScheduleList() {
  return (
    <View style={styles.container}>
      <AgendaScreen />
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
  courseInputContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  courseInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  courseInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  validateButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    minWidth: 80,
    alignItems: 'center',
  },
  validateButtonDisabled: {
    backgroundColor: '#999',
  },
  validateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
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
});
