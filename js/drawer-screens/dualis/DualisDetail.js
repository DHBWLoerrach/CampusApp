import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import LectureItem from './LectureItem';


class DualisDetail extends React.Component {
    constructor(props){
        super(props)
    }

    render() {

        let lectureItems = [];

        this.props.route.params.details.forEach(lecture => {
            lectureItems.push(<LectureItem key={lecture.number} lecture={lecture} />);
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