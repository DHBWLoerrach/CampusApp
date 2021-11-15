import React from 'react';
import CommonCell from '../../../util/CommonCell';
import { unixTimeToDateText, unixTimeToTimeText } from '../helper';

export default function StuvEventCell({ event, onPress }) {
  const { name, description, images, date: { from, to } } = event;
  const formattedDate = unixTimeToDateText(from);
  const formattedTime = to
    ? `${unixTimeToTimeText(from)} bis ${unixTimeToTimeText(to)} Uhr`
    : `${unixTimeToTimeText(from)} Uhr`;
  const image = images.overview
    ? { uri: images.overview.src }
    : require('../../../img/crowd.png');

  return (<CommonCell
    imageSource={image}
    title={name}
    imageStyle={{ resizeMode: 'cover', height: '100%' }}
    details={[formattedDate, formattedTime]}
    description={description}
    onPress={onPress}
  />);
}
;