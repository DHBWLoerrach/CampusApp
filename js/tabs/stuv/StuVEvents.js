import React, {useEffect, useState} from 'react';
import {ActivityIndicator, FlatList, Image, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {loadEvents, shortString, unixTimeToDateText, unixTimeToTimeText} from "./helper";
import ReloadView from "../../util/ReloadView";
import { useNavigation } from '@react-navigation/native';
import {color} from "react-native-reanimated";

function StuVEvents() {
    const [loading, setLoading] = useState(true);
    const [events, setEvents] = useState(null);
    const navigation = useNavigation();

    useEffect(() => {
        loadData();
    }, []);

    function loadData() {
        loadEvents().then((events) => {
            setEvents(events);
            setLoading(false);
        })
    }

    function refresh() {
        setLoading(true);
        loadData();
    }

    function navigate(event, navigation) {
        navigation.navigate("StuVEventDetails", {event})
    }

    if (events == null) {
        return <ReloadView buttonText="News laden" onPress={refresh} />;
    }

    return (
        <FlatList
            style={styles.container}
            data={events}
            onRefresh={refresh}
            refreshing={loading}
            keyExtractor={(item) => 'item' + item.title}
            renderItem={({item}) =>
                <TouchableOpacity  style={styles.entry} onPress={() => navigate(item, navigation)}>
                    <View style={{flex: 1, justifyContent: 'space-around', flexDirection: 'row'}}>
                        <Image source={{uri: item.images.overview}} style={styles.image}/>
                        <View style={{flex: 2}}>
                            <Text style={styles.headline}>{item.title} {item.price === 0 ? '' : '(€)'}</Text>
                            <Text style={styles.date}>{unixTimeToDateText(item.date.from)}</Text>
                            {item.date.to ? <Text style={styles.date}>{unixTimeToTimeText(item.date.from)} bis {unixTimeToTimeText(item.date.to)} Uhr</Text> :
                                <Text style={styles.date}>{unixTimeToTimeText(item.date.from)} Uhr</Text>
                            }
                            <Text style={styles.text}>{shortString(item.text, 90)}</Text>
                        </View>
                    </View>
                </TouchableOpacity>
            }
        />
    )
}
export default StuVEvents;

const styles = StyleSheet.create({
    container: {
        margin: 10
    },
    entry: {
        backgroundColor: 'rgba(246,23,28, 0.3)',
        borderRadius: 10,
        padding: 10,
        marginBottom: 10
    },
    image: {
        flex: 1,
        marginRight: 10,
        resizeMode: 'contain',
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
