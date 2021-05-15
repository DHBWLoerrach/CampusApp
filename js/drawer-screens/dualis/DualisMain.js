import React from 'react';
import { View, Text, Button, StatusBar, Platform, StyleSheet } from 'react-native';
import Colors from '../../util/Colors';


const DualisMain = () => {
    return (
        <View style={styles.container}>
            <Text>DualisMain</Text>
        </View>
    );
};

export default DualisMain;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    }
});