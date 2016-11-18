// @flow
'use strict';

import React, { Component } from 'react';
import {
  DrawerLayoutAndroid,
  Image,
  View,
  StyleSheet,
  Text
} from 'react-native';

import DrawerItem from './DrawerItem';
import NewsScreen from './tabs/news/NewsScreen';
import ScheduleScreen from './tabs/schedule/ScheduleScreen';
import ServiceScreen from './tabs/service/ServiceScreen';

type Tab = 'news' | 'schedule' | 'canteen' | 'service' | 'imprint';

type State = {
  selectedTab: Tab;
}

export default class TabsView extends Component {
  state: State;
  drawer: ?DrawerLayoutAndroid;

  constructor() {
    super();
    this.state = {selectedTab: 'schedule'};
  }

  _onDrawerItemPressed(tab: Tab) {
    this.setState({selectedTab: tab});
    this.drawer && this.drawer.closeDrawer(); // drawer is set via ref attribute (see render())
  }

  _renderNavigationView = () => {
  // using fat arrow like () => binds this function properly, effect is like this:
  // this._renderNavigationView = this._renderNavigationView.bind(this);
    return (
      <View>
        <Image style={styles.headerImage}
          source={require('./img/drawer-header.png')}>
          <View>
            <Image source={require('./img/logo.png')} />
          </View>
        </Image>
        <DrawerItem
          title="News"
          isSelected={this.state.selectedTab === 'news'}
          onPress={() => this._onDrawerItemPressed('news')}
          icon={require('./tabs/news/img/news-icon.png')}
          selectedIcon={require('./tabs/news/img/news-icon-active.png')}/>
        <DrawerItem
          title="Vorlesungsplan"
          isSelected={this.state.selectedTab === 'schedule'}
          onPress={() => this._onDrawerItemPressed('schedule')}
          icon={require('./tabs/schedule/img/schedule-icon.png')}
          selectedIcon={require('./tabs/schedule/img/schedule-icon-active.png')}/>
        <DrawerItem
          title="Mensa"
          isSelected={this.state.selectedTab === 'canteen'}
          onPress={() => this._onDrawerItemPressed('canteen')}
          icon={require('./tabs/canteen/img/canteen-icon.png')}
          selectedIcon={require('./tabs/canteen/img/canteen-icon-active.png')}/>
        <DrawerItem
          title="Service"
          isSelected={this.state.selectedTab === 'service'}
          onPress={() => this._onDrawerItemPressed('service')}
          icon={require('./tabs/service/img/service-icon.png')}
          selectedIcon={require('./tabs/service/img/service-icon-active.png')}/>
        <DrawerItem
          title="Impressum"
          isSelected={this.state.selectedTab === 'imprint'}
          onPress={() => this._onDrawerItemPressed('imprint')}
          icon={require('./tabs/imprint/img/imprint-icon.png')}
          selectedIcon={require('./tabs/imprint/img/imprint-icon-active.png')}/>
      </View>
    );
  }

  _renderTabContent() {
    switch (this.state.selectedTab) {
      case 'news':
        return <NewsScreen/>;
      case 'schedule':
          return <ScheduleScreen/>;
      case 'service':
        return <ServiceScreen/>;
    }
    return (<Text>{this.state.selectedTab}</Text>);
  };

  render() {
    return(
      <DrawerLayoutAndroid
        ref={(drawer) => this.drawer = drawer} // use ref attribute with callback
        // we need a reference to this child component, e.g. to call closeDrawer()
        // React (native) has a way to directly access a component's children, see
        // https://facebook.github.io/react/docs/refs-and-the-dom.html
        drawerWidth={290} // same width as drawer header image
        renderNavigationView={this._renderNavigationView}>
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          {this._renderTabContent()}
        </View>
      </DrawerLayoutAndroid>
    );
  }
}

const styles = StyleSheet.create({
  headerImage: {
    padding: 20,
    justifyContent: 'flex-end',
  },
});
