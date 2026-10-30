import { TopTabs } from 'expo-router/js-top-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';
import { topTabBarOptions } from '@/constants/Navigation';
import TopTabLabel from '@/components/ui/TopTabLabel';

export default function NewsLayout() {
  const enhancedTabBarOptions = {
    ...topTabBarOptions,
    swipeEnabled: true,
    tabBarLabel: TopTabLabel,
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
