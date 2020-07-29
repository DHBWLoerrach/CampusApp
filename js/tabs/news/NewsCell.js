import React from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { de } from 'date-fns/locale';

import CommonCell from '../../util/CommonCell';
import { DHBW_EVENTS } from '../../util/fetcher/FetchManager';

export default ({ news, topic, onPress }) => {
  let image = require('../../img/logo.png');
  let imageStyle = {};
  // formatting for news items: relative date (e.g. "3 days ago")
  let formattedTime = formatDistanceToNow(new Date(news.time), {
    locale: de,
    addSuffix: true,
  });
  // special formatting for events: absolute date in red
  if (topic === DHBW_EVENTS) {
    formattedTime = format(new Date(news.time), 'dd.MM.yyyy');
  }
  if (news.imgUrl) {
    image = { uri: news.imgUrl };
    imageStyle = { resizeMode: 'cover', height: '100%' };
  }
  return (
    <CommonCell
      imageStyle={imageStyle}
      title={news.heading}
      details={[formattedTime]}
      description={news.subheading}
      imageSource={image}
      onPress={() => onPress({ news: news })}
    />
  );
};
