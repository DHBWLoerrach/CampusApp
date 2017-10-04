// @flow
import React, { Component } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableNativeFeedback,
  View
} from 'react-native';

import Colors from './util/Colors';

export default class DrawerItem extends Component {
  props: {
    icon: number,
    isSelected: boolean,
    selectedIcon: number,
    title: string,
    onPress: () => void
  };

  render() {
    const icon = this.props.isSelected
      ? this.props.selectedIcon
      : this.props.icon;
    return (
      <TouchableNativeFeedback onPress={this.props.onPress}>
        <View style={styles.container}>
          <Image style={styles.icon} source={icon} />
          <Text style={styles.title}>{this.props.title}</Text>
        </View>
      </TouchableNativeFeedback>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 50,
    alignItems: 'center',
    paddingHorizontal: 20
  },
  icon: {
    marginRight: 20
  },
  title: {
    fontSize: 17,
    color: Colors.lightText
  }
});
