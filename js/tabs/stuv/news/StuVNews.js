import React, {useEffect, useState} from 'react';
import {StyleSheet, FlatList, Image, Text, TouchableOpacity, View} from "react-native";
import {useNavigation} from '@react-navigation/native'
import ReloadView from "../../../util/ReloadView";
import {loadNews, shortString, unixTimeToDateText, unixTimeToTimeText} from "../helper";

function StuVNews() {

    const [news, setNews] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();

    useEffect(() => {
        loadData()
    }, []);

    function refresh() {
        setLoading(true);
        loadData();
    }

    function loadData() {
        loadNews().then(news => {
            setNews(news);
            setLoading(false);
        })
    }

    function navigate(news, navigation) {
        navigation.navigate('StuVNewsDetails', {news});
    }

    if (news == null) {
        return <ReloadView buttonText="News laden" onPress={refresh} />;
    }

    return (
        <FlatList
            style={styles.container}
            data={news}
            onRefresh={refresh}
            refreshing={loading}
            keyExtractor={(item) => 'item' + item.title}
            renderItem={({item}) =>
                <TouchableOpacity  style={styles.entry} onPress={() => navigate(item, navigation)}>
                    <View style={{flex: 1, justifyContent: 'space-around', flexDirection: 'row'}}>
                        <Image source={{uri: item.images.overview}} style={styles.image}/>
                        <View style={{flex: 2}}>
                            <Text style={styles.headline}>{item.title}</Text>
                            <Text style={styles.text}>{shortString(item.text, 90)}</Text>
                        </View>
                    </View>
                </TouchableOpacity>
            }
        />
    );
}
export default StuVNews;

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
