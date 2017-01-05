// @flow
'use strict';

import React, { Component } from 'react';
import {
  TabBarIOS,
} from 'react-native';

import { connect } from 'react-redux';

import Colors from './util/Colors';

import NewsScreen from './tabs/news/NewsScreen';
import ScheduleScreen from './tabs/schedule/ScheduleScreen';
import CanteenScreen from './tabs/canteen/CanteenScreen';
import ServiceScreen from './tabs/service/ServiceScreen';

import { fetchNews } from './tabs/news/redux';
import { fetchLectures } from './tabs/schedule/redux';
import { fetchDayPlans } from './tabs/canteen/redux';

type Tab = 'news' | 'schedule' | 'canteen' | 'service';

type State = {
  selectedTab: Tab;
}

function selectPropsFromStore(store) {
  return {
    course: store.schedule.course,
  };
}

class TabsView extends Component {
  state: State;

  constructor(props) {
    super(props);
    this.state = {selectedTab: 'news'};
  }

  _onTabSelect(tab: Tab) {
    if (this.state.selectedTab !== tab) {
      this.setState({selectedTab: tab});

      // FIXME: on iOS, the selected TabBarIOS.Item is only rendered once
      // on Android this screen is always rendered on selection
      // (see componentWillMount in tab screens)

      // force the schedule to fetch new data whenever this screen is selected
      if(tab === 'schedule' && this.props.course) {
        this.props.dispatch(fetchLectures(this.props.course));
      }
      // force the canteen/news to fetch new data at most once a day
      // TODO: unified solution for Android/iOS (use same approach on Android)
      // const now = moment();
      if(tab === 'canteen') {
        // var canteenLastUpdated = moment(this.props.canteenLastUpdated);
        // if(now.diff(canteenLastUpdated, 'days') > 1) {
          this.props.dispatch(fetchDayPlans());
        // }
      } else if(tab === 'news') {
        // var newsLastUpdated = moment(this.props.newsLastUpdated);
        // if(now.diff(newsLastUpdated, 'days') > 1) {
          this.props.dispatch(fetchNews());
        // }
      }
    }
  }

  render() {
    return (
      <TabBarIOS tintColor={Colors.dhbwRed}>
        <TabBarIOS.Item
          title="News"
          selected={this.state.selectedTab === 'news'}
          onPress={this._onTabSelect.bind(this, 'news')}
          icon={require('./tabs/news/img/news-icon.png')}>
          <NewsScreen/>
        </TabBarIOS.Item>
        <TabBarIOS.Item
          title="Vorlesungsplan"
          selected={this.state.selectedTab === 'schedule'}
          onPress={this._onTabSelect.bind(this, 'schedule')}
          icon={require('./tabs/schedule/img/schedule-icon.png')}>
          <ScheduleScreen/>
        </TabBarIOS.Item>
        <TabBarIOS.Item
          title="Mensa"
          selected={this.state.selectedTab === 'canteen'}
          onPress={this._onTabSelect.bind(this, 'canteen')}
          icon={require('./tabs/canteen/img/canteen-icon.png')}>
          <CanteenScreen/>
        </TabBarIOS.Item>
        <TabBarIOS.Item
          title="Service"
          selected={this.state.selectedTab === 'service'}
          onPress={this._onTabSelect.bind(this, 'service')}
          icon={require('./tabs/service/img/service-icon.png')}>
          <ServiceScreen/>
        </TabBarIOS.Item>
      </TabBarIOS>
    );
  }
}

export default connect(selectPropsFromStore)(TabsView);
