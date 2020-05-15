import React from "react";
import {Alert, Button, Image, Linking, ScrollView, StyleSheet, Text, View} from "react-native";
import {unixTimeToDateText, unixTimeToTimeText} from "../helper";
import Colors from "../../../util/Colors";
import MapView, {UrlTile} from "react-native-maps";
import MapMarker from "react-native-maps/lib/components/MapMarker";
import ResponsiveImage from "../../../util/ResponsiveImage";

function StuVEventsDetails({route}) {
    const event = route.params.event;

    function openRegisterLink() {
        Linking.canOpenURL(event.registerLink).then(result => {
            if (!result) {
                Alert.alert("Ungültiger Link", "Leider kann der Link nicht geöffnet werden.");
                return;
            }
            Linking.openURL(event.registerLink);
        })
    }

    return (
        <ScrollView>
            {event.images.banner ? <ResponsiveImage image={event.images.banner}/> : null}
            <View style={styles.container}>
                <Text style={styles.headline}>{event.title}</Text>
                <Text style={styles.date}>{unixTimeToDateText(event.date.from)}</Text>
                {event.date.to ? <Text style={styles.date}>{unixTimeToTimeText(event.date.from)} bis {unixTimeToTimeText(event.date.to)} Uhr</Text> :
                    <Text style={styles.date}>{unixTimeToTimeText(event.date.from)} Uhr</Text>
                }
                {event.price !== 0 ? <Text style={styles.date}>Preis: {event.price.toFixed(2)} €</Text> : null }
                <Text style={styles.text}>{event.text}</Text>
                {event.registerLink ?
                    <View style={styles.button}>
                        <Button title="Anmelden" color={Colors.dhbwRed} onPress={openRegisterLink} />
                    </View>
                    : null}
                <MapView
                    mapType={Platform.OS === 'android' ? "none": "standard"}
                    provider={null}
                    initialRegion={{
                        latitude: event.address.latitude,
                        longitude: event.address.longitude,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    }}
                    loadingEnabled={true}
                    style={styles.map}
                >
                    <UrlTile
                        urlTemplate={"https://tile.openstreetmap.org/{z}/{x}/{y}.png"}
                    />
                    <MapMarker
                        title={event.address.name}
                        coordinate={{
                            latitude: event.address.latitude,
                            longitude: event.address.longitude
                        }}
                    />
                </MapView>
            </View>

        </ScrollView>
    )
}
export default StuVEventsDetails;

const styles = StyleSheet.create({
    container: {
        margin: 10
    },
    button: {
      marginTop: 10
    },
    map: {
        width: "100%",
        height: 300,
        marginTop: 10
    },
    headline: {
        fontSize: 24,
        color: "#000",
        fontWeight: 'bold'
    },
    text: {
        color: '#262626'
    },
    date: {
        color: 'black',
        fontWeight: 'bold'
    }
});
