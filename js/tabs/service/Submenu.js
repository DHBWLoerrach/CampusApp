import React, { Component } from 'react';
import { View } from 'react-native';
import SubmenuItem from './SubmenuItem';
import Styles from '../../Styles/StyleSheet';

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
    return <View style={Styles.Submenu.menuContainer}>{submenu}</View>;
  }
}