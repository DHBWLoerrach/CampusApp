// Generic informational texts for the info/legal modal (example content)
// UI copy remains German; comments are English.
export type InfoKey =
  | 'Über'
  | 'Haftung'
  | 'Impressum'
  | 'Datenschutz';

export const infoTexts: Record<
  InfoKey,
  { title: string; body: string }
> = {
  Über: {
    title: 'Über die App',
    body: 'Dies ist die offizielle Campus-App der DHBW Lörrach. Die Umsetzung der App erfolgt seit 2015 durch Studierende des Studienzentrums für Informatik und IT-Management (SZI) unter der Leitung von Prof. Dr. Erik Behrends im Rahmen verschiedener Lehrveranstaltungen.\n\nDie Campus App wird beständig weiterentwickelt. Dafür freuen wir uns auf Euer Feedback und Eure Verbesserungsvorschläge: apps@dhbw-loerrach.de \n\nDiese App ist ein Open Source Projekt: https://github.com/DHBWLoerrach/CampusApp \n\nVersion (App): 3.0.0',
  },

  Haftung: {
    title: 'Haftungsausschluss',
    body: 'Alle Informationen in dieser App wurden mit größter Sorgfalt zusammengestellt. Dennoch kann keine Gewähr für Aktualität, Richtigkeit und Vollständigkeit übernommen werden.\n\nHaftungsansprüche gegen die Beteiligten, die sich auf Schäden materieller oder ideeller Art beziehen, welche durch Nutzung oder Nichtnutzung der dargebotenen Informationen entstehen, sind – soweit gesetzlich zulässig – ausgeschlossen.\n\nExtern verlinkte Inhalte liegen außerhalb unseres Verantwortungsbereichs; zum Zeitpunkt der Verlinkung waren keine Rechtsverstöße erkennbar.',
  },
  Impressum: {
    title: 'Impressum',
    body: 'DHBW Lörrach\nHangstraße 46–50\n79539 Lörrach\nDeutschland\n\nTelefon: +49 (0) 7621 / 2070-0\nWeb: https://dhbw-loerrach.de\n\nVerantwortlich i.S.d. § 18 Abs. 2 MStV: Die jeweiligen Fachbereiche / Redaktion der Hochschulseiten.\n\nDiese App befindet sich im Entwicklungs-/Pilotstadium. Ansprechpartner für technische Rückfragen: (Platzhalter E-Mail).',
  },
  Datenschutz: {
    title: 'Datenschutz',
    body: 'Der Schutz personenbezogener Daten hat hohe Priorität. Diese App verarbeitet – in der hier vorliegenden Beispielkonfiguration – keine personenbezogenen Daten ohne ausdrückliche Einwilligung.\n\nTechnische Hinweise:\n• Lokale Speicherung (AsyncStorage) für Einstellungen / Kurswahl\n• Keine Übermittlung sensibler Nutzungsprofile an Dritte\n• Externe Inhalte (z.B. RSS, iCal) werden nur zum Abruf der angeforderten Daten kontaktiert\n\nBitte offizielle Datenschutzerklärung der DHBW Lörrach konsultieren, sobald verfügbar. Bei Fragen wenden Sie sich an die Datenschutzbeauftragten der Hochschule.',
  },
};
