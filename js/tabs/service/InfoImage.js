import React, {Component, useContext} from 'react';
import { Image } from 'react-native';
import Styles from '../../Styles/StyleSheet';
import {ColorSchemeContext} from "../../context/ColorSchemeContext";

export default function InfoImage(){
  const colorContext = useContext(ColorSchemeContext);
    return (
      <Image
        style={[Styles.InfoImage.img, {backgroundColor: colorContext.colorScheme.background}]}
        resizeMode="contain"
        source={require('./img/CampusHangstrasse.jpg')}
      />
    );
}
