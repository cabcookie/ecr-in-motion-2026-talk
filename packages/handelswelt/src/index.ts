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
export {
  type Artikelauskunft,
  type Kategorieauskunft,
  artikel,
  kategorie,
} from './systeme/warenwirtschaft';
export { type Segmentauskunft, segment, segmentVon } from './systeme/marktdaten';
export { type Weichkandidat, type Zonenauskunft, istZone, platz } from './systeme/regalplanung';
export { type FreieFlaeche, type Kalenderauskunft, flaechen } from './systeme/aktionskalender';
export { type Listungsweg, type Tor, anforderungen } from './systeme/listung';

export { type Kategorievorgabe, SCHOKOLADE_UND_PRALINEN, standDerKategorie } from './daten/kategorien';
export { type Artikel, type Regalzone, KATEGORIE, SORTIMENT } from './daten/sortiment';
export { type Warengruppe, KULISSE } from './daten/kulisse';

export {
  type Abstand,
  type Wochentag,
  alsStand,
  alsText,
  anker,
  lies,
  setzeAnker,
  tageZwischen,
  verschiebe,
} from './zeit/anker';
