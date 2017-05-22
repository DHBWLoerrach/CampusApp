// @flow
'use strict';

import React, { Component } from 'react';
import {
  BackHandler,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import CampusHeader from '../../util/CampusHeader';

import About from './About';
import Disclaimer from './Disclaimer';
import Feedback from './Feedback';
import Imprint from './Imprint';
import {
  linksAccounts,
  linkBib,
  linksEmergency,
  linksFreetime,
  linksStudy,
} from './Links';
import LinksList from './LinksList';
import Privacy from './Privacy';
import Settings from './Settings';
import Submenu from './Submenu';
import { textCafeteriaKKH, textHieber } from './Texts';


export default class ServiceScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedContent: {name: 'submenu', label: 'Service'}
    };

    this._onBackPress = this._onBackPress.bind(this);
  }

  _sectionsForKBC() {
    return [{
      title: 'Cafeteria im KKH',
      onPress: this._onContentSelect.bind(
        this, {name: 'cafeteriaKKH', label: 'Cafeteria im KKH',
          prevState: {name: 'kbc', label: 'Angebote bei der KBC'}})
      }, {
      title: "Hieber's Frische Center",
      onPress: this._onContentSelect.bind(
        this, {name: 'hieber', label: "Hieber's Frische Center",
          prevState: {name: 'kbc', label: 'Angebote bei der KBC'}})
      }];
  }

  _onContentSelect(newContent) {
    this.setState({selectedContent: newContent});
    if(Platform.OS === 'android'){
      BackHandler.addEventListener('hardwareBackPress', this._onBackPress);
    }
  }

  _onBackPress(){
    if(this.state.selectedContent.name !== 'submenu'){
      if(Platform.OS === 'android'){
        BackHandler.removeEventListener('hardwareBackPress', this._onBackPress);
      }
      if(this.state.selectedContent.prevState) {
        this.setState({selectedContent: this.state.selectedContent.prevState})
      } else {
        this.setState({selectedContent: {name: 'submenu', label: 'Service'}})
      }
      return true; // Back button handled
    }
    return false;
  }

  _getSubmenuItems() {
    var submenuItems = [{
        label: 'Service-Zugänge',
        icon: require('./img/screen.png'),
        onPress: this._onContentSelect.bind(
          this, {name: 'accounts', label: 'Service-Zugänge'}),
      }, {
        label: 'Hilfe im Notfall',
        icon: require('./img/phone.png'),
        onPress: this._onContentSelect.bind(
          this, {name: 'emergency', label: 'Hilfe im Notfall'}),
      }, {
        label: 'Studium',
        icon: require('./img/school.png'),
        onPress: this._onContentSelect.bind(
          this, {name: 'study', label: 'Studium'}),
      }, {
        label: 'Bibliothek',
        icon: require('./img/study.png'),
        onPress: this._openLink.bind(this, linkBib),
      }, {
        label: 'Angebote bei der KBC',
        icon: require('./img/kbc.png'),
        onPress: this._onContentSelect.bind(
          this, {name: 'kbc', label: 'Angebote bei der KBC'}),
      }, {
        label: 'Freizeit',
        icon: require('./img/sun.png'),
        onPress: this._onContentSelect.bind(
          this, {name: 'freetime', label: 'Freizeit'}),
      }, {
        label: 'Feedback',
        icon: require('./img/mail.png'),
        onPress: this._onContentSelect.bind(
          this, {name: 'feedback', label: 'Feedback'}),
      }, {
        label: 'Einstellungen',
        icon: require('./img/settings.png'),
        onPress: this._onContentSelect.bind(
          this, {name: 'settings', label: 'Einstellungen'}),
      },
    ];

    if(Platform.OS === "ios") {
      submenuItems.push({
        label: 'Über',
        icon: require('./img/about.png'),
        onPress: this._onContentSelect.bind(
          this, {name: 'about', label: 'Über diese App'}),
      }, {
        label: 'Haftung',
        icon: require('./img/disclaimer.png'),
        onPress: this._onContentSelect.bind(
          this, {name: 'disclaimer', label: 'Haftung'}),
      }, {
        label: 'Impressum',
        icon: require('./img/imprint.png'),
        onPress: this._onContentSelect.bind(
          this, {name: 'imprint', label: 'Impressum'}),
      }, {
        label: 'Datenschutz',
        icon: require('./img/privacy.png'),
        onPress: this._onContentSelect.bind(
          this, {name: 'privacy', label: 'Datenschutz'}),
      },);
    }
    return submenuItems;
  }

  _openLink(url) {
    Linking.openURL(url);
  }

  _getContent() {
    switch(this.state.selectedContent.name){
      case 'submenu': return <Submenu menuItems={this._getSubmenuItems()}/>;
      case 'accounts': return (<LinksList title='Service-Zugänge' links={linksAccounts} />);
      case 'emergency': return (<LinksList title='Hilfe im Notfall' links={linksEmergency} />);
      case 'study': return (<LinksList title='Studium' links={linksStudy} />);
      case 'kbc': return (<LinksList title='Angebote beim Bürogebäude KBC' links={this._sectionsForKBC()} />);
      case 'freetime': return (<LinksList title='Freizeit' links={linksFreetime} />);
      case 'feedback': return (<Feedback/>);
      case 'settings': return (<Settings/>);
      case 'about': return (<About/>);
      case 'disclaimer': return (<Disclaimer/>);
      case 'imprint': return (<Imprint/>);
      case 'privacy': return (<Privacy/>);
      case 'cafeteriaKKH': return textCafeteriaKKH();
      case 'hieber': return textHieber();
    };
  }

  render() {
    let leftActionItem = null;
    if(this.state.selectedContent.name !== 'submenu') {
      leftActionItem = {
        title: 'Back',
        icon: require('../../img/arrow-back.png'),
        onPress: this._onBackPress.bind(this),
      }
    };

    return(
      <View style={styles.screenContainer}>
        <CampusHeader
          title={this.state.selectedContent.label}
          leftActionItem={leftActionItem}
        />
        <ScrollView>{this._getContent()}</ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
});
