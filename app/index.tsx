import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import Storage from 'expo-sqlite/kv-store';
import { useRoleContext } from '@/context/RoleContext';
import {
  LAST_SCHEDULE_SUBTAB_KEY,
  LAST_TAB_KEY,
} from '@/constants/StorageKeys';

export default function Page() {
  const { selectedRole, acceptedTerms, isLoading } = useRoleContext();
  type TabName = 'news' | 'schedule' | 'canteen' | 'services';
  type ScheduleSubTab = 'index' | 'week' | 'day';
  type TabHref =
    | '/(tabs)/news'
    | '/(tabs)/schedule'
    | '/(tabs)/canteen'
    | '/(tabs)/services';
  type ScheduleHref =
    | '/(tabs)/schedule'
    | '/(tabs)/schedule/week'
    | '/(tabs)/schedule/day';

  const [lastTab, setLastTab] = useState<TabName | null>(null);
  const [lastScheduleSubTab, setLastScheduleSubTab] =
    useState<ScheduleSubTab | null>(null);

  // Read last tab so the initial redirect lands on it
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const saved = await Storage.getItem(LAST_TAB_KEY);
        if (!mounted) return;
        const allowed: readonly TabName[] = [
          'news',
          'schedule',
          'canteen',
          'services',
        ];
        setLastTab(
          saved && (allowed as readonly string[]).includes(saved)
            ? (saved as TabName)
            : 'news'
        );
        // If schedule is the last tab, also read which sub-tab was active
        if (saved === 'schedule') {
          const sub = (await Storage.getItem(
            LAST_SCHEDULE_SUBTAB_KEY
          )) as string | null;
          const allowedSubs: readonly ScheduleSubTab[] = [
            'index',
            'week',
            'day',
          ];
          setLastScheduleSubTab(
            sub && (allowedSubs as readonly string[]).includes(sub)
              ? (sub as ScheduleSubTab)
              : 'index'
          );
        } else {
          setLastScheduleSubTab(null);
        }
      } catch (e) {
        if (mounted) setLastTab('news');
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (isLoading) return null;
  if (!selectedRole || !acceptedTerms) {
    return <Redirect href="/welcome" />;
  }
  // Wait until we know which tab to target to avoid a double navigation
  if (!lastTab) return null;
  if (lastTab === 'schedule' && lastScheduleSubTab === null) {
    // Wait for sub-tab read
    return null;
  }
  const hrefMap: Record<TabName, TabHref> = {
    news: '/(tabs)/news',
    schedule: '/(tabs)/schedule',
    canteen: '/(tabs)/canteen',
    services: '/(tabs)/services',
  };
  if (lastTab !== 'schedule') {
    return <Redirect href={hrefMap[lastTab]} />;
  }
  const scheduleHrefMap: Record<ScheduleSubTab, ScheduleHref> = {
    index: '/(tabs)/schedule',
    week: '/(tabs)/schedule/week',
    day: '/(tabs)/schedule/day',
  };
  const target = lastScheduleSubTab ?? 'index';
  return <Redirect href={scheduleHrefMap[target]} />;
}
