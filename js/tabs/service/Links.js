import { textCafeteriaKKH, textHieber } from './Texts';

// @flow
export const linksAccounts = [
  {
    title: 'Homepage',
    url: 'https://www.dhbw-loerrach.de/'
  },
  {
    title: 'Moodle',
    url: 'https://moodle.dhbw-loerrach.de/'
  },
  {
    title: 'DUALIS (Prüfungsergebnisse)',
    url: 'https://dualis.dhbw.de/'
  },
  {
    title: 'OWA',
    url: 'https://webmail.dhbw-loerrach.de/owa/'
  },
  {
    title: 'SWFR (Kartenservice)',
    url: 'https://www.swfr.de/kartenservice/'
  },
  {
    title: 'StuV',
    url: 'http://stuv-loerrach.de/'
  },
  {
    title: 'Handbuch DHBW-IT',
    url: 'https://www.dhbw-loerrach.de/3012.html'
  }
];

export const linkBib =
  'https://bsz.ibs-bw.de/aDISWeb/app?service=direct/0/Home/$DirectLink&sp=S127.0.0.1:23182';

export const linksEmergency = [
  {
    title: 'Ansprechpartner Studiengänge und Serviceeinrichtungen',
    url: 'https://www.dhbw-loerrach.de/mitarbeiterinnen.html?&no_cache=1'
  },
  {
    title: 'Polizei',
    tel: '110'
  },
  {
    title: 'Feuerwehr',
    tel: '112'
  },
  {
    title: 'Krankenhaus Lörrach',
    tel: '076214160'
  },
  {
    title: 'Beratungsstelle DHBW Lörrach',
    url: 'https://www.dhbw-loerrach.de/3359.html'
  },
  {
    title: 'Beratungsstelle Studierendenwerk Freiburg',
    url: 'https://www.swfr.de/beratung-soziales/beratungsstellen/info/'
  },
  {
    title: 'Beratungsstelle Studierendenwerk Freiburg',
    tel: '07612101200'
  },
  {
    title: 'Krisenberatung für Studierende (Fr. Kinkel)',
    tel: '076212071412'
  },
  {
    title: 'Krisenberatung für Studierende (Hr. Köpke)',
    tel: '076212071414'
  }
];

export const linksFreetime = [
  {
    title: 'Sprachen',
    url: 'https://www.dhbw-loerrach.de/sprachen.html'
  },
  {
    title: 'Hochschulsport',
    url: 'https://www.dhbw-loerrach.de/hochschulsport.html?&MP=2003-3455'
  },
  {
    title: 'Wohnungsbörse',
    url: 'https://www.dhbw-loerrach.de/528.html?&MP=528-3535'
  }
];

export const linksStudy = [
  {
    title: 'Exkursionen',
    url: 'https://www.dhbw-loerrach.de/2537.html'
  },
  {
    title: 'Gebühren/Beiträge',
    url: 'https://www.dhbw-loerrach.de/2470.html'
  },
  {
    title: 'Ausland/Internationales',
    url: 'https://www.dhbw-loerrach.de/auslandsaufenthalte.html?&L=0'
  }
];

export const linksKBC = [
  {
    title: 'Cafeteria im KKH',
    screen: 'CafeteriaKKH',
    text: textCafeteriaKKH()
  },
  {
    title: "Hieber's Frische Center",
    screen: 'Hieber',
    text: textHieber()
  }
];
