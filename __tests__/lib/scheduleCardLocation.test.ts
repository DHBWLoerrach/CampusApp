import { getScheduleCardLocationDisplay } from '@/lib/scheduleCardLocation';

describe('getScheduleCardLocationDisplay', () => {
  it('treats "online" as online without extra', () => {
    const meta = getScheduleCardLocationDisplay({
      location: 'online',
      description: '',
    });
    expect(meta.isOnline).toBe(true);
    expect(meta.roomText).toBeNull();
    expect(meta.extraTextCollapsed).toBeNull();
    expect(meta.extraTextExpanded).toBeNull();
  });

  it('keeps "eventuell online ..." as extra text (does not strip online)', () => {
    const meta = getScheduleCardLocationDisplay({
      location: 'eventuell online - bitte mit Dozentin abstimmen',
      description: '',
    });
    expect(meta.isOnline).toBe(true);
    expect(meta.roomText).toBeNull();
    expect(meta.extraTextCollapsed).toBe(
      'eventuell online - bitte mit Dozentin abstimmen'
    );
  });

  it('keeps warning-style online location and merges description', () => {
    const meta = getScheduleCardLocationDisplay({
      location: 'ACHTUNG: online !!!',
      description: 'Link finden Sie dann in Hr. Berneckers Moodle-Raum.',
    });
    expect(meta.isOnline).toBe(true);
    expect(meta.roomText).toBeNull();
    expect(meta.extraTextCollapsed).toBe(
      'ACHTUNG: online !!! · Link finden Sie dann in Hr. Berneckers Moodle-Raum.'
    );
  });

  it('extracts a semicolon-separated room list as room chip', () => {
    const meta = getScheduleCardLocationDisplay({
      location: 'D233; S041; S042; S043; S044',
      description: '',
    });
    expect(meta.isOnline).toBe(false);
    expect(meta.roomText).toBe('D233; S041; S042; S043; S044');
    expect(meta.extraTextCollapsed).toBeNull();
  });

  it('extracts prefix room code and keeps the remaining text as extra', () => {
    const meta = getScheduleCardLocationDisplay({
      location: 'K326 bitte Notebooks mitbringen !!!',
      description: '',
    });
    expect(meta.isOnline).toBe(false);
    expect(meta.roomText).toBe('K326');
    expect(meta.extraTextCollapsed).toBe('bitte Notebooks mitbringen !!!');
  });

  it('shows non-room locations as extra so nothing is lost', () => {
    const meta = getScheduleCardLocationDisplay({
      location: 'Deutschland',
      description: '',
    });
    expect(meta.isOnline).toBe(false);
    expect(meta.roomText).toBeNull();
    expect(meta.extraTextCollapsed).toBe('Deutschland');
  });

  it('extracts trailing parentheses as extra info for room-like locations', () => {
    const meta = getScheduleCardLocationDisplay({
      location: 'Zentralbibliothek (Hangstrasse)',
      description: '',
    });
    expect(meta.isOnline).toBe(false);
    expect(meta.roomText).toBe('Zentralbibliothek');
    expect(meta.extraTextCollapsed).toBe('Hangstrasse');
  });

  it('does not add extra for online marker in a hybrid location', () => {
    const meta = getScheduleCardLocationDisplay({
      location: 'D234, online',
      description: '',
    });
    expect(meta.isOnline).toBe(true);
    expect(meta.roomText).toBe('D234');
    expect(meta.extraTextCollapsed).toBeNull();
  });

  it('shows only the first URL when collapsed', () => {
    const meta = getScheduleCardLocationDisplay({
      location: 'online https://a.example/test https://b.example/test2',
      description: '',
    });
    expect(meta.isOnline).toBe(true);
    expect(meta.hasHiddenUrls).toBe(true);
    expect(meta.extraTextCollapsed).toBe('https://a.example/test');
    expect(meta.extraTextExpanded).toBe(
      'https://a.example/test · https://b.example/test2'
    );
  });

  it('cleans trailing ">" from URLs (Teams-style angle brackets)', () => {
    const meta = getScheduleCardLocationDisplay({
      location: 'online',
      description:
        'Microsoft Teams Benötigen Sie Hilfe?<https://aka.ms/JoinTeamsMeeting?omkt=de-DE>',
    });
    expect(meta.isOnline).toBe(true);
    expect(meta.extraTextCollapsed).toContain(
      'https://aka.ms/JoinTeamsMeeting?omkt=de-DE'
    );
    expect(meta.extraTextCollapsed).not.toContain('>');
  });
});
