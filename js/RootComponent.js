// @flow
import React, { Component } from 'react';

import { Provider } from 'react-redux';

import CampusApp from './CampusApp';
import setupStore from './campusRedux';

// this component solely serves as a wrapper for Redux store
export default class RootComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true, // while loading offline data with redux
      store: setupStore(() => this.setState({ loading: false }))
    };
  }

  render() {
    return (
      <Provider store={this.state.store}>
        <CampusApp loading={this.state.loading} />
      </Provider>
    );
  }
}
