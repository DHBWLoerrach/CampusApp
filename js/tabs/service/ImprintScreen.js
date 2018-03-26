// @flow
import React, { Component } from 'react';
import { StyleSheet, View } from 'react-native';

import CampusHeader from '../../util/CampusHeader';
import TabbedSwipeView from '../../util/TabbedSwipeView';

import About from './About';
import InfoText from './InfoText';
import { textPrivacy, textDisclaimer, textImprint } from './Texts';

export default class ImprintScreen extends Component {
  render() {
    const pages = [
      {
        title: 'Impressum',
        content: <InfoText text={textImprint()} />
      },
      {
        title: 'Haftung',
        content: <InfoText text={textDisclaimer()} />
      },
      {
        title: 'Datenschutz',
        content: <InfoText text={textPrivacy()} />
      },
      {
        title: 'Über',
        content: <About />
      }
    ];

    return (
      <View style={styles.container}>
        <TabbedSwipeView pages={pages} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
