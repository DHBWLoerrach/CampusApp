import React, {useState, useEffect} from "react";
import {FlatList, SectionList, Image, StyleSheet, View, Text} from "react-native";
import TabbedSwipeView from "../../util/TabbedSwipeView.ios";
import {feeds} from "../../util/Constants";
import ReloadView from "../../util/ReloadView";
import DayHeader from "../../util/DayHeader";
import {loadEvents, loadNews} from "./helper";
import StuVEvents from "./StuVEvents";

function getPages() {
    return [{title: "StuV-News", content: <View/>}, {title: "StuV-Events", content:  <StuVEvents/>}];
}

function StuVScreen() {

    return (
        <View style={styles.container}>
            <TabbedSwipeView
                pages={getPages()}
            />
        </View>
    );
}

export default StuVScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    }
});
