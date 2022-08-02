import React from 'react';
import {
  Linking,
  ScrollView,
  Text,
  View,
} from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

import Colors from '../../Styles/Colors';
import Styles from '../../Styles/StyleSheet';

export const textAbout =
  'Die Idee zu dieser Campus App entstand auf Initiative der StuV in enger ' +
  'Zusammenarbeit mit dem Rektorat und der Verwaltung der DHBW Lörrach. Das ' +
  'Konzept basiert auf den Ergebnissen einer großen Umfrage der StuV unter ' +
  'allen Studierenden im Herbst 2015. Die App wurde von Studierenden für ' +
  'Studierende der DHBW Lörrach entwickelt. Die Konzeption und Umsetzung ' +
  'erfolgte im Rahmen verschiedener Lehrveranstaltungen des Studienzentrums ' +
  'für Informatik und IT-Management (SZI) durch Studierende ' +
  'unter der Leitung von Prof. Dr. Erik Behrends.\n\n' +
  'Die Campus App soll kontinuierlich weiterentwickelt werden. Dafür freuen ' +
  'wir uns auf Euer Feedback und Eure Verbesserungsvorschläge:\n';

export function TextCafeteriaKKH() {
  return (
    <View style={Styles.Texts.container}>
      <View style={Styles.Texts.block}>
        <Text style={Styles.Texts.headline}>Cafeteria im KKH</Text>
        <Text style={Styles.Texts.text}>
          Im fünften OG des Kreiskrankenhauses Lörrach können Sie Ihr
          Esssen in einer Cafeteria mit Sonnenterrasse und
          eindrucksvollem Panoramablick über Lörrach genießen. Das
          tägliche Mittagsangebot hält für jeden Geschmack etwas
          bereit. Die Karte wird pro Woche veröffentlicht und
          beinhaltet je ein Tagesangebot für folgende Rubriken
        </Text>
        <Text style={[Styles.Texts.text, { paddingLeft: 20 }]}>
          • Suppe {'\n'}• Deftig & Würzig {'\n'}• Leicht & Lecker{' '}
          {'\n'}• Vegetarisch & Vital {'\n'}• Dessert {'\n'}•
          Abendessen
        </Text>
      </View>
      <View style={Styles.Texts.block}>
        <Text style={Styles.Texts.headline}>Ort</Text>
        <Text style={Styles.Texts.text}>
          Spitalstraße 25
          {'\n'}
          79539 Lörrach
          {'\n'}
          5. OG
        </Text>
      </View>
      <View style={Styles.Texts.block}>
        <Text style={Styles.Texts.headline}>Mittagstisch</Text>
        <Text style={Styles.Texts.text}>
          Montag bis Freitag: 11:30 – 14:00 Uhr
        </Text>
      </View>
      <View style={Styles.Texts.block}>
        <Text style={Styles.Texts.headline}>Preise</Text>
        <Text style={Styles.Texts.text}>
          Ein Mittagessen kostet ca. 4,50 Euro. Es wird kein
          gesonderter Studierendenrabatt gewährt. Die Bezahlung
          erfolgt in bar.
          {'\n'}
        </Text>
        <Text
          style={Styles.Texts.link}
          onPress={() =>
            Linking.openURL(
              'https://www.google.de/maps/dir/Marie-Curie-Stra%C3%9Fe+4,+79539+L%C3%B6rrach/Spitalstra%C3%9Fe+25,+79539+L%C3%B6rrach/@47.6113313,7.6571084,17z/am=t/data=!4m14!4m13!1m5!1m1!1s0x4791b0966fbcb1e1:0xfc6978d1d1304112!2m2!1d7.65858!2d47.60873!1m5!1m1!1s0x4791b09109212865:0x11aee00a889d586e!2m2!1d7.65887!2d47.61412!3e2'
            )
          }
        >
          Wegbeschreibung im Browser öffnen
        </Text>
        <Text style={Styles.Texts.text}>(ca. 9 Minuten Fußweg) {'\n'}</Text>
        <Text
          style={Styles.Texts.link}
          onPress={() =>
            Linking.openURL(
              'https://dhbw-loerrach.de/mensa/cafeteria-im-kkh-loerrach'
            )
          }
        >
          Speisepläne anzeigen
        </Text>
      </View>
    </View>
  );
}

