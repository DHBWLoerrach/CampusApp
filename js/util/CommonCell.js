import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Colors from '../util/Colors';
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
    style={styles.entry}
    activeOpacity={0.7}
    onPress={onPress}
  >
    <View style={styles.container}>
      <Image
        source={imageSource}
        style={[styles.image, imageStyle]}
      />
      <View style={styles.textContainer}>
        <Text style={styles.headline}>{title}</Text>
        {details.map((detail, index) => (
          <Text style={styles.details} key={index}>
            {detail}
          </Text>
        ))}
        <Text style={styles.text}>
          {shortString(description, 90)}
        </Text>
      </View>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  entry: {
    backgroundColor: Colors.veryLightGray,
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    marginHorizontal: 10,
    shadowColor: 'black', // iOS and Android API-Level >= 28
    shadowOffset: {
      // effects iOS only!
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25, // effects iOS only!
    shadowRadius: 2.5, // effects iOS only!
    elevation: 4, // needed only for Android
  },
  container: {
    flex: 1,
    justifyContent: 'space-around',
    flexDirection: 'row',
  },
  image: {
    marginTop: 'auto',
    marginBottom: 'auto',
    flex: 1,
    marginRight: 10,
    resizeMode: 'contain',
  },
  textContainer: {
    flex: 2,
  },
  headline: {
    fontSize: 18,
    color: Colors.dhbwRed,
    fontWeight: 'bold',
  },
  text: {
    color: '#262626',
  },
  details: {
    color: 'black',
    fontWeight: 'bold',
  },
});
