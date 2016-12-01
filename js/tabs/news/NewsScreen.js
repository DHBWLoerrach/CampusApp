// @flow
'use strict';

import React, { Component } from 'react';
import {
  ListView,
  NavigationExperimental,
  StyleSheet,
  View,
  WebView,
} from 'react-native';

import Colors from '../../util/Colors';
import CampusHeader from '../../util/CampusHeader';
import CampusListView from '../../util/CampusListView';
import NewsItem from '../../util/types.js';

import NewsCell from './NewsCell';

const {
  CardStack: NavigationCardStack,
  StateUtils: NavigationStateUtils,
} = NavigationExperimental;

class NewsList extends Component {
  constructor(props) {
    super(props);
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      dataSource: ds.cloneWithRows([
        {heading: 'News1 News1 News1 News1 News1 News1 News1 News1 News1 News1 News1 News1 News1', subheading: 'Foobar'},
        {heading: 'Angespannte Parkplatzsituation zum Studieninformationstag erwartet', subheading: 'Blabla'},
        {heading: 'News3', subheading: 'OneTwoThree und so weiter immer weiter eins123'},
        {heading: 'News3', subheading: 'OneTwoThree und so weiter immer weiter eins123'},
        {heading: 'News3', subheading: 'OneTwoThree und so weiter immer weiter eins123'},
        {heading: 'News3', subheading: 'OneTwoThree und so weiter immer weiter eins123'},
        {heading: 'News3', subheading: 'OneTwoThree und so weiter immer weiter eins123'},
        {heading: 'News3', subheading: 'OneTwoThree und so weiter immer weiter eins123'},
        {heading: 'News3', subheading: 'OneTwoThree und so weiter immer weiter eins123'},
        {heading: 'News3', subheading: 'OneTwoThree und so weiter immer weiter eins123'},
        {heading: 'News3', subheading: 'OneTwoThree und so weiter immer weiter eins123'},
      ]),
    };

    this._renderRow = this._renderRow.bind(this);
  }

  _renderRow(newsItem: NewsItem) {
    return(<NewsCell news={newsItem} onPress={this.props.onPressNewsItem}/>);
  }

  render() {
    return (
      <View>
        <CampusHeader title="News"/>
        <CampusListView
          dataSource={this.state.dataSource}
          renderRow={this._renderRow}
        />
      </View>
    );
  }
}

