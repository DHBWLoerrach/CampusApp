import LinksScreen from '@/components/services/LinksScreen';
import { type IconSymbolName } from '@/components/ui/IconSymbol';

const links: {
  title: string;
  icon: IconSymbolName;
  url: string;
}[] = [
  {
    title: 'Studienberatung der DHBW Lörrach',
    icon: 'person.crop.circle.badge.questionmark',
    url: 'https://dhbw-loerrach.de/studienberatung#inhalt',
  },
  {
    title:
      'Ansprechpartner der Studiengänge und Serviceeinrichtungen',
    icon: 'person.2.wave.2',
    url: 'https://dhbw-loerrach.de/ansprechpersonen#inhalt',
  },
  {
    title: 'Anlaufstellen für Betroffene',
    icon: 'shield.lefthalf.filled',
    url: 'https://dhbw-loerrach.de/ansprechpersonen/anlaufstellen-fuer-betroffene#inhalt',
  },
  {
    title: 'Studierendenwerk Freiburg-Schwarzwald',
    icon: 'building',
    url: 'https://www.swfr.de',
  },
];

export default function HelpLinksScreen() {
  return <LinksScreen links={links} />;
}
