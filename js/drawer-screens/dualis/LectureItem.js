import React from 'react';
import { View, Text, Button, StatusBar, Platform, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import Colors from '../../util/Colors';


class LectureItem extends React.Component {
    constructor(props){
        super(props)
    }

    render() {

        let presence = "bestanden";
        if (!this.props.lecture.presence) {
            presence = "nicht bestanden";
        }

        return(
            <View>
                <div style={{ whiteSpace: 'pre-line' }}>
                    Vorlesung: {this.props.lecture.name} \n
                    Vorlesungsnummer: {this.props.lecture.name} \n
                    Leistungsart: {this.props.lecture.examType} \n
                    Note: {this.props.lecture.grade} \n
                    Gewichtung: {this.props.lecture.weighting} \n
                    Anwesenheitskontrolle: {presence}
                </div>
            </View>
        );
    }

}

export default LectureItem;