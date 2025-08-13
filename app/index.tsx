import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import Storage from 'expo-sqlite/kv-store';
import { useRoleContext } from '@/context/RoleContext';
import { LAST_TAB_KEY } from '@/constants/StorageKeys';

export default function Page() {
  const { selectedRole, acceptedTerms, isLoading } = useRoleContext();
  type TabName = 'news' | 'schedule' | 'canteen' | 'services';
  type TabHref =
    | '/(tabs)/news'
    | '/(tabs)/schedule'
    | '/(tabs)/canteen'
    | '/(tabs)/services';

  const [lastTab, setLastTab] = useState<TabName | null>(null);

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
  const hrefMap: Record<TabName, TabHref> = {
    news: '/(tabs)/news',
    schedule: '/(tabs)/schedule',
    canteen: '/(tabs)/canteen',
    services: '/(tabs)/services',
  };
  return <Redirect href={hrefMap[lastTab]} />;
}
