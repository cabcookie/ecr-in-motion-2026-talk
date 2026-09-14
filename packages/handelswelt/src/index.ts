/**
 * Die Handelswelt — die Systeme, in denen Lisas Assistent nachschlägt.
 *
 * Sie sind simuliert, und der Vortrag sagt das auch so: „Die Systeme sind
 * simuliert. Die Arbeit des Agenten ist es nicht." Was sie nicht mehr sind,
 * ist blind: Sie antworten auf das, was gefragt wurde.
 *
 * Der Agent redet nie mit den Daten, immer mit einem Port. Was heute eine
 * Funktion in diesem Paket ist, kann später ein MCP-Server oder ein echtes SAP
 * sein, ohne dass der Agent es merkt.
 */
export {
  type Befund,
  type Fehlschlag,
  type Grund,
  type Treffer,
  fehlschlag,
  treffer,
} from './systeme/port';

export { type Margenbefund, marge } from './systeme/kalkulation';
export { type Kategorievorgabe, SCHOKOLADE_UND_PRALINEN } from './daten/kategorien';
