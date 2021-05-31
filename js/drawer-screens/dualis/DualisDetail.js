import React from 'react';
import { View, Text, Button, StatusBar, Platform, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import Colors from '../../util/Colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LectureItem from './LectureItem';


class DualisDetail extends React.Component {
    constructor(props){
        super(props)
    }

    render() {
        let lectureItems = [];
        
        this.props.route.params.details.forEach(lecture => {
            lectureItems.push(<LectureItem lecture={lecture} />);
        });

        return (
            <View style={styles.container}>
                <ScrollView style={styles.scrollView}>
                    <>{lectureItems}</>
                </ScrollView>
            </View>
        );
    }
}

export default DualisDetail;

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    scrollView: {
        marginHorizontal: 20
    }
});