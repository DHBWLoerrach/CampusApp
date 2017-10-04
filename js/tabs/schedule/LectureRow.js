// @flow
import React, { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import Colors from '../../util/Colors';
import Constants from '../../util/Constants';

import type { Lecture } from '../../util/types';

export default class LectureRow extends Component {
  props: {
    lecture: Lecture
  };

  render() {
    const lecture = this.props.lecture;
    let time = lecture.startTime + ' - ' + lecture.endTime;
    if (lecture.startTime === lecture.endTime) {
      time = 'ganzer Tag';
    }
    return (
      <View style={styles.row}>
        <Text numberOfLines={2} style={styles.title}>
          {lecture.title}
        </Text>
        <Text numberOfLines={1} style={styles.info}>
          {time} {lecture.location ? ' \u2022 ' + lecture.location : ''}
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: Constants.listViewRowPaddingVertical,
    paddingHorizontal: Constants.listViewRowPaddingHorizontal
  },
  title: {
    fontSize: Constants.bigFont
  },
  info: {
    fontSize: Constants.smallFont,
    color: Colors.lightText
  }
});
