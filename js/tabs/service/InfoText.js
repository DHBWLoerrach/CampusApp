import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

export default function InfoText({ route }) {
  return (
    <View style={styles.container}>
      <ScrollView>{route.params?.text}</ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
});
