import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TimetableEvent } from '@/lib/icalService';

interface LectureCardProps {
  event: TimetableEvent;
}

// Helper to format time range in German format with "Uhr" (e.g., 09:00–12:15 Uhr)
const formatTimeRange = (start: Date, end: Date) => {
  const startTime = start.toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const endTime = end.toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${startTime}–${endTime} Uhr`;
};

const LectureCard: React.FC<LectureCardProps> = ({ event }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.timeText}>
        {formatTimeRange(event.start, event.end)}
      </Text>
      <Text style={styles.title}>{event.title}</Text>
      <Text style={styles.location}>{event.location}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 1.41,
    elevation: 2,
  },
  timeText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  location: {
    fontSize: 13,
    color: '#666',
  },
});

export default LectureCard;
