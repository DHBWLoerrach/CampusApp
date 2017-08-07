// @flow
'use strict';

import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  View,
  WebView,
} from 'react-native';

import CampusHeader from '../../util/CampusHeader';
import Colors from '../../util/Colors';

export default class NewsDetails extends Component {
  render() {
    const fontSize = Platform.OS === 'ios' ? 'font-size: 42px;' : '' ;
    const HTML = `
        <!DOCTYPE html>\n
        <html>
          <head>
            <style>
              body {font-family: -apple-system; ${fontSize} }
              h1 {color: ${Colors.dhbwRed};}
            </style>
          </head>
          <body>
            <h1>${this.props.news.heading}</h1>
            <h2>${this.props.news.subheading}</h2>
            <img src="${this.props.news.imgUrl}" width="100%">
            ${this.props.news.body}
          </body>
        </html>
    `;

    const leftActionItem = {
      title: 'Back',
      icon: require('../../img/arrow-back.png'),
      onPress: this.props.backAction,
    };

    return(
      <View style={styles.container}>
        <CampusHeader title='News' leftActionItem={leftActionItem}/>
        <WebView contentInset={{bottom: 50}}
          source={{html: HTML}}
          bounces={false}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
