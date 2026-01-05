import { useCallback, useMemo, useRef } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import {
  CalendarBody,
  CalendarContainer,
  CalendarHeader,
  CalendarKitHandle,
  LocaleConfigsProps,
  OnEventResponse,
  PackedEvent,
} from "@howljs/calendar-kit";
import { useTimetable } from "@/hooks/useTimetable";
import { useCourseContext } from "@/context/CourseContext";
import Header from "@/components/schedule/CalendarHeader";
import ErrorWithReloadButton from "@/components/ui/ErrorWithReloadButton";
import { useThemeColor } from "@/hooks/useThemeColor";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { toLocalISOString } from "@/lib/utils";
import { getScheduleCardLocationDisplay } from "@/lib/scheduleCardLocation";
import BottomSheet from "@/components/ui/BottomSheet";
import LinkifiedText from "@/components/ui/LinkifiedText";
import { ThemedText } from "@/components/ui/ThemedText";
import { useState } from "react";

interface CalendarEvent {
  id: string;
  title: string;
  start: { dateTime: string };
  end: { dateTime: string };
  location?: string;
  description?: string;
  allDay?: boolean;
  // Calendar Kit supports per-event styling; use this to color All‑Day chips
  color?: string;
  titleColor?: string;
}

function getOptionalStringField(obj: unknown, field: string): string {
  if (!obj || typeof obj !== "object") return "";
  const value = (obj as Record<string, unknown>)[field];
  return typeof value === "string" ? value : "";
}

function getOptionalBooleanField(obj: unknown, field: string): boolean | null {
  if (!obj || typeof obj !== "object") return null;
  const value = (obj as Record<string, unknown>)[field];
  return typeof value === "boolean" ? value : null;
}

interface ScheduleCalendarViewProps {
  numberOfDays: number;
  hideWeekDays?: number[];
}

const now = new Date();
// Build initial date at local midnight; if today is Sunday (0), advance to Monday
const _initialAtMidnight = new Date(
  now.getFullYear(),
  now.getMonth(),
  now.getDate(),
  0,
  0,
  0,
  0,
);
if (_initialAtMidnight.getDay() === 0) {
  _initialAtMidnight.setDate(_initialAtMidnight.getDate() + 1);
}
const INITIAL_DATE = toLocalISOString(_initialAtMidnight);

const initialLocales: Record<string, Partial<LocaleConfigsProps>> = {
  de: {
    weekDayShort: "So_Mo_Di_Mi_Do_Fr_Sa".split("_"),
    meridiem: { ante: "vorm.", post: "nachm." },
    more: "mehr",
  },
};