export const disclaimerText =
  'Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Ich nehme zur Kenntnis, dass für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte keine Gewähr übernommen werden kann. Im Zweifelsfall ist insbesondere der Online-Stundenplan zu prüfen.';

export function TextAgreedDisclaimer() {
  return (
    <View style={Styles.Texts.container}>
      <View style={Styles.Texts.block}>
        <Text style={Styles.Texts.text}>
          Mit dem ersten Start der DHBW Lörrach Campus App wurde
          folgender Regelung zugestimmt:
        </Text>
      </View>
      <View style={[Styles.Texts.block, { flexDirection: 'row' }]}>
        <MaterialIcon
          name="check"
          size={24}
          color={Colors.dhbwGray}
        />
        <Text style={[Styles.Texts.text, Styles.Texts.quote]}>
          {disclaimerText}
        </Text>
      </View>
      <View style={Styles.Texts.block}>
        <Text style={Styles.Texts.text}>
          Um diese Zustimmung zurückzuziehen, muss die DHBW Lörrach
          Campus App auf dem Smartphone deinstalliert werden.
        </Text>
      </View>
    </View>
  );
}

export function TextDisclaimer() {
  return (
    <View style={[Styles.Texts.block, { marginBottom: 0 }]}>
      <Text style={Styles.Texts.text}>{disclaimerText}</Text>
    </View>
  );
}

export const textFeedback =
  'Falls du Fehler oder Verbesserungsvorschläge melden möchtest, schicke uns ' +
  'bitte eine E-Mail. Wir freuen uns über dein Feedback.';

export function TextHieber() {
  return (
    <View style={Styles.Texts.container}>
      <View style={Styles.Texts.block}>
        <Text style={Styles.Texts.headline}>Hieber’s Frische Center</Text>
        <Text style={Styles.Texts.text}>
          Im Eingangsbereich des Hieber’s Frische Center finden Sie
          einen offen designten, modernen Food Court mit urbaner
          Atmosphäre. Täglich wechselnde Gerichte mit Fleisch oder in
          vegetarischen Varianten, gutbürgerliche und mediterrane
          Küche, Pizza und Pasta, Gerichte zum Mitnehmen, Snacks,
          Backwaren, vegane Snacks, Panini, Focacci und vieles mehr
          bieten für jeden Geschmack etwas.
        </Text>
      </View>
      <View style={Styles.Texts.block}>
        <Text style={Styles.Texts.headline}>Ort</Text>
        <Text style={Styles.Texts.text}>
          Meeraner Platz 1{'\n'}
          79539 Lörrach
          {'\n'}
          Eingangsbereich (unterer Eingang)
        </Text>
      </View>
      <View style={Styles.Texts.block}>
        <Text style={Styles.Texts.headline}>Mittagstisch</Text>
        <Text style={Styles.Texts.text}>
          Montag bis Samstag 8:00 – 21:00 Uhr
        </Text>
      </View>
      <View style={Styles.Texts.block}>
        <Text style={Styles.Texts.headline}>Preise</Text>
        <Text style={Styles.Texts.text}>
          Je nach Gericht bezahlen Sie i.d.R. zwischen 3 und 8 Euro.
          Es wird kein gesonderter Studierendenrabatt gewährt. Die
          Bezahlung erfolgt in bar oder mit Karte. {'\n'}
        </Text>
        <Text
          style={Styles.Texts.link}
          onPress={() =>
            Linking.openURL(
              'https://www.google.de/maps/dir/Marie-Curie-Stra%C3%9Fe+4,+79539+L%C3%B6rrach/Meeraner+Pl.+1,+79539+L%C3%B6rrach/@47.6113313,7.6571084,17z/am=t/data=!4m14!4m13!1m5!1m1!1s0x4791b0966fbcb1e1:0xfc6978d1d1304112!2m2!1d7.65858!2d47.60873!1m5!1m1!1s0x4791b0960e19e73d:0x6a397541db898989!2m2!1d7.658188!2d47.6074594!3e2'
            )
          }
        >
          Wegbeschreibung im Browser öffnen
        </Text>
        <Text style={Styles.Texts.text}>(ca. 140 Meter Fußweg)</Text>
      </View>
    </View>
  );
}

