import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import ActivityIndicator from '../../util/DHBWActivityIndicator';
import AsyncStorage from '@react-native-community/async-storage';
import Colors from '../../util/Colors';
import EnrollmentItem from './EnrollmentItem';
import { Picker } from '@react-native-picker/picker';

export default function DualisMain({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [enrollments, setEnrollments] = useState([]);
  const [noContent, setNoContent] = useState(false);
  const [error, setError] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState('Alle');
  const [selectableOptions, setSelectableOptions] = useState([]);

  useEffect(() => {
    let year = new Date().getFullYear();
    const options = [];
    for (let i = 0; i < 4; i++) {
      options.push('WiSe ' + (year - i));
      options.push('SoSe ' + (year - i));
    }
    setSelectableOptions(options);

    getPerformances(null, null);
  }, []);

  function getSelectedSemester(value) {
    if (value != 'Alle') {
      setSelectedSemester(value);
      var num = value.match(/\d/g);
      getPerformances(value.includes('WiSe'), num.join(''));
    } else {
      setSelectedSemester('Alle');
      getPerformances(null, null);
    }
  }

  async function getPerformances(isWintersemester, year) {
    setLoading(true);

    const token = await AsyncStorage.getItem('dualisToken');
    let url = 'http://134.255.237.241/student/performance/?';

    if (isWintersemester != null) {
      url += '&isWintersemester=' + isWintersemester;
    }

    if (year != null) {
      url += '&year=' + year;
    }

    try {
      fetch(url, {
        method: 'GET',
        headers: new Headers({
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'x-api-key': `${token}`,
        }),
        mode: 'cors',
      }).then((response) => {
        if (response.status == 204) {
          setNoContent(true);
          setError(null);
          setEnrollments([]);
        }

        response.json().then((json) => {
          if (response.status == 500) {
            if (json.message != 'Invalid token') {
              setNoContent(true);
              setError(json.message);
              setEnrollments([]);
            } else {
              navigation.navigate('DualisLogin');
            }
          }

          if (response.status == 200) {
            setNoContent(false);
            setError(null);
            setEnrollments(json.enrollments);
          }
        });
      });
    } catch (ex) {
      setError(ex);
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  let enrollmentItems = [];

  enrollments.forEach((enrollment) => {
    enrollmentItems.push(
      <EnrollmentItem
        key={enrollment.id}
        enrollment={enrollment}
        navigation={navigation}
      />
    );
  });

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Picker
          selectedValue={selectedSemester}
          onValueChange={(itemValue) =>
            getSelectedSemester(itemValue)
          }
        >
          {selectableOptions.map((opt) => (
            <Picker.Item key={opt} label={opt} value={opt} />
          ))}

          <Picker.Item key="Alle" label="Alle" value="Alle" />
        </Picker>

        <>{enrollmentItems}</>

        {error && (
          <View style={styles.center}>
            <Text style={styles.message}>{error}</Text>
          </View>
        )}

        {noContent && (
          <View style={styles.center}>
            <Text style={styles.message}>Kein Inhalt vorhanden</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    fontSize: 18,
    color: Colors.dhbwRed,
    textAlign: 'center',
  },
  scrollView: {
    marginHorizontal: 20,
  },
});
