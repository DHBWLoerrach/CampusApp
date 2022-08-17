import React, {Component, useContext} from 'react';
import { View } from 'react-native';
import SubmenuItem from './SubmenuItem';
import Styles from '../../../Styles/StyleSheet';
import {ColorSchemeContext} from "../../../context/ColorSchemeContext";

export default function Submenu(props) {
  const colorContext = useContext(ColorSchemeContext);

    let submenu = props.menuItems.map(menuItem => (
      <SubmenuItem
        key={menuItem.label}
        label={menuItem.label}
        iconName={menuItem.iconName}
        onPress={menuItem.onPress}
      />
    ));
    return <View style={[Styles.Submenu.menuContainer, {backgroundColor: colorContext.colorScheme.background}]}>{submenu}</View>;
}
