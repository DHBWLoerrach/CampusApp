import React, { useContext, useEffect, useState } from 'react';
import { Platform, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

import HeaderIcon from './util/HeaderIcon';
import StuVIcon from './../assets/stuv_icon.svg';
import { enableStuV } from '../env';

import NewsScreen from './tabs/news/NewsScreen';
import ScheduleScreen from './tabs/schedule/ScheduleScreen';
import CanteenScreen from './tabs/canteen/CanteenScreen';
import HeaderHelpIcon from './tabs/canteen/HeaderHelpIcon';
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
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { ColorSchemeContext } from './context/ColorSchemeContext';
import ServiceScreen from './tabs/service/ServiceScreen';
import { Menu, MenuItem, MenuDivider } from 'react-native-material-menu';
import { ScheduleModeContext } from './context/ScheduleModeContext';
import { loadScheduleMode, saveScheduleMode } from './tabs/schedule/store';

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

export default function NavigatorDark({ navigation }) {
  const dualisOptions = getDualisOptions(navigation);
  const colorContext = useContext(ColorSchemeContext);
  const [scheduleMode, setScheduleMode] = useState();

  useEffect(() => {
    const fetchScheduleData = async () => {
      const scheduleMode = await loadScheduleMode();
      // falls scheduleMode noch nicht gesetzt ist, wird es auf 3 gesetzt
      if (scheduleMode) {
        setScheduleMode(Number(scheduleMode));
      } else {
        setNewScheduleMode(3);
      }
    }
    fetchScheduleData();
  }, []);

  const stackHeaderConfig = {
    ...dualisOptions,
    headerBackTitle: 'Zurück',
    headerTintColor: 'white',
    headerStyle: {
      backgroundColor: colorContext.colorScheme.dhbwRed,
      shadowColor: 'transparent', // prevent line below header in iOS
      ...Platform.select({
        android: {
          elevation: 0,
        },
      }),
    },
  };

  const Stack = createNativeStackNavigator();

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
          name="StuVEventsDetails"
          component={StuVEventsDetails}
          options={({ route }) => {
            return { title: route.params.event.name };
          }}
        />
        <Stack.Screen
          name="StuVNewsDetails"
          component={StuVNewsDetails}
          options={({ route }) => {
            return { title: route.params.news.title };
          }}
        />
        <Stack.Screen
          name="StuVEventsRegister"
          component={StuVEventsRegister}
          options={({ route }) => {
            return { title: route.params.title };
          }}
        />
        <Stack.Screen
          name="StuVEventsUnregister"
          component={StuVEventsUnregister}
          options={({ route }) => {
            return { title: route.params.title };
          }}
        />
      </Stack.Navigator>
    );
  }

  const ScheduleOptions = ({ navigation, route }) => {
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const hideMenu = () => setIsMenuVisible(false);
    const showMenu = () => setIsMenuVisible(true);
    const headerTitle = route.params?.course ?? 'Vorlesungsplan';
    return {
      headerRight: () => (
        <HeaderIcon
          onPress={() => navigation.navigate('EditCourse')}
          icon="edit"
        />
      ),
      headerTitle,
      headerLeft: () => (
        <View style={{ height: '100%', alignItems: 'center', justifyContent: 'center' }}>
          <Menu
            visible={isMenuVisible}
            anchor={
              <HeaderIcon
                onPress={showMenu}
                icon='tune'
              />
            }
            onRequestClose={hideMenu}
          >
            <MenuItem onPress={() => setNewScheduleMode(0)} textStyle={{ color: colorContext.colorScheme.text }} style={{ backgroundColor: colorContext.colorScheme.card }}>Liste</MenuItem>
            <MenuDivider />
            <MenuItem onPress={() => setNewScheduleMode(1)} textStyle={{ color: colorContext.colorScheme.text }} style={{ backgroundColor: colorContext.colorScheme.card }}>1 Tag</MenuItem>
            <MenuItem onPress={() => setNewScheduleMode(3)} textStyle={{ color: colorContext.colorScheme.text }} style={{ backgroundColor: colorContext.colorScheme.card }}>3 Tage</MenuItem>
            <MenuItem onPress={() => setNewScheduleMode(5)} textStyle={{ color: colorContext.colorScheme.text }} style={{ backgroundColor: colorContext.colorScheme.card }}>5 Tage</MenuItem>
            <MenuItem onPress={() => setNewScheduleMode(7)} textStyle={{ color: colorContext.colorScheme.text }} style={{ backgroundColor: colorContext.colorScheme.card }}>Woche</MenuItem>
          </Menu>
        </View>
      ),
    };
  };

  function ScheduleStack() {
    return (
      <ScheduleModeContext.Provider
        value={scheduleMode}
      >
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={stackHeaderConfig}
        >
          <Stack.Screen
            name="Home"
            component={ScheduleScreen}
            options={ScheduleOptions}
          />
          <Stack.Screen
            name="EditCourse"
            component={EditCourse}
            options={{ title: 'Kurs eingeben' }}
          />
        </Stack.Navigator>
      </ScheduleModeContext.Provider>
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

  const tabBarLabel = (title, { focused }) => {
    return (
      <Text
        style={{
          color: focused
            ? colorContext.colorScheme.dhbwRed
            : colorContext.colorScheme.tabBarText,
          fontSize: 10,
        }}
      >
        {title}
      </Text>
    );
  };

  const tabBarIcon = (icon, size, { focused }) => {
    return (
      <FontAwesomeIcon
        icon={icon}
        size={size}
        color={
          focused
            ? colorContext.colorScheme.dhbwRed
            : colorContext.colorScheme.tabBarText
        }
      />
    );
  };

  const tabsConfig = ({ route }) => ({
    headerShown: false,
    tabBarIcon: ({ color }) => {
      const routeName = route.name;
      let iconName;
      if (routeName === 'DHBW') iconName = 'rss-feed';
      else if (routeName === 'Schedule') iconName = 'school';
      else if (routeName === 'Canteen') iconName = 'restaurant';
      else if (routeName === 'Services') iconName = 'info-outline';
      else if (routeName === 'StuV')
        return <StuVIcon width={32} height={32} color={color} />;
      return <MaterialIcon name={iconName} size={32} color={color} />;
    },
    tabBarStyle: {
      backgroundColor: colorContext.colorScheme.background,
    },
  });

  const Tab = createBottomTabNavigator();

  const setNewScheduleMode = async (mode) => {
    setScheduleMode(mode);
    await saveScheduleMode(mode);
  }
  return (
    <NavigationContainer independent={true}>
      <Tab.Navigator screenOptions={tabsConfig}>
        <Tab.Screen
          name="DHBW"
          component={NewsStack}
          options={{
            tabBarLabel: ({ focused }) =>
              tabBarLabel('DHBW', { focused }),
            tabBarIcon: ({ focused }) => (
              <MaterialIcon
                name={'rss-feed'}
                size={32}
                color={
                  focused
                    ? colorContext.colorScheme.dhbwRed
                    : colorContext.colorScheme.tabBarText
                }
              />
            ),
          }}
        />
        {enableStuV ? (
          <Tab.Screen
            name="StuV"
            component={StuVStack}
            options={{
              tabBarLabel: ({ focused }) =>
                tabBarLabel('StuV', { focused }),
              tabBarIcon: ({ focused }) => (
                <StuVIcon
                  name={'rss-feed'}
                  width={32}
                  height={32}
                  color={
                    focused
                      ? colorContext.colorScheme.dhbwRed
                      : colorContext.colorScheme.tabBarText
                  }
                />
              ),
            }}
          />
        ) : null}
        <Tab.Screen
          name="Schedule"
          component={ScheduleStack}
          options={{
            tabBarLabel: ({ focused }) =>
              tabBarLabel('Vorlesungen', { focused }),
            tabBarIcon: ({ focused }) =>
              tabBarIcon('graduation-cap', 30, { focused }),
          }}
        />
        <Tab.Screen
          name="Canteen"
          component={CanteenStack}
          options={{
            tabBarLabel: ({ focused }) =>
              tabBarLabel('Mensa', { focused }),
            tabBarIcon: ({ focused }) =>
              tabBarIcon('utensils', 25, { focused }),
          }}
        />
        <Tab.Screen
          name="Services"
          component={ServicesStack}
          options={{
            tabBarLabel: ({ focused }) =>
              tabBarLabel('Services', { focused }),
            tabBarIcon: ({ focused }) =>
              tabBarIcon('circle-info', 25, { focused }),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
