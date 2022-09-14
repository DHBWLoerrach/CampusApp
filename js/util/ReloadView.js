import React, {Component, useContext} from 'react';
import { Button, Text, View } from 'react-native';

import Styles from '../Styles/StyleSheet';
import {ColorSchemeContext} from "../context/ColorSchemeContext";

export default function ReloadView(props) {
    const colorContext = useContext(ColorSchemeContext);
    let text = props.message;
    if (!text) {
      text =
        'Fehler mit der Internetverbindung. Probiere es später noch einmal.';
    }
    return (
      <View style={[Styles.ReloadView.center, {backgroundColor: colorContext.colorScheme.background}]}>
        <Text style={[Styles.ReloadView.infoText, {color: colorContext.colorScheme.text}]}>{text}</Text>
        <Button
          title={props.buttonText}
          color={colorContext.colorScheme.dhbwRed}
          onPress={props.onPress}
        />
      </View>
    );
}
