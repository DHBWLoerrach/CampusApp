import React, {useContext} from 'react';
import { ScrollView, View } from 'react-native';
import Styles from '../../Styles/StyleSheet';
import {ColorSchemeContext} from "../../context/ColorSchemeContext";

export default function InfoText({ route }) {
    const colorContext = useContext(ColorSchemeContext);
  return (
    <View style={[Styles.InfoText.container, {backgroundColor: colorContext.colorScheme.background}]}>
      <ScrollView>{route.params?.text}</ScrollView>
    </View>
  );
}
