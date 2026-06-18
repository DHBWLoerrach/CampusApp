import { CalendarError, CalendarErrorCode } from '@/lib/icalService';

const DEFAULT_MESSAGE =
  'Der Vorlesungsplan konnte nicht geladen werden. Bitte versuchen Sie es erneut.';

export function getTimetableErrorMessage(error: unknown): string {
  if (!(error instanceof CalendarError)) {
    return DEFAULT_MESSAGE;
  }

  switch (error.code) {
    case CalendarErrorCode.Http:
      return `Der Kalenderdienst hat mit HTTP ${error.status ?? 'Fehler'} geantwortet.`;
    case CalendarErrorCode.Network:
      return 'Der Kalenderdienst ist derzeit nicht erreichbar. Bitte versuchen Sie es erneut.';
    case CalendarErrorCode.Parse:
      return 'Die Kalenderdaten haben ein ungültiges Format und konnten nicht verarbeitet werden.';
    case CalendarErrorCode.InvalidCourse:
      return 'Es wurde kein Kurs ausgewählt.';
    default:
      return DEFAULT_MESSAGE;
  }
}

export const SCHEDULE_OFFLINE_MESSAGE =
  'Der Vorlesungsplan kann ohne Internetverbindung nicht geladen werden.';

export const SCHEDULE_STALE_OFFLINE_MESSAGE =
  'Der Vorlesungsplan zeigt zuletzt geladene Daten und kann offline nicht aktualisiert werden.';

export const SCHEDULE_STALE_ERROR_MESSAGE =
  'Der Vorlesungsplan konnte nicht aktualisiert werden. Es werden zuletzt geladene Daten angezeigt.';
