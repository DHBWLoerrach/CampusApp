import React from 'react';
import { StyleSheet, View } from 'react-native';
import TabbedSwipeView from '../../util/TabbedSwipeView.ios';
import StuVEvents from './events/StuVEvents';
import StuVNews from './news/StuVNews';

function getPages() {
  return [
    { title: 'StuV-News', content: <StuVNews /> },
    { title: 'StuV-Events', content: <StuVEvents /> },
  ];
}

function StuVScreen() {
  return (
    <View style={styles.container}>
      <TabbedSwipeView pages={getPages()} />
    </View>
  );
}

export default StuVScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
