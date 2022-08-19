import React, {useContext} from 'react';
import { Text, View } from 'react-native';

import Styles from '../../Styles/StyleSheet';
import {ColorSchemeContext} from "../../context/ColorSchemeContext";

export default function LectureRow(props) {
    const lecture = props.lecture;
    const colorContext = useContext(ColorSchemeContext);
    let time = lecture.startTime + ' - ' + lecture.endTime;
    if (lecture.startTime === lecture.endTime) {
      time = 'ganzer Tag';
    }
    return (
      <View style={[Styles.LectureRow.row, {backgroundColor: colorContext.colorScheme.background}]}>
        <Text numberOfLines={3} style={[Styles.LectureRow.title, {color: colorContext.colorScheme.text}]}>
          {lecture.title}
        </Text>
        <Text numberOfLines={1} style={[Styles.LectureRow.info, {color: colorContext.colorScheme.text}]}>
          {time} {lecture.location ? ' \u2022 ' + lecture.location : ''}
        </Text>
      </View>
    );
}
