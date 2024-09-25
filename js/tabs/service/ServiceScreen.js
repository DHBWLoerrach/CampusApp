import { useContext } from 'react';
import { Linking, ScrollView, View } from 'react-native';

import {
  linksAccounts,
  linkBib,
  linksEmergency,
  linksFreetime,
  linksKBC,
  linkOrientation,
  linksStudy,
} from './Links';
import Submenu from './menu/Submenu';
import {
  TextPrivacy,
  TextAgreedDisclaimer,
  TextImprint,
} from './Texts';
import Styles from '../../Styles/StyleSheet';
import { ColorSchemeContext } from '../../context/ColorSchemeContext';

export default function ServiceScreen(props) {
  const colorContext = useContext(ColorSchemeContext);

  const _getSubmenuItems = () => {
    const { navigate } = props.navigation;
    return [
      {
        label: 'Anreise',
        iconName: 'location-dot',
        onPress: () => Linking.openURL(linkOrientation),
      },
      {
        label: '360°-Tour',
        iconName: 'street-view',
        onPress: () => navigate('CampusTour'),
      },
      {
        label: 'Gebäude Hangstraße',
        iconName: 'map',
        onPress: () => navigate('CampusHangstr'),
      },
      {
        label: 'Sicherheit',
        iconName: 'building-shield',
        onPress: () => navigate('Security'),
      },
      {
        label: 'Hausordnung',
        iconName: 'building-columns',
        onPress: () => navigate('HouseRules'),
      },
      {
        label: 'Service-Zugänge',
        iconName: 'link',
        onPress: () => navigate('Accounts', { links: linksAccounts }),
      },
      {
        label: 'Hilfe im Notfall',
        iconName: 'phone',
        onPress: () =>
          navigate('Emergency', { links: linksEmergency }),
      },
      {
        label: 'Studium',
        iconName: 'graduation-cap',
        onPress: () => navigate('Study', { links: linksStudy }),
      },
      {
        label: 'Katalog Bibliothek',
        iconName: 'book-open',
        onPress: () => Linking.openURL(linkBib),
      },
      {
        label: 'Angebote bei der KBC',
        iconName: 'school',
        onPress: () => navigate('KBC', { links: linksKBC }),
      },
      {
        label: 'Freizeit',
        iconName: 'cloud-sun',
        onPress: () => navigate('Freetime', { links: linksFreetime }),
      },
      {
        label: 'Feedback',
        iconName: 'envelope',
        onPress: () => navigate('Feedback'),
      },
      {
        label: 'Einstellungen',
        iconName: 'gear',
        onPress: () => navigate('Settings'),
      },
      {
        label: 'Über',
        iconName: 'circle-info',
        onPress: () => navigate('About'),
      },
      {
        label: 'Haftung',
        iconName: 'file-shield',
        onPress: () =>
          navigate('Disclaimer', { text: <TextAgreedDisclaimer /> }),
      },
      {
        label: 'Impressum',
        iconName: 'file-lines',
        onPress: () => navigate('Imprint', { text: <TextImprint /> }),
      },
      {
        label: 'Datenschutz',
        iconName: 'eye',
        onPress: () => navigate('Privacy', { text: <TextPrivacy /> }),
      },
    ];
  };
  return (
    <View
      style={[
        Styles.ServiceScreen.screenContainer,
        { backgroundColor: colorContext.colorScheme.background },
      ]}
    >
      <ScrollView>
        <Submenu menuItems={_getSubmenuItems()} />
      </ScrollView>
    </View>
  );
}
