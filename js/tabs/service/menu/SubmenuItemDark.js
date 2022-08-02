import React, { Component } from 'react';
import {StyleSheet, Text, TouchableOpacity} from 'react-native';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import Color from "../../../Styles/Colors";

const iconSize = 30;

export default class SubmenuItem extends Component {

    render() {
        return (
            <TouchableOpacity style={[styles.container]}
                              activeOpacity={0.7}
                              onPress={this.props.onPress}>
                <FontAwesomeIcon style={styles.icon}
                                    icon={this.props.iconName}
                                 size={iconSize}
                                 color={Color.darkMode.icon}/>
                <Text style={styles.label}>{this.props.label}</Text>
          </TouchableOpacity>
        );
  }
}

const styles = StyleSheet.create({
    icon: {
        marginBottom: 10,
    },
    container: {
        backgroundColor: Color.darkMode.card,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
        width: 180, //TODO: Set Responsive Size
        marginBottom: 10,
        paddingTop: 10,
        paddingBottom: 10
    },
    label: {
        color: Color.darkMode.text,
        fontSize: 15,
        fontWeight: 'bold',
        textAlign: 'center'
    },
    cardShadow: {
        shadowColor: 'white', // iOS and Android API-Level >= 28
        shadowOffset: {
            // effects iOS only!
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2, // effects iOS only!
        shadowRadius: 4, // effects iOS only!
        elevation: 4, // needed only for Android
    }
});
