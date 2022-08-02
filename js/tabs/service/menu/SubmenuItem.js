import React, { Component } from 'react';
import {Text, TouchableOpacity} from 'react-native';

import Styles from '../../../Styles/StyleSheet';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import Color from "../../../Styles/Colors";

const iconSize = 30;

export default class SubmenuItem extends Component {

    render() {
        return (
            <TouchableOpacity style={[Styles.SubmenuItem.container, Styles.General.cardShadow]}
                              activeOpacity={0.7}
                              onPress={this.props.onPress}>
                <FontAwesomeIcon style={Styles.SubmenuItem.icon}
                                    icon={this.props.iconName}
                                 size={iconSize}
                                 color={Color.icon}/>
                <Text style={Styles.SubmenuItem.label}>{this.props.label}</Text>
          </TouchableOpacity>
        );
  }
}
