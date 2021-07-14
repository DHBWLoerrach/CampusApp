import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ActivityIndicator from '../../util/DHBWActivityIndicator';
import AsyncStorage from '@react-native-community/async-storage';
import Colors from '../../util/Colors';

class DualisStatistics extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      loginFailed: false,
      noContent: false,
      better: null,
      equal: null,
      worse: null,
      failureRate: null,
      error: null,
    };

    this.load = this.load.bind(this);
  }

  componentDidMount() {
    this.focusListener = this.props.navigation.addListener(
      'focus',
      () => this.load(this.props.route.params.id)
    );
  }

  async load(enrollmentId) {
    this.setState({ loading: true });

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
          this.setState({ noContent: true, error: null });
        }

        response.json().then((json) => {
          if (response.status == 500) {
            if (json.message != 'Invalid token') {
              this.setState({ error: json.message, noContent: true });
            } else {
              this.props.navigation.navigate('DualisLogin');
            }
          }

          if (response.status == 200) {
            this.setState({
              better: json.better.replace('.', ','),
              equal: json.equal.replace('.', ','),
              worse: json.worse.replace('.', ','),
              failureRate: json.failureRate.replace('.', ','),
              noContent: false,
              error: null,
            });
          }
        });

        this.setState({ loading: false });
      });
    } catch (ex) {
      this.setState({ error: ex, loading: false });
    }
  }

  render() {
    if (this.state.loading) {
      return (
        <View style={styles.center}>
          <ActivityIndicator />
        </View>
      );
    }

    if (this.state.noContent) {
      return (
        <View style={styles.center}>
          <Text style={styles.message}>
            Die Statistiken zu diesem Modul können nicht erfasst
            werden!
          </Text>
        </View>
      );
    }

    if (this.state.error) {
      return (
        <View style={styles.center}>
          <Text style={styles.message}>{this.state.error}</Text>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <View>
          <Text style={{ fontSize: 22, textAlign: 'center' }}>
            {this.props.route.params.name}
          </Text>
          <View style={styles.percentageBlock}>
            <Text style={styles.text}>
              Besser als Du abgeschnitten haben...
            </Text>
            <Text style={styles.percentage}>
              {this.state.better}%
            </Text>
          </View>

          <View style={styles.percentageBlock}>
            <Text style={styles.text}>
              Gleich gut wie Du abgeschnitten haben...
            </Text>
            <Text style={styles.percentage}>{this.state.equal}%</Text>
          </View>

          <View style={styles.percentageBlock}>
            <Text style={styles.text}>
              Schlechter als Du abgeschnitten haben...
            </Text>
            <Text style={styles.percentage}>{this.state.worse}%</Text>
          </View>

          <View style={styles.percentageBlock}>
            <Text style={styles.text}>
              ...der Studenten Deines Kurses.*
            </Text>
          </View>

          <View style={styles.percentageBlock}>
            <Text style={styles.text}>Durchfallquote:</Text>
            <Text style={styles.percentage}>
              {this.state.failureRate}%
            </Text>
          </View>
        </View>
        <View>
          <Text
            style={{
              fontSize: 10,
              paddingBottom: 5,
              textAlign: 'center',
            }}
          >
            * bei kursübergreifenden Modulen wirst Du natürlich nur
            mit Studenten verglichen, die dieses Modul ebenfalls
            gewählt haben.
          </Text>
        </View>
      </View>
    );
  }
}

export default DualisStatistics;

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
});
