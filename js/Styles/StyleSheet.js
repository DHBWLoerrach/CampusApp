import {Dimensions, PixelRatio, StyleSheet} from 'react-native';
import Colors from "./Colors";
import Constants from "../util/Constants";

var FONT_TAB_BAR_LABEL = 13;

// tabBarLabel font for smaller displays (e.g. iPhoneSE)
// this makes sure that dates like 22.10. fit in tab
if (PixelRatio.get() <= 2) {
    FONT_TAB_BAR_LABEL = 10;
}

const Styles = StyleSheet.create({
    //New Styles
    textSizes:{
        small: {
            fontSize: 15,
        },
        medium: {
            fontSize: 25,
        },
        dialog: {
            fontSize: 18,
        }
    },
    button: {
        container: {
            backgroundColor: Colors.dhbwRed,
            alignItems: 'center',
        },
        text: {
            color: 'white'
        },
        disabled: {
            backgroundColor: 'grey',
        },
        sizes:{
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
                marginLeft: 7
            }
        }
    },

    //Migrated Stypes
    General:{
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
        }
    },
    WelcomeScreen:{
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
            flexDirection: 'row'
        },
        selection: {
            marginTop: 15,
        },
        selectionText: {
            marginRight: 20,
            marginBottom: 15,
        },
        notificationSettings: {
            marginTop: 10,
        },
        disclaimer: {
            marginTop: 10,
        },
        footer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 20,
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
        }
    },
    CampusApp: {
        container: {
            flex: 1,
        },
        center: {
            flex: 2,
            alignItems: 'center',
            justifyContent: 'center',
        }
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
        }
    },
    ResponsiveImage: {
        image: {
            resizeMode: 'contain'
        }
    },
    ReloadView: {
        center: {
            flex: 2,
            alignItems: 'center',
            justifyContent: 'center'
        },
        infoText: {
            justifyContent: 'center',
            fontSize: 20,
            marginBottom: 15,
            paddingHorizontal: 20
        }
    },
    HeaderIcon: {
        touchable: {
            paddingHorizontal: 8,
        },
        icon: {
            marginRight: 10,
        }
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
        }
    },
    DrawerContent: {
        drawerContent: {
            flex: 1,
        },
        userInfoSection: {
            paddingLeft: 20,
        },
        title: {
            fontSize: 14,
            marginTop: 3,
            fontWeight: 'bold',
        },
        caption: {
            fontSize: 14,
            lineHeight: 14,
        },
        avatar: {
            flexDirection: 'row',
            marginTop: 15,
        },
        loggedIn: {
            flexDirection: 'column',
            marginLeft: 5,
        },
        row: {
            marginTop: 20,
            flexDirection: 'row',
            alignItems: 'center',
        },
        section: {
            flexDirection: 'row',
            alignItems: 'center',
            marginRight: 15,
        },
        paragraph: {
            fontWeight: 'bold',
            marginRight: 3,
        },
        drawerSection: {
            marginTop: 15,
        },
        bottomDrawerSection: {
            marginBottom: 15,
            borderTopColor: '#f4f4f4',
            borderTopWidth: 1,
        }
    },
    DayHeader: {
        header: {
            backgroundColor: Colors.lightGray,
            height: 32,
            justifyContent: 'center',
            paddingHorizontal: Constants.listViewRowPaddingHorizontal
        }
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
            fontWeight: 'bold'
        }
    },
    StuVNewsDetails: {
        scrollView: {
            flex: 1,
            backgroundColor: 'white',
        },
        container: {
            margin: 10,
        },
        headline: {
            fontSize: 24,
            fontWeight: 'bold',
        }
    },
    StuVNews: {
        container: {
            flex: 1,
            backgroundColor: 'white',
        },
        center: {
            flex: 2,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'white',
        }
    },
    StuVEventsUnregister: {
        container: {
            flex: 1,
        },
        heading: {
            padding: 5,
            marginBottom: 4,
        },
        text: {
            fontWeight: 'bold',
        },
        error: {
            color: 'red',
            marginBottom: '2%',
        }
    },
    StuVEventsRegister: {
        container: {
            flex: 1,
        },
        heading: {
            marginBottom: 10,
            marginTop: 4,
        },
        text: {
            fontWeight: 'bold',
            fontSize: 15,
        },
        error: {
            color: 'red',
            padding: 10,
            marginBottom: 8,
            fontSize: 17,
        }
    },
    StuVEventsDetails: {
        container: {
            padding: 10,
            zIndex: 2,
        },
        button: {
            marginTop: 10,
            flexGrow: 1,
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'space-evenly',
            alignItems: 'baseline',
        },
        headline: {
            fontSize: 24,
            fontWeight: 'bold',
        }
    },
    StuVEvents: {
        container: {
            flex: 1,
            paddingVertical: 10
        },
        center: {
            flex: 2,
            alignItems: 'center',
            justifyContent: 'center',
        }
    },
    StuVEventMap: {
        ios: {
            container: {
                height: 250,
                width: 400,
                justifyContent: 'flex-end',
                alignItems: 'center',
            },
            map: {
                ...StyleSheet.absoluteFillObject,
            }
        },
        android: {
            copyrightText: {
                position: 'absolute',
                top: 0,
                right: 0,
                fontSize: 10,
                margin: 3,
            },
            map: {
                flex: 1,
                zIndex: -1,
            },
            mapContainer: {
                height: 250,
            },
            mapButton: {
                position: 'absolute',
                top: 0,
                left: 0,
                margin: 3,
            }
        }
    },
    StuVEventCell: {
        entry: {
            backgroundColor: "white",
            borderRadius: 5,
            marginBottom: 10,
            marginHorizontal: 10,
        },
        container: {
            flex: 1,
            justifyContent: 'space-around',
            flexDirection: 'column',
        },
        imageContainer: {
            width: '100%',
            aspectRatio: 1,
            borderTopLeftRadius: 5,
            borderTopRightRadius: 5,
            resizeMode: 'contain'
        },
        textContainer: {
            marginTop: 15,
            marginHorizontal: 20,
            marginBottom: 15,
        },
        headline: {
            fontSize: 28,
            color: Colors.dhbwRed,
            fontWeight: '700',
        },
        text: {
            marginTop: 8,
            fontSize: 16,
            lineHeight: 21,
            //color: '#262626',
        },
        details: {
            marginTop: 8,
            fontSize: 18,
            //color: '#262626',
            fontWeight: '600',
        },
        icon: {
            alignSelf: 'flex-end',
            color: 'white',
        },
        button: {
            color: Colors.dhbwRed
        }
    },
    StuVEventDetails: {
        headline: {
            fontSize: 28,
            fontWeight: '700'
        },
        container: {
            marginTop: 20,
            marginHorizontal: 20,
            backgroundColor: 'white',
        },
        details: {
            marginTop: 8,
            fontSize: 18,
            fontWeight: '600',
        },
        description: {
            marginTop: 8,
            fontSize: 16,
            lineHeight: 21,
        },
        button: {
            marginTop: 10,
            flexGrow: 1,
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'space-evenly',
            alignItems: 'baseline',
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
        }
    },
    SubmenuItem: {
        icon: {
            marginBottom: 10,
        },
        container: {
            borderRadius: 5,
            alignItems: 'center',
            justifyContent: 'center',
            width: 180, //TODO: Set Responsive Size
            marginBottom: 10,
            paddingTop: 10,
            paddingBottom: 10
        },
        label: {
            fontSize: 15,
            fontWeight: 'bold',
            textAlign: 'center'
        }
    },
    Submenu: {
        menuContainer: {
            marginTop: 10,
            alignItems: 'center',
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-around'
        }
    },
    Settings: {
        container: {
            flex: 1,
            backgroundColor: 'white',
            padding: 15,
        },
        configBlock: {
            marginBottom: 20,
        }
    },
    ServiceScreen: {
        screenContainer: {
            flex: 1
        }
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
            borderRadius: 5
        },
        label: {
            marginLeft: 5,
        },
        bold: {
            fontWeight: 'bold',
        }
    },
    LinksList: {
        container: {
            flex: 1
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
            fontSize: 17
        }
    },
    InfoText: {
        container: {
            flex: 1,
            backgroundColor: 'white',
        }
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
        }
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
        }
    },
    ScheduleScreen: {
        container: {
            flex: 1
        },
        center: {
            flex: 2,
            alignItems: 'center',
            justifyContent: 'center',
        }
    },
    LectureRow: {
        row: {
            paddingVertical: Constants.listViewRowPaddingVertical,
            paddingHorizontal: Constants.listViewRowPaddingHorizontal
        },
        title: {
            fontSize: Constants.bigFont
        },
        info: {
            fontSize: Constants.smallFont
        }
    },
    EditCourse: {
        container: {
            flex: 1,
            backgroundColor: 'white',
            padding: 15,
        },
        inputContainer: {
            flexDirection: 'row',
            justifyContent: 'space-around',
            paddingVertical: 10,
        },
        input: {
            borderColor: '#CCC',
            borderWidth: StyleSheet.hairlineWidth,
            color: 'black',
            height: 40,
            width: 140,
        }
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
        }
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
        }
    },
    CanteenDayListView: {
        row: {
            flexDirection: 'row',
            paddingVertical: 10,
            paddingHorizontal: 10,
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
        }
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
        }
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
        }
    },
    DualisStatistics: {
        container: {
            flex: 1,
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: 30,
        },
        center: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        name: {
            fontSize: 22,
            textAlign: 'center',
        },
        message: {
            fontSize: 18,
            color: Colors.dhbwRed,
            textAlign: 'center',
        },
        text: {
            fontSize: 16,
            color: Colors.dhbwGray,
            textAlign: 'center',
        },
        percentageBlock: {
            alignItems: 'center',
            marginTop: 20,
        },
        percentage: {
            fontSize: 26,
            color: Colors.dhbwRed,
        },
        scrollView: {
            marginHorizontal: 20,
        },
        note: {
            fontSize: 10,
            paddingBottom: 5,
            textAlign: 'center',
        }
    },
    DualisNavigator: {
        center: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        icon: {
            paddingLeft: 10,
            color: 'white',
        }
    },
    DualisMain: {
        container: {
            flex: 1,
        },
        center: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        message: {
            fontSize: 18,
            color: Colors.dhbwRed,
            textAlign: 'center',
        },
        scrollView: {
            marginHorizontal: 20,
        }
    },
    DualisLogin: {
        container: {
            flex: 1,
        },
        paragraph: {
            fontSize: 14,
            lineHeight: 14,
            paddingLeft: '10%',
            paddingRight: '10%',
            textAlign: 'center',
            marginTop: 40,
        },
        dhbwButton: {
            width: '100%',
            backgroundColor: Colors.dhbwRed,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 20,
        },
        buttonText: {
            color: 'white',
            margin: 20,
        },
        textInput: {
            marginTop: 40,
        }
    },
    DualisIntro: {
        container: {
            flex: 1,
            alignItems: 'center',
        },
        caption: {
            fontSize: 14,
            marginTop: 3,
            fontWeight: 'bold',
        },
        paragraph: {
            fontSize: 14,
            lineHeight: 14,
            paddingLeft: '10%',
            paddingRight: '10%',
            textAlign: 'center',
            marginBottom: 40,
        },
        dualisImage: {
            flex: 1,
            width: '60%',
            height: undefined,
            resizeMode: 'contain',
        },
        dhbwButton: {
            width: '100%',
            backgroundColor: Colors.dhbwRed,
            alignItems: 'center',
        },
        textMargin: {
            color: 'white',
            margin: 20,
        }
    },
    DualisDetail: {
        container: {
            flex: 1,
        },
        scrollView: {
            marginHorizontal: 20,
        }
    },
    InfoImage: {
        container: {
            flex: 1
        },
        img: {
            width: Dimensions.get('window').width,
            height: Dimensions.get('window').width,
            marginBottom: 2
        }
    },
    DarkModeSelection: {
        container: {
            flex: 1
        },
        itemRow: {
            flexDirection: "row",
            marginTop: 10
        },
        switchRow: {
            justifyContent: "space-between"
        }
    }
});

export default Styles;
