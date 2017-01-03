// @flow
'use strict';

import React, { Component } from 'react';
import { View, } from 'react-native';

import { textImprint } from './Texts';

export default class Imprint extends Component {
  render() {
    return (
      <View>{textImprint()}</View>
    );
  }
}
