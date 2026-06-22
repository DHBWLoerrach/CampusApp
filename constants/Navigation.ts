import { Colors, dhbwRed } from '@/constants/Colors';

export const navBarOptions = {
  headerTintColor: dhbwRed,
  headerStyle: {
    backgroundColor: 'transparent',
  },
  headerTitleStyle: {
    fontSize: 20,
    fontWeight: '700' as const,
  },
  headerShadowVisible: false,
  tabBarActiveTintColor: dhbwRed,
};

export const topTabBarOptions = {
  swipeEnabled: false,
  tabBarActiveTintColor: dhbwRed,
  tabBarInactiveTintColor: Colors.light.icon,
  tabBarIndicatorStyle: { backgroundColor: dhbwRed, height: 3 },
  tabBarLabelStyle: { fontSize: 14, fontWeight: '600' },
  tabBarStyle: { backgroundColor: 'transparent' },
  tabBarPressColor: 'rgba(226, 0, 26, 0.12)',
  tabBarPressOpacity: 0.85,
};

export const ROOT_TABS = [
  {
    name: 'news',
    href: '/news',
    label: 'DHBW',
    sfIcon: { default: 'house', selected: 'house.fill' },
    mdIcon: 'home',
  },
  {
    name: 'schedule',
    href: '/schedule',
    label: 'Vorlesungsplan',
    sfIcon: { default: 'calendar', selected: 'calendar' },
    mdIcon: 'calendar_month',
  },
  {
    name: 'canteen',
    href: '/canteen',
    label: 'Mensa',
    sfIcon: 'fork.knife',
    mdIcon: 'restaurant',
  },
  {
    name: 'services',
    href: '/services',
    label: 'Services',
    sfIcon: { default: 'info.circle', selected: 'info.circle.fill' },
    mdIcon: 'info',
  },
] as const;

export type RootTabName = (typeof ROOT_TABS)[number]['name'];

export const SCHEDULE_SUBTABS = [
  { name: 'index', href: '/schedule' },
  { name: 'week', href: '/schedule/week' },
  { name: 'day', href: '/schedule/day' },
] as const;

export type ScheduleSubTabName = (typeof SCHEDULE_SUBTABS)[number]['name'];

export function isRootTabName(value: string): value is RootTabName {
  return ROOT_TABS.some((tab) => tab.name === value);
}

export function isScheduleSubTabName(
  value: string
): value is ScheduleSubTabName {
  return SCHEDULE_SUBTABS.some((tab) => tab.name === value);
}

export function getRootTabHref(tabName: RootTabName) {
  return ROOT_TABS.find((tab) => tab.name === tabName)?.href ?? '/news';
}

export function getScheduleSubTabHref(subTabName: ScheduleSubTabName) {
  return (
    SCHEDULE_SUBTABS.find((subTab) => subTab.name === subTabName)?.href ??
    '/schedule'
  );
}
