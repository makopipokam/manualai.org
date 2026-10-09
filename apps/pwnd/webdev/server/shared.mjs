import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

// The browser loads exactly the same files from /shared/*.js.
export const Economy = require('../shared/economy.js');
export const QuizEngine = require('../shared/quiz-engine.js');
export const Battle = require('../shared/battle-engine.js');
export const Progression = require('../shared/progression.js');
export const Bots = require('../shared/bots.js');
export const QUESTION_POOL = Object.freeze(require('../content/questions.json').map(Object.freeze));

// Error with a stable machine-readable code; the API returns { error: { code, message } }.
export class GameError extends Error {
  constructor(code, message, status = 409, details = undefined) {
    super(message);
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export const MESSAGES = Object.freeze({
  insufficient_resources: 'Dafür reichen deine Ressourcen nicht.',
  core_collision: 'Der Teichkern in der Mitte bleibt frei.',
  building_collision: 'Dort steht schon ein anderes Gebäude.',
  building_exists: 'Dieses Gebäude steht bereits in deinem Teich.',
  building_missing: 'Dieses Gebäude gibt es in deinem Teich noch nicht.',
  invalid_building: 'Dieser Bauplatz ist ungültig.',
  revision_conflict: 'Dein Teich wurde inzwischen verändert. Der aktuelle Stand wurde geladen.',
  unlock_unknown: 'Diese Entdeckung gibt es nicht.',
  unlock_exists: 'Diese Entdeckung ist schon freigeschaltet.',
  nothing_to_claim: 'Gerade gibt es nichts abzuholen.',
  invalid_troop: 'Diese Einheit gibt es nicht.',
  troop_capacity: 'Im Teichlager ist nicht genug Platz.',
  daily_attack_limit: 'Du hast heute alle 6 Angriffe genutzt. Morgen (UTC) geht es weiter.',
  target_cooldown: 'Diesen Teich hast du vor Kurzem angegriffen. Warte 4 Stunden.',
  target_shielded: 'Dieser Teich steht gerade unter Schild.',
  target_unavailable: 'Dieser Gegner ist nicht verfügbar.',
  no_opponents: 'Gerade ist kein Gegner verfügbar.',
  empty_deployment: 'Stelle mindestens eine Einheit auf.',
  invalid_deployment: 'Diese Aufstellung ist ungültig.',
  deployment_not_on_edge: 'Einheiten dürfen nur auf Randfeldern starten.',
  deployment_blocked: 'Auf diesem Randfeld steht ein Gebäude.',
  insufficient_troops: 'So viele Einheiten hast du nicht im Lager.',
  attempt_missing: 'Dieser Quizversuch existiert nicht.',
  attempt_closed: 'Dieser Quizversuch ist bereits abgeschlossen.',
  attempt_incomplete: 'Beantworte zuerst alle Fragen.',
  question_pending: 'Beantworte zuerst die aktuelle Frage.',
  no_question: 'Es gibt keine offene Frage.',
  invalid_answer: 'Diese Antwort ist ungültig.',
  invalid_topic: 'Dieses Thema gibt es nicht.',
  invalid_opponent: 'Diesen Gegner gibt es nicht.',
  upgrade_unavailable: 'Dieses Upgrade steht gerade nicht zur Wahl.',
  report_missing: 'Dieser Bericht existiert nicht.',
  unauthorized: 'Bitte melde dich an.',
});

export function gameError(code, status = 409, details) {
  return new GameError(code, MESSAGES[code] || code, status, details);
}
