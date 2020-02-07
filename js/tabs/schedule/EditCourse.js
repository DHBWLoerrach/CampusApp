import React, { useCallback, useState } from 'react';
import {
  Alert,
  Button,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { useFocusEffect, useNavigation } from 'react-navigation-hooks';

import Colors from '../../util/Colors';
import { courseList } from '../../../env.js';

import {
  loadCourseFromStore,
  clearLecturesFromStore,
  saveCourseToStore
} from './store';

export default function EditCourse() {
  const [course, setCourse] = useState(null);
  const [currentCourse, setCurrentCourse] = useState(null);
  const { goBack } = useNavigation();

  // when screen is focussed, load current course from store and keep it in separate state
  useFocusEffect(
    useCallback(() => {
      async function loadCourse() {
        const data = await loadCourseFromStore();
        setCourse(data);
        setCurrentCourse(data);
      }
      loadCourse();
    }, [])
  );

  async function onPressClicked() {
    if (!course) {
      Alert.alert('Bitte Kursnamen eingeben');
    } else if (courseList.indexOf(course) >= 0) {
      if (course !== currentCourse) {
        await saveCourseToStore(course);
        await clearLecturesFromStore();
      }
      goBack();
    } else {
      Alert.alert(
        'Kurs nicht vorhanden',
        `Es gibt keinen Online-Stundenplan für den Kurs ${course}.`
      );
    }
  }

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
          defaultValue={course}
          maxLength={15}
          onChangeText={course =>
            setCourse(course && course.trim().toUpperCase())
          }
        />
        <Button
          title="Kurs anzeigen"
          color={Colors.dhbwRed}
          onPress={onPressClicked}
        />
      </View>
      <Text>
        Nicht alle Kurse haben einen Online-Stundenplan. Falls ein Kalender
        fehlt, dann teile uns dies bitte mit, siehe Service -- Feedback.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
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
    color: 'black',
    height: 40,
    width: 140
  }
});
