import React, { Component } from 'react';
import { Text, View } from 'react-native';

import Styles from '../../Styles/StyleSheet';

export default class LectureRow extends Component {
  render() {
    const lecture = this.props.lecture;
    let time = lecture.startTime + ' - ' + lecture.endTime;
    if (lecture.startTime === lecture.endTime) {
      time = 'ganzer Tag';
    }
    return (
      <View style={Styles.LectureRow.row}>
        <Text numberOfLines={3} style={Styles.LectureRow.title}>
          {lecture.title}
        </Text>
        <Text numberOfLines={1} style={Styles.LectureRow.info}>
          {time} {lecture.location ? ' \u2022 ' + lecture.location : ''}
        </Text>
      </View>
    );
  }
}