import React, {useContext} from 'react';
import {
  Image,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Styles from '../Styles/StyleSheet';
import { shortString } from '../tabs/stuv/helper';
import {ColorSchemeContext} from "../context/ColorSchemeContext";

export default ({
  imageSource,
  imageStyle,
  title,
  details = [],
  description,
  onPress,
}) => {
  const colorContext = useContext(ColorSchemeContext);

  return (
  <TouchableOpacity
    style={[Styles.General.cardShadow, Styles.CommonCell.entry, {backgroundColor: colorContext.colorScheme.card}]}
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
          <Text style={[Styles.CommonCell.details, {color: colorContext.colorScheme.text}]} key={index}>
            {detail}
          </Text>
        ))}
        <Text style={{color: colorContext.colorScheme.text}}>
          {shortString(description, 90)}
        </Text>
      </View>
    </View>
  </TouchableOpacity>
)};