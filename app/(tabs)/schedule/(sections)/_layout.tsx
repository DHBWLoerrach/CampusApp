import Storage from 'expo-sqlite/kv-store';
import { useIsFocused, useRouter } from 'expo-router';
import {
  MaterialTopTabBar,
  TopTabs,
  type MaterialTopTabBarProps,
} from 'expo-router/js-top-tabs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  getScheduleSubTabHref,
  topTabBarOptions,
  isScheduleSubTabName,
  type ScheduleSubTabName,
} from '@/constants/Navigation';
import BottomSheet from '@/components/ui/BottomSheet';
import CourseSetup from '@/components/schedule/CourseSetup';
import CodeCompanionPromoBanner from '@/components/schedule/CodeCompanionPromoBanner';
import CodeCompanionPromoSheetContent, {
  CodeCompanionPromoSheetTitle,
} from '@/components/schedule/CodeCompanionPromoSheetContent';
import { useCourseContext } from '@/context/CourseContext';
import { LAST_SCHEDULE_SUBTAB_KEY } from '@/constants/StorageKeys';
import {
  dismissCodeCompanionPromo,
  getCodeCompanionPromoDismissed,
  isCodeCompanionEligibleCourse,
} from '@/lib/codeCompanionPromo';
import { useCallback, useEffect, useRef, useState } from 'react';
import TopTabLabel from '@/components/ui/TopTabLabel';

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

export default function ScheduleLayout() {
  const { selectedCourse, setSelectedCourse, isLoading } = useCourseContext();
  const isFocused = useIsFocused();
  const router = useRouter();
  const [initialSubTab, setInitialSubTab] = useState<ScheduleSubTabName | null>(
    null
  );
  const [restoringSubTab, setRestoringSubTab] =
    useState<ScheduleSubTabName | null>(null);
  const [promoDismissed, setPromoDismissed] = useState<boolean | null>(null);
  const [promoOpen, setPromoOpen] = useState(false);
  const promoOpenRef = useRef(false);
  const isEligibleCourse = isCodeCompanionEligibleCourse(selectedCourse);

  const showPromo = useCallback(() => {
    if (promoDismissed !== false || !isEligibleCourse || promoOpenRef.current) {
      return;
    }

    promoOpenRef.current = true;
    setPromoOpen(true);
  }, [isEligibleCourse, promoDismissed]);

  // Read last opened schedule sub-tab so we can set it as initial route
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const saved = (await Storage.getItem(LAST_SCHEDULE_SUBTAB_KEY)) as
          string | null;
        if (!mounted) return;
        setInitialSubTab(
          saved && isScheduleSubTabName(saved) ? saved : 'index'
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
        const dismissed = await getCodeCompanionPromoDismissed();
        if (mounted) {
          setPromoDismissed(dismissed);
        }
      } catch (error) {
        console.warn('Failed to load Code Companion promo state:', error);
        if (mounted) {
          setPromoDismissed(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isFocused) {
      promoOpenRef.current = false;
      return;
    }

    if (isLoading || promoDismissed === null) {
      return;
    }

    if (promoDismissed === true || !isEligibleCourse) {
      if (promoOpen) {
        // Close the sheet when the selected course can no longer show this promo.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPromoOpen(false);
      }
      promoOpenRef.current = false;
    }
  }, [isEligibleCourse, isFocused, isLoading, promoDismissed, promoOpen]);

  const closePromo = () => {
    promoOpenRef.current = false;
    setPromoOpen(false);
  };

  const dismissPromoForever = async () => {
    promoOpenRef.current = false;
    setPromoOpen(false);
    setPromoDismissed(true);

    try {
      await dismissCodeCompanionPromo();
    } catch (error) {
      setPromoDismissed(false);
      console.warn('Failed to persist Code Companion promo state:', error);
    }
  };

  // Persist the focused sub-tab and keep local state in sync so a remount
  // (e.g. after course change, which toggles CourseSetup/TopTabs) restores the
  // last viewed sub-tab. Guarded so re-focusing the active tab does not trigger
  // a redundant render.
  const persistSubTab = useCallback((name: ScheduleSubTabName) => {
    Storage.setItem(LAST_SCHEDULE_SUBTAB_KEY, name).catch(() => {});
    setInitialSubTab((prev) => (prev === name ? prev : name));
    setRestoringSubTab((prev) => (prev === name ? null : prev));
  }, []);

  // Enhanced tab options with course display
  const enhancedTabBarOptions = {
    ...topTabBarOptions,
    tabBarLabel: TopTabLabel,
    // The pager misses the scroll event of an animated jump right after mount,
    // which would leave the tab indicator on the first tab.
    animationEnabled: restoringSubTab === null,
  };

  const showPromoReopen =
    !promoOpen && promoDismissed === false && isEligibleCourse;

  const renderTabBar = useCallback(
    (props: MaterialTopTabBarProps) => (
      <View>
        <MaterialTopTabBar {...props} />
        {showPromoReopen ? (
          <CodeCompanionPromoBanner onPress={showPromo} />
        ) : null}
      </View>
    ),
    [showPromo, showPromoReopen]
  );

  // Show loading while reading from storage
  if (isLoading || initialSubTab === null) {
    return null; // Or a loading spinner if you prefer
  }

  // Restore the last viewed sub-tab. Two entry paths rely on the route: a cold
  // start arrives via the /schedule/<sub> redirect (app/index.tsx), while the
  // tabs remounted after course selection would start on their first screen.
  // The router applies navigation after the course update has mounted the tabs.
  const handleCourseSelected = (course: string) => {
    setRestoringSubTab(initialSubTab);
    setSelectedCourse(course);
    router.navigate(getScheduleSubTabHref(initialSubTab));
  };

  return (
    <QueryClientProvider client={queryClient}>
      <>
        {/* Keeps the JS tab bar and content clear of side insets, which the
            native stack header above already respects. */}
        <SafeAreaView edges={['left', 'right']} style={{ flex: 1 }}>
          {selectedCourse ? (
            // Show tabs when course is selected
            <TopTabs
              screenOptions={enhancedTabBarOptions}
              tabBar={renderTabBar}
            >
              <TopTabs.Screen
                name="index"
                options={{ title: 'Liste' }}
                listeners={{ focus: () => persistSubTab('index') }}
              />
              <TopTabs.Screen
                name="week"
                options={{ title: 'Woche' }}
                listeners={{ focus: () => persistSubTab('week') }}
              />
              <TopTabs.Screen
                name="day"
                options={{ title: 'Tag' }}
                listeners={{ focus: () => persistSubTab('day') }}
              />
            </TopTabs>
          ) : (
            // Show course setup when no course is selected
            <CourseSetup onCourseSelected={handleCourseSelected} />
          )}
        </SafeAreaView>
        <BottomSheet
          visible={promoOpen}
          title="DHBW Code Companion"
          titleContent={<CodeCompanionPromoSheetTitle />}
          onClose={closePromo}
        >
          <CodeCompanionPromoSheetContent
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
