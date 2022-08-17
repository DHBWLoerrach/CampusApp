import React, {Component, useContext} from 'react';
import { Text, View } from 'react-native';

import Styles from '../Styles/StyleSheet';
import {ColorSchemeContext} from "../context/ColorSchemeContext";

export default function DayHeader(props){
  const colorContext = useContext(ColorSchemeContext);
    return (
      <View style={[Styles.DayHeader.header, {backgroundColor: colorContext.colorScheme.card}]}>
        <Text style={{color: colorContext.colorScheme.dhbwRed}}>{props.title}</Text>
      </View>
    );
}
