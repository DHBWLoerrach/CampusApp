import React, {useEffect, useState} from 'react';
import {StyleSheet, FlatList, Image, Text, TouchableOpacity, View} from "react-native";
import {useNavigation} from '@react-navigation/native'
import ReloadView from "../../../util/ReloadView";
import {loadNews, shortString, unixTimeToDateText} from "../helper";
import CommonCell from "../../../util/CommonCell";

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
            data={news}
            onRefresh={refresh}
            refreshing={loading}
            keyExtractor={(item) => 'item' + item.title}
            renderItem={({item}) =>
                <CommonCell
                    title={item.title}
                    details={item.date ? [unixTimeToDateText(item.date)] : []}
                    imageSource={!item.images.overview ? {uri:item.images.overview} : require('../../../img/crowd.png')}
                    description={item.text}
                    onPress={() => navigate(item, navigation)}
                />
            }
        />
    );
}
export default StuVNews;
