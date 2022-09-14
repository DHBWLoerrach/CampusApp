import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import Colors from '../../Styles/Colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Styles from '../../Styles/StyleSheet';

export default function EnrollmentItem({ navigation, enrollment }) {
  return (
    <View style={Styles.EnrollmentItem.container}>
      <View>
        <Text style={Styles.EnrollmentItem.name}>
          {enrollment.moduleResult[0].name}
        </Text>
        <Text>Modulnummer: {enrollment.moduleResult[0].number}</Text>
        <Text>Note: {enrollment.grade}</Text>
        <Text>Credits: {enrollment.moduleResult[0].credits}</Text>
        <Text>Semester: {enrollment.semester}</Text>
        <Text>Status: {enrollment.status}</Text>
      </View>
      <View style={Styles.EnrollmentItem.iconBar}>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('DualisDetail', {
              details: enrollment.moduleResult[0].lectureResults,
            });
          }}
        >
          <Icon name="book-search" color={Colors.dhbwRed} size={50} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('DualisStatistics', {
              id: enrollment.id,
              name: enrollment.moduleResult[0].name,
            });
          }}
        >
          <Icon
            name="chart-areaspline"
            color={Colors.dhbwRed}
            size={50}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}
