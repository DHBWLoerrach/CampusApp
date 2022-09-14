import React from 'react';
import { View, ScrollView } from 'react-native';
import LectureItem from './LectureItem';
import Styles from '../../Styles/StyleSheet';

export default function DualisDetail({ route }) {
  let lectureItems = [];

  route.params.details.forEach((lecture) => {
    lectureItems.push(
      <LectureItem key={lecture.number} lecture={lecture} />
    );
  });

  return (
    <View style={Styles.DualisDetail.container}>
      <ScrollView style={Styles.DualisDetail.scrollView}>
        <>{lectureItems}</>
      </ScrollView>
    </View>
  );
}