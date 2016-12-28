// @flow
'use strict';

import React, { Component } from 'react';
import {
  ActivityIndicator,
  Button,
  ListView,
  StyleSheet,
  View,
} from 'react-native';

import Colors from '../../util/Colors';
import CampusHeader from '../../util/CampusHeader';
import CampusListView from '../../util/CampusListView';

import type { Lecture } from '../../util/types';

import CourseModal from './CourseModal';
import DayHeader from './DayHeader';
import LectureRow from './LectureRow';

import { getLecturesFromiCalData } from '../../util/helpers'; //TODO: container component?

const dataSource = new ListView.DataSource({
  rowHasChanged: (r1, r2) => r1 !== r2,
  sectionHeaderHasChanged: (s1, s2) => s1 !== s2,
});

export default class ScheduleScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      course: null,
      courseModalVisible: false,
      dataSource: dataSource.cloneWithRowsAndSections({}),
      error: false,
      loading: false,
    };
  }

  _renderRow(lecture: Lecture) {
    return <LectureRow lecture={lecture}/>;
  }

  _renderDayHeader(sectionData: any, sectionID: string) {
    return <DayHeader title={sectionID} />;
  }

  _setCourseModalVisible(visible) {
    this.setState({courseModalVisible: visible});
  }

  _setCourseName(course) {
    this.setState({course: course, loading: true});
    this._setCourseModalVisible(false);
    this._fetchSchedule(course);
  }

  async _fetchSchedule(course) {
    const scheduleUrl = 'https://webmail.dhbw-loerrach.de/owa/calendar/kal-@course@@dhbw-loerrach.de/Kalender/calendar.ics';
    const scheduleUrlWithCourse = scheduleUrl.replace('@course@', course);

    try {
      const response = await fetch(scheduleUrlWithCourse);
      const responseBody = await response.text();
      const lectures = getLecturesFromiCalData(responseBody);

      this.setState({loading: false,
        dataSource: dataSource.cloneWithRowsAndSections(lectures)});
    } catch(error) {
      this.setState({loading: false, error: true});
    }
  }

  _renderScreenContent() {
    const {lectures, loading, error} = this.state;

    if(loading) {
      return(
        <View style={styles.center}>
          <ActivityIndicator animating={true}/>
        </View>
      );
    }

    if(error) {
      return(
        <View style={styles.center}>
          <Text>Fehler beim Laden des Vorlesungsplanes</Text>
        </View>
      );
    }

    if(!this.state.course) {
      return(
        <View style={styles.center}>
          <Button title="Kurs auswählen" color={Colors.dhbwRed}
            onPress={() => this._setCourseModalVisible(true)}
          />
        </View>
      );
    }

    return(
      <CampusListView
        dataSource={this.state.dataSource}
        renderRow={this._renderRow}
        renderSectionHeader={this._renderDayHeader}
      />
    );
  }

  render() {
    let rightActionItem = null;
    if(this.state.course) {
      rightActionItem = {
        title: 'Edit',
        icon: require('./img/edit.png'),
        onPress: () => this._setCourseModalVisible(true),
        show: 'always', // needed for Android
      };
    }

    let title = 'Vorlesungsplan';
    if(this.state.course) title += ` ${this.state.course}`;

    return (
      <View style={styles.container}>
        <CampusHeader
          title={title}
          rightActionItem={rightActionItem}
        />
        {this._renderScreenContent()}
        <CourseModal
          visible={this.state.courseModalVisible}
          course={this.state.course}
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
  }
});
