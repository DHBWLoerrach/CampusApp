import React, {useCallback, useContext, useState} from 'react';
import {
  Alert,
  Button,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';

import { courseList } from '../../../env.js';
import Styles from '../../Styles/StyleSheet';

import {
  loadCourseFromStore,
  clearLecturesFromStore,
  saveCourseToStore,
} from './store';
import {ColorSchemeContext} from "../../context/ColorSchemeContext";

export default function EditCourse() {
  const [course, setCourse] = useState('');
  const [currentCourse, setCurrentCourse] = useState(null);
  const colorContext = useContext(ColorSchemeContext);
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
    const newCourse = course && course.toUpperCase();
    if (!newCourse) {
      Alert.alert('Bitte Kursnamen eingeben');
    } else if (courseList.indexOf(newCourse) >= 0) {
      if (newCourse !== currentCourse) {
        await saveCourseToStore(newCourse);
        await clearLecturesFromStore();
      }
      goBack();
    } else {
      Alert.alert(
        'Kurs nicht vorhanden',
        `Es gibt keinen Online-Stundenplan für den Kurs ${newCourse}.`
      );
    }
  }

  return (
    <View style={[Styles.EditCourse.container, {backgroundColor: colorContext.colorScheme.background}]}>
      <Text style={{color: colorContext.colorScheme.text}}>
        Für welchen Kurs soll der Vorlesungsplan angezeigt werden?
      </Text>
      <View style={Styles.EditCourse.inputContainer}>
        <TextInput
          style={[Styles.EditCourse.input, {color: colorContext.colorScheme.text}]}
          autoCapitalize="characters"
          autoCorrect={false}
          autoFocus={true}
          defaultValue={course}
          maxLength={15}
          onChangeText={(course) => setCourse(course.trim())}
        />
        <Button
          title="Kurs anzeigen"
          color={colorContext.colorScheme.dhbwRed}
          onPress={onPressClicked}
        />
      </View>
      <Text style={{color: colorContext.colorScheme.text}}>
        Nicht alle Kurse haben einen Online-Stundenplan. Falls ein
        Kalender fehlt, dann teile uns dies bitte mit, siehe Service
        -- Feedback.
      </Text>
    </View>
  );
}
