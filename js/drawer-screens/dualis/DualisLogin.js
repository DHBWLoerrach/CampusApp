import React from 'react';
import { View, Text, Button, StatusBar, Platform, StyleSheet } from 'react-native';
import Colors from '../../util/Colors';


const DualisLogin = () => {
    return (
        <View style={styles.container}>
            <Text>DualisLogin</Text>
        </View>
    );
};

export default DualisLogin;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    }
});