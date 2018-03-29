import React, { Component } from 'react';
import {
  Platform,
  TouchableNativeFeedback,
  TouchableOpacity
} from 'react-native';

const IconTouchable =
  Platform.OS === 'android' ? TouchableNativeFeedback : TouchableOpacity;

export default IconTouchable;
