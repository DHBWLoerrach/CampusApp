import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { withLayoutContext } from 'expo-router';
import { topTabBarOptions } from '@/constants/Navigation';

const Tab = createMaterialTopTabNavigator();
const TopTabs = withLayoutContext(Tab.Navigator);

export default function ScheduleLayout() {
  return (
    <TopTabs screenOptions={topTabBarOptions}>
      <TopTabs.Screen name="index" options={{ title: 'Liste' }} />
      <TopTabs.Screen name="week" options={{ title: 'Woche' }} />
      <TopTabs.Screen name="days" options={{ title: '3 / 1 Tag' }} />
    </TopTabs>
  );
}
