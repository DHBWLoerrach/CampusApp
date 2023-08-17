import { useContext, useEffect, useState } from 'react';
import { Platform, PixelRatio, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';

import { ColorSchemeContext } from './context/ColorSchemeContext';
import {
  ReloadDataProvider,
  useReloadData,
} from './context/ReloadContext';
import HeaderIcon from './util/HeaderIcon';
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
import ServiceScreen from './tabs/service/ServiceScreen';
import CampusTour from './tabs/service/CampusTour';

const ROUTE_KEY = 'selectedRoute';

export default function Navigator() {
  const colorContext = useContext(ColorSchemeContext);
  const [isReady, setIsReady] = useState(false);
  const [initialState, setInitialState] = useState(null);

  useEffect(() => {
    const loadRoute = async () => {
      let savedRoute = await AsyncStorage.getItem(ROUTE_KEY);
      savedRoute = JSON.parse(savedRoute);
      if (savedRoute) {
        setInitialState(savedRoute);
      }
      setIsReady(true);
    };
    loadRoute();
  }, []);

  const stackHeaderConfig = {
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

  const ScheduleOptions = ({ navigation, route }) => {
    const { setReload } = useReloadData();
    const headerTitle = route.params?.course ?? 'Vorlesungen';
    return {
      headerRight: () => (
        <HeaderIcon
          onPress={() => navigation.navigate('EditCourse')}
          icon="edit"
        />
      ),
      headerTitle,
      headerLeft: () =>
        route.params?.course && (
          <HeaderIcon
            onPress={() => setReload(true)}
            icon="refresh"
          />
        ),
    };
  };

  function ScheduleStack() {
    return (
      <ReloadDataProvider>
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
      </ReloadDataProvider>
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
        <Stack.Screen
          name="CampusTour"
          component={CampusTour}
          options={{ title: '360°-Tour' }}
        />
      </Stack.Navigator>
    );
  }

  const tabBarLabel = (title, { focused }) => {
    const style = {
      color: focused
        ? colorContext.colorScheme.dhbwRed
        : colorContext.colorScheme.tabBarText,
    };
    if (Platform.isPad) {
      // on iPad, tab bar labels are places beside icon: add some margin
      style.marginLeft = 20;
    } else {
      // smaller font for tab labels on smaller displays (e.g. iPhoneSE)
      // to prevent line breaks in "Vorlesungen"
      style.fontSize = PixelRatio.get() <= 2 ? 8 : 10;
    }
    return <Text style={style}>{title}</Text>;
  };

  const tabBarIcon = (icon, size, { focused }) => {
    return (
      <FontAwesome6
        name={icon}
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
      return <MaterialIcon name={iconName} size={32} color={color} />;
    },
    tabBarStyle: {
      backgroundColor: colorContext.colorScheme.background,
    },
  });

  if (!isReady) return null;

  const Tab = createBottomTabNavigator();

  return (
    <NavigationContainer
      initialState={initialState}
      onStateChange={(state) =>
        AsyncStorage.setItem(ROUTE_KEY, JSON.stringify(state))
      }
    >
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
