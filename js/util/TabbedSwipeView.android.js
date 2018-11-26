import React, { Component } from 'react';
import { StyleSheet, Text, View, ViewPagerAndroid } from 'react-native';

import Colors from './Colors';
import PagerTab from './PagerTab';

export default class TabbedSwipeView extends Component {
  constructor(props) {
    super(props);
    this.state = { selectedIndex: this.props.selectedIndex || 0 };
  }

  _onPageSelected = event => {
    const selectedIndex = event.nativeEvent.position;
    this.setState({ selectedIndex });
  };

  _swipeToPage(index) {
    if (index === this.state.selectedIndex) return;
    this.setState({ selectedIndex: index });
    this._viewPager.setPage(index);
  }

  componentDidUpdate(prevProps, prevState) {
    // dispatch tab change event if selected tab changed
    if (
      this.props.onTabChanged &&
      this.state.selectedIndex !== prevState.selectedIndex
    ) {
      this.props.onTabChanged(this.state.selectedIndex);
    }
  }

  render() {
    const tabs = this.props.pages.map((page, index) => (
      <PagerTab
        key={'t' + index}
        title={page.title}
        isSelected={index === this.state.selectedIndex}
        onPress={() => this._swipeToPage(index)}
      />
    ));
    const pages = this.props.pages.map((page, index) => (
      <View key={'p' + index}>{page.content}</View>
    ));
    return (
      <View style={styles.container}>
        <View style={styles.segmentsContainer}>{tabs}</View>
        <ViewPagerAndroid
          style={styles.container}
          initialPage={this.props.selectedIndex}
          onPageSelected={this._onPageSelected}
          ref={viewPager => {
            this._viewPager = viewPager;
          }}
        >
          {pages}
        </ViewPagerAndroid>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  segmentsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.dhbwRed,
    paddingLeft: 16
  }
});
