// @flow
import React, { Component } from 'react';
import { Image, Text, View } from 'react-native';
import PropTypes from 'prop-types';

import CampusDrawerLayout from './CampusDrawerLayout';
import DrawerItem from './DrawerItem';
import NewsScreen from './tabs/news/NewsScreen';
import ScheduleScreen from './tabs/schedule/ScheduleScreen';
import CanteenScreen from './tabs/canteen/CanteenScreen';
import ServiceScreen from './tabs/service/ServiceScreen';
import ImprintScreen from './tabs/service/ImprintScreen';

type Tab = 'news' | 'schedule' | 'canteen' | 'service' | 'imprint';

type State = {
  selectedTab: Tab
};

export default class TabsView extends Component {
  _drawer: ?CampusDrawerLayout;
  state: State;

  constructor(props) {
    super(props);
    this.state = { selectedTab: 'news' };

    this._renderNavigationView = this._renderNavigationView.bind(this);
  }

  _onDrawerItemPressed(tab: Tab) {
    this.setState({ selectedTab: tab });
    this._drawer.closeDrawer(); // drawer is set via ref attribute (see render())
  }

  _renderNavigationView() {
    return (
      <View>
        <Image source={require('./img/drawer-header.png')} />
        <DrawerItem
          title="News"
          isSelected={this.state.selectedTab === 'news'}
          onPress={() => this._onDrawerItemPressed('news')}
          icon={require('./tabs/news/img/news-icon.png')}
          selectedIcon={require('./tabs/news/img/news-icon-active.png')}
        />
        <DrawerItem
          title="Vorlesungsplan"
          isSelected={this.state.selectedTab === 'schedule'}
          onPress={() => this._onDrawerItemPressed('schedule')}
          icon={require('./tabs/schedule/img/schedule-icon.png')}
          selectedIcon={require('./tabs/schedule/img/schedule-icon-active.png')}
        />
        <DrawerItem
          title="Mensa"
          isSelected={this.state.selectedTab === 'canteen'}
          onPress={() => this._onDrawerItemPressed('canteen')}
          icon={require('./tabs/canteen/img/canteen-icon.png')}
          selectedIcon={require('./tabs/canteen/img/canteen-icon-active.png')}
        />
        <DrawerItem
          title="Service"
          isSelected={this.state.selectedTab === 'service'}
          onPress={() => this._onDrawerItemPressed('service')}
          icon={require('./tabs/service/img/service-icon.png')}
          selectedIcon={require('./tabs/service/img/service-icon-active.png')}
        />
        <DrawerItem
          title="Impressum"
          isSelected={this.state.selectedTab === 'imprint'}
          onPress={() => this._onDrawerItemPressed('imprint')}
          icon={require('./tabs/service/img/imprint-icon.png')}
          selectedIcon={require('./tabs/service/img/imprint-icon-active.png')}
        />
      </View>
    );
  }

  _renderTabContent() {
    switch (this.state.selectedTab) {
      case 'news':
        return <NewsScreen />;
      case 'schedule':
        return <ScheduleScreen />;
      case 'canteen':
        return <CanteenScreen />;
      case 'service':
        return <ServiceScreen />;
      case 'imprint':
        return <ImprintScreen />;
    }
  }

  // context API is used to open drawer from CampusHeader
  // https://facebook.github.io/react/docs/context.html
  getChildContext() {
    return {
      openDrawer: () => this._drawer.openDrawer()
    };
  }

  render() {
    return (
      <CampusDrawerLayout
        ref={drawer => (this._drawer = drawer)} // callback to store reference
        // we need a reference to this child component, e.g. to call closeDrawer()
        // React (native) has a way to directly access a component's children, see
        // https://facebook.github.io/react/docs/refs-and-the-dom.html
        drawerWidth={290} // same width as drawer header image
        renderNavigationView={this._renderNavigationView}
      >
        {this._renderTabContent()}
      </CampusDrawerLayout>
    );
  }
}

// needed to use context API (see getChildContext())
TabsView.childContextTypes = {
  openDrawer: PropTypes.func
};
