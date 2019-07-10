import React, { Component } from 'react';
import { Dimensions, Image, StyleSheet } from 'react-native';

export default class InfoImage extends Component {
  render() {
    return (
      <Image
        style={styles.img}
        resizeMode="contain"
        source={require('./img/CampusHangstrasse.jpg')}
      />
    );
  }
}

const width = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white'
  },
  img: {
    width: width,
    height: width,
    marginBottom: 2
  }
});
