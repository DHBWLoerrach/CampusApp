import { dhbwRed } from '@/constants/Colors';

export const navBarOptions = {
  headerTintColor: 'white',
  headerStyle: {
    backgroundColor: dhbwRed,
    shadowColor: 'transparent', // prevent line below header in iOS
  },
  tabBarActiveTintColor: dhbwRed,
};

export const topTabBarOptions = {
  swipeEnabled: false,
  tabBarActiveTintColor: 'white',
  tabBarInactiveTintColor: 'white',
  tabBarIndicatorStyle: { backgroundColor: 'white', height: 3 },
  tabBarLabelStyle: { fontSize: 14 },
  tabBarStyle: { backgroundColor: dhbwRed },
  tabBarPressColor: 'darkred',
  tabBarPressOpacity: 0.75,
};
