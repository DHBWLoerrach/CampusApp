import { Pressable, StyleSheet, View } from 'react-native';
import { Link } from 'expo-router';
import * as Application from 'expo-application';
import { disclaimerText } from '@/constants/InfoTexts';
import { ThemedText } from '@/components/ui/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useColorScheme } from '@/hooks/useColorScheme';
import { openLink } from '@/lib/utils';

export type InfoKey =
  | 'about'
  | 'imprint'
  | 'disclaimer'
  | 'privacy'
  | 'feedback';

type InfoDef = { title: string; Body: React.ComponentType };

const InfoText = ({
  style,
  children,
  isLink,
}: {
  style?: any;
  children: React.ReactNode;
  isLink?: boolean;
}) => {
  const tintColor = useThemeColor({}, 'tint');
  return (
    <ThemedText
      style={[styles.text, style, isLink && { color: tintColor }]}
    >
      {children}
    </ThemedText>
  );
};

const AboutBody = () => {
  let versionString = `${Application.nativeApplicationVersion} (${Application.nativeBuildVersion})`;
  return (
    <>
      <InfoText>
        Dies ist die offizielle Campus-App der DHBW Lörrach. Die
        Umsetzung der App erfolgt seit 2015 durch Studierende des
        Studienzentrums für Informatik und IT-Management (SZI) unter
        der Leitung von Prof. Dr. Erik Behrends im Rahmen
        verschiedener Lehrveranstaltungen.
      </InfoText>
      <InfoText>
        Die Campus App wird beständig weiterentwickelt. Dafür freuen
        wir uns auf Euer Feedback und Eure Verbesserungsvorschläge per
        E-Mail:
        {'\n'}
        <Link href="mailto:apps@dhbw-loerrach.de">
          <InfoText isLink>apps@dhbw-loerrach.de</InfoText>
        </Link>
      </InfoText>
      <InfoText>
        Diese App ist ein Open Source Projekt. Der Quellcode ist
        verfügbar unter:
        {'\n'}
        <Pressable
          onPress={() =>
            openLink('https://github.com/DHBWLoerrach/CampusApp')
          }
          accessible
          accessibilityLabel={`Quellcode der App`}
          accessibilityHint={`Öffnet den Quellcode der App auf GitHub im Browser`}
          accessibilityRole="link"
        >
          <InfoText isLink>
            https://github.com/DHBWLoerrach/CampusApp
          </InfoText>
        </Pressable>
      </InfoText>
      <InfoText>
        Version der Campus App: {`${versionString}`}
      </InfoText>
    </>
  );
};

