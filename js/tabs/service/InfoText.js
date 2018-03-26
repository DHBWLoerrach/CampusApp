import React, { Component } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

export default class InfoText extends Component {
  render() {
    return (
      <View style={styles.container}>
        <ScrollView>{this.props.navigation.getParam('text')}</ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white'
  }
});
