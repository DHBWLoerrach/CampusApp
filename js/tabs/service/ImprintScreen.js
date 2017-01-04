// @flow
'use strict';

import React, { Component } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewPagerAndroid,
} from 'react-native';

import CampusHeader from '../../util/CampusHeader';
import Colors from '../../util/Colors';

import About from './About';
import Disclaimer from './Disclaimer';
import Imprint from './Imprint';
import Privacy from './Privacy';

class PagerTab extends Component {
  props: {
    title: string;
    isSelected: boolean;
    onPress: () => void;
  };

  render() {
    let selectedTabStyle;
    if (this.props.isSelected) selectedTabStyle = { borderColor: 'white' };
    const title = this.props.title && this.props.title.toUpperCase();

    return (
      <TouchableOpacity
        onPress={this.props.onPress}
        style={[styles.pageTab, selectedTabStyle]}>
        <Text style={styles.title}>{title}</Text>
      </TouchableOpacity>
    );
  }
}

export default class ImprintScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {selectedIndex: 1};

    this._onPageSelected = this._onPageSelected.bind(this);
  }

  _swipeToPage(index) {
    this.setState({selectedIndex: index});
    this._viewPager.setPage(index - 1);
  }

  _onPageSelected(event) {
    this.setState({selectedIndex: event.nativeEvent.position + 1});
  };

  render() {
    return (
      <View style={styles.container}>
        <CampusHeader title='Impressum' style={styles.header}/>
        <View style={styles.segmentsContainer}>
          <PagerTab title='Impressum'
            isSelected={1 === this.state.selectedIndex}
            onPress={() => this._swipeToPage(1)}
          />
          <PagerTab title='Haftung'
            isSelected={2 === this.state.selectedIndex}
            onPress={() => this._swipeToPage(2)}
          />
          <PagerTab title='Datenschutz'
            isSelected={3 === this.state.selectedIndex}
            onPress={() => this._swipeToPage(3)}
          />
          <PagerTab title='Über'
            isSelected={4 === this.state.selectedIndex}
            onPress={() => this._swipeToPage(4)}
          />
        </View>
        <ViewPagerAndroid style={styles.container}
          onPageSelected={this._onPageSelected}
          ref={viewPager => { this._viewPager = viewPager; }}>
          <View>
            <ScrollView><Imprint/></ScrollView>
          </View>
          <View>
            <ScrollView><Disclaimer/></ScrollView>
          </View>
          <View>
            <ScrollView><Privacy/></ScrollView>
          </View>
          <View>
            <ScrollView><About/></ScrollView>
          </View>
        </ViewPagerAndroid>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  header: {
    elevation: 0, // disable shadow below campus header (toolbar)
  },
  container: {
    flex: 1,
  },
  segmentsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.dhbwRed,
    paddingLeft: 16,
  },
  pageTab: {
    borderColor: 'transparent',
    paddingBottom: 6,
    paddingHorizontal: 2,
    borderBottomWidth: 3,
    marginRight: 8,
  },
  title: {
    letterSpacing: 1,
    fontSize: 12,
    color: 'white',
  },
});