export function TextImprint() {
  return (
    <View style={Styles.Texts.container}>
      <View style={Styles.Texts.block}>
        <Text style={Styles.Texts.text}>
          Duale Hochschule Baden-Württemberg Lörrach
          {'\n'}
          Hangstraße 46-50
          {'\n'}
          79539 Lörrach
          {'\n'}
          Fon +49 7621 2071 - 0{'\n'}
          info@dhbw-loerrach.de
          {'\n'}
          http://www.dhbw-loerrach.de
          {'\n'}
          {'\n'}
          Umsatzsteuer-Identifikationsnummer gemäß §27a
          Umsatzsteuergesetz: DE287664832
        </Text>
      </View>
      <View style={Styles.Texts.block}>
        <Text style={Styles.Texts.headline}>
          Rechtsform und zuständige Aufsichtsbehörde
        </Text>
        <Text style={Styles.Texts.text}>
          Die Duale Hochschule Baden-Württemberg ist nach § 1 Abs. 1
          DH-ErrichtG vom 12.12.2008 eine rechtsfähige Körperschaft
          des öffentlichen Rechts und zugleich staatliche Einrichtung.
          Die Duale Hochschule Baden-Württemberg Lörrach ist nach § 1
          Abs. 2 DH-ErrichtG vom 12.12.2008 eine rechtlich
          unselbständige Untereinheit dieser Hochschule.
          {'\n'}
          {'\n'}
          Dienstanbieter im Sinne des TDG bzw. des MDStV ist als
          Träger der Dualen Hochschule das Land Baden-Württemberg
          vertreten durch die Ministerin für Wissenschaft, Forschung
          und Kunst Theresia Bauer, MdL.
          {'\n'}
          {'\n'}
          Zuständige Aufsichtsbehörde:
          {'\n'}
          Ministerium für Wissenschaft, Forschung und Kunst
          {'\n'}
          Baden-Württemberg
          {'\n'}
          Königstraße 46
          {'\n'}
          70173 Stuttgart
          {'\n'}
          Telefon: +49 711 279 - 0{'\n'}
          Telefax: +49 711 279 - 3081
          {'\n'}
          poststelle@mwk.bwl.de
          {'\n'}
          http://www.mwk.bwl.de
        </Text>
      </View>
      <View style={Styles.Texts.block}>
        <Text style={Styles.Texts.headline}>Externe Links</Text>
        <Text style={Styles.Texts.text}>
          Die Campus App enthält Links zu externen Webseiten Dritter,
          auf deren Inhalte wir keinen Einfluss haben und für welche
          die DHBW Lörrach keine Gewähr übernehmen kann. Für die
          Inhalte der verlinkten Seiten ist stets der jeweilige
          Anbieter oder Betreiber der Seiten verantwortlich. Die
          verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf
          mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte
          waren zum Zeitpunkt der Verlinkung nicht erkennbar. Es ist
          nicht auszuschließen, dass die Inhalte im Nachhinein von den
          jeweiligen Anbietern verändert werden. Sollten Sie der
          Ansicht sein, dass die verlinkten externen Seiten gegen
          geltendes Recht verstoßen oder sonst unangemessene Inhalte
          enthalten, teilen Sie uns dies bitte mit.
        </Text>
      </View>
      <View style={Styles.Texts.block}>
        <Text style={Styles.Texts.headline}>Urheberrecht</Text>
        <Text style={Styles.Texts.text}>
          Soweit die Inhalte auf dieser Seite nicht vom Betreiber
          erstellt wurden, werden die Urheberrechte Dritter beachtet.
          Insbesondere werden Inhalte Dritter als solche
          gekennzeichnet. Sollten Sie trotzdem auf eine
          Urheberrechtsverletzung aufmerksam werden, bitten wir um
          einen entsprechenden Hinweis. Bei Bekanntwerden einer
          Urheberrechtsverletzung wird der Inhalte umgehend entfernt
          bzw. mit dem entsprechenden Urheberrechts-Vermerk kenntlich
          gemacht.
        </Text>
      </View>
      <View style={Styles.Texts.block}>
        <Text style={Styles.Texts.headline}>Quellcode</Text>
        <Text style={Styles.Texts.text}>
          Der Quellcode dieser App wurde als Open Source Projekt unter
          der 3-Klausel-BSD-Lizenz veröffentlicht:
        </Text>
        <Text
          style={Styles.Texts.link}
          onPress={() =>
            Linking.openURL(
              'https://github.com/DHBWLoerrach/CampusApp'
            )
          }
        >
          github.com/DHBWLoerrach/CampusApp
        </Text>
      </View>
    </View>
  );
}

