/**
 * Das Marktpanel — Zahlen, die nicht aus unserer Kasse kommen.
 *
 * Zwei Dinge daran sind absichtlich unbequem und beide entsprechen der Praxis:
 *
 * **Die Segmente des Panels sind nicht unsere Regalzonen.** Ein Panelhaus
 * schneidet den Markt nach Verwendung und Rezeptur, eine Kategorie ihr Regal
 * nach Platzbedarf. „Crispy / gefüllte Riegel" zieht sich quer durch Riegel und
 * Tafel. Wer beides gleichsetzt, rechnet falsch — und Category Manager wissen
 * das, weil es sie jeden Monat Zeit kostet.
 *
 * **Die Marktzahl und unsere eigene Zahl gehen auseinander.** Genau daraus
 * entsteht das Argument: Wenn ein Segment im Markt zweistellig wächst und bei
 * uns kaum, fehlt uns etwas im Regal. Deshalb gibt der Port beides zurück, und
 * die eigene Zahl rechnet er aus dem Sortiment aus, statt sie zu behaupten.
 */

export interface Segment {
  readonly kennung: string;
  readonly name: string;
  /** Entwicklung des Segments im Markt, Prozent gegenüber Vorjahr. */
  readonly marktentwicklung: number;
  /** Woran das Panel Artikel dieses Segments erkennt. */
  readonly erkennung: RegExp;
}

/*
  Reihenfolge ist Rangfolge: Der erste Treffer gewinnt. „Knusperriegel" soll in
  Crispy landen, nicht in den klassischen Riegeln, obwohl beides passt.
*/
export const SEGMENTE: readonly Segment[] = [
  {
    kennung: 'crispy',
    name: 'Crispy / gefüllte Riegel',
    marktentwicklung: 14.7,
    erkennung: /crisp|knusper|waffel|wafer|schnitte|keks|cookie|karamell|toffi|bites/i,
  },
  {
    kennung: 'frei-von',
    name: 'Vegan und Frei-von',
    marktentwicklung: 19.2,
    erkennung: /vegan|frei.?von|laktosefrei|ohne zucker/i,
  },
  {
    kennung: 'dunkel',
    name: 'Zartbitter und Kakaohochprozentig',
    marktentwicklung: 6.8,
    /*
      Der Kakaoanteil zaehlt erst ab 70 %. Vorher stand hier `\d{2}\s?%`, und
      das traf JEDE zweistellige Prozentangabe: Eine Vollmilchtafel mit „38 %
      Kakao" landete damit in „Zartbitter und Kakaohochprozentig". Aufgefallen
      an einer echten Agentenantwort, die daraus die falsche Kaeufergruppe
      ableitete.
    */
    erkennung: /bitter|dunkel|zartbitter|[7-9]\d\s?%|noir|nocturne/i,
  },
  {
    kennung: 'pralinen',
    name: 'Pralinen und Geschenkpackungen',
    marktentwicklung: -1.8,
    erkennung: /pralin|selection|trüffel|geschenk|tondo|délice|petits/i,
  },
  {
    kennung: 'kleinformat',
    name: 'Kleinformat und Beutelware',
    marktentwicklung: 4.3,
    erkennung: /mini|perlen|küsse|eier|häppchen|bons|stäbchen|linsen/i,
  },
  {
    kennung: 'riegel',
    name: 'Klassische Riegel',
    marktentwicklung: 2.1,
    erkennung: /riegel|korn|doppio|duetto|mix|fun|jumbo/i,
  },
  {
    kennung: 'tafel',
    name: 'Tafelschokolade klassisch',
    marktentwicklung: 1.4,
    erkennung: /.*/,
  },
];

/** Stand der Panel-Lieferung, als Abstand zum Ankerdatum. */
export const PANEL_ABSTAND = { tage: -18 } as const;

export const PANEL_QUELLE = 'Marktpanel Süßwaren, Monatsbericht';
