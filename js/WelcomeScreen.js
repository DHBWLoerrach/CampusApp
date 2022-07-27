import React, { useState } from 'react';
import {
  Image,
  ScrollView, StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';

import {
  TextDisclaimer,
  textPersonCategory,
} from './tabs/service/Texts';
import RoleSelection from './tabs/service/RoleSelection';
import NotificationSettings from './util/NotificationSettings';
import Styles from './Styles/StyleSheet';
import UIButton from "./ui/UIButton";

//TODO: Check if its necessary
/*const ButtonTouchable =
  Platform.OS === 'android'
    ? TouchableNativeFeedback
    : TouchableOpacity;*/

export default function WelcomeScreen(props) {
  const [disclaimerChecked, checkDisclaimer] = useState(false);
  const [role, setRole] = useState(null);

  const onSubmit = () => {
    if (disclaimerChecked && role) {
      props.onSubmit(role);
    }
  };

  return (
    <View style={Styles.WelcomeScreen.container}>
      <Image
        style={Styles.WelcomeScreen.headerImage}
        source={require('./img/drawer-header.png')}
      />
      <ScrollView style={Styles.WelcomeScreen.contentContainer}>
        <View style={Styles.WelcomeScreen.header}>
          <Text style={[Styles.WelcomeScreen.heading, Styles.WelcomeScreen.welcome]}>
            Willkommen an der DHBW Lörrach
          </Text>
          <Image
            style={Styles.WelcomeScreen.logo}
            source={require('./img/logo.png')}
          />
        </View>
        <View>
          <Text>
            Diese App ermöglicht den mobilen Zugriff auf News für
            Studierende, Vorlesungspläne, Speiseplan der Mensa…
          </Text>
        </View>
        <View style={Styles.WelcomeScreen.selection}>
          <View>
            <Text>{textPersonCategory}</Text>
          </View>
          <RoleSelection
            role={role}
            onRoleChange={(role) => setRole(role)}
          />
        </View>

        <View style={Styles.WelcomeScreen.notificationSettings}>
          <Text>
            Hier kannst Du auswählen, welche Benachrichtigungen Du
            erhalten möchtest. Dies geschieht höchstens einmal am Tag.
          </Text>
        </View>

        <NotificationSettings enabled={true} />

        <View style={Styles.WelcomeScreen.disclaimer}>
          <TextDisclaimer />
        </View>

        <View style={styles.toggleContainer}>
          <Text>Ich stimme zu</Text>
          <Switch
              onValueChange={(value) => checkDisclaimer(value)}
              value={disclaimerChecked}
          />
        </View>
        <View style={Styles.WelcomeScreen.footer}>
          {/*<View style={Styles.WelcomeScreen.agreeDisclaimer}>
            <Text style={Styles.WelcomeScreen.disclaimerLabel}>Ich stimme zu</Text>
            <Switch
              onValueChange={(value) => checkDisclaimer(value)}
              value={disclaimerChecked}
            />
          </View>*/}

          {/*<ButtonTouchable onPress={_onSubmit}>
            <Text
              style={[
                Styles.WelcomeScreen.submit,
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
          </ButtonTouchable>*/}
          <UIButton size={"small"} onClick={onSubmit} disabled={! (disclaimerChecked && role)}>Start</UIButton>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
});
