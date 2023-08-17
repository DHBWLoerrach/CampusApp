import {
  Dimensions,
  PixelRatio,
  Platform,
  StyleSheet,
} from 'react-native';
import Colors from './Colors';
import Constants from '../util/Constants';

let FONT_TAB_BAR_LABEL = 13;

// tabBarLabel font for smaller displays (e.g. iPhoneSE)
// this makes sure that dates like 22.10. fit in tab
if (PixelRatio.get() <= 2) {
  FONT_TAB_BAR_LABEL = 8;
}

const Styles = StyleSheet.create({
  //New Styles
  textSizes: {
    small: {
      fontSize: 15,
    },
    medium: {
      fontSize: 25,
    },
    dialog: {
      fontSize: 18,
    },
  },
  button: {
    container: {
      backgroundColor: Colors.dhbwRed,
      alignItems: 'center',
      width: '100%',
    },
    text: {
      color: 'white',
    },
    disabled: {
      backgroundColor: 'grey',
    },
    sizes: {
      small: {
        padding: 10,
        borderRadius: 5,
      },
      medium: {
        padding: 10,
        borderRadius: 5,
      },
      dialog: {
        padding: 10,
        borderRadius: 3,
        marginLeft: 7,
      },
    },
  },

  //Migrated Stypes
  General: {
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
      shadowOpacity: 0.2, // effects iOS only!
      shadowRadius: 4, // effects iOS only!
      elevation: 4, // needed only for Android
    },
  },
  WelcomeScreen: {
    container: {
      flex: 1,
    },
    contentContainer: {
      paddingHorizontal: 10,
      paddingVertical: 10,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    headerImage: {
      width: Dimensions.get('window').width,
      height: 180,
    },
    heading: {
      fontSize: 24,
      lineHeight: 27,
      fontWeight: 'bold',
    },
    logo: {
      marginLeft: 20,
      width: 60,
      height: 60,
    },
    welcome: {
      flex: 1,
      flexDirection: 'row',
    },
    selection: {
      marginTop: 15,
    },
    selectionText: {
      marginRight: 20,
      marginBottom: 15,
    },
    disclaimer: {
      marginTop: 10,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 20,
      marginTop: 10,
    },
    agreeDisclaimer: {
      flexDirection: 'row',
    },
    disclaimerLabel: {
      alignSelf: 'center',
      marginRight: 5,
    },
    submit: {
      fontSize: 24,
    },
    toggleContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 10,
    },
  },
  CampusApp: {
    container: {
      flex: 1,
    },
    center: {
      flex: 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
  },
  SearchBar: {
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      height: 36,
      margin: 10,
      padding: 3,
      borderRadius: 12,
    },
    searchInput: {
      flex: 1,
      padding: 0,
    },
  },
  ResponsiveImage: {
    image: {
      resizeMode: 'contain',
    },
  },
  ReloadView: {
    center: {
      flex: 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    infoText: {
      justifyContent: 'center',
      fontSize: 20,
      marginBottom: 15,
      paddingHorizontal: 20,
    },
  },
  HeaderIcon: {
    touchable: {
      paddingHorizontal: 8,
    },
    icon: {
      marginRight: Platform.OS === 'android' ? 10 : 0,
    },
  },
  Form: {
    input: {
      borderWidth: 1,
      height: 35,
      margin: 3,
    },
    errText: {
      color: 'red',
      padding: 4,
    },
    container: {
      marginBottom: 4,
      flex: 1,
    },
    row: {
      flexDirection: 'row',
      flex: 1,
    },
  },
  DayHeader: {
    header: {
      backgroundColor: Colors.lightGray,
      height: 32,
      justifyContent: 'center',
      paddingHorizontal: Constants.listViewRowPaddingHorizontal,
    },
  },
  CommonCell: {
    entry: {
      borderRadius: 10,
      padding: 10,
      marginBottom: 10,
      marginHorizontal: 10,
    },
    container: {
      flex: 1,
      justifyContent: 'space-around',
      flexDirection: 'row',
    },
    image: {
      marginTop: 'auto',
      marginBottom: 'auto',
      flex: 1,
      marginRight: 10,
      resizeMode: 'contain',
    },
    textContainer: {
      flex: 2,
    },
    headline: {
      fontSize: 18,
      color: Colors.dhbwRed,
      fontWeight: 'bold',
    },
    details: {
      fontWeight: 'bold',
    },
  },
  Texts: {
    container: {
      padding: 15,
    },
    block: {
      marginBottom: 20,
    },
    quote: {
      fontStyle: 'italic',
      marginHorizontal: 15,
    },
    headline: {
      fontSize: 20,
    },
    link: {
      color: Colors.link,
    },
  },
  SubmenuItem: {
    icon: {
      marginBottom: 10,
    },
    container: {
      borderRadius: 5,
      alignItems: 'center',
      justifyContent: 'center',
      width: '45%',
      paddingVertical: 10,
    },
    label: {
      fontSize: 15,
      fontWeight: 'bold',
      textAlign: 'center',
    },
  },
  Submenu: {
    menuContainer: {
      marginVertical: 10,
      alignItems: 'center',
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-evenly',
      rowGap: 10,
    },
  },
  Settings: {
    container: {
      flex: 1,
      backgroundColor: 'white',
      padding: 15,
    },
    configBlock: {
      marginBottom: 20,
    },
  },
  ServiceScreen: {
    screenContainer: {
      flex: 1,
    },
  },
  RoleSelection: {
    radioGroup: {
      marginTop: 10,
    },
    radioButton: {
      flexDirection: 'row',
      marginBottom: 5,
    },
    outerCircle: {
      height: 20,
      width: 20,
      borderRadius: 10,
      borderWidth: 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    innerCircle: {
      height: 10,
      width: 10,
      borderRadius: 5,
    },
    label: {
      marginLeft: 5,
    },
    bold: {
      fontWeight: 'bold',
    },
  },
  LinksList: {
    container: {
      flex: 1,
    },
    separator: {
      height: StyleSheet.hairlineWidth,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 15,
      height: 50,
    },
    title: {
      flex: 1,
      fontSize: 17,
    },
  },
  InfoText: {
    container: {
      flex: 1,
      backgroundColor: 'white',
    },
  },
  Feedback: {
    container: {
      flex: 1,
      backgroundColor: 'white',
      padding: 15,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 15,
      height: 50,
    },
    title: {
      flex: 1,
      fontSize: 17,
    },
  },
  About: {
    container: {
      flex: 1,
      padding: 20,
    },
    link: {
      fontSize: 15,
    },
    marginBig: {
      marginTop: 24,
    },
    margin: {
      marginTop: 12,
    },
  },
  ScheduleScreen: {
    container: {
      flex: 1,
    },
    center: {
      flex: 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
  },
  LectureRow: {
    row: {
      paddingVertical: Constants.listViewRowPaddingVertical,
      paddingHorizontal: Constants.listViewRowPaddingHorizontal,
    },
    title: {
      fontSize: Constants.bigFont,
    },
    info: {
      fontSize: Constants.smallFont,
    },
  },
  EditCourse: {
    container: {
      flex: 1,
      backgroundColor: 'white',
      padding: 15,
    },
    inputContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginVertical: 10,
      borderWidth: 1,
      borderColor: '#CCC',
      borderRadius: 10,
    },
    input: {
      flex: 1,
      color: 'black',
      fontSize: Constants.bigFont,
      height: 40,
      paddingLeft: 10,
    },
    inputButton: {
      color: Colors.dhbwRed,
      fontSize: Constants.bigFont,
      paddingRight: 5,
    },
  },
  NewsList: {
    container: {
      flex: 1,
      paddingVertical: 10,
    },
    center: {
      flex: 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    header: {
      elevation: 0,
    },
  },
  CanteenScreen: {
    container: {
      flex: 1,
      backgroundColor: 'white',
    },
    center: {
      flex: 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
  },
  CanteenDayListView: {
    row: {
      flexDirection: 'row',
      padding: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    name: {
      flex: 1,
      fontSize: 17,
    },
    price: {
      fontSize: 17,
      paddingBottom: 4,
      textAlign: 'right',
      width: 50,
    },
    right: {
      alignItems: 'flex-end',
    },
    vegetarian: {
      backgroundColor: 'transparent',
      height: 28,
      width: 28,
    },
    buttonContainer: {
      flexDirection: 'column',
      alignSelf: 'center',
      marginBottom: 15,
    },
    menuContainer: {
      flex: 1,
      justifyContent: 'space-between',
    },
    cardElementHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    cardVegetarianBox: {
      alignSelf: 'flex-start',
      borderRadius: 10,
      paddingVertical: 2,
      paddingHorizontal: 6,
      marginTop: 5,
    },
    listOfCards: {
      paddingVertical: 10,
    },
  },
  LectureItem: {
    container: {
      flex: 1,
      backgroundColor: Colors.lightGray,
      marginBottom: 10,
      marginTop: 20,
      padding: 10,
      borderRadius: 10,
    },
    name: {
      fontSize: 20,
    },
  },
  EnrollmentItem: {
    container: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      backgroundColor: Colors.lightGray,
      marginBottom: 10,
      marginTop: 20,
      padding: 10,
      borderRadius: 10,
    },
    name: {
      fontSize: 20,
    },
    iconBar: {
      justifyContent: 'space-between',
    },
  },
  InfoImage: {
    container: {
      flex: 1,
    },
    img: {
      width: Dimensions.get('window').width,
      height: Dimensions.get('window').width,
      marginBottom: 2,
    },
  },
  DarkModeSelection: {
    container: {
      flex: 1,
    },
    itemRow: {
      flexDirection: 'row',
      marginTop: 10,
    },
    switchRow: {
      justifyContent: 'space-between',
    },
  },
});

export default Styles;
