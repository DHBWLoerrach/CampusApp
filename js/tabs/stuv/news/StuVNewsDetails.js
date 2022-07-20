import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import ResponsiveImage from '../../../util/ResponsiveImage';
import Styles from '../../../Styles/StyleSheet';

function StuVNewsDetails({ route }) {
  const { news } = route.params;

  return (
    <ScrollView contentContainerStyle={Styles.StuVNewsDetails.scrollView}>
      {news.images.banner ? (
        <ResponsiveImage image={news.images.banner} />
      ) : null}
      <View style={Styles.StuVNewsDetails.container}>
        <Text style={Styles.StuVNewsDetails.headline}>{news.title}</Text>
        <Text>{news.text}</Text>
      </View>
    </ScrollView>
  );
}
export default StuVNewsDetails;
