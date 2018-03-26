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
import HeaderIcon from '../../util/HeaderIcon';
import ReloadView from '../../util/ReloadView';

import type { Lecture } from '../../util/types';

import EditCourse from './EditCourse';
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
  static navigationOptions = ({ navigation }) => {
    return {
      headerRight: (
        <HeaderIcon
          onPress={() => navigation.navigate('EditCourse')}
          icon="edit"
        />
      )
    };
  };

  componentWillMount() {
    if (this.props.course) {
      this.props.dispatch(fetchLectures(this.props.course));
    }
  }

  _renderRow(lecture: Lecture) {
    return <LectureRow lecture={lecture} />;
  }

  _setCourseName(course) {
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
            title="Kurs eingeben"
            color={Colors.dhbwRed}
            onPress={() => this.props.navigation.navigate('EditCourse')}
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

    let title = 'Vorlesungsplan';
    if (course) title += ' ' + course;

    return (
      <View style={styles.container}>{this._renderScreenContent()}</View>
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
