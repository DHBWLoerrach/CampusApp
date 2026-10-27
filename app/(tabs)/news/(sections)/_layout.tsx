import { createMaterialTopTabNavigator } from 'expo-router/js-top-tabs';
import { withLayoutContext } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
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
    // Keeps the JS tab bar and content clear of side insets, which the native
    // stack header above already respects.
    <SafeAreaView edges={['left', 'right']} style={{ flex: 1 }}>
      <TopTabs screenOptions={enhancedTabBarOptions}>
        <TopTabs.Screen name="index" options={{ title: 'Aktuelles' }} />
        <TopTabs.Screen name="events" options={{ title: 'Termine' }} />
      </TopTabs>
    </SafeAreaView>
  );
}
