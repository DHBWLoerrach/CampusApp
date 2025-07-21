import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TimetableEvent } from '@/lib/icalService';

interface LectureCardProps {
  event: TimetableEvent;
}

// Helper to format time nicely (e.g., 10:15)
const formatTime = (date: Date) => {
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const LectureCard: React.FC<LectureCardProps> = ({ event }) => {
  return (
    <View style={styles.card}>
      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>{formatTime(event.start)}</Text>
        <Text style={styles.timeText}>-</Text>
        <Text style={styles.timeText}>{formatTime(event.end)}</Text>
      </View>
      <View style={styles.detailsContainer}>
        <Text style={styles.title}>{event.title}</Text>
        <Text style={styles.location}>{event.location}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  timeContainer: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderRightWidth: 1,
    borderRightColor: '#EEEEEE',
    paddingRight: 16,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
  },
  detailsContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: '#666',
  },
});

export default LectureCard;
