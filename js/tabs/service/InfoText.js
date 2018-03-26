import React, { Component } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

export default class InfoText extends Component {
  render() {
    const { navigation } = this.props;
    const text = navigation
      ? navigation.getParam('text')
      : this.props.text;
    return (
      <View style={styles.container}>
        <ScrollView>{text}</ScrollView>
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
