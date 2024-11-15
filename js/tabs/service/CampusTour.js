import React, { Component, useContext } from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';
import Styles from '../../Styles/StyleSheet';
import { ColorSchemeContext } from '../../context/ColorSchemeContext';

const enterPanoFullscreen = `(function() {
    pano.enterFullscreen();
})();`;

// WebView Component for rendering the HTML code
class CampusTourWebViewHTML extends Component {
  render() {
    return (
      <WebView
        originWhiteList={['*']}
        source={{ uri: 'https://dhbw-loerrach.de/player360' }}
        injectedJavaScript={enterPanoFullscreen}
      />
    );
  }
}

export default function CampusTour() {
  const colorContext = useContext(ColorSchemeContext);
  return (
    <View
      style={[
        Styles.InfoImage.container,
        { backgroundColor: colorContext.colorScheme.background },
      ]}
    >
      <CampusTourWebViewHTML />
    </View>
  );
}
