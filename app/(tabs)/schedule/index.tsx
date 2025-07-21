import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { useTimetable } from '@/hooks/useTimetable';

// Create a query client instance for React Query
const queryClient = new QueryClient();

/**
 * Component that displays the timetable data
 * Handles loading, error, and success states
 */
function ScheduleDisplay() {
  const { data, isLoading, isError, error } = useTimetable();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Lade Stundenplan...</Text>
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

  // If everything went well, display the data (as text for now)
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Dein Stundenplan (Rohdaten)</Text>
      {/* Convert the object to a readable string */}
      <Text style={styles.jsonText}>
        {JSON.stringify(data, null, 2)}
      </Text>
    </ScrollView>
  );
}

/**
 * Main schedule component that provides React Query context
 * Wraps the ScheduleDisplay component with QueryClientProvider
 */
export default function ScheduleList() {
  return (
    <QueryClientProvider client={queryClient}>
      <View style={styles.container}>
        <ScheduleDisplay />
      </View>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  jsonText: {
    fontFamily: 'monospace', // If available on the device
    fontSize: 12,
  },
});