export default function ScheduleCalendarView({
  numberOfDays,
  hideWeekDays = [],
}: ScheduleCalendarViewProps) {
  const { selectedCourse } = useCourseContext();
  const [selectedEvent, setSelectedEvent] = useState<OnEventResponse | null>(
    null,
  );
  const { data, isLoading, isError, error, refetch, isFetching } = useTimetable(
    selectedCourse || undefined,
  );
  const calendarRef = useRef<CalendarKitHandle>(null);
  const currentDate = useSharedValue(INITIAL_DATE);

  const borderColor = useThemeColor({}, "border");
  const tintColor = useThemeColor({}, "tint");
  const backgroundColor = useThemeColor({}, "background");
  const dayNumberContainer = useThemeColor({}, "dayNumberContainer");
  const dayTextColor = useThemeColor({}, "dayTextColor");
  const textColor = useThemeColor({}, "text");
  const eventBackground = useThemeColor({}, "eventBackground");
  const eventTextColor = useThemeColor({}, "eventTextColor");
  const secondaryText = useThemeColor({}, "icon");

  // Transform timetable data to CalendarView format
  const events = useMemo((): CalendarEvent[] => {
    if (!data) return [];

    // Get all events (past and future) for full navigation
    const allEvents: CalendarEvent[] = [];

    Object.keys(data).forEach((dateKey) => {
      data[dateKey].forEach((event) => {
        const isAllDay = !!event.allDay;

        allEvents.push({
          id: event.uid,
          title: event.title,
          start: { dateTime: toLocalISOString(event.start) },
          end: { dateTime: toLocalISOString(event.end) },
          location: event.location,
          description: event.description,
          allDay: isAllDay,
          // Ensure All‑Day events (chips) adopt our brand tint color
          color: tintColor,
          // Keep white titles only for All‑Day chips
          titleColor: isAllDay ? "#fff" : undefined,
        });
      });
    });

    return allEvents;
  }, [data, tintColor]);

  const _onChange = useCallback(
    (date: string) => {
      currentDate.value = date;
    },
    [currentDate],
  );

  const _onPressToday = useCallback(() => {
    calendarRef.current?.goToDate({
      date: toLocalISOString(new Date()),
      animatedDate: true,
      hourScroll: true,
    });
  }, []);

  const onPressPrevious = () => {
    calendarRef.current?.goToPrevPage();
  };

  const onPressNext = () => {
    calendarRef.current?.goToNextPage();
  };

  const onPressEvent = (event: OnEventResponse) => {
    setSelectedEvent(event);
  };

  const renderEvent = useCallback(
    (event: PackedEvent) => {
      const rawLocation =
        typeof event.location === "string" ? event.location : "";
      const rawDescription = getOptionalStringField(event, "description");
      const {
        roomText,
        isOnline: online,
        extraTextCollapsed,
        hasHiddenUrls,
      } = getScheduleCardLocationDisplay({
        location: rawLocation,
        description: rawDescription,
      });
      const showExtraIndicator = !!extraTextCollapsed || hasHiddenUrls;

      return (
        <View style={{ height: "100%", padding: 4 }}>
          <Text
            numberOfLines={8}
            style={[
              {
                fontSize: 12,
                fontWeight: "600",
                color: eventTextColor,
              },
              event.titleColor ? { color: event.titleColor as string } : null,
            ]}
          >
            {event.title || ""}
          </Text>

          {/* Compact meta row with icon for Online/Raum */}
          {roomText ? (
            <View style={styles.metaRowSmall}>
              <IconSymbol
                name="door.left.hand.open"
                size={12}
                color={secondaryText}
                style={styles.metaIconSmall}
              />
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={{
                  fontSize: 12,
                  color: eventTextColor,
                  opacity: 0.85,
                  flexShrink: 1,
                }}
              >
                {roomText}
              </Text>
              {online && (
                <IconSymbol
                  name="video"
                  size={12}
                  color={secondaryText}
                  style={styles.metaIconSmallTrailing}
                />
              )}
              {showExtraIndicator && (
                <IconSymbol
                  name="info.circle"
                  size={12}
                  color={secondaryText}
                  style={styles.metaIconSmallTrailing}
                />
              )}
            </View>
          ) : online ? (
            <View style={styles.metaRowSmall}>
              <IconSymbol
                name="video"
                size={12}
                color={secondaryText}
                style={styles.metaIconSmall}
              />
              <Text
                numberOfLines={1}
                style={{
                  fontSize: 12,
                  color: eventTextColor,
                  opacity: 0.85,
                  flexShrink: 1,
                }}
              >
                Online
              </Text>
              {showExtraIndicator && (
                <IconSymbol
                  name="info.circle"
                  size={12}
                  color={secondaryText}
                  style={styles.metaIconSmallTrailing}
                />
              )}
            </View>
          ) : null}
        </View>
      );
    },
    [eventTextColor, secondaryText],
  );

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Vorlesungsplan wird geladen...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <ErrorWithReloadButton
        error={error as Error}
        isFetching={isFetching}
        refetch={refetch}
      />
    );
  }

  return (
    <View style={styles.container}>
      <Header
        currentDate={currentDate}
        onPressToday={_onPressToday}
        onPressPrevious={onPressPrevious}
        onPressNext={onPressNext}
      />
      <CalendarContainer
        ref={calendarRef}
        numberOfDays={numberOfDays}
        hideWeekDays={hideWeekDays} // we hide Sundays in week view
        initialDate={INITIAL_DATE}
        onChange={_onChange}
        onRefresh={() => {
          void refetch();
        }}
        isLoading={isFetching}
        allowPinchToZoom={true}
        hourWidth={50}
        initialLocales={initialLocales}
        locale="de"
        events={events}
        onPressEvent={onPressEvent}
        scrollToNow={false}
        start={420}
        end={1200}
        timeZone="Europe/Berlin"
        theme={{
          colors: {
            background: backgroundColor,
            border: borderColor,
          },
          eventContainerStyle: {
            backgroundColor: eventBackground,
            borderColor: borderColor,
            borderWidth: 1,
            borderRadius: 8,
          },
          nowIndicatorColor: "magenta",
          headerBackgroundColor: backgroundColor,
          hourTextStyle: { color: tintColor, fontWeight: "600" },
          todayName: { color: tintColor, fontWeight: "600" },
          todayNumberContainer: {
            backgroundColor: tintColor,
          },
          dayName: { color: textColor },
          dayNumber: { color: dayTextColor },
          dayNumberContainer: {
            backgroundColor: dayNumberContainer,
          },
        }}
      >
        <CalendarHeader />
        <CalendarBody renderEvent={renderEvent} />
      </CalendarContainer>
      <EventDetailSheet
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  metaRowSmall: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
    minWidth: 0,
  },
  metaIconSmall: {
    marginRight: 4,
  },
  metaIconSmallTrailing: {
    marginLeft: 4,
    opacity: 0.85,
  },
  detailText: {
    fontSize: 16,
    marginBottom: 8,
  },
  detailLabel: {
    fontWeight: "bold",
    marginTop: 8,
  },
});

