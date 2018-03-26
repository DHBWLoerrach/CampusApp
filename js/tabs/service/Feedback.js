// @flow
import React, { Component } from 'react';
import { Image, Linking, StyleSheet, Text, View } from 'react-native';

import { textFeedback } from './Texts';
import ListCellTouchable from '../../util/ListCellTouchable';
import Colors from '../../util/Colors';

export default class Feedback extends Component {
  render() {
    const url =
      'mailto:apps@dhbw-loerrach.de?subject=Campus%20App%20Feedback';
    return (
      <View style={styles.container}>
        <Text>{textFeedback}</Text>
        <ListCellTouchable
          underlayColor={Colors.cellBorder}
          onPress={() => Linking.openURL(url)}
        >
          <View style={styles.row}>
            <Text style={styles.title} numberOfLines={2}>
              Feedback senden
            </Text>
            <Image source={require('./img/chevron-right.png')} />
          </View>
        </ListCellTouchable>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 15
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    height: 50
  },
  title: {
    flex: 1,
    fontSize: 17,
    color: Colors.darkText
  }
});
