// @flow
import React, { Component } from 'react';
import { View } from 'react-native';

import { textPrivacy } from './Texts';

export default class Privacy extends Component {
  render() {
    return <View>{textPrivacy()}</View>;
  }
}
