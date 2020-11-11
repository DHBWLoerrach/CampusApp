import 'react-native-gesture-handler';
import { AppRegistry, Platform } from 'react-native';
import PushNotification from 'react-native-push-notification';
import CampusApp from './js/CampusApp';

PushNotification.configure({
  requestPermissions: Platform.OS === 'ios',
});
AppRegistry.registerComponent('CampusApp', () => CampusApp);
