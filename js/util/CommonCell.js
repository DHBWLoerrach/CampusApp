import React from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import Colors from "../util/Colors";
import {shortString} from "../tabs/stuv/helper";

function CommonCell ({imageSource, title, details = [], description, onPress}) {
    return (
        <TouchableOpacity  style={styles.entry} onPress={onPress}>
            <View style={{flex: 1, justifyContent: 'space-around', flexDirection: 'row'}}>
                <Image source={imageSource} style={styles.image}/>
                <View style={{flex: 2}}>
                    <Text style={styles.headline}>{title}</Text>
                    {details.map(detail => <Text style={styles.details}>{detail}</Text>)}
                    <Text style={styles.text}>{shortString(description, 90)}</Text>
                </View>
            </View>
        </TouchableOpacity>
    )
}

export default CommonCell;

const styles = StyleSheet.create({
    entry: {
        backgroundColor: Colors.veryLightGray, //'rgba(246,23,28, 0.3)',
        borderRadius: 10,
        padding: 10,
        marginTop: 10,
        marginLeft: 10,
        marginRight: 10
    },
    image: {
        marginTop: 'auto',
        marginBottom: 'auto',
        height: "100%",
        flex: 1,
        marginRight: 10,
        resizeMode: 'contain',
    },
    headline: {
        fontSize: 18,
        color: Colors.dhbwRed,
        fontWeight: 'bold'
    },
    text: {
        color: '#262626'
    },
    details: {
        color: 'black',
        fontWeight: 'bold'
    }
});