function EventDetailSheet({
  event,
  onClose,
}: {
  event: OnEventResponse | null;
  onClose: () => void;
}) {
  const secondaryText = useThemeColor({}, "icon");
  const tintColor = useThemeColor({}, "tint");
  const textColor = useThemeColor({}, "text");

  if (!event) return null;

  const { dateTime: startTime } = event.start || {};
  const { dateTime: endTime } = event.end || {};
  if (!startTime || !endTime) return null;

  const startDate = new Date(startTime);
  const endDate = new Date(endTime);

  const rawLocation = typeof event.location === "string" ? event.location : "";
  const rawDescription = getOptionalStringField(event, "description");
  const { roomText, isOnline, extraTextExpanded } =
    getScheduleCardLocationDisplay({
      location: rawLocation,
      description: rawDescription,
    });

  const d = startDate.toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const isAllDay = getOptionalBooleanField(event, "allDay") ?? false;

  let timeString = "";
  if (isAllDay) {
    timeString = "Ganzer Tag";
  } else {
    const t = startDate.toLocaleTimeString("de-DE", {
      hour: "numeric",
      minute: "numeric",
    });
    const t2 = endDate.toLocaleTimeString("de-DE", {
      hour: "numeric",
      minute: "numeric",
    });
    timeString = `${t} - ${t2} Uhr`;
  }

  return (
    <BottomSheet
      visible={!!event}
      title={event.title || "Termin-Details"}
      onClose={onClose}
    >
      <View style={{ gap: 12 }}>
        <View>
          <ThemedText style={{ fontWeight: "600", color: secondaryText }}>
            ZEIT
          </ThemedText>
          <ThemedText style={styles.detailText}>
            {d}
            {"\n"}
            {timeString}
          </ThemedText>
        </View>

        {(roomText || isOnline) && (
          <View>
            <ThemedText style={{ fontWeight: "600", color: secondaryText }}>
              ORT
            </ThemedText>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              {roomText ? (
                <ThemedText style={styles.detailText}>{roomText}</ThemedText>
              ) : (
                <ThemedText style={styles.detailText}>Online</ThemedText>
              )}
            </View>
          </View>
        )}

        {extraTextExpanded ? (
          <View>
            <ThemedText style={{ fontWeight: "600", color: secondaryText }}>
              BESCHREIBUNG
            </ThemedText>
            <LinkifiedText
              value={extraTextExpanded}
              style={[styles.detailText, { lineHeight: 24, color: textColor }]}
              linkStyle={{ color: tintColor }}
              fullUrl
            />
          </View>
        ) : null}
      </View>
    </BottomSheet>
  );
}
