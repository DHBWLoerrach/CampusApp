import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TimetableEvent } from '@/lib/icalService';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useColorScheme } from '@/hooks/useColorScheme';
import LinkifiedText from '@/components/ui/LinkifiedText';

interface LectureCardProps {
  event: TimetableEvent;
}

// Helper to format time range in German format (e.g., 09:00–12:15)
const formatTimeRange = (start: Date, end: Date) => {
  const startTime = start.toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const endTime = end.toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${startTime}–${endTime}`;
};

const LectureCard: React.FC<LectureCardProps> = ({ event }) => {
  // Theme-aware colors
  const scheme = useColorScheme() ?? 'light';
  const cardBg = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const secondaryText = useThemeColor({}, 'icon');
  const borderColor = useThemeColor({}, 'border');

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: cardBg,
          borderColor,
          // In dark mode, avoid strong shadows; rely on border
          shadowOpacity:
            scheme === 'dark' ? 0 : styles.card.shadowOpacity,
          elevation: scheme === 'dark' ? 0 : styles.card.elevation,
        },
      ]}
    >
      <View style={styles.metaRow}>
        <Text style={[styles.timeText, { color: secondaryText }]}>
          {formatTimeRange(event.start, event.end)}
        </Text>
        {!!event.location && event.location.trim().length > 0 && (
          <>
            <Text style={[styles.bullet, { color: secondaryText }]}>
              •
            </Text>
            <LinkifiedText
              value={event.location}
              style={[styles.location, { color: secondaryText }]}
            />
          </>
        )}
      </View>
      <Text style={[styles.title, { color: textColor }]}>
        {event.title}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 1.41,
    elevation: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  timeText: {
    fontSize: 13,
  },
  bullet: {
    marginHorizontal: 6,
    fontSize: 13,
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  location: {
    fontSize: 13,
  },
});

export default LectureCard;
