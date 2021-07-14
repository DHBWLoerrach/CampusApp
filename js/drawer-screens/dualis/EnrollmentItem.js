import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Colors from '../../util/Colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function EnrollmentItem({ navigation, enrollment }) {
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.name}>
          {enrollment.moduleResult[0].name}
        </Text>
        <Text>Modulnummer: {enrollment.moduleResult[0].number}</Text>
        <Text>Note: {enrollment.grade}</Text>
        <Text>Credits: {enrollment.moduleResult[0].credits}</Text>
        <Text>Semester: {enrollment.semester}</Text>
        <Text>Status: {enrollment.status}</Text>
      </View>
      <View style={styles.iconBar}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.lightGray,
    marginBottom: 10,
    marginTop: 20,
    padding: 10,
    borderRadius: 10,
  },
  name: {
    fontSize: 20,
  },
  iconBar: {
    justifyContent: 'space-between',
  },
});
