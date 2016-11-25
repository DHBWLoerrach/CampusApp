// @flow
'use strict';

import React, { Component } from 'react';
import {
  ListView,
  View,
} from 'react-native';

import Colors from '../../util/Colors';
import CampusHeader from '../../util/CampusHeader';
import CampusListView from '../../util/CampusListView';

import type { Lecture } from '../../util/types';

import DayHeader from './DayHeader';
import LectureRow from './LectureRow';

export default class ScheduleScreen extends Component {
  constructor() {
    super();
    const dataSource = new ListView.DataSource({
      getRowData: (data, sectionId, rowId) => data[sectionId][rowId],
      getSectionHeaderData: (data, sectionId) => data[sectionId],
      rowHasChanged: (r1, r2) => r1 !== r2,
      sectionHeaderHasChanged: (s1, s2) => s1 !== s2,
    });

    this.state = {
      dataSource: dataSource.cloneWithRowsAndSections({
        'Montag, 21.11.2016': {
          1: {title: 'Prog1', startTime: '9:00', endTime: '12:15', location: 'A333'},
          2: {title: 'Betriebssysteme für Fortgeschrittene', startTime: '13:00', endTime: '16:15'},
        },
        'Dienstag, 22.11.2016': {
          3: {title: 'Workshop'},
        },
        'Mittwoch, 23.11.2016': {
          4: {title: 'Prog1', startTime: '9:00', endTime: '12:15', location: 'A333'},
          5: {title: 'Betriebssysteme', startTime: '13:00', endTime: '16:15'},
        },
        'Donnerstag, 24.11.2016': {
          5: {title: 'Web', startTime: '9:00', endTime: '12:15', location: 'A333'},
          6: {title: 'BWL', startTime: '13:00', endTime: '16:15'},
        },
        'Freitag, 25.11.2016': {
          7: {title: 'Workshop'},
        },
        'Montag, 28.11.2016': {
          8: {title: 'Prog1', startTime: '9:00', endTime: '12:15', location: 'A333'},
          9: {title: 'Betriebssysteme für Fortgeschrittene', startTime: '13:00', endTime: '16:15'},
        },
        'Dienstag, 29.11.2016': {
          10: {title: 'Workshop'},
        },
      })
    };
  }

  _renderRow(lecture: Lecture) {
    return <LectureRow lecture={lecture}/>;
  }

  _renderDayHeader(sectionData: any, sectionID: string) {
    return <DayHeader title={sectionID} />;
  }

  render() {
    return(
      <View>
        <CampusHeader title="Vorlesungsplan"/>
        <CampusListView
          dataSource={this.state.dataSource}
          renderRow={this._renderRow}
          renderSectionHeader={this._renderDayHeader}
        />
      </View>
    );
  }
}
