// @flow
import React, { Component } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import Colors from './Colors';
import PagerTab from './PagerTab';

export default class TabbedSwipeView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedIndex: this.props.selectedIndex || 0,
      initialSelectedIndex: this.props.selectedIndex || 0,
      pageWidth: 0,
      pageHeight: 0,
      scrollingTo: null
    };

    this._handleHorizontalScroll = this._handleHorizontalScroll.bind(this);
    this._getPageSize = this._getPageSize.bind(this);
  }

  // store width and height of a page (callback for layout of scrollview)
  _getPageSize(event) {
    this.setState({
      pageWidth: event.nativeEvent.layout.width,
      pageHeight: event.nativeEvent.layout.height
    });
  }

  // callback for scroll/swipe events, adopted from F8 sample app
  // https://github.com/fbsamples/f8app/blob/master/js/common/ViewPager.js
  _handleHorizontalScroll(event) {
    // get current index we are currently scrolling/swaping to
    let selectedIndex = event.nativeEvent.position;
    if (selectedIndex === undefined) {
      selectedIndex = Math.round(
        event.nativeEvent.contentOffset.x / this.state.pageWidth
      );
    }

    // do nothing if swiping gets out of range
    if (selectedIndex < 0 || selectedIndex >= this.props.count) return;

    // do nothing if requested scrolling position has not yet been reached
    if (
      this.state.scrollingTo !== null &&
      this.state.scrollingTo !== selectedIndex
    ) {
      return;
    }

    // position has been reached, set new state
    this.setState({ selectedIndex, scrollingTo: null });
  }

  _swipeToPage(index) {
    if (index === this.state.selectedIndex) return;
    this._scrollView.scrollTo({
      x: index * this.state.pageWidth,
      animated: true
    });
    this.setState({ scrollingTo: index });
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

    const { pageWidth, pageHeight } = this.state;
    const dimensions = { width: pageWidth, height: pageHeight };
    const pages = this.props.pages.map((page, index) => (
      <View style={[styles.card, dimensions]} key={'p' + index}>
        {page.content}
      </View>
    ));

    return (
      <View style={styles.container}>
        <View style={styles.segmentsContainer}>{tabs}</View>
        <ScrollView
          style={styles.scrollview}
          ref={scrollView => {
            this._scrollView = scrollView;
          }}
          contentOffset={{
            x: this.state.pageWidth * this.state.initialSelectedIndex,
            y: 0
          }}
          horizontal={true}
          pagingEnabled={true}
          scrollsToTop={false}
          bounces={false}
          onScroll={this._handleHorizontalScroll}
          scrollEventThrottle={100}
          removeClippedSubviews={true}
          automaticallyAdjustContentInsets={false}
          directionalLockEnabled={true}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          onLayout={this._getPageSize}
        >
          {pages}
        </ScrollView>
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
    paddingBottom: 6,
    justifyContent: 'space-around'
  },
  scrollview: {
    flex: 1,
    backgroundColor: 'transparent'
  },
  card: {
    backgroundColor: 'transparent'
  }
});
