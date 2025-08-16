import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
} from 'react-native';
import { TimetableEvent } from '@/lib/icalService';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useColorScheme } from '@/hooks/useColorScheme';
import LinkifiedText from '@/components/ui/LinkifiedText';
import { IconSymbol } from '@/components/ui/IconSymbol';

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

// --- Local helpers for readability ---
const URL_REGEX = /(https?:\/\/[^\s]+)/i;
const ONLINE_WORD_REGEX = /\bonline\b/i;

function splitLocation(location?: string | null) {
  const text = (location || '').trim();
  const m = text.match(URL_REGEX);
  const url = m ? m[0] : null;
  const room = url ? text.replace(url, '').trim() : text;
  return { url, room } as const;
}

function isOnlineEvent(
  title?: string | null,
  location?: string | null,
  url?: string | null
) {
  if (url) return true;
  const haystack = `${title || ''} ${location || ''}`;
  return ONLINE_WORD_REGEX.test(haystack);
}

const LectureCard: React.FC<LectureCardProps> = ({ event }) => {
  // Theme-aware colors
  const scheme = useColorScheme() ?? 'light';
  const cardBg = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const secondaryText = useThemeColor({}, 'icon');
  const borderColor = useThemeColor({}, 'border');
  // Subtle filled background for chips (keeps contrast in both themes)
  const chipBg =
    scheme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';

  // Derive room and online link from the location, then decide if event is online
  const rawLocation = event.location || '';
  const { url: onlineLink, room: roomText } =
    splitLocation(rawLocation);
  const isOnline = isOnlineEvent(
    event.title,
    rawLocation,
    onlineLink
  );

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
        {/* Time chunk with clock icon */}
        <View style={styles.metaChunk}>
          <IconSymbol
            name="clock"
            size={14}
            color={secondaryText}
            style={styles.metaIcon}
          />
          <Text style={[styles.timeText, { color: secondaryText }]}>
            {formatTimeRange(event.start, event.end)}
          </Text>
        </View>

        {/* Room chunk (if room text is present) */}
        {!isOnline && !!roomText && (
          <Pressable
            style={({ pressed }) => [
              styles.metaChunk,
              styles.chip,
              {
                backgroundColor: chipBg,
                borderColor,
                opacity: pressed ? 0.9 : 1,
              },
            ]}
            onPress={() => Alert.alert('Infos zum Raum', roomText)}
            accessibilityRole="button"
            accessibilityLabel={`Ort ${roomText}`}
            accessibilityHint="Zeigt den vollständigen Raumtext"
          >
            <IconSymbol
              name="building"
              size={14}
              color={secondaryText}
              style={styles.metaIcon}
            />
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[styles.chipText, { color: secondaryText }]}
            >
              {roomText}
            </Text>
            <IconSymbol
              name="chevron.right"
              size={14}
              color={secondaryText}
              style={styles.trailingIcon}
            />
          </Pressable>
        )}

        {/* Online chunk (shown if event is online; optional link) */}
        {isOnline && (
          <View
            style={[
              styles.metaChunk,
              styles.chip,
              { backgroundColor: chipBg, borderColor },
            ]}
            accessibilityRole="text"
            accessibilityLabel={
              onlineLink ? `Online ${onlineLink}` : 'Online'
            }
          >
            <IconSymbol
              name="video"
              size={14}
              color={secondaryText}
              style={styles.metaIcon}
            />
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[styles.chipText, { color: secondaryText }]}
            >
              {onlineLink ? 'Online: ' : 'Online'}
              {!!onlineLink && (
                <LinkifiedText
                  value={onlineLink}
                  style={[styles.chipText, { color: secondaryText }]}
                />
              )}
            </Text>
          </View>
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
    flexWrap: 'nowrap',
    alignItems: 'center',
    marginBottom: 2,
    minWidth: 0,
  },
  metaRowText: {
    flexShrink: 1,
  },
  metaChunk: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 2,
    maxWidth: '100%',
    minWidth: 0,
  },
  chip: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    flexShrink: 1,
    minWidth: 0,
  },
  metaIcon: {
    marginRight: 6,
  },
  timeText: {
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
  chipText: {
    fontSize: 13,
    flexShrink: 1,
  },
  trailingIcon: {
    marginLeft: 6,
    opacity: 0.6,
  },
});

export default LectureCard;
