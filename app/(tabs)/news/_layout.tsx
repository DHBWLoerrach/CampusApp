import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { withLayoutContext } from 'expo-router';
import { topTabBarOptions } from '@/constants/Navigation';
import TopTabLabel from '@/components/ui/TopTabLabel';

const Tab = createMaterialTopTabNavigator();
const TopTabs = withLayoutContext(Tab.Navigator);

export default function NewsLayout() {
  const enhancedTabBarOptions = {
    ...topTabBarOptions,
    swipeEnabled: true,
    tabBarLabel: (props: {
      focused: boolean;
      children: string;
      color?: string;
    }) => <TopTabLabel {...props} />,
  };

  return (
    <TopTabs screenOptions={enhancedTabBarOptions}>
      <TopTabs.Screen name="index" options={{ title: 'Aktuelles' }} />
      <TopTabs.Screen name="events" options={{ title: 'Termine' }} />
    </TopTabs>
  );
}
