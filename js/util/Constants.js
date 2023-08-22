module.exports = {
  smallFont: 12,
  bigFont: 17,
  listViewRowPaddingHorizontal: 17,
  listViewRowPaddingVertical: 8,
  roles: [
    'Student/in',
    'Lehrbeauftragte/r',
    'Mitarbeiter/in',
    'Gast',
  ],
  webmailUrl: (course) =>
    `https://webmail.dhbw-loerrach.de/owa/calendar/kal-${course}@dhbw-loerrach.de/Kalender/calendar.ics`,
};
