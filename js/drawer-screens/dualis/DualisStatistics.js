import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import ActivityIndicator from '../../util/DHBWActivityIndicator';
import AsyncStorage from '@react-native-community/async-storage';
import Styles from '../../Styles/StyleSheet';

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
      <View style={Styles.DualisStatistics.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (noContent) {
    return (
      <View style={Styles.DualisStatistics.center}>
        <Text style={Styles.DualisStatistics.message}>
          Die Statistiken zu diesem Modul können nicht erfasst werden!
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={Styles.DualisStatistics.center}>
        <Text style={Styles.DualisStatistics.message}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={Styles.DualisStatistics.container}>
      <View>
        <Text style={Styles.DualisStatistics.name}>{route.params.name}</Text>
        <View style={Styles.DualisStatistics.percentageBlock}>
          <Text style={Styles.DualisStatistics.text}>
            Besser als Du abgeschnitten haben...
          </Text>
          <Text style={Styles.DualisStatistics.percentage}>{better}%</Text>
        </View>

        <View style={Styles.DualisStatistics.percentageBlock}>
          <Text style={Styles.DualisStatistics.text}>
            Gleich gut wie Du abgeschnitten haben...
          </Text>
          <Text style={Styles.DualisStatistics.percentage}>{equal}%</Text>
        </View>

        <View style={Styles.DualisStatistics.percentageBlock}>
          <Text style={Styles.DualisStatistics.text}>
            Schlechter als Du abgeschnitten haben...
          </Text>
          <Text style={Styles.DualisStatistics.percentage}>{worse}%</Text>
        </View>

        <View style={Styles.DualisStatistics.percentageBlock}>
          <Text style={Styles.DualisStatistics.text}>
            ...der Studenten Deines Kurses.*
          </Text>
        </View>

        <View style={Styles.DualisStatistics.percentageBlock}>
          <Text style={Styles.DualisStatistics.text}>Durchfallquote:</Text>
          <Text style={Styles.DualisStatistics.percentage}>{failureRate}%</Text>
        </View>
      </View>
      <View>
        <Text style={Styles.DualisStatistics.note}>
          * bei kursübergreifenden Modulen wirst Du natürlich nur mit
          Studenten verglichen, die dieses Modul ebenfalls gewählt
          haben.
        </Text>
      </View>
    </View>
  );
}