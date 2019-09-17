import React, { Component } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { formatDistanceToNow, format } from 'date-fns';
import { de } from 'date-fns/locale';

import Colors from '../../util/Colors';
import Constants from '../../util/Constants';
import ListCellTouchable from '../../util/ListCellTouchable';

export default class NewsCell extends Component {
  render() {
    let image = require('./img/news-announcement.png');
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
      <ListCellTouchable
        underlayColor={Colors.cellBorder}
        onPress={() => this.props.onPress({ news: this.props.news })}
      >
        <View style={styles.row}>
          <Image style={styles.image} source={image} />
          <View style={styles.newsheadings}>
            <Text style={styles.heading}>
              {this.props.news.heading}
            </Text>
            <Text style={styles.subheading} numberOfLines={3}>
              {this.props.news.subheading}
            </Text>
            <Text style={[styles.time, extraStyle]}>{time}</Text>
          </View>
        </View>
      </ListCellTouchable>
    );
  }
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingVertical: Constants.listViewRowPaddingVertical,
    paddingHorizontal: Constants.listViewRowPaddingHorizontal,
    borderColor: Colors.cellBorder,
    borderBottomWidth: StyleSheet.hairlineWidth
  },
  image: {
    height: 100,
    width: 100,
    marginRight: 15
  },
  newsheadings: {
    flex: 1
  },
  heading: {
    fontSize: Constants.bigFont,
    fontWeight: 'bold',
    color: Colors.dhbwRed
  },
  subheading: {
    fontSize: Constants.smallFont
  },
  time: {
    color: Colors.lightText,
    fontSize: Constants.smallFont
  }
});
