import React, { Component } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { formatDistanceToNow, format } from 'date-fns';
import { de } from 'date-fns/locale';

import Colors from '../../util/Colors';
import Constants from '../../util/Constants';
import ListCellTouchable from '../../util/ListCellTouchable';
import CommonCell from "../../util/CommonCell";

export default class NewsCell extends Component {
  render() {
    let image = require('../../img/logo.png');
    // formatting for news items: relative date (e.g. "3 days ago")
    let time = formatDistanceToNow(new Date(this.props.news.time), {
      locale: de,
      addSuffix: true
    });
    let extraStyle = {};
    // special formatting for events: absolute date in red
    if (this.props.topic === 'events') {
      time = format(new Date(this.props.news.time), 'dd.MM.yyyy');
      extraStyle = { color: Colors.dhbwRed };
    }
    if (this.props.news.imgUrl)
      image = { uri: this.props.news.imgUrl };
    return (
        <CommonCell
            title={this.props.news.heading}
            details={[time]}
            description={this.props.news.subheading}
            imageSource={image}
            onPress={() => this.props.onPress({ news: this.props.news })}
        />
    );
  }
}
