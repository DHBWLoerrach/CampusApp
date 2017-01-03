// @flow
'use strict';

import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

export const textAbout =
  'Die Idee zu dieser Campus App entstand auf Initiative der StuV in enger ' +
  'Zusammenarbeit mit dem Rektorat und der Verwaltung der DHBW Lörrach. Das ' +
  'Konzept basiert auf den Ergebnissen einer großen Umfrage der StuV unter ' +
  'allen Studierenden im Herbst 2015. Die App wurde von Studierenden für ' +
  'Studierende der DHBW Lörrach entwickelt. Die Konzeption und Umsetzung ' +
  'erfolgte im Rahmen verschiedener Lehrveranstaltungen des Studienzentrums ' +
  'für Informatik und IT-Management (SZI) durch Studierende der Kurse TIF13, ' +
  'WWI13B-SE und WWI13C-AM unter der Leitung von Prof. Dr. Erik Behrends.\n\n' +
  'Die Campus App soll kontinuierlich weiterentwickelt werden. Dafür freuen ' +
  'wir uns auf Euer Feedback und Eure Verbesserungsvorschläge:\n';

export const textDisclaimerIntro =
 'Mit dem ersten Start der Campus App der DHBW Lörrach wurde folgender ' +
 ' Regelung zugestimmt: \n';

export const textDisclaimer =
  'Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. ' +
  'Ich nehme zur Kenntnis, dass für die Richtigkeit, Vollständigkeit und ' +
  'Aktualität der Inhalte keine Gewähr übernommen werden kann. ' +
  'Im Zweifelsfall ist insbesondere der Online-Stundenplan zu prüfen.';

export const textFeedback =
  'Falls du Fehler oder Verbesserungsvorschläge melden möchtest, schicke uns ' +
  'bitte eine E-Mail. Wir freuen uns über dein Feedback.';

export function textImprint() {
  return(
  <View style={styles.container}>
    <Text style={styles.text}>
        Duale Hochschule Baden-Württemberg Lörrach{"\n"}
        Hangstraße 46-50{"\n"}
        79539 Lörrach{"\n"}
        Fon +49 7621 2071 - 0{"\n"}
        info@dhbw-loerrach.de{"\n"}
        http://www.dhbw-loerrach.de{"\n"}{"\n"}
        Umsatzsteuer-Identifikationsnummer gemäß §27a Umsatzsteuergesetz: DE287664832{"\n"}
    </Text>
    <Text style={styles.headline}>
        Rechtsform und zuständige Aufsichtsbehörde
    </Text>
    <Text style={styles.text}>
        Die Duale Hochschule Baden-Württemberg ist nach § 1 Abs. 1 DH-ErrichtG vom 12.12.2008 eine rechtsfähige Körperschaft des öffentlichen Rechts und zugleich staatliche Einrichtung. Die Duale Hochschule Baden-Württemberg Lörrach ist nach § 1 Abs. 2 DH-ErrichtG vom 12.12.2008 eine rechtlich unselbständige Untereinheit dieser Hochschule.{"\n"}{"\n"}
        Dienstanbieter im Sinne des TDG bzw. des MDStV ist als Träger der Dualen Hochschule das Land Baden-Württemberg vertreten durch die Ministerin für Wissenschaft, Forschung und Kunst Theresia Bauer, MdL.{"\n"}{"\n"}
        Zuständige Aufsichtsbehörde:{"\n"}
        Ministerium für Wissenschaft, Forschung und Kunst{"\n"}
        Baden-Württemberg{"\n"}
        Königstraße 46{"\n"}
        70173 Stuttgart{"\n"}
        Telefon: +49 711 279 - 0{"\n"}
        Telefax: +49 711 279 - 3081{"\n"}
        poststelle@mwk.bwl.de{"\n"}
        http://www.mwk.bwl.de{"\n"}
    </Text>
    <Text style={styles.headline}>
        Externe Links
    </Text>
    <Text style={styles.text}>
        Die Campus App enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen Einfluss haben und für welche die DHBW Lörrach keine Gewähr übernehmen kann. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar. Es ist nicht auszuschließen, dass die Inhalte im Nachhinein von den jeweiligen Anbietern verändert werden. Sollten Sie der Ansicht sein, dass die verlinkten externen Seiten gegen geltendes Recht verstoßen oder sonst unangemessene Inhalte enthalten, teilen Sie uns dies bitte mit.
    </Text>
    <Text style={styles.headline}>
        Urheberrecht
    </Text>
    <Text style={styles.text}>
        Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden die Urheberrechte Dritter beachtet. Insbesondere werden Inhalte Dritter als solche gekennzeichnet. Sollten Sie trotzdem auf eine Urheberrechtsverletzung aufmerksam werden, bitten wir um einen entsprechenden Hinweis. Bei Bekanntwerden einer Urheberrechtsverletzung wird der Inhalte umgehend entfernt bzw. mit dem entsprechenden Urheberrechts-Vermerk kenntlich gemacht.
    </Text>
  </View>
)};

export function textPrivacy() {
  return(
  <View style={styles.container}>
    <Text style={styles.text}>
        Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Ich nehme zur Kenntnis, dass für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte keine Gewähr übernommen werden kann. Im Zweifelsfall ist insbesondere der Online-Stundenplan zu prüfen.{"\n"}
        Die Campus App ist frei zugänglich. Für die Nutzung müssen keine personenbezogenen Daten eingegeben werden. Der Zugriff auf die Campus App der DHBW Lörrach wird durch die App-Stores protokolliert, erfolgt jedoch nicht personenbezogen. Damit kann vom Betreiber der App nicht nachvollzogen werden, auf welche Seiten einzelne Benutzer zugegriffen bzw. welche Funktionen sie genutzt haben.
    </Text>
    <Text style={styles.headline}>
        Ansprechpartner
    </Text>
    <Text style={styles.text}>
        Zu Fragen bzgl. des Datenschutzes wenden Sie sich bitte an den Datenschutzbeauftragten der DHBW Lörrach:{"\n"}{"\n"}
        Prof. Dr. Lutz-Peter Kurdelski{"\n"}
        Professor für Lehraufgaben{"\n"}
        Tel: +49 7621 2071 423{"\n"}
        kurdelski@dhbw-loerrach.de{"\n"}{"\n"}

        Anschrift{"\n"}
        Duale Hochschule Baden-Württemberg Lörrach{"\n"}
        Hangstraße 46-50{"\n"}
        79539 Lörrach{"\n"}
        Tel: +49 7621 2071 0{"\n"}
        info@dhbw-loerrach.de{"\n"}
    </Text>
  </View>
)};

export const textSettings =
  'Hier kannst du deine Rolle ändern. Je nach ausgewählter Rolle werden ' +
  'Dir unterschiedliche Preise im Speiseplan der Mensa angezeigt.\n\n';

const styles = StyleSheet.create({
  container: {
    padding: 15,
  },
  headline: {
    fontSize: 20,
    marginTop: 20,
  }
});
