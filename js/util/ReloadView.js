import React, { Component } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

import Colors from './Colors';

export default class ReloadView extends Component {
  render() {
    let text = this.props.message;
    if (!text) {
      text =
        'Fehler mit der Internetverbindung. Probiere es später noch einmal.';
    }
    return (
      <View style={styles.center}>
        <Text style={styles.infoText}>{text}</Text>
        <Button
          title={this.props.buttonText}
          color={Colors.dhbwRed}
          onPress={this.props.onPress}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  center: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center'
  },
  infoText: {
    justifyContent: 'center',
    fontSize: 20,
    marginBottom: 15,
    paddingHorizontal: 20
  }
});
