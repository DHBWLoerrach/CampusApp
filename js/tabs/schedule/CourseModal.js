// @flow
'use strict';

import React, { Component } from 'react';
import {
  Alert,
  Button,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import CampusHeader from '../../util/CampusHeader';
import Colors from '../../util/Colors';
import { courseList } from '../../../env.js';

export default class CourseModal extends Component {
  constructor(props) {
    super(props);

    this.state = {course: props.course};
  }

  _onPressClicked(course) {
    if(courseList.indexOf(course) >= 0) {
      this.props.onCourseChange(course);
    }
    else {
      Alert.alert('Kurs nicht vorhanden',
        `Es gibt keinen Online-Stundenplan für den Kurs ${course}.`);
    }
  }

  render() {
    const cancelAction = {
      title: 'Cancel',
      icon: require('./img/close.png'),
      onPress: this.props.onClose,
    };

    return(
      <Modal
        animationType='fade'
        visible={this.props.visible}
        onRequestClose={this.props.onClose}
        >
         <CampusHeader
           title='Kurs auswählen'
           leftActionItem={cancelAction}
         />
        <View style={styles.container}>
          <Text>
            Für welchen Kurs soll der Vorlesungsplan angezeigt werden?
          </Text>
          <View style={styles.inputContainer}>
            <TextInput style={styles.input}
              autoCapitalize="characters"
              autoCorrect={false}
              autoFocus={true}
              defaultValue={this.state.course}
              maxLength={15}
              onChangeText={(course) =>
                this.setState({course: course && course.trim().toUpperCase()})
              }
            />
            <Button title="Kurs anzeigen" color={Colors.dhbwRed}
              onPress={() => this._onPressClicked(this.state.course)}
            />
          </View>
          <Text>
            Nicht alle Kurse haben einen Online-Stundenplan. Falls ein Kalender
            fehlt, dann teile uns dies bitte mit, siehe Service -- Feedback.
          </Text>
        </View>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  input: {
    borderColor: "#CCC",
    borderWidth: StyleSheet.hairlineWidth,
    height: 40,
    width: 140,
  },
});
