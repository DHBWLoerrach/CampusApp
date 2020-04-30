import React from 'react';
import { Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

import Colors from './util/Colors';
import HeaderIcon from './util/HeaderIcon';

import NewsScreen from './tabs/news/NewsScreen';
import ScheduleScreen from './tabs/schedule/ScheduleScreen';
import CanteenScreen from './tabs/canteen/CanteenScreen';
import ServiceScreen from './tabs/service/ServiceScreen';
import NewsDetails from './tabs/news/NewsDetails';
import EditCourse from './tabs/schedule/EditCourse';
import InfoText from './tabs/service/InfoText';
import InfoImage from './tabs/service/InfoImage';
import LinksList from './tabs/service/LinksList';
import About from './tabs/service/About';
import Feedback from './tabs/service/Feedback';
import Settings from './tabs/service/Settings';
import StuVScreen from "./tabs/stuv/StuVScreen";
import StuVEventDetails from "./tabs/stuv/StuVEventDetails";

const stackHeaderConfig = {
  headerBackTitle: 'Zurück',
  headerTintColor: 'white',
  headerStyle: {
    backgroundColor: Colors.dhbwRed,
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
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={stackHeaderConfig}
    >
      <Stack.Screen
        name="Home"
        component={NewsScreen}
        options={{ title: 'Neuigkeiten & Termine' }}
      />
      <Stack.Screen name="NewsDetails" component={NewsDetails} />
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
          name={"StuVEventDetails"}
          component={StuVEventDetails}
          options={
              ({route}) => {
                return { title: route.params.event.title };
              }
          }
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
        options={{ title: 'Speiseplan' }}
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
  tabBarIcon: ({ color }) => {
    const routeName = route.name;
    let iconName;
    if (routeName === 'News') iconName = 'rss-feed';
    else if (routeName === 'Schedule') iconName = 'school';
    else if (routeName === 'Canteen') iconName = 'restaurant';
    else if (routeName === 'Services') iconName = 'info-outline';
    else if (routeName === 'StuV') iconName = 'group';
    return <MaterialIcon name={iconName} size={32} color={color} />;
  },
});

const Tab = createBottomTabNavigator();

export default function Navigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={tabsConfig}
        tabBarOptions={{
          activeTintColor: Colors.dhbwRed,
        }}
      >
        <Tab.Screen name="News" component={NewsStack} />
        <Tab.Screen name="StuV" component={StuVStack} />
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
