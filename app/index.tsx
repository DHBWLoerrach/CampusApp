import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import Storage from 'expo-sqlite/kv-store';
import { useRoleContext } from '@/context/RoleContext';
import {
  LAST_SCHEDULE_SUBTAB_KEY,
  LAST_TAB_KEY,
} from '@/constants/StorageKeys';
import {
  getRootTabHref,
  getScheduleSubTabHref,
  isRootTabName,
  isScheduleSubTabName,
  type RootTabName,
  type ScheduleSubTabName,
} from '@/constants/Navigation';

export default function Page() {
  const { selectedRole, acceptedTerms, isLoading } = useRoleContext();
  const [lastTab, setLastTab] = useState<RootTabName | null>(null);
  const [lastScheduleSubTab, setLastScheduleSubTab] =
    useState<ScheduleSubTabName | null>(null);

  // Read last tab so the initial redirect lands on it
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const saved = await Storage.getItem(LAST_TAB_KEY);
        if (!mounted) return;
        setLastTab(saved && isRootTabName(saved) ? saved : 'news');
        // If schedule is the last tab, also read which sub-tab was active
        if (saved === 'schedule') {
          const sub = (await Storage.getItem(LAST_SCHEDULE_SUBTAB_KEY)) as
            | string
            | null;
          setLastScheduleSubTab(
            sub && isScheduleSubTabName(sub) ? sub : 'index'
          );
        } else {
          setLastScheduleSubTab(null);
        }
      } catch {
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
  if (lastTab !== 'schedule') {
    return <Redirect href={getRootTabHref(lastTab)} />;
  }
  const target = lastScheduleSubTab ?? 'index';
  return <Redirect href={getScheduleSubTabHref(target)} />;
}
