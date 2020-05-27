import React from "react";
import {Alert, Button, Image, Linking, ScrollView, StyleSheet, Text, View, requireNativeComponent} from "react-native";
import {unixTimeToDateText, unixTimeToTimeText} from "../helper";
import Colors from "../../../util/Colors";
import MapView, {UrlTile} from "react-native-maps";
import MapMarker from "react-native-maps/lib/components/MapMarker";
import ResponsiveImage from "../../../util/ResponsiveImage";
import AndroidMap from "../../../util/AndroidMap";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import {add} from "react-native-reanimated";

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

    function openGMaps(latitude, longitude, name) {
        Linking.openURL("geo:" + latitude + "," + longitude + "?q=" + latitude + "," + longitude);
    }

    function displayMap(address) {
        if (Platform.OS === 'android') {
            return (
                <View style={styles.mapContainer}>
                    <AndroidMap location={{longitude: address.longitude, latitude: address.latitude}} zoom={19} style={styles.map}/>
                    <MaterialCommunityIcons
                        name={"google-maps"}
                        size={32}
                        style={styles.mapButton}
                        onPress={() => openGMaps(address.latitude, address.longitude, address.name)}
                    />
                    <Text style={styles.copyrightText}>© OpenStreetMap contributors</Text>
                </View>
            )
        } else {
            return (
                <MapView
                    initialRegion={{
                        latitude: address.latitude,
                        longitude: address.longitude,
                        latitudeDelta: 0.003,
                        longitudeDelta: 0.003,
                    }}
                    style={styles.map}
                >
                    <MapMarker
                        title={address.name}
                        coordinate={{
                            latitude: address.latitude,
                            longitude: address.longitude
                        }}
                    />
                </MapView>
            );
        }
    }

    return (
        <View style={{flex: 1, flexDirection: 'column'}}>
            <ScrollView style={styles.scrollView}>
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

                </View>
            </ScrollView>
            {displayMap(event.address)}
        </View>
    )
}
export default StuVEventsDetails;

const styles = StyleSheet.create({
    scrollView: {
        zIndex: 2,
        flex: 1,
        flexGrow: 1.5,
        backgroundColor: "white"
    },
    container: {
        padding: 10,
    },
    copyrightText: {
        position: 'absolute',
        top: 0,
        right: 0,
        fontSize: 10,
        margin: 3
    },
    button: {
      marginTop: 10
    },
    map: {
        flex: 1,
        zIndex: -1,
        //backgroundColor: 'green'
    },
    mapContainer: {
        flex: 1,
    },
    mapButton: {
        position: 'absolute',
        top: 0,
        left: 0,
        margin: 3
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
