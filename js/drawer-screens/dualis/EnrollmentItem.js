import React from 'react';
import { View, Text, Button, StatusBar, Platform, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import Colors from '../../util/Colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LectureItem from './LectureItem';


class EnrollmentItem extends React.Component {
    constructor(props){
        super(props)
    }

    render() {

        {/*let lectureItems = <></>;
        this.props.enrollment.moduleResult.lectureResults.forEach(lecture => {
            lectureItems += <LectureItem lecture={lecture} />
        });*/}

        return (
            <View style={styles.container}>
                <View>
                    <Text style={{ fontSize: 20 }}>{this.props.enrollment.moduleResult[0].name}</Text>
                    <Text>Modulnummer: {this.props.enrollment.moduleResult[0].number}</Text>
                    <Text>Note: {this.props.enrollment.grade}</Text>
                    <Text>Credits: {this.props.enrollment.moduleResult[0].credits}</Text>
                    <Text>Semester: {this.props.enrollment.semester}</Text>
                    <Text>Status: {this.props.enrollment.status}</Text>
                </View>
                <View style={styles.iconBar}>
                    <TouchableOpacity onPress={() => {this.props.navigation.navigate("DualisDetail", {details: this.props.enrollment.moduleResult[0].lectureResults})}}>
                        <Icon
                            name="book-search"
                            color={Colors.dhbwRed}
                            size={50}
                        />
                    </TouchableOpacity>
                    <Icon
                        name="chart-areaspline"
                        color={Colors.dhbwRed}
                        size={50}
                    />
                </View>
            </View>
        );
    }

}

export default EnrollmentItem;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        backgroundColor: Colors.lightGray,
        marginBottom: 10,
        marginTop: 20,
        padding: 10,
        borderRadius: 10
    },
    iconBar: {
        justifyContent: "space-between"
    }
});