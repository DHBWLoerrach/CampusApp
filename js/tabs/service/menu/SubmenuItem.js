import React, {Component, useContext} from 'react';
import {Text, TouchableOpacity} from 'react-native';

import Styles from '../../../Styles/StyleSheet';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import {ColorSchemeContext} from "../../../context/ColorSchemeContext";

const iconSize = 30;

export default function SubmenuItem(props)
{
    const colorContext = useContext(ColorSchemeContext);
    return (
        <TouchableOpacity style={[Styles.SubmenuItem.container, Styles.General.cardShadow, {backgroundColor: colorContext.colorScheme.card}]}
                          activeOpacity={0.7}
                          onPress={props.onPress}>
            <FontAwesomeIcon style={Styles.SubmenuItem.icon}
                             icon={props.iconName}
                             size={iconSize}
                             color={colorContext.colorScheme.icon}/>
            <Text style={[Styles.SubmenuItem.label, {color: colorContext.colorScheme.text}]}>{props.label}</Text>
        </TouchableOpacity>
    );
}