class NewsDetail extends Component {
  render() {
    const styles = StyleSheet.create({
      webContainer: {
        flex: 1
      }
    });

    const title = '„Jetzt liegt es an uns!“';
    const description = 'DHBW Lörrach verabschiedet ihre Absolventen';
    const img = '<img src="https://www.dhbw-loerrach.de/index.php?eID=tx_nawsecuredl&u=0&g=0&t=1480417426&hash=1b37de338234132444b7b5fcfefefc0bdbf5293a&file=typo3temp/_processed_/csm_161119_Absolventenfeier_2016_46_web_0040a003ee.jpg" width="250" height="250" alt="" border="0">';

    const HTML = `
    <!DOCTYPE html>\n
    <html>
      <head>
        <style>
          body {font-family: -apple-system;}
          h1 {color: ${Colors.dhbwRed};}
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <h2>${description}</h2>
        ${img}
        <br><br><div>Mit den Worten „Sie haben alle Voraussetzungen für ein spannendes und ausfüllendes Leben: Machen Sie etwas daraus!“ verabschiedete Prof. Dr. Theodor Sproll, Rektor der DHBW Lörrach, mehr als 500 Absolventinnen und Absolventen, die in diesem Herbst ihr duales Bachelor-Studium in Lörrach erfolgreich beendet haben. Am Samstagabend feierten die frischgebackenen Hochschulabsolventen mit vielen Angehörigen und Hochschulmitgliedern im Basler Congress Center diesen wichtigen und wegweisenden Lebensabschnitt.
     In seiner Rede hob Rektor Sproll hervor, dass die Absolventinnen und Absolventen wegen ihres Fachwissens und Talents von der Arbeitswelt dringend erwartet werden. Die DHBW Lörrach dürfe behaupten, so Sproll, einen wichtigen Anteil an der positiven Entwicklung in der Stadt, der Region und ganz Baden-Württemberg zu leisten. Um diese Attraktivität zu erhalten, müsse kontinuierlich an am Ausbau der Stärken der Region gearbeitet werden. „Es bedarf junger Talente wie Ihnen, die ihren wichtigen Beitrag zur wirtschaftlichen und gesellschaftlichen Entwicklung beitragen können“, so Sproll. Ebenso wichtig wie das notwendige technische Rüstzeug sei für die jungen Menschen aber auch das Gespür und Geschick, sich in unterschiedlichen Kulturen bewegen zu können und die Unterschiedlichkeit als Stärke nutzen zu können.
     Die Absolventinnen und Absolventen sieht der Lörracher Rektor für eine Zukunft mit permanenten und immer schnelleren Veränderungen bestens gerüstet. Wichtig sei dabei vor allem die Bereitschaft, sich permanent mit diesen Änderungen auseinanderzusetzen und die Bereitschaft, diese auch positiv zu gestalten.&nbsp;</div>
     <div>Auch persönlich zeigte sich der Rektor sehr stolz auf die Studentinnen und Studenten an der DHBW Lörrach: „Ich erlebe viele von Ihnen als äußerst engagiert und verantwortungsbewusst.“ In diesem Zusammenhang bedankte sich Professor Sproll auch bei den scheidenden Mitgliedern der Studierendenvertretung, die einen wichtigen Beitrag zur positiven Entwicklung der Lörracher Hochschule geleistet und immer konstruktiv mit dem Rektorat zusammengearbeitet haben.
     Die traditionelle Absolventen-Rede als Schlusspunkt des offiziellen Programms hielt Felix Gerbig, der sein duales Informatik-Studium erfolgreich mit dem Bachelor of Science abgeschlossen hat. In seiner launigen Präsentation schilderte er nicht nur das Studentenleben in Lörrach, sondern erinnerte an die vielen hervorragenden Dozenten und engagierten Mitarbeiter an der DHBW sowie der beteiligten Partnerunternehmen. Stolz verwies der ehemalige Studierendensprecher darauf, dass alle Absolventinnen und Absolventen trotz der Doppelbelastung in Theorie und Praxis ihr Bachelor-Studium in der Regelstudienzeit von sechs Semestern absolviert haben. Zugleich hätten sie bereits frühzeitig während des Studiums gelernt, Verantwortung für sich und andere zu übernehmen. Abschließend rief Felix Gerbig seine Kommilitonen daher auch dazu auf, dies weiterhin zu tun: „Die Ereignisse in diesem Jahr haben gezeigt, was passieren kann, wenn eine junge Generation nicht laut genug widerspricht, nicht wählen geht und wenn Fakten und Wahrheiten weniger laut sind als Parolen. Durch das Studium an der DHBW haben wir die besten Voraussetzungen dafür bekommen, die richtigen Entscheidungen zu treffen. Jetzt liegt es an uns!“
     Für die musikalische Gestaltung sorgten wie auch schon im Vorjahr SameDay Records, die mit Gitarren und Cajon für Stimmung sorgten.</div>
      </body>
    </html>
    `;

    const leftActionItem = {
      title: 'Back',
      icon: require('../../img/arrow-back.png'),
      onPress: this.props.backAction,
    };
    return(
      <View style={styles.webContainer}>
        <CampusHeader title="News" leftActionItem={leftActionItem}/>
        <WebView contentInset={{bottom: 50}}
          source={{html: HTML}}
          bounces={false}
        />
      </View>
    );
  }
}

export default class NewsScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      navigationState: {
        index: 0,
        routes: [{key: 'News'}],
      },
    };

    this._onNavigationChange = this._onNavigationChange.bind(this);
    this._renderScene = this._renderScene.bind(this);

    this._onPushRoute = this._onNavigationChange.bind(null, 'push');
    this._onPopRoute = this._onNavigationChange.bind(null, 'pop');
    // this._handleBackButton = this._handleBackButton.bind(this);
  }

  // TODO: just in case if Android's back button does not work out of the box
  // componentDidMount() {
  //   BackAndroid.addEventListener('hardwareBackPress', this._handleBackButton);
  // }
  //
  // componentWillUnmount() {
  //   BackAndroid.removeEventListener('hardwareBackPress', this._handleBackButton);
  // }
  //
  // _handleBackButton() {
  //   if (this.state.navigationState.index === 0) {
  //     return false;
  //   }
  //   this._onPopRoute();
  //   return true;
  // }

  _onNavigationChange(type) {
    let {navigationState} = this.state;
    switch (type) {
      case 'push':
        const route = {key: 'Route-' + Date.now()};
        navigationState = NavigationStateUtils.push(navigationState, route);
        break;

      case 'pop':
        navigationState = NavigationStateUtils.pop(navigationState);
        break;
    }

    if (this.state.navigationState !== navigationState) {
      this.setState({navigationState});
    }
  }

  _renderScene(sceneProps) {
    if(sceneProps.scene.route.key === 'News') {
      return(<NewsList onPressNewsItem={this._onPushRoute}/>);
    }
    else {
      return(<NewsDetail backAction={this._onPopRoute}/>);
    }
  }

  render() {
    return(
      // TODO: Android: check if back button functions out of the box
      <NavigationCardStack
        onNavigateBack={this._onPopRoute}
        navigationState={this.state.navigationState}
        renderScene={this._renderScene}
      />
    );
  }
}
