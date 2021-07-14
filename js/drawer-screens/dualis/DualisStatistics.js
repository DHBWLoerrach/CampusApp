import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ActivityIndicator from '../../util/DHBWActivityIndicator';
import AsyncStorage from '@react-native-community/async-storage';
import Colors from '../../util/Colors';

export default function DualisStatistics({ route, navigation }) {
  const [loading, setLoading] = useState(false);
  const [noContent, setNoContent] = useState(false);
  const [better, setBetter] = useState(null);
  const [equal, setEqual] = useState(null);
  const [worse, setWorse] = useState(null);
  const [failureRate, setFailureRate] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    focusListener = navigation.addListener('focus', () =>
      load(route.params.id)
    );
  }, []);

  async function load(enrollmentId) {
    setLoading(true);

    const token = await AsyncStorage.getItem('dualisToken');

    try {
      fetch(
        'http://134.255.237.241/student/module/statistics/?enrollmentId=' +
          enrollmentId,
        {
          method: 'GET',
          headers: new Headers({
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'x-api-key': `${token}`,
          }),
          mode: 'cors',
        }
      ).then((response) => {
        if (response.status == 204) {
          setNoContent(true);
          setError(null);
        }

        response.json().then((json) => {
          if (response.status == 500) {
            if (json.message != 'Invalid token') {
              setError(json.message);
              setNoContent(true);
            } else {
              navigation.navigate('DualisLogin');
            }
          }

          if (response.status == 200) {
            setBetter(json.better.replace('.', ','));
            setEqual(json.equal.replace('.', ','));
            setWorse(json.worse.replace('.', ','));
            setFailureRate(json.failureRate.replace('.', ','));
            setNoContent(false);
            setError(null);
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

  if (noContent) {
    return (
      <View style={styles.center}>
        <Text style={styles.message}>
          Die Statistiken zu diesem Modul können nicht erfasst werden!
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.message}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.name}>{route.params.name}</Text>
        <View style={styles.percentageBlock}>
          <Text style={styles.text}>
            Besser als Du abgeschnitten haben...
          </Text>
          <Text style={styles.percentage}>{better}%</Text>
        </View>

        <View style={styles.percentageBlock}>
          <Text style={styles.text}>
            Gleich gut wie Du abgeschnitten haben...
          </Text>
          <Text style={styles.percentage}>{equal}%</Text>
        </View>

        <View style={styles.percentageBlock}>
          <Text style={styles.text}>
            Schlechter als Du abgeschnitten haben...
          </Text>
          <Text style={styles.percentage}>{worse}%</Text>
        </View>

        <View style={styles.percentageBlock}>
          <Text style={styles.text}>
            ...der Studenten Deines Kurses.*
          </Text>
        </View>

        <View style={styles.percentageBlock}>
          <Text style={styles.text}>Durchfallquote:</Text>
          <Text style={styles.percentage}>{failureRate}%</Text>
        </View>
      </View>
      <View>
        <Text style={styles.note}>
          * bei kursübergreifenden Modulen wirst Du natürlich nur mit
          Studenten verglichen, die dieses Modul ebenfalls gewählt
          haben.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 30,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 22,
    textAlign: 'center',
  },
  message: {
    fontSize: 18,
    color: Colors.dhbwRed,
    textAlign: 'center',
  },
  text: {
    fontSize: 16,
    color: Colors.dhbwGray,
    textAlign: 'center',
  },
  percentageBlock: {
    alignItems: 'center',
    marginTop: 20,
  },
  percentage: {
    fontSize: 26,
    color: Colors.dhbwRed,
  },
  scrollView: {
    marginHorizontal: 20,
  },
  note: {
    fontSize: 10,
    paddingBottom: 5,
    textAlign: 'center',
  },
});
