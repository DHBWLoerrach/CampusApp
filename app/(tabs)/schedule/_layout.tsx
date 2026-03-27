import Storage from 'expo-sqlite/kv-store';
import { withLayoutContext } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import {
  createMaterialTopTabNavigator,
  MaterialTopTabBar,
  type MaterialTopTabBarProps,
} from '@react-navigation/material-top-tabs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { topTabBarOptions } from '@/constants/Navigation';
import BottomSheet from '@/components/ui/BottomSheet';
import CourseSetup from '@/components/schedule/CourseSetup';
import CodeCompanionPromoSheetContent from '@/components/schedule/CodeCompanionPromoSheetContent';
import { ThemedText } from '@/components/ui/ThemedText';
import { useCourseContext } from '@/context/CourseContext';
import { LAST_SCHEDULE_SUBTAB_KEY } from '@/constants/StorageKeys';
import {
  dismissCodeCompanionPromo,
  getCodeCompanionPromoDismissed,
  getCodeCompanionPromoSeenCount,
  incrementCodeCompanionPromoSeenCount,
  isCodeCompanionEligibleCourse,
} from '@/lib/codeCompanionPromo';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useThemeColor } from '@/hooks/useThemeColor';
import TopTabLabel from '@/components/ui/TopTabLabel';

const Tab = createMaterialTopTabNavigator();
const TopTabs = withLayoutContext(Tab.Navigator);

// Create a shared query client instance for all schedule views
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data is considered "fresh" for 4 hours. No refetch on mount.
      staleTime: 1000 * 60 * 60 * 4,
      // Data stays in cache for 24 hours after being unused.
      gcTime: 1000 * 60 * 60 * 24,
    },
  },
});

type SubTabName = 'index' | 'week' | 'day';

