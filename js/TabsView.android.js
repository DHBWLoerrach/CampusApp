'use strict';

import React, { Component } from 'react';
import {
  DrawerLayoutAndroid,
  View,
  Text
} from 'react-native';

import DrawerItem from './DrawerItem';

export default class TabsView extends Component {
  constructor() {
    super();
    this.state = {selectedTab: 'news'};
  }

  _renderNavigationView = () => {
  // using fat arrow like () => binds this function properly, effect is like this:
  // this._renderNavigationView = this._renderNavigationView.bind(this);
    return (
      <View>
        <DrawerItem
          title="News"
          isSelected={this.state.selectedTab === 'news'}
          onPress={() => this.setState({selectedTab: 'news'})}
          icon={require('./tabs/news/img/news-icon.png')}
          selectedIcon={require('./tabs/news/img/news-icon-active.png')}/>
        <DrawerItem
          title="Vorlesungsplan"
          isSelected={this.state.selectedTab === 'schedule'}
          onPress={() => this.setState({selectedTab: 'schedule'})}
          icon={require('./tabs/schedule/img/schedule-icon.png')}
          selectedIcon={require('./tabs/schedule/img/schedule-icon-active.png')}/>
        <DrawerItem
          title="Mensa"
          isSelected={this.state.selectedTab === 'canteen'}
          onPress={() => this.setState({selectedTab: 'canteen'})}
          icon={require('./tabs/canteen/img/canteen-icon.png')}
          selectedIcon={require('./tabs/canteen/img/canteen-icon-active.png')}/>
        <DrawerItem
          title="Service"
          isSelected={this.state.selectedTab === 'service'}
          onPress={() => this.setState({selectedTab: 'service'})}
          icon={require('./tabs/service/img/service-icon.png')}
          selectedIcon={require('./tabs/service/img/service-icon-active.png')}/>
        <DrawerItem
          title="Impressum"
          isSelected={this.state.selectedTab === 'imprint'}
          onPress={() => this.setState({selectedTab: 'imprint'})}
          icon={require('./tabs/imprint/img/imprint-icon.png')}
          selectedIcon={require('./tabs/imprint/img/imprint-icon-active.png')}/>
      </View>
    );
  }

  _renderTabContent() {
    return (<Text>{this.state.selectedTab}</Text>);
  };

  render() {
    return(
      <DrawerLayoutAndroid
        renderNavigationView={this._renderNavigationView}>
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          {this._renderTabContent()}
        </View>
      </DrawerLayoutAndroid>
    );
  }
}
