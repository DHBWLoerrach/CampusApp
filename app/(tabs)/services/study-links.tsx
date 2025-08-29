import LinksScreen from '@/components/services/LinksScreen';
import { type IconSymbolName } from '@/components/ui/IconSymbol';

const links: {
  title: string;
  icon: IconSymbolName;
  url: string;
}[] = [
  {
    title: 'Moodle',
    icon: 'graduationcap',
    url: 'https://moodle.loerrach.dhbw.de',
  },
  {
    title: 'DUALIS (Noten)',
    icon: 'chart.bar',
    url: 'https://dualis.dhbw.de/',
  },
  {
    title: 'Katalog der Bibliothek',
    icon: 'books.vertical',
    url: 'https://bsz.ibs-bw.de/aDISWeb/app?service=direct/0/Home/$DirectLink&sp=SOPAC18',
  },
  {
    title: 'Wohnungen',
    icon: 'house',
    url: 'https://dhbw-loerrach.de/wohnungen#inhalt',
  },
  {
    title: 'Studienkosten',
    icon: 'eurosign',
    url: 'https://www.dhbw.de/informationen/studieninteressierte#studienkosten-und-finanzierung',
  },
  {
    title: 'Finanzierung & Stipendien',
    icon: 'wallet.bifold',
    url: 'https://dhbw-loerrach.de/studierendenservice/studienfinanzierung#inhalt',
  },
  {
    title: 'Hochschulsport',
    icon: 'figure.run',
    url: 'https://dhbw-loerrach.de/hochschulsport#inhalt',
  },
  {
    title: 'Sprachen lernen',
    icon: 'translate',
    url: 'https://moodle.dhbw-loerrach.de/moodle/course/view.php?id=124',
  },
  {
    title: 'IT-Services Wiki',
    icon: 'book.pages',
    url: 'https://go.dhbw-loerrach.de/its',
  },
  {
    title: 'Handbuch DHBW-IT',
    icon: 'doc.text.magnifyingglass',
    url: 'https://moodle.dhbw-loerrach.de/moodle/course/view.php?id=184',
  },
];

export default function StudyLinksScreen() {
  return <LinksScreen links={links} />;
}
