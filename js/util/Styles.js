import Colors from './Colors';

// Remark: use StyleSheet API whenever possible (not for react-navigation)

export default {
  topTabBar: {
    tabBarActiveTintColor: 'white',
    tabBarInactiveTintColor: 'white',
    tabBarIndicatorStyle: { backgroundColor: 'white', height: 3 },
    tabBarStyle: { backgroundColor: Colors.dhbwRed },
    tabBarPressColor: 'darkred', // Color for material ripple (Android >= 5.0 only)
    tabBarPressOpacity: 0.75, // Opacity for pressed tab (iOS and Android < 5.0 only)
  },
};
