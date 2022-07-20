import React, { Component } from 'react';
import { Button, Text, View } from 'react-native';

import Colors from './Colors';
import Styles from '../Styles/StyleSheet';

export default class ReloadView extends Component {
  render() {
    let text = this.props.message;
    if (!text) {
      text =
        'Fehler mit der Internetverbindung. Probiere es später noch einmal.';
    }
    return (
      <View style={Styles.ReloadView.center}>
        <Text style={Styles.ReloadView.infoText}>{text}</Text>
        <Button
          title={this.props.buttonText}
          color={Colors.dhbwRed}
          onPress={this.props.onPress}
        />
      </View>
    );
  }
}
