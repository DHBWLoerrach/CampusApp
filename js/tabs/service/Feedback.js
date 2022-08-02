import React, { Component } from 'react';
import { Linking, Text, View } from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

import { textFeedback } from './Texts';
import ListCellTouchable from '../../util/ListCellTouchable';
import Colors from '../../Styles/Colors';
import Styles from '../../Styles/StyleSheet';

export default class Feedback extends Component {
  render() {
    const url =
      'mailto:apps@dhbw-loerrach.de?subject=Campus%20App%20Feedback';
    return (
      <View style={Styles.Feedback.container}>
        <Text>{textFeedback}</Text>
        <ListCellTouchable
          underlayColor={Colors.cellBorder}
          onPress={() => Linking.openURL(url)}
        >
          <View style={Styles.Feedback.row}>
            <Text style={Styles.Feedback.title} numberOfLines={2}>
              Feedback senden
            </Text>
            <MaterialIcon name="chevron-right" size={24} />
          </View>
        </ListCellTouchable>
      </View>
    );
  }
}
