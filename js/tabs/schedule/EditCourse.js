// @flow
import React, { Component } from 'react';
import {
  Alert,
  Button,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { connect } from 'react-redux';

import Colors from '../../util/Colors';
import HeaderIcon from '../../util/HeaderIcon';
import { courseList } from '../../../env.js';

import { clearLectures, fetchLectures } from './redux';

function selectPropsFromStore(store) {
  return {
    course: store.schedule.course
  };
}

class EditCourse extends Component {
  state = { course: this.props.course };

  _onPressClicked(course) {
    if (!course) {
      Alert.alert('Bitte Kursnamen eingeben');
    } else if (courseList.indexOf(course) >= 0) {
      if (course !== this.props.course) {
        this.props.dispatch(clearLectures());
        this.props.dispatch(fetchLectures(course));
      }
      this.props.navigation.goBack();
    } else {
      Alert.alert(
        'Kurs nicht vorhanden',
        `Es gibt keinen Online-Stundenplan für den Kurs ${course}.`
      );
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <Text>
          Für welchen Kurs soll der Vorlesungsplan angezeigt werden?
        </Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            autoCapitalize="characters"
            autoCorrect={false}
            autoFocus={true}
            defaultValue={this.state.course}
            maxLength={15}
            onChangeText={course =>
              this.setState({
                course: course && course.trim().toUpperCase()
              })
            }
          />
          <Button
            title="Kurs anzeigen"
            color={Colors.dhbwRed}
            onPress={() => this._onPressClicked(this.state.course)}
          />
        </View>
        <Text>
          Nicht alle Kurse haben einen Online-Stundenplan. Falls ein
          Kalender fehlt, dann teile uns dies bitte mit, siehe Service --
          Feedback.
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    padding: 15
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10
  },
  input: {
    borderColor: '#CCC',
    borderWidth: StyleSheet.hairlineWidth,
    height: 40,
    width: 140
  }
});

export default connect(selectPropsFromStore)(EditCourse);
