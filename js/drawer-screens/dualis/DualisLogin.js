import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const DualisLogin = () => {
    return (
        <View style={styles.container}>
            <Text>Dualis Login</Text>
            <Button
                title="Anmelden"
                onPress={() => {}}
            />
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