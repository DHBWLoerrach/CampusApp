import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View, Switch } from 'react-native';

import { RoleContext } from '../../CampusApp';
import RoleSelection from './RoleSelection';
import { textPersonCategory } from './Texts';
import {dhbwGray, dhbwRed} from "../../util/Colors";
import NotificationSettings from "../../util/NotificationSettings";

export default function () {
    return (
        <View style={styles.container}>
          <Text style={styles.text}>{textPersonCategory}</Text>
          <RoleContext.Consumer>{
            ({ role, changeRole }) =>  <RoleSelection role={role} onRoleChange={changeRole}/>
          }</RoleContext.Consumer>
          <NotificationSettings/>
        </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 15
  },
});
