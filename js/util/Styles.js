import { PixelRatio } from 'react-native';
import Colors from './Colors';

var FONT_TAB_BAR_LABEL = 13;

// tabBarLabel font for smaller displays (e.g. iPhoneSE)
// this makes sure that dates like 22.10. fit in tab
if (PixelRatio.get() <= 2) {
  FONT_TAB_BAR_LABEL = 10;
}

// Remark: use StyleSheet API whenever possible (not for react-navigation)

export default {
  topTabBar: {
    tabBarActiveTintColor: 'white',
    tabBarInactiveTintColor: 'white',
    tabBarIndicatorStyle: { backgroundColor: 'white', height: 3 },
    tabBarLabelStyle: { fontSize: FONT_TAB_BAR_LABEL },
    tabBarStyle: { backgroundColor: Colors.dhbwRed },
    tabBarPressColor: 'darkred', // Color for material ripple (Android >= 5.0 only)
    tabBarPressOpacity: 0.75, // Opacity for pressed tab (iOS and Android < 5.0 only)
  },
  cardShadow: {
    shadowColor: 'black', // iOS and Android API-Level >= 28
    shadowOffset: {
      // effects iOS only!
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25, // effects iOS only!
    shadowRadius: 2.5, // effects iOS only!
    elevation: 4, // needed only for Android
  },
};
