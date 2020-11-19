import React, { Fragment, useState } from 'react';
import {
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableNativeFeedback,
  TouchableOpacity,
  View,
} from 'react-native';

import Colors from './util/Colors';

import {
  TextDisclaimer,
  textPersonCategory,
} from './tabs/service/Texts';
import RoleSelection from './tabs/service/RoleSelection';
import NotificationSettings from './util/NotificationSettings';
import { enableNotifications } from './../env.js';

const ButtonTouchable =
  Platform.OS === 'android'
    ? TouchableNativeFeedback
    : TouchableOpacity;

const renderNotifications = () => (
  <>
    <View style={styles.notificationSettings}>
      <Text>
        Bitte wähle hier aus, welche Benachrichtigungen Du erhalten
        möchtest:
      </Text>
    </View>

    <NotificationSettings enabled={true} />
  </>
);

export default function WelcomeScreen(props) {
  const [disclaimerChecked, checkDisclaimer] = useState(false);
  const [role, setRole] = useState(null);

  const _onSubmit = () => {
    if (disclaimerChecked && role) {
      props.onSubmit(role);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        style={styles.headerImage}
        source={require('./img/drawer-header.png')}
      />
      <ScrollView style={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={[styles.heading, styles.welcome]}>
            Willkommen an der DHBW Lörrach
          </Text>
          <Image
            style={styles.logo}
            source={require('./img/logo.png')}
          />
        </View>
        <View>
          <Text>
            Diese App ermöglicht den mobilen Zugriff auf News für
            Studierende, Vorlesungspläne, Speiseplan der Mensa…
          </Text>
        </View>
        <View style={styles.selection}>
          <View>
            <Text>{textPersonCategory}</Text>
          </View>
          <RoleSelection
            role={role}
            onRoleChange={(role) => setRole(role)}
          />
        </View>

        {enableNotifications ? renderNotifications() : null}

        <View style={styles.disclaimer}>
          <TextDisclaimer />
        </View>
        <View style={styles.footer}>
          <View style={styles.agreeDisclaimer}>
            <Text style={styles.disclaimerLabel}>Ich stimme zu:</Text>
            <Switch
              onValueChange={(value) => checkDisclaimer(value)}
              value={disclaimerChecked}
            />
          </View>
          <ButtonTouchable onPress={_onSubmit}>
            <Text
              style={[
                styles.submit,
                {
                  color:
                    disclaimerChecked && role
                      ? Colors.dhbwRed
                      : Colors.dhbwGray,
                },
              ]}
            >
              {'Start >'}
            </Text>
          </ButtonTouchable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    backgroundColor: 'white',
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
    color: Colors.dhbwRed,
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
});
