import React, { Component } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { de } from 'date-fns/locale';

import CommonCell from '../../util/CommonCell';

export default class NewsCell extends Component {
  render() {
    let image = require('../../img/logo.png');
    // formatting for news items: relative date (e.g. "3 days ago")
    let time = formatDistanceToNow(new Date(this.props.news.time), {
      locale: de,
      addSuffix: true,
    });
    // special formatting for events: absolute date in red
    if (this.props.topic === 'events') {
      time = format(new Date(this.props.news.time), 'dd.MM.yyyy');
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
