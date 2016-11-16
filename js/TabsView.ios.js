// @flow
'use strict';

import React, { Component } from 'react';
import {
  TabBarIOS,
  Text,
  View,
} from 'react-native';

import Colors from './util/Colors';

import ServiceScreen from './tabs/service/ServiceScreen';
import NewsScreen from './tabs/news/NewsScreen';

type Tab = 'news' | 'schedule' | 'canteen' | 'service';

type State = {
  selectedTab: Tab;
}

export default class TabsView extends Component {
  state: State;

  constructor() {
    super();
    this.state = {selectedTab: 'news'};
  }

  _renderTabContent(pageText){
    return (
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
        <Text>{pageText}</Text>
      </View>
    );
  };

  render() {
    return (
      <TabBarIOS tintColor={Colors.dhbwRed}>
        <TabBarIOS.Item
          title="News"
          selected={this.state.selectedTab === 'news'}
          onPress={() => this.setState({selectedTab: 'news'})}
          icon={require('./tabs/news/img/news-icon.png')}>
          <NewsScreen/>
        </TabBarIOS.Item>
        <TabBarIOS.Item
          title="Vorlesungsplan"
          selected={this.state.selectedTab === 'schedule'}
          onPress={() => this.setState({selectedTab: 'schedule'})}
          icon={require('./tabs/schedule/img/schedule-icon.png')}>
          {this._renderTabContent('Schedule Tab')}
        </TabBarIOS.Item>
        <TabBarIOS.Item
          title="Mensa"
          selected={this.state.selectedTab === 'canteen'}
          onPress={() => this.setState({selectedTab: 'canteen'})}
          icon={require('./tabs/canteen/img/canteen-icon.png')}>
          {this._renderTabContent('Canteen Tab')}
        </TabBarIOS.Item>
        <TabBarIOS.Item
          title="Service"
          selected={this.state.selectedTab === 'service'}
          onPress={() => this.setState({selectedTab: 'service'})}
          icon={require('./tabs/service/img/service-icon.png')}>
          <ServiceScreen/>
        </TabBarIOS.Item>
      </TabBarIOS>
    );
  }
}
