import React, {Component, useContext} from 'react';
import {Image, View} from 'react-native';
import {WebView} from 'react-native-webview';
import Styles from '../../Styles/StyleSheet';
import {ColorSchemeContext} from "../../context/ColorSchemeContext";

// Part of the web code from "https://dhbw-loerrach.de/360-grad-tour" which is responsible for embedding pano2vr player
const web_view_html = `
<div class="csc-default csc-html">
    <div id="c7744" class="frame frame-default frame-type-html frame-layout-0 frame-space-before-small">
      <script type="text/javascript"
        src="https://www.dhbw-loerrach.de/fileadmin/standards_homepage/3d-touren/2021-05-31_campus/pano2vr_player.js"></script>
      <script type="text/javascript" src="https://www.dhbw-loerrach.de/fileadmin/standards_homepage/3d-touren/2021-05-31_campus/skin.js"></script>
      <link rel="stylesheet"
        href="https://www.dhbw-loerrach.de/fileadmin/standards_homepage/3d-touren/2021-05-31_campus/3rdparty/leaflet/leaflet.css" />
      <script src="https://www.dhbw-loerrach.de/fileadmin/standards_homepage/3d-touren/2021-05-31_campus/3rdparty/leaflet/leaflet.js"></script>
      <div id="container" style="left:0px; right:0px;height: 640px;overflow:hidden; background-color:#ddd;">
        <br>Loading...<br><br>
      </div>
      <script type="text/javascript">
        var pano_path = "https://www.dhbw-loerrach.de/fileadmin/standards_homepage/3d-touren/2021-05-31_campus/pano.xml";

        // create the panorama player with the container
        pano = new pano2vrPlayer("container");
        // add the skin object
        skin = new pano2vrSkin(pano, '?');
        // load the configuration

        window.addEventListener("load", function () {
          pano.readConfigUrlAsync(pano_path);
        });
      </script>
      <noscript>
        <p><b>Please enable Javascript!</b></p>
      </noscript>
    </div>
</div>`

const enterPanoFullscreen = `(function() {
    pano.enterFullscreen();
})();` 

// WebView Component for rendering the HTML code 
class CampusTourWebViewHTML extends Component {
    render() {
        return (
            <WebView
                originWhiteList={['*']}
                //source={{ html: web_view_html}}
                source={{uri: "https://dhbw-loerrach.de/player360"}}
                injectedJavaScript={enterPanoFullscreen}
            />
        );
    }
}


export default function CampusTour(){
  const colorContext = useContext(ColorSchemeContext);
    return (
        <View style={[Styles.InfoImage.container, {backgroundColor: colorContext.colorScheme.background}]}>
          <CampusTourWebViewHTML/>
        </View>
    );
}