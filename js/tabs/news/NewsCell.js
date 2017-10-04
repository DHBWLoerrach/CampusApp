// @flow
import React, { Component } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import distanceInWordsToNow from 'date-fns/distance_in_words_to_now';
import deLocale from 'date-fns/locale/de';
import format from 'date-fns/format';

import Colors from '../../util/Colors';
import Constants from '../../util/Constants';
import ListCellTouchable from '../../util/ListCellTouchable';

import type { NewsItem } from '../../util/types';

export default class NewsCell extends Component {
  props: {
    news: NewsItem,
    onPress: ?() => void
  };

  render() {
    let image = require('./img/news-announcement.png');
    let time =
      this.props.topic === 'events'
        ? format(new Date(this.props.news.time), 'DD.MM.YYYY')
        : distanceInWordsToNow(this.props.news.time, {
            locale: deLocale,
            addSuffix: true
          });
    if (this.props.news.imgUrl) image = { uri: this.props.news.imgUrl };
    return (
      <ListCellTouchable
        underlayColor={Colors.cellBorder}
        onPress={() => this.props.onPress({ news: this.props.news })}
      >
        <View style={styles.row}>
          <Image style={styles.image} source={image} />
          <View style={styles.newsheadings}>
            <Text style={styles.heading}>{this.props.news.heading}</Text>
            <Text style={styles.subheading}>{this.props.news.subheading}</Text>
            <Text style={styles.time}>{time}</Text>
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
