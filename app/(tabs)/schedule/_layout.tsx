import { useMemo, useState } from 'react';
import { Stack } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';
import BottomSheet from '@/components/ui/BottomSheet';
import HeaderIconButton from '@/components/ui/HeaderIconButton';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ui/ThemedText';
import RideMatchSheetContent from '@/components/schedule/RideMatchSheetContent';
import { useCourseContext } from '@/context/CourseContext';
import { RIDES_FEATURE_ENABLED } from '@/constants/FeatureFlags';
import { navBarOptions } from '@/constants/Navigation';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function ScheduleStackLayout() {
  const [carpoolOpen, setCarpoolOpen] = useState(false);
  const [courseSwitchOpen, setCourseSwitchOpen] = useState(false);
  const { selectedCourse, setSelectedCourse, previousCourses } =
    useCourseContext();
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');
  const tintColor = useThemeColor({}, 'tint');

  const scheduleTitle = selectedCourse
    ? selectedCourse.toUpperCase()
    : 'Vorlesungsplan';

  const otherCourses = useMemo(
    () =>
      (previousCourses || []).filter(
        (c) => !!c && c.toUpperCase() !== (selectedCourse || '').toUpperCase()
      ),
    [previousCourses, selectedCourse]
  );

  const handleChangeCourse = () => {
    if (selectedCourse) {
      setSelectedCourse(null);
    }
  };

  return (
    <>
      <Stack screenOptions={navBarOptions}>
        <Stack.Screen
          name="(sections)"
          options={{
            title: scheduleTitle,
            headerTitle: selectedCourse
              ? () => (
                  <TouchableOpacity
                    onPress={() =>
                      otherCourses.length
                        ? setCourseSwitchOpen(true)
                        : handleChangeCourse()
                    }
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel={
                      otherCourses.length
                        ? 'Kurs schnell wechseln'
                        : 'Kurs wechseln'
                    }
                    accessibilityHint="Öffnet den Kurswechsel"
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}
                    >
                      <Text
                        numberOfLines={1}
                        style={{
                          color: tintColor,
                          fontSize: 15,
                          fontWeight: '700',
                          lineHeight: 22,
                          marginRight: 6,
                        }}
                      >
                        {scheduleTitle}
                      </Text>
                      <IconSymbol
                        name="chevron.down"
                        size={14}
                        color={tintColor}
                      />
                    </View>
                  </TouchableOpacity>
                )
              : undefined,
            headerRight:
              selectedCourse && RIDES_FEATURE_ENABLED
                ? () => (
                    <HeaderIconButton
                      onPress={() => setCarpoolOpen(true)}
                      name="car"
                      color={tintColor}
                      accessibilityLabel="Carpool öffnen"
                      accessibilityHint="Öffnet Carpool-Informationen"
                    />
                  )
                : undefined,
          }}
        />
      </Stack>
      {RIDES_FEATURE_ENABLED && (
        <BottomSheet
          visible={carpoolOpen}
          title="Mitfahr-Matches (nächste 5 Tage)"
          onClose={() => setCarpoolOpen(false)}
        >
          <RideMatchSheetContent myCourse={selectedCourse ?? ''} />
        </BottomSheet>
      )}
      <BottomSheet
        visible={courseSwitchOpen}
        title="Kurs wechseln"
        onClose={() => setCourseSwitchOpen(false)}
      >
        <View style={{ gap: 8 }}>
          {otherCourses.length === 0 ? (
            <ThemedText style={{ opacity: 0.7 }}>
              Kein weiterer gespeicherter Kurs.
            </ThemedText>
          ) : (
            otherCourses.map((course) => (
              <TouchableOpacity
                key={course}
                onPress={() => {
                  setCourseSwitchOpen(false);
                  setSelectedCourse(course);
                }}
                accessibilityRole="button"
                accessibilityLabel={`Wechsel zu ${course}`}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <ThemedText style={{ fontWeight: '700' }}>{course}</ThemedText>
                <IconSymbol name="chevron.right" size={16} color={textColor} />
              </TouchableOpacity>
            ))
          )}
          <TouchableOpacity
            onPress={() => {
              setCourseSwitchOpen(false);
              handleChangeCourse();
            }}
            accessibilityRole="button"
            accessibilityLabel="Anderen Kurs auswählen"
            style={{
              paddingHorizontal: 12,
              paddingVertical: 10,
              borderRadius: 10,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <IconSymbol name="rectangle.stack" size={16} color={textColor} />
            <ThemedText>Anderen Kurs auswählen …</ThemedText>
          </TouchableOpacity>
        </View>
      </BottomSheet>
    </>
  );
}