export default function ScheduleLayout() {
  const { selectedCourse, setSelectedCourse, isLoading } = useCourseContext();
  const [initialSubTab, setInitialSubTab] = useState<SubTabName | null>(null);
  const [promoDismissed, setPromoDismissed] = useState<boolean | null>(null);
  const [promoSeenCount, setPromoSeenCount] = useState<number | null>(null);
  const [promoOpen, setPromoOpen] = useState(false);
  const [promoTemporarilyClosed, setPromoTemporarilyClosed] = useState(false);
  const promoOpenRef = useRef(false);
  const isEligibleCourse = isCodeCompanionEligibleCourse(selectedCourse);
  const reopenBackground = useThemeColor(
    { light: '#EAF3FF', dark: '#203146' },
    'dayNumberContainer',
  );
  const reopenTextColor = useThemeColor(
    { light: '#2A5D9F', dark: '#CFE2FF' },
    'text',
  );

  const showPromo = useCallback(() => {
    if (promoDismissed !== false || !isEligibleCourse || promoOpenRef.current) {
      return;
    }

    promoOpenRef.current = true;
    setPromoOpen(true);
    setPromoTemporarilyClosed(false);
    setPromoSeenCount((prev) => (prev ?? 0) + 1);
    incrementCodeCompanionPromoSeenCount().catch((error) => {
      console.warn('Failed to persist CodeCompanion promo seen count:', error);
    });
  }, [isEligibleCourse, promoDismissed]);

  // Read last opened schedule sub-tab so we can set it as initial route
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const saved = (await Storage.getItem(LAST_SCHEDULE_SUBTAB_KEY)) as
          | string
          | null;
        if (!mounted) return;
        const allowed: readonly SubTabName[] = ['index', 'week', 'day'];
        setInitialSubTab(
          saved && (allowed as readonly string[]).includes(saved)
            ? (saved as SubTabName)
            : 'index',
        );
      } catch {
        if (mounted) setInitialSubTab('index');
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const [dismissed, seenCount] = await Promise.all([
          getCodeCompanionPromoDismissed(),
          getCodeCompanionPromoSeenCount(),
        ]);
        if (mounted) {
          setPromoDismissed(dismissed);
          setPromoSeenCount(seenCount);
        }
      } catch (error) {
        console.warn('Failed to load CodeCompanion promo state:', error);
        if (mounted) {
          setPromoDismissed(false);
          setPromoSeenCount(0);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      showPromo();
    }, [showPromo]),
  );

  useEffect(() => {
    if (promoDismissed !== false || isLoading) {
      return;
    }

    if (isEligibleCourse) {
      showPromo();
      return;
    }

    setPromoOpen(false);
    setPromoTemporarilyClosed(false);
    promoOpenRef.current = false;
  }, [isEligibleCourse, isLoading, promoDismissed, showPromo]);

  const closePromo = () => {
    promoOpenRef.current = false;
    setPromoOpen(false);
    setPromoTemporarilyClosed(true);
  };

  const dismissPromoForever = async () => {
    promoOpenRef.current = false;
    setPromoOpen(false);
    setPromoDismissed(true);
    setPromoTemporarilyClosed(false);

    try {
      await dismissCodeCompanionPromo();
    } catch (error) {
      console.warn('Failed to persist CodeCompanion promo state:', error);
    }
  };

  // Enhanced tab options with course display
  const enhancedTabBarOptions = {
    ...topTabBarOptions,
    tabBarLabel: (props: {
      focused: boolean;
      children: string;
      color?: string;
    }) => <TopTabLabel {...props} />,
  };

  const showPromoReopen =
    !promoOpen &&
    promoTemporarilyClosed &&
    promoDismissed === false &&
    isEligibleCourse;

  const renderTabBar = useCallback(
    (props: MaterialTopTabBarProps) => (
      <View>
        <MaterialTopTabBar {...props} />
        {showPromoReopen ? (
          <TouchableOpacity
            onPress={showPromo}
            accessibilityRole="button"
            accessibilityLabel="DHBW CodeCompanion erneut öffnen"
            accessibilityHint="Öffnet den Hinweis zu DHBW CodeCompanion erneut"
            style={[
              styles.reopenBanner,
              {
                backgroundColor: reopenBackground,
              },
            ]}
          >
            <ThemedText style={[styles.reopenBannerText, { color: reopenTextColor }]}>
              Kennst du schon die DHBW App CodeCompanion?
            </ThemedText>
          </TouchableOpacity>
        ) : null}
      </View>
    ),
    [reopenBackground, reopenTextColor, showPromo, showPromoReopen],
  );

  // Show loading while reading from storage
  if (isLoading || initialSubTab === null) {
    return null; // Or a loading spinner if you prefer
  }

  const canHidePromoForever = (promoSeenCount ?? 0) >= 2;

  return (
    <QueryClientProvider client={queryClient}>
      <>
        {selectedCourse ? (
          // Show tabs when course is selected
          <TopTabs
            screenOptions={enhancedTabBarOptions}
            initialRouteName={initialSubTab}
            tabBar={renderTabBar}
          >
            <TopTabs.Screen
              name="index"
              options={{ title: 'Liste' }}
              listeners={{
                focus: () => {
                  Storage.setItem(LAST_SCHEDULE_SUBTAB_KEY, 'index').catch(
                    () => {},
                  );
                  // Keep local state in sync so remounts (e.g., after course change)
                  // restore the last viewed sub-tab instead of defaulting unexpectedly.
                  setInitialSubTab('index');
                },
              }}
            />
            <TopTabs.Screen
              name="week"
              options={{ title: 'Woche' }}
              listeners={{
                focus: () => {
                  Storage.setItem(LAST_SCHEDULE_SUBTAB_KEY, 'week').catch(
                    () => {},
                  );
                  setInitialSubTab('week');
                },
              }}
            />
            <TopTabs.Screen
              name="day"
              options={{ title: 'Tag' }}
              listeners={{
                focus: () => {
                  Storage.setItem(LAST_SCHEDULE_SUBTAB_KEY, 'day').catch(
                    () => {},
                  );
                  setInitialSubTab('day');
                },
              }}
            />
          </TopTabs>
        ) : (
          // Show course setup when no course is selected
          <CourseSetup onCourseSelected={setSelectedCourse} />
        )}
        <BottomSheet
          visible={promoOpen}
          title="DHBW CodeCompanion"
          onClose={closePromo}
        >
          <CodeCompanionPromoSheetContent
            canHideForever={canHidePromoForever}
            onClose={closePromo}
            onHideForever={() => {
              void dismissPromoForever();
            }}
          />
        </BottomSheet>
      </>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  reopenBanner: {
    marginHorizontal: 12,
    marginTop: 8,
    marginBottom: 4,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  reopenBannerText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
