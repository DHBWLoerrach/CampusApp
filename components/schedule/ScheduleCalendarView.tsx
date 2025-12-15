import { useCallback, useMemo, useRef } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import {
  CalendarBody,
  CalendarContainer,
  CalendarHeader,
  CalendarKitHandle,
  LocaleConfigsProps,
  OnEventResponse,
  PackedEvent,
} from '@howljs/calendar-kit';
import { useTimetable } from '@/hooks/useTimetable';
import { useCourseContext } from '@/context/CourseContext';
import Header from '@/components/schedule/CalendarHeader';
import ErrorWithReloadButton from '@/components/ui/ErrorWithReloadButton';
import { useThemeColor } from '@/hooks/useThemeColor';
import LinkifiedText from '@/components/ui/LinkifiedText';
import { toLocalISOString, getLocationMeta } from '@/lib/utils';
import { IconSymbol } from '@/components/ui/IconSymbol';

interface CalendarEvent {
  id: string;
  title: string;
  start: { dateTime: string };
  end: { dateTime: string };
  location?: string;
  // Calendar Kit supports per-event styling; use this to color All‑Day chips
  color?: string;
  titleColor?: string;
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
  0
);
if (_initialAtMidnight.getDay() === 0) {
  _initialAtMidnight.setDate(_initialAtMidnight.getDate() + 1);
}
const INITIAL_DATE = toLocalISOString(_initialAtMidnight);

const initialLocales: Record<string, Partial<LocaleConfigsProps>> = {
  de: {
    weekDayShort: 'So_Mo_Di_Mi_Do_Fr_Sa'.split('_'),
    meridiem: { ante: 'vorm.', post: 'nachm.' },
    more: 'mehr',
  },
};

export default function ScheduleCalendarView({
  numberOfDays,
  hideWeekDays = [],
}: ScheduleCalendarViewProps) {
  const { selectedCourse } = useCourseContext();
  const { data, isLoading, isError, error, refetch, isFetching } =
    useTimetable(selectedCourse || undefined);
  const calendarRef = useRef<CalendarKitHandle>(null);
  const currentDate = useSharedValue(INITIAL_DATE);

  const borderColor = useThemeColor({}, 'border');
  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const dayNumberContainer = useThemeColor({}, 'dayNumberContainer');
  const dayTextColor = useThemeColor({}, 'dayTextColor');
  const textColor = useThemeColor({}, 'text');
  const eventBackground = useThemeColor({}, 'eventBackground');
  const eventTextColor = useThemeColor({}, 'eventTextColor');
  const secondaryText = useThemeColor({}, 'icon');

  // Transform timetable data to CalendarView format
  const events = useMemo((): CalendarEvent[] => {
    if (!data) return [];

    // Get all events (past and future) for full navigation
    const allEvents: CalendarEvent[] = [];

    Object.keys(data).forEach((dateKey) => {
      data[dateKey].forEach((event) => {
        // Detect all‑day events by midnight alignment and full‑day multiples
        const msInDay = 24 * 60 * 60 * 1000;
        const isAllDay =
          event.start.getHours() === 0 &&
          event.start.getMinutes() === 0 &&
          (event.end.getTime() - event.start.getTime()) % msInDay ===
            0;

        allEvents.push({
          id: event.uid,
          title: event.title,
          start: { dateTime: toLocalISOString(event.start) },
          end: { dateTime: toLocalISOString(event.end) },
          location: event.location,
          // Ensure All‑Day events (chips) adopt our brand tint color
          color: tintColor,
          // Keep white titles only for All‑Day chips
          titleColor: isAllDay ? '#fff' : undefined,
        });
      });
    });

    return allEvents;
  }, [data, tintColor]);

  const _onChange = useCallback((date: string) => {
    currentDate.value = date;
  }, []);

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
    if (!event.start?.dateTime || !event.end?.dateTime) return;

    const { dateTime: startTime } = event.start;
    const { dateTime: endTime } = event.end;
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    const rawLocation =
      typeof event.location === 'string' ? event.location : '';
    const { url: onlineLink, hint, isOnline } =
      getLocationMeta(rawLocation);

    const d = startDate.toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
    const msInDay = 24 * 60 * 60 * 1000;
    const isAllDay =
      startDate.getHours() === 0 &&
      startDate.getMinutes() === 0 &&
      (endDate.getTime() - startDate.getTime()) % msInDay === 0;

    const headerLines = isAllDay
      ? [`${d}`, 'Ganzer Tag']
      : (() => {
          const t = startDate.toLocaleTimeString('de-DE', {
            hour: 'numeric',
            minute: 'numeric',
          });
          const t2 = endDate.toLocaleTimeString('de-DE', {
            hour: 'numeric',
            minute: 'numeric',
          });
          return [`${d}`, `${t} - ${t2} Uhr`];
        })();

    const detailLines: string[] = [];
    if (isOnline) {
      detailLines.push('Online');
      if (onlineLink) detailLines.push(`Link: ${onlineLink}`);
      if (hint) detailLines.push(`Hinweis: ${hint}`);
    } else if (rawLocation.trim().length > 0) {
      detailLines.push(rawLocation.trim());
    }

    const body = [...headerLines, ...detailLines].join('\n');
    Alert.alert(event.title || '', body);
  };

  const renderEvent = useCallback(
    (event: PackedEvent) => {
      const rawLocation =
        typeof event.location === 'string' ? event.location : '';
      const {
        url: onlineLink,
        room: roomText,
        hint,
        isOnline: online,
      } = getLocationMeta(rawLocation);
      const showHintIndicator = online && !!hint;

      return (
        <View style={{ height: '100%', padding: 4 }}>
          <Text
            numberOfLines={8}
            style={[
              {
                fontSize: 12,
                fontWeight: '600',
                color: eventTextColor,
              },
              event.titleColor
                ? { color: event.titleColor as string }
                : null,
            ]}
          >
            {event.title || ''}
          </Text>

          {/* Compact meta row with icon for Online/Raum */}
          {online ? (
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
                {onlineLink ? 'Online: ' : 'Online'}
                {!!onlineLink && (
                  <LinkifiedText
                    value={onlineLink}
                    numberOfLines={1}
                    style={{
                      fontSize: 12,
                      color: eventTextColor,
                      opacity: 0.85,
                    }}
                  />
                )}
              </Text>
              {showHintIndicator && (
                <IconSymbol
                  name="info.circle"
                  size={12}
                  color={secondaryText}
                  style={styles.metaIconSmallTrailing}
                />
              )}
            </View>
          ) : roomText ? (
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
                }}
              >
                {roomText}
              </Text>
            </View>
          ) : null}
        </View>
      );
    },
    [eventTextColor, secondaryText]
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
          nowIndicatorColor: 'magenta',
          headerBackgroundColor: backgroundColor,
          hourTextStyle: { color: tintColor, fontWeight: '600' },
          todayName: { color: tintColor, fontWeight: '600' },
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  metaRowSmall: {
    flexDirection: 'row',
    alignItems: 'center',
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
});