const ImprintBody = () => (
  <>
    <ThemedText style={styles.heading}>Herausgeber</ThemedText>
    <InfoText>
      Duale Hochschule Baden-Württemberg Lörrach
      {'\n'}
      Baden-Wuerttemberg Cooperative State University Lörrach
      {'\n'}
      Hangstraße 46-50
      {'\n'}
      D-79539 Lörrach
    </InfoText>
    <InfoText>
      <Link href="tel:+49762120710">
        <InfoText isLink>+49 7621 2071 0</InfoText>
      </Link>
      {'\n'}
      <Link href="mailto:info@dhbw-loerrach.de">
        <InfoText isLink>info@dhbw-loerrach.de</InfoText>
      </Link>
      {'\n'}
      <Pressable
        onPress={() => openLink('https://www.dhbw-loerrach.de')}
        accessible
        accessibilityLabel={`Webseite der DHBW Lörrach`}
        accessibilityHint={`Öffnet die Webseite der DHBW Lörrach im Browser`}
        accessibilityRole="link"
      >
        <InfoText isLink>www.dhbw-loerrach.de</InfoText>
      </Pressable>
    </InfoText>
    <InfoText>
      Die Duale Hochschule Baden-Württemberg ist eine rechtsfähige
      Körperschaft des öffentlichen Rechts. Sie wird gesetzlich
      vertreten durch die Präsidentin der Dualen Hochschule
      Baden-Württemberg, Frau Prof. Dr. Martina Klärle. Gesetzlicher
      Vertreter des Hochschulstandorts Lörrach ist der Rektor Herr
      Prof. Gerhard Jäger.
    </InfoText>
    <InfoText>
      Umsatzsteuer-Identifikationsnummer gemäß §27a
      Umsatzsteuergesetz: DE287664832
      {'\n'}
      Wirtschafts-Identifikationsnummer (W-IdNr.): DE287664832-00001
    </InfoText>
    <ThemedText style={styles.heading}>
      Zuständige Aufsichtsbehörde
    </ThemedText>
    <InfoText>
      Ministerium für Wissenschaft, Forschung und Kunst des Landes
      Baden-Württemberg
      {'\n'}
      Königstraße 46
      {'\n'}
      D-70173 Stuttgart
    </InfoText>
    <InfoText>
      Telefon: +49 711 279 0{'\n'}
      Telefax: +49 711 279 3081
      {'\n'}
      <Link href="mailto:poststelle@mwk.bwl.de">
        <InfoText isLink>poststelle@mwk.bwl.de</InfoText>
      </Link>
      {'\n'}
      <Pressable
        onPress={() => openLink('https://mwk.baden-wuerttemberg.de')}
        accessible
        accessibilityLabel={`Webseite des Ministeriums für Wissenschaft, Forschung und Kunst des Landes Baden-Württemberg`}
        accessibilityHint={`Öffnet die Webseite des Ministeriums für Wissenschaft, Forschung und Kunst des Landes Baden-Württemberg im Browser`}
        accessibilityRole="link"
      >
        <InfoText isLink>mwk.baden-wuerttemberg.de</InfoText>
      </Pressable>
    </InfoText>
    <ThemedText style={styles.heading}>
      Redaktionelle und technische Verantwortung
    </ThemedText>
    <InfoText>
      Inhaltlich sind die jeweils zuständigen Personen der
      Studiengänge, Studienrichtungen, Studienzentren oder
      Organisationseinheiten (Hochschulkommunikation, Bibliothek,
      usw.) verantwortlich.
    </InfoText>
    <ThemedText style={styles.heading}>Externe Links</ThemedText>
    <InfoText>
      Die DHBW Lörrach Campus App enthält Links zu externen Webseiten
      Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb
      können wir für diese fremden Inhalte auch keine Gewähr
      übernehmen. Für die Inhalte der verlinkten Seiten ist stets der
      jeweilige Anbieter oder Betreiber der Seiten verantwortlich. Die
      verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf
      mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren
      zum Zeitpunkt der Verlinkung nicht erkennbar. Eine permanente
      inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne
      konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar.
      Bei bekannt werden von Rechtsverletzungen werden wir derartige
      Links umgehend entfernen. Die Duale Hochschule Baden-Württemberg
      begründet durch die Bereitstellung dieser Informationen kein
      Vertragsangebot über Auskünfte, Beratung oder ähnliche
      Vertragsbeziehungen. Jegliche Haftung für die Nutzung der
      Inhalte der DHBW Lörrach Campus App oder die Richtigkeit der
      Inhalte oder die Erreichbarkeit der Web Site wird
      ausgeschlossen. Die Duale Hochschule Baden-Württemberg haftet
      daher nicht für konkrete, mittelbare und unmittelbare Schäden
      oder Schäden, die durch fehlende Nutzungsmöglichkeiten,
      Datenverluste oder entgangene Gewinne entstehen können, die im
      Zusammenhang mit der Nutzung von Dokumenten oder Informationen
      entstehen, die auf dieser Web Site zugänglich sind. auf deren
      Inhalte wir keinen Einfluss haben und für welche die DHBW
      Lörrach keine Gewähr übernehmen kann. Für die Inhalte der
      verlinkten Seiten ist stets der jeweilige Anbieter oder
      Betreiber der Seiten verantwortlich. Die verlinkten Seiten
      wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße
      überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der
      Verlinkung nicht erkennbar. Es ist nicht auszuschließen, dass
      die Inhalte im Nachhinein von den jeweiligen Anbietern verändert
      werden. Sollten Sie der Ansicht sein, dass die verlinkten
      externen Seiten gegen geltendes Recht verstoßen oder sonst
      unangemessene Inhalte enthalten, teilen Sie uns dies bitte mit.
    </InfoText>
    <ThemedText style={styles.heading}>Urheberrecht</ThemedText>
    <InfoText>
      Die durch die Seitenbetreiber erstellten Inhalte und Werke in
      dieser App unterliegen dem deutschen Urheberrecht. Beiträge
      Dritter sind als solche gekennzeichnet. Die Vervielfältigung,
      Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb
      der Grenzen des Urheberrechtes bedürfen der schriftlichen
      Zustimmung des jeweiligen Autors bzw. Erstellers. Downloads und
      Kopien dieser Seite sind nur für den privaten, nicht
      kommerziellen Gebrauch gestattet.
    </InfoText>
  </>
);

