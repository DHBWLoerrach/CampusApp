import React, {Component, useContext} from 'react';
import {Image, View} from 'react-native';
import Styles from '../../Styles/StyleSheet';
import {ColorSchemeContext} from "../../context/ColorSchemeContext";

export default function InfoImage(){
  const colorContext = useContext(ColorSchemeContext);
    return (
        <View style={[Styles.InfoImage.container, {backgroundColor: colorContext.colorScheme.background}]}>
          <Image
              style={Styles.InfoImage.img}
              resizeMode="contain"
              source={require('./img/CampusHangstrasse.jpg')}
          />
        </View>
    );
}
