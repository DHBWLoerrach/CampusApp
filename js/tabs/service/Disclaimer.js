// @flow
import React, { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { textDisclaimerIntro, textDisclaimer } from './Texts';

export default class Disclaimer extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Text>{textDisclaimerIntro + textDisclaimer}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    padding: 15
  }
});
