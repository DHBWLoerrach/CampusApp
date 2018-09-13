import React, { Component } from 'react';
import { Platform, WebView } from 'react-native';

import format from 'date-fns/format';

import Colors from '../../util/Colors';

export default class NewsDetails extends Component {
  render() {
    const fontSize = Platform.OS === 'ios' ? 'font-size: 42px;' : '';
    let {
      heading,
      subheading,
      imgUrl,
      body,
      time
    } = this.props.navigation.getParam('news');
    let topic = this.props.navigation.getParam('topic');
    if (topic === 'events') {
      time = `<h1>${format(new Date(time), 'DD.MM.YYYY')}</h1>`;
    } else {
      time = '';
    }
    if (body === subheading) subheading = '';
    // HACK/TODO: prevent changes in font size (affects iOS)
    body = body.replace(/font-size:/g, 'fs');
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
            ${time}
            <h1>${heading}</h1>
            <h2>${subheading}</h2>
            <img src="${imgUrl}" width="100%">
            ${body}
          </body>
        </html>
    `;

    return (
      <WebView useWebKit={true} source={{ html: HTML }} bounces={false} />
    );
  }
}
