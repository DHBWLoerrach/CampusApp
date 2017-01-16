// @flow
'use strict';

import React, { Component } from 'react';
import {
  ActivityIndicator,
  Button,
  ListView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { connect } from 'react-redux';

import Colors from '../../util/Colors';
import CampusHeader from '../../util/CampusHeader';
import CampusListView from '../../util/CampusListView';
import ReloadView from '../../util/ReloadView';

import type { Lecture } from '../../util/types';

import CourseModal from './CourseModal';
import DayHeader from './DayHeader';
import LectureRow from './LectureRow';

import {
  clearLectures,
  fetchLectures,
} from './redux';

function selectPropsFromStore(store) {
  return {
    course: store.schedule.course,
    lectures: store.schedule.lectures,
    isFetching: store.schedule.isFetching,
    networkError: store.schedule.networkError,
  };
}

class ScheduleScreen extends Component {
  constructor(props) {
    super(props);

    this.state = { courseModalVisible: false };
  }

  componentWillMount() {
    if(this.props.course) {
      this.props.dispatch(fetchLectures(this.props.course));
    }
  }

  _renderRow(lecture: Lecture) {
    return <LectureRow lecture={lecture}/>;
  }

  _renderDayHeader(sectionData: any, sectionID: string) {
    return <DayHeader title={sectionID} />;
  }

  _setCourseModalVisible(visible) {
    this.setState({ courseModalVisible: visible });
  }

  _setCourseName(course) {
    this._setCourseModalVisible(false);
    if(course !== this.props.course) { // only update data if new course given
      this._refreshData(course);
    }
  }

  _refreshData(course) {
    this.props.dispatch(clearLectures());
    this.props.dispatch(fetchLectures(course));
  }

  _renderScreenContent() {
    const { course, lectures, isFetching, networkError } = this.props;

    if(!course) {
      return (
        <View style={styles.center}>
          <Button title="Kurs auswählen" color={Colors.dhbwRed}
            onPress={() => this._setCourseModalVisible(true)}
          />
        </View>
      );
    }

    if(isFetching) {
      return (
        <View style={styles.center}>
          <ActivityIndicator animating={true}/>
        </View>
      );
    }

    const buttonText = 'Vorlesungsplan laden';
    if(networkError && !lectures) {
      return (
          <ReloadView buttonText={buttonText}
            onPress={() => this._refreshData(course)}/>
      );
    }

    if(lectures && !Object.keys(lectures).length) {
      const text = 'Aktuell sind für Kurs '  + course + ' keine Termine '
        + 'vorhanden oder Dein Studiengang veröffentlicht keine Termine online.';
      return (
          <ReloadView message={text} buttonText={buttonText}
            onPress={() => this._refreshData(course)}/>
      );
    }

    const dataSource = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2,
      sectionHeaderHasChanged: (s1, s2) => s1 !== s2,
    });
    return (
      <CampusListView
        dataSource={dataSource.cloneWithRowsAndSections(lectures)}
        renderRow={this._renderRow}
        renderSectionHeader={this._renderDayHeader}
      />
    );
  }

  render() {
    let rightActionItem = null, {course} = this.props;
    if(course) {
      rightActionItem = {
        title: 'Edit',
        icon: require('./img/edit.png'),
        onPress: () => this._setCourseModalVisible(true),
        show: 'always', // needed for Android
      };
    }

    let title = 'Vorlesungsplan';
    if(course) title += ' ' + course;

    return (
      <View style={styles.container}>
        <CampusHeader
          title={title}
          rightActionItem={rightActionItem}
        />
        {this._renderScreenContent()}
        <CourseModal
          visible={this.state.courseModalVisible}
          course={course}
          onClose={() => this._setCourseModalVisible(false)}
          onCourseChange={(course) => this._setCourseName(course)}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  center: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default connect(selectPropsFromStore)(ScheduleScreen);
