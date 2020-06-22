import React from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { de } from 'date-fns/locale';

import CommonCell from '../../util/CommonCell';

export default ({
  news: { time, imgUrl, heading, subheading },
  topic,
  onPress,
}) => {
  let image = require('../../img/logo.png');
  // formatting for news items: relative date (e.g. "3 days ago")
  let formattedTime = formatDistanceToNow(new Date(time), {
    locale: de,
    addSuffix: true,
  });
  // special formatting for events: absolute date in red
  if (topic === 'events') {
    formattedTime = format(new Date(time), 'dd.MM.yyyy');
  }
  if (imgUrl) image = { uri: imgUrl };
  return (
    <CommonCell
      title={heading}
      details={[formattedTime]}
      description={subheading}
      imageSource={image}
      onPress={() => onPress({ news: news })}
    />
  );
};
