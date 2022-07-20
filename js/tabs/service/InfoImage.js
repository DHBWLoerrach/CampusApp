import React, { Component } from 'react';
import { Image } from 'react-native';
import Styles from '../../Styles/StyleSheet';

export default class InfoImage extends Component {
  render() {
    return (
      <Image
        style={Styles.InfoImage.img}
        resizeMode="contain"
        source={require('./img/CampusHangstrasse.jpg')}
      />
    );
  }
}
