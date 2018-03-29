import React, { Component } from 'react';
import { StyleSheet, View } from 'react-native';
import SubmenuItem from './SubmenuItem';

export default class Submenu extends Component {
  render() {
    let submenu = this.props.menuItems.map(menuItem => (
      <SubmenuItem
        key={menuItem.label}
        label={menuItem.label}
        icon={menuItem.icon}
        onPress={menuItem.onPress}
      />
    ));
    return <View style={styles.menuContainer}>{submenu}</View>;
  }
}

const styles = StyleSheet.create({
  menuContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around'
  }
});
