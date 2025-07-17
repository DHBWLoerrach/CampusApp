import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { withLayoutContext } from 'expo-router';
import { topTabBarOptions } from '@/constants/Navigation';

const Tab = createMaterialTopTabNavigator();
const TopTabs = withLayoutContext(Tab.Navigator);

export default function NewsLayout() {
  return (
    <TopTabs screenOptions={topTabBarOptions}>
      <TopTabs.Screen name="index" options={{ title: 'Aktuelles' }} />
      <TopTabs.Screen name="events" options={{ title: 'Termine' }} />
    </TopTabs>
  );
}
