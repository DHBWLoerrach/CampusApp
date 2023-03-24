import React, { useContext, useState } from 'react';
import { Image, ScrollView, Switch, Text, View } from 'react-native';
import {
  TextDisclaimer,
  textPersonCategory,
} from './tabs/service/Texts';
import RoleSelection from './tabs/service/RoleSelection';
import Styles from './Styles/StyleSheet';
import UIButton from './ui/UIButton';
import { ColorSchemeContext } from './context/ColorSchemeContext';

export default function WelcomeScreen(props) {
  const [disclaimerChecked, checkDisclaimer] = useState(false);
  const [role, setRole] = useState(null);
  const colorContext = useContext(ColorSchemeContext);

  const onSubmit = () => {
    if (disclaimerChecked && role) {
      props.onSubmit(role);
    }
  };

  return (
    <View
      style={[
        Styles.WelcomeScreen.container,
        { backgroundColor: colorContext.colorScheme.background },
      ]}
    >
      <Image
        style={Styles.WelcomeScreen.headerImage}
        source={require('./img/drawer-header.png')}
      />
      <ScrollView
        style={[
          Styles.WelcomeScreen.contentContainer,
          { backgroundColor: colorContext.colorScheme.background },
        ]}
      >
        <View style={Styles.WelcomeScreen.header}>
          <Text
            style={[
              Styles.WelcomeScreen.heading,
              Styles.WelcomeScreen.welcome,
              { color: colorContext.colorScheme.dhbwRed },
            ]}
          >
            Willkommen an der DHBW Lörrach
          </Text>
          <Image
            style={Styles.WelcomeScreen.logo}
            source={require('./img/logo.png')}
          />
        </View>
        <View>
          <Text style={{ color: colorContext.colorScheme.text }}>
            Diese App ermöglicht den mobilen Zugriff auf News für
            Studierende, Vorlesungspläne, Speiseplan der Mensa…
          </Text>
        </View>
        <View style={Styles.WelcomeScreen.selection}>
          <View>
            <Text style={{ color: colorContext.colorScheme.text }}>
              {textPersonCategory}
            </Text>
          </View>
          <RoleSelection
            role={role}
            onRoleChange={(role) => setRole(role)}
          />
        </View>

        <View style={Styles.WelcomeScreen.disclaimer}>
          <TextDisclaimer />
        </View>

        <View style={Styles.WelcomeScreen.toggleContainer}>
          <Text style={{ color: colorContext.colorScheme.text }}>
            Ich stimme zu
          </Text>
          <Switch
            trackColor={{
              false: colorContext.colorScheme.dhbwGray,
              true: colorContext.colorScheme.dhbwRed,
            }}
            thumbColor="#f4f3f4"
            onValueChange={(value) => checkDisclaimer(value)}
            value={disclaimerChecked}
          />
        </View>
        <View style={Styles.WelcomeScreen.footer}>
          <UIButton
            size="small"
            onClick={onSubmit}
            disabled={!(disclaimerChecked && role)}
          >
            Start
          </UIButton>
        </View>
      </ScrollView>
    </View>
  );
}
