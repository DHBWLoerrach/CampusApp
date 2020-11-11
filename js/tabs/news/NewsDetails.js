import React from 'react';
import { Platform } from 'react-native';
import { WebView } from 'react-native-webview';

import { format } from 'date-fns';

import Colors from '../../util/Colors';
import { DHBW_EVENTS } from '../../util/fetcher/FetchManager';

export default ({ route }) => {
  const fontSize = 'font-size: 42px;';
  const googleDocsPDF =
    'https://docs.google.com/gview?embedded=true&url=';
  let {
    heading,
    subheading,
    imgUrl,
    body,
    time,
    attachments,
  } = route.params.news;
  let topic = route.params.topic;
  let timeHeading = '';
  if (topic === DHBW_EVENTS) {
    timeHeading = `<h3>${format(
      new Date(time),
      'dd.MM.yyyy HH:mm'
    )} Uhr</h3>`;
  }
  if (body === subheading) subheading = '';
  // HACK/TODO: prevent changes in font size (affects iOS)
  body = body.replace(/font-size:/g, 'fs');
  // Remove target="_blank" in URLs (otherwise they won't work on iOS)
  body = body.replace(/target="_blank"/g, '');
  if (Platform.OS === 'android') {
    // on Android use embedded Google docs viewer for PDF (WebView won't work)
    // see https://github.com/facebook/react-native/issues/6488
    // route all PDF links through Google docs viewer
    body = body.replace(
      /(href=")(.+\.pdf)"/g,
      `href="${googleDocsPDF}$2"`
    );
  }
  let attachmentFooter = '';
  if (attachments && attachments.length >= 1) {
    let attachmentsHTML = '';
    attachments.forEach((attachment) => {
      let url = attachment.url;
      // route all PDF attachment through Google docs viewer
      if (url.slice(-4) === '.pdf' && Platform.OS === 'android')
        url = googleDocsPDF + url;
      attachmentsHTML += `${attachment.title} <br/> 
        <a href='${url}'>Herunterladen (${attachment.size})</a> 
        <br/>
        <br/>`;
    });
    attachmentFooter = `<p>
        <b>Anhänge</b> <br/> <br/>
        ${attachmentsHTML}        
        </p>`;
  }
  const HTML = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {font-family: -apple-system; ${fontSize}; padding: 0 20px; }
              h2 {color: ${Colors.dhbwRedWebView}}
            </style>
          </head>
          <body>
            ${timeHeading}
            <h2>${heading}</h2>
            <h3>${subheading}</h3>
            <img src="${imgUrl}" width="100%">
            ${body}
            ${attachmentFooter}
          </body>
        </html>
    `;

  return (
    <WebView
      originWhitelist={['*']}
      source={{ html: HTML }}
      bounces={false}
    />
  );
};
