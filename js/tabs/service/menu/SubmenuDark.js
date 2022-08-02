import React, { Component } from 'react';
import { View } from 'react-native';
import SubmenuItemDark from './SubmenuItemDark';
import Styles from '../../../Styles/StyleSheet';

export default class SubmenuDark extends Component {
  render() {
    let submenu = this.props.menuItems.map(menuItem => (
      <SubmenuItemDark
        key={menuItem.label}
        label={menuItem.label}
        iconName={menuItem.iconName}
        onPress={menuItem.onPress}
      />
    ));
    return <View style={Styles.Submenu.menuContainer}>{submenu}</View>;
  }
}
