import React from 'react';
import { View, Text, Button, StatusBar, Platform, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import Colors from '../../util/Colors';
import LectureItem from './LectureItem';


class EnrollmentItem extends React.Component {
    constructor(props){
        super(props)
    }

    render() {

        let lectureItems = <></>;
        this.props.enrollment.moduleResult.lectureResults.forEach(lecture => {
            lectureItems += <LectureItem lecture={lecture} />
        });

        return(
            <View style={styles.container}>
                <div style={{ whiteSpace: 'pre-line' }}>
                    Modul: {this.props.enrollment.moduleResult.name} \n
                    Modulnummer: {this.props.enrollment.moduleResult.number} \n
                    Note: {this.props.enrollment.grade} \n
                    Credits: {this.props.enrollment.moduleResult.credits} \n
                    Semester: {this.props.enrollment.semester} \n
                    Status: {this.props.enrollment.status}
                </div>

                <>{lectureItems}</>
            </View>
        );
    }

}

export default EnrollmentItem;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.lightGray
    }
});