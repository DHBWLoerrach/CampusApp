// @flow
import React, { Component } from 'react';
import {
  Platform,
  TouchableNativeFeedback,
  TouchableHighlight
} from 'react-native';

const ListCellTouchable =
  Platform.OS === 'android' ? TouchableNativeFeedback : TouchableHighlight;

export default ListCellTouchable;