const DisclaimerBody = () => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  return (
    <>
      <InfoText>
        Mit dem ersten Start der DHBW Lörrach Campus App wurde
        folgender Regelung zugestimmt:
      </InfoText>
      <View style={styles.disclaimerContainer}>
        <IconSymbol
          name="checkmark.circle"
          color={isDark ? '#FFFFFF' : '#333333'}
          style={styles.disclaimerIcon}
        />
        <InfoText style={styles.disclaimerText}>
          {disclaimerText}
        </InfoText>
      </View>
      <InfoText>
        Um diese Zustimmung zurückzuziehen, muss die DHBW Lörrach
        Campus App auf dem Smartphone deinstalliert werden.
      </InfoText>
    </>
  );
};

const FeedbackBody = () => (
  <>
    <InfoText>
      Falls du Fehler oder Verbesserungsvorschläge melden möchtest,
      dann erreichst du uns per E-Mail:
    </InfoText>
    <InfoText>
      <Link href="mailto:apps@dhbw-loerrach.de">
        <InfoText isLink>apps@dhbw-loerrach.de</InfoText>
      </Link>
    </InfoText>
    <InfoText>Wir freuen uns über dein Feedback.</InfoText>
  </>
);

const PrivacyBody = () => (
  <>
    <InfoText>
      Die Campus App ist frei zugänglich. Für die Nutzung müssen keine
      personenbezogenen Daten eingegeben werden. Der Zugriff auf die
      Campus App der DHBW Lörrach wird durch die App-Stores
      protokolliert, erfolgt jedoch nicht personenbezogen. Damit kann
      vom Betreiber der App nicht nachvollzogen werden, auf welche
      Seiten einzelne Benutzer zugegriffen bzw. welche Funktionen sie
      genutzt haben.
    </InfoText>
    <InfoText>
      Unsere Datenschutzerklärung finden Sie unter:
      {'\n'}
      <Pressable
        onPress={() =>
          openLink('https://www.dhbw-loerrach.de/datenschutz#inhalt')
        }
        accessible
        accessibilityLabel={`Webseite zum Datenschutz der DHBW Lörrach`}
        accessibilityHint={`Öffnet die Webseite zum Datenschutz der DHBW Lörrach im Browser`}
        accessibilityRole="link"
      >
        <InfoText isLink>www.dhbw-loerrach.de/datenschutz</InfoText>
      </Pressable>
    </InfoText>
  </>
);

export const INFO_PAGES: Record<InfoKey, InfoDef> = {
  about: { title: 'Über diese App', Body: AboutBody },
  imprint: { title: 'Impressum', Body: ImprintBody },
  disclaimer: { title: 'Haftung', Body: DisclaimerBody },
  privacy: { title: 'Datenschutz', Body: PrivacyBody },
  feedback: { title: 'Feedback', Body: FeedbackBody },
};

const styles = StyleSheet.create({
  heading: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  disclaimerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  disclaimerIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  disclaimerText: {
    flex: 1,
    fontStyle: 'italic',
    marginBottom: 0, // Override default margin
  },
});
