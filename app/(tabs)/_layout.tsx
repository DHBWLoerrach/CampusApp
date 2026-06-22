import { useEffect } from 'react';
import { usePathname } from 'expo-router';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import Storage from 'expo-sqlite/kv-store';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CourseProvider } from '@/context/CourseContext';
import { LAST_TAB_KEY } from '@/constants/StorageKeys';
import { dhbwRed } from '@/constants/Colors';
import {
  isRootTabName,
  ROOT_TABS,
  type RootTabName,
} from '@/constants/Navigation';

// Provide React Query at the tabs level so shared features (e.g., rides sheet)
// can use hooks with caching independent of schedule/canteen sub-layouts.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Conservative defaults; hooks override where needed.
      staleTime: 1000 * 60 * 30, // 30 mins
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
      refetchOnMount: false,
    },
  },
});

function lastTabFromPathname(pathname: string): RootTabName | null {
  const firstSegment = pathname.split('/').filter(Boolean)[0];
  if (firstSegment && isRootTabName(firstSegment)) {
    return firstSegment;
  }
  return null;
}

function LastTabPersistence() {
  const pathname = usePathname();

  useEffect(() => {
    const tab = lastTabFromPathname(pathname);
    if (tab) {
      Storage.setItem(LAST_TAB_KEY, tab).catch(() => {});
    }
  }, [pathname]);

  return null;
}

export default function TabLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <CourseProvider>
        <LastTabPersistence />
        <NativeTabs tintColor={dhbwRed} minimizeBehavior="onScrollDown">
          {ROOT_TABS.map((tab) => (
            <NativeTabs.Trigger key={tab.name} name={tab.name}>
              <NativeTabs.Trigger.Icon sf={tab.sfIcon} md={tab.mdIcon} />
              <NativeTabs.Trigger.Label>{tab.label}</NativeTabs.Trigger.Label>
            </NativeTabs.Trigger>
          ))}
        </NativeTabs>
      </CourseProvider>
    </QueryClientProvider>
  );
}
