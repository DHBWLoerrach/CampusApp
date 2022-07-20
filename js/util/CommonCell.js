import React from 'react';
import {
  Image,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Styles from '../Styles/StyleSheet';
import { shortString } from '../tabs/stuv/helper';

export default ({
  imageSource,
  imageStyle,
  title,
  details = [],
  description,
  onPress,
}) => (
  <TouchableOpacity
    style={[Styles.General.cardShadow, Styles.CommonCell.entry]}
    activeOpacity={0.7}
    onPress={onPress}
  >
    <View style={Styles.CommonCell.container}>
      <Image
        source={imageSource}
        style={[Styles.CommonCell.image, imageStyle]}
      />
      <View style={Styles.CommonCell.textContainer}>
        <Text style={Styles.CommonCell.headline}>{title}</Text>
        {details.map((detail, index) => (
          <Text style={Styles.CommonCell.details} key={index}>
            {detail}
          </Text>
        ))}
        <Text style={Styles.CommonCell.text}>
          {shortString(description, 90)}
        </Text>
      </View>
    </View>
  </TouchableOpacity>
);