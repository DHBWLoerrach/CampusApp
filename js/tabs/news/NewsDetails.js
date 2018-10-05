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
      time,
      attachments
    } = this.props.navigation.getParam('news');
    let topic = this.props.navigation.getParam('topic');
    let timeHeading = '';
    if (topic === 'events') {
      timeHeading = `<h3>${format(
        new Date(time),
        'DD.MM.YYYY HH:mm'
      )} Uhr</h3>`;
    }
    if (body === subheading) subheading = '';
    // HACK/TODO: prevent changes in font size (affects iOS)
    body = body.replace(/font-size:/g, 'fs');
    let attachmentFooter = '';
    if (attachments && attachments.length >= 1) {
      let attachmentsHTML = '';
      attachments.forEach(attachment => {
        attachmentsHTML += `${attachment.title} <br/> 
        <a href='${attachment.url}'>Herunterladen (${attachment.size})</a> 
        <br/>
        <br/>`;
      });
      attachmentFooter = `<p>
        <b>Anhänge</b> <br/> <br/>
        ${attachmentsHTML}        
        </p>`;
    }
    console.log(imgUrl);
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
            ${timeHeading}
            <h1>${heading}</h1>
            <h2>${subheading}</h2>
            <img src="${imgUrl}" width="100%">
            ${body}
            ${attachmentFooter}
          </body>
        </html>
    `;

    return (
      <WebView useWebKit={true} source={{ html: HTML }} bounces={false} />
    );
  }
}
