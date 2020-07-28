import Colors from './Colors';

// Remark: use StyleSheet API whenever possible (not for react-navigation)

export default {
  topTabBar: {
    indicatorStyle: { backgroundColor: 'white', height: 3 },
    activeTintColor: 'white',
    inactiveTintColor: 'white',
    pressColor: 'darkred', // Color for material ripple (Android >= 5.0 only)
    pressOpacity: 0.75, // Opacity for pressed tab (iOS and Android < 5.0 only)
    style: { backgroundColor: Colors.dhbwRed },
  },
};
