import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import ResponsiveImage from '../../../util/ResponsiveImage';

function StuVNewsDetails({ route }) {
  const { news } = route.params;

  return (
    <ScrollView>
      {news.images.banner ? (
        <ResponsiveImage image={news.images.banner} />
      ) : null}
      <View style={styles.container}>
        <Text style={styles.headline}>{news.title}</Text>
        <Text style={styles.text}>{news.text}</Text>
      </View>
    </ScrollView>
  );
}
export default StuVNewsDetails;

const styles = StyleSheet.create({
  container: {
    margin: 10,
  },
  headline: {
    fontSize: 24,
    color: '#000',
    fontWeight: 'bold',
  },
  text: {
    color: '#262626',
  },
});
