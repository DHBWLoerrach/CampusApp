import React from 'react';
import { Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

import Colors from './util/Colors';
import HeaderIcon from './util/HeaderIcon';
import StuVIcon from './../assets/stuv_icon.svg';
import { enableStuV } from './../env.js';

import NewsScreen from './tabs/news/NewsScreen';
import ScheduleScreen from './tabs/schedule/ScheduleScreen';
import CanteenScreen from './tabs/canteen/CanteenScreen';
import HeaderHelpIcon from './tabs/canteen/HeaderHelpIcon';
import ServiceScreen from './tabs/service/ServiceScreen';
import NewsDetails from './tabs/news/NewsDetails';
import EditCourse from './tabs/schedule/EditCourse';
import InfoText from './tabs/service/InfoText';
import InfoImage from './tabs/service/InfoImage';
import LinksList from './tabs/service/LinksList';
import About from './tabs/service/About';
import Feedback from './tabs/service/Feedback';
import Settings from './tabs/service/Settings';
import StuVScreen from './tabs/stuv/StuVScreen';
import StuVEventsDetails from './tabs/stuv/events/StuVEventsDetails';
import StuVNewsDetails from './tabs/stuv/news/StuVNewsDetails';
import StuVEventsRegister from './tabs/stuv/events/StuVEventsRegister';
import StuVEventsUnregister from './tabs/stuv/events/StuVEventsUnregister';
import { enableDualis } from './../env.js';

function getDualisOptions(navigation) {
  if (!enableDualis) return {};
  return {
    headerLeft: () => (
      <MaterialIcon
        style={{ paddingLeft: 10, color: 'white' }}
        onPress={() => navigation.openDrawer()}
        name="menu"
        size={30}
      />
    ),
  };
}

export default function Navigator({ navigation }) {
  const dualisOptions = getDualisOptions(navigation);

  const stackHeaderConfig = {
    ...dualisOptions,
    headerBackTitle: 'Zurück',
    headerTintColor: 'white',
    headerStyle: {
      backgroundColor: Colors.dhbwRed,
      shadowColor: 'transparent', // prevent line below header in iOS
      ...Platform.select({
        android: {
          elevation: 0,
        },
      }),
    },
  };

  const Stack = createStackNavigator();

  function NewsStack() {
    return (
      <Stack.Navigator screenOptions={stackHeaderConfig}>
        <Stack.Screen
          name="Home"
          component={NewsScreen}
          options={{ title: 'Neuigkeiten & Termine' }}
        />
        <Stack.Screen
          name="NewsDetails"
          component={NewsDetails}
          options={{ headerTitle: 'Neuigkeiten & Termine' }}
        />
      </Stack.Navigator>
    );
  }
  
  function StuVStack() {
    return (
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={stackHeaderConfig}
      >
        <Stack.Screen
          name="Home"
          component={StuVScreen}
          options={{ title: 'Studierendenvertretung - StuV' }}
        />
        <Stack.Screen
          name={'StuVEventsDetails'}
          component={StuVEventsDetails}
          options={({ route }) => {
            return { title: route.params.event.title };
          }}
        />
        <Stack.Screen
          name={'StuVEventsRegister'}
          component={StuVEventsRegister}
          options={({ route }) => {
            return { title: route.params.title };
          }}
        />
        <Stack.Screen
          name={'StuVEventsUnregister'}
          component={StuVEventsUnregister}
          options={({ route }) => {
            return { title: route.params.title };
          }}
        />
        <Stack.Screen
          name={'StuVNewsDetails'}
          component={StuVNewsDetails}
          options={({ route }) => {
            return { title: route.params.news.title };
          }}
        />
      </Stack.Navigator>
    );
  }

  const scheduleOptions = ({ navigation, route }) => {
    const headerTitle = route.params?.course ?? 'Vorlesungsplan';
    return {
      headerRight: () => (
        <HeaderIcon
          onPress={() => navigation.navigate('EditCourse')}
          icon="edit"
        />
      ),
      headerTitle,
    };
  };

  function ScheduleStack() {
    return (
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={stackHeaderConfig}
      >
        <Stack.Screen
          name="Home"
          component={ScheduleScreen}
          options={scheduleOptions}
        />
        <Stack.Screen
          name="EditCourse"
          component={EditCourse}
          options={{ title: 'Kurs eingeben' }}
        />
      </Stack.Navigator>
    );
  }

  function CanteenStack() {
    return (
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={stackHeaderConfig}
      >
        <Stack.Screen
          name="Home"
          component={CanteenScreen}
          options={{
            title: 'Speiseplan',
            headerRight: HeaderHelpIcon,
          }}
        />
      </Stack.Navigator>
    );
  }

  function ServicesStack() {
    return (
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={stackHeaderConfig}
      >
        <Stack.Screen
          name="Home"
          component={ServiceScreen}
          options={{ title: 'Services der DHBW Lörrach' }}
        />
        <Stack.Screen
          name="Accounts"
          component={LinksList}
          options={{ title: 'Service-Zugänge' }}
        />
        <Stack.Screen
          name="Emergency"
          component={LinksList}
          options={{ title: 'Hilfe im Notfall' }}
        />
        <Stack.Screen
          name="Study"
          component={LinksList}
          options={{ title: 'Studium' }}
        />
        <Stack.Screen
          name="KBC"
          component={LinksList}
          options={{ title: 'Angebote KBC' }}
        />
        <Stack.Screen
          name="Freetime"
          component={LinksList}
          options={{ title: 'Freizeit' }}
        />
        <Stack.Screen
          name="Feedback"
          component={Feedback}
          options={{ title: 'Feedback' }}
        />
        <Stack.Screen
          name="Settings"
          component={Settings}
          options={{ title: 'Einstellungen' }}
        />
        <Stack.Screen
          name="About"
          component={About}
          options={{ title: 'Über' }}
        />
        <Stack.Screen
          name="Disclaimer"
          component={InfoText}
          options={{ title: 'Haftung' }}
        />
        <Stack.Screen
          name="Imprint"
          component={InfoText}
          options={{ title: 'Impressum' }}
        />
        <Stack.Screen
          name="Privacy"
          component={InfoText}
          options={{ title: 'Datenschutz' }}
        />
        <Stack.Screen
          name="CafeteriaKKH"
          component={InfoText}
          options={{ title: 'Cafeteria im KKH' }}
        />
        <Stack.Screen
          name="Hieber"
          component={InfoText}
          options={{ title: "Hieber's Frische Center" }}
        />
        <Stack.Screen
          name="CampusHangstr"
          component={InfoImage}
          options={{ title: 'Campus Hangstraße' }}
        />
      </Stack.Navigator>
    );
  }

  const tabsConfig = ({ route }) => ({
    headerShown: false,
    tabBarIcon: ({ color }) => {
      const routeName = route.name;
      let iconName;
      if (routeName === 'News') iconName = 'rss-feed';
      else if (routeName === 'Schedule') iconName = 'school';
      else if (routeName === 'Canteen') iconName = 'restaurant';
      else if (routeName === 'Services') iconName = 'info-outline';
      else if (routeName === 'StuV')
        return <StuVIcon width={32} height={32} color={color} />;
      return <MaterialIcon name={iconName} size={32} color={color} />;
    },
    tabBarActiveTintColor: Colors.dhbwRed,
  });

  const Tab = createBottomTabNavigator();
  return (
    <NavigationContainer independent={true}>
      <Tab.Navigator screenOptions={tabsConfig}>
        <Tab.Screen name="News" component={NewsStack} />
        {enableStuV ? (
          <Tab.Screen name="StuV" component={StuVStack} />
        ) : null}
        <Tab.Screen
          name="Schedule"
          component={ScheduleStack}
          options={{ title: 'Vorlesungsplan' }}
        />
        <Tab.Screen
          name="Canteen"
          component={CanteenStack}
          options={{ title: 'Mensa' }}
        />
        <Tab.Screen
          name="Services"
          component={ServicesStack}
          options={{ title: 'Services' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
