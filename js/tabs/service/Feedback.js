// @flow
import React, { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { linkFeedback } from './Links';
import LinksList from './LinksList';
import { textFeedback } from './Texts';

export default class Feedback extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Text>{textFeedback}</Text>
        <LinksList title="" links={[linkFeedback]} />
      </View>
    );
  }
}

var styles = StyleSheet.create({
  container: {
    padding: 15
  }
});
