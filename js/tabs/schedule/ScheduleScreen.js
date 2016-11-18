// @flow
'use strict';

import React, { Component } from 'react';
import {
  ListView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Colors from '../../util/Colors';

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
          2: {title: 'Betriebssysteme', startTime: '13:00', endTime: '16:15'},
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
      })
    };
  }

  _renderRow(lecture: Lecture) {
    return <LectureRow lecture={lecture}/>;
  }

  _renderSeparator(sectionId, rowId) {
    return(<View style={styles.separator} key={rowId}/>);
  }

  _renderDayHeader(sectionData: any, sectionID: string) {
    return <DayHeader title={sectionID} />;
  }

  render() {
    return(
      <ListView
        dataSource={this.state.dataSource}
        renderRow={this._renderRow}
        renderSeparator={this._renderSeparator}
        renderSectionHeader={this._renderDayHeader}
      />
    );
  }
}


const styles = StyleSheet.create({
  separator: {
    backgroundColor: Colors.cellBorder,
    height: 1,
  },
});
