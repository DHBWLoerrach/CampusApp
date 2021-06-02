import React from 'react';
import { View, Button, Image, StatusBar, Platform, StyleSheet, TouchableOpacity } from 'react-native';
import { Caption, Paragraph, Drawer, Text} from 'react-native-paper';
import Colors from '../../util/Colors';


const DualisIntro = ({navigation}) => {
    return (
        <View style={styles.container}>
            <Image
                style={styles.dualisImage}
                source={require('../../img/dualis-intro.png')}
            />
            <Caption style={styles.caption}>Alle Deine Noten an einem Ort!</Caption>
            <Paragraph style={styles.paragraph}>Die neue Dualis-Funktion in der DHBW Campus App erlaubt es Dir jederzeit, auch unterwegs, einfach Deine Noten abzurufen.</Paragraph>
            <Caption style={styles.caption}>Vergleiche Dich mit anderen!</Caption>
            <Paragraph style={styles.paragraph}>Du kannst Dir den prozentualen Anteil an Studenten in Deinem Kurs anzeigen lassen, die in einem Modul besser, gleich oder schlechter abgeschnitten haben.</Paragraph>
            <TouchableOpacity style={styles.dhbwButton} onPress={() => {navigation.navigate("DualisLogin")}}>
                <Text style={{ color: "white", margin: 20 }}>Anmelden</Text>
            </TouchableOpacity>
        </View>
    );
};

export default DualisIntro;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center"
    },
    caption: {
        fontSize: 14,
        marginTop: 3,
        fontWeight: 'bold'
    },
    paragraph: {
        fontSize: 14,
        lineHeight: 14,
        paddingLeft: "10%",
        paddingRight: "10%",
        textAlign: "center",
        marginBottom: 40
    },
    dualisImage: {
        flex: 1,
        width: "60%",
        height: undefined,
        resizeMode: "contain"
    },
    dhbwButton: {
        width: "100%",
        backgroundColor: Colors.dhbwRed,
        alignItems: "center"
    }
});