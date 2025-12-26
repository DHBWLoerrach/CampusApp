import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { TimetableEvent } from "@/lib/icalService";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useColorScheme } from "@/hooks/useColorScheme";
import LinkifiedText from "@/components/ui/LinkifiedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { getScheduleCardLocationDisplay } from "@/lib/scheduleCardLocation";

interface LectureCardProps {
  event: TimetableEvent;
}

// Helper to format time range in German format (e.g., 09:00–12:15)
const formatTimeRange = (start: Date, end: Date) => {
  const startTime = start.toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const endTime = end.toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${startTime}–${endTime}`;
};

const LectureCard: React.FC<LectureCardProps> = ({ event }) => {
  const scheme = useColorScheme() ?? "light";
  const cardBg = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const secondaryText = useThemeColor({}, "icon");
  const borderColor = useThemeColor({}, "border");
  // Subtle filled background for chips (keeps contrast in both themes)
  const chipBg =
    scheme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";

  // Derive room and online link from the location, then decide if event is online
  const {
    roomText,
    isOnline,
    extraTextCollapsed,
    extraTextExpanded,
    hasHiddenUrls,
  } = getScheduleCardLocationDisplay({
    location: event.location,
    description: event.description,
  });

  const [roomMeasured, setRoomMeasured] = useState(false);
  const [isRoomTruncated, setIsRoomTruncated] = useState(false);
  const [isRoomExpanded, setIsRoomExpanded] = useState(false);
  const [extraMeasured, setExtraMeasured] = useState(false);
  const [isExtraMultiline, setIsExtraMultiline] = useState(false);
  const [isExtraExpanded, setIsExtraExpanded] = useState(false);
  const canExpandExtra =
    !!extraTextExpanded && (hasHiddenUrls || isExtraMultiline);
  const visibleExtraText = isExtraExpanded
    ? extraTextExpanded
    : extraTextCollapsed;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: cardBg,
          borderColor,
          shadowOpacity: scheme === "dark" ? 0 : styles.card.shadowOpacity,
          elevation: scheme === "dark" ? 0 : styles.card.elevation,
        },
      ]}
    >
      <View style={styles.metaRow}>
        <View style={styles.metaChunk}>
          <IconSymbol
            name="clock"
            size={14}
            color={secondaryText}
            style={styles.metaIcon}
          />
          <Text style={[styles.timeText, { color: secondaryText }]}>
            {event.allDay
              ? "Ganzer Tag"
              : formatTimeRange(event.start, event.end)}
          </Text>
        </View>

        {/* Room-Pill */}
        {!!roomText && (
          <>
            {/* Container: Pressable only when truncated */}
            {isRoomTruncated ? (
              <Pressable
                style={({ pressed }) => [
                  styles.metaChunk,
                  styles.chip,
                  styles.pillGrow,
                  {
                    backgroundColor: chipBg,
                    borderColor,
                    opacity: pressed ? 0.9 : 1,
                  },
                ]}
                onPress={() => setIsRoomExpanded((v) => !v)}
                accessibilityRole="button"
                accessibilityLabel={`Ort ${roomText}`}
                accessibilityHint={
                  isRoomExpanded
                    ? "Tippen klappt den Text zu"
                    : "Tippen zeigt den vollständigen Text"
                }
                hitSlop={6}
              >
                <IconSymbol
                  name="door.left.hand.open"
                  size={14}
                  color={secondaryText}
                  style={styles.metaIcon}
                />

                {/* Invisible measuring text: same width, without numberOfLines */}
                {!roomMeasured && (
                  <Text
                    onTextLayout={(e) => {
                      setIsRoomTruncated(e.nativeEvent.lines.length > 1);
                      setRoomMeasured(true);
                    }}
                    style={[styles.chipText, styles.measureGhost]}
                  >
                    {roomText}
                  </Text>
                )}

                {/* Visible text (1 line) */}
                <Text
                  numberOfLines={isRoomExpanded ? undefined : 1}
                  ellipsizeMode={isRoomExpanded ? "clip" : "tail"}
                  style={[styles.chipText, { color: secondaryText }]}
                >
                  {roomText}
                </Text>

                {/* Chevron only when truncated */}
                <IconSymbol
                  name={isRoomExpanded ? "chevron.down" : "chevron.right"}
                  size={14}
                  color={secondaryText}
                  style={styles.trailingIcon}
                />
              </Pressable>
            ) : (
              <View
                style={[
                  styles.metaChunk,
                  styles.chip,
                  { backgroundColor: chipBg, borderColor },
                ]}
                accessibilityRole="text"
                accessibilityLabel={`Ort ${roomText}`}
              >
                <IconSymbol
                  name="door.left.hand.open"
                  size={14}
                  color={secondaryText}
                  style={styles.metaIcon}
                />
                {!roomMeasured && (
                  <Text
                    onTextLayout={(e) => {
                      setIsRoomTruncated(e.nativeEvent.lines.length > 1);
                      setRoomMeasured(true);
                    }}
                    style={[styles.chipText, styles.measureGhost]}
                  >
                    {roomText}
                  </Text>
                )}

                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={[styles.chipText, { color: secondaryText }]}
                >
                  {roomText}
                </Text>
              </View>
            )}
          </>
        )}

        {/* Online-Pill */}
        {isOnline && (
          <View
            style={[
              styles.metaChunk,
              styles.chip,
              { backgroundColor: chipBg, borderColor },
            ]}
            accessibilityRole="text"
            accessibilityLabel="Online"
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
              Online
            </Text>
          </View>
        )}
      </View>

      <Text style={[styles.title, { color: textColor }]}>{event.title}</Text>

      {!!visibleExtraText && (
        <View style={styles.extraRow}>
          <View style={styles.extraTextWrap}>
            {!extraMeasured && !!extraTextExpanded && (
              <Text
                onTextLayout={(e) => {
                  setIsExtraMultiline(e.nativeEvent.lines.length > 1);
                  setExtraMeasured(true);
                }}
                style={[
                  styles.extraText,
                  styles.measureGhost,
                  { color: secondaryText },
                ]}
              >
                {extraTextExpanded}
              </Text>
            )}
            <LinkifiedText
              value={visibleExtraText}
              numberOfLines={isExtraExpanded ? undefined : 1}
              style={[styles.extraText, { color: secondaryText }]}
            />
          </View>
          {canExpandExtra && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                isExtraExpanded ? "Weniger anzeigen" : "Mehr anzeigen"
              }
              hitSlop={8}
              onPress={() => setIsExtraExpanded((v) => !v)}
              style={({ pressed }) => [
                styles.extraChevronButton,
                pressed && { opacity: 0.7 },
              ]}
            >
              <IconSymbol
                name={isExtraExpanded ? "chevron.up" : "chevron.down"}
                size={16}
                color={secondaryText}
              />
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 1.41,
    elevation: 2,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "nowrap",
    alignItems: "center",
    marginBottom: 2,
    minWidth: 0,
  },
  metaRowText: { flexShrink: 1 },
  metaChunk: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
    marginBottom: 2,
    maxWidth: "100%",
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
  pillGrow: {
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 0,
    overflow: "hidden",
  },
  metaIcon: {
    marginRight: 6,
  },
  timeText: {
    fontSize: 13,
  },
  title: {
    fontSize: 15,
    fontWeight: "bold",
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
  extraRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
    minWidth: 0,
  },
  extraTextWrap: {
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 0,
  },
  extraText: {
    fontSize: 13,
    opacity: 0.85,
  },
  extraChevronButton: {
    marginLeft: 8,
  },
  // Invisible measuring text (same width, without numberOfLines)
  measureGhost: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    opacity: 0,
  },
});

export default LectureCard;
