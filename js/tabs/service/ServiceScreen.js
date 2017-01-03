// @flow
'use strict';

import React, { Component } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import CampusHeader from '../../util/CampusHeader';

import {
  linksAccounts,
  linksEmergency,
  linksFreetime,
  linksStudy,
} from './Links';
import LinksList from './LinksList';
import Submenu from './Submenu';

export default class ServiceScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedContent: {name: 'submenu', label: 'Service'}
    };
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
      },
      {label: 'Bibliothek',icon: require('./img/study.png'),
      }, {
        label: 'Freizeit',
        icon: require('./img/sun.png'),
        onPress: this._onContentSelect.bind(
          this, {name: 'freetime', label: 'Freizeit'}),
      },
      {label: 'Feedback', icon: require('./img/mail.png'),
      },
      {label: 'Einstellungen',icon: require('./img/settings.png'),
      },
    ];

    if(Platform.OS === "ios"){
      submenuItems.push(
        {label: "Über", icon: require('./img/about.png'),
        },
        {label: "Haftung", icon: require('./img/disclaimer.png'),
        },
        {label: "Impressum", icon: require('./img/imprint.png'),
        },
        {label: "Datenschutz", icon: require('./img/privacy.png'),
        },
      );
    }
    return submenuItems;
  }

  _onContentSelect(newContent) {
    this.setState({selectedContent: newContent});
    // if(Platform.OS === 'android'){
    //   BackAndroid.addEventListener('hardwareBackPress', this.onBackPress.bind(this));
    // }
  }

  _getContent() {
    switch(this.state.selectedContent.name){
      case 'submenu': return <Submenu menuItems={this._getSubmenuItems()}/>;
      case 'accounts': return (<LinksList title='Service-Zugänge' links={linksAccounts} />);
      case 'emergency': return (<LinksList title='Hilfe im Notfall' links={linksEmergency} />);
      case 'study': return (<LinksList title='Studium' links={linksStudy} />);
      case 'freetime': return (<LinksList title='Freizeit' links={linksFreetime} />);
      // case 'feedback': return (<Feedback/>);
      // case 'settings': return (<Settings/>);
      // case 'about': return (<About/>);
      // case 'disclaimer': return (<Disclaimer/>);
      // case 'imprint': return (<Imprint/>);
      // case 'privacy': return (<Privacy/>);
    };
  }

  render() {
    return(
      <View style={styles.screenContainer}>
        <CampusHeader title={this.state.selectedContent.label}/>
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
