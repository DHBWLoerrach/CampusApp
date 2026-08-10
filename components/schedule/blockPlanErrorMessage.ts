import { BlockPlanError, BlockPlanErrorCode } from '@/lib/blockPlanError';

const DEFAULT_MESSAGE =
  'Der Blockplan konnte nicht geladen werden. Bitte versuche es erneut.';

export function getBlockPlanErrorMessage(error: unknown): string {
  if (!(error instanceof BlockPlanError)) {
    return DEFAULT_MESSAGE;
  }

  switch (error.code) {
    case BlockPlanErrorCode.NotFound:
      return 'Für diesen Kurs ist kein Blockplan hinterlegt.';
    case BlockPlanErrorCode.Http:
      return `Der Blockplan-Dienst hat mit HTTP ${error.status ?? 'Fehler'} geantwortet.`;
    case BlockPlanErrorCode.Network:
      return 'Der Blockplan-Dienst ist derzeit nicht erreichbar. Bitte versuche es erneut.';
    case BlockPlanErrorCode.Parse:
      return 'Die Blockplan-Daten haben ein ungültiges Format und konnten nicht verarbeitet werden.';
    case BlockPlanErrorCode.InvalidCourse:
      return 'Es wurde kein Kurs ausgewählt.';
    default:
      return DEFAULT_MESSAGE;
  }
}

export const BLOCK_PLAN_OFFLINE_MESSAGE =
  'Der Blockplan kann ohne Internetverbindung nicht geladen werden.';

export const BLOCK_PLAN_STALE_OFFLINE_MESSAGE =
  'Der Blockplan zeigt zuletzt geladene Daten und kann offline nicht aktualisiert werden.';

export const BLOCK_PLAN_PARTIAL_MESSAGE =
  'Teile des Blockplans konnten nicht gelesen werden. Es fehlen möglicherweise Phasen — bitte gleiche wichtige Termine mit dem offiziellen Blockplan ab.';

export const BLOCK_PLAN_STALE_ERROR_MESSAGE =
  'Der Blockplan konnte nicht aktualisiert werden. Es werden zuletzt geladene Daten angezeigt.';
