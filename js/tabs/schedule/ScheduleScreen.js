// @flow
import React, { Component } from 'react';
import {
  ActivityIndicator,
  Button,
  SectionList,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { connect } from 'react-redux';

import Colors from '../../util/Colors';
import DayHeader from '../../util/DayHeader';
import ReloadView from '../../util/ReloadView';

import type { Lecture } from '../../util/types';

import CourseModal from './CourseModal';
import LectureRow from './LectureRow';

import { clearLectures, fetchLectures } from './redux';

function selectPropsFromStore(store) {
  return {
    course: store.schedule.course,
    lectures: store.schedule.lectures,
    isFetching: store.schedule.isFetching,
    networkError: store.schedule.networkError
  };
}

class ScheduleScreen extends Component {
  constructor(props) {
    super(props);

    this.state = { courseModalVisible: false };
  }

  componentWillMount() {
    if (this.props.course) {
      this.props.dispatch(fetchLectures(this.props.course));
    }
  }

  _renderRow(lecture: Lecture) {
    return <LectureRow lecture={lecture} />;
  }

  _setCourseModalVisible(visible) {
    this.setState({ courseModalVisible: visible });
  }

  _setCourseName(course) {
    this._setCourseModalVisible(false);
    if (course !== this.props.course) {
      // only update data if new course given
      this._refreshData(course);
    }
  }

  _refreshData(course) {
    this.props.dispatch(clearLectures());
    this.props.dispatch(fetchLectures(course));
  }

  _renderScreenContent() {
    const { course, lectures, isFetching, networkError } = this.props;

    if (!course) {
      return (
        <View style={styles.center}>
          <Button
            title="Kurs auswählen"
            color={Colors.dhbwRed}
            onPress={() => this._setCourseModalVisible(true)}
          />
        </View>
      );
    }

    if (isFetching) {
      return (
        <View style={styles.center}>
          <ActivityIndicator animating={true} />
        </View>
      );
    }

    const buttonText = 'Vorlesungsplan laden';
    if (networkError && !lectures) {
      return (
        <ReloadView
          buttonText={buttonText}
          onPress={() => this._refreshData(course)}
        />
      );
    }

    if (lectures && !lectures.length) {
      const text =
        'Aktuell sind für Kurs ' +
        course +
        ' keine Termine ' +
        'vorhanden oder Dein Studiengang veröffentlicht keine Termine online.';
      return (
        <ReloadView
          message={text}
          buttonText={buttonText}
          onPress={() => this._refreshData(course)}
        />
      );
    }

    // contenInset: needed for last item to be displayed above tab bar on iOS
    return (
      <SectionList
        bounces={false}
        contentInset={{ top: 0, left: 0, bottom: 50, right: 0 }}
        sections={lectures}
        renderItem={({ item }) => this._renderRow(item)}
        renderSectionHeader={({ section }) => (
          <DayHeader title={section.title} />
        )}
      />
    );
  }

  render() {
    let rightActionItem = null,
      { course } = this.props;
    if (course) {
      rightActionItem = {
        title: 'Edit',
        icon: require('./img/edit.png'),
        onPress: () => this._setCourseModalVisible(true),
        show: 'always' // needed for Android
      };
    }

    let title = 'Vorlesungsplan';
    if (course) title += ' ' + course;

    return (
      <View style={styles.container}>
        {this._renderScreenContent()}
        <CourseModal
          visible={this.state.courseModalVisible}
          course={course}
          onClose={() => this._setCourseModalVisible(false)}
          onCourseChange={course => this._setCourseName(course)}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white'
  },
  center: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center'
  }
});

export default connect(selectPropsFromStore)(ScheduleScreen);
