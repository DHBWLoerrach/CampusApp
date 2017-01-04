// @flow
'use strict';

import React, { Component } from 'react';
import {
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableNativeFeedback,
  TouchableOpacity,
  View,
} from 'react-native';

import { connect } from 'react-redux';

import Colors from './util/Colors';

import { selectRole } from './tabs/service/redux';
import { textDisclaimer } from './tabs/service/Texts';
import RoleSelection from './tabs/service/RoleSelection';

const ButtonTouchable = Platform.OS === 'android'
  ? TouchableNativeFeedback
  : TouchableOpacity;

class WelcomeScreen extends Component {
  constructor(props){
    super(props);
    this.state = {
      selectedRole: 'student',
      disclaimerChecked: false,
    };
  }

  _onSubmit() {
    if(this.state.disclaimerChecked && this.state.selectedRole){
      this.props.dispatch(selectRole(this.state.selectedRole));
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <Image style={styles.headerImage} source={require('./img/drawer-header.png')}/>
        <ScrollView style={styles.contentContainer}>
          <View style={styles.header}>
            <Text style={[styles.heading, styles.welcome]}>
              Willkommen an der DHBW Lörrach
            </Text>
            <Image style={styles.logo} source={require('./img/logo.png')} />
          </View>
          <View style={styles.selection}>
            <Text style={[styles.heading, styles.selectionText]}>Ich bin:</Text>
            <RoleSelection
              role={this.state.selectedRole}
              onRoleChange={(role) => this.setState({selectedRole: role})}/>
          </View>
          <Text style={styles.disclaimer}>{textDisclaimer}</Text>
          <View style={styles.footer}>
            <View style={styles.agreeDisclaimer}>
              <Text style={styles.disclaimerLabel}>Ich stimme zu:</Text>
              <Switch
                onValueChange=
                  {(value) => this.setState({disclaimerChecked: value})}
                value={this.state.disclaimerChecked} />
            </View>
            <ButtonTouchable onPress={this._onSubmit.bind(this)}>
              <Text style={[styles.submit,
                {color: (this.state.disclaimerChecked && this.state.selectedRole) ?
                  Colors.dhbwRed : Colors.dhbwGray}]}>
                {'Start >'}
              </Text>
            </ButtonTouchable>
          </View>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerImage: {
    width: Dimensions.get('window').width,
    height: 180,
  },
  heading: {
    fontSize: 24,
    lineHeight: 27,
    fontWeight: 'bold',
  },
  logo: {
    marginLeft: 20,
    width: 60,
    height: 60,
  },
  welcome: {
    flex: 1,
    flexDirection: 'row',
    color: Colors.dhbwRed,
  },
  selection: {
    flexDirection: 'row',
    marginTop: 15,
  },
  selectionText: {
    marginRight: 20,
    marginTop: -5,
  },
  disclaimer: {
    marginTop: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  agreeDisclaimer: {
    flexDirection: 'row',
  },
  disclaimerLabel: {
    alignSelf: 'center',
    marginRight: 5,
  },
  submit: {
    fontSize: 24,
  },
});

export default connect()(WelcomeScreen);
