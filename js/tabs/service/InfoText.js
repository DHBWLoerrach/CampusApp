import React from 'react';
import { ScrollView, View } from 'react-native';
import Styles from '../../Styles/StyleSheet';

export default function InfoText({ route }) {
  return (
    <View style={Styles.InfoText.container}>
      <ScrollView>{route.params?.text}</ScrollView>
    </View>
  );
}
