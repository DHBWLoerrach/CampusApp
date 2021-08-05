import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import ResponsiveImage from '../../../util/ResponsiveImage';

function StuVNewsDetails({ route }) {
  const { news } = route.params;

  return (
    <ScrollView contentContainerStyle={styles.scrollView}>
      {news.images.banner ? (
        <ResponsiveImage image={news.images.banner} />
      ) : null}
      <View style={styles.container}>
        <Text style={styles.headline}>{news.title}</Text>
        <Text>{news.text}</Text>
      </View>
    </ScrollView>
  );
}
export default StuVNewsDetails;

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: 'white',
  },
  container: {
    margin: 10,
  },
  headline: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});
