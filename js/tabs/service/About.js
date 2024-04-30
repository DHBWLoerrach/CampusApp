import React, { Component, useContext } from 'react';
import { Text, ScrollView, Linking } from 'react-native';

import { textAbout } from './Texts';
import Styles from '../../Styles/StyleSheet';
import { ColorSchemeContext } from '../../context/ColorSchemeContext';

export default function About() {
  const colorContext = useContext(ColorSchemeContext);

  return (
    <ScrollView
      style={[
        Styles.About.container,
        { backgroundColor: colorContext.colorScheme.background },
      ]}
    >
      <Text style={{ color: colorContext.colorScheme.text }}>
        {textAbout}
      </Text>
      <Text
        style={[
          Styles.About.link,
          { color: colorContext.colorScheme.dhbwRed },
        ]}
        onPress={() =>
          Linking.openURL('mailto:apps@dhbw-loerrach.de')
        }
      >
        apps@dhbw-loerrach.de
      </Text>
      <Text
        style={[
          Styles.About.marginBig,
          { color: colorContext.colorScheme.text },
        ]}
      >
        Diese App ist ein Open Source Projekt:
      </Text>
      <Text
        style={[
          Styles.About.margin,
          Styles.About.link,
          { color: colorContext.colorScheme.dhbwRed },
        ]}
        onPress={() =>
          Linking.openURL('https://github.com/DHBWLoerrach/CampusApp')
        }
      >
        github.com/DHBWLoerrach/CampusApp
      </Text>
      <Text
        style={[
          Styles.About.marginBig,
          { color: colorContext.colorScheme.text },
        ]}
      >
        Version (App): 2.9.7
      </Text>
    </ScrollView>
  );
}
