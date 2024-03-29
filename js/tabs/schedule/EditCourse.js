import { useCallback, useContext, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
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
  loadRecentCoursesFromStore,
  saveRecentCoursesToStore,
} from './store';
import { ColorSchemeContext } from '../../context/ColorSchemeContext';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';

export default function EditCourse() {
  const [course, setCourse] = useState('');
  const [recentCourses, setRecentCourses] = useState([]);
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
      async function loadRecentCourses() {
        const data = await loadRecentCoursesFromStore();
        data && setRecentCourses(data);
      }
      loadCourse();
      loadRecentCourses();
    }, [])
  );

  async function onPressClicked({ listItem }) {
    let newCourse;
    if (listItem) {
      newCourse = listItem;
    } else {
      newCourse = course && course.toUpperCase();
    }
    if (!newCourse) {
      Alert.alert('Bitte Kursnamen eingeben');
    } else if (courseList.indexOf(newCourse) >= 0) {
      if (newCourse !== currentCourse) {
        await saveCourseToStore(newCourse);
        await clearLecturesFromStore();
      }
      if (!recentCourses.includes(newCourse)) {
        let recentCoursesHelper = recentCourses;
        recentCoursesHelper.push(newCourse);
        await saveRecentCoursesToStore(recentCoursesHelper);
      } else {
        let recentCoursesHelper = recentCourses.filter(
          (item) => item !== newCourse
        );
        recentCoursesHelper.push(newCourse);
        await saveRecentCoursesToStore(recentCoursesHelper);
      }
      goBack();
    } else {
      Alert.alert(
        'Kurs nicht vorhanden',
        `Es gibt keinen Online-Stundenplan für den Kurs ${newCourse}.`
      );
    }
  }

  async function removeRecentCourseItem(title) {
    let recentCoursesHelper = recentCourses.filter(
      (item) => item !== title
    );
    await saveRecentCoursesToStore(recentCoursesHelper);
    setRecentCourses(recentCoursesHelper);
  }

  const listItem = (title, key) => {
    return (
      <Pressable
        key={key}
        onPress={() => {
          setCourse(title);
          onPressClicked({ listItem: title });
        }}
        style={({ pressed }) => [
          {
            opacity: pressed ? 0.6 : 1,
          },
          {
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderWidth: 1,
            marginBottom: 3,
            borderRadius: 10,
            borderColor:
              title === course
                ? colorContext.colorScheme.dhbwRed
                : colorContext.colorScheme.cellBorder,
            backgroundColor:
              title === course
                ? colorContext.colorScheme.dhbwRed
                : colorContext.colorScheme.lightGray,
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          },
        ]}
      >
        <Text style={{ color: title === course ? 'white' : 'black' }}>
          {title}
        </Text>
        <FontAwesome6
          style={{
            paddingLeft: 10,
            color: title === course ? 'white' : 'black',
          }}
          onPress={() => removeRecentCourseItem(title)}
          name="xmark"
          size={24}
        />
      </Pressable>
    );
  };

  return (
    <View
      style={[
        Styles.EditCourse.container,
        { backgroundColor: colorContext.colorScheme.background },
      ]}
    >
      <Text style={{ color: colorContext.colorScheme.text }}>
        Für welchen Kurs soll der Vorlesungsplan angezeigt werden?
      </Text>
      <View style={Styles.EditCourse.inputContainer}>
        <TextInput
          style={[
            Styles.EditCourse.input,
            { color: colorContext.colorScheme.text },
          ]}
          autoCapitalize="characters"
          autoCorrect={false}
          defaultValue={course}
          placeholder="Kursname"
          maxLength={15}
          onChangeText={(course) => setCourse(course.trim())}
        />
        <Pressable onPress={onPressClicked}>
          <Text style={Styles.EditCourse.inputButton}>
            Kurs anzeigen
          </Text>
        </Pressable>
      </View>
      <Text style={{ color: colorContext.colorScheme.text }} />
      <Text style={{ color: colorContext.colorScheme.text }}>
        Nicht alle Kurse haben einen Online-Stundenplan. Falls ein
        Kalender fehlt, dann teile uns dies bitte mit, siehe Service
        -- Feedback.
      </Text>
      {recentCourses?.length > 0 && (
        <>
          <Text
            style={{
              color: colorContext.colorScheme.text,
              marginTop: 10,
            }}
          >
            Zuletzt verwendete Kurse:
          </Text>
          <ScrollView style={{ marginTop: 10 }}>
            {recentCourses
              ?.slice(0)
              .reverse()
              .map((item, index) => {
                return listItem(item, index);
              })}
          </ScrollView>
        </>
      )}
    </View>
  );
}
