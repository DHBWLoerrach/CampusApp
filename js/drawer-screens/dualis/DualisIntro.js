import React from 'react';
import {
  View,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Caption, Paragraph, Text } from 'react-native-paper';
import Styles from '../../Styles/StyleSheet';

export default function DualisIntro({ navigation }) {
  return (
    <View style={Styles.DualisIntro.container}>
      <Image
        style={Styles.DualisIntro.dualisImage}
        source={require('../../img/dualis-intro.png')}
      />
      <Caption style={Styles.DualisIntro.caption}>
        Alle Deine Noten an einem Ort!
      </Caption>
      <Paragraph style={Styles.DualisIntro.paragraph}>
        Die neue Dualis-Funktion in der DHBW Campus App erlaubt es Dir
        jederzeit, auch unterwegs, einfach Deine Noten abzurufen.
      </Paragraph>
      <Caption style={Styles.DualisIntro.caption}>
        Vergleiche Dich mit anderen!
      </Caption>
      <Paragraph style={Styles.DualisIntro.paragraph}>
        Du kannst Dir den prozentualen Anteil an Studenten in Deinem
        Kurs anzeigen lassen, die in einem Modul besser, gleich oder
        schlechter abgeschnitten haben.
      </Paragraph>
      <TouchableOpacity
        style={Styles.DualisIntro.dhbwButton}
        onPress={() => navigation.navigate('DualisLogin')}
      >
        <Text style={Styles.DualisIntro.textMargin}>Anmelden</Text>
      </TouchableOpacity>
    </View>
  );
}