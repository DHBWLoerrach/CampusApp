// @flow
'use strict';

import React, { Component } from 'react';
import { NavigationExperimental } from 'react-native';
import { connect } from 'react-redux';

import { fetchNews } from './redux';

import NewsList from './NewsList';
import NewsDetails from './NewsDetails';

const {
  CardStack: NavigationCardStack,
  StateUtils: NavigationStateUtils,
} = NavigationExperimental;

function selectPropsFromStore(store) {
  return {
    news: store.news.news,
    isFetching: store.news.isFetching,
    networkError: store.news.networkError,
  };
}

class NewsScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      navigationState: {
        index: 0,
        routes: [{key: 'News'}],
      },
    };

    this._onNavigationChange = this._onNavigationChange.bind(this);
    this._renderScene = this._renderScene.bind(this);

    this._onPushRoute = this._onNavigationChange.bind(null, 'push');
    this._onPopRoute = this._onNavigationChange.bind(null, 'pop');
    // this._handleBackButton = this._handleBackButton.bind(this);
  }

  componentWillMount() {
    this.props.dispatch(fetchNews());
  }

  // TODO: just in case if Android's back button does not work out of the box
  // componentDidMount() {
  //   BackAndroid.addEventListener('hardwareBackPress', this._handleBackButton);
  // }
  //
  // componentWillUnmount() {
  //   BackAndroid.removeEventListener('hardwareBackPress', this._handleBackButton);
  // }
  //
  // _handleBackButton() {
  //   if (this.state.navigationState.index === 0) {
  //     return false;
  //   }
  //   this._onPopRoute();
  //   return true;
  // }

  _onNavigationChange(type, data) {
    let {navigationState} = this.state;
    switch (type) {
      case 'push':
        const route = {key: 'Route-' + Date.now(), news: data.news};
        navigationState = NavigationStateUtils.push(navigationState, route);
        break;

      case 'pop':
        navigationState = NavigationStateUtils.pop(navigationState);
        break;
    }

    if (this.state.navigationState !== navigationState) {
      this.setState({navigationState});
    }
  }

  _renderScene(sceneProps) {
    if(sceneProps.scene.route.key === 'News') {
      return(
        <NewsList
          news={this.props.news}
          isFetching={this.props.isFetching}
          networkError={this.props.networkError}
          onPressNewsItem={this._onPushRoute}
        />
      );
    }
    else {
      return(
        <NewsDetails
          backAction={this._onPopRoute} news={sceneProps.scene.route.news}/>
      );
    }
  }

  render() {
    return(
      // TODO: Android: check if back button functions out of the box
      <NavigationCardStack
        onNavigateBack={this._onPopRoute}
        navigationState={this.state.navigationState}
        renderScene={this._renderScene}
      />
    );
  }
}

export default connect(selectPropsFromStore)(NewsScreen);