export function TextPrivacy() {
  return (
    <ScrollView style={Styles.Texts.container}>
      <View style={Styles.Texts.block}>
        <Text style={Styles.Texts.text}>
          Die Inhalte unserer Seiten wurden mit größter Sorgfalt
          erstellt. Ich nehme zur Kenntnis, dass für die Richtigkeit,
          Vollständigkeit und Aktualität der Inhalte keine Gewähr
          übernommen werden kann. Im Zweifelsfall ist insbesondere der
          Online-Stundenplan zu prüfen.
          {'\n'}
          Die Campus App ist frei zugänglich. Für die Nutzung müssen
          keine personenbezogenen Daten eingegeben werden. Der Zugriff
          auf die Campus App der DHBW Lörrach wird durch die
          App-Stores protokolliert, erfolgt jedoch nicht
          personenbezogen. Damit kann vom Betreiber der App nicht
          nachvollzogen werden, auf welche Seiten einzelne Benutzer
          zugegriffen bzw. welche Funktionen sie genutzt haben.
        </Text>
      </View>
      <View style={Styles.Texts.block}>
        <Text style={Styles.Texts.text}>
          Unsere Datenschutzerklärung finden Sie unter:
        </Text>
        <Text
          style={Styles.Texts.link}
          onPress={() =>
            Linking.openURL('https://dhbw-loerrach.de/datenschutz')
          }
        >
          https://dhbw-loerrach.de/datenschutz
        </Text>
      </View>
      <View style={Styles.Texts.block}>
        <Text style={Styles.Texts.text}>
          Duale Hochschule Baden-Württemberg
          {'\n'}
          Friedrichstraße 14
          {'\n'}
          70174 Stuttgart
          {'\n'}
          Telefon: +49 711 320 660-0{'\n'}
          Telefax: +49 711 320 660-66{'\n'}
          <Text
            style={Styles.Texts.link}
            onPress={() =>
              Linking.openURL('mailto:poststelle@dhbw.de')
            }
          >
            poststelle@dhbw.de
          </Text>
          {'\n'}
          <Text
            style={Styles.Texts.link}
            onPress={() => Linking.openURL('https://www.dhbw.de')}
          >
            www.dhbw.de
          </Text>
          {'\n'}
        </Text>
        <Text style={Styles.Texts.text}>
          Unseren Datenschutzbeauftragten erreichen Sie unter unserer
          Postadresse mit dem Zusatz "Datenschutzbeauftragte*r" oder
          unter{' '}
          <Text
            style={Styles.Texts.link}
            onPress={() =>
              Linking.openURL('mailto:datenschutz@dhbw.de')
            }
          >
            datenschutz@dhbw.de
          </Text>
          .{'\n'}
          Die Verarbeitung dieser E-Mail-Adresse für Zwecke der
          Werbung oder der Markt- oder Meinungsforschung ist
          untersagt.
        </Text>
      </View>
    </ScrollView>
  );
}

export const textPersonCategory =
  'Bitte wähle hier aus, für welche Personengruppe Du die Mensapreise angezeigt bekommen möchtest:';
